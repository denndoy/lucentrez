export type ProductView = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  images: string[];
  shopeeUrl: string;
  category: string;
  createdAt: Date;
};

export type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
};

export type AdminProductInput = {
  name: string;
  price: number;
  description: string;
  images: string[];
  shopeeUrl: string;
  category?: string;
};
