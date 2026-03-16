import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ROUTES } from '@/shared/config';
import {
  CsvUploader,
  ColumnMapper,
  autoDetectField,
  ImportPreview,
  ImportProgress,
  ImportHistory,
  importApi,
  useImportPreview,
  useStartImport,
  useImportJob,
  type ImportPreviewResult,
} from '@/features/import-products';

type Step = 'upload' | 'mapping' | 'progress';

export function ImportProductsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [jobId, setJobId] = useState('');

  const previewMutation = useImportPreview();
  const startMutation = useStartImport();
  const { data: activeJob } = useImportJob(jobId);

  const handleFileSelect = (file: File) => {
    previewMutation.mutate(file, {
      onSuccess: (result) => {
        setPreview(result);
        // Auto-detect mapping
        const autoMapping: Record<string, string> = {};
        result.headers.forEach((h) => {
          const detected = autoDetectField(h);
          if (detected) autoMapping[h] = detected;
        });
        setMapping(autoMapping);
        setStep('mapping');
      },
    });
  };

  const handleStartImport = () => {
    if (!preview) return;
    startMutation.mutate(
      {
        fileKey: preview.fileKey,
        mapping,
        defaultStatus: 'draft',
        skipDuplicates: true,
      },
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
  };

  const mappedFieldsCount = useMemo(
    () => Object.values(mapping).filter(Boolean).length,
    [mapping],
  );

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
              Импорт товаров из CSV
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Массовая загрузка товаров через CSV файл
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => importApi.downloadTemplate()}>
          <Download className="h-4 w-4" />
          Скачать шаблон
        </Button>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 text-sm">
        {(['upload', 'mapping', 'progress'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
            <span
              className={`${
                step === s
                  ? 'font-medium text-primary-600 dark:text-primary-400'
                  : 'text-gray-400'
              }`}
            >
              {s === 'upload' && '1. Загрузка'}
              {s === 'mapping' && '2. Маппинг'}
              {s === 'progress' && '3. Результат'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Загрузите CSV файл</CardTitle>
          </CardHeader>
          <CardContent>
            <CsvUploader
              onFileSelect={handleFileSelect}
              isLoading={previewMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Mapping */}
      {step === 'mapping' && preview && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Сопоставление колонок</CardTitle>
            </CardHeader>
            <CardContent>
              <ColumnMapper
                headers={preview.headers}
                mapping={mapping}
                onChange={setMapping}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Превью данных</CardTitle>
            </CardHeader>
            <CardContent>
              <ImportPreview
                headers={preview.headers}
                rows={preview.rows}
                totalRows={preview.totalRows}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Назад
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Сопоставлено: {mappedFieldsCount} колонок
              </span>
              <Button
                onClick={handleStartImport}
                loading={startMutation.isPending}
                disabled={mappedFieldsCount === 0}
              >
                Начать импорт ({preview.totalRows} строк)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Progress */}
      {step === 'progress' && activeJob && (
        <Card>
          <CardHeader>
            <CardTitle>Результат импорта</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportProgress job={activeJob} />
          </CardContent>
        </Card>
      )}

      {/* Import history */}
      <Card>
        <CardHeader>
          <CardTitle>История импортов</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportHistory onSelectJob={handleSelectJob} />
        </CardContent>
      </Card>
    </div>
  );
}
