import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Editor from '@monaco-editor/react';
import {
  Save,
  Upload,
  Copy,
  Trash2,
  ArrowLeft,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { formatDateTime } from '@/shared/lib/utils/date';
import type { PageFile } from '@/entities/page';
import {
  usePage,
  useUpdatePage,
  useUploadPageFile,
  useDeletePageFile,
} from '@/features/page-management';
import { ROUTES } from '@/shared/config';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <ImageIcon className="h-5 w-5 text-blue-500" />;
}

export function PageEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: page, isLoading } = usePage(slug ?? '');
  const updatePage = useUpdatePage();
  const uploadFile = useUploadPageFile(slug ?? '');
  const deleteFile = useDeletePageFile(slug ?? '');

  const [title, setTitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [monacoValue, setMonacoValue] = useState('{}');
  const [initialized, setInitialized] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<PageFile | null>(null);

  // Initialize form from loaded page (once)
  if (page && !initialized) {
    setTitle(page.title);
    setMetaTitle(page.metaTitle ?? '');
    setMetaDescription(page.metaDescription ?? '');
    setIsPublished(page.isPublished);
    setMonacoValue(JSON.stringify(page.content, null, 2));
    setInitialized(true);
  }

  const handleSave = useCallback(() => {
    let parsedContent: object;
    try {
      parsedContent = JSON.parse(monacoValue);
    } catch {
      toast.error('JSON невалиден. Исправьте ошибки перед сохранением.');
      return;
    }

    updatePage.mutate({
      slug: slug ?? '',
      data: {
        title,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        isPublished,
        content: parsedContent,
      },
    });
  }, [slug, title, metaTitle, metaDescription, isPublished, monacoValue, updatePage]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Файл слишком большой. Максимум 20MB.');
        return;
      }
      uploadFile.mutate(file);
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL скопирован');
    });
  }, []);

  const handleDeleteFileConfirm = useCallback(() => {
    if (fileToDelete) {
      deleteFile.mutate(fileToDelete.key, {
        onSuccess: () => setFileToDelete(null),
      });
    }
  }, [fileToDelete, deleteFile]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500">Страница не найдена</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(ROUTES.PAGES)}>
          Назад к списку
        </Button>
      </div>
    );
  }

  const files = page.files ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PAGES)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {page.title}
            </h1>
            <p className="text-sm text-gray-500">/{page.slug}</p>
          </div>
        </div>
        <Button onClick={handleSave} loading={updatePage.isPending}>
          <Save className="mr-1.5 h-4 w-4" />
          Сохранить
        </Button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Metadata card */}
          <Card>
            <CardHeader>
              <CardTitle>Метаданные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug
                </label>
                <Input value={page.slug} readOnly className="bg-gray-50 dark:bg-gray-800/50" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Название <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="О нас"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meta Title
                </label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Заголовок страницы для SEO"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meta Description
                </label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Описание страницы для SEO"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Опубликовано
                  </p>
                  <p className="text-xs text-gray-500">
                    GET /api/pages/{page.slug}
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </CardContent>
          </Card>

          {/* Monaco JSON editor */}
          <Card>
            <CardHeader>
              <CardTitle>JSON контент</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <Editor
                  height="500px"
                  language="json"
                  theme="vs-dark"
                  value={monacoValue}
                  onChange={(val) => setMonacoValue(val ?? '{}')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    tabSize: 2,
                    formatOnPaste: true,
                    formatOnType: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Files */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Файлы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-300 hover:border-primary-400 dark:border-gray-600'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? 'Отпустите файл...'
                    : 'Перетащите или нажмите для загрузки'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Изображения, PDF · Макс. 20MB
                </p>
                {uploadFile.isPending && (
                  <p className="mt-2 text-xs text-primary-500">Загрузка...</p>
                )}
              </div>

              {/* File list */}
              {files.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  Нет загруженных файлов
                </p>
              ) : (
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li
                      key={file.key}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <FileIcon mimeType={file.mimeType} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(file.size)} · {formatDateTime(file.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(file.url)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          title="Скопировать URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          title="Удалить файл"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete file confirm */}
      <ConfirmDialog
        open={fileToDelete !== null}
        title="Удалить файл?"
        description={`Файл "${fileToDelete?.name}" будет удалён из хранилища.`}
        confirmText="Удалить"
        variant="danger"
        loading={deleteFile.isPending}
        onConfirm={handleDeleteFileConfirm}
        onCancel={() => setFileToDelete(null)}
      />
    </div>
  );
}
