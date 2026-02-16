export type ID = string;

export type Nullable<T> = T | null;

export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}
