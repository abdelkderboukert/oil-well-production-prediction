// Shared types for API communication

export const FEATURES = ["HOURS", "WHP", "WHT", "WLP", "H2O", "WATER"] as const;
export const TARGETS = [
  "W_GAS",
  "S_GAS",
  "LPG_VOL",
  "LPG_MASS",
  "COND_VOL",
  "COND_MASS",
] as const;

export type Feature = (typeof FEATURES)[number];
export type Target = (typeof TARGETS)[number];

export type FeatureInputs = Record<Feature, number>;
export type TargetOutputs = Record<Target, number>;

export interface PredictResponse {
  predictions: TargetOutputs;
}

export interface ForecastHistoryRow {
  date: string;
  W_GAS: number;
  S_GAS: number;
  LPG_VOL: number;
  LPG_MASS: number;
  COND_VOL: number;
  COND_MASS: number;
}

export interface ForecastResponse {
  well: string;
  forecast: TargetOutputs;
  history: ForecastHistoryRow[];
}

export interface RcaResult {
  culprit_feature: string;
  reported_value: number;
  expected_value: number;
}

export interface AnalyzeResult {
  well: string;
  status: "normal" | "anomaly" | "insufficient_data";
  predicted_w_gas?: number;
  reported_w_gas?: number;
  error_pct?: number;
  rca?: RcaResult;
  message?: string;
}

export interface AnalyzeResponse {
  results: AnalyzeResult[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export async function predictProduction(
  inputs: FeatureInputs,
): Promise<PredictResponse> {
  const res = await fetch(`${BASE}/ml/predict/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function forecastWell(well: string): Promise<ForecastResponse> {
  const res = await fetch(`${BASE}/ml/forecast/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ well }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeReport(
  file: File,
  onProgress?: (pct: number, result: AnalyzeResult | null) => void
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/ml/analyze/`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  const finalResults: AnalyzeResult[] = [];
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.progress !== undefined) {
          onProgress?.(msg.progress, msg.result);
        }
        if (msg.result) {
          finalResults.push(msg.result);
        }
      } catch (err) {
        console.error("Failed to parse NDJSON line", line);
      }
    }
  }
  return { results: finalResults };
}

export async function fetchWells(): Promise<string[]> {
  const res = await fetch(`${BASE}/wells/`);
  if (!res.ok) return [];
  const data = await res.json();
  // DRF paginated: { results: [{name: ...}] } or plain array
  const items = data.results ?? data;
  console.table(items);
  return items.map((w: { name: string }) => w.name);
}
