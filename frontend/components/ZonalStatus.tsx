"use client";
import { useEffect, useState } from "react";

export default function ZonalStatus() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/mode")
      .then(r => r.json())
      .then(d => setStatus(d.mode))
      .catch(() => setStatus("NORMAL"));
  }, []);

  const color = status === "EMERGENCY" ? "#c62828" : status === "ALERT" ? "#ff8f00" : "#2e7d32";

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
      <strong>Zonal Status</strong>
      <div style={{ marginTop: 8, color }}>{status ?? "--"}</div>
    </div>
  );
}
