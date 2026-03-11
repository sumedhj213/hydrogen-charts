"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LineChart, Line,
  Legend, ScatterChart, Scatter
} from "recharts";

// ── DATA ──────────────────────────────────────────────────────────────────────

const ALL_FUELS = [
  // FOSSIL
  { name: "Coal",         group: "Fossil",    priceGJ: 4.9,  priceKg: 0.133, co2: 3.1,  color: "#57534e", energyMJkg: 27,   status: "Mature",          note: "Newcastle spot $133/t · Most carbon-intensive" },
  { name: "Natural Gas",  group: "Fossil",    priceGJ: 3.0,  priceKg: 0.15,  co2: 2.75, color: "#94a3b8", energyMJkg: 50,   status: "Mature",          note: "Henry Hub $3.12/MMBtu · Dominant power & heat fuel" },
  { name: "Crude Oil",    group: "Fossil",    priceGJ: 15.3, priceKg: 0.67,  co2: 3.0,  color: "#78716c", energyMJkg: 43.8, status: "Mature",          note: "Brent $94/bbl (crisis premium +50% YTD)" },
  { name: "Gasoline",     group: "Fossil",    priceGJ: 28.8, priceKg: 1.24,  co2: 2.9,  color: "#f97316", energyMJkg: 43.1, status: "Mature",          note: "US retail $3.41/gal incl. tax" },
  { name: "Diesel",       group: "Fossil",    priceGJ: 33.2, priceKg: 1.42,  co2: 3.0,  color: "#fb923c", energyMJkg: 42.8, status: "Mature",          note: "US retail $4.51/gal incl. tax" },
  { name: "LNG",          group: "Fossil",    priceGJ: 14.0, priceKg: 0.70,  co2: 2.75, color: "#a16207", energyMJkg: 50,   status: "Mature",          note: "~$700/t spot; currently disrupted by Hormuz crisis" },
  // HYDROGEN
  { name: "Black H₂",    group: "Hydrogen",  priceGJ: 10.3, priceKg: 1.2,   co2: 19,   color: "#292524", energyMJkg: 120,  status: "Mature",          note: "Coal gasification · Cheapest H₂, dirtiest source" },
  { name: "Grey H₂",     group: "Hydrogen",  priceGJ: 16.7, priceKg: 2.0,   co2: 9.0,  color: "#6b7280", energyMJkg: 120,  status: "Dominant",        note: "Natural gas SMR · ~60% of all H₂ today" },
  { name: "Blue H₂",     group: "Hydrogen",  priceGJ: 20.8, priceKg: 2.5,   co2: 2.5,  color: "#3b82f6", energyMJkg: 120,  status: "Early Commercial",note: "SMR + CCS · Best near-term bridge" },
  { name: "Turquoise H₂",group: "Hydrogen",  priceGJ: 18.3, priceKg: 2.2,   co2: 0.8,  color: "#14b8a6", energyMJkg: 120,  status: "Pilot",           note: "Methane pyrolysis · No CO₂; carbon byproduct revenue key" },
  { name: "Pink H₂",     group: "Hydrogen",  priceGJ: 37.5, priceKg: 4.5,   co2: 0.3,  color: "#ec4899", energyMJkg: 120,  status: "Early Commercial",note: "Nuclear electrolysis · 24/7 baseload; stable output" },
  { name: "Yellow H₂",   group: "Hydrogen",  priceGJ: 37.5, priceKg: 4.5,   co2: 0.5,  color: "#eab308", energyMJkg: 120,  status: "Early Commercial",note: "Solar electrolysis · MENA/Australia advantage" },
  { name: "Green H₂",    group: "Hydrogen",  priceGJ: 41.7, priceKg: 5.0,   co2: 0.15, color: "#22c55e", energyMJkg: 120,  status: "Early Commercial",note: "Renewable electrolysis · Net-zero destination" },
  { name: "White H₂",    group: "Hydrogen",  priceGJ: 8.3,  priceKg: 1.0,   co2: 0.4,  color: "#f1f5f9", energyMJkg: 120,  status: "Exploration",     note: "Natural geological H₂ · Pre-commercial wildcard" },
  // OTHER
  { name: "Uranium",      group: "Nuclear",   priceGJ: 0.49, priceKg: 194,   co2: 0.02, color: "#a855f7", energyMJkg: 400000, status: "Mature",        note: "$88/lb raw ore · $0.49/GJ — cheapest energy source by far (excl. enrichment/capex)" },
  { name: "Methanol",     group: "Other",     priceGJ: 22.5, priceKg: 0.45,  co2: 1.5,  color: "#10b981", energyMJkg: 20,   status: "Mature",          note: "~$450/t conventional · Key shipping fuel candidate" },
];

