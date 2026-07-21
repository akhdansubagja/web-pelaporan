'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';

const customIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transform: translateY(-50%);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const landmarkIcon = L.divIcon({
  className: 'custom-pin-landmark',
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transform: translateY(-50%);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ChangeView({ center }: { center: L.LatLngTuple }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

interface Laporan {
  id: number;
  deskripsi: string;
  foto_url: string;
  lokasi: { coordinates: [number, number] }; 
}

interface MapPublicProps {
  laporanData: Laporan[];
  onImageClick?: (url: string) => void;
}

export default function MapPublic({ laporanData, onImageClick }: MapPublicProps) {
  // Titik tengah default Mulyajaya
  const defaultCenter: L.LatLngTuple = [-6.2900, 107.3000]; 
  const [position, setPosition] = useState<L.LatLngTuple>(defaultCenter);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const isGpsFetched = useRef(false);

  useEffect(() => {
    // Ambil data patokan lokasi
    const fetchLandmarks = async () => {
      try {
        const res = await fetch('/api/landmarks');
        const result = await res.json();
        if (result.success) {
          setLandmarks(result.data);
        }
      } catch (error) {
        console.error('Gagal mengambil patokan lokasi:', error);
      }
    };
    fetchLandmarks();

    if (!isGpsFetched.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          isGpsFetched.current = true;
        },
        (err) => {
          console.log("GPS ditolak. Menggunakan tengah desa Mulyajaya.");
          isGpsFetched.current = true;
        },
        { enableHighAccuracy: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full" style={{ height: '500px' }}>
      <MapContainer
        center={position}
        zoom={14}
        style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 0 }}
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render Laporan (Pin Merah) */}
        {laporanData.map((item) => {
          if (!item.lokasi || !item.lokasi.coordinates) return null;
          const lng = item.lokasi.coordinates[0];
          const lat = item.lokasi.coordinates[1];

          return (
            <Marker key={item.id} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="w-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.foto_url} 
                    alt="Tumpukan Sampah" 
                    className="w-full h-32 object-cover rounded mb-2 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onImageClick && onImageClick(item.foto_url)}
                  />
                  <p className="text-sm font-medium text-gray-800">{item.deskripsi}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Patokan (Landmark - Pin Biru) */}
        {landmarks.map(landmark => (
          <Marker 
            key={landmark.id} 
            position={[landmark.latitude, landmark.longitude]} 
            icon={landmarkIcon}
            draggable={false}
          >
            <Popup>
              <div className="font-bold text-gray-800 p-1">
                {landmark.name}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legenda Peta */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md border border-gray-200 text-sm">
        <p className="font-bold mb-2 text-gray-800">Keterangan:</p>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
          <span className="text-gray-700">Titik Lokasi Sampah</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
          <span className="text-gray-700">Patokan Lokasi</span>
        </div>
      </div>
    </div>
  );
}