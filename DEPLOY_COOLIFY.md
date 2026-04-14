# Deploy ke Coolify dengan Docker

## Persiapan

### 1. Setup Supabase

Buka **Supabase Dashboard** → **Project Settings** → **API** dan salin:

- `NEXT_PUBLIC_SUPABASE_URL` → URL Project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role secret (PENTING!)

### 2. Generate Admin Secret

Jalankan di terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy hasilnya sebagai `ADMIN_SECRET`.

### 3. Set Environment Variables

Di Coolify, tambahkan environment variables berikut:

```bash
# Supabase (Wajib)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_anon_xxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URL (ganti dengan domain production)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Admin Auth (ganti password kuat!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password-here
ADMIN_SECRET=hasil-dari-crypto-di-atas

# Storage (opsional)
SUPABASE_STORAGE_BUCKET=media
```

## Setup Coolify

### 1. Buat Project Baru

1. Login ke Coolify
2. Klik **New Project**
3. Pilih **Dockerfile** deployment method
4. Pilih repository GitHub/GitLab

### 2. Configure Deployment

**Branch:** `main`

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start
```

**Health Check Path:** `/`

**Environment Variables:**
Masukkan semua variables dari bagian "Persiapan" di atas.

### 3. Configure Coolify Environment Variables

Di Coolify Dashboard → Project → Service → **Environment Variables**, tambahkan:

| Variable Name | Value | Secret |
|--------------|-------|---------|
| NEXT_PUBLIC_SUPABASE_URL | https://your-project.supabase.co | No |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | sb_anon_xxx... | No |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbG... | **Yes** |
| NEXT_PUBLIC_SITE_URL | https://your-domain.com | No |
| ADMIN_USERNAME | admin | No |
| ADMIN_PASSWORD | strong-password | **Yes** |
| ADMIN_SECRET | hex-value | **Yes** |

**Mark as Secret** untuk:
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD
- ADMIN_SECRET

### 4. Configure Domain

1. Pada tab **Domain**:
   - Tambahkan domain: `lucentrez.com` atau subdomain
   - Pilih **HTTPS** dengan Let's Encrypt (otomatis)

2. Jika ada custom domain:
   - Tambahkan A record di DNS:
     ```
     Type: A
     Name: @ (atau subdomain)
     Value: <Coolify-Server-IP>
     TTL: 300
     ```

### 5. Build & Deploy

Klik **Deploy** → Coolify akan:
- Clone repository
- Build Docker image
- Start container dengan port 3000
- Setup reverse proxy + SSL

## Troubleshooting

### Build Gagal

**Error: "Module not found"**
```bash
# Pastikan node_modules dihapus saat build
# Dockerfile sudah handle ini dengan npm ci
```

**Error: "NEXT_PUBLIC_ variables not defined"**
- Pastikan semua `NEXT_PUBLIC_*` variables ada di Coolify Environment Variables
- Re-build setelah menambah environment variables

### Runtime Error

**Error: "Supabase connection failed"**
- Cek `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Pastikan project URL dan key valid dari Supabase Dashboard

**Error: "Unauthorized" di Admin Panel**
- Pastikan `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `ADMIN_SECRET` sudah diset
- `ADMIN_SECRET` harus sama dengan yang di development

**Error: RLS Policy blocked**
- Jalankan migration SQL di Supabase SQL Editor:
  ```bash
  # File: supabase/add-contact-settings.sql
  # File: supabase/grants-permissions.sql
  # File: supabase/rls-production.sql
  ```

### Cek Logs

Di Coolify Dashboard:
- **Service** → **Logs** tab
- Lihat error build atau runtime

### Database Migration

Setelah deploy, jalankan SQL berikut di **Supabase SQL Editor**:

1. `supabase/schema.sql` (tabel utama)
2. `supabase/add-contact-settings.sql` (contact settings)
3. `supabase/grants-permissions.sql` (permissions)
4. `supabase/rls-production.sql` (security policies)

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` marked as Secret
- [ ] `ADMIN_PASSWORD` kuat (16+ karakter)
- [ ] `ADMIN_SECRET` random hex (dari crypto)
- [ ] HTTPS enabled di Coolify
- [ ] RLS policies applied di Supabase
- [ ] .env tidak dicommit ke Git
- [ ] Database backup aktif di Supabase

## Post-Deployment Testing

1. **Buka homepage** → Cek layout dan font
2. **Buka /catalog** → Cek product card hover
3. **Buka /contact** → Cek WhatsApp & Instagram
4. **Buka /admin** → Login dengan credentials
5. **Test image upload** di admin panel
6. **Test contact settings** update
7. **Cek Console browser** untuk error

## Monitoring

Di Coolify:
- **Resources** tab → CPU/Memory usage
- **Logs** tab → Real-time logs
- **Deployments** tab → Deployment history

Di Supabase:
- **Database** tab → Query statistics
- **Storage** tab → File usage
- **Logs** tab → Authentication & API logs
