import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ErrorBar, ReferenceLine, Legend,
  LineChart, Line, ScatterChart, Scatter
} from "recharts";

const ammoniaColors = [
  { name: "Grey NH₃", mid: 400, min: 300, max: 500, color: "#94a3b8", co2: 2.2, route: "Natural gas + HB" },
  { name: "Blue NH₃", mid: 435, min: 320, max: 550, color: "#60a5fa", co2: 0.5, route: "Gas + CCS + HB" },
  { name: "Turquoise NH₃", mid: 550, min: 400, max: 700, color: "#2dd4bf", co2: 0.3, route: "Pyrolysis + HB" },
  { name: "Green NH₃", mid: 840, min: 700, max: 1200, color: "#4ade80", co2: 0.15, route: "Green H₂ + HB" },
];

const carriers = [
  { name: "Grey NH₃",    price: 400,  pricePerGJ: 10.5, co2: 2.2,  transport: 1.09, color: "#94a3b8" },
  { name: "Blue NH₃",   price: 435,  pricePerGJ: 11.4, co2: 0.5,  transport: 1.09, color: "#60a5fa" },
  { name: "Turquoise",  price: 550,  pricePerGJ: 14.4, co2: 0.3,  transport: 1.09, color: "#2dd4bf" },
  { name: "Green NH₃",  price: 840,  pricePerGJ: 22.0, co2: 0.15, transport: 1.11, color: "#4ade80" },
  { name: "LNG",         price: 700,  pricePerGJ: 14.0, co2: 2.75, transport: 0.74, color: "#f97316" },
  { name: "Methanol",    price: 450,  pricePerGJ: 22.5, co2: 1.5,  transport: 0.68, color: "#facc15" },
  { name: "HFO",         price: 420,  pricePerGJ: 10.0, co2: 3.1,  transport: 0.53, color: "#a8a29e" },
  { name: "Green H₂",   price: 4000, pricePerGJ: 111,  co2: 0.05, transport: 3.24, color: "#c084fc" },
];

const convergence = [
  { year: "2025", grey: 400, blue: 435, turquoise: 550, green: 840 },
  { year: "2027", grey: 390, blue: 415, turquoise: 500, green: 650 },
  { year: "2030", grey: 380, blue: 400, turquoise: 450, green: 480 },
  { year: "2035", grey: 370, blue: 385, turquoise: 410, green: 390 },
  { year: "2040", grey: 360, blue: 370, turquoise: 375, green: 360 },
  { year: "2050", grey: 350, blue: 340, turquoise: 320, green: 310 },
];

const transportData = [
  { name: "HFO", cost: 0.53, color: "#a8a29e" },
  { name: "Methanol", cost: 0.68, color: "#facc15" },
  { name: "LNG", cost: 0.74, color: "#f97316" },
  { name: "NH₃", cost: 1.09, color: "#60a5fa" },
  { name: "Green NH₃\n(w/ carbon tax)", cost: 1.11, color: "#4ade80" },
  { name: "Green H₂", cost: 3.24, color: "#c084fc" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a", border: "1px solid #334155",
      borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#e2e8f0",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: "#f8fafc" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <span style={{ color: "#e2e8f0", fontFamily: "monospace" }}>{p.value}{p.unit || ""}</span>
        </div>
      ))}
    </div>
  );
};

const TABS = ["$/tonne", "$/GJ", "CO₂ vs Cost", "Transport", "Convergence"];

