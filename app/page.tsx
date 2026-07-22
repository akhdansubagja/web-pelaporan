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
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  const [activeTab, setActiveTab] = useState('beranda');

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
    <div className="min-h-screen bg-[#F5F8F6] text-gray-800 font-sans">
      
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

      {/* Navbar */}
      <nav className="bg-white px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white shrink-0">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-green-800 leading-tight">SIMPELYA</h1>
            <p className="text-[10px] text-gray-500 hidden sm:block">Sistem Informasi Pemetaan Sampah<br/>Desa Mulyajaya</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 font-semibold text-gray-600">
          <Link href="#" onClick={() => setActiveTab('beranda')} className={`${activeTab === 'beranda' ? 'text-green-700 border-b-2 border-green-700' : 'hover:text-green-700'} pb-1 transition`}>Beranda</Link>
          <Link href="#peta" onClick={() => setActiveTab('peta')} className={`${activeTab === 'peta' ? 'text-green-700 border-b-2 border-green-700' : 'hover:text-green-700'} pb-1 transition`}>Peta Sampah</Link>
          <Link href="#media" onClick={() => setActiveTab('media')} className={`${activeTab === 'media' ? 'text-green-700 border-b-2 border-green-700' : 'hover:text-green-700'} pb-1 transition`}>Media Kampanye</Link>
        </div>
        <div>
          <Link href="/lapor" className="bg-green-700 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-bold shadow-md hover:bg-green-800 transition text-xs md:text-sm flex items-center gap-2">
            <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Laporkan Lokasi
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white px-6 py-16 md:py-24 border-b border-green-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Web Pemetaan Sampah
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-green-900 leading-tight tracking-tight">
              SIMPELYA
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Sistem Informasi Manajemen Pemetaan dan Edukasi Lingkungan Mulyajaya
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto lg:mx-0">
              Pantau titik lokasi sampah, TPS, bank sampah, dan lokasi rawan penumpukan sampah secara digital untuk lingkungan yang lebih bersih dan sehat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Link href="#peta" className="bg-green-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-900 transition flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                Lihat Peta Sampah
              </Link>
              <Link href="/lapor" className="bg-white border-2 border-green-700 text-green-700 px-8 py-3 rounded-full font-bold shadow-md hover:bg-green-50 transition flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Laporkan Lokasi Sampah
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full relative h-[350px] sm:h-[450px] flex items-center justify-center mt-8 lg:mt-0">
            {/* CSS Graphic Placeholder for Map */}
            <div className="absolute inset-0 bg-green-100 rounded-[60px] transform rotate-3 scale-105 opacity-60"></div>
            <div className="relative w-full h-full bg-[#E5F1E5] rounded-[40px] shadow-2xl overflow-hidden border-8 border-white flex items-center justify-center relative bg-opacity-80" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234ade80\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
               
               {/* Decorative map pins */}
               <div className="absolute top-[20%] left-[30%] bg-red-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{animationDelay: '0s'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/></svg>
               </div>
               <div className="absolute top-[40%] right-[30%] bg-green-600 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{animationDelay: '0.2s'}}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
               </div>
               <div className="absolute bottom-[25%] left-[45%] bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{animationDelay: '0.4s'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/></svg>
               </div>
               <div className="absolute top-[35%] left-[15%] bg-yellow-500 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{animationDelay: '0.1s'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/></svg>
               </div>
               <span className="text-2xl md:text-3xl font-extrabold text-green-900 bg-white/80 px-6 py-3 rounded-2xl backdrop-blur-md shadow-sm border border-green-100">Desa Mulyajaya</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 md:space-y-12 my-8 md:my-16">
        
        {/* Peta Interaktif Section */}
        <section id="peta" className="scroll-mt-28">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Peta Interaktif Sampah</h2>
            </div>
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              Terdapat <span className="font-bold text-red-600">{laporanApproved.length}</span> titik sampah yang telah dikonfirmasi dan menunggu penanganan. Klik foto pada pin merah untuk memperbesar.
            </p>
            
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-[400px] md:h-[600px] z-0 relative shadow-inner">
              <MapPublic laporanData={laporanApproved} onImageClick={setSelectedImage} />
            </div>
          </div>
        </section>

        {/* Media Kampanye Digital */}
        <section id="media" className="scroll-mt-28">
          <div className="bg-[#FFFDF0] rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-yellow-100 flex flex-col xl:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Media Kampanye Digital</h2>
              </div>
              <p className="text-gray-500 mb-6 text-sm md:text-base">Kampanye digital untuk mengajak masyarakat peduli sampah.</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setSelectedImage('/1.jpeg')} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/1.jpeg" alt="Kenali Jenis Sampah" className="w-full h-32 md:h-48 object-cover rounded-xl mb-3" />
                  <h3 className="font-bold text-gray-800 text-sm text-center">Kenali Jenis Sampah</h3>
                </div>
                <div onClick={() => setSelectedImage('/2.jpeg')} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/2.jpeg" alt="Penerapan Prinsip 3R" className="w-full h-32 md:h-48 object-cover rounded-xl mb-3" />
                  <h3 className="font-bold text-gray-800 text-sm text-center">Penerapan Prinsip 3R</h3>
                </div>
                <div onClick={() => setSelectedImage('/3.jpeg')} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/3.jpeg" alt="5 Langkah Memilah Sampah" className="w-full h-32 md:h-48 object-cover rounded-xl mb-3" />
                  <h3 className="font-bold text-gray-800 text-sm text-center">5 Langkah Memilah Sampah</h3>
                </div>
                <div onClick={() => setSelectedImage('/4.jpeg')} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/4.jpeg" alt="Dampak Sampah Terhadap Lingkungan" className="w-full h-32 md:h-48 object-cover rounded-xl mb-3" />
                  <h3 className="font-bold text-gray-800 text-sm text-center">Dampak Sampah Terhadap Lingkungan</h3>
                </div>
              </div>
            </div>
            
            {/* QR Code section placeholder from the image */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-w-[250px]">
              <h3 className="font-bold text-gray-800 text-center mb-2">Akses Website SIMPELYA</h3>
              <p className="text-xs text-gray-500 text-center mb-6">Scan QR Code untuk mengakses informasi pemetaan sampah</p>
              <div className="w-40 h-40 bg-gray-50 flex items-center justify-center border-4 border-dashed border-gray-200 rounded-2xl relative overflow-hidden p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/qrcode.png" alt="QR Code SIMPELYA" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#183921] text-white pt-16 pb-8 px-6 border-t-[8px] border-green-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/></svg>
              <h2 className="text-2xl font-extrabold tracking-wide">SIMPELYA</h2>
            </div>
            <p className="text-green-100/70 text-sm mb-1 font-medium">Bersama Kelola Sampah,</p>
            <p className="text-green-100/70 text-sm font-medium">Bersama Jaga Bumi.</p>
          </div>
          
          <div>
            <h3 className="font-bold mb-5 text-lg border-b border-green-700 pb-2 inline-block">Kontak</h3>
            <ul className="space-y-4 text-sm text-green-100/80">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                0812-3456-7890
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                simpelya.mulyajaya@gmail.com
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-5 text-lg border-b border-green-700 pb-2 inline-block">Link Cepat</h3>
            <ul className="space-y-3 text-sm text-green-100/80 font-medium">
              <li><Link href="#peta" className="hover:text-green-400 hover:translate-x-1 transition-all inline-block">› Peta Sampah</Link></li>
              <li><Link href="/lapor" className="hover:text-green-400 hover:translate-x-1 transition-all inline-block">› Laporkan Lokasi</Link></li>
              <li><Link href="/admin" className="hover:text-green-400 hover:translate-x-1 transition-all inline-block">› Login Admin</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-5 text-lg border-b border-green-700 pb-2 inline-block">Ikuti Kami</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center hover:bg-green-600 hover:-translate-y-1 transition-all shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center hover:bg-green-600 hover:-translate-y-1 transition-all shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center hover:bg-green-600 hover:-translate-y-1 transition-all shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-800 pt-8 text-center text-xs md:text-sm text-green-400 font-medium tracking-wide">
          <p>&copy; 2026 SIMPELYA - Sistem Informasi Pemetaan Sampah Desa Mulyajaya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}