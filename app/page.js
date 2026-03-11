"use client";
import dynamic from "next/dynamic";

const HydrogenColorSpectrum = dynamic(
  () => import("./components/hydrogen_color_spectrum"),
  { ssr: false }
);

export default function Home() {
  return (
    <main>
      <HydrogenColorSpectrum />
    </main>
  );
}
