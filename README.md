# Photo Booth Application

Aplikasi Photo Booth lengkap dengan sistem pembayaran dan panel admin.

## 🎯 Fitur Utama

### User Interface
- **Pemilihan Paket Sesi**: 
  - 1 Sesi: Rp 5.000
  - 2 Sesi: Rp 8.000
  - 3 Sesi: Rp 12.000

- **Pemilihan Jumlah Foto per Sesi**: 2, 4, atau 6 foto

- **Kamera Interface**:
  - Akses kamera real-time
  - Countdown timer 3 detik sebelum foto diambil
  - Flash effect saat foto diambil
  - Tracking sesi dan foto saat ini

- **Preview Foto**: Lihat semua foto yang telah diambil sebelum pembayaran

- **Pembayaran**: Menampilkan metode pembayaran yang dikonfigurasi admin

- **Download Foto**: Download semua foto setelah pembayaran selesai

### Admin Panel
- **Login Terproteksi**: Password: `admin123`

- **Konfigurasi Metode Pembayaran**:
  - **QRIS**: Upload QR Code atau masukkan kode QRIS
  - **Rekening Bank**: Nama bank, nomor rekening, nama pemilik
  - **E-Wallet**: GoPay, OVO, DANA, ShopeePay dengan nomor dan nama
  - **Virtual Account**: Nama bank dan nomor VA
  - **Kasir**: Lokasi kasir dan instruksi tambahan

- **Galeri Foto**:
  - Menampilkan semua foto yang telah diambil
  - Informasi tanggal dan waktu lengkap
  - Search/filter berdasarkan tanggal atau waktu
  - Download foto individual

## 🚀 Cara Menggunakan

### Untuk User:
1. Buka aplikasi di browser
2. Pilih paket sesi (1, 2, atau 3 sesi)
3. Pilih jumlah foto per sesi (2, 4, atau 6 foto)
4. Izinkan akses kamera
5. Ambil foto dengan menekan tombol "Ambil Foto"
6. Tunggu countdown dan foto akan diambil otomatis
7. Ulangi sampai semua foto selesai
8. Preview foto dan lanjut ke pembayaran
9. Lakukan pembayaran sesuai metode yang ditampilkan
10. Download semua foto

### Untuk Admin:
1. Klik tombol "Admin" di pojok kanan bawah
2. Login dengan password: `admin123`
3. **Konfigurasi Pembayaran**:
   - Pilih metode pembayaran yang diinginkan
   - Isi detail pembayaran
   - Klik "Simpan Konfigurasi"
4. **Lihat Galeri**:
   - Klik tab "Galeri Foto"
   - Gunakan search box untuk filter berdasarkan tanggal/waktu
   - Download foto individual jika diperlukan

## 🛠️ Teknologi

- **HTML5**: Struktur aplikasi
- **CSS3**: Styling modern dan responsive
- **Vanilla JavaScript**: Logic aplikasi
- **MediaDevices API**: Akses kamera
- **LocalStorage**: Penyimpanan data foto dan konfigurasi

## 📱 Responsive Design

Aplikasi fully responsive dan dapat digunakan di:
- Desktop
- Tablet
- Mobile

## 💾 Penyimpanan Data

Semua data disimpan di LocalStorage browser:
- Konfigurasi metode pembayaran
- Galeri foto dengan timestamp
- Metadata sesi foto

## 🔒 Keamanan

- Admin panel dilindungi password
- Password default: `admin123` (sebaiknya diganti di production)

## 📝 Catatan

- Aplikasi memerlukan akses kamera untuk mengambil foto
- Pastikan browser mendukung MediaDevices API
- Data tersimpan di LocalStorage browser (tidak hilang saat refresh)
- Untuk production, sebaiknya gunakan backend server untuk penyimpanan foto

## 🎨 Fitur Desain

- Gradient background yang menarik
- Animasi smooth transitions
- Card-based layout
- Countdown animation
- Flash effect saat foto diambil
- Responsive grid layout untuk galeri

## 📞 Support

Untuk bug report atau feature request, silakan hubungi developer.

---

**Developed with ❤️ for Photo Booth Experience**
