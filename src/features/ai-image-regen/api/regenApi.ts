import { api } from '@/shared/api';

export interface RegenVariant {
  url: string;
  thumbUrl: string;
}

export interface RegenItem {
  sourceImageId: string;
  sourceUrl: string;
  variants: RegenVariant[];
  error?: string;
}

export interface RegenJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  productId: string;
  prompt: string;
  composedPrompt: string;
  model: string;
  items: RegenItem[];
  totalImages: number;
  processedImages: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ sourceImageId?: string; message: string }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegenPromptPreset {
  id: string;
  title: string;
  prompt: string;
}

export interface RegenConfig {
  enabled: boolean;
  driver: string | null;
  model: string;
  basePrompt: string;
  presets: RegenPromptPreset[];
}

export const regenApi = {
  getConfig: async (): Promise<RegenConfig> => {
    const { data } = await api.get<RegenConfig>('/image-regen/config');
    return data;
  },

  start: async (params: {
    productId: string;
    imageIds: string[];
    prompt: string;
    variantsPerImage?: number;
  }): Promise<RegenJob> => {
    const { data } = await api.post<RegenJob>('/image-regen/jobs', params);
    return data;
  },

  getJob: async (id: string): Promise<RegenJob> => {
    const { data } = await api.get<RegenJob>(`/image-regen/jobs/${id}`);
    return data;
  },
};