const convergence = [
  { year: "2025", grey: 16.7, blue: 20.8, turquoise: 18.3, green: 41.7, gas: 3.0 },
  { year: "2027", grey: 16.0, blue: 19.0, turquoise: 16.5, green: 29.2, gas: 3.2 },
  { year: "2030", grey: 15.8, blue: 17.5, turquoise: 15.0, green: 16.7, gas: 3.5 },
  { year: "2035", grey: 15.0, blue: 15.8, turquoise: 13.3, green: 11.7, gas: 3.8 },
  { year: "2040", grey: 14.2, blue: 14.2, turquoise: 12.5, green: 9.2,  gas: 4.0 },
  { year: "2050", grey: 13.3, blue: 12.5, turquoise: 10.8, green: 7.5,  gas: 4.5 },
];

const GROUPS = ["All", "Fossil", "Hydrogen", "Nuclear", "Other"];
const TABS   = ["$/GJ Ranking", "By Group", "CO₂ vs $/GJ", "Convergence", "Full Table"];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "#0a1525", border: `1px solid ${d?.color || "#334155"}60`, borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#e2e8f0", maxWidth: 260 }}>
      <p style={{ fontWeight: 700, color: d?.color || "#f8fafc", marginBottom: 6 }}>{label || d?.name}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ marginBottom: 2 }}>
          <span style={{ color: "#64748b" }}>{p.name}: </span>
          <span style={{ fontFamily: "monospace", color: "#e2e8f0" }}>{typeof p.value === "number" ? `$${p.value}` : p.value}{p.unit || ""}</span>
        </div>
      ))}
      {d?.note && <div style={{ color: "#475569", fontSize: 10, marginTop: 8, borderTop: "1px solid #1e293b", paddingTop: 6, lineHeight: 1.5 }}>{d.note}</div>}
    </div>
  );
};

