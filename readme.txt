================================================================================
                    PANDUAN SETUP & MENJALANKAN SISTEM
              (Next.js Frontend + FastAPI Backend + Supabase)
================================================================================

Daftar Isi:
1. Prasyarat Sistem
2. Persiapan Database di Supabase (SQL Editor)
3. Cara Menjalankan Backend (FastAPI Python)
4. Cara Menjalankan Frontend (Next.js)
5. Akun Default untuk Login
6. Troubleshooting & Catatan Penting

--------------------------------------------------------------------------------
1. PRASYARAT SISTEM
--------------------------------------------------------------------------------
Sebelum memulai, pastikan komputer Anda telah terinstal:
- Python (versi 3.10, 3.11, atau 3.12/3.13)
- Node.js (versi 18.x atau versi LTS terbaru yang kompatibel) & npm
- Akun Supabase (https://supabase.com)
- Git / Software ekstraksi zip (seperti WinRAR/7-Zip)

Setelah men-download file ZIP dari GitHub, ekstrak folder proyek ke direktori
pilihan Anda, misalnya: `D:\web` atau folder tempat Anda bekerja.

--------------------------------------------------------------------------------
2. PERSIAPAN DATABASE DI SUPABASE (SQL EDITOR)
--------------------------------------------------------------------------------
PENTING:
File SQL berada di folder: `backend/sql/`
Terdapat 2 file yang WAJIB dijalankan secara BERURUTAN pada SQL Editor Supabase.

Langkah-langkah:
1. Buka browser dan login ke https://supabase.com/dashboard
2. Pilih project Supabase Anda (atau buat project baru jika belum ada).
3. Di panel sebelah kiri, klik menu "SQL Editor" (ikon terminal/kode).
4. Klik tombol "New query" (+).

Langkah Eksekusi File 1: tabel.sql
- Buka file: `backend/sql/tabel.sql` menggunakan teks editor (Notepad/VS Code).
- Copy (Salin) seluruh isi file tersebut.
- Paste (Tempel) ke halaman SQL Editor Supabase.
- Klik tombol "Run" (atau tekan Ctrl + Enter).
- Pastikan muncul pesan "Success. No rows returned".
  (Query ini akan membuat ekstensi pgcrypto, tabel role, users, customer,
   jenis_laptop, jenis_service, service, keluhan, serta menginsert data awal
   role dan akun admin default).

Langkah Eksekusi File 2: data_service.sql
- Buka file: `backend/sql/data_service.sql` pada teks editor Anda.
- Copy (Salin) seluruh isi file tersebut.
- Buat query baru di SQL Editor Supabase ("New query").
- Paste (Tempel) seluruh kodenya.
- Klik tombol "Run".
- Pastikan muncul pesan sukses.
  (Query ini membuat Stored Procedures/Functions untuk create, update, dan
   delete data service beserta relasi customer dan keluhan).

Mengambil Kredensial Supabase untuk Backend:
- Masuk ke menu "Project Settings" (ikon gear/roda gigi di kiri bawah).
- Pilih submenu "API" (atau "Data API").
- Salin 2 nilai berikut:
  a. Project URL (misal: https://xxxx.supabase.co)
  b. Project API Keys: anon public key atau service_role key.

--------------------------------------------------------------------------------
3. CARA MENJALANKAN BACKEND (FASTAPI PYTHON)
--------------------------------------------------------------------------------
Buka terminal baru (PowerShell / Command Prompt) dan ikuti langkah berikut:

1. Masuk ke folder backend:
   cd backend

2. Buat Virtual Environment Python (jika belum ada):
   python -m venv venv

3. Aktifkan Virtual Environment:
   - Windows (PowerShell):
     .\venv\Scripts\Activate.ps1
     (Jika ada permission error pada PowerShell, jalankan:
      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)
   - Windows (CMD):
     venv\Scripts\activate.bat
   - Linux/macOS:
     source venv/bin/activate

4. Install seluruh dependensi yang dibutuhkan:
   pip install -r requirements.txt

5. Konfigurasi file `.env` pada folder backend:
   - Buat/edit file `.env` di dalam folder `backend/`:
     --------------------------------------------------
     SUPABASE_URL=https://proyek-anda.supabase.co
     SUPABASE_KEY=masukkan_key_supabase_anda
     JWT_SECRET=skripsi123
     --------------------------------------------------
   - Ganti SUPABASE_URL dan SUPABASE_KEY sesuai data dari project Supabase Anda.

6. Jalankan Server Backend:
   uvicorn main:app --reload --host 127.0.0.1 --port 8000

7. Backend sekarang aktif di:
   API URL: http://localhost:8000

--------------------------------------------------------------------------------
4. CARA MENJALANKAN FRONTEND (NEXT.JS)
--------------------------------------------------------------------------------
Buka jendela terminal BARU (jangan matikan terminal backend):

1. Masuk ke folder frontend:
   cd frontend

2. Install dependensi Node.js:
   npm install

3. Pastikan konfigurasi file `.env` pada frontend:
   - Cek atau buat file `.env` di dalam folder `frontend/`:
     --------------------------------------------------
     NEXT_PUBLIC_API_URL=http://localhost:8000
     --------------------------------------------------

4. Jalankan Server Frontend (Mode Development):
   npm run dev

5. Buka web browser Anda dan akses:
   http://localhost:3000

--------------------------------------------------------------------------------
5. AKUN DEFAULT UNTUK LOGIN
--------------------------------------------------------------------------------
Setelah database diinisialisasi melalui `tabel.sql`, akun default administrator:

- Username : Administrator
- Password : admin123
- Role     : Super Admin

Anda dapat login melalui halaman: http://localhost:3000/login