'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useRef, useMemo } from 'react';
import L from 'leaflet';

const customIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); transform: translateY(-50%);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapAdminProps {
  initialLat: number;
  initialLng: number;
  onPositionChange: (lat: number, lng: number) => void;
}

export default function MapAdmin({ initialLat, initialLng, onPositionChange }: MapAdminProps) {
  const [position, setPosition] = useState<L.LatLngTuple>([initialLat, initialLng]);
  const markerRef = useRef<L.Marker>(null);

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

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: '200px', width: '100%', borderRadius: '8px', zIndex: 0 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        icon={customIcon}
      />
    </MapContainer>
  );
}