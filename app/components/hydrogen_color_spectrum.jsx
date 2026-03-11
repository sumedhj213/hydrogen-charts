"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ScatterChart, Scatter,
  LineChart, Line, Legend, ReferenceLine
} from "recharts";

const H2_COLORS = [
  {
    key: "black",
    label: "Black / Brown",
    color: "#292524",
    border: "#57534e",
    textColor: "#a8a29e",
    priceMin: 0.9,
    priceMax: 1.5,
    priceMid: 1.2,
    co2: 19,
    source: "Coal gasification",
    maturity: "Mature",
    maturityScore: 5,
    share: 13,
    note: "Cheapest but most polluting — 19 tCO₂/tH₂. Black = bituminous coal; brown = lignite.",
  },
  {
    key: "grey",
    label: "Grey",
    color: "#6b7280",
    border: "#9ca3af",
    textColor: "#d1d5db",
    priceMin: 1.7,
    priceMax: 2.3,
    priceMid: 2.0,
    co2: 9,
    source: "Natural gas SMR",
    maturity: "Dominant (~60% of supply)",
    maturityScore: 5,
    share: 60,
    note: "Most common today. 9–12 tCO₂/tH₂. Tightly linked to Henry Hub / TTF gas prices.",
  },
  {
    key: "blue",
    label: "Blue",
    color: "#3b82f6",
    border: "#60a5fa",
    textColor: "#bfdbfe",
    priceMin: 1.3,
    priceMax: 3.6,
    priceMid: 2.5,
    co2: 2.5,
    source: "Natural gas SMR + CCS",
    maturity: "Early Commercial",
    maturityScore: 4,
    share: 1,
    note: "CCS captures 70–95% of CO₂. Wide price range reflects gas price and CCS proximity. Near-term bridge.",
  },
  {
    key: "turquoise",
    label: "Turquoise",
    color: "#14b8a6",
    border: "#2dd4bf",
    textColor: "#99f6e4",
    priceMin: 1.6,
    priceMax: 3.2,
    priceMid: 2.2,
    co2: 0.8,
    source: "Methane pyrolysis → H₂ + solid carbon",
    maturity: "Pilot / Demo",
    maturityScore: 2,
    share: 0,
    note: "No CO₂ emissions — carbon exits as solid. Economics hinge on carbon black offtake (>$2,000/t ideal). Monolith, BASF leading.",
  },
  {
    key: "pink",
    label: "Pink / Purple",
    color: "#ec4899",
    border: "#f472b6",
    textColor: "#fbcfe8",
    priceMin: 3.0,
    priceMax: 6.0,
    priceMid: 4.5,
    co2: 0.3,
    source: "Electrolysis powered by nuclear",
    maturity: "Early Commercial",
    maturityScore: 2,
    share: 0,
    note: "Near-zero emissions, stable baseload supply unlike intermittent renewables. First commercial deal: Vattenfall → Linde (Sweden, 2022).",
  },
  {
    key: "yellow",
    label: "Yellow",
    color: "#eab308",
    border: "#facc15",
    textColor: "#fef08a",
    priceMin: 3.5,
    priceMax: 6.0,
    priceMid: 4.5,
    co2: 0.5,
    source: "Solar-powered electrolysis",
    maturity: "Early Commercial",
    maturityScore: 2,
    share: 0,
    note: "Subset of green H₂ using dedicated solar only. Gains traction in MENA and Australia. Cheaper than green where solar LCOE is very low.",
  },
  {
    key: "green",
    label: "Green",
    color: "#22c55e",
    border: "#4ade80",
    textColor: "#bbf7d0",
    priceMin: 3.5,
    priceMax: 7.4,
    priceMid: 5.0,
    co2: 0.15,
    source: "Renewable electrolysis (wind/solar)",
    maturity: "Early Commercial",
    maturityScore: 3,
    share: 1,
    note: "Near-zero lifecycle emissions. Projected to reach $1–2/kg by 2030 in best-resource regions. DOE H2Shot target: $1/kg by 2030.",
  },
  {
    key: "white",
    label: "White / Gold",
    color: "#f8fafc",
    border: "#cbd5e1",
    textColor: "#94a3b8",
    priceMin: 0.3,
    priceMax: 2.5,
    priceMid: 1.0,
    co2: 0.4,
    source: "Natural geological H₂ (serpentinization, radiolysis)",
    maturity: "Exploration",
    maturityScore: 1,
    share: 0,
    note: "Wild card. Only operational site: Bourakébougou, Mali (5 t/yr). USGS estimates 1B–10T tonnes in subsurface. Carbon intensity as low as 0.4 kgCO₂e/kgH₂.",
  },
];

