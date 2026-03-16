import { Select } from '@/shared/ui/select';

const FIELD_OPTIONS = [
  { value: '', label: '— Пропустить —' },
  { value: 'name', label: 'Название' },
  { value: 'shortDescription', label: 'Краткое описание' },
  { value: 'description', label: 'Описание' },
  { value: 'sku', label: 'SKU' },
  { value: 'price', label: 'Цена' },
  { value: 'compareAtPrice', label: 'Старая цена' },
  { value: 'categoryName', label: 'Категория' },
  { value: 'material', label: 'Материал' },
  { value: 'activity', label: 'Активность' },
  { value: 'features', label: 'Особенности' },
  { value: 'color', label: 'Цвет' },
  { value: 'colorHex', label: 'Hex цвета' },
  { value: 'status', label: 'Статус' },
  { value: 'tags', label: 'Теги' },
  { value: 'gtin', label: 'GTIN' },
  { value: 'imageUrl1', label: 'Изображение 1' },
  { value: 'imageUrl2', label: 'Изображение 2' },
  { value: 'variantSize', label: 'Размер варианта' },
  { value: 'variantSku', label: 'SKU варианта' },
  { value: 'variantStock', label: 'Остаток варианта' },
  { value: 'variantPrice', label: 'Цена варианта' },
  { value: 'variantGtin', label: 'GTIN варианта' },
  { value: 'seoTitle', label: 'SEO заголовок' },
  { value: 'seoDescription', label: 'SEO описание' },
];

// Auto-detect mapping from header names
function autoDetectField(header: string): string {
  const h = header.toLowerCase().trim();
  const map: Record<string, string> = {
    name: 'name',
    название: 'name',
    shortdescription: 'shortDescription',
    'краткое описание': 'shortDescription',
    description: 'description',
    описание: 'description',
    sku: 'sku',
    артикул: 'sku',
    price: 'price',
    цена: 'price',
    compareatprice: 'compareAtPrice',
    'старая цена': 'compareAtPrice',
    categoryname: 'categoryName',
    категория: 'categoryName',
    material: 'material',
    материал: 'material',
    activity: 'activity',
    активность: 'activity',
    features: 'features',
    особенности: 'features',
    color: 'color',
    цвет: 'color',
    colorhex: 'colorHex',
    status: 'status',
    статус: 'status',
    tags: 'tags',
    теги: 'tags',
    gtin: 'gtin',
    imageurl1: 'imageUrl1',
    'изображение 1': 'imageUrl1',
    imageurl2: 'imageUrl2',
    'изображение 2': 'imageUrl2',
    variantsize: 'variantSize',
    размер: 'variantSize',
    variantsku: 'variantSku',
    variantstock: 'variantStock',
    остаток: 'variantStock',
    variantprice: 'variantPrice',
    variantgtin: 'variantGtin',
    seotitle: 'seoTitle',
    seodescription: 'seoDescription',
  };
  return map[h] || '';
}

interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
}

export function ColumnMapper({ headers, mapping, onChange }: ColumnMapperProps) {
  const handleChange = (csvCol: string, field: string) => {
    onChange({ ...mapping, [csvCol]: field });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Сопоставление колонок
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {headers.map((header) => (
          <div key={header} className="flex items-center gap-2">
            <span className="w-40 truncate text-sm text-gray-600 dark:text-gray-400" title={header}>
              {header}
            </span>
            <Select
              options={FIELD_OPTIONS}
              value={mapping[header] || ''}
              onChange={(v) => handleChange(header, v)}
              className="flex-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export { autoDetectField };
