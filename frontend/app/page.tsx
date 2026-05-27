"use client";

import { useState, useEffect } from "react";

export default function InterchangeDashboard() {
  const API_URL = "http://localhost:8000";

  // State Management Rails
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [mccFilter, setMccFilter] = useState<number | "ALL">("ALL");
  const [metrics, setMetrics] = useState({
    total_volume: 0,
    avg_take_rate: "0.00%",
    merchants_counted: 0,
    variance_vs_global: "0.0%"
  });

  const [calculatorInput, setCalculatorInput] = useState({
    mcc: 5812,
    region: "US",
    monthly_volume: 500000,
    card_present_pct: 65,
    credit_card_pct: 70
  });

  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [registryEntries, setRegistryEntries] = useState<any[]>([]);

  // Telemetry Pipeline Sync
  useEffect(() => {
    fetchMetrics();
    fetchRegistry();
  }, [regionFilter, mccFilter]);

  useEffect(() => {
    calculateScenario();
  }, [calculatorInput]);

  const fetchMetrics = async () => {
    try {
      let url = `${API_URL}/api/metrics`;
      if (regionFilter !== "ALL") {
        url += `?region=${regionFilter}`;
      }
      const r = await fetch(url);
      const d = await r.json();
      setMetrics(d);
    } catch (e) {
      console.error("Metric communication fault:", e);
    }
  };

  const fetchRegistry = async () => {
    try {
      const params = new URLSearchParams();
      if (regionFilter !== "ALL") params.append("region", regionFilter);
      if (mccFilter !== "ALL") params.append("mcc", mccFilter.toString());

      const url = `${API_URL}/api/interchange/registry?${params.toString()}`;
      const r = await fetch(url);
      const d = await r.json();
      setRegistryEntries(d);
    } catch (e) {
      console.error("Registry pipeline fault:", e);
    }
  };

  const calculateScenario = async () => {
    try {
      const r = await fetch(`${API_URL}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculatorInput)
      });
      const d = await r.json();
      setCalculationResult(d);
    } catch (e) {
      console.error("Calculation execution fault:", e);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#030712] text-[#F3F4F6] flex overflow-hidden font-sans select-none antialiased">
      
      {/* ──────────────────────────────────────────────────────────── */}
      {/* MAIN STAGE CORE WORKSPACE (70% WIDTH)                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <main className="w-[70%] h-full p-6 overflow-y-auto flex flex-col gap-6 border-r border-[#1F2937] shrink-0">
        
        {/* Top Segment Header Area */}
        <div className="flex justify-between items-center pb-4 border-b border-[#1F2937]">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#38BDF8] font-mono tracking-tight">// PLATFORM PROTOCOL ENGINE</span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">Interchange Fee Architecture Terminus</h1>
          </div>
          
          <div className="flex gap-4 items-center">
            <span className="text-xs font-mono text-gray-500">// RUNTIME STATUS: ACTIVE</span>
            <div className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse shadow-[0_0_8px_#38BDF8]" />
          </div>
        </div>

        {/* Dynamic Entry Simulation Module Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Interactive Calculator Input Track Panel */}
          <div className="bg-[#0B1117] border border-[#1F2937] p-5 rounded-lg flex flex-col gap-4 relative overflow-hidden backdrop-blur-md">
            <h2 className="text-xs font-mono uppercase text-[#818CF8] tracking-wider border-b border-[#1F2937] pb-2">
              // Simulation Vector Inputs
            </h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-mono">Merchant Category Code (MCC)</label>
              <select 
                value={calculatorInput.mcc}
                onChange={(e) => setCalculatorInput({...calculatorInput, mcc: parseInt(e.target.value)})}
                className="bg-[#030712] border border-[#1F2937] p-2 rounded text-sm text-white focus:border-[#38BDF8] focus:shadow-[0_0_8px_rgba(56,189,248,0.3)] transition-all outline-none cursor-pointer"
              >
                <option value={5812}>5812 - Restaurants / Eating Establishments</option>
                <option value={5411}>5411 - Grocery Stores & Supermarkets</option>
                <option value={5732}>5732 - Electronic Distribution Centers</option>
                <option value={5311}>5311 - National Department Outlets</option>
                <option value={5912}>5912 - Pharmacies & Drug Stores</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-mono">Target Jurisdiction</label>
                <select 
                  value={calculatorInput.region}
                  onChange={(e) => setCalculatorInput({...calculatorInput, region: e.target.value})}
                  className="bg-[#030712] border border-[#1F2937] p-2 rounded text-sm text-white focus:border-[#38BDF8] focus:shadow-[0_0_8px_rgba(56,189,248,0.3)] transition-all outline-none cursor-pointer"
                >
                  <option value="US">US (Fed Wire Matrix)</option>
                  <option value="EU">EU (ECB Euro System)</option>
                  <option value="APAC">APAC (Singapore Hub)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-mono">Monthly Routing Volume ($)</label>
                <input 
                  type="number" 
                  value={calculatorInput.monthly_volume}
                  onChange={(e) => setCalculatorInput({...calculatorInput, monthly_volume: parseFloat(e.target.value) || 0})}
                  className="bg-[#030712] border border-[#1F2937] p-2 rounded text-sm text-white focus:border-[#38BDF8] focus:shadow-[0_0_8px_rgba(56,189,248,0.3)] transition-all outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono text-gray-400">
                <span>Card-Present Mix (POS):</span>
                <span className="text-[#38BDF8] font-bold">{calculatorInput.card_present_pct}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={calculatorInput.card_present_pct}
                onChange={(e) => setCalculatorInput({...calculatorInput, card_present_pct: parseInt(e.target.value)})}
                className="w-full accent-[#38BDF8] h-1 bg-[#1F2937] rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono text-gray-400">
                <span>Credit Card Vol Weighting:</span>
                <span className="text-[#38BDF8] font-bold">{calculatorInput.credit_card_pct}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={calculatorInput.credit_card_pct}
                onChange={(e) => setCalculatorInput({...calculatorInput, credit_card_pct: parseInt(e.target.value)})}
                className="w-full accent-[#38BDF8] h-1 bg-[#1F2937] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Dynamic Matrix Scenario Analytics Outputs */}
          <div className="bg-[#0B1117] border border-[#1F2937] p-5 rounded-lg flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
            <div>
              <h2 className="text-xs font-mono uppercase text-[#38BDF8] tracking-wider border-b border-[#1F2937] pb-2">
                // Calculated Pipeline Outcomes
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-3 uppercase tracking-tight">PROCESSED CLASSIFICATION: <span className="text-white font-sans font-medium">{calculationResult?.mcc_label}</span></p>
              
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Blended Interchange Matrix Cost</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white font-mono tracking-tight">{calculationResult?.blended_rate_pct}</span>
                    <span className="text-xs text-gray-400 font-mono">per settlement batch</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#030712] p-3 rounded border border-[#1F2937]">
                    <span className="text-[10px] font-mono text-gray-500 block">MONTHLY TAKE OUTFLOW</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {calculationResult?.estimated_monthly_fees ? calculationResult.estimated_monthly_fees.toLocaleString() : "0"} {calculationResult?.currency}
                    </span>
                  </div>
                  <div className="bg-[#030712] p-3 rounded border border-[#1F2937]">
                    <span className="text-[10px] font-mono text-gray-500 block">BENCHMARK VARIANCE</span>
                    <span className={`text-lg font-bold font-mono ${calculationResult?.variance_vs_benchmark >= 0 ? 'text-red-400' : 'text-[#38BDF8]'}`}>
                      {calculationResult?.variance_vs_benchmark}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Allocation Waterfall Component (By Issuer / Network / Processor) */}
              <div className="mt-5 pt-3 border-t border-[#1F2937]/60">
                <span className="text-[10px] font-mono text-gray-500 uppercase block mb-2">// Fee Allocation Waterfall (By Issuer / Network / Processor)</span>
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                      <span>1. Card Issuer Interchange Core</span>
                      <span className="text-white">{(calculatorInput.credit_card_pct > 60 ? 78 : 55)}% of total fee</span>
                    </div>
                    <div className="w-full bg-[#030712] h-1.5 rounded-full overflow-hidden border border-[#1F2937]">
                      <div className="bg-[#38BDF8] h-full" style={{ width: calculatorInput.credit_card_pct > 60 ? '78%' : '55%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                      <span>2. Network Assessment Fee (Visa/MC Rail)</span>
                      <span className="text-[#818CF8]">15% of total fee</span>
                    </div>
                    <div className="w-full bg-[#030712] h-1.5 rounded-full overflow-hidden border border-[#1F2937]">
                      <div className="bg-[#818CF8] h-full" style={{ width: '15%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                      <span>3. Acquirer / Processor Risk Margin</span>
                      <span className="text-gray-400">{(calculatorInput.card_present_pct < 50 ? 30 : 10)}% of total fee</span>
                    </div>
                    <div className="w-full bg-[#030712] h-1.5 rounded-full overflow-hidden border border-[#1F2937]">
                      <div className="bg-gray-600 h-full" style={{ width: calculatorInput.card_present_pct < 50 ? '30%' : '10%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Routing Insight Module Overlay */}
            <div className="mt-4 pt-4 border-t border-[#1F2937] bg-gradient-to-r from-[#030712] to-transparent p-3 rounded border border-dashed border-[#1F2937]">
              <span className="text-[10px] font-mono text-[#818CF8] uppercase block">▲ Real Rails Cost Allocation Matrix</span>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Deploying custom routing protocols optimizes baseline execution charges to <strong className="text-[#38BDF8]">{calculationResult?.optimized_rate_pct}</strong>, reducing costs by <strong className="text-emerald-400">{calculationResult?.potential_savings ? calculationResult.potential_savings.toLocaleString() : "0"} {calculationResult?.currency}/mo</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Profile Registry Data-Grid Display */}
        <div className="flex-1 bg-[#0B1117] border border-[#1F2937] rounded-lg p-4 flex flex-col min-h-[300px]">
          <span className="text-xs font-mono uppercase text-[#38BDF8] tracking-wider mb-3 block">// Granular Infrastructure Mix Logs</span>
          <div className="flex-1 overflow-y-auto text-xs font-mono custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F2937] text-gray-500">
                  <th className="pb-2 font-medium">Merchant ID</th>
                  <th className="pb-2 font-medium">Core Sector</th>
                  <th className="pb-2 font-medium text-right">Volume</th>
                  <th className="pb-2 font-medium text-right">Take-Rate</th>
                  <th className="pb-2 font-medium text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/40 text-gray-300">
                {registryEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 font-mono">// NO MERCHANTS MATCHING ACTIVE CRITERIA LOCK</td>
                  </tr>
                ) : (
                  registryEntries.slice(0, 50).map((m: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#030712]/40 transition-colors group">
                      <td className="py-2 text-[#38BDF8] font-semibold group-hover:text-white transition-colors">{m.merchant_id}</td>
                      <td className="py-2 max-w-[200px] truncate text-gray-400 group-hover:text-gray-200 transition-colors">{m.mcc_label}</td>
                      <td className="py-2 text-right font-mono text-gray-300">{m.processing_volume.toLocaleString()} {m.currency}</td>
                      <td className="py-2 text-right font-mono text-[#818CF8]">{(m.interchange_take_rate * 100).toFixed(2)}%</td>
                      <td className={`py-2 text-right font-mono ${m.benchmark_variance_pct >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {m.benchmark_variance_pct}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* INTELLIGENCE SIDEBAR COMPONENT (30% WIDTH)                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <aside className="w-[30%] h-full bg-[#0B1117] p-6 flex flex-col justify-between border-l border-[#1F2937] shrink-0 overflow-y-auto">
        <div className="flex flex-col gap-6">
          
          {/* Section A: Title Block & Aggregated Tracking Metrics */}
          <div>
            <span className="text-[10px] font-mono uppercase text-[#38BDF8] tracking-widest block">// SECTION A</span>
            <h1 className="text-lg font-bold text-white mt-1">Interchange Fee Calculator</h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Payments Rail Framework Blueprint</p>
            
            <div className="mt-4 bg-[#030712] border border-[#1F2937] p-4 rounded flex flex-col gap-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#38BDF8]/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">AGGREGATE RECORDED VOLUME</span>
              <span className="text-2xl font-bold text-[#38BDF8] font-mono tracking-tight">
                ${metrics.total_volume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                {metrics.variance_vs_global}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#030712] p-2.5 border border-[#1F2937] rounded font-mono">
                <span className="text-[9px] text-gray-500 block">BLENDED TAKE</span>
                <span className="text-sm font-bold text-white">{metrics.avg_take_rate}</span>
              </div>
              <div className="bg-[#030712] p-2.5 border border-[#1F2937] rounded font-mono">
                <span className="text-[9px] text-gray-500 block">INDEXED NODES</span>
                <span className="text-sm font-bold text-white">{metrics.merchants_counted} profiles</span>
              </div>
            </div>
          </div>

          {/* Section B: Why This Matters Infrastructure Context */}
          <div className="border-t border-[#1F2937] pt-4">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">// SECTION B // VALUE MATRIX</span>
            <h3 className="text-xs font-bold text-gray-300 mt-1 uppercase tracking-wider">Why This Matters</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-1.5 font-sans">
              Interchange fees dictate the baseline financial viability of modern merchant enterprises. This system helps founders, SMB operators, and capital allocators map processing friction across different card networks, payment channels, and regulatory ceilings.
            </p>
          </div>

          {/* Section C: Who Controls the Rail Governance Context */}
          <div className="border-t border-[#1F2937] pt-4">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">// SECTION C // SOVEREIGN BLUEPRINT</span>
            <h3 className="text-xs font-bold text-gray-300 mt-1 uppercase tracking-wider">Who Controls the Rail</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-1.5 font-sans">
              Regulated heavily by central banking authorities (such as the ECB and Federal Reserve) alongside private card networks (Visa/Mastercard) who manage interchange ceilings and routing rulebooks globally.
            </p>
          </div>

          {/* Section D: Functional Filters */}
          <div className="border-t border-[#1F2937] pt-4 flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">// SECTION D // LOGISTICS CONTROL</span>
              <h3 className="text-xs font-bold text-gray-300 mt-1 uppercase tracking-wider">Registry Filters</h3>
            </div>
            
            <div className="flex flex-col gap-2 bg-[#030712] p-3 rounded border border-[#1F2937]">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase">Jurisdiction Scope</label>
                <select 
                  value={regionFilter} 
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="bg-[#0B1117] border border-[#1F2937] text-xs text-[#38BDF8] font-mono p-1.5 rounded outline-none cursor-pointer focus:border-[#38BDF8]"
                >
                  <option value="ALL">Global (All Regions)</option>
                  <option value="US">United States (Fed Matrix)</option>
                  <option value="EU">European Union (ECB Rail)</option>
                  <option value="APAC">Asia-Pacific Hub</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase">Sector Isolation (MCC)</label>
                <select 
                  value={mccFilter} 
                  onChange={(e) => setMccFilter(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value))}
                  className="bg-[#0B1117] border border-[#1F2937] text-xs text-[#38BDF8] font-mono p-1.5 rounded outline-none cursor-pointer focus:border-[#38BDF8]"
                >
                  <option value="ALL">All Asset Sectors</option>
                  <option value={5812}>5812 - Eating Outlets</option>
                  <option value={5411}>5411 - Supermarkets</option>
                  <option value={5732}>5732 - Electronics</option>
                  <option value={5311}>5311 - Department</option>
                  <option value={5912}>5912 - Pharmacies</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section E: Primary Actions Layer for Exporting Data Manifests & Assumptions */}
        <div className="border-t border-[#1F2937] pt-4 mt-6 flex flex-col gap-2">
          <a 
            href={`${API_URL}/api/stations/csv`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-transparent border border-[#38BDF8] hover:bg-[#38BDF8]/10 text-[#38BDF8] text-xs font-mono py-2.5 px-4 rounded text-center block transition-all tracking-wider font-semibold active:scale-[0.99]"
          >
            DOWNLOAD DATA MANIFEST (.CSV)
          </a>

          <button 
            onClick={() => {
              const assumptionsData = {
                timestamp: new Date().toISOString(),
                calculator_inputs: calculatorInput,
                runtime_outcomes: calculationResult,
                allocation_rules: {
                  issuer_percentage: calculatorInput.credit_card_pct > 60 ? 78 : 55,
                  network_percentage: 15,
                  processor_percentage: calculatorInput.card_present_pct < 50 ? 30 : 10
                }
              };
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assumptionsData, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "interchange_assumptions_export.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="w-full bg-transparent border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white text-xs font-mono py-2.5 px-4 rounded text-center block transition-all tracking-wider font-semibold active:scale-[0.99]"
          >
            EXPORT ASSUMPTIONS (.JSON)
          </button>
        </div>

      </aside>
    </div>
  );
}