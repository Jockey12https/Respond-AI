"use client";
import { useState } from "react";

type Props = {
  value?: { lat?: number; lng?: number };
  onChange?: (v: { lat: number; lng: number }) => void;
};

export default function MapPicker({ value, onChange }: Props) {
  const [lat, setLat] = useState<number | string>(value?.lat ?? "");
  const [lng, setLng] = useState<number | string>(value?.lng ?? "");

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const la = Number(pos.coords.latitude.toFixed(6));
      const lo = Number(pos.coords.longitude.toFixed(6));
      setLat(la);
      setLng(lo);
      onChange?.({ lat: la, lng: lo });
    }, () => alert("Unable to retrieve your location"));
  };

  const handleBlur = () => {
    const la = Number(lat);
    const lo = Number(lng);
    if (!isNaN(la) && !isNaN(lo)) onChange?.({ lat: la, lng: lo });
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
      <div style={{ marginBottom: 8 }}>
        <button type="button" onClick={useMyLocation}>Use my location</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div>
          <label>Latitude</label>
          <br />
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onBlur={handleBlur}
            placeholder="8.52"
          />
        </div>
        <div>
          <label>Longitude</label>
          <br />
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            onBlur={handleBlur}
            placeholder="76.94"
          />
        </div>
      </div>
    </div>
  );
}
