import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';


import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Sri Lanka center & bounds
const SL_CENTER = [7.8731, 80.7718]; // lat, lng
const SL_BOUNDS = [
  [5.916, 79.521], // SW
  [9.835, 81.879], // NE
];

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapPickerSriLanka({
  value, // [lat, lng] or null
  onChange, // ( [lat, lng] ) => void
  height = 340, // px
  zoom = 7,
}) {
  const [pos, setPos] = useState(value || null);

  useEffect(() => {
    // sync from parent when changed
    if (value && (value[0] !== pos?.[0] || value[1] !== pos?.[1])) {
      setPos(value);
    }
  }, [value]);

  const mapStyle = useMemo(
    () => ({
      height: `${height}px`,
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
    }),
    [height]
  );

  const handlePick = (latlng) => {
    setPos(latlng);
    onChange?.(latlng);
  };

  return (
    <div>
      <MapContainer
        center={pos || SL_CENTER}
        zoom={zoom}
        minZoom={6}
        maxZoom={18}
        style={mapStyle}
        scrollWheelZoom={true}
        maxBounds={SL_BOUNDS}
        maxBoundsViscosity={0.8}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <ClickHandler onPick={handlePick} />

        {pos && (
          <Marker
            position={pos}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const c = e.target.getLatLng();
                handlePick([c.lat, c.lng]);
              },
            }}
          />
        )}
      </MapContainer>

      <div className="mt-2 text-sm text-slate-600">
        {pos ? (
          <span>
            Picked: <b>{pos[0].toFixed(5)}</b>, <b>{pos[1].toFixed(5)}</b>
          </span>
        ) : (
          <span>Tip: Click the map to drop a marker. Drag to adjust.</span>
        )}
      </div>

      {/* Optional: Quick geolocate */}
      <button
        type="button"
        className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
        onClick={() => {
          if (!navigator.geolocation) return alert('Geolocation not supported');
          navigator.geolocation.getCurrentPosition(
            (r) => handlePick([r.coords.latitude, r.coords.longitude]),
            (err) => alert(err.message),
            { enableHighAccuracy: true }
          );
        }}
      >
        Use my current location
      </button>
    </div>
  );
}
