"use client";
import SOSButton from "../components/SOSButton";
import Alerts from "../components/Alerts";
import CrisisMap from "../components/CrisisMap";
import ZonalStatus from "../components/ZonalStatus";

export default function Home() {
  return (
    <main style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
      <div>
        <h1>Crisis Management Platform</h1>
        <p>Quick actions</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/report"><button>Report Incident</button></a>
          <SOSButton />
        </div>

        <div style={{ marginTop: 16 }}>
          <CrisisMap />
        </div>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ZonalStatus />
        <Alerts />
      </aside>
    </main>
  );
}
