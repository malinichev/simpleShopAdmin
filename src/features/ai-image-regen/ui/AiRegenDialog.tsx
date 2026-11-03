import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, CheckCircle, XCircle, Loader2, AlertTriangle, Wand2, ScanEye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { regenApi, type RegenJob, type GarmentAnalysis } from '../api/regenApi';
import { useRegenJob } from '../model/useRegenJob';
import { useRegenConfig } from '../model/useRegenConfig';
import { BeforeAfter } from './BeforeAfter';
import type { ImageItem } from '@/features/image-upload';

export interface RegenReplacement {
  imageId: string;
  url: string;
}

interface AiRegenDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  /** Текущие фото из формы товара (id = id фото в БД для сохранённого товара). */
  images: ImageItem[];
  /** Применить выбранные замены к форме (сохранение товара — штатной кнопкой). */
  onApply: (replacements: RegenReplacement[]) => void;
}

type Step = 'select' | 'prompt' | 'progress' | 'review';

export function AiRegenDialog({
  open,
  onClose,
  productId,
  images,
  onApply,
}: AiRegenDialogProps) {
  const { data: config } = useRegenConfig();
  const [step, setStep] = useState<Step>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState('');
  const [variantsPerImage, setVariantsPerImage] = useState(1);
  const [jobId, setJobId] = useState<string | null>(null);
  // Ревью: выбранный вариант на каждое фото + отметка «заменить»
  const [chosenVariant, setChosenVariant] = useState<Record<string, number>>({});
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  // Vision-анализ выбранных фото (авто при входе в шаг промпта)
  const [analysis, setAnalysis] = useState<GarmentAnalysis | null>(null);
  const [analysisKey, setAnalysisKey] = useState<string | null>(null);

  const { data: job } = useRegenJob(jobId);

  // Как только job завершён — дефолты ревью и переход к шагу сравнения
  useEffect(() => {
    if (step !== 'progress' || !job) return;
    if (job.status !== 'completed' && job.status !== 'failed') return;
    const nextChosen: Record<string, number> = {};
    const nextAccepted: Record<string, boolean> = {};
    for (const item of job.items) {
      if (item.variants.length > 0) {
        nextChosen[item.sourceImageId] = 0;
        nextAccepted[item.sourceImageId] = true;
      }
    }
    setChosenVariant(nextChosen);
    setAccepted(nextAccepted);
    setStep('review');
  }, [step, job]);

  /** Ключ выбранных фото — анализ гоняется один раз на набор. */
  const selectionKey = useMemo(
    () => [...selectedIds].sort().join(','),
    [selectedIds],
  );

  const analyzeMutation = useMutation({
    mutationFn: () =>
      regenApi.analyze({
        productId,
        imageIds: [...selectedIds].slice(0, 3),
      }),
    onSuccess: (result: GarmentAnalysis) => {
      setAnalysis(result);
      setAnalysisKey(selectionKey);
      // Готовая сцена под эту вещь — подставляем, если админ ещё ничего не писал
      if (!prompt.trim() && result.scenes[0]?.prompt) {
        setPrompt(result.scenes[0].prompt);
      }
    },
    onError: () => {
      // Анализ вспомогательный: не блокируем — промпт можно написать руками
      toast.warning('Не удалось проанализировать фото', {
        description: 'Напишите сцену вручную или повторите анализ',
      });
    },
  });

  // Автозапуск анализа при входе в шаг промпта (один раз на набор фото)
  useEffect(() => {
    if (step !== 'prompt' || !config?.enabled) return;
    if (analysisKey === selectionKey) return;
    if (analyzeMutation.isPending) return;
    analyzeMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectionKey, config?.enabled]);

  const startMutation = useMutation({
    mutationFn: () =>
      regenApi.start({
        productId,
        imageIds: [...selectedIds],
        prompt,
        variantsPerImage,
      }),
    onSuccess: (created: RegenJob) => {
      setJobId(created.id);
      setStep('progress');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string[] | string } } })?.response
          ?.data?.message;
      toast.error('Не удалось запустить генерацию', {
        description: Array.isArray(message) ? message.join(', ') : message,
      });
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyPreset = (presetPrompt: string) => {
    setPrompt((prev) => (prev ? `${prev}\n${presetPrompt}` : presetPrompt));
  };

  const replacements = useMemo<RegenReplacement[]>(() => {
    if (!job) return [];
    const result: RegenReplacement[] = [];
    for (const item of job.items) {
      if (!accepted[item.sourceImageId]) continue;
      const index = chosenVariant[item.sourceImageId] ?? 0;
      const variant = item.variants[index];
      if (variant) result.push({ imageId: item.sourceImageId, url: variant.url });
    }
    return result;
  }, [job, accepted, chosenVariant]);

  const handleApply = () => {
    if (replacements.length === 0) {
      toast.info('Не выбрано ни одного фото для замены');
      return;
    }
    onApply(replacements);
    toast.success(`Заменено фото: ${replacements.length}. Не забудьте сохранить товар`, {
      description: 'Новые фото пока только в форме — нажмите «Сохранить»/«Опубликовать»',
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('select');
    setSelectedIds(new Set());
    setPrompt('');
    setVariantsPerImage(1);
    setJobId(null);
    setChosenVariant({});
    setAccepted({});
    setAnalysis(null);
    setAnalysisKey(null);
    onClose();
  };

  const handleStart = () => {
    if (prompt.trim().length < 10) {
      toast.error('Промпт слишком короткий (минимум 10 символов)');
      return;
    }
    startMutation.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="ИИ-перегенерация фото"
      description={
        config?.driver === 'stub'
          ? 'Сервер работает в режиме заглушки (stub) — фото будут плашками-заглушками'
          : `Модель: ${config?.model || '—'} · результат в формате карточки 3:4`
      }
      className="max-w-3xl max-h-[90vh] overflow-y-auto"
    >
      {/* Прогресс-индикатор шагов */}
      <ol className="mb-4 flex items-center gap-2 text-xs">
        {(
          [
            ['select', 'Фото'],
            ['prompt', 'Промпт'],
            ['progress', 'Генерация'],
            ['review', 'Ревью'],
          ] as Array<[Step, string]>
        ).map(([key, label], i) => {
          const order: Step[] = ['select', 'prompt', 'progress', 'review'];
          const isDone = order.indexOf(step) > i;
          const isCurrent = step === key;
          return (
            <li
              key={key}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1',
                isCurrent && 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
                !isCurrent && 'text-gray-500',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                  isDone || isCurrent ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700',
                )}
              >
                {i + 1}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      {/* ===== Шаг 1: выбор фото ===== */}
      {step === 'select' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Отметьте фото, которые нужно перегенерировать ({selectedIds.size} из{' '}
            {images.length})
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img, index) => {
              const isSelected = selectedIds.has(img.id);
              return (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`Фото ${index + 1}${isSelected ? ' — выбрано' : ''}`}
                  onClick={() => toggleSelect(img.id)}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-gray-200 hover:border-primary-300 dark:border-gray-700',
                  )}
                >
                  <div className="aspect-square">
                    <img src={img.url} alt={img.alt || 'Фото товара'} className="h-full w-full object-cover" />
                  </div>
                  {img.isMain && (
                    <span className="absolute left-1 top-1 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-medium text-yellow-900">
                      Главное
                    </span>
                  )}
                  <span
                    className={cn(
                      'absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2',
                      isSelected
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-white/70 bg-black/30 text-transparent',
                    )}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetAndClose}>
              Отмена
            </Button>
            <Button disabled={selectedIds.size === 0} onClick={() => setStep('prompt')}>
              Далее: промпт
            </Button>
          </div>
        </div>
      )}

      {/* ===== Шаг 2: промпт ===== */}
      {step === 'prompt' && (
        <div className="space-y-4">
          {/* Vision-анализ выбранных фото: что за вещь + сцены под концепцию */}
          {analyzeMutation.isPending && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700">
              <ScanEye className="h-5 w-5 animate-pulse text-primary-500" />
              Анализирую выбранные фото: вещь, цвет, подходящие сцены…
            </div>
          )}
          {analysis && (
            <div className="rounded-lg border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-800 dark:bg-primary-900/20">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                  <ScanEye className="h-4 w-4 shrink-0 text-primary-600" />
                  {analysis.garmentType}
                </p>
                <button
                  type="button"
                  aria-label="Повторить анализ"
                  title="Повторить анализ фото"
                  onClick={() => {
                    setAnalysisKey(null);
                    analyzeMutation.mutate();
                  }}
                  className="rounded-md p-1 text-gray-400 hover:bg-white/70 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-gray-600 sm:grid-cols-2 dark:text-gray-300">
                {analysis.color && (
                  <p>
                    <span className="text-gray-400">Цвет/принт:</span> {analysis.color}
                  </p>
                )}
                {analysis.styleMood && (
                  <p>
                    <span className="text-gray-400">Настроение:</span> {analysis.styleMood}
                  </p>
                )}
                {analysis.modelNote && (
                  <p>
                    <span className="text-gray-400">Модель:</span> {analysis.modelNote}
                  </p>
                )}
                {analysis.notes && (
                  <p className="sm:col-span-2">
                    <span className="text-gray-400">Детали для генерации:</span> {analysis.notes}
                  </p>
                )}
                {analysis.brandArtifacts && (
                  <p className="sm:col-span-2 rounded-md bg-amber-50 px-2 py-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <span className="font-medium">Бренды на фото (удалятся при генерации):</span>{' '}
                    {analysis.brandArtifacts}
                  </p>
                )}
              </div>
              {analysis.scenes.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">
                    Подобрано по фото и концепции магазина
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.scenes.map((scene) => (
                      <button
                        key={scene.title + scene.prompt.slice(0, 24)}
                        type="button"
                        onClick={() => setPrompt(scene.prompt)}
                        className="rounded-full border border-primary-300 bg-white px-3 py-1 text-xs text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-700 dark:bg-gray-800 dark:text-primary-300 dark:hover:bg-gray-700"
                      >
                        <Sparkles className="mr-1 inline h-3 w-3" />
                        {scene.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 'prompt' && !analyzeMutation.isPending && !analysis && (
            <p className="text-xs text-gray-400">
              Автоанализ фото недоступен — напишите сцену вручную или нажмите «Сгенерировать»
            </p>
          )}

          {config && config.presets.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Пресеты сцен (добавляются к промпту)
              </p>
              <div className="flex flex-wrap gap-2">
                {config.presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.prompt)}
                    className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                  >
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Что должно быть на фото (сцена)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Промпт сцены"
              rows={5}
              placeholder="Например: девушка в этой пижаме пьёт травяной чай перед сном в уютной спальне, тёплый свет лампы…"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600"
            />
            <p className="mt-1 text-xs text-gray-400">
              {prompt.trim().length} / 4000 символов · минимум 10
            </p>
          </div>

          {config?.basePrompt && (
            <details className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
              <summary className="cursor-pointer text-gray-500">
                Базовый промпт стиля магазина (добавится автоматически)
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-xs text-gray-500">
                {config.basePrompt}
              </p>
            </details>
          )}

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Вариантов на фото:</span>
            {[1, 2].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setVariantsPerImage(n)}
                className={cn(
                  'rounded-md border px-3 py-1 text-sm',
                  variantsPerImage === n
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300',
                )}
              >
                {n}
              </button>
            ))}
            <span className="text-xs text-gray-400">2 варианта — выбор лучшего, дороже</span>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStep('select')}>
              Назад
            </Button>
            <Button loading={startMutation.isPending} onClick={handleStart}>
              <Wand2 className="h-4 w-4" />
              Сгенерировать ({selectedIds.size} фото)
            </Button>
          </div>
        </div>
      )}

      {/* ===== Шаг 3: прогресс ===== */}
      {step === 'progress' && <ProgressView job={job ?? null} />}

      {/* ===== Шаг 4: ревью ===== */}
      {step === 'review' && job && (
        <div className="space-y-5">
          {job.status === 'failed' && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>
                Генерация не удалась:{' '}
                {job.errors?.[0]?.message || 'все фото завершились ошибкой'}
              </span>
            </div>
          )}

          {job.items
            .filter((item) => item.variants.length > 0 || item.error)
            .map((item) => {
              const variantIndex = chosenVariant[item.sourceImageId] ?? 0;
              const variant = item.variants[variantIndex];
              const isAccepted = accepted[item.sourceImageId] ?? false;
              return (
                <div
                  key={item.sourceImageId}
                  className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-3 sm:grid-cols-[minmax(0,240px)_1fr] dark:border-gray-700"
                >
                  <BeforeAfter before={item.sourceUrl} after={variant?.url ?? item.sourceUrl} />
                  <div className="space-y-2">
                    {item.variants.length > 1 && (
                      <div className="flex gap-2">
                        {item.variants.map((v, i) => (
                          <button
                            key={v.url}
                            type="button"
                            onClick={() =>
                              setChosenVariant((prev) => ({ ...prev, [item.sourceImageId]: i }))
                            }
                            className={cn(
                              'overflow-hidden rounded-md border-2',
                              i === variantIndex ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700',
                            )}
                          >
                            <img src={v.thumbUrl} alt={`Вариант ${i + 1}`} className="h-16 w-12 object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    {item.error && (
                      <p className="flex items-start gap-1.5 text-sm text-red-600">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        {item.error}
                      </p>
                    )}
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={isAccepted}
                        disabled={item.variants.length === 0}
                        onChange={(e) =>
                          setAccepted((prev) => ({
                            ...prev,
                            [item.sourceImageId]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 accent-primary-600"
                      />
                      Заменить исходное фото этим вариантом
                    </label>
                  </div>
                </div>
              );
            })}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              К замене: {replacements.length} из {job.items.length}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetAndClose}>
                Отклонить всё
              </Button>
              <Button onClick={handleApply} disabled={replacements.length === 0}>
                Применить к форме
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ProgressView({ job }: { job: RegenJob | null }) {
  const percentage = job
    ? job.totalImages > 0
      ? Math.round((job.processedImages / job.totalImages) * 100)
      : 0
    : 0;
  const isActive = !job || job.status === 'pending' || job.status === 'processing';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {isActive && <Loader2 className="h-6 w-6 animate-spin text-primary-500" />}
        {job?.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
        {job?.status === 'failed' && <XCircle className="h-6 w-6 text-red-500" />}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {!job && 'Постановка в очередь...'}
            {job?.status === 'pending' && 'Ожидание обработки...'}
            {job?.status === 'processing' && 'Генерация фото...'}
            {job?.status === 'completed' && 'Генерация завершена'}
            {job?.status === 'failed' && 'Генерация не удалась'}
          </p>
          <p className="text-sm text-gray-500">
            Модель: {job?.model} · можно закрыть диалог, задача продолжит выполняться
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-500">Прогресс</span>
          <span className="text-gray-700 dark:text-gray-300">
            {job?.processedImages ?? 0} / {job?.totalImages ?? 0} ({percentage}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              job?.status === 'failed'
                ? 'bg-red-500'
                : job?.status === 'completed'
                  ? 'bg-green-500'
                  : 'bg-primary-500',
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {job && job.items.length > 0 && (
        <ul className="space-y-1 text-sm">
          {job.items.map((item) => (
            <li key={item.sourceImageId} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              {item.variants.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : item.error ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              <span className="truncate">{item.sourceUrl.split('/').pop()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
