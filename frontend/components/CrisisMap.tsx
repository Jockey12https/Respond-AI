"use client";
import React from "react";

type Point = { id: string; name: string; type: string; location: { lat: number; lng: number } };

const MOCK: Point[] = [
  { id: "h1", name: "City Hospital", type: "Hospital", location: { lat: 8.524, lng: 76.936 } },
  { id: "e1", name: "Relief Point A", type: "Relief", location: { lat: 8.526, lng: 76.942 } },
  { id: "u1", name: "Unsafe Zone: Riverbank", type: "Unsafe", location: { lat: 8.518, lng: 76.928 } }
];

export default function CrisisMap() {
  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
      <h3 style={{ marginTop: 0 }}>Crisis Map (mock)</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {MOCK.map(p => (
          <div key={p.id} style={{ padding: 8, border: "1px solid #f2f2f2", borderRadius: 6 }}>
            <strong>{p.name}</strong>
            <div style={{ fontSize: 12 }}>{p.type}</div>
            <div style={{ fontSize: 11, color: "#666" }}>({p.location.lat}, {p.location.lng})</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Interactive map can be integrated (Leaflet) later.</div>
    </div>
  );
}
