'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useRef, useMemo, useEffect } from 'react';
import L from 'leaflet';

// Icons
const iconPending = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transform: translateY(-50%);"></div>`, // Red
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const iconApproved = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #f97316; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transform: translateY(-50%);"></div>`, // Orange
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const iconResolved = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transform: translateY(-50%);"></div>`, // Green
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const iconLandmark = L.divIcon({
  className: 'custom-pin-landmark',
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transform: translateY(-50%);"></div>`, // Blue
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const iconAdding = L.divIcon({
  className: 'custom-pin-adding',
  html: `<div style="background-color: #a855f7; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.8); transform: translateY(-50%); animation: pulse 1.5s infinite;"></div>`, // Purple pulsing
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function ChangeView({ center }: { center: L.LatLngTuple }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

interface MapAdminDashboardProps {
  laporan: any[];
  landmarks: any[];
  filters: { pending: boolean; approved: boolean; resolved: boolean; landmarks: boolean };
  onAksi: (id: number, actionType: 'approve' | 'reject' | 'resolve' | 'delete_landmark', newLat?: number, newLng?: number) => void;
  isAdding: boolean;
  onAddingPositionChange: (lat: number, lng: number) => void;
  onImageClick: (url: string) => void;
}

export default function MapAdminDashboard({ 
  laporan, 
  landmarks, 
  filters, 
  onAksi, 
  isAdding, 
  onAddingPositionChange,
  onImageClick
}: MapAdminDashboardProps) {
  
  const defaultCenter: L.LatLngTuple = [-6.2900, 107.3000];
  const [position, setPosition] = useState<L.LatLngTuple>(defaultCenter);
  const [addingPos, setAddingPos] = useState<L.LatLngTuple>(defaultCenter);
  const isGpsFetched = useRef(false);
  const addMarkerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!isGpsFetched.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setAddingPos([latitude, longitude]);
          onAddingPositionChange(latitude, longitude);
          isGpsFetched.current = true;
        },
        (err) => {
          isGpsFetched.current = true;
        },
        { enableHighAccuracy: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = addMarkerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setAddingPos([newPos.lat, newPos.lng]);
          onAddingPositionChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onAddingPositionChange],
  );

  return (
    <div className="relative w-full h-[70vh] rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        {isAdding && <ChangeView center={addingPos} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker Tambah Titik Baru */}
        {isAdding && (
          <Marker
            draggable={true}
            eventHandlers={addEventHandlers}
            position={addingPos}
            ref={addMarkerRef}
            icon={iconAdding}
          >
            <Tooltip permanent direction="top" className="font-bold text-purple-600">
              Geser pin ini ke lokasi yang tepat
            </Tooltip>
          </Marker>
        )}

        {/* Laporan Sampah */}
        {laporan.map((item) => {
          if (!item.lokasi || !item.lokasi.coordinates) return null;
          
          // Filter checks
          if (item.status === 'pending' && !filters.pending) return null;
          if (item.status === 'approved' && !filters.approved) return null;
          if (item.status === 'resolved' && !filters.resolved) return null;

          const lng = item.lokasi.coordinates[0];
          const lat = item.lokasi.coordinates[1];
          
          let icon = iconPending;
          if (item.status === 'approved') icon = iconApproved;
          if (item.status === 'resolved') icon = iconResolved;

          return (
            <Marker key={item.id} position={[lat, lng]} icon={icon}>
              <Popup className="custom-popup">
                <div className="w-56 p-1">
                  <div className="mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${
                      item.status === 'pending' ? 'bg-red-500' : 
                      item.status === 'approved' ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.foto_url} 
                    alt="Laporan" 
                    className="w-full h-32 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition"
                    onClick={() => onImageClick(item.foto_url)}
                  />
                  <p className="text-sm text-gray-800 mt-2 mb-3 font-medium line-clamp-3">"{item.deskripsi}"</p>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    {item.status === 'pending' && (
                      <>
                        <button onClick={() => onAksi(item.id, 'approve', lat, lng)} className="w-full bg-green-600 text-white text-xs py-1.5 rounded font-bold hover:bg-green-700">✓ Setujui & Terbitkan</button>
                        <button onClick={() => onAksi(item.id, 'reject')} className="w-full bg-red-100 text-red-700 text-xs py-1.5 rounded font-bold hover:bg-red-200">Tolak (Spam)</button>
                      </>
                    )}
                    {item.status === 'approved' && (
                      <button onClick={() => onAksi(item.id, 'resolve')} className="w-full bg-blue-600 text-white text-xs py-1.5 rounded font-bold hover:bg-blue-700">Tandai Dibersihkan</button>
                    )}
                    {item.status === 'resolved' && (
                      <div className="text-center text-xs font-bold text-green-600 bg-green-50 py-1.5 rounded border border-green-200">✨ Telah Dibersihkan</div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Patokan Lokasi */}
        {filters.landmarks && landmarks.map((lm) => (
          <Marker key={`lm-${lm.id}`} position={[lm.latitude, lm.longitude]} icon={iconLandmark}>
            <Popup>
              <div className="w-40 text-center p-1">
                <p className="font-bold text-gray-800 mb-3">{lm.name}</p>
                <button 
                  onClick={() => onAksi(lm.id, 'delete_landmark')}
                  className="w-full bg-red-100 text-red-700 text-xs py-1.5 rounded font-bold hover:bg-red-200"
                >
                  Hapus Patokan
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}
