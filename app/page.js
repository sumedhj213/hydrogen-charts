"use client";
import dynamic from "next/dynamic";

const MasterEnergyDashboard = dynamic(
  () => import("./components/energy_cost_and_carbon_dashboard"),
  { ssr: false }
);

export default function Home() {
  return (
    <main>
      <MasterEnergyDashboard />
    </main>
  );
}