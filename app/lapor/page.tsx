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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lapor Tumpukan Sampah</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">1. Tandai Lokasi (Geser pin merah ke titik akurat)</label>
          <MapLapor onPositionChange={handlePositionChange} />
        </div>

        <div>
          <label className="block mb-2 font-medium">2. Unggah Foto Bukti</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">3. Deskripsi Singkat</label>
          <textarea 
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Contoh: Sampah menumpuk di pinggir selokan dekat perempatan..."
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Mengirim Laporan...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  );
}