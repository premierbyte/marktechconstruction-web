export type GalleryImage = {
  id: string;
  url: string | null;
  alt: string | null;
  caption: string | null;
  credit: string | null;
  width: number | null;
  height: number | null;
  created_at?: string | null;
};

export type GalleryMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type GalleryList = {
  data: GalleryImage[];
  meta: GalleryMeta;
  filters?: { years: number[] };
};