# Panduan Deployment Aplikasi Jurnal Kokurikuler

## Ringkasan

Aplikasi ini sekarang sudah dilengkapi dengan backend API dan database SQLite. Semua data akan tersimpan di server hosting, bukan lagi di browser (localStorage).

## Platform Hosting yang Direkomendasikan

### 🥇 1. Render.com (PALING MUDAH - GRATIS)

**Keuntungan:**
- Gratis untuk tier pertama
- Database SQLite tersimpan secara persisten
- Auto-deploy dari GitHub
- Mudah digunakan

**Cara Deploy:**

1. **Buat akun di [Render.com](https://render.com)** (gratis)

2. **Push kode ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo-name.git
   git push -u origin main
   ```

3. **Di Render.com:**
   - Klik "New +" → "Web Service"
   - Pilih "Connect GitHub" dan pilih repository Anda
   - Atau gunakan "Public Git Repository" dan paste URL repo

4. **Konfigurasi:**
   - **Name**: jurnal-kokurikuler (atau nama lain)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Klik "Create Web Service"**

6. **Tunggu deploy selesai** (sekitar 2-5 menit)

7. **Aplikasi siap!** URL akan seperti: `https://jurnal-kokurikuler.onrender.com`

**Catatan Penting:**
- Database SQLite akan tersimpan di persistent disk
- Aplikasi akan "sleep" setelah 15 menit tidak aktif (pada plan gratis)
- Wake-up pertama kali mungkin butuh 30 detik

---

### 🥈 2. Railway.app (GRATIS dengan batasan)

**Keuntungan:**
- Gratis $5 credit per bulan
- Database persisten
- Auto-deploy dari GitHub
- Tidak ada sleep mode

**Cara Deploy:**

1. **Buat akun di [Railway.app](https://railway.app)**

2. **Klik "New Project" → "Deploy from GitHub repo"**

3. **Pilih repository Anda**

4. **Railway akan otomatis:**
   - Detect Node.js
   - Install dependencies
   - Run `npm start`

5. **Setelah deploy, klik "Settings" → "Generate Domain"** untuk mendapatkan URL

**Catatan:**
- Setelah $5 credit habis, perlu upgrade ke paid plan
- Database akan tersimpan secara persisten

---

### 🥉 3. VPS Sendiri (Ubuntu/Debian)

Jika Anda memiliki VPS sendiri:

**Persiapan:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y
```

**Deploy Aplikasi:**
```bash
# Clone repository
git clone <your-repo-url>
cd JUKO

# Install dependencies
npm install

# Install PM2 (process manager)
sudo npm install -g pm2

# Start aplikasi
pm2 start server.js --name jurnal-kokurikuler

# Simpan konfigurasi PM2
pm2 save

# Setup auto-start saat reboot
pm2 startup
# Jalankan command yang muncul di terminal
```

**Setup Nginx (Reverse Proxy):**
```bash
# Install Nginx
sudo apt install nginx -y

# Buat file konfigurasi
sudo nano /etc/nginx/sites-available/jurnal-kokurikuler
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Ganti dengan domain Anda

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/jurnal-kokurikuler /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Setup SSL dengan Let's Encrypt (Opsional):**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Testing Lokal Sebelum Deploy

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Jalankan server:**
   ```bash
   npm start
   ```

3. **Buka browser:**
   ```
   http://localhost:3000
   ```

4. **Test fitur:**
   - Tambah data guru/sekolah/siswa/jurnal
   - Cek apakah data tersimpan
   - Test backup & restore
   - Test print/export

---

## Troubleshooting

### Database tidak tersimpan
- Pastikan folder aplikasi memiliki write permission
- Cek log error di platform hosting
- Database file: `database.sqlite` di root folder

### Aplikasi tidak bisa diakses
- Cek apakah port sudah benar (default: 3000)
- Cek firewall settings
- Cek log error di platform hosting

### Error saat deploy
- Pastikan semua dependencies terinstall
- Cek Node.js version (minimal v14)
- Pastikan `package.json` sudah benar
- Cek build logs di platform hosting

### Data hilang setelah deploy ulang
- Pastikan database file (`database.sqlite`) tidak di-ignore di `.gitignore`
- Atau gunakan backup/restore feature sebelum deploy ulang
- Beberapa platform (seperti Vercel) tidak support persistent storage untuk SQLite

---

## Backup Database

**Cara manual:**
1. Download file `database.sqlite` dari server
2. Simpan di tempat yang aman

**Cara otomatis:**
1. Gunakan fitur "Backup Data" di aplikasi
2. Simpan file JSON backup
3. Restore menggunakan fitur "Restore Data"

---

## Migrasi dari LocalStorage ke Database

Jika Anda sudah punya data di localStorage:

1. **Backup data lama:**
   - Buka aplikasi versi lama (yang masih pakai localStorage)
   - Klik "Backup Data"
   - Simpan file JSON

2. **Deploy aplikasi baru** (yang pakai database)

3. **Restore data:**
   - Buka aplikasi yang sudah di-deploy
   - Klik "Restore Data"
   - Pilih file backup JSON
   - Konfirmasi restore

---

## Monitoring & Maintenance

### Cek Status Aplikasi
- Gunakan endpoint: `GET /api/health`
- Akan return: `{ status: 'ok', timestamp: '...' }`

### Cek Log
- **Render/Railway**: Dashboard → Logs
- **VPS dengan PM2**: `pm2 logs jurnal-kokurikuler`
- **VPS dengan systemd**: `journalctl -u jurnal-kokurikuler`

### Restart Aplikasi
- **PM2**: `pm2 restart jurnal-kokurikuler`
- **Systemd**: `sudo systemctl restart jurnal-kokurikuler`

---

## Upgrade ke Database yang Lebih Kuat (Opsional)

Jika aplikasi sudah besar dan butuh database yang lebih powerful:

1. **PostgreSQL** (recommended untuk production)
2. **MySQL/MariaDB**
3. **MongoDB** (untuk NoSQL)

Untuk upgrade, perlu modifikasi `server.js` untuk menggunakan driver database yang sesuai.

---

## Support

Jika ada masalah, cek:
1. Log error di platform hosting
2. Console browser (F12 → Console)
3. Network tab di browser (F12 → Network)

---

**Selamat Deploy! 🚀**


