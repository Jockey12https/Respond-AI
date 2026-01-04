"use client";
import CrisisMap from "../../components/CrisisMap";
import Alerts from "../../components/Alerts";
import ZonalStatus from "../../components/ZonalStatus";

export default function Dashboard() {
  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
      <div>
        <h2>Authority Dashboard</h2>
        <CrisisMap />
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ZonalStatus />
        <Alerts />
      </aside>
    </div>
  );
}
