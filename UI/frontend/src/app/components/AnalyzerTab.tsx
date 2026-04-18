"use client";

import { useState, useRef } from "react";
import { type AnalyzeResult, analyzeReport, createBulkWells } from "../../lib/api";

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-2">
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-black inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-black inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-black inline-block" />
    </span>
  );
}

function ResultCard({ r }: { r: AnalyzeResult }) {
  if (r.status === "insufficient_data") {
    return (
      <div className="border border-oil-border rounded-xl p-5 bg-oil-deep">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-oil-smoke flex-shrink-0" />
          <span className="font-semibold text-oil-light">{r.well}</span>
          <span className="text-[10px] text-oil-mist font-mono uppercase tracking-widest bg-oil-surface px-2 py-0.5 rounded-full border border-oil-border">Insufficient Data</span>
        </div>
        <p className="text-xs text-oil-smoke font-mono">{r.message}</p>
      </div>
    );
  }

  if (r.status === "anomaly") {
    return (
      <div className="border border-oil-rust/80 rounded-xl p-5 bg-[rgba(139,58,26,0.08)] animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-oil-rust opacity-10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="font-bold text-red-300 font-mono tracking-wider">{r.well}</span>
          <span className="text-[10px] font-bold text-red-400 bg-red-950 border border-red-900 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
            ANOMALY DETECTED
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-oil-deep/80 border border-oil-border/50 rounded-lg p-3">
            <div className="text-[10px] text-oil-smoke uppercase font-mono tracking-widest mb-1">LSTM Expected</div>
            <div className="font-mono font-bold text-oil-light text-lg">{r.predicted_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} <span className="text-xs text-oil-mist">m³</span></div>
          </div>
          <div className="bg-oil-deep/80 border border-oil-border/50 rounded-lg p-3">
            <div className="text-[10px] text-oil-smoke uppercase font-mono tracking-widest mb-1">Field Reported</div>
            <div className="font-mono font-bold text-oil-light text-lg">{r.reported_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} <span className="text-xs text-oil-mist">m³</span></div>
          </div>
          <div className="bg-oil-deep/80 border border-oil-rust/30 rounded-lg p-3">
            <div className="text-[10px] text-oil-smoke uppercase font-mono tracking-widest mb-1">Deviation</div>
            <div className="font-mono font-bold text-red-400 text-lg">{r.error_pct?.toFixed(1)}%</div>
          </div>
        </div>
        {r.rca && (
          <div className="border border-oil-amber/20 bg-oil-amber/10 rounded-lg p-4">
            <div className="text-[10px] font-semibold text-oil-amber uppercase tracking-widest mb-2 font-mono">
              Root Cause Analysis ↓
            </div>
            <p className="text-sm text-oil-mist font-body">
              The field reported{" "}
              <code className="bg-oil-amber/20 px-1.5 py-0.5 border border-oil-amber/30 rounded text-oil-amber text-xs font-mono">
                {r.rca.culprit_feature}
              </code>{" "}
              as <strong className="text-oil-light font-mono">{r.rca.reported_value.toFixed(2)}</strong>. The Random Forest model
              calculates it should be approximately{" "}
              <strong className="text-[#10b981] font-mono">{r.rca.expected_value.toFixed(2)}</strong>{" "}
              to produce the reported W_GAS volume.
            </p>
            <p className="text-xs text-oil-amber mt-3 uppercase tracking-wider font-mono">
              ▷  Inspect the <strong className="text-oil-gold">{r.rca.culprit_feature}</strong> sensor or valve on well <span className="text-oil-gold">{r.well}</span>.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[#064e3b] rounded-xl p-5 bg-[rgba(6,78,59,0.2)] animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981] opacity-5 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="flex items-center gap-3 mb-4">
        <span className="w-2 h-2 rounded-full bg-[#10b981] flex-shrink-0" />
        <span className="font-bold text-[#6ee7b7] font-mono tracking-wider">{r.well}</span>
        <span className="text-[10px] text-[#059669] bg-[#022c22] border border-[#064e3b] px-2 py-0.5 rounded-full tracking-widest font-mono uppercase">
          Normal Operation
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-oil-deep/80 border border-oil-border/50 rounded-lg p-3">
          <div className="text-[10px] text-oil-smoke uppercase font-mono tracking-widest mb-1">LSTM Expected</div>
          <div className="font-mono font-bold text-oil-light text-lg">{r.predicted_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} <span className="text-xs text-oil-mist">m³</span></div>
        </div>
        <div className="bg-oil-deep/80 border border-oil-border/50 rounded-lg p-3">
          <div className="text-[10px] text-oil-smoke uppercase font-mono tracking-widest mb-1">Field Reported</div>
          <div className="font-mono font-bold text-oil-light text-lg">{r.reported_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} <span className="text-xs text-oil-mist">m³</span></div>
        </div>
        <div className="bg-oil-deep/80 border border-[#064e3b]/50 rounded-lg p-3">
          <div className="text-[10px] text-oil-smoke uppercase font-mono tracking-widest mb-1">Deviation</div>
          <div className="font-mono font-bold text-[#10b981] text-lg">{r.error_pct?.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzerTab() {
  const [file, setFile]         = useState<File | null>(null);
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [results, setResults]   = useState<AnalyzeResult[] | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [missingWells, setMissingWells] = useState<string[] | null>(null);
  const [creatingWells, setCreatingWells] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!f.name.endsWith(".csv") && !f.name.endsWith(".xlsx")) {
      setError("Only .csv and .xlsx files are accepted.");
      return;
    }
    setFile(f);
    setResults(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRun = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setResults([]);
    setError(null);
    try {
      await analyzeReport(file, (pct, result) => {
        setProgress(pct);
        if (result) {
          setResults((prev) => (prev ? [...prev, result] : [result]));
        }
      });
    } catch (err: any) {
      if (err.isMissingWells) {
        setMissingWells(err.missingWells);
        return;
      }
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleCreateMissingWells = async () => {
    if (!missingWells) return;
    setCreatingWells(true);
    try {
       await createBulkWells(missingWells);
       setMissingWells(null);
       handleRun(); // Automatically retry!
    } catch (err: any) {
       const msg = err instanceof Error ? err.message : "Failed to create wells";
       setError(msg);
       setMissingWells(null);
    } finally {
       setCreatingWells(false);
    }
  };

  const anomalyCount = results?.filter((r) => r.status === "anomaly").length ?? 0;
  const normalCount  = results?.filter((r) => r.status === "normal").length ?? 0;

  return (
    <div className="animate-fade-in">
      <p className="text-oil-mist mb-8 text-sm leading-relaxed max-w-2xl font-body">
        Upload the daily field report (CSV or Excel). The system compares each well&apos;s reported
        W_GAS against the LSTM forecast. Deviations above 15% trigger Root Cause Analysis via
        Random Forest grid search to identify the faulty sensor or data entry.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 mb-6 flex flex-col items-center group relative overflow-hidden ${
          dragging
            ? "border-oil-amber bg-oil-amber/10 scale-[1.02]"
            : "border-oil-border hover:border-oil-smoke bg-oil-surface/30"
        }`}
      >
        <div className="absolute inset-0 bg-oil-mist/5 group-hover:bg-oil-mist/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="text-4xl mb-4 text-oil-mist group-hover:text-oil-light transition-colors">
          &#8681;
        </div>
        <p className="text-oil-light font-display text-xl mb-1 tracking-wide">
          {file ? file.name : "Drop Daily Report File Here"}
        </p>
        <p className="text-[10px] text-oil-smoke font-mono tracking-widest uppercase mt-4 max-w-sm mx-auto">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB — click to change`
            : "CSV or XLSX · Must contain WELL, HOURS, WHP, WHT, WLP, H2O, WATER, W_GAS columns"}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleRun}
          disabled={!file || loading}
          className="relative overflow-hidden px-8 py-3 rounded-lg bg-oil-amber hover:bg-oil-gold disabled:opacity-60 disabled:cursor-not-allowed text-oil-black font-mono tracking-widest text-xs uppercase transition-all duration-300 shadow-[0_0_20px_rgba(212,136,42,0.2)] flex items-center h-[46px]"
        >
          {loading && progress !== null && (
            <div
              className="absolute inset-y-0 left-0 bg-oil-deep/20 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          )}
          <div className="relative z-10 flex items-center">
            {loading ? (
              <>
                Processing... {progress}% <LoadingDots />
              </>
            ) : (
              "Run Anomaly Check & RCA →"
            )}
          </div>
        </button>
        {file && (
          <button
            onClick={() => { setFile(null); setResults(null); setError(null); }}
            className="px-6 py-3 rounded-lg border border-oil-border hover:border-oil-smoke text-oil-mist hover:text-oil-light font-mono tracking-widest text-xs uppercase transition-all flex items-center h-[46px]"
          >
            Clear Data
          </button>
        )}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mb-6 p-4 rounded-lg border border-oil-rust/50 bg-oil-rust/10 text-red-300 text-sm font-mono">
          {error}
        </div>
      )}

      {/* Summary + Results */}
      {results && (
        <div className="animate-fade-up space-y-6">
          {/* Summary bar */}
          <div className="flex gap-4 p-5 bg-oil-surface border border-oil-border rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-oil-amber/5 to-transparent opacity-50" />
            
            <div className="flex-1 text-center border-r border-oil-border last:border-0 relative z-10">
              <div className="text-3xl font-black font-display text-oil-light mb-1">{results.length}</div>
              <div className="text-[10px] text-oil-smoke tracking-widest uppercase font-mono">Total Wells</div>
            </div>
            
            <div className="flex-1 text-center border-r border-oil-border last:border-0 relative z-10">
              <div className="text-3xl font-black font-display text-red-400 mb-1" style={{ textShadow: anomalyCount > 0 ? '0 0 15px rgba(248,113,113,0.3)' : 'none' }}>{anomalyCount}</div>
              <div className="text-[10px] text-oil-smoke tracking-widest uppercase font-mono">Anomalies</div>
            </div>
            
            <div className="flex-1 text-center relative z-10">
              <div className="text-3xl font-black font-display text-[#10b981] mb-1">{normalCount}</div>
              <div className="text-[10px] text-oil-smoke tracking-widest uppercase font-mono">Normal</div>
            </div>
          </div>

          {/* Individual results grid */}
          <div className="flex flex-col gap-4">
            {results.map((r, i) => (
              <ResultCard key={i} r={r} />
            ))}
          </div>
        </div>
      )}

      {/* Missing Wells Modal */}
      {missingWells && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-oil-black/80 backdrop-blur-sm animate-fade-in duration-200">
          <div className="bg-oil-surface border border-oil-amber/30 rounded-xl p-8 shadow-2xl shadow-oil-amber/10 max-w-md w-full animate-fade-up duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-oil-amber opacity-[0.03] blur-3xl rounded-full" />
            <h3 className="text-xl font-display font-black text-oil-light mb-3">Unrecognized Wells Detected</h3>
            <p className="text-oil-mist text-sm font-body mb-6 leading-relaxed">
              Your dataset contains wells that do not currently exist in the database. 
              Would you like to automatically create these <span className="text-oil-amber font-mono">{missingWells.length}</span> well records?
            </p>
            <div className="max-h-40 overflow-y-auto mb-8 bg-oil-deep rounded-lg border border-oil-border p-4 shadow-inner">
              <ul className="text-oil-light text-xs font-mono space-y-2">
                {missingWells.map(w => (
                  <li key={w} className="flex items-center gap-2">
                    <span className="text-oil-smoke">▶</span> {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setMissingWells(null)}
                className="px-6 py-2.5 rounded-lg text-xs font-mono tracking-widest uppercase text-oil-mist border border-transparent hover:border-oil-border hover:bg-oil-deep transition-all"
                disabled={creatingWells}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateMissingWells}
                className="px-6 py-2.5 rounded-lg text-xs font-mono tracking-widest uppercase font-bold bg-oil-amber hover:bg-oil-gold text-oil-black shadow-[0_0_15px_rgba(212,136,42,0.3)] transition-all flex items-center gap-2"
                disabled={creatingWells}
              >
                {creatingWells ? <>Creating<LoadingDots/></> : 'Create Wells & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
