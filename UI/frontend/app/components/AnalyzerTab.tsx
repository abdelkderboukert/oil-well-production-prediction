"use client";

import { useState, useRef } from "react";
import { type AnalyzeResult, analyzeReport, createBulkWells } from "../lib/api";

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-2">
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
    </span>
  );
}

function ResultCard({ r }: { r: AnalyzeResult }) {
  if (r.status === "insufficient_data") {
    return (
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900/60">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
          <span className="font-semibold text-gray-300">{r.well}</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Insufficient Data</span>
        </div>
        <p className="text-xs text-gray-500">{r.message}</p>
      </div>
    );
  }

  if (r.status === "anomaly") {
    return (
      <div className="border border-red-900 rounded-xl p-5 bg-red-950/20 animate-in">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
          <span className="font-semibold text-red-300">{r.well}</span>
          <span className="text-xs font-semibold text-red-400 bg-red-950 border border-red-900 px-2 py-0.5 rounded-full">
            ANOMALY DETECTED
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">LSTM Expected</div>
            <div className="font-mono font-bold text-gray-200">{r.predicted_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³</div>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Field Reported</div>
            <div className="font-mono font-bold text-gray-200">{r.reported_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³</div>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Deviation</div>
            <div className="font-mono font-bold text-red-400">{r.error_pct?.toFixed(1)}%</div>
          </div>
        </div>
        {r.rca && (
          <div className="border border-amber-900 bg-amber-950/30 rounded-lg p-4">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Root Cause Analysis
            </div>
            <p className="text-sm text-amber-200">
              The field reported{" "}
              <code className="bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300 text-xs">
                {r.rca.culprit_feature}
              </code>{" "}
              as <strong>{r.rca.reported_value.toFixed(2)}</strong>. The Random Forest model
              calculates it should be approximately{" "}
              <strong className="text-emerald-400">{r.rca.expected_value.toFixed(2)}</strong>{" "}
              to produce the reported W_GAS volume.
            </p>
            <p className="text-xs text-amber-400 mt-2">
              Action: Inspect the <strong>{r.rca.culprit_feature}</strong> sensor or valve on well {r.well}.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-emerald-900 rounded-xl p-5 bg-emerald-950/20 animate-in">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <span className="font-semibold text-emerald-300">{r.well}</span>
        <span className="text-xs text-emerald-600 bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded-full">
          Normal Operation
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900/60 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">LSTM Expected</div>
          <div className="font-mono font-bold text-gray-200">{r.predicted_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³</div>
        </div>
        <div className="bg-gray-900/60 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Field Reported</div>
          <div className="font-mono font-bold text-gray-200">{r.reported_w_gas?.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³</div>
        </div>
        <div className="bg-gray-900/60 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Deviation</div>
          <div className="font-mono font-bold text-emerald-400">{r.error_pct?.toFixed(1)}%</div>
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
    <div className="animate-in">
      <p className="text-gray-400 mb-8 text-sm leading-relaxed max-w-2xl">
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
        className={`cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 mb-6 ${
          dragging
            ? "border-indigo-500 bg-indigo-950/30"
            : "border-gray-700 hover:border-gray-600 bg-gray-900/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-300 font-medium mb-1">
          {file ? file.name : "Drop your daily report here"}
        </p>
        <p className="text-xs text-gray-500">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB — click to change`
            : "Accepts .csv and .xlsx — must contain WELL, HOURS, WHP, WHT, WLP, H2O, WATER, W_GAS columns"}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleRun}
          disabled={!file || loading}
          className="relative overflow-hidden px-8 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-80 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-900/40 flex items-center"
        >
          {loading && progress !== null && (
            <div
              className="absolute inset-y-0 left-0 bg-indigo-400/30 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          )}
          <div className="relative z-10 flex items-center">
            {loading ? (
              <>
                Processing... {progress}% <LoadingDots />
              </>
            ) : (
              "Run Anomaly Check & RCA"
            )}
          </div>
        </button>
        {file && (
          <button
            onClick={() => { setFile(null); setResults(null); setError(null); }}
            className="px-5 py-2.5 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 text-sm transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mb-6 p-4 rounded-lg border border-red-900 bg-red-950/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Summary + Results */}
      {results && (
        <div className="animate-in space-y-4">
          {/* Summary bar */}
          <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-200">{results.length}</div>
              <div className="text-xs text-gray-500">Total Wells</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{anomalyCount}</div>
              <div className="text-xs text-gray-500">Anomalies</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{normalCount}</div>
              <div className="text-xs text-gray-500">Normal</div>
            </div>
          </div>

          {/* Individual results */}
          {results.map((r, i) => (
            <ResultCard key={i} r={r} />
          ))}
        </div>
      )}

      {/* Missing Wells Modal */}
      {missingWells && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-200 mb-2">Unrecognized Wells Detected</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your dataset contains wells that do not currently exist in the database. 
              Would you like to automatically create these {missingWells.length} wells?
            </p>
            <div className="max-h-40 overflow-y-auto mb-6 bg-gray-950 rounded border border-gray-800 p-2">
              <ul className="text-gray-300 text-xs font-mono space-y-1">
                {missingWells.map(w => <li key={w}>• {w}</li>)}
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setMissingWells(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                disabled={creatingWells}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateMissingWells}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 transition-colors"
                disabled={creatingWells}
              >
                {creatingWells ? 'Creating...' : 'Create Wells & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
