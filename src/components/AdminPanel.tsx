"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ProductView } from "@/lib/types";

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
};

type AdminPanelProps = {
  initialProducts: ProductView[];
  initialGallery: GalleryItem[];
};

type ToastState = {
  type: "success" | "error" | "info";
  message: string;
};

type DeleteTarget = {
  type: "product" | "gallery";
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

export function AdminPanel({ initialProducts, initialGallery }: AdminPanelProps) {
  const [products, setProducts] = useState(initialProducts);
  const [gallery, setGallery] = useState(initialGallery);
  const [form, setForm] = useState(emptyProduct);
  const [galleryForm, setGalleryForm] = useState({ title: "", imageUrl: "" });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [gallerySearch, setGallerySearch] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(type: ToastState["type"], message: string) {
    setToast({ type, message });
  }

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

  async function refresh() {
    const [productsRes, galleryRes] = await Promise.all([
      fetch("/api/admin/products", { credentials: "include" }),
      fetch("/api/admin/gallery", { credentials: "include" }),
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
  }

  async function onSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.price || !form.description) {
      showToast("error", "Please fill all required fields.");
      return;
    }

    const images = form.images.split("\n").map((item) => item.trim()).filter(Boolean);
    if (images.length === 0) {
      showToast("error", "Please add at least one image.");
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
      showToast("error", data.message ? `Failed to save product: ${data.message}` : "Failed to save product.");
      return;
    }

    showToast("success", form.id ? "Product updated." : "Product created.");
    setForm(emptyProduct);
    await refresh();
  }

  async function uploadImage(file: File, folder: "products" | "gallery") {
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
      showToast("error", "Failed to delete product.");
      return;
    }

    showToast("success", "Product deleted.");
    await refresh();
  }

  async function onSubmitGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(galleryForm),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast("error", data.message ? `Failed to save gallery image: ${data.message}` : "Failed to save gallery image.");
      return;
    }

    showToast("success", "Gallery image added.");
    setGalleryForm({ title: "", imageUrl: "" });
    await refresh();
  }

  async function onDeleteGallery(id: string) {
    const response = await fetch(`/api/admin/gallery/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast("error", data.message ? `Failed to delete gallery image: ${data.message}` : "Failed to delete gallery image.");
      return;
    }

    showToast("success", "Gallery image deleted.");
    await refresh();
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.type === "product") {
      await onDeleteProduct(deleteTarget.id);
    } else {
      await onDeleteGallery(deleteTarget.id);
    }

    setDeleteTarget(null);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
          <h2 className="font-display text-3xl uppercase text-foreground">Product CMS</h2>
          <p className="mt-2 text-sm text-muted">Create or update catalog products and marketplace links.</p>

          <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmitProduct}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price in IDR"
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
              placeholder="marketplace URL"
              type="url"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              required
            />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:col-span-2" required />

            <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:col-span-2">
              <input
                type="checkbox"
                checked={form.soldOut}
                onChange={(e) => setForm({ ...form, soldOut: e.target.checked })}
                className="h-4 w-4 accent-black"
              />
              Mark as sold out
            </label>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">Images</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setProductImageFile(event.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                <span className="max-w-[220px] truncate text-xs text-muted">
                  {productImageFile ? productImageFile.name : "No file selected"}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
                  onClick={onUploadProductImage}
                  disabled={!productImageFile}
                >
                  Upload Image
                </button>
                <span className="text-xs text-muted">{uploading}</span>
              </div>
              <textarea
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="Image URLs (one per line)"
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
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background" type="submit">
                {editing ? "Update Product" : "Create Product"}
              </button>
              <button
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground hover:bg-foreground hover:text-background"
                type="button"
                onClick={() => setForm(emptyProduct)}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-2xl uppercase text-foreground">Current Products</h3>
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products"
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
            />
          </div>
          <div className="mt-4 grid gap-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={product.images[0] ?? "/products/placeholder.svg"}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg border border-border object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {product.category} • Rp{product.price.toLocaleString("id-ID")} • {product.inStock ? "In Stock" : "Sold Out"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
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
                    Edit
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
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-3xl uppercase text-foreground">Community CMS</h2>
          <input
            value={gallerySearch}
            onChange={(e) => setGallerySearch(e.target.value)}
            placeholder="Search gallery"
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
          />
        </div>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmitGallery}>
          <input value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} placeholder="Gallery title" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <input value={galleryForm.imageUrl} onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })} placeholder="Image URL" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <div className="flex flex-wrap items-center gap-2 md:col-span-2">
            <label className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setGalleryImageFile(event.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <span className="max-w-[220px] truncate text-xs text-muted">
              {galleryImageFile ? galleryImageFile.name : "No file selected"}
            </span>
            <button
              className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
              type="button"
              onClick={onUploadGalleryImage}
              disabled={!galleryImageFile}
            >
              Upload Image
            </button>
            <span className="text-xs text-muted">{uploading}</span>
          </div>
          <button className="w-fit rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background" type="submit">
            Add Image
          </button>
        </form>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredGallery.map((item) => (
            <article key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <Image
                  src={item.imageUrl || "/products/placeholder.svg"}
                  alt={item.title}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg border border-border object-cover"
                />
                <div>
                  <p className="text-sm text-foreground">{item.title}</p>
                  <p className="text-xs text-muted">{item.imageUrl}</p>
                </div>
              </div>
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
                Delete
              </button>
            </article>
          ))}
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
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Confirm Delete</p>
            <p className="mt-2 text-sm text-foreground">
              Delete {deleteTarget.type === "product" ? "product" : "gallery image"} <strong>{deleteTarget.label}</strong>?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-foreground"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full border border-red-700/40 bg-red-100 px-4 py-2 text-xs uppercase tracking-[0.14em] text-red-900"
                onClick={onConfirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
