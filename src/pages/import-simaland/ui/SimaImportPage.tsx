import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { ROUTES } from '@/shared/config';
import { CsvUploader } from '@/features/import-products';
import {
  SimaJobProgress,
  SimaImportHistory,
  useSimaPreview,
  useStartSimaImport,
  useSimaJob,
  useActiveSimaJob,
  type SimaPreviewResult,
} from '@/features/import-simaland';

type Step = 'upload' | 'review' | 'progress';

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: '1. Файл выгрузки' },
  { key: 'review', label: '2. Проверка' },
  { key: 'progress', label: '3. Загрузка' },
];

export function SimaImportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [preview, setPreview] = useState<SimaPreviewResult | null>(null);
  const [onlyWomen, setOnlyWomen] = useState(true);
  const [jobId, setJobId] = useState('');

  const previewMutation = useSimaPreview();
  const startMutation = useStartSimaImport();
  const { data: selectedJob } = useSimaJob(jobId);
  const { data: runningJob } = useActiveSimaJob();
  // если пользователь приходит по клику на индикатор в шапке (или просто на
  // страницу), а загрузка уже идёт — сразу показываем её прогресс
  const activeJob = selectedJob ?? runningJob ?? null;

  useEffect(() => {
    if (runningJob && !jobId) {
      setJobId(runningJob.id);
      setStep('progress');
    }
  }, [runningJob, jobId]);

  const handleFileSelect = (file: File) => {
    previewMutation.mutate(file, {
      onSuccess: (result) => {
        setPreview(result);
        setStep('review');
      },
    });
  };

  const handleStart = () => {
    if (!preview) return;
    startMutation.mutate(
      { fileKey: preview.fileKey, onlyWomen },
      {
        onSuccess: (job) => {
          setJobId(job.id);
          setStep('progress');
        },
      },
    );
  };

  const handleSelectJob = (id: string) => {
    setJobId(id);
    setStep('progress');
    // карточка прогресса рендерится вверху страницы — подтягиваем к ней взгляд
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PRODUCTS)}>
            <ArrowLeft className="h-4 w-4" />
            К товарам
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Загрузка с Сималенд
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Выгрузка с сайта поставщика → цвета склеиваются автоматически
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
            <span
              className={`${
                step === s.key
                  ? 'font-medium text-primary-600 dark:text-primary-400'
                  : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Шаг 1: файл */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Загрузите файл выгрузки Сималенда</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                На сайте sima-land.ru откройте нужную категорию, нажмите кнопку
                выгрузки (CSV, можно с колонками «Модификации») и загрузите
                полученный файл здесь. Товары создадутся сразу со связанными
                цветовыми вариантами — ничего склеивать вручную не нужно.
              </p>
            </div>
            <CsvUploader
              onFileSelect={handleFileSelect}
              isLoading={previewMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Шаг 2: проверка */}
      {step === 'review' && preview && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Проверка выгрузки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border p-3 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Позиций (цвета)</p>
                  <p className="text-lg font-semibold">{preview.parsedRows}</p>
                </div>
                <div className="rounded-lg border p-3 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Уже в каталоге</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {preview.existingSkus}
                  </p>
                </div>
                <div className="rounded-lg border p-3 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Новые</p>
                  <p className="text-lg font-semibold text-green-600">
                    {Math.max(preview.parsedRows - preview.existingSkus, 0)}
                  </p>
                </div>
                <div className="rounded-lg border p-3 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Связей в кэше</p>
                  <p className="text-lg font-semibold">{preview.linkedByCache}</p>
                </div>
              </div>

              {preview.categories.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-medium">Категории каталога:</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.categories.map((c) => (
                      <span
                        key={c.category}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800"
                      >
                        {c.category} · {c.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preview.unmapped > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {preview.unmapped} позиций не удалось сопоставить с категориями
                    магазина — они попадут в ошибки загрузки.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Switch checked={onlyWomen} onCheckedChange={setOnlyWomen} />
                <span className="text-sm">
                  Только женская одежда (пропустить мужское и детское)
                </span>
              </div>

              {preview.sample.length > 0 && (
                <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                  <table className="w-full text-xs">
                    <tbody>
                      {preview.sample.map((s) => (
                        <tr
                          key={s.sid}
                          className="border-b last:border-0 dark:border-gray-800"
                        >
                          <td className="px-3 py-1.5 text-gray-500">SL-{s.sid}</td>
                          <td className="px-3 py-1.5">{s.title}</td>
                          <td className="px-3 py-1.5 text-gray-500">{s.color}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Назад
            </Button>
            <Button onClick={handleStart} loading={startMutation.isPending}>
              Начать загрузку ({preview.parsedRows} позиций)
            </Button>
          </div>
        </div>
      )}

      {/* Шаг 3: прогресс */}
      {step === 'progress' && activeJob && (
        <Card>
          <CardHeader>
            <CardTitle>Прогресс загрузки</CardTitle>
          </CardHeader>
          <CardContent>
            <SimaJobProgress job={activeJob} />
          </CardContent>
        </Card>
      )}

      {/* История */}
      <Card>
        <CardHeader>
          <CardTitle>История загрузок с Сималенда</CardTitle>
        </CardHeader>
        <CardContent>
          <SimaImportHistory onSelectJob={handleSelectJob} />
        </CardContent>
      </Card>
    </div>
  );
}
