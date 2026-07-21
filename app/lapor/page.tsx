'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';

// Mengimpor peta secara dinamis untuk menghindari error SSR Next.js
const MapLapor = dynamic(() => import('@/components/MapLapor'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      Memuat Peta...
    </div>
  )
});

export default function HalamanLapor() {
  const [koordinat, setKoordinat] = useState({ lat: 0, lng: 0 });
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePositionChange = (lat: number, lng: number) => {
    setKoordinat({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (koordinat.lat === 0 || koordinat.lng === 0 || !foto) {
      Swal.fire('Peringatan', 'Mohon lengkapi foto dan pastikan lokasi sudah ditandai di peta!', 'warning');
      return;
    }

    setLoading(true);
    Swal.fire({
      title: 'Memproses...',
      text: 'Mohon tunggu sementara laporan dan foto sedang diunggah.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      // 1. Proses Kompresi Gambar
      const options = {
        maxSizeMB: 0.3, // Maksimal 300KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(foto, options);

      // 2. Upload ke Supabase Storage (Bucket: foto-sampah)
      const fileName = `${Date.now()}-${compressedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('foto-sampah')
        .upload(`public/${fileName}`, compressedFile);

      if (uploadError) throw uploadError;

      // Ambil URL publik dari gambar
      const { data: { publicUrl } } = supabase.storage
        .from('foto-sampah')
        .getPublicUrl(`public/${fileName}`);

      // 3. Simpan data (termasuk koordinat dan URL gambar) ke Database via API Route
      const response = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deskripsi,
          foto_url: publicUrl,
          latitude: koordinat.lat,
          longitude: koordinat.lng,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      Swal.fire('Berhasil', 'Laporan berhasil dikirim dan menunggu validasi admin!', 'success');
      setDeskripsi('');
      setFoto(null);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', 'Terjadi kesalahan saat mengirim: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 py-6 sm:py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-5 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-green-50">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-green-800">Lapor Tumpukan Sampah</h1>
          <p className="text-sm sm:text-base text-green-600 mt-2">Bantu desa kita tetap bersih dengan melaporkan titik sampah</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-green-50 p-4 sm:p-5 rounded-2xl border border-green-100">
            <label className="block mb-3 font-bold text-green-800 text-sm sm:text-base">1. Tandai Lokasi (Geser pin merah ke titik akurat)</label>
            <div className="rounded-xl overflow-hidden shadow-sm border border-green-200">
              <MapLapor onPositionChange={handlePositionChange} />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">
              2. Unggah Foto Bukti
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Tombol Kamera */}
              <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-50 transition">
                <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-sm font-semibold text-green-800 text-center">Buka Kamera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                />
              </label>

              {/* Tombol Galeri */}
              <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-50 transition">
                <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-semibold text-green-800 text-center">Pilih dari Galeri/File</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            
            {foto && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-sm text-green-800 flex items-center gap-2 border border-green-200">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="truncate font-medium">File terpilih: {foto.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 font-bold text-gray-700 text-sm sm:text-base">3. Deskripsi Singkat</label>
            <textarea 
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition resize-none text-sm sm:text-base"
              placeholder="Contoh: Sampah menumpuk di pinggir selokan dekat perempatan..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-green-700 hover:shadow-lg focus:ring-4 focus:ring-green-200 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mt-4 transform active:scale-[0.98]"
          >
            {loading ? 'Mengirim Laporan...' : 'Kirim Laporan'}
          </button>
        </form>
      </div>
    </div>
  );
}