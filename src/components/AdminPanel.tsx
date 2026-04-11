"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AppLang } from "@/lib/lang";
import { HeroSlide, ProductView } from "@/lib/types";

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
};

type AdminPanelProps = {
  initialProducts: ProductView[];
  initialGallery: GalleryItem[];
  initialHeroSlides: HeroSlide[];
  lang: AppLang;
};

type ToastState = {
  type: "success" | "error" | "info";
  message: string;
};

type DeleteTarget = {
  type: "product" | "gallery" | "hero";
  id: string;
  label: string;
};

const emptyProduct = {
  id: "",
  name: "",
  price: "",
  category: "Tops",
  description: "",
  images: "",
  shopeeUrl: "https://shopee.co.id/",
  soldOut: false,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasValidUuidId<T extends { id: string }>(item: T) {
  return UUID_RE.test(item.id);
}

export function AdminPanel({ initialProducts, initialGallery, initialHeroSlides, lang }: AdminPanelProps) {
  const [products, setProducts] = useState(() => initialProducts.filter(hasValidUuidId));
  const [gallery, setGallery] = useState(() => initialGallery.filter(hasValidUuidId));
  const [heroSlides, setHeroSlides] = useState(() => initialHeroSlides.filter(hasValidUuidId));
  const [form, setForm] = useState(emptyProduct);
  const [galleryForm, setGalleryForm] = useState({ id: "", title: "", imageUrl: "" });
  const [heroForm, setHeroForm] = useState({ id: "", title: "", imageUrl: "" });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [gallerySearch, setGallerySearch] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(type: ToastState["type"], message: string) {
    setToast({ type, message });
  }

  const text = lang === "id"
    ? {
        productCms: "CMS Produk",
        productCmsDesc: "Buat atau ubah produk katalog dan tautan marketplace.",
        productName: "Nama produk",
        priceIdr: "Harga dalam IDR",
        marketplaceUrl: "URL marketplace",
        description: "Deskripsi",
        markSoldOut: "Tandai sebagai sold out",
        images: "Gambar",
        chooseImage: "Pilih Gambar",
        noFileSelected: "Belum ada file",
        uploadImage: "Upload Gambar",
        imageUrls: "URL gambar (satu per baris)",
        remove: "Hapus",
        updateProduct: "Ubah Produk",
        createProduct: "Buat Produk",
        reset: "Reset",
        currentProducts: "Produk Saat Ini",
        searchProducts: "Cari produk",
        inStock: "Tersedia",
        soldOut: "Sold Out",
        edit: "Ubah",
        delete: "Hapus",
        communityCms: "CMS Komunitas",
        heroCms: "Slider Landing",
        searchGallery: "Cari galeri",
        searchHero: "Cari slide",
        galleryTitle: "Judul galeri",
        heroTitle: "Judul slide",
        imageUrl: "URL gambar",
        addImage: "Tambah Gambar",
        updateImage: "Ubah Gambar",
        addSlide: "Tambah Slide",
        updateSlide: "Ubah Slide",
        quickOverview: "Ringkasan Cepat",
        totalProducts: "Total Produk",
        totalGallery: "Foto Komunitas",
        totalSlides: "Slide Landing",
        noProducts: "Tidak ada produk ditemukan.",
        noGallery: "Tidak ada foto komunitas ditemukan.",
        noSlides: "Tidak ada slide landing ditemukan.",
        confirmDelete: "Konfirmasi Hapus",
        deleteProductLabel: "produk",
        deleteGalleryLabel: "foto komunitas",
        deleteHeroLabel: "slide landing",
        cancel: "Batal",
        yesDelete: "Ya, Hapus",
      }
    : {
        productCms: "Product CMS",
        productCmsDesc: "Create or update catalog products and marketplace links.",
        productName: "Product name",
        priceIdr: "Price in IDR",
        marketplaceUrl: "marketplace URL",
        description: "Description",
        markSoldOut: "Mark as sold out",
        images: "Images",
        chooseImage: "Choose Image",
        noFileSelected: "No file selected",
        uploadImage: "Upload Image",
        imageUrls: "Image URLs (one per line)",
        remove: "Remove",
        updateProduct: "Update Product",
        createProduct: "Create Product",
        reset: "Reset",
        currentProducts: "Current Products",
        searchProducts: "Search products",
        inStock: "In Stock",
        soldOut: "Sold Out",
        edit: "Edit",
        delete: "Delete",
        communityCms: "Community CMS",
        heroCms: "Landing Slider",
        searchGallery: "Search gallery",
        searchHero: "Search slides",
        galleryTitle: "Gallery title",
        heroTitle: "Slide title",
        imageUrl: "Image URL",
        addImage: "Add Image",
        updateImage: "Update Image",
        addSlide: "Add Slide",
        updateSlide: "Update Slide",
        quickOverview: "Quick Overview",
        totalProducts: "Total Products",
        totalGallery: "Community Photos",
        totalSlides: "Landing Slides",
        noProducts: "No products found.",
        noGallery: "No community images found.",
        noSlides: "No landing slides found.",
        confirmDelete: "Confirm Delete",
        deleteProductLabel: "product",
        deleteGalleryLabel: "gallery image",
        deleteHeroLabel: "landing slide",
        cancel: "Cancel",
        yesDelete: "Yes, Delete",
      };

  const editing = useMemo(() => products.find((product) => product.id === form.id), [form.id, products]);
  const categoryOptions = useMemo(
    () => {
      const existing = products.map((product) => product.category).filter(Boolean);
      const defaults = ["Tops", "Bottoms", "Outerwear", "Accessories"];
      return Array.from(new Set([...defaults, ...existing]));
    },
    [products],
  );
  const productImages = useMemo(
    () => form.images.split("\n").map((item) => item.trim()).filter(Boolean),
    [form.images],
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(productSearch.trim().toLowerCase()),
      ),
    [products, productSearch],
  );
  const filteredGallery = useMemo(
    () =>
      gallery.filter((item) =>
        item.title.toLowerCase().includes(gallerySearch.trim().toLowerCase()),
      ),
    [gallery, gallerySearch],
  );
  const filteredHeroSlides = useMemo(
    () =>
      heroSlides.filter((item) =>
        item.title.toLowerCase().includes(heroSearch.trim().toLowerCase()),
      ),
    [heroSearch, heroSlides],
  );

  const overviewCards = useMemo(
    () => [
      { label: text.totalProducts, value: products.length },
      { label: text.totalGallery, value: gallery.length },
      { label: text.totalSlides, value: heroSlides.length },
    ],
    [gallery.length, heroSlides.length, products.length, text.totalGallery, text.totalProducts, text.totalSlides],
  );

  async function refresh() {
    const [productsRes, galleryRes, heroRes] = await Promise.all([
      fetch("/api/admin/products", { credentials: "include" }),
      fetch("/api/admin/gallery", { credentials: "include" }),
      fetch("/api/admin/hero-slides", { credentials: "include" }),
    ]);

    if (productsRes.ok) {
      const data = await productsRes.json();
      setProducts(data.products);
    }

    if (galleryRes.ok) {
      const data = await galleryRes.json();
      setGallery(
        (data.gallery ?? []).map((item: { id: string; title: string; imageUrl?: string; image_url?: string }) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl ?? item.image_url ?? "",
        })),
      );
    }

    if (heroRes.ok) {
      const data = await heroRes.json();
      setHeroSlides(
        (data.slides ?? []).map((item: { id: string; title: string; imageUrl?: string; image_url?: string }) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl ?? item.image_url ?? "",
          createdAt: new Date(),
        })),
      );
    }
  }

  async function onSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.price || !form.description) {
      showToast("error", lang === "id" ? "Mohon isi semua field wajib." : "Please fill all required fields.");
      return;
    }

    const images = form.images.split("\n").map((item) => item.trim()).filter(Boolean);
    if (images.length === 0) {
      showToast("error", lang === "id" ? "Tambahkan minimal satu gambar." : "Please add at least one image.");
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      images,
      shopeeUrl: form.shopeeUrl,
      soldOut: form.soldOut,
    };

    const endpoint = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = form.id ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      showToast("error", data.message ? `${lang === "id" ? "Gagal menyimpan produk" : "Failed to save product"}: ${data.message}` : (lang === "id" ? "Gagal menyimpan produk." : "Failed to save product."));
      return;
    }

    showToast("success", form.id ? (lang === "id" ? "Produk berhasil diperbarui." : "Product updated.") : (lang === "id" ? "Produk berhasil dibuat." : "Product created."));
    setForm(emptyProduct);
    await refresh();
  }

  async function uploadImage(file: File, folder: "products" | "gallery" | "hero") {
    setUploading("Uploading image...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setUploading(data.message ? `Upload failed: ${data.message}` : "Upload failed.");
      return null;
    }

    if (!data.url) {
      setUploading("Upload failed: missing URL.");
      return null;
    }

    setUploading("Upload complete.");
    return data.url as string;
  }

  async function onUploadProductImage() {
    if (!productImageFile) return;
    const url = await uploadImage(productImageFile, "products");
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      images: prev.images ? `${prev.images}\n${url}` : url,
    }));
    setProductImageFile(null);
  }

  async function onUploadGalleryImage() {
    if (!galleryImageFile) return;
    const url = await uploadImage(galleryImageFile, "gallery");
    if (!url) return;
    setGalleryForm((prev) => ({ ...prev, imageUrl: url }));
    setGalleryImageFile(null);
  }

  async function onUploadHeroImage() {
    if (!heroImageFile) return;
    const url = await uploadImage(heroImageFile, "hero");
    if (!url) return;
    setHeroForm((prev) => ({ ...prev, imageUrl: url }));
    setHeroImageFile(null);
  }

  function removeProductImage(url: string) {
    setForm((prev) => ({
      ...prev,
      images: prev.images
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item && item !== url)
        .join("\n"),
    }));
  }

  async function onDeleteProduct(id: string) {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      showToast("error", lang === "id" ? "Gagal menghapus produk." : "Failed to delete product.");
      return;
    }

    showToast("success", lang === "id" ? "Produk berhasil dihapus." : "Product deleted.");
    await refresh();
  }

  async function onSubmitGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const endpoint = galleryForm.id ? `/api/admin/gallery/${galleryForm.id}` : "/api/admin/gallery";
    const method = galleryForm.id ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: galleryForm.title, imageUrl: galleryForm.imageUrl }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast("error", data.message ? `${lang === "id" ? "Gagal menyimpan foto komunitas" : "Failed to save gallery image"}: ${data.message}` : (lang === "id" ? "Gagal menyimpan foto komunitas." : "Failed to save gallery image."));
      return;
    }

    showToast(
      "success",
      galleryForm.id
        ? (lang === "id" ? "Foto komunitas berhasil diperbarui." : "Gallery image updated.")
        : (lang === "id" ? "Foto komunitas berhasil ditambahkan." : "Gallery image added."),
    );
    setGalleryForm({ id: "", title: "", imageUrl: "" });
    await refresh();
  }

  async function onDeleteGallery(id: string) {
    const response = await fetch(`/api/admin/gallery/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast("error", data.message ? `${lang === "id" ? "Gagal menghapus foto komunitas" : "Failed to delete gallery image"}: ${data.message}` : (lang === "id" ? "Gagal menghapus foto komunitas." : "Failed to delete gallery image."));
      return;
    }

    showToast("success", lang === "id" ? "Foto komunitas berhasil dihapus." : "Gallery image deleted.");
    await refresh();
  }

  async function onSubmitHeroSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const endpoint = heroForm.id ? `/api/admin/hero-slides/${heroForm.id}` : "/api/admin/hero-slides";
    const method = heroForm.id ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: heroForm.title, imageUrl: heroForm.imageUrl }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast(
        "error",
        data.message
          ? `${lang === "id" ? "Gagal menyimpan slide" : "Failed to save slide"}: ${data.message}`
          : (lang === "id" ? "Gagal menyimpan slide." : "Failed to save slide."),
      );
      return;
    }

    showToast(
      "success",
      heroForm.id
        ? (lang === "id" ? "Slide berhasil diperbarui." : "Slide updated.")
        : (lang === "id" ? "Slide berhasil ditambahkan." : "Slide added."),
    );
    setHeroForm({ id: "", title: "", imageUrl: "" });
    await refresh();
  }

  async function onDeleteHeroSlide(id: string) {
    const response = await fetch(`/api/admin/hero-slides/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast(
        "error",
        data.message
          ? `${lang === "id" ? "Gagal menghapus slide" : "Failed to delete slide"}: ${data.message}`
          : (lang === "id" ? "Gagal menghapus slide." : "Failed to delete slide."),
      );
      return;
    }

    showToast("success", lang === "id" ? "Slide berhasil dihapus." : "Slide deleted.");
    await refresh();
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.type === "product") {
      await onDeleteProduct(deleteTarget.id);
    } else if (deleteTarget.type === "gallery") {
      await onDeleteGallery(deleteTarget.id);
    } else {
      await onDeleteHeroSlide(deleteTarget.id);
    }

    setDeleteTarget(null);
  }

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-clip md:space-y-8">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(0,0,0,0.1)] md:p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{text.quickOverview}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {overviewCards.map((card) => (
            <article key={card.label} className="rounded-xl border border-border bg-background p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{card.value}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(0,0,0,0.1)] md:p-5">
          <h2 className="font-display text-2xl uppercase text-foreground md:text-3xl">{text.productCms}</h2>
          <p className="mt-2 text-sm text-muted">{text.productCmsDesc}</p>

          <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmitProduct}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={text.productName} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder={text.priceIdr}
              type="number"
              min={0}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              required
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              value={form.shopeeUrl}
              onChange={(e) => setForm({ ...form, shopeeUrl: e.target.value })}
              placeholder={text.marketplaceUrl}
              type="url"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              required
            />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={text.description} className="min-h-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:col-span-2" required />

            <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:col-span-2">
              <input
                type="checkbox"
                checked={form.soldOut}
                onChange={(e) => setForm({ ...form, soldOut: e.target.checked })}
                className="h-4 w-4 accent-black"
              />
              {text.markSoldOut}
            </label>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">{text.images}</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background">
                  {text.chooseImage}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setProductImageFile(event.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                <span className="max-w-[220px] truncate text-xs text-muted">
                  {productImageFile ? productImageFile.name : text.noFileSelected}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
                  onClick={onUploadProductImage}
                  disabled={!productImageFile}
                >
                  {text.uploadImage}
                </button>
                <span className="text-xs text-muted">{uploading}</span>
              </div>
              <textarea
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder={text.imageUrls}
                className="mt-3 min-h-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                required
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {productImages.map((url) => (
                  <div key={url} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                    <Image src={url} alt="Product" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="truncate text-xs text-muted">{url}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
                      onClick={() => removeProductImage(url)}
                    >
                      {text.remove}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background" type="submit">
                {editing ? text.updateProduct : text.createProduct}
              </button>
              <button
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground hover:bg-foreground hover:text-background"
                type="button"
                onClick={() => setForm(emptyProduct)}
              >
                {text.reset}
              </button>
            </div>
          </form>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(0,0,0,0.1)] md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-2xl uppercase text-foreground">{text.currentProducts}</h3>
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder={text.searchProducts}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
            />
          </div>
          <div className="mt-4 grid max-h-[70vh] gap-3 overflow-auto pr-1">
            {filteredProducts.map((product) => (
              <article key={product.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="min-w-0 flex items-center gap-3">
                  <Image
                    src={product.images[0] ?? "/products/placeholder.svg"}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{product.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted sm:line-clamp-1">
                      {product.category} • Rp{product.price.toLocaleString("id-ID")} • {product.inStock ? text.inStock : text.soldOut}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
                    onClick={() =>
                      setForm({
                        id: product.id,
                        name: product.name,
                        price: String(product.price),
                        category: product.category,
                        description: product.description,
                        images: product.images.join("\n"),
                        shopeeUrl: product.shopeeUrl,
                        soldOut: !product.inStock,
                      })
                    }
                  >
                    {text.edit}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-red-400/60 px-3 py-1 text-xs uppercase tracking-widest text-red-300"
                    onClick={() =>
                      setDeleteTarget({
                        type: "product",
                        id: product.id,
                        label: product.name,
                      })
                    }
                  >
                    {text.delete}
                  </button>
                </div>
              </article>
            ))}
            {filteredProducts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                {text.noProducts}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(0,0,0,0.1)] md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl uppercase text-foreground md:text-3xl">{text.communityCms}</h2>
          <input
            value={gallerySearch}
            onChange={(e) => setGallerySearch(e.target.value)}
            placeholder={text.searchGallery}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
          />
        </div>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmitGallery}>
          <input value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} placeholder={text.galleryTitle} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <input value={galleryForm.imageUrl} onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })} placeholder={text.imageUrl} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <div className="flex flex-wrap items-center gap-2 md:col-span-2">
            <label className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background">
              {text.chooseImage}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setGalleryImageFile(event.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <span className="max-w-[220px] truncate text-xs text-muted">
              {galleryImageFile ? galleryImageFile.name : text.noFileSelected}
            </span>
            <button
              className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
              type="button"
              onClick={onUploadGalleryImage}
              disabled={!galleryImageFile}
            >
              {text.uploadImage}
            </button>
            <span className="text-xs text-muted">{uploading}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <button className="w-fit rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background" type="submit">
              {galleryForm.id ? text.updateImage : text.addImage}
            </button>
            {galleryForm.id ? (
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-foreground"
                onClick={() => setGalleryForm({ id: "", title: "", imageUrl: "" })}
              >
                {text.cancel}
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredGallery.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex items-center gap-3">
                <Image
                  src={item.imageUrl || "/products/placeholder.svg"}
                  alt={item.title}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{item.title}</p>
                  <p className="break-all text-xs text-muted">{item.imageUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground"
                  onClick={() =>
                    setGalleryForm({
                      id: item.id,
                      title: item.title,
                      imageUrl: item.imageUrl,
                    })
                  }
                >
                  {text.edit}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-400/60 px-3 py-1 text-xs uppercase tracking-widest text-red-300"
                  onClick={() =>
                    setDeleteTarget({
                      type: "gallery",
                      id: item.id,
                      label: item.title,
                    })
                  }
                >
                  {text.delete}
                </button>
              </div>
            </article>
          ))}
          {filteredGallery.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted md:col-span-2">
              {text.noGallery}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(0,0,0,0.1)] md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl uppercase text-foreground md:text-3xl">{text.heroCms}</h2>
          <input
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
            placeholder={text.searchHero}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
          />
        </div>

        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmitHeroSlide}>
          <input
            value={heroForm.title}
            onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
            placeholder={text.heroTitle}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            required
          />
          <input
            value={heroForm.imageUrl}
            onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
            placeholder={text.imageUrl}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            required
          />
          <div className="flex flex-wrap items-center gap-2 md:col-span-2">
            <label className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background">
              {text.chooseImage}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setHeroImageFile(event.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <span className="max-w-[220px] truncate text-xs text-muted">
              {heroImageFile ? heroImageFile.name : text.noFileSelected}
            </span>
            <button
              className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
              type="button"
              onClick={onUploadHeroImage}
              disabled={!heroImageFile}
            >
              {text.uploadImage}
            </button>
            <span className="text-xs text-muted">{uploading}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <button className="w-fit rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background" type="submit">
              {heroForm.id ? text.updateSlide : text.addSlide}
            </button>
            {heroForm.id ? (
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-foreground"
                onClick={() => setHeroForm({ id: "", title: "", imageUrl: "" })}
              >
                {text.cancel}
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredHeroSlides.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex items-center gap-3">
                <Image
                  src={item.imageUrl || "/products/placeholder.svg"}
                  alt={item.title}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{item.title}</p>
                  <p className="break-all text-xs text-muted">{item.imageUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground"
                  onClick={() =>
                    setHeroForm({
                      id: item.id,
                      title: item.title,
                      imageUrl: item.imageUrl,
                    })
                  }
                >
                  {text.edit}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-400/60 px-3 py-1 text-xs uppercase tracking-widest text-red-300"
                  onClick={() =>
                    setDeleteTarget({
                      type: "hero",
                      id: item.id,
                      label: item.title,
                    })
                  }
                >
                  {text.delete}
                </button>
              </div>
            </article>
          ))}
          {filteredHeroSlides.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted md:col-span-2">
              {text.noSlides}
            </p>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div
          className={`fixed right-4 top-4 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-[0_12px_28px_rgba(0,0,0,0.18)] ${toast.type === "success" ? "border-emerald-700/35 bg-emerald-100 text-emerald-900" : toast.type === "error" ? "border-red-700/35 bg-red-100 text-red-900" : "border-border bg-card text-foreground"}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[70] bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div
            className="mx-auto mt-[16vh] w-[92%] max-w-md rounded-xl border border-border bg-card p-5 shadow-[0_20px_48px_rgba(0,0,0,0.4)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{text.confirmDelete}</p>
            <p className="mt-2 text-sm text-foreground">
              {lang === "id" ? "Hapus" : "Delete"}{" "}
              {deleteTarget.type === "product"
                ? text.deleteProductLabel
                : deleteTarget.type === "gallery"
                  ? text.deleteGalleryLabel
                  : text.deleteHeroLabel}{" "}
              <strong>{deleteTarget.label}</strong>?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-foreground"
                onClick={() => setDeleteTarget(null)}
              >
                {text.cancel}
              </button>
              <button
                type="button"
                className="rounded-full border border-red-700/40 bg-red-100 px-4 py-2 text-xs uppercase tracking-[0.14em] text-red-900"
                onClick={onConfirmDelete}
              >
                {text.yesDelete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
