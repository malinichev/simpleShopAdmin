import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { DetectDuplicatesResult } from '../api/importApi';

interface DuplicatesStepProps {
  result: DetectDuplicatesResult;
  resolutions: Record<string, 'db' | 'csv'>;
  onResolutionsChange: (resolutions: Record<string, 'db' | 'csv'>) => void;
  onStartImport: () => void;
  isLoading: boolean;
}

export function DuplicatesStep({
  result,
  resolutions,
  onResolutionsChange,
  onStartImport,
  isLoading,
}: DuplicatesStepProps) {
  const { duplicates, newProductsCount, totalCsvRows } = result;

  const setAll = (value: 'db' | 'csv') => {
    const updated: Record<string, 'db' | 'csv'> = {};
    for (const d of duplicates) {
      updated[d.product.id] = value;
    }
    onResolutionsChange(updated);
  };

  const setOne = (productId: string, value: 'db' | 'csv') => {
    onResolutionsChange({ ...resolutions, [productId]: value });
  };

  if (duplicates.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            Дубликатов не найдено. Все {totalCsvRows} строк будут импортированы как новые товары.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onStartImport} loading={isLoading}>
            Запустить импорт ({totalCsvRows} строк)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Найдено <strong>{duplicates.length}</strong> совпадений из {totalCsvRows} строк.
          Новых товаров: <strong>{newProductsCount}</strong>.
          Для совпавших товаров будут обновлены данные из CSV (цена, варианты, атрибуты),
          а name/description/фото — по вашему выбору.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setAll('db')}>
          Все из БД
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAll('csv')}>
          Все из CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Строка</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">SKU</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Имя (CSV)</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Совпадение</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Имя (БД)</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Источник</th>
            </tr>
          </thead>
          <tbody>
            {duplicates.map((d) => {
              const resolution = resolutions[d.product.id] || 'db';
              return (
                <tr
                  key={d.product.id}
                  className="border-b last:border-b-0 dark:border-gray-700"
                >
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{d.csvRowNum}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                    {d.csvSku || '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{d.csvName || '—'}</td>
                  <td className="px-3 py-2">
                    <Badge variant={d.matchedBy === 'sku' ? 'default' : 'secondary'}>
                      {d.matchedBy === 'sku' ? 'По SKU' : 'По имени'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{d.product.name}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setOne(d.product.id, 'db')}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          resolution === 'db'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        БД
                      </button>
                      <button
                        type="button"
                        onClick={() => setOne(d.product.id, 'csv')}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          resolution === 'csv'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        CSV
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={onStartImport} loading={isLoading}>
          Запустить импорт ({totalCsvRows} строк)
        </Button>
      </div>
    </div>
  );
}