export default function AmmoniaCharts() {
  const [tab, setTab] = useState("$/tonne");

  // For range chart, format data with error bars
  const rangeData = ammoniaColors.map(d => ({
    ...d,
    error: [d.mid - d.min, d.max - d.mid],
  }));

  const carriersNoH2 = carriers.filter(d => d.name !== "Green H₂");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080f1e",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      padding: "32px 24px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto 28px" }}>
        <p style={{ color: "#38bdf8", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
          ENERGY TRANSITION · PRICE BENCHMARKING · 2025
        </p>
        <h1 style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 700, color: "#f8fafc", margin: "0 0 4px", letterSpacing: "-0.02em", fontFamily: "Georgia, serif" }}>
          Ammonia Color Spectrum vs. Energy Carriers
        </h1>
        <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
          Production cost · $/tonne · $/GJ · CO₂ intensity · Ocean transport cost
        </p>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 900, margin: "0 auto 28px", display: "flex", gap: 4, borderBottom: "1px solid #1e293b", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 16px", background: "none", border: "none",
            borderBottom: tab === t ? "2px solid #38bdf8" : "2px solid transparent",
            color: tab === t ? "#38bdf8" : "#475569",
            cursor: "pointer", fontSize: 11, letterSpacing: "0.08em",
            textTransform: "uppercase", transition: "all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* $/tonne — range bars for ammonia, then all carriers */}
        {tab === "$/tonne" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Mid-point price with min–max range shown via error bars. Green H₂ (~$4,000/t) excluded from carrier chart for scale.
            </p>

            {/* Ammonia range chart */}
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 12px 12px", marginBottom: 20 }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4, marginLeft: 8 }}>
                AMMONIA COLORS — PRICE RANGE (USD/t)
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={rangeData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} domain={[0, 1300]} />
                  <Tooltip content={<CustomTooltip />} formatter={(v, n) => [`$${v}/t`, n === "mid" ? "Midpoint" : n]} />
                  <Bar dataKey="mid" name="Midpoint" radius={[4,4,0,0]}>
                    {rangeData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9} />)}
                    <ErrorBar dataKey="error" width={6} strokeWidth={2} stroke="#ffffff50" direction="y" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* All carriers bar chart */}
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 12px 12px" }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4, marginLeft: 8 }}>
                ALL ENERGY CARRIERS vs. AMMONIA — USD/t (excl. Green H₂ $4,000/t)
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={carriersNoH2} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => [`$${v}/t`, "Cost"]} />
                  <Bar dataKey="price" name="Cost" radius={[4,4,0,0]}>
                    {carriersNoH2.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Green H2 callout */}
            <div style={{ marginTop: 14, padding: "12px 18px", background: "#1a0e2e", border: "1px solid #6b21a840", borderRadius: 8, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#c084fc", boxShadow: "0 0 10px #c084fc80", flexShrink: 0 }} />
              <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>Green H₂: ~$4,000/t</span>
              <span style={{ color: "#475569", fontSize: 12 }}>Off-scale — 9–13× more expensive than grey ammonia per tonne; highest energy density at 120 MJ/kg.</span>
            </div>
          </div>
        )}

        {/* $/GJ */}
        {tab === "$/GJ" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Cost normalized by energy content (LHV basis). Reveals true energy economy when comparing fuels with vastly different heating values.
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 12px 12px" }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4, marginLeft: 8 }}>
                COST PER GJ (USD/GJ) — ALL CARRIERS
              </p>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={carriers} layout="vertical" margin={{ top: 10, right: 80, left: 80, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => [`$${v}/GJ`, "Cost/GJ"]} />
                  <Bar dataKey="pricePerGJ" name="$/GJ" radius={[0,4,4,0]}>
                    {carriers.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              {[
                { label: "HFO (cheapest/GJ)", val: "$10.0/GJ", color: "#a8a29e", note: "Highest carbon intensity" },
                { label: "Grey NH₃", val: "$10.5/GJ", color: "#94a3b8", note: "Competitive with HFO" },
                { label: "Green NH₃ vs. Green H₂", val: "$22 vs $111/GJ", color: "#4ade80", note: "NH₃ is 5× cheaper to store/ship" },
                { label: "Green H₂ (most expensive)", val: "$111/GJ", color: "#c084fc", note: "Despite highest energy density" },
              ].map(item => (
                <div key={item.label} style={{ background: "#0d1b2e", border: `1px solid ${item.color}30`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ color: item.color, fontSize: 11, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{item.val}</div>
                  <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CO2 vs Cost scatter */}
        {tab === "CO₂ vs Cost" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Bubble position maps cost (x-axis) against CO₂ intensity (y-axis). Bottom-left = ideal (low cost, low emissions). Each bubble sized equally for readability.
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 12px 20px" }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4, marginLeft: 8 }}>
                CO₂ INTENSITY vs. PRODUCTION COST
              </p>
              <ResponsiveContainer width="100%" height={380}>
                <ScatterChart margin={{ top: 20, right: 40, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number" dataKey="price" name="Cost"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={v => `$${v}`}
                    label={{ value: "Production Cost ($/t)", position: "insideBottom", offset: -20, fill: "#475569", fontSize: 11 }}
                    domain={[0, 1300]}
                  />
                  <YAxis
                    type="number" dataKey="co2" name="CO₂"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={v => `${v} t`}
                    label={{ value: "CO₂ Intensity (tCO₂/t fuel)", angle: -90, position: "insideLeft", offset: 20, fill: "#475569", fontSize: 11 }}
                    domain={[0, 3.5]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#e2e8f0" }}>
                          <p style={{ fontWeight: 700, color: d.color, marginBottom: 6 }}>{d.name}</p>
                          <div>Cost: <span style={{ fontFamily: "monospace" }}>${d.price}/t</span></div>
                          <div>CO₂: <span style={{ fontFamily: "monospace" }}>{d.co2} tCO₂/t</span></div>
                          <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>{d.route || ""}</div>
                        </div>
                      );
                    }}
                  />
                  {carriersNoH2.map((d, i) => (
                    <Scatter
                      key={d.name}
                      name={d.name}
                      data={[d]}
                      fill={d.color}
                      shape={(props) => {
                        const { cx, cy } = props;
                        return (
                          <g>
                            <circle cx={cx} cy={cy} r={18} fill={d.color} fillOpacity={0.2} stroke={d.color} strokeWidth={1.5} />
                            <circle cx={cx} cy={cy} r={8} fill={d.color} fillOpacity={0.9} />
                            <text x={cx} y={cy - 24} textAnchor="middle" fill={d.color} fontSize={10}>{d.name}</text>
                          </g>
                        );
                      }}
                    />
                  ))}
                  {/* Ideal zone */}
                  <ReferenceLine x={500} stroke="#1e3a5f" strokeDasharray="4 4" label={{ value: "← cheaper", position: "top", fill: "#334155", fontSize: 10 }} />
                  <ReferenceLine y={1.0} stroke="#1e3a5f" strokeDasharray="4 4" label={{ value: "↓ cleaner", position: "right", fill: "#334155", fontSize: 10 }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 14, padding: "12px 18px", background: "#071a0e", border: "1px solid #14532d40", borderRadius: 8 }}>
              <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 12 }}>Key takeaway: </span>
              <span style={{ color: "#64748b", fontSize: 12 }}>Grey ammonia and HFO cluster low-cost/high-carbon (top-left). Green & turquoise NH₃ are low-carbon but high-cost today. Blue ammonia offers the best cost–emissions tradeoff in the near term. Green H₂ (not shown: $4,000/t, 0.05 tCO₂) is off-scale to the right.</span>
            </div>
          </div>
        )}

        {/* Transport costs */}
        {tab === "Transport" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Ocean shipping cost (USD/GJ) for long-distance energy carrier transport. Based on 160,000 m³ tankers, Qatar→Japan route. Source: Al-Breiki & Bicer (2020).
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 12px 12px", marginBottom: 20 }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4, marginLeft: 8 }}>
                OCEAN TRANSPORT COST (USD/GJ)
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={transportData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => [`$${v}/GJ`, "Transport Cost"]} />
                  <Bar dataKey="cost" name="$/GJ" radius={[4,4,0,0]}>
                    {transportData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                { label: "Cheapest to ship", carrier: "HFO / DME", val: "$0.53/GJ", color: "#a8a29e", note: "Ambient liquid, existing fleet" },
                { label: "Ammonia transport", carrier: "NH₃ (all colors)", val: "$1.09–1.11/GJ", color: "#60a5fa", note: "~50% more than LNG; purpose-built tankers needed" },
                { label: "Most expensive", carrier: "Liquid H₂", val: "$3.24/GJ", color: "#c084fc", note: "Cryogenic at -253°C; 3× NH₃ transport cost" },
              ].map(item => (
                <div key={item.label} style={{ background: "#0d1b2e", border: `1px solid ${item.color}30`, borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: item.color, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.carrier}</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{item.val}</div>
                  <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.5 }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convergence */}
        {tab === "Convergence" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Cost convergence trajectory for all ammonia colors (USD/t). Green ammonia projected to reach near-parity with grey by ~2035–2040 under $150/tCO₂ carbon price. Sources: IRENA (2022), OIES (2024).
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 12px 20px" }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4, marginLeft: 8 }}>
                AMMONIA PRICE CONVERGENCE 2025–2050 (USD/t)
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={convergence} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} domain={[250, 900]} />
                  <Tooltip content={<CustomTooltip />} formatter={(v, name) => [`$${v}/t`, name.charAt(0).toUpperCase() + name.slice(1) + " NH₃"]} />
                  <Legend
                    formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{value.charAt(0).toUpperCase() + value.slice(1)} NH₃</span>}
                  />
                  <Line type="monotone" dataKey="grey" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4, fill: "#94a3b8" }} />
                  <Line type="monotone" dataKey="blue" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4, fill: "#60a5fa" }} />
                  <Line type="monotone" dataKey="turquoise" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 4, fill: "#2dd4bf" }} />
                  <Line type="monotone" dataKey="green" stroke="#4ade80" strokeWidth={2.5} dot={{ r: 5, fill: "#4ade80" }} strokeDasharray="6 2" />
                  <ReferenceLine y={380} stroke="#ffffff15" strokeDasharray="4 4" label={{ value: "Convergence zone ~2035", position: "right", fill: "#475569", fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Green NH₃ cost drop", val: "−63%", note: "From $840/t (2025) → $310/t (2050)", color: "#4ade80" },
                { label: "Parity with grey", val: "~2035–40", note: "Assuming $150/tCO₂ and sub-$20/MWh renewables", color: "#38bdf8" },
                { label: "Turquoise advantage", val: "2027–32", note: "Window where turquoise beats blue on cost + carbon", color: "#2dd4bf" },
              ].map(item => (
                <div key={item.label} style={{ background: "#0d1b2e", border: `1px solid ${item.color}30`, borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ color: "#475569", fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155" }}>
          <span>SOURCES: IMARC, S&P Global, IRENA, Oxford OIES ET40, Al-Breiki & Bicer (2020), Zhang et al. (2023)</span>
          <span>Q3–Q4 2025</span>
        </div>
      </div>
    </div>
  );
}
