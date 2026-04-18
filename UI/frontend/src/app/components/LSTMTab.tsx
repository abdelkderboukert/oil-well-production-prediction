"use client";

import { useState, useEffect, useCallback } from "react";
import { TARGETS, type ForecastHistoryRow, type TargetOutputs, forecastWell, fetchWells } from "../../lib/api";

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-2">
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-black inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-black inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-black inline-block" />
    </span>
  );
}

function MiniChart({
  history,
  forecast,
  target,
}: {
  history: ForecastHistoryRow[];
  forecast: TargetOutputs;
  target: string;
}) {
  const key = target as keyof ForecastHistoryRow;
  const histVals = history.map((r) => Number(r[key]));
  const forecastVal = forecast[target as keyof TargetOutputs];
  const allVals = [...histVals, forecastVal];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;

  const W = 560;
  const H = 160;
  const padX = 40;
  const padY = 20;

  const toX = (i: number, total: number) =>
    padX + (i / (total - 1)) * (W - padX * 2);
  const toY = (v: number) =>
    H - padY - ((v - min) / range) * (H - padY * 2);

  const histPoints = histVals.map((v, i) => ({ x: toX(i, 9), y: toY(v) }));
  const forecastPoint = { x: toX(8, 9), y: toY(forecastVal) };

  const histPath = histPoints
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(" ");

  const connectPath = `M${histPoints[histPoints.length - 1].x},${
    histPoints[histPoints.length - 1].y
  } L${forecastPoint.x},${forecastPoint.y}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 mt-4 font-mono">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <line
          key={frac}
          x1={padX}
          x2={W - padX}
          y1={toY(min + frac * range)}
          y2={toY(min + frac * range)}
          stroke="#2A2A27"
          strokeWidth="1"
        />
      ))}
      {/* Historical line */}
      <path d={histPath} fill="none" stroke="#9A9A92" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Forecast connector (dashed) */}
      <path
        d={connectPath}
        fill="none"
        stroke="#D4882A"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        strokeLinejoin="round"
      />
      {/* Historical dots */}
      {histPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6B6B64" />
      ))}
      {/* Forecast dot */}
      <circle cx={forecastPoint.x} cy={forecastPoint.y} r="6" fill="#D4882A" stroke="#0A0A08" strokeWidth="2" />
      {/* Labels */}
      {histPoints.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#6B6B64">
          Day {i + 1}
        </text>
      ))}
      <text x={forecastPoint.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#D4882A">
        Tomorrow
      </text>
    </svg>
  );
}

export default function LSTMTab() {
  const [wells, setWells]       = useState<string[]>([]);
  const [selectedWell, setSelectedWell] = useState<string>("");
  const [loading, setLoading]   = useState(false);
  const [wellsLoading, setWellsLoading] = useState(true);
  const [result, setResult]     = useState<{ forecast: TargetOutputs; history: ForecastHistoryRow[] } | null>(null);
  const [chartTarget, setChartTarget] = useState<string>("W_GAS");
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    setWellsLoading(true);
    fetchWells()
      .then((w) => {
        setWells(w);
        if (w.length > 0) setSelectedWell(w[0]);
      })
      .finally(() => setWellsLoading(false));
  }, []);

  const handleForecast = useCallback(async () => {
    if (!selectedWell) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await forecastWell(selectedWell);
      setResult({ forecast: data.forecast, history: data.history });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedWell]);

  return (
    <div className="animate-fade-in">
      <p className="text-oil-mist mb-8 text-sm leading-relaxed max-w-2xl font-body">
        Select a well from the database. The system fetches the last 7 days of production records,
        scales them, and runs them through the LSTM network to forecast tomorrow&apos;s outputs.
      </p>

      {/* Well selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-[10px] font-semibold text-oil-smoke uppercase tracking-widest mb-2 font-mono">
            Target Well
          </label>
          {wellsLoading ? (
            <div className="h-[46px] bg-oil-surface border border-oil-border rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedWell}
              onChange={(e) => { setSelectedWell(e.target.value); setResult(null); }}
              className="w-full bg-oil-deep border border-oil-border text-oil-light rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-oil-amber transition font-mono"
            >
              {wells.length === 0 && (
                <option value="">No wells in database</option>
              )}
              {wells.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-end">
          <button
            onClick={handleForecast}
            disabled={loading || !selectedWell || wellsLoading}
            className="px-8 py-3 rounded-lg bg-oil-amber hover:bg-oil-gold disabled:opacity-50 disabled:cursor-not-allowed text-oil-black font-mono tracking-widest text-xs uppercase transition-all duration-300 shadow-[0_0_20px_rgba(212,136,42,0.2)] flex items-center h-[46px]"
          >
            {loading ? <>Forecasting<LoadingDots /></> : "Run LSTM Forecast →"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-oil-rust/50 bg-oil-rust/10 text-red-300 text-sm font-mono">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-fade-up space-y-8">
          {/* Forecast metrics */}
          <div>
            <h3 className="text-[10px] font-semibold text-oil-smoke uppercase tracking-widest mb-4 font-mono">
              Forecast — Tomorrow&apos;s Production for <span className="text-oil-amber">{selectedWell}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TARGETS.map((t) => (
                <div
                  key={t}
                  className="bg-oil-surface/50 border border-oil-border rounded-xl p-5 hover:bg-oil-surface transition-colors duration-300 relative overflow-hidden"
                >
                  <div className="text-[10px] text-oil-smoke tracking-widest mb-1 font-mono uppercase">{t.replace("_", " ")}</div>
                  <div className="text-2xl font-black font-display text-oil-light">
                    {result.forecast[t].toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-oil-surface/30 border border-oil-border rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <h3 className="text-[10px] font-semibold text-oil-smoke uppercase tracking-widest font-mono">
                Trend Visualization
              </h3>
              <select
                value={chartTarget}
                onChange={(e) => setChartTarget(e.target.value)}
                className="bg-oil-deep border border-oil-border text-oil-light rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-oil-amber transition font-mono uppercase tracking-wider"
              >
                {TARGETS.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="flex gap-5 text-[10px] font-mono tracking-widest uppercase text-oil-smoke mb-2">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-0.5 bg-oil-mist" /> Historical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-0.5 bg-oil-amber border-dashed border-t-2 border-oil-deep" /> Forecast
              </span>
            </div>
            <MiniChart
              history={result.history}
              forecast={result.forecast}
              target={chartTarget}
            />
          </div>

          {/* History table */}
          <div className="bg-oil-surface/30 border border-oil-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-oil-border">
              <h3 className="text-[10px] font-semibold text-oil-smoke uppercase tracking-widest font-mono">
                Last 7 Days — Historical Data
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-oil-border">
                    <th className="px-6 py-4 text-[10px] tracking-widest text-oil-smoke uppercase font-mono">DATE</th>
                    {TARGETS.map((t) => (
                      <th key={t} className="px-6 py-4 text-[10px] tracking-widest text-oil-smoke uppercase font-mono whitespace-nowrap">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.history.map((row, i) => (
                    <tr key={i} className="border-b border-oil-border/50 hover:bg-oil-surface transition-colors">
                      <td className="px-6 py-3 text-oil-mist text-xs font-mono">{row.date}</td>
                      {TARGETS.map((t) => (
                        <td key={t} className="px-6 py-3 text-oil-light text-xs font-mono">
                          {Number(row[t as keyof ForecastHistoryRow]).toLocaleString("en-US", { maximumFractionDigits: 1 })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
