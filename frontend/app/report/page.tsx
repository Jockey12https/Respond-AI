"use client";
import { useState } from "react";
import MapPicker from "../../components/MapPicker";

export default function Report() {
  const [loc, setLoc] = useState<{ lat?: number; lng?: number } | null>(null);
  const [type, setType] = useState("ACTIVE");
  const [desc, setDesc] = useState("");

  const sendReport = async () => {
    await fetch("http://localhost:4000/api/crisis/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, location: loc, description: desc })
    }).then(() => alert("Help request sent"), () => alert("Failed to send"));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Emergency Report</h2>
      <div style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Type</label>
          <br />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ACTIVE">Active Incident</option>
            <option value="INJURY">Injury</option>
            <option value="FIRE">Fire</option>
            <option value="SOS">SOS</option>
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Description (short)</label>
          <br />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Location</label>
          <MapPicker onChange={(v) => setLoc(v)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={sendReport}>Send Help Request</button>
        </div>
      </div>
    </div>
  );
}
