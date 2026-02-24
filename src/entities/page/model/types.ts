export interface PageFile {
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Page {
  _id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: object;
  files: PageFile[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
