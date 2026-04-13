export type ProductView = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  images: string[];
  hoverImage: string | null;
  shopeeUrl: string;
  category: string;
  inStock: boolean;
  createdAt: Date;
};

export type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
};

export type HeroSlide = {
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
  hoverImage?: string | null;
  shopeeUrl: string;
  category?: string;
  soldOut?: boolean;
};
