"use client";

import { FormEvent, useMemo, useState } from "react";
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

const emptyProduct = {
  id: "",
  name: "",
  price: "",
  category: "Tops",
  description: "",
  images: "",
  shopeeUrl: "https://shopee.co.id/",
};

export function AdminPanel({ initialProducts, initialGallery }: AdminPanelProps) {
  const [products, setProducts] = useState(initialProducts);
  const [gallery, setGallery] = useState(initialGallery);
  const [form, setForm] = useState(emptyProduct);
  const [galleryForm, setGalleryForm] = useState({ title: "", imageUrl: "" });
  const [status, setStatus] = useState("");

  const editing = useMemo(() => products.find((product) => product.id === form.id), [form.id, products]);

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
      setGallery(data.gallery);
    }
  }

  async function onSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving product...");

    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      images: form.images.split("\n").map((item) => item.trim()).filter(Boolean),
      shopeeUrl: form.shopeeUrl,
    };

    const endpoint = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = form.id ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      setStatus("Failed to save product.");
      return;
    }

    setStatus(form.id ? "Product updated." : "Product created.");
    setForm(emptyProduct);
    await refresh();
  }

  async function onDeleteProduct(id: string) {
    setStatus("Deleting product...");
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      setStatus("Failed to delete product.");
      return;
    }

    setStatus("Product deleted.");
    await refresh();
  }

  async function onSubmitGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving gallery image...");

    const response = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(galleryForm),
      credentials: "include",
    });

    if (!response.ok) {
      setStatus("Failed to save gallery image.");
      return;
    }

    setStatus("Gallery image added.");
    setGalleryForm({ title: "", imageUrl: "" });
    await refresh();
  }

  async function onDeleteGallery(id: string) {
    setStatus("Deleting gallery image...");

    const response = await fetch(`/api/admin/gallery/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      setStatus("Failed to delete gallery image.");
      return;
    }

    setStatus("Gallery image deleted.");
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
        <h2 className="font-display text-3xl uppercase text-foreground">Product CMS</h2>
        <p className="mt-2 text-sm text-muted">Create or update catalog products and marketplace links.</p>

        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={onSubmitProduct}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price in IDR" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <input value={form.shopeeUrl} onChange={(e) => setForm({ ...form, shopeeUrl: e.target.value })} placeholder="marketplace URL" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:col-span-2" required />
          <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="Image URLs (one per line)" className="min-h-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:col-span-2" required />
          <div className="flex gap-3 md:col-span-2">
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
        <h3 className="font-display text-2xl uppercase text-foreground">Current Products</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="rounded-xl border border-border p-4">
              <p className="font-semibold text-foreground">{product.name}</p>
              <p className="mt-1 text-xs text-muted">{product.category} • Rp{product.price.toLocaleString("id-ID")}</p>
              <div className="mt-3 flex gap-2">
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
                    })
                  }
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-400/60 px-3 py-1 text-xs uppercase tracking-widest text-red-300"
                  onClick={() => onDeleteProduct(product.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
        <h2 className="font-display text-3xl uppercase text-foreground">Gallery CMS</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmitGallery}>
          <input value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} placeholder="Gallery title" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <input value={galleryForm.imageUrl} onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })} placeholder="Image URL" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" required />
          <button className="w-fit rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background" type="submit">
            Add Image
          </button>
        </form>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {gallery.map((item) => (
            <article key={item.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted">{item.imageUrl}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-red-400/60 px-3 py-1 text-xs uppercase tracking-widest text-red-300"
                onClick={() => onDeleteGallery(item.id)}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      </div>

      <p className="text-sm text-foreground">{status}</p>
    </div>
  );
}
