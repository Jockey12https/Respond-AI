"use client";
import React from "react";

export default function SOSButton() {
  const sendSOS = async () => {
    let lat = 0;
    let lng = 0;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        lat = p.coords.latitude;
        lng = p.coords.longitude;
        void fetch("http://localhost:4000/api/crisis/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "SOS", location: { lat, lng }, note: "One-tap SOS" })
        }).then(() => alert("SOS sent"), () => alert("SOS failed"));
      }, () => alert("Unable to get location"));
    } else {
      if (!confirm("Geolocation unavailable. Send SOS without location?")) return;
      await fetch("http://localhost:4000/api/crisis/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "SOS", location: null, note: "One-tap SOS" })
      });
      alert("SOS sent");
    }
  };

  return (
    <button style={{ background: "#c62828", color: "white", padding: "8px 12px", borderRadius: 6 }} onClick={sendSOS}>
      SOS
    </button>
  );
}