const convergenceData = [
  { year: "2025", grey: 2.0, blue: 2.5, turquoise: 2.2, green: 5.0 },
  { year: "2027", grey: 2.0, blue: 2.3, turquoise: 2.0, green: 3.5 },
  { year: "2030", grey: 1.9, blue: 2.1, turquoise: 1.8, green: 2.0 },
  { year: "2035", grey: 1.8, blue: 1.9, turquoise: 1.6, green: 1.4 },
  { year: "2040", grey: 1.7, blue: 1.7, turquoise: 1.5, green: 1.1 },
  { year: "2050", grey: 1.6, blue: 1.5, turquoise: 1.3, green: 0.9 },
];

const TABS = ["Spectrum", "Price Range", "CO₂ vs Cost", "Convergence", "Market Share"];

const Tooltip2 = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#e2e8f0" }}>
      <p style={{ fontWeight: 700, marginBottom: 6 }}>{label || payload[0]?.payload?.label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#94a3b8" }}>
          {p.name}: <span style={{ fontFamily: "monospace", color: "#f1f5f9" }}>{p.value}{p.unit || ""}</span>
        </div>
      ))}
    </div>
  );
};

export default function HydrogenColors() {
  const [tab, setTab] = useState("Spectrum");
  const [selected, setSelected] = useState(null);

  const sel = selected ? H2_COLORS.find(d => d.key === selected) : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0a1628 0%, #050d1a 60%, #000 100%)",
      fontFamily: "'IBM Plex Mono', monospace",
      color: "#e2e8f0",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{ padding: "36px 40px 24px", borderBottom: "1px solid #1e293b", background: "rgba(5,13,26,0.9)" }}>
        <p style={{ color: "#38bdf8", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>
          ENERGY TRANSITION · HYDROGEN ECONOMICS · 2025
        </p>
        <h1 style={{ fontSize: "clamp(20px,3.5vw,32px)", fontWeight: 700, color: "#f8fafc", margin: "0 0 4px", letterSpacing: "-0.02em", fontFamily: "Georgia, serif" }}>
          The Hydrogen Color Spectrum
        </h1>
        <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
          8 production pathways · Price · CO₂ intensity · Market maturity · Convergence outlook
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e293b", padding: "0 40px", background: "#06101f" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 18px", background: "none", border: "none",
            borderBottom: tab === t ? "2px solid #38bdf8" : "2px solid transparent",
            color: tab === t ? "#38bdf8" : "#475569",
            cursor: "pointer", fontSize: 11, letterSpacing: "0.08em",
            textTransform: "uppercase", transition: "all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 40px" }}>

        {/* ── SPECTRUM TAB ── */}
        {tab === "Spectrum" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 24 }}>
              Click any color to expand details. Ordered left→right by ascending production cost midpoint.
            </p>
            {/* Color strip */}
            <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", marginBottom: 28, height: 18, boxShadow: "0 0 30px rgba(56,189,248,0.1)" }}>
              {H2_COLORS.map(d => (
                <div key={d.key} style={{ flex: 1, background: d.color, opacity: 0.85, transition: "flex 0.3s", cursor: "pointer", flex: selected === d.key ? 3 : 1 }}
                  onClick={() => setSelected(selected === d.key ? null : d.key)} />
              ))}
            </div>

            {/* Cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
              {H2_COLORS.map(d => (
                <div
                  key={d.key}
                  onClick={() => setSelected(selected === d.key ? null : d.key)}
                  style={{
                    background: selected === d.key ? `${d.color}18` : "rgba(15,23,42,0.7)",
                    border: `1px solid ${selected === d.key ? d.border : "#1e3a5f"}`,
                    borderTop: `3px solid ${d.color}`,
                    borderRadius: 10,
                    padding: 18,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, boxShadow: `0 0 8px ${d.color}80`, marginBottom: 8 }} />
                      <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13 }}>{d.label}</div>
                      <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{d.maturity}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: d.color, fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>${d.priceMid}</div>
                      <div style={{ color: "#475569", fontSize: 9 }}>/kg (mid)</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
                    <div>Range: <span style={{ color: d.textColor, fontFamily: "monospace" }}>${d.priceMin}–${d.priceMax}/kg</span></div>
                    <div>CO₂: <span style={{ color: d.co2 > 5 ? "#f87171" : d.co2 > 1 ? "#fb923c" : "#4ade80", fontFamily: "monospace" }}>{d.co2} tCO₂/tH₂</span></div>
                  </div>
                  {selected === d.key && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${d.color}30`, fontSize: 11, color: "#94a3b8", lineHeight: 1.7 }}>
                      <div style={{ marginBottom: 6 }}><span style={{ color: "#64748b" }}>Source: </span>{d.source}</div>
                      <div>{d.note}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 8, fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
              <span style={{ color: "#38bdf8", fontWeight: 700 }}>Scale context: </span>
              Grey H₂ accounts for ~60% of global production, black/brown ~13%, all low-carbon options combined (green, blue, pink, turquoise, yellow) represent under 4% of supply today.
            </div>
          </div>
        )}

        {/* ── PRICE RANGE TAB ── */}
        {tab === "Price Range" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Production cost per kg H₂ (USD). Midpoint shown as bar; min/max as error range. White/Gold shown separately due to speculative nature.
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 8px 16px", marginBottom: 20 }}>
              <p style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginLeft: 12, marginBottom: 4 }}>PRODUCTION COST (USD/kg H₂)</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={H2_COLORS} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} domain={[0, 8]} />
                  <Tooltip content={<Tooltip2 />} formatter={(v) => [`$${v}/kg`, "Cost"]} />
                  <Bar dataKey="priceMid" name="Cost midpoint" radius={[4,4,0,0]}>
                    {H2_COLORS.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={d.key === "white" ? 0.5 : 0.85} stroke={d.border} strokeWidth={d.key === "white" ? 1 : 0} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Range table */}
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                    {["Color", "Min ($/kg)", "Mid ($/kg)", "Max ($/kg)", "CO₂ (tCO₂/t)", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {H2_COLORS.map((d, i) => (
                    <tr key={d.key} style={{ borderTop: "1px solid #0f1f35", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.15)" }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 9, height: 9, borderRadius: "50%", background: d.color, border: `1px solid ${d.border}` }} />
                          <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>{d.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>${d.priceMin}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "monospace", color: d.color, fontWeight: 700, fontSize: 13 }}>${d.priceMid}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>${d.priceMax}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "monospace", fontSize: 12 }}>
                        <span style={{ color: d.co2 > 5 ? "#f87171" : d.co2 > 1 ? "#fb923c" : "#4ade80" }}>{d.co2}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: `${d.color}20`, color: d.color, padding: "2px 8px", borderRadius: 4, fontSize: 10 }}>{d.maturity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "10px 14px", borderTop: "1px solid #1e293b", fontSize: 10, color: "#334155" }}>
                Sources: UPSC Prep (2025), MDPI (2023), PCI Energy, Thunder Said Energy (2024), Fast Company, Rystad Energy
              </div>
            </div>
          </div>
        )}

        {/* ── CO2 VS COST SCATTER ── */}
        {tab === "CO₂ vs Cost" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Each dot = one hydrogen color. Bottom-left = ideal (low cost + low emissions). Bottom-right = low emissions but expensive. Top-left = cheap but highly polluting.
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "24px 12px 24px" }}>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 40, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number" dataKey="priceMid" name="Cost"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={v => `$${v}/kg`}
                    domain={[0, 7]}
                    label={{ value: "Production Cost ($/kg)", position: "insideBottom", offset: -22, fill: "#475569", fontSize: 11 }}
                  />
                  <YAxis
                    type="number" dataKey="co2" name="CO₂"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    label={{ value: "CO₂ Intensity (tCO₂/tH₂)", angle: -90, position: "insideLeft", offset: 20, fill: "#475569", fontSize: 11 }}
                    domain={[0, 22]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div style={{ background: "#0f172a", border: `1px solid ${d.border}`, borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#e2e8f0" }}>
                          <p style={{ fontWeight: 700, color: d.color, marginBottom: 6 }}>{d.label} H₂</p>
                          <div>Cost: <span style={{ fontFamily: "monospace" }}>${d.priceMin}–${d.priceMax}/kg</span></div>
                          <div>CO₂: <span style={{ fontFamily: "monospace" }}>{d.co2} tCO₂/tH₂</span></div>
                          <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>{d.source}</div>
                        </div>
                      );
                    }}
                  />
                  {H2_COLORS.map((d) => (
                    <Scatter key={d.key} name={d.label} data={[d]} fill={d.color}
                      shape={({ cx, cy }) => (
                        <g>
                          <circle cx={cx} cy={cy} r={22} fill={d.color} fillOpacity={0.1} stroke={d.color} strokeWidth={1} />
                          <circle cx={cx} cy={cy} r={10} fill={d.color} fillOpacity={0.9} />
                          <text x={cx} y={cy - 28} textAnchor="middle" fill={d.textColor} fontSize={9} fontFamily="monospace">{d.label}</text>
                        </g>
                      )}
                    />
                  ))}
                  {/* Ideal zone indicator */}
                  <ReferenceLine x={2} stroke="#1e3a5f" strokeDasharray="4 4" />
                  <ReferenceLine y={2} stroke="#1e3a5f" strokeDasharray="4 4" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
              {[
                { zone: "Top-left: Cheap & Dirty", carriers: "Black, Grey", color: "#f87171", note: "Dominant today but climate-incompatible" },
                { zone: "Middle: Bridge options", carriers: "Blue, Turquoise", color: "#fb923c", note: "Reduced emissions, manageable cost" },
                { zone: "Bottom-right: Clean & Costly", carriers: "Green, Pink, Yellow", color: "#4ade80", note: "Net-zero compatible; cost falling fast" },
              ].map(z => (
                <div key={z.zone} style={{ background: "#0d1b2e", border: `1px solid ${z.color}30`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ color: z.color, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{z.zone}</div>
                  <div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{z.carriers}</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>{z.note}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(248,250,252,0.03)", border: "1px solid rgba(248,250,252,0.1)", borderRadius: 8, fontSize: 11, color: "#64748b" }}>
              <span style={{ color: "#f8fafc", fontWeight: 700 }}>White / Gold H₂ </span>outlier: estimated $0.3–2.5/kg with 0.4 tCO₂/tH₂ — potentially the ideal bottom-left candidate, but at pre-commercial exploration stage only.
            </div>
          </div>
        )}

        {/* ── CONVERGENCE TAB ── */}
        {tab === "Convergence" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Cost trajectory 2025–2050 (USD/kg H₂) for the four primary production colors. DOE H2Shot target: $1/kg green hydrogen by 2030.
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "24px 12px 16px", marginBottom: 20 }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={convergenceData} margin={{ top: 20, right: 40, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} domain={[0.5, 5.5]} />
                  <Tooltip content={<Tooltip2 />} formatter={(v, n) => [`$${v}/kg`, n.charAt(0).toUpperCase() + n.slice(1) + " H₂"]} />
                  <Legend formatter={v => <span style={{ color: "#94a3b8", fontSize: 10 }}>{v.charAt(0).toUpperCase() + v.slice(1)} H₂</span>} />
                  <ReferenceLine y={1.0} stroke="#22c55e40" strokeDasharray="5 3" label={{ value: "DOE $1/kg target", position: "right", fill: "#22c55e", fontSize: 9 }} />
                  <Line type="monotone" dataKey="grey" stroke="#6b7280" strokeWidth={2} dot={{ r: 4, fill: "#6b7280" }} />
                  <Line type="monotone" dataKey="blue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="turquoise" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: "#14b8a6" }} />
                  <Line type="monotone" dataKey="green" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 2" dot={{ r: 5, fill: "#22c55e" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Green H₂ cost drop", val: "−82%", sub: "$5.0 → $0.9/kg by 2050", color: "#22c55e" },
                { label: "Parity w/ grey", val: "~2030", sub: "Best-resource regions w/ carbon price", color: "#38bdf8" },
                { label: "Turquoise advantage", val: "2025–32", sub: "Cheapest low-carbon if carbon offtake works", color: "#14b8a6" },
                { label: "Blue vs green parity", val: "~2035", sub: "Blue cheaper before, green cheaper after", color: "#3b82f6" },
              ].map(item => (
                <div key={item.label} style={{ background: "#0d1b2e", border: `1px solid ${item.color}30`, borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ color: "#475569", fontSize: 10, marginTop: 4, lineHeight: 1.5 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MARKET SHARE TAB ── */}
        {tab === "Market Share" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 24 }}>
              Global hydrogen production by color today (~97 Mt total in 2024). Clean hydrogen combined remains under 4% of supply.
            </p>
            <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 12, padding: "24px 12px 16px", marginBottom: 20 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={[
                    { label: "Grey", share: 60, color: "#6b7280" },
                    { label: "Black/Brown", share: 13, color: "#292524" },
                    { label: "Oil/Naphtha", share: 18, color: "#78716c" },
                    { label: "Electrolysis (all)", share: 4, color: "#22c55e" },
                    { label: "Other/Biomass", share: 5, color: "#a78bfa" },
                  ]}
                  layout="vertical"
                  margin={{ top: 10, right: 80, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 70]} />
                  <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
                  <Tooltip content={<Tooltip2 />} formatter={(v) => [`${v}%`, "Market Share"]} />
                  <Bar dataKey="share" name="Share" radius={[0,4,4,0]}>
                    {[
                      { color: "#6b7280" }, { color: "#57534e" }, { color: "#78716c" }, { color: "#22c55e" }, { color: "#a78bfa" }
                    ].map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 10, padding: 20 }}>
                <p style={{ color: "#38bdf8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>The Decarbonization Gap</p>
                {[
                  { label: "Fossil-based (grey + black + oil)", pct: "~95%", color: "#f87171" },
                  { label: "All low-carbon combined", pct: "<4%", color: "#4ade80" },
                  { label: "Green H₂ specifically", pct: "<0.1%", color: "#22c55e" },
                  { label: "White / natural H₂", pct: "~0% (pilot)", color: "#f8fafc" },
                ].map(d => (
                  <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #0f1f35" }}>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{d.label}</span>
                    <span style={{ color: d.color, fontFamily: "monospace", fontWeight: 700 }}>{d.pct}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 10, padding: 20 }}>
                <p style={{ color: "#38bdf8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>Key Policy Signals</p>
                {[
                  { label: "DOE H2Shot target", val: "$1/kg green H₂ by 2030" },
                  { label: "US 45V PTC (IRA)", val: "Up to $3/kg for green H₂" },
                  { label: "EU Hydrogen Bank", val: "€800M+ in auction subsidies" },
                  { label: "USGS natural H₂", val: "$20M DOE research grants (2024)" },
                  { label: "Global demand 2024", val: "~100 Mt/yr" },
                  { label: "IEA 2030 net-zero", val: "~150 Mt/yr needed" },
                ].map(d => (
                  <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "9px 0", borderBottom: "1px solid #0f1f35" }}>
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>{d.label}</span>
                    <span style={{ color: "#14b8a6", fontFamily: "monospace", fontSize: 11, textAlign: "right" }}>{d.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 36, paddingTop: 16, borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155" }}>
          <span>SOURCES: MDPI (2023), Belfer Center (2024), Thunder Said Energy (2024), Rystad Energy (2024), USGS (2024), IEA, DOE H2Shot</span>
          <span>2025</span>
        </div>
      </div>
    </div>
  );
}
