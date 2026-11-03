import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, CheckCircle, XCircle, Loader2, AlertTriangle, Wand2, ScanEye, RefreshCw, Copy, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { cn } from '@/shared/lib/utils';
import { regenApi, type RegenJob, type GarmentAnalysis } from '../api/regenApi';
import { useRegenJob } from '../model/useRegenJob';
import { useRegenJobs } from '../model/useRegenJobs';
import { useRegenConfig } from '../model/useRegenConfig';
import { BeforeAfter } from './BeforeAfter';
import { productsApi } from '@/features/product-management';
import type { ImageItem } from '@/features/image-upload';

export interface RegenReplacement {
  imageId: string;
  url: string;
}

/** Товар-цель: карточка товара передаёт один, список товаров — несколько. */
export interface RegenTarget {
  productId: string;
  productName: string;
  images: ImageItem[];
}

interface AiRegenDialogProps {
  open: boolean;
  onClose: () => void;
  /** Один или несколько товаров (bulk-режим со страницы списка). */
  targets: RegenTarget[];
  /**
   * Bulk-режим (список товаров): открыть сразу на шаге промптов,
   * все фото выбраны; применение — напрямую PATCH по товарам.
   */
  bulkMode?: boolean;
  /** Один товар: применить замены к форме (сохранение — штатной кнопкой). */
  onApply?: (replacements: RegenReplacement[]) => void;
  /** Bulk: вызвать после применения (обновить списки). */
  onDone?: () => void;
}

type Step = 'select' | 'prompt' | 'progress' | 'review';

const MIN_PROMPT = 10;

/** Брендовые артефакты найдены (для bulk-фильтра чистых фото). */
const brandFound = (a?: GarmentAnalysis | null): boolean =>
  !!a?.brandArtifacts?.trim();

/** Плоский список фото с составным ключом productId::imageId (id фото уникальны лишь внутри товара). */
interface FlatPhoto {
  key: string;
  productId: string;
  productName: string;
  imageId: string;
  url: string;
  isMain: boolean;
}

