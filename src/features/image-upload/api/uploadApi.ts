import { api } from '@/shared/api';

export interface UploadResult {
  key: string;
  url: string;
  thumbnailUrl: string;
}

export const uploadApi = {
  uploadImage: async (file: File, folder?: string): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<UploadResult>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: folder ? { folder } : undefined,
    });
    return data;
  },

  uploadImages: async (
    files: File[],
    folder?: string,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResult[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await api.post<UploadResult[]>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: folder ? { folder } : undefined,
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },

  deleteImage: async (key: string): Promise<void> => {
    await api.delete('/upload', { params: { key } });
  },
};
