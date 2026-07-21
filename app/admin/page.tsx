'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2';

const MapAdminDashboard = dynamic(() => import('@/components/MapAdminDashboard'), { 
  ssr: false,
  loading: () => <div className="w-full h-[70vh] bg-gray-200 animate-pulse rounded-xl shadow-lg border border-gray-200"></div>
});

export default function AdminDashboard() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // State Filter
  const [filters, setFilters] = useState({
    pending: true,
    approved: true,
    resolved: true,
    landmarks: true
  });

  // State Tambah Data
  const [isAdding, setIsAdding] = useState(false);
  const [addingLat, setAddingLat] = useState(-6.2900);
  const [addingLng, setAddingLng] = useState(107.3000);

  // Pop-up Lightbox Foto
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      await fetchSemuaData();
    }
  };

  const fetchSemuaData = async () => {
    try {
      setLoading(true);
      // Fetch semua laporan (semua status)
      // Karena endpoint /api/laporan sebelumnya butuh ?status=, jika tidak dikirim akan default ke 'approved'.
      // Untuk mengambil semua, kita fetch masing-masing lalu digabung.
      const [resPending, resApproved, resResolved, resLandmarks] = await Promise.all([
        fetch('/api/laporan?status=pending'),
        fetch('/api/laporan?status=approved'),
        fetch('/api/laporan?status=resolved'),
        fetch('/api/landmarks')
      ]);

      const jsonPending = await resPending.json();
      const jsonApproved = await resApproved.json();
      const jsonResolved = await resResolved.json();
      const jsonLandmarks = await resLandmarks.json();

      let semuaLaporan: any[] = [];
      if (jsonPending.success) semuaLaporan = semuaLaporan.concat(jsonPending.data);
      if (jsonApproved.success) semuaLaporan = semuaLaporan.concat(jsonApproved.data);
      if (jsonResolved.success) semuaLaporan = semuaLaporan.concat(jsonResolved.data);

      setLaporan(semuaLaporan);
      
      if (jsonLandmarks.success) {
        setLandmarks(jsonLandmarks.data);
      }

    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleAksi = async (id: number, actionType: 'approve' | 'reject' | 'resolve' | 'delete_landmark', newLat?: number, newLng?: number) => {
    const pesanKonfirmasi = actionType === 'approve' ? 'Setujui dan terbitkan laporan ini ke peta publik?' 
                          : actionType === 'resolve' ? 'Tandai titik ini sudah dibersihkan?'
                          : actionType === 'delete_landmark' ? 'Hapus patokan lokasi ini secara permanen?'
                          : 'Tolak dan HAPUS PERMANEN laporan spam ini?';
    
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: pesanKonfirmasi,
      icon: (actionType === 'reject' || actionType === 'delete_landmark') ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: (actionType === 'reject' || actionType === 'delete_landmark') ? '#d33' : '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Ya, eksekusi!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      let url = `/api/laporan/${id}`;
      let method = actionType === 'reject' ? 'DELETE' : 'PATCH'; 
      let bodyData = null;

      if (actionType === 'delete_landmark') {
        url = `/api/landmarks/${id}`;
        method = 'DELETE';
      } else if (actionType === 'approve') {
        bodyData = { status: 'approved', latitude: newLat, longitude: newLng };
      } else if (actionType === 'resolve') {
        bodyData = { status: 'resolved' };
      }

      const res = await fetch(url, {
        method,
        headers: bodyData ? { 'Content-Type': 'application/json' } : undefined,
        body: bodyData ? JSON.stringify(bodyData) : null
      });

      const json = await res.json();
      if (json.success) {
        Swal.fire('Berhasil!', 'Aksi berhasil dieksekusi.', 'success');
        fetchSemuaData(); 
      } else {
        throw new Error(json.error);
      }
    } catch (error: any) {
      Swal.fire('Error', 'Terjadi kesalahan: ' + error.message, 'error');
    }
  };

  const handleKonfirmasiPosisi = async () => {
    // 1. Munculkan Form di SweetAlert
    const { value: formValues } = await Swal.fire({
      title: 'Tambahkan Data Baru',
      html: `
        <div class="text-left">
          <label class="block text-sm font-bold text-gray-700 mb-1">Jenis Titik</label>
          <select id="swal-type" class="w-full border p-2 rounded mb-4">
            <option value="sampah">Titik Sampah</option>
            <option value="landmark">Patokan Lokasi</option>
          </select>
          
          <label class="block text-sm font-bold text-gray-700 mb-1">Deskripsi / Nama</label>
          <textarea id="swal-desc" class="w-full border p-2 rounded mb-4" rows="2" placeholder="Masukkan deskripsi atau nama patokan..."></textarea>
          
          <div id="swal-file-container">
            <label class="block text-sm font-bold text-gray-700 mb-1">Unggah Foto (Hanya Titik Sampah)</label>
            <input type="file" id="swal-file" accept="image/*" class="w-full border p-1 rounded">
          </div>
        </div>
      `,
      didOpen: () => {
        const typeSelect = document.getElementById('swal-type') as HTMLSelectElement;
        const fileContainer = document.getElementById('swal-file-container');
        typeSelect.addEventListener('change', (e) => {
          if ((e.target as HTMLSelectElement).value === 'landmark') {
            fileContainer!.style.display = 'none';
          } else {
            fileContainer!.style.display = 'block';
          }
        });
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const type = (document.getElementById('swal-type') as HTMLSelectElement).value;
        const desc = (document.getElementById('swal-desc') as HTMLTextAreaElement).value;
        const fileInput = document.getElementById('swal-file') as HTMLInputElement;
        const file = fileInput.files?.[0];
        
        if (!desc) {
          Swal.showValidationMessage('Deskripsi / Nama wajib diisi');
          return false;
        }
        if (type === 'sampah' && !file) {
          Swal.showValidationMessage('Foto wajib diunggah untuk titik sampah');
          return false;
        }
        return { type, desc, file };
      }
    });

    if (!formValues) return; // Dibatalkan

    Swal.fire({
      title: 'Memproses...',
      text: 'Mohon tunggu sementara data dan foto diunggah.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      if (formValues.type === 'sampah') {
        const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true };
        const compressedFile = await imageCompression(formValues.file, options);

        const fileName = `${Date.now()}-${compressedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('foto-sampah')
          .upload(`public/${fileName}`, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('foto-sampah')
          .getPublicUrl(`public/${fileName}`);

        const res = await fetch('/api/laporan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deskripsi: formValues.desc,
            foto_url: publicUrl,
            latitude: addingLat,
            longitude: addingLng,
            status: 'approved'
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        
        Swal.fire('Berhasil', 'Titik Sampah berhasil ditambahkan!', 'success');
      } else {
        const res = await fetch('/api/landmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formValues.desc,
            latitude: addingLat,
            longitude: addingLng,
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        
        Swal.fire('Berhasil', 'Patokan Lokasi berhasil ditambahkan!', 'success');
      }
      
      setIsAdding(false);
      fetchSemuaData();
    } catch (error: any) {
      Swal.fire('Gagal', 'Terjadi kesalahan: ' + error.message, 'error');
    }
  };

  const handleFilterToggle = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 py-8 relative">
      
      {/* Lightbox Pop-up Foto */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-gray-300"
            >
              &times;
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selectedImage} 
              alt="Foto Diperbesar" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin WebGIS</h1>
          <p className="text-gray-600">Map-centric dashboard untuk manajemen spasial yang interaktif.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-100 text-red-700 px-5 py-2 rounded-lg font-bold hover:bg-red-200 transition shadow-sm"
        >
          Logout
        </button>
      </div>
      
      {/* Container Utama */}
      <div className="relative">
        
        {/* Lapisan Filter (Floating di atas peta) */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Filter Tampilan</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <input type="checkbox" checked={filters.pending} onChange={() => handleFilterToggle('pending')} className="w-4 h-4 text-red-600 rounded" />
              <div className="w-3 h-3 bg-red-500 rounded-full border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Menunggu Validasi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <input type="checkbox" checked={filters.approved} onChange={() => handleFilterToggle('approved')} className="w-4 h-4 text-orange-600 rounded" />
              <div className="w-3 h-3 bg-orange-500 rounded-full border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Aktif (Peta Publik)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <input type="checkbox" checked={filters.resolved} onChange={() => handleFilterToggle('resolved')} className="w-4 h-4 text-green-600 rounded" />
              <div className="w-3 h-3 bg-green-500 rounded-full border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Telah Dibersihkan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <input type="checkbox" checked={filters.landmarks} onChange={() => handleFilterToggle('landmarks')} className="w-4 h-4 text-blue-600 rounded" />
              <div className="w-3 h-3 bg-blue-500 rounded-full border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Patokan Lokasi</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="w-full h-[70vh] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center font-bold text-gray-500">
            Memuat Data Spasial...
          </div>
        ) : (
          <MapAdminDashboard 
            laporan={laporan}
            landmarks={landmarks}
            filters={filters}
            onAksi={handleAksi}
            isAdding={isAdding}
            onAddingPositionChange={(lat, lng) => {
              setAddingLat(lat);
              setAddingLng(lng);
            }}
            onImageClick={(url) => setSelectedImage(url)}
          />
        )}

        {/* Kontrol Tambah Data (Floating Bottom) */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="pointer-events-auto bg-gray-900 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:bg-gray-800 transition flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <span className="text-xl">+</span> Tambah Data Baru
            </button>
          ) : (
            <div className="pointer-events-auto bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.2)] border border-gray-200 flex flex-col items-center animate-bounce">
              <p className="font-bold text-gray-800 mb-3 text-center">Geser Peta/Pin ke Lokasi yang Tepat</p>
              <div className="flex gap-3">
                <button 
                  onClick={handleKonfirmasiPosisi}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700"
                >
                  Konfirmasi Posisi
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}