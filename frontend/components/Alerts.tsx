"use client";
import { useEffect, useState } from "react";

type AlertItem = { id: string; title: string; body: string; from: string; time?: string };

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("http://localhost:4000/api/alerts")
      .then((r) => r.json())
      .then((data) => { if (mounted && Array.isArray(data)) setAlerts(data); })
      .catch(() => {
        // fallback mock data
        setAlerts([
          { id: "1", title: "Road Closure", body: "Main St closed due to flooding", from: "Authority", time: "10m" },
          { id: "2", title: "Water Distribution", body: "Relief point at Stadium", from: "Moderator", time: "1h" }
        ]);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
      <h3 style={{ marginTop: 0 }}>Alerts & Notifications</h3>
      {alerts.length === 0 && <div>No alerts</div>}
      {alerts.map(a => (
        <div key={a.id} style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
          <strong>{a.title}</strong>
          <div style={{ fontSize: 12 }}>{a.body}</div>
          <div style={{ fontSize: 11, color: "#666" }}>{a.from} · {a.time ?? "now"}</div>
        </div>
      ))}
    </div>
  );
}
