import { GalleryItem, HeroSlide, ProductView } from "@/lib/types";

export const fallbackProducts: ProductView[] = [
  {
    id: "p1",
    name: "Neon Drift Oversized Tee",
    slug: "neon-drift-oversized-tee",
    price: 289000,
    description:
      "Heavyweight cotton tee with oversized silhouette and fluorescent back graphic for a loud midnight-street statement.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503341733017-1901578f9f1e?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Tops",
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "p2",
    name: "Shadow Cargo Pants",
    slug: "shadow-cargo-pants",
    price: 429000,
    description:
      "Relaxed tapered cargo pants with utility pockets, reinforced seams, and technical fabric built for all-day movement.",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Bottoms",
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "p3",
    name: "Voltage Coach Jacket",
    slug: "voltage-coach-jacket",
    price: 559000,
    description:
      "Water-resistant coach jacket with contrast piping and reflective logo hits that pop under city lights.",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Outerwear",
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "p4",
    name: "Signal Snapback",
    slug: "signal-snapback",
    price: 199000,
    description:
      "Structured six-panel snapback with embroidered Lucentrez mark and neon underbrim accent.",
    images: [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Accessories",
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "p5",
    name: "Mono Layer Hoodie",
    slug: "mono-layer-hoodie",
    price: 489000,
    description:
      "Midweight brushed hoodie with dropped shoulders and clean tonal graphics, made for daily rotation.",
    images: [
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Tops",
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "p6",
    name: "Transit Wide Denim",
    slug: "transit-wide-denim",
    price: 519000,
    description:
      "Wide-leg denim with structured drape and subtle whisker detailing for a clean, modern street fit.",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Bottoms",
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "p7",
    name: "Afterlight Bomber",
    slug: "afterlight-bomber",
    price: 629000,
    description:
      "Lightly padded bomber jacket with matte finish and ribbed trims, balancing warmth and mobility.",
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Outerwear",
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "p8",
    name: "Core Sling Bag",
    slug: "core-sling-bag",
    price: 239000,
    description:
      "Compact sling bag with dual-zip compartments and adjustable strap for hands-free daily carry.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    ],
    hoverImage: null,
    shopeeUrl: "https://shopee.co.id/",
    category: "Accessories",
    inStock: true,
    createdAt: new Date(),
  },
];

export const fallbackGallery: GalleryItem[] = [
  {
    id: "g1",
    title: "Night Alley Drop",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date(),
  },
  {
    id: "g2",
    title: "Concrete Pulse",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date(),
  },
  {
    id: "g3",
    title: "Subway Frequency",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date(),
  },
  {
    id: "g4",
    title: "Signal Tower Fit",
    imageUrl:
      "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date(),
  },
  {
    id: "g5",
    title: "After Hours Kit",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date(),
  },
  {
    id: "g6",
    title: "Neon Market Walk",
    imageUrl:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date(),
  },
];

export const fallbackHeroSlides: HeroSlide[] = [
  {
    id: "h1",
    title: "Urban Motion",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2048&h=1365&q=80",
    createdAt: new Date(),
  },
  {
    id: "h2",
    title: "Street Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2048&h=1365&q=80",
    createdAt: new Date(),
  },
  {
    id: "h3",
    title: "After Hours Fit",
    imageUrl:
      "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=2048&h=1365&q=80",
    createdAt: new Date(),
  },
];
