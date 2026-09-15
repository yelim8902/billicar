import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SEOUL_CENTER = [37.5007, 127.0365];

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 14, { duration: 0.7 }); }, [map, position]);
  return null;
}

const vehicleIcon = L.divIcon({
  className: 'billicar-marker-wrap',
  html: '<div class="billicar-marker">차</div>',
  iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -22],
});

const userIcon = L.divIcon({
  className: 'billicar-marker-wrap',
  html: '<div class="billicar-user-marker"><span></span></div>',
  iconSize: [28, 28], iconAnchor: [14, 14],
});

export default function VehicleMap({ vehicles, onSelect }) {
  const [userPosition, setUserPosition] = useState(null);
  const center = useMemo(() => userPosition || SEOUL_CENTER, [userPosition]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserPosition([coords.latitude, coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  }, []);

  return (
    <MapContainer center={SEOUL_CENTER} zoom={13} scrollWheelZoom={false} zoomControl={false} className="vehicle-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter position={center} />
      {userPosition && <Marker position={userPosition} icon={userIcon}><Popup>현재 위치</Popup></Marker>}
      {vehicles.map(vehicle => (
        <Marker key={vehicle.id} position={vehicle.coords} icon={vehicleIcon}>
          <Popup>
            <strong>{vehicle.name}</strong><br />
            {vehicle.pricePerHour.toLocaleString()} W-KRW / 시간<br />
            {vehicle.status === 'available' && <button className="map-reserve" onClick={() => onSelect(vehicle)}>예약하기</button>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
