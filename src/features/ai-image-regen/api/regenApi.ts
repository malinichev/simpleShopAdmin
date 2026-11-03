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

/** Vision-анализ выбранных фото перед генерацией. */
export interface GarmentAnalysis {
  garmentType: string;
  color: string;
  styleMood: string;
  modelNote: string;
  notes: string;
  /** Найденные логотипы/названия брендов/сайты/водяные знаки — удаляются при генерации. */
  brandArtifacts: string;
  scenes: RegenPromptPreset[];
}

export const regenApi = {
  getConfig: async (): Promise<RegenConfig> => {
    const { data } = await api.get<RegenConfig>('/image-regen/config');
    return data;
  },

  analyze: async (params: {
    productId: string;
    imageIds: string[];
  }): Promise<GarmentAnalysis> => {
    const { data } = await api.post<GarmentAnalysis>(
      '/image-regen/analyze',
      params,
    );
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
