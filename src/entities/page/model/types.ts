export interface PageFile {
  id: string;
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: object;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