export function AiRegenDialog({
  open,
  onClose,
  targets,
  bulkMode = false,
  onApply,
  onDone,
}: AiRegenDialogProps) {
  const { data: config } = useRegenConfig();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(bulkMode ? 'prompt' : 'select');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [variantsPerImage, setVariantsPerImage] = useState(1);
  const [jobIds, setJobIds] = useState<string[]>([]);
  // Ревью: выбранный вариант на каждое фото + отметка «заменить»
  const [chosenVariant, setChosenVariant] = useState<Record<string, number>>({});
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  // Персонально для КАЖДОГО фото: анализ и промпт сцены
  const [analyses, setAnalyses] = useState<Record<string, GarmentAnalysis | null>>({});
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [analyzingKeys, setAnalyzingKeys] = useState<Set<string>>(new Set());
  // Разворот результата ревью на весь экран (lightbox «до/после»)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);

  // Один товар → один job; bulk → список job'ов
  const singleJob = useRegenJob(jobIds.length === 1 ? jobIds[0] : null);
  const bulkJobs = useRegenJobs(jobIds.length > 1 ? jobIds : []);
  const jobs: RegenJob[] = useMemo(
    () => (jobIds.length === 1 && singleJob.data ? [singleJob.data] : bulkJobs.data ?? []),
    [jobIds.length, singleJob.data, bulkJobs.data],
  );
  const allDone =
    jobs.length > 0 && jobs.every((j) => j.status === 'completed' || j.status === 'failed');

  const photos = useMemo<FlatPhoto[]>(
    () =>
      targets.flatMap((t) =>
        t.images.map((img, i) => ({
          key: `${t.productId}::${img.id}`,
          productId: t.productId,
          productName: t.productName,
          imageId: img.id,
          url: img.url,
          isMain: img.isMain ?? i === 0,
        })),
      ),
    [targets],
  );
  const photoByKey = useMemo(
    () => new Map(photos.map((p) => [p.key, p])),
    [photos],
  );

  // В bulk-режиме все фото выбраны сразу
  useEffect(() => {
    if (bulkMode && selectedKeys.size === 0 && photos.length > 0) {
      setSelectedKeys(new Set(photos.map((p) => p.key)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkMode, photos]);

  // Как только ВСЕ job'ы завершены — дефолты ревью и переход к сравнению
  useEffect(() => {
    if (step !== 'progress' || !allDone) return;
    const nextChosen: Record<string, number> = {};
    const nextAccepted: Record<string, boolean> = {};
    for (const job of jobs) {
      for (const item of job.items) {
        if (item.variants.length > 0) {
          const key = `${job.productId}::${item.sourceImageId}`;
          nextChosen[key] = 0;
          nextAccepted[key] = true;
        }
      }
    }
    setChosenVariant(nextChosen);
    setAccepted(nextAccepted);
    setStep('review');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, allDone]);

  const selectionKey = useMemo(() => [...selectedKeys].sort().join(','), [selectedKeys]);

  const analyzeMutation = useMutation({
    mutationFn: async (key: string) => {
      const photo = photoByKey.get(key)!;
      return regenApi.analyze({ productId: photo.productId, imageIds: [photo.imageId] });
    },
    onSuccess: (result: GarmentAnalysis, key: string) => {
      setAnalyses((prev) => ({ ...prev, [key]: result }));
      setPrompts((prev) =>
        prev[key]?.trim() || !result.scenes[0]?.prompt
          ? prev
          : { ...prev, [key]: result.scenes[0].prompt },
      );
      // Bulk-режим: фото БЕЗ брендовых артефактов в генерации не нужны —
      // автоматически исключаем (чистые попадают в секцию «Пропущено»)
      if (bulkMode && !brandFound(result)) {
        setSelectedKeys((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    onError: (error: unknown, key: string) => {
      setAnalyses((prev) => ({ ...prev, [key]: null }));
      const message =
        (error as { response?: { data?: { message?: string[] | string } } })?.response
          ?.data?.message;
      toast.warning('Не удалось проанализировать фото', {
        description: `Промпт можно написать вручную. ${
          Array.isArray(message) ? message.join(', ') : message ?? ''
        }`,
      });
    },
    onSettled: (_d, _e, key: string) => {
      setAnalyzingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
  });

  const runAnalysis = (keys: string[]) => {
    for (const key of keys) {
      if (analyses[key] !== undefined || analyzingKeys.has(key)) continue;
      setAnalyzingKeys((prev) => new Set(prev).add(key));
      analyzeMutation.mutate(key);
    }
  };

  // Автозапуск анализа КАЖДОГО выбранного фото при входе в шаг промптов
  useEffect(() => {
    if (step !== 'prompt' || !config?.enabled) return;
    runAnalysis([...selectedKeys]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectionKey, config?.enabled]);

  // Один job на товар (imageIds этого товара), последовательно
  const startMutation = useMutation({
    mutationFn: async () => {
      const byProduct = new Map<string, string[]>();
      for (const key of selectedKeys) {
        const photo = photoByKey.get(key)!;
        const list = byProduct.get(photo.productId) ?? [];
        list.push(photo.imageId);
        byProduct.set(photo.productId, list);
      }
      const created: string[] = [];
      for (const [productId, imageIds] of byProduct) {
        const imagePrompts: Record<string, string> = {};
        for (const imageId of imageIds) {
          const p = prompts[`${productId}::${imageId}`]?.trim();
          if (p) imagePrompts[imageId] = p;
        }
        const fallback = Object.values(imagePrompts)[0] ?? 'сцена по умолчанию для фото';
        const job = await regenApi.start({
          productId,
          imageIds,
          prompt: fallback,
          imagePrompts,
          variantsPerImage,
        });
        created.push(job.id);
      }
      return created;
    },
    onSuccess: (created: string[]) => {
      setJobIds(created);
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

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /** Пресет магазина — базовая сцена во ВСЕ поля (потом каждый правится под себя). */
  const applyPresetToAll = (presetPrompt: string) => {
    setPrompts((prev) => {
      const next = { ...prev };
      for (const key of selectedKeys) next[key] = presetPrompt;
      return next;
    });
  };

  const applySceneToAll = (scenePrompt: string) => {
    setPrompts((prev) => {
      const next = { ...prev };
      for (const key of selectedKeys) next[key] = scenePrompt;
      return next;
    });
    toast.info('Сцена применена ко всем фото — поправь каждое индивидуально');
  };

  const orderedSelected = useMemo(
    () => photos.filter((p) => selectedKeys.has(p.key)),
    [photos, selectedKeys],
  );

  /** Bulk: проанализированные фото БЕЗ брендов — исключены из генерации. */
  const skippedClean = useMemo(
    () =>
      bulkMode
        ? photos.filter(
            (p) => analyses[p.key] && !brandFound(analyses[p.key]) && !selectedKeys.has(p.key),
          )
        : [],
    [bulkMode, photos, analyses, selectedKeys],
  );

  const stillAnalyzing = useMemo(
    () => photos.some((p) => analyzingKeys.has(p.key) || analyses[p.key] === undefined),
    [photos, analyzingKeys, analyses],
  );

  const handleStart = () => {
    const short: string[] = [];
    orderedSelected.forEach((p) => {
      if ((prompts[p.key]?.trim().length ?? 0) < MIN_PROMPT) short.push(p.productName);
    });
    if (short.length > 0) {
      toast.error(`Промпт слишком короткий (минимум ${MIN_PROMPT} симв.)`, {
        description: `Товары: ${[...new Set(short)].join(', ')}`,
      });
      return;
    }
    startMutation.mutate();
  };

  const replacements = useMemo(() => {
    const result: Array<{ key: string; productId: string; imageId: string; url: string }> = [];
    for (const job of jobs) {
      for (const item of job.items) {
        const key = `${job.productId}::${item.sourceImageId}`;
        if (!accepted[key]) continue;
        const variant = item.variants[chosenVariant[key] ?? 0];
        if (variant) {
          result.push({ key, productId: job.productId, imageId: item.sourceImageId, url: variant.url });
        }
      }
    }
    return result;
  }, [jobs, accepted, chosenVariant]);

  const applyDirectly = useMutation({
    mutationFn: async () => {
      const byProduct = new Map<string, Map<string, string>>();
      for (const r of replacements) {
        const map = byProduct.get(r.productId) ?? new Map<string, string>();
        map.set(r.imageId, r.url);
        byProduct.set(r.productId, map);
      }
      const results: string[] = [];
      for (const [productId, urlByImageId] of byProduct) {
        const target = targets.find((t) => t.productId === productId);
        if (!target) continue;
        const images = target.images.map((img, i) => ({
          id: img.id,
          url: urlByImageId.get(img.id) ?? img.url,
          alt: img.alt,
          order: img.isMain ? 0 : i + 1,
        }));
        await productsApi.updateImages(productId, images);
        results.push(target.productName);
      }
      return results;
    },
    onSuccess: (names: string[]) => {
      toast.success(`Заменены фото у товаров: ${names.length}`, {
        description: names.join(', '),
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onDone?.();
      resetAndClose();
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string[] | string } } })?.response
          ?.data?.message;
      toast.error('Ошибка применения', {
        description: Array.isArray(message) ? message.join(', ') : message,
      });
    },
  });

  const handleApply = () => {
    if (replacements.length === 0) {
      toast.info('Не выбрано ни одного фото для замены');
      return;
    }
    if (bulkMode) {
      setApplyConfirmOpen(true);
      return;
    }
    // одиночный режим: замены идут в форму товара (imageId уникальны в его рамках)
    onApply?.(replacements.map((r) => ({ imageId: r.imageId, url: r.url })));
    toast.success(`Заменено фото: ${replacements.length}. Не забудьте сохранить товар`, {
      description: 'Новые фото пока только в форме — нажмите «Сохранить»/«Опубликовать»',
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(bulkMode ? 'prompt' : 'select');
    setSelectedKeys(new Set());
    setVariantsPerImage(1);
    setJobIds([]);
    setChosenVariant({});
    setAccepted({});
    setAnalyses({});
    setPrompts({});
    setAnalyzingKeys(new Set());
    setExpandedKey(null);
    onClose();
  };

  // Esc закрывает полноэкранный просмотр
  useEffect(() => {
    if (!expandedKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedKey(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expandedKey]);

  const expanded = useMemo(() => {
    if (!expandedKey) return null;
    for (const job of jobs) {
      const item = job.items.find((i) => `${job.productId}::${i.sourceImageId}` === expandedKey);
      if (item) return { job, item };
    }
    return null;
  }, [expandedKey, jobs]);

  const singleProduct = targets.length === 1 ? targets[0] : null;

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="ИИ-перегенерация фото"
      description={
        config?.driver === 'stub'
          ? 'Сервер работает в режиме заглушки (stub) — фото будут плашками-заглушками'
          : `Модель: ${config?.model || '—'} · у каждого фото свой анализ и своя сцена · результат 3:4${
              bulkMode ? ` · товаров: ${targets.length}` : ''
            }`
      }
      className="max-w-3xl max-h-[90vh] overflow-y-auto"
    >
      {/* Прогресс-индикатор шагов */}
      <ol className="mb-4 flex items-center gap-2 text-xs">
        {(
          [
            ['select', 'Фото'],
            ['prompt', 'Промпты'],
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

      {/* ===== Шаг 1: выбор фото (одиночный режим) ===== */}
      {step === 'select' && singleProduct && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Отметьте фото, которые нужно перегенерировать ({selectedKeys.size} из{' '}
            {photos.length}) — у каждого будет свой анализ и своя сцена
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => {
              const isSelected = selectedKeys.has(photo.key);
              return (
                <button
                  key={photo.key}
                  type="button"
                  aria-label={`Фото ${index + 1}${isSelected ? ' — выбрано' : ''}`}
                  onClick={() => toggleSelect(photo.key)}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-gray-200 hover:border-primary-300 dark:border-gray-700',
                  )}
                >
                  <div className="aspect-square">
                    <img src={photo.url} alt="Фото товара" className="h-full w-full object-cover" />
                  </div>
                  {photo.isMain && (
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
            <Button disabled={selectedKeys.size === 0} onClick={() => setStep('prompt')}>
              Далее: анализ и промпты
            </Button>
          </div>
        </div>
      )}

      {/* ===== Шаг 2: анализ и промпт КАЖДОГО фото ===== */}
      {step === 'prompt' && (
        <div className="space-y-4">
          {/* Bulk: чистые фото без брендов исключены из генерации */}
          {skippedClean.length > 0 && (
            <details className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800/60">
              <summary className="cursor-pointer text-gray-500">
                Пропущено: чистые фото без брендов — {skippedClean.length} шт.
                (регенерация не требуется; клик по фото вернёт его)
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {skippedClean.map((photo) => (
                  <button
                    key={photo.key}
                    type="button"
                    title={`${photo.productName}: вернуть в генерацию`}
                    onClick={() => toggleSelect(photo.key)}
                    className="overflow-hidden rounded-md border-2 border-dashed border-gray-300 opacity-60 transition-opacity hover:opacity-100 dark:border-gray-600"
                  >
                    <img src={photo.url} alt="Чистое фото" className="h-16 w-12 object-cover" />
                  </button>
                ))}
              </div>
            </details>
          )}

          {/* Bulk: всё проанализировано и всё чисто */}
          {bulkMode && !stillAnalyzing && selectedKeys.size === 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              Брендовых логотипов и названий на выбранных фото не найдено —
              генерация не требуется.
            </div>
          )}

          {config && config.presets.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Пресеты магазина (заполнят все поля — потом правь каждое под фото)
              </p>
              <div className="flex flex-wrap gap-2">
                {config.presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPresetToAll(preset.prompt)}
                    className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                  >
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {targets.map((target) => {
            const targetPhotos = orderedSelected.filter((p) => p.productId === target.productId);
            if (targetPhotos.length === 0) return null;
            return (
              <div key={target.productId} className="space-y-3">
                {targets.length > 1 && (
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {target.productName}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      фото: {targetPhotos.length}
                    </span>
                  </p>
                )}
                {targetPhotos.map((photo) => (
                  <PhotoPromptCard
                    key={photo.key}
                    photo={photo}
                    index={photos.findIndex((p) => p.key === photo.key) + 1}
                    analysis={analyses[photo.key]}
                    analyzing={analyzingKeys.has(photo.key)}
                    value={prompts[photo.key] ?? ''}
                    onValueChange={(v) => setPrompts((prev) => ({ ...prev, [photo.key]: v }))}
                    onScene={(v) => setPrompts((prev) => ({ ...prev, [photo.key]: v }))}
                    onApplyToAll={applySceneToAll}
                    onReanalyze={() => {
                      setAnalyses((prev) => {
                        const next = { ...prev };
                        delete next[photo.key];
                        return next;
                      });
                      runAnalysis([photo.key]);
                    }}
                  />
                ))}
              </div>
            );
          })}

          {config?.basePrompt && (
            <details className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
              <summary className="cursor-pointer text-gray-500">
                Базовый промпт стиля магазина (добавится автоматически к каждому фото)
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
            {!bulkMode && (
              <Button variant="outline" onClick={() => setStep('select')}>
                Назад
              </Button>
            )}
            <Button
              loading={startMutation.isPending}
              disabled={selectedKeys.size === 0}
              onClick={handleStart}
            >
              <Wand2 className="h-4 w-4" />
              Сгенерировать ({selectedKeys.size} фото{bulkMode ? `, ${targets.length} товаров` : ''})
            </Button>
          </div>
        </div>
      )}

      {/* ===== Шаг 3: прогресс ===== */}
      {step === 'progress' && <ProgressView jobs={jobs} />}

      {/* ===== Шаг 4: ревью ===== */}
      {step === 'review' && jobs.length > 0 && (
        <div className="space-y-5">
          {jobs.some((j) => j.status === 'failed') && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>Часть задач завершилась ошибкой — смотрите статусы ниже</span>
            </div>
          )}

          {jobs.flatMap((job) => {
            const target = targets.find((t) => t.productId === job.productId);
            return job.items
              .filter((item) => item.variants.length > 0 || item.error)
              .map((item) => {
                const key = `${job.productId}::${item.sourceImageId}`;
                const variantIndex = chosenVariant[key] ?? 0;
                const variant = item.variants[variantIndex];
                const isAccepted = accepted[key] ?? false;
                return (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-3 sm:grid-cols-[minmax(0,240px)_1fr] dark:border-gray-700"
                  >
                    <div className="relative">
                      <BeforeAfter before={item.sourceUrl} after={variant?.url ?? item.sourceUrl} />
                      {item.variants.length > 0 && (
                        <button
                          type="button"
                          aria-label="Развернуть на весь экран"
                          title="Развернуть на весь экран"
                          onClick={() => setExpandedKey(key)}
                          className="absolute bottom-3 right-3 z-20 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {jobs.length > 1 && (
                        <p className="truncate text-xs text-gray-400" title={target?.productName}>
                          {target?.productName}
                        </p>
                      )}
                      {item.variants.length > 1 && (
                        <div className="flex gap-2">
                          {item.variants.map((v, i) => (
                            <button
                              key={v.url}
                              type="button"
                              onClick={() => setChosenVariant((prev) => ({ ...prev, [key]: i }))}
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
                            setAccepted((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-gray-300 accent-primary-600"
                        />
                        Заменить исходное фото этим вариантом
                      </label>
                    </div>
                  </div>
                );
              });
          })}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              К замене: {replacements.length} из{' '}
              {jobs.reduce((acc, j) => acc + j.items.length, 0)}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetAndClose}>
                Отклонить всё
              </Button>
              <Button onClick={handleApply} disabled={replacements.length === 0}>
                {bulkMode ? 'Заменить у товаров' : 'Применить к форме'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Полноэкранный просмотр «до/после» ===== */}
      {expanded && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setExpandedKey(null)}
        >
          <button
            type="button"
            aria-label="Закрыть просмотр"
            onClick={() => setExpandedKey(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
          >
            <XCircle className="h-6 w-6" />
          </button>
          <div
            className="flex max-h-full flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 3:4: ширина ограничена высотой (75vh) и шириной экрана */}
            <div className="w-[min(92vw,calc(72vh*0.75))]">
              <BeforeAfter
                before={expanded.item.sourceUrl}
                after={
                  expanded.item.variants[chosenVariant[expandedKey!] ?? 0]?.url ??
                  expanded.item.sourceUrl
                }
                className="max-h-[72vh]"
              />
            </div>
            {expanded.item.variants.length > 1 && (
              <div className="flex gap-2">
                {expanded.item.variants.map((v, i) => (
                  <button
                    key={v.url}
                    type="button"
                    onClick={() =>
                      setChosenVariant((prev) => ({
                        ...prev,
                        [expandedKey!]: i,
                      }))
                    }
                    className={cn(
                      'overflow-hidden rounded-md border-2 transition-colors',
                      i === (chosenVariant[expandedKey!] ?? 0)
                        ? 'border-white'
                        : 'border-white/30 hover:border-white/60',
                    )}
                  >
                    <img src={v.thumbUrl} alt={`Вариант ${i + 1}`} className="h-20 w-15 object-cover" />
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-white/60">
              Ползунок «до/после» работает · Esc или клик по фону — закрыть
            </p>
          </div>
        </div>
      )}

      {/* Подтверждение прямого bulk-применения */}
      <ConfirmDialog
        open={applyConfirmOpen}
        title="Заменить фото напрямую у товаров?"
        description={`Будет обновлено ${replacements.length} фото у ${
          new Set(replacements.map((r) => r.productId)).size
        } товар(ов) сразу, без кнопки «Сохранить». Исходные фото остаются в истории задач.`}
        confirmText="Заменить"
        loading={applyDirectly.isPending}
        onConfirm={() => {
          applyDirectly.mutate();
          setApplyConfirmOpen(false);
        }}
        onCancel={() => setApplyConfirmOpen(false)}
      />
    </Modal>
  );
}

/** Карточка «одно фото: анализ + сцена» (общая для одиночного и bulk-режима). */
interface PhotoPromptCardProps {
  photo: FlatPhoto;
  index: number;
  analysis?: GarmentAnalysis | null;
  analyzing: boolean;
  value: string;
  onValueChange: (v: string) => void;
  onScene: (v: string) => void;
  onApplyToAll: (v: string) => void;
  onReanalyze: () => void;
}

function PhotoPromptCard({
  photo,
  index,
  analysis,
  analyzing,
  value,
  onValueChange,
  onScene,
  onApplyToAll,
  onReanalyze,
}: PhotoPromptCardProps) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <img
          src={photo.url}
          alt={`Фото ${index}`}
          className="h-16 w-12 shrink-0 rounded-md border border-gray-200 object-cover dark:border-gray-700"
        />
        <div className="min-w-0 flex-1">
          {analyzing ? (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <ScanEye className="h-4 w-4 animate-pulse text-primary-500" />
              Анализирую фото {index}: вещь, кто в кадре, сцены…
            </p>
          ) : analysis ? (
            <>
              <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                <ScanEye className="h-4 w-4 shrink-0 text-primary-600" />
                {analysis.garmentType}
                <button
                  type="button"
                  aria-label={`Повторить анализ фото ${index}`}
                  title="Повторить анализ"
                  onClick={onReanalyze}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </p>
              <div className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                {analysis.subject && (
                  <p>
                    <span className="text-gray-400">Кто в кадре (сохранится):</span> {analysis.subject}
                  </p>
                )}
                {analysis.brandArtifacts && (
                  <p className="rounded bg-amber-50 px-2 py-0.5 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <span className="font-medium">Бренды (удалятся):</span> {analysis.brandArtifacts}
                  </p>
                )}
                {analysis.infoText && (
                  <p className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <span className="font-medium">Текст (сохранится):</span> {analysis.infoText}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400">Анализ недоступен — напишите сцену вручную</p>
          )}
        </div>
      </div>

      {analysis && analysis.scenes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {analysis.scenes.map((scene) => (
            <button
              key={scene.title + scene.prompt.slice(0, 24)}
              type="button"
              onClick={() => onScene(scene.prompt)}
              className="rounded-full border border-primary-300 bg-white px-3 py-1 text-xs text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-700 dark:bg-gray-800 dark:text-primary-300 dark:hover:bg-gray-700"
            >
              <Sparkles className="mr-1 inline h-3 w-3" />
              {scene.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onApplyToAll(value)}
            disabled={!value.trim()}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40"
            title="Скопировать текущую сцену этого фото во все остальные"
          >
            <Copy className="h-3.5 w-3.5" />
            применить ко всем
          </button>
        </div>
      )}

      <div>
        <textarea
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-label={`Промпт сцены — фото ${index}`}
          rows={3}
          placeholder={`Сцена для фото ${index}: например, девушка в этой пижаме пьёт чай перед сном…`}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600"
        />
        <p
          className={cn(
            'mt-1 text-right text-xs',
            value.trim().length < MIN_PROMPT ? 'text-red-400' : 'text-gray-400',
          )}
        >
          {value.trim().length} / 4000
        </p>
      </div>
    </div>
  );
}

function ProgressView({ jobs }: { jobs: RegenJob[] }) {
  const totals = jobs.reduce(
    (acc, j) => ({
      total: acc.total + j.totalImages,
      done: acc.done + j.processedImages,
    }),
    { total: 0, done: 0 },
  );
  const percentage = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;
  const anyActive = jobs.length === 0 || jobs.some((j) => j.status === 'pending' || j.status === 'processing');
  const allDone = jobs.length > 0 && jobs.every((j) => j.status === 'completed' || j.status === 'failed');
  const failedAll = jobs.length > 0 && jobs.every((j) => j.status === 'failed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {anyActive && <Loader2 className="h-6 w-6 animate-spin text-primary-500" />}
        {allDone && !failedAll && <CheckCircle className="h-6 w-6 text-green-500" />}
        {failedAll && <XCircle className="h-6 w-6 text-red-500" />}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {jobs.length === 0 && 'Постановка в очередь...'}
            {anyActive && jobs.length > 0 &&
              `Генерация фото (${jobs.length} ${jobs.length === 1 ? 'задача' : 'задач'}, у каждого фото свой промпт)...`}
            {allDone && !failedAll && 'Генерация завершена'}
            {failedAll && 'Генерация не удалась'}
          </p>
          <p className="text-sm text-gray-500">
            Модель: {jobs[0]?.model} · можно закрыть диалог, задачи продолжат выполняться
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-500">Прогресс</span>
          <span className="text-gray-700 dark:text-gray-300">
            {totals.done} / {totals.total} ({percentage}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              failedAll ? 'bg-red-500' : !anyActive ? 'bg-green-500' : 'bg-primary-500',
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {jobs.flatMap((job) =>
        job.items.map((item) => {
          const ready = item.variants[0];
          return (
            <div
              key={`${job.productId}:${item.sourceImageId}`}
              className="flex items-center gap-3 rounded-md border border-gray-100 p-2 text-sm dark:border-gray-800"
            >
              {ready ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
              ) : item.error ? (
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" />
              )}
              <img
                src={item.sourceUrl}
                alt="Исходник"
                className="h-12 w-9 shrink-0 rounded border border-gray-200 object-cover dark:border-gray-700"
              />
              {ready ? (
                <img
                  src={ready.thumbUrl}
                  alt="Сгенерировано"
                  className="h-12 w-9 shrink-0 rounded border border-green-300 object-cover dark:border-green-800"
                />
              ) : (
                <div className="h-12 w-9 shrink-0 rounded border border-dashed border-gray-300 dark:border-gray-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-gray-600 dark:text-gray-300" title={item.sourceUrl}>
                  {item.sourceUrl.split('/').pop()}
                </p>
                {item.error ? (
                  <p className="truncate text-xs text-red-500" title={item.error}>
                    {item.error}
                  </p>
                ) : (
                  item.prompt && (
                    <p className="truncate text-xs text-gray-400" title={item.prompt}>
                      {item.prompt}
                    </p>
                  )
                )}
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
}
