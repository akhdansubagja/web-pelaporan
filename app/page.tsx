'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MapPublic = dynamic(() => import('@/components/MapPublic'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
      Memuat Peta Desa...
    </div>
  )
});

export default function LandingPage() {
  const [laporanApproved, setLaporanApproved] = useState([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State untuk Pop-up

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/laporan'); 
        const result = await res.json();
        if (result.success) setLaporanApproved(result.data);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Modal Pop-up Foto untuk Publik */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-4xl font-bold hover:text-gray-300"
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

      {/* Hero Section */}
      <header className="bg-green-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Peta Sampah Desa Mulyajaya
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-green-100 mb-8">
          Sistem pelaporan tumpukan sampah berbasis kerumunan (WebGIS) untuk menjaga kebersihan dan kelestarian lingkungan.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/lapor" className="bg-white text-green-700 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition">
            Lapor Tumpukan Sampah
          </Link>
          <Link href="/admin" className="bg-green-600 border border-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 transition">
            Login Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Titik Pantau Terkini</h2>
          <p className="text-gray-600 mt-1">
            Terdapat <span className="font-bold text-red-600">{laporanApproved.length}</span> titik sampah yang telah dikonfirmasi dan menunggu penanganan. Klik foto pada pin merah untuk memperbesar.
          </p>
        </div>
        <div className="shadow-xl rounded-xl border border-gray-200 bg-white p-2 relative z-0">
          {/* Kirim fungsi setSelectedImage ke peta */}
          <MapPublic laporanData={laporanApproved} onImageClick={setSelectedImage} />
        </div>
      </main>
    </div>
  );
} 