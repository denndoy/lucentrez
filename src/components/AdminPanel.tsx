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
  initialContactSettings: { whatsappNumber: string; instagramUrl: string };
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

type UploadTarget = "product" | "gallery" | "hero";

type UploadStatusState = Record<UploadTarget, string>;

type ApiFieldError = {
  path?: Array<string | number>;
  message?: string;
};

const emptyProduct = {
  id: "",
  name: "",
  price: "",
  category: "Tops",
  description: "",
  images: "",
  hoverImage: "",
  shopeeUrl: "https://shopee.co.id/",
  soldOut: false,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasValidUuidId<T extends { id: string }>(item: T) {
  return UUID_RE.test(item.id);
}

function buildAutoTitle(fileName: string, prefix: string) {
  const stem = fileName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, " ").replace(/\s+/g, " ").trim();
  const readable = stem || prefix;
  return `${prefix} ${readable} ${Date.now().toString().slice(-4)}`;
}

function UploadPreview({ src, alt, fileName }: { src: string; alt: string; fileName: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="relative aspect-[4/3] w-full bg-black/5">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
      <p className="break-all px-3 py-2 text-xs text-muted">{fileName}</p>
    </div>
  );
}

function formatApiErrors(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";

  const errors = (payload as { errors?: unknown }).errors;
  if (!Array.isArray(errors) || errors.length === 0) return "";

  return errors
    .map((item) => {
      const error = item as ApiFieldError;
      const field = Array.isArray(error.path) && error.path.length > 0 ? error.path.join(".") : "";
      const message = error.message ?? "Invalid value.";
      return field ? `${field}: ${message}` : message;
    })
    .filter(Boolean)
    .join("; ");
}

