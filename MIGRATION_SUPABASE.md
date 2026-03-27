# Panduan Migrasi Supabase

## Perubahan yang telah dilakukan:

### 1. **Dependencies**
   - ✅ Dihapus: `@prisma/client`, `prisma`
   - ✅ Ditambah: `@supabase/supabase-js@^2.48.0`

### 2. **File Konfigurasi**
   - ✅ Dibuat: `src/lib/supabase.ts` - Client Supabase
   - ✅ Dihapus: `src/lib/prisma.ts` - Konfigurasi Prisma

### 3. **Library Data**
   - ✅ Updated: `src/lib/data.ts` - Semua query sekarang menggunakan Supabase

### 4. **API Routes**
   - ✅ Updated: `src/app/api/admin/products/route.ts` (GET, POST)
   - ✅ Updated: `src/app/api/admin/products/[id]/route.ts` (PATCH, DELETE)
   - ✅ Updated: `src/app/api/admin/gallery/route.ts` (GET, POST)
   - ✅ Updated: `src/app/api/admin/gallery/[id]/route.ts` (DELETE)
   - ✅ No changes: `src/app/api/admin/login/route.ts` - Auth masih menggunakan JWT custom
   - ✅ No changes: `src/app/api/admin/logout/route.ts` - Tidak berubah

## Setup Supabase

### Step 1: Buat Tabel di Supabase

```sql
-- Products Table
CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  shopee_url TEXT NOT NULL,
  category TEXT DEFAULT 'Tops',
  created_at TIMESTAMP DEFAULT now()
);

-- Gallery Images Table
CREATE TABLE gallery_images (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Blog Posts Table (jika diperlukan)
CREATE TABLE blog_posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMP DEFAULT now()
);
```

### Step 2: Environment Variables

Set di `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=lucentrezn123
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Migrasi Data (jika ada)

Jika Anda memiliki data di database lama, Anda bisa:
1. Export dari database lama
2. Transform ke format Supabase
3. Import ke Supabase

## Catatan Penting

### Perubahan Field Names
Supabase menggunakan snake_case, sedangkan kode menggunakan camelCase. Mapping:
- `createdAt` → `created_at`
- `imageUrl` → `image_url`
- `shopeeUrl` → `shopee_url`

### Authentication
- **Admin Auth**: Masih menggunakan sistem custom JWT dengan env variables
- Anda bisa mengganti dengan Supabase Auth jika ingin

### Error Handling
- Supabase mengembalikan `{ data, error }` format
- Semua API routes sudah menangani error dengan baik

## Testing

```bash
# Development
npm run dev

# Build
npm run build
```

## Selesai!
Aplikasi Anda sekarang menggunakan Supabase sebagai database utama.