const GroupBadge = ({ group }) => {
  const colors = { Fossil: "#78716c", Hydrogen: "#38bdf8", Nuclear: "#a855f7", Other: "#10b981" };
  return (
    <span style={{ background: `${colors[group]}20`, color: colors[group], padding: "1px 7px", borderRadius: 4, fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {group}
    </span>
  );
};

export default function MasterEnergyDashboard() {
  const [tab, setTab]       = useState("$/GJ Ranking");
  const [filter, setFilter] = useState("All");
  const [hovered, setHovered] = useState(null);

  const sorted = [...ALL_FUELS].sort((a, b) => a.priceGJ - b.priceGJ);
  const filtered = filter === "All" ? sorted : sorted.filter(d => d.group === filter);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 0%, #0c1a2e 0%, #050c18 55%, #000 100%)", fontFamily: "'IBM Plex Mono', monospace", color: "#e2e8f0" }}>

      {/* ── HEADER ── */}
      <div style={{ padding: "36px 44px 22px", borderBottom: "1px solid #1e293b", background: "rgba(5,12,24,0.95)" }}>
        <p style={{ color: "#38bdf8", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>
          MASTER ENERGY COST DASHBOARD · MARCH 2026
        </p>
        <h1 style={{ fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px", fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
          Hydrogen Colors vs. All Fuels — Cost per GJ
        </h1>
        <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
          15 energy sources · Fossil · Hydrogen (8 colors) · Nuclear · Methanol · LHV basis · Live market prices
        </p>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e293b", padding: "0 44px", background: "#060f1d", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 18px", background: "none", border: "none",
            borderBottom: tab === t ? "2px solid #38bdf8" : "2px solid transparent",
            color: tab === t ? "#38bdf8" : "#475569",
            cursor: "pointer", fontSize: 11, letterSpacing: "0.06em",
            textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 44px" }}>

        {/* ══ TAB 1: $/GJ RANKING ══ */}
        {tab === "$/GJ Ranking" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              All 15 energy sources ranked cheapest→most expensive per GJ (LHV). This is the fairest apples-to-apples comparison across fuels with vastly different energy densities.
            </p>

            {/* Uranium spotlight */}
            <div style={{ padding: "12px 18px", background: "#12082a", border: "1px solid #6b21a840", borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 10px #a855f780", flexShrink: 0 }} />
              <span style={{ color: "#c084fc", fontWeight: 700, fontSize: 13 }}>Uranium: $0.49/GJ</span>
              <span style={{ color: "#475569", fontSize: 12 }}>Cheapest energy source by a factor of 6× — but raw ore price only; enrichment, fuel fabrication, and reactor capex not included here.</span>
            </div>

            <div style={{ background: "#0a1525", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 8px 16px" }}>
              <ResponsiveContainer width="100%" height={460}>
                <BarChart data={sorted} layout="vertical" margin={{ top: 10, right: 90, left: 110, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1f35" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 13 }} tickFormatter={v => `$${v}`} domain={[0, 45]} label={{ value: "Cost ($/GJ)", position: "insideBottom", offset: -10, fill: "#94a3b8", fontSize: 15 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 13 }} width={125} />
                  <Tooltip content={<TT />} formatter={(v) => [`$${v}/GJ`, "Cost"]} />
                  <ReferenceLine x={16.7} stroke="#6b728040" strokeDasharray="4 3"
                    label={{ value: "Grey H₂", position: "top", fill: "#6b7280", fontSize: 9 }} />
                  <Bar dataKey="priceGJ" name="$/GJ" radius={[0, 4, 4, 0]}>
                    {sorted.map((d, i) => (
                      <Cell key={i} fill={d.color}
                        fillOpacity={d.group === "Hydrogen" ? 1.0 : d.group === "Nuclear" ? 1.0 : 0.65}
                        stroke={d.group === "Hydrogen" ? d.color : "none"} strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 16 }}>
              {[
                { label: "Cheapest overall", val: "$0.49/GJ", sub: "Uranium (raw ore)", color: "#a855f7" },
                { label: "Cheapest fossil", val: "$3.0/GJ",   sub: "Natural Gas (HH)", color: "#94a3b8" },
                { label: "Cheapest H₂",     val: "$8.3/GJ",   sub: "White/Natural H₂", color: "#f1f5f9" },
                { label: "Most expensive",  val: "$41.7/GJ",  sub: "Green H₂ (today)", color: "#22c55e" },
              ].map(item => (
                <div key={item.label} style={{ background: "#0a1525", border: `1px solid ${item.color}30`, borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: item.color, fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700 }}>{item.val}</div>
                  <div style={{ color: "#475569", fontSize: 10, marginTop: 4 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB 2: BY GROUP ══ */}
        {tab === "By Group" && (
          <div>
            {/* Filter buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {GROUPS.map(g => (
                <button key={g} onClick={() => setFilter(g)} style={{
                  padding: "8px 16px", borderRadius: 20, border: "1px solid",
                  borderColor: filter === g ? "#38bdf8" : "#1e3a5f",
                  background: filter === g ? "rgba(56,189,248,0.1)" : "transparent",
                  color: filter === g ? "#38bdf8" : "#64748b",
                  cursor: "pointer", fontSize: 11, transition: "all 0.2s",
                }}>{g}</button>
              ))}
            </div>

            <div style={{ background: "#0a1525", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 8px 16px" }}>
              <ResponsiveContainer width="100%" height={Math.max(300, filtered.length * 38)}>
                <BarChart data={filtered} layout="vertical" margin={{ top: 10, right: 80, left: 110, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1f35" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}/GJ`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} width={110} />
                  <Tooltip content={<TT />} formatter={(v) => [`$${v}/GJ`, "Cost"]} />
                  <Bar dataKey="priceGJ" name="$/GJ" radius={[0, 4, 4, 0]}>
                    {filtered.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Group cards */}
            {filter === "All" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                {[
                  { group: "Fossil", range: "$3.0–33.2/GJ", insight: "Widest range of any group. Natural gas is cheapest; retail diesel most expensive. All face carbon pricing headwinds.", color: "#78716c" },
                  { group: "Hydrogen", range: "$8.3–41.7/GJ", insight: "White/natural H₂ is cheapest if commercially viable. Grey H₂ competes with crude oil. Green H₂ is 14× gas today.", color: "#38bdf8" },
                  { group: "Nuclear", range: "$0.49/GJ*", insight: "Uranium is cheapest energy source per GJ — but $/GJ of raw ore masks ~$60–120/MWh all-in nuclear power cost.", color: "#a855f7" },
                  { group: "Other", range: "$22.5/GJ (methanol)", insight: "Conventional methanol sits between crude oil and grey H₂ — a key shipping and chemical feedstock.", color: "#10b981" },
                ].map(item => (
                  <div key={item.group} style={{ background: "#0a1525", border: `1px solid ${item.color}30`, borderLeft: `3px solid ${item.color}`, borderRadius: 8, padding: "16px 18px" }}>
                    <div style={{ fontWeight: 700, color: item.color, fontSize: 13, marginBottom: 4 }}>{item.group}</div>
                    <div style={{ fontFamily: "monospace", color: "#f1f5f9", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.range}</div>
                    <div style={{ color: "#64748b", fontSize: 11, lineHeight: 1.7 }}>{item.insight}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 3: CO2 vs $/GJ ══ */}
        {tab === "CO₂ vs $/GJ" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Bottom-left = ideal (cheap + clean). Top-left = cheap but dirty. Bottom-right = clean but expensive. Each dot is one energy source — size indicates relative commercial scale.
            </p>
            <div style={{ background: "#0a1525", border: "1px solid #1e3a5f", borderRadius: 12, padding: "24px 12px 28px" }}>
              <ResponsiveContainer width="100%" height={440}>
                <ScatterChart margin={{ top: 20, right: 40, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1f35" />
                  <XAxis type="number" dataKey="priceGJ" name="Cost/GJ"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={v => `$${v}`}
                    domain={[0, 45]}
                    label={{ value: "Cost per GJ (USD/GJ)", position: "insideBottom", offset: -24, fill: "#475569", fontSize: 11 }}
                  />
                  <YAxis type="number" dataKey="co2" name="CO₂"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    domain={[0, 21]}
                    label={{ value: "CO₂ Intensity (tCO₂/t fuel)", angle: -90, position: "insideLeft", offset: 20, fill: "#475569", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div style={{ background: "#0a1525", border: `1px solid ${d.color}50`, borderRadius: 8, padding: "12px 16px", fontSize: 12 }}>
                          <p style={{ fontWeight: 700, color: d.color, marginBottom: 6 }}>{d.name}</p>
                          <div style={{ color: "#94a3b8" }}>$/GJ: <span style={{ fontFamily: "monospace", color: "#f1f5f9" }}>${d.priceGJ}</span></div>
                          <div style={{ color: "#94a3b8" }}>CO₂: <span style={{ fontFamily: "monospace", color: d.co2 > 5 ? "#f87171" : d.co2 > 1 ? "#fb923c" : "#4ade80" }}>{d.co2} tCO₂/t</span></div>
                          <div style={{ color: "#475569", fontSize: 10, marginTop: 6 }}>{d.note}</div>
                        </div>
                      );
                    }}
                  />
                  {/* Zone labels */}
                  <ReferenceLine x={20} stroke="#1e3a5f50" strokeDasharray="4 4" />
                  <ReferenceLine y={2}  stroke="#1e3a5f50" strokeDasharray="4 4" />
                  {ALL_FUELS.filter(d => d.name !== "Uranium").map((d) => (
                    <Scatter key={d.name} name={d.name} data={[d]} fill={d.color}
                      shape={({ cx, cy }) => (
                        <g>
                          <circle cx={cx} cy={cy} r={18} fill={d.color} fillOpacity={0.12} stroke={d.color} strokeWidth={1} />
                          <circle cx={cx} cy={cy} r={8}  fill={d.color} fillOpacity={0.9} />
                          <text x={cx} y={cy - 24} textAnchor="middle" fill={d.color} fontSize={9} fontFamily="monospace">{d.name}</text>
                        </g>
                      )}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
              {[
                { label: "Cheap & Dirty", desc: "Coal, Natural Gas, Black H₂", color: "#f87171", note: "Dominant today; carbon price risk rising" },
                { label: "Expensive & Dirty", desc: "Gasoline, Diesel, Grey H₂", color: "#fb923c", note: "Retail/distribution markup + no CCS" },
                { label: "Clean & Falling", desc: "Green, Blue, Turquoise H₂", color: "#4ade80", note: "Cost trajectory steeply down through 2030" },
              ].map(z => (
                <div key={z.label} style={{ background: "#0a1525", border: `1px solid ${z.color}25`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ color: z.color, fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{z.label}</div>
                  <div style={{ color: "#f1f5f9", fontSize: 12, marginBottom: 4 }}>{z.desc}</div>
                  <div style={{ color: "#475569", fontSize: 10, lineHeight: 1.5 }}>{z.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB 4: CONVERGENCE ══ */}
        {tab === "Convergence" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 20 }}>
              Cost convergence of hydrogen colors vs. natural gas ($/GJ) through 2050. Natural gas shown as the fossil baseline. DOE H2Shot target: green H₂ at ~$8.3/GJ ($1/kg) by 2030.
            </p>
            <div style={{ background: "#0a1525", border: "1px solid #1e3a5f", borderRadius: 12, padding: "24px 12px 16px", marginBottom: 20 }}>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={convergence} margin={{ top: 20, right: 50, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1f35" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => `$${v}`} domain={[0, 45]} />
                  <Tooltip content={<TT />} formatter={(v, n) => [`$${v}/GJ`, n.charAt(0).toUpperCase() + n.slice(1).replace("gas", "Natural Gas")]} />
                  <Legend formatter={v => <span style={{ color: "#94a3b8", fontSize: 10 }}>{v.charAt(0).toUpperCase() + v.slice(1).replace("gas", "Natural Gas")}</span>} />
                  <ReferenceLine y={8.3} stroke="#22c55e30" strokeDasharray="5 3"
                    label={{ value: "DOE H2Shot $1/kg ($8.3/GJ)", position: "right", fill: "#22c55e80", fontSize: 9 }} />
                  <Line type="monotone" dataKey="gas"       stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 3, fill: "#94a3b8" }} />
                  <Line type="monotone" dataKey="grey"      stroke="#6b7280" strokeWidth={2}   dot={{ r: 4, fill: "#6b7280" }} />
                  <Line type="monotone" dataKey="blue"      stroke="#3b82f6" strokeWidth={2}   dot={{ r: 4, fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="turquoise" stroke="#14b8a6" strokeWidth={2}   dot={{ r: 4, fill: "#14b8a6" }} />
                  <Line type="monotone" dataKey="green"     stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 2" dot={{ r: 5, fill: "#22c55e" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Green H₂ drop",    val: "−82%", sub: "$41.7 → $7.5/GJ by 2050", color: "#22c55e" },
                { label: "Gas parity (green)", val: "~2035", sub: "With $150/tCO₂ carbon price", color: "#38bdf8" },
                { label: "Turquoise window",  val: "2025–32", sub: "Cheapest low-carbon $/GJ", color: "#14b8a6" },
                { label: "Blue vs green",     val: "Flips ~2033", sub: "Green cheaper beyond that", color: "#3b82f6" },
              ].map(item => (
                <div key={item.label} style={{ background: "#0a1525", border: `1px solid ${item.color}25`, borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: item.color, fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700 }}>{item.val}</div>
                  <div style={{ color: "#475569", fontSize: 10, marginTop: 4, lineHeight: 1.5 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB 5: FULL TABLE ══ */}
        {tab === "Full Table" && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 16 }}>All 15 energy sources. Sorted by $/GJ ascending.</p>
            <div style={{ background: "#0a1525", border: "1px solid #1e3a5f", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.4)" }}>
                    {["#", "Fuel", "Group", "$/GJ", "$/kg", "Energy MJ/kg", "CO₂ tCO₂/t", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 13px", textAlign: "left", fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((d, i) => (
                    <tr key={d.name}
                      onMouseEnter={() => setHovered(d.name)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ borderTop: "1px solid #0c1a2e", background: hovered === d.name ? `${d.color}10` : i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.2)", transition: "background 0.15s" }}>
                      <td style={{ padding: "10px 13px", color: "#334155", fontFamily: "monospace", fontSize: 11 }}>{i + 1}</td>
                      <td style={{ padding: "10px 13px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, border: d.name === "White H₂" ? "1px solid #64748b" : "none", flexShrink: 0 }} />
                          <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>{d.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 13px" }}><GroupBadge group={d.group} /></td>
                      <td style={{ padding: "10px 13px", fontFamily: "monospace", color: d.color, fontWeight: 700, fontSize: 13 }}>${d.priceGJ}</td>
                      <td style={{ padding: "10px 13px", fontFamily: "monospace", color: "#94a3b8", fontSize: 11 }}>${d.priceKg}</td>
                      <td style={{ padding: "10px 13px", color: "#64748b", fontSize: 11 }}>
                        {d.energyMJkg >= 100000 ? `${(d.energyMJkg/1000).toFixed(0)}k` : d.energyMJkg}
                      </td>
                      <td style={{ padding: "10px 13px", fontSize: 12 }}>
                        <span style={{ color: d.co2 > 5 ? "#f87171" : d.co2 > 1 ? "#fb923c" : "#4ade80", fontFamily: "monospace" }}>{d.co2}</span>
                      </td>
                      <td style={{ padding: "10px 13px" }}>
                        <span style={{ background: `${d.color}15`, color: d.color, padding: "2px 7px", borderRadius: 4, fontSize: 9 }}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "10px 14px", borderTop: "1px solid #0c1a2e", fontSize: 10, color: "#1e3a5f" }}>
                LHV basis · Live fossil prices as of March 11, 2026 · Hydrogen = production cost estimates · Uranium = raw ore only
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#1e3a5f" }}>
          <span>SOURCES: EIA · CME Group · IMARC · IRENA · Oxford OIES · Al-Breiki & Bicer (2020) · USGS · IEA · DOE H2Shot</span>
          <span>MARCH 11, 2026</span>
        </div>
      </div>
    </div>
  );
}
