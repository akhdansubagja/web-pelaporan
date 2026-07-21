'use client';

import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useRef, useMemo, useEffect } from 'react';
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

// Komponen pembantu untuk memindahkan kamera peta secara dinamis
function ChangeView({ center }: { center: L.LatLngTuple }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

interface MapLaporProps {
  onPositionChange: (lat: number, lng: number) => void;
}

export default function MapLapor({ onPositionChange }: MapLaporProps) {
  // Titik default dikunci di tengah Desa Mulyajaya
  const defaultCenter: L.LatLngTuple = [-6.2900, 107.3000]; 
  const [position, setPosition] = useState<L.LatLngTuple>(defaultCenter);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  
  const markerRef = useRef<L.Marker>(null);
  
  // SAKLAR PENGAMAN: Mencegah loop pemanggilan GPS setiap kali pin digeser
  const isGpsFetched = useRef(false);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          onPositionChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onPositionChange],
  );

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

    // Cek apakah GPS sudah pernah ditarik sebelumnya
    if (!isGpsFetched.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          onPositionChange(latitude, longitude);
          
          // Matikan saklar setelah lokasi pertama didapatkan
          isGpsFetched.current = true;
        },
        (err) => {
          console.log("Akses GPS ditolak. Menggunakan lokasi default Desa Mulyajaya.");
          // Tetap matikan saklar agar tidak mencoba terus-menerus
          isGpsFetched.current = true;
        },
        { enableHighAccuracy: true } 
      );
    }
    // Dependency array kosong [] memastikan useEffect ini HANYA berjalan 1x saat load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="relative w-full" style={{ height: '350px' }}>
      <MapContainer 
        center={position} 
        zoom={15}
        style={{ height: '100%', width: '100%', borderRadius: '8px', zIndex: 0 }}
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Pin Interaktif (Draggable) untuk Laporan Baru */}
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
          icon={customIcon} 
        />
        
        {/* Render Patokan (Landmark) */}
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