export function AdminPanel({ initialProducts, initialGallery, initialHeroSlides, initialContactSettings, lang }: AdminPanelProps) {
  const [products, setProducts] = useState(() => initialProducts.filter(hasValidUuidId));
  const [gallery, setGallery] = useState(() => initialGallery.filter(hasValidUuidId));
  const [heroSlides, setHeroSlides] = useState(() => initialHeroSlides.filter(hasValidUuidId));
  const [contactSettings, setContactSettings] = useState(initialContactSettings);
  const [form, setForm] = useState(emptyProduct);
  const [galleryForm, setGalleryForm] = useState({ id: "", title: "", imageUrl: "" });
  const [heroForm, setHeroForm] = useState({ id: "", title: "", imageUrl: "" });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [gallerySearch, setGallerySearch] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState("");
  const [hoverPreviewUrl, setHoverPreviewUrl] = useState("");
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState("");
  const [heroPreviewUrl, setHeroPreviewUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatusState>({
    product: "",
    gallery: "",
    hero: "",
  });
  const [formErrors, setFormErrors] = useState({
    product: "",
    gallery: "",
    hero: "",
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!productImageFile) {
      setProductPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(productImageFile);
    setProductPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [productImageFile]);

  useEffect(() => {
    if (!hoverImageFile) {
      setHoverPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(hoverImageFile);
    setHoverPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [hoverImageFile]);

  useEffect(() => {
    if (!galleryImageFile) {
      setGalleryPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(galleryImageFile);
    setGalleryPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [galleryImageFile]);

  useEffect(() => {
    if (!heroImageFile) {
      setHeroPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(heroImageFile);
    setHeroPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [heroImageFile]);

  function showToast(type: ToastState["type"], message: string) {
    setToast({ type, message });
  }

  function setUploadStatusMessage(target: UploadTarget, message: string) {
    setUploadStatus((prev) => ({
      ...prev,
      [target]: message,
    }));
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
        hoverImage: "Gambar Hover (opsional)",
        hoverImageDesc: "Gambar yang tampil saat produk di-hover di katalog",
        chooseImage: "Pilih Gambar",
        noFileSelected: "Belum ada file",
        uploadImage: "Upload Gambar",
        addImageAction: "Add Image",
        addSlideAction: "Add Slide",
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
        addImage: "Tambah Gambar",
        updateImage: "Ubah Gambar",
        addSlide: "Upload Image",
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
        contactSettings: "Pengaturan Kontak",
        contactSettingsDesc: "Atur nomor WhatsApp dan link Instagram untuk halaman kontak.",
        whatsappNumber: "Nomor WhatsApp",
        whatsappNumberDesc: "Format: 628xxx (tanpa tanda + atau spasi)",
        instagramUrl: "Link Instagram",
        updateContactSettings: "Simpan Pengaturan",
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
        hoverImage: "Hover Image (optional)",
        hoverImageDesc: "Image shown when product is hovered in catalog",
        chooseImage: "Choose Image",
        noFileSelected: "No file selected",
        uploadImage: "Upload Image",
        addImageAction: "Add Image",
        addSlideAction: "Add Slide",
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
        addImage: "Add Image",
        updateImage: "Update Image",
        addSlide: "Upload Image",
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
        contactSettings: "Contact Settings",
        contactSettingsDesc: "Set WhatsApp number and Instagram link for the contact page.",
        whatsappNumber: "WhatsApp Number",
        whatsappNumberDesc: "Format: 628xxx (without + or spaces)",
        instagramUrl: "Instagram Link",
        updateContactSettings: "Save Settings",
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

  function moveProductImage(fromIndex: number, toIndex: number) {
    const newImages = [...productImages];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setForm((prev) => ({
      ...prev,
      images: newImages.join("\n"),
    }));
  }
  const productNameValid = form.name.trim().length >= 2;
  const productDescriptionValid = form.description.trim().length >= 10;
  const productPrice = Number(form.price);
  const productUrlValid = (() => {
    try {
      new URL(form.shopeeUrl.trim());
      return true;
    } catch {
      return false;
    }
  })();
  const canSubmitProduct = Boolean(
    productNameValid &&
      Number.isFinite(productPrice) &&
      productPrice > 0 &&
      productDescriptionValid &&
      productImages.length > 0 &&
      productUrlValid,
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
    if (!canSubmitProduct) {
      showToast("error", lang === "id" ? "Mohon isi semua field wajib." : "Please fill all required fields.");
      return;
    }

    const images = productImages;

    const payload = {
      name: form.name.trim(),
      price: productPrice,
      category: form.category,
      description: form.description.trim(),
      images,
      hoverImage: form.hoverImage.trim() || null,
      shopeeUrl: form.shopeeUrl.trim(),
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

  async function uploadImage(file: File, folder: "products" | "gallery" | "hero", target: UploadTarget) {
    setUploadStatusMessage(target, lang === "id" ? "Mengupload gambar..." : "Uploading image...");
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
      setUploadStatusMessage(target, data.message ? `${lang === "id" ? "Upload gagal" : "Upload failed"}: ${data.message}` : (lang === "id" ? "Upload gagal." : "Upload failed."));
      return null;
    }

    if (!data.url) {
      setUploadStatusMessage(target, lang === "id" ? "Upload gagal: URL tidak tersedia." : "Upload failed: missing URL.");
      return null;
    }

    setUploadStatusMessage(target, lang === "id" ? "Upload selesai." : "Upload complete.");
    return data.url as string;
  }

  async function onUploadProductImage() {
    if (!productImageFile) return;
    const url = await uploadImage(productImageFile, "products", "product");
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      images: prev.images ? `${prev.images}\n${url}` : url,
    }));
    setProductImageFile(null);
  }

  async function onUploadHoverImage() {
    if (!hoverImageFile) return;
    const url = await uploadImage(hoverImageFile, "products", "product");
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      hoverImage: url,
    }));
    setHoverImageFile(null);
  }

  async function onUploadGalleryImage() {
    if (!galleryImageFile) return;
    const fileName = galleryImageFile.name;
    const url = await uploadImage(galleryImageFile, "gallery", "gallery");
    if (!url) return;
    setGalleryForm((prev) => ({
      ...prev,
      title: prev.title || buildAutoTitle(fileName, "Gallery"),
      imageUrl: url,
    }));
    setGalleryImageFile(null);
  }

  async function onUploadHeroImage() {
    if (!heroImageFile) return;
    const fileName = heroImageFile.name;
    const url = await uploadImage(heroImageFile, "hero", "hero");
    if (!url) return;
    setHeroForm((prev) => ({
      ...prev,
      title: prev.title || buildAutoTitle(fileName, "Slide"),
      imageUrl: url,
    }));
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

  async function onSaveContactSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/admin/contact-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whatsappNumber: contactSettings.whatsappNumber,
        instagramUrl: contactSettings.instagramUrl,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast("error", data.message ? `${lang === "id" ? "Gagal menyimpan pengaturan" : "Failed to save settings"}: ${data.message}` : (lang === "id" ? "Gagal menyimpan pengaturan." : "Failed to save settings."));
      return;
    }

    showToast("success", lang === "id" ? "Pengaturan kontak berhasil disimpan." : "Contact settings saved.");
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
              <div className="rounded-2xl border border-border bg-background p-3">
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
                </div>
                <div className="mt-2 text-xs text-muted">{uploadStatus.product}</div>
              </div>
              {productPreviewUrl ? (
                <div className="mt-3">
                  <UploadPreview
                    src={productPreviewUrl}
                    alt={productImageFile?.name || "Product preview"}
                    fileName={productImageFile?.name || "Product preview"}
                  />
                </div>
              ) : null}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {productImages.map((url, index) => (
                  <div key={url} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-2">
                    <div className="flex items-center gap-2">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                        <Image src={url} alt="Product" fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                          {index === 0 ? (lang === "id" ? "Gambar Utama" : "Main Image") : `${lang === "id" ? "Gambar" : "Image"} ${index + 1}`}
                        </p>
                        <p className="truncate text-xs text-muted">{url.split("/").pop()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          className="rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted hover:bg-foreground hover:text-background"
                          onClick={() => moveProductImage(index, index - 1)}
                        >
                          {lang === "id" ? "Geser Kiri" : "Move Left"}
                        </button>
                      )}
                      {index < productImages.length - 1 && (
                        <button
                          type="button"
                          className="rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted hover:bg-foreground hover:text-background"
                          onClick={() => moveProductImage(index, index + 1)}
                        >
                          {lang === "id" ? "Geser Kanan" : "Move Right"}
                        </button>
                      )}
                      {index > 0 && (
                        <button
                          type="button"
                          className="rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted hover:bg-foreground hover:text-background"
                          onClick={() => moveProductImage(index, 0)}
                        >
                          {lang === "id" ? "Jadikan Utama" : "Set as Main"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded border border-red-400/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-100"
                        onClick={() => removeProductImage(url)}
                      >
                        {text.remove}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {productImages.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted">
                  {lang === "id"
                    ? "Belum ada gambar. Upload minimal satu foto produk."
                    : "No images yet. Upload at least one product photo."}
                </p>
              ) : null}

              {/* Gallery Preview */}
              {productImages.length > 0 && (
                <div className="mt-4 rounded-xl border border-border bg-black/5 p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">
                    {lang === "id" ? "Preview Gallery" : "Gallery Preview"}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {productImages.map((url, index) => (
                      <div
                        key={url}
                        className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2 ${
                          index === 0 ? "border-white" : "border-transparent"
                        }`}
                      >
                        <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" sizes="56px" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">{text.hoverImage}</label>
              <p className="mb-2 text-xs text-muted">{text.hoverImageDesc}</p>
              <div className="rounded-2xl border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background">
                    {text.chooseImage}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setHoverImageFile(event.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                  <span className="max-w-[220px] truncate text-xs text-muted">
                    {hoverImageFile ? hoverImageFile.name : text.noFileSelected}
                  </span>
                  <button
                    type="button"
                    className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
                    onClick={onUploadHoverImage}
                    disabled={!hoverImageFile}
                  >
                    {text.uploadImage}
                  </button>
                </div>
              </div>
              {hoverPreviewUrl ? (
                <div className="mt-3">
                  <UploadPreview
                    src={hoverPreviewUrl}
                    alt={hoverImageFile?.name || "Hover preview"}
                    fileName={hoverImageFile?.name || "Hover preview"}
                  />
                </div>
              ) : null}
              {form.hoverImage ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                  <Image src={form.hoverImage} alt="Hover preview" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                  <p className="flex-1 truncate text-xs text-muted">{form.hoverImage}</p>
                  <button
                    type="button"
                    className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
                    onClick={() => setForm({ ...form, hoverImage: "" })}
                  >
                    {text.remove}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border-t border-border pt-4 md:col-span-2">
              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background disabled:cursor-not-allowed disabled:opacity-50"
                  type="submit"
                  disabled={!canSubmitProduct}
                >
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
            </div>
            {formErrors.product ? (
              <p className="md:col-span-2 rounded-lg border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-900">
                {formErrors.product}
              </p>
            ) : null}
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
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                    <Image
                      src={product.images[0] ?? "/products/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
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
                        hoverImage: product.hoverImage ?? "",
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
          <div className="md:col-span-2 rounded-2xl border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
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
                {text.addImageAction}
              </button>
            </div>
            <div className="mt-2 text-xs text-muted">{uploadStatus.gallery}</div>
          </div>
          {galleryPreviewUrl ? (
            <div className="md:col-span-2">
              <UploadPreview
                src={galleryPreviewUrl}
                alt={galleryImageFile?.name || "Gallery preview"}
                fileName={galleryImageFile?.name || "Gallery preview"}
              />
            </div>
          ) : null}
          <div className="border-t border-border pt-4 md:col-span-2">
            <div className="flex items-center gap-2">
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
          </div>
          {formErrors.gallery ? (
            <p className="md:col-span-2 rounded-lg border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-900">
              {formErrors.gallery}
            </p>
          ) : null}
        </form>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredGallery.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <Image
                    src={item.imageUrl || "/products/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
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
          <div className="md:col-span-2 rounded-2xl border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
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
                {text.addSlideAction}
              </button>
            </div>
            <div className="mt-2 text-xs text-muted">{uploadStatus.hero}</div>
          </div>
          {heroPreviewUrl ? (
            <div className="md:col-span-2">
              <UploadPreview
                src={heroPreviewUrl}
                alt={heroImageFile?.name || "Hero preview"}
                fileName={heroImageFile?.name || "Hero preview"}
              />
            </div>
          ) : null}
          <div className="border-t border-border pt-4 md:col-span-2">
            <div className="flex items-center gap-2">
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
          </div>
          {formErrors.hero ? (
            <p className="md:col-span-2 rounded-lg border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-900">
              {formErrors.hero}
            </p>
          ) : null}
        </form>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredHeroSlides.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <Image
                    src={item.imageUrl || "/products/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
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

      {/* Contact Settings Section */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(0,0,0,0.1)] md:p-5">
        <h2 className="font-display text-2xl uppercase text-foreground md:text-3xl">{text.contactSettings}</h2>
        <p className="mt-2 text-sm text-muted">{text.contactSettingsDesc}</p>

        <form className="mt-5 grid gap-3" onSubmit={onSaveContactSettings}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">{text.whatsappNumber}</label>
            <input
              value={contactSettings.whatsappNumber}
              onChange={(e) => setContactSettings({ ...contactSettings, whatsappNumber: e.target.value })}
              placeholder="6281234567890"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              required
            />
            <p className="mt-1 text-xs text-muted">{text.whatsappNumberDesc}</p>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">{text.instagramUrl}</label>
            <input
              value={contactSettings.instagramUrl}
              onChange={(e) => setContactSettings({ ...contactSettings, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/lucentrez"
              type="url"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              required
            />
          </div>

          <div className="border-t border-border pt-4">
            <button
              type="submit"
              className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background"
            >
              {text.updateContactSettings}
            </button>
          </div>
        </form>
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
