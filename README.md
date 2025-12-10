# Aplikasi Jurnal Kokurikuler

Aplikasi web untuk mengelola jurnal kegiatan kokurikuler dengan backend API dan database SQLite.

## Fitur

- ✅ Manajemen data Guru, Sekolah, Siswa, dan Jurnal
- ✅ Penyimpanan data di database server (SQLite)
- ✅ Backup dan Restore data
- ✅ Print/Export jurnal
- ✅ Responsive design

## Teknologi

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite

## Instalasi Lokal

### Prasyarat
- Node.js (v14 atau lebih baru)
- npm atau yarn

### Langkah Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan server:
```bash
npm start
```

3. Buka browser dan akses:
```
http://localhost:3000
```

Untuk development dengan auto-reload:
```bash
npm run dev
```

## Deployment (Hosting)

Aplikasi ini dapat di-deploy ke berbagai platform hosting. Berikut beberapa opsi:

### 1. Render.com (Recommended - Gratis)

**Langkah-langkah:**

1. Buat akun di [Render.com](https://render.com)
2. Klik "New +" → "Web Service"
3. Connect repository GitHub/GitLab Anda atau deploy dari public Git repository
4. Konfigurasi:
   - **Name**: jurnal-kokurikuler
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (atau pilih sesuai kebutuhan)

5. Render akan otomatis menggunakan `render.yaml` yang sudah disediakan
6. Setelah deploy selesai, aplikasi akan tersedia di URL yang diberikan Render

**Catatan**: Database SQLite akan tersimpan di persistent disk pada plan gratis Render.

### 2. Railway.app (Recommended - Gratis dengan batasan)

**Langkah-langkah:**

1. Buat akun di [Railway.app](https://railway.app)
2. Klik "New Project" → "Deploy from GitHub repo"
3. Pilih repository Anda
4. Railway akan otomatis detect Node.js dan menjalankan `npm start`
5. Setelah deploy, aplikasi akan tersedia di URL yang diberikan Railway

**Catatan**: Railway menyediakan persistent storage untuk database.

### 3. Vercel (Untuk Frontend + Serverless Functions)

**Langkah-langkah:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Ikuti instruksi di terminal

**Catatan**: Vercel menggunakan serverless functions. File `vercel.json` sudah dikonfigurasi untuk ini.

### 4. Heroku

**Langkah-langkah:**

1. Install Heroku CLI
2. Login:
```bash
heroku login
```

3. Create app:
```bash
heroku create jurnal-kokurikuler
```

4. Deploy:
```bash
git push heroku main
```

5. Buka aplikasi:
```bash
heroku open
```

### 5. DigitalOcean App Platform

**Langkah-langkah:**

1. Buat akun di [DigitalOcean](https://www.digitalocean.com)
2. Klik "Create" → "Apps"
3. Connect GitHub repository
4. Pilih branch dan folder
5. Konfigurasi:
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
6. Deploy

### 6. VPS (Ubuntu/Debian)

Jika Anda memiliki VPS sendiri:

1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Clone repository:
```bash
git clone <your-repo-url>
cd JUKO
```

3. Install dependencies:
```bash
npm install
```

4. Install PM2 (process manager):
```bash
sudo npm install -g pm2
```

5. Start aplikasi dengan PM2:
```bash
pm2 start server.js --name jurnal-kokurikuler
pm2 save
pm2 startup
```

6. Setup Nginx sebagai reverse proxy (opsional):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Struktur Database

Data disimpan dalam tabel `jurnal_data` dengan struktur:
- `id`: Unique identifier
- `type`: Tipe data (user, sekolah, siswa, jurnal)
- `timestamp`: Timestamp data
- `data`: JSON data dalam format string
- `created_at`: Waktu pembuatan
- `updated_at`: Waktu update terakhir

## Backup & Restore

### Backup
1. Klik tombol "Backup Data" di aplikasi
2. File JSON akan terunduh otomatis
3. Simpan file backup di tempat yang aman

### Restore
1. Klik tombol "Restore Data"
2. Pilih file backup JSON
3. Konfirmasi restore
4. Data akan diganti dengan data dari backup

## API Endpoints

- `GET /api/data` - Ambil semua data
- `POST /api/data` - Buat data baru
- `PUT /api/data/:id` - Update data
- `DELETE /api/data/:id` - Hapus data
- `POST /api/data/bulk` - Bulk insert data (untuk restore)
- `DELETE /api/data` - Hapus semua data
- `GET /api/health` - Health check

## Troubleshooting

### Database tidak tersimpan
- Pastikan server memiliki permission untuk menulis file
- Cek apakah folder aplikasi memiliki write permission
- Database file: `database.sqlite` di root folder

### Port sudah digunakan
- Ubah PORT di `server.js` atau set environment variable:
```bash
PORT=3001 npm start
```

### Error saat deploy
- Pastikan semua dependencies terinstall
- Cek log error di platform hosting
- Pastikan Node.js version sesuai (v14+)

## Kontributor

MUH ICHSAN, Tahun 2025-2026

## License

MIT

