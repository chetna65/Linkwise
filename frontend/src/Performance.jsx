import { useState } from "react";
import {
  BarChart3,
  Sparkles,
  SlidersHorizontal,
  ShieldCheck,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { DATASETS } from "./data/results.js";
import Architecture from "./Architecture.jsx";

export default function Performance({
  datasetKey: controlledDatasetKey,
  onDatasetChange,
}) {
  const [internalDatasetKey, setInternalDatasetKey] = useState("B");
  const datasetKey = controlledDatasetKey ?? internalDatasetKey;
  const setDatasetKey = onDatasetChange ?? setInternalDatasetKey;
  const [metricKey, setMetricKey] = useState("f1");
  const [zoom, setZoom] = useState(false);

  const ds = DATASETS[datasetKey];

  // Active metric ensures validity across datasets (e.g., prAuc only in B)
  const activeMetric = ds.metrics.some((m) => m.key === metricKey)
    ? metricKey
    : ds.metrics[0].key;

  // Best ROC-AUC
  const rocModels = ds.models.filter((m) => m.rocAuc != null);
  const bestRoc = rocModels.reduce(
    (max, m) => (m.rocAuc > max.val ? { val: m.rocAuc, model: m.name } : max),
    { val: 0, model: "" }
  );

  // Best F1
  const f1Models = ds.models.filter((m) => m.f1 != null);
  const bestF1 = f1Models.reduce(
    (max, m) => (m.f1 > max.val ? { val: m.f1, model: m.name } : max),
    { val: 0, model: "" }
  );

  // Precision KPI
  let precisionKpi;
  if (datasetKey === "B") {
    const usedT = ds.thresholds?.find((t) => t.used);
    precisionKpi = {
      val: usedT ? usedT.precision : 0.973,
      sub: `@ ${usedT?.cutoff ? usedT.cutoff.toFixed(2) : "0.90"} Operational Cutoff`,
    };
  } else {
    const precModels = ds.models.filter((m) => m.precision != null);
    const topP = precModels.reduce(
      (max, m) => (m.precision > max.val ? { val: m.precision, model: m.name } : max),
      { val: 0, model: "" }
    );
    precisionKpi = {
      val: topP.val,
      sub: topP.model,
    };
  }

  // Count base non-tuned classifiers
  const baseModelsCount = ds.models.filter((m) => !m.tuned).length;

  // Best value per column for the matrix
  const bestInCol = {};
  ds.columns.forEach((c) => {
    const vals = ds.models.map((m) => m[c.key]).filter((v) => v != null);
    bestInCol[c.key] = c.lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
  });

  // Top model by F1 for footer statement and row highlighting
  const topF1 = f1Models.reduce(
    (max, m) => (m.f1 > max.val ? { val: m.f1, name: m.name } : max),
    { val: -1, name: "" }
  );

  // Sorted rows for Model Comparison Chart
  const rows = ds.models
    .filter((m) => m[activeMetric] != null)
    .slice()
    .sort((a, b) => b[activeMetric] - a[activeMetric]);

  const vals = rows.map((r) => r[activeMetric]);
  const min = zoom ? Math.max(0, Math.floor((Math.min(...vals) - 0.03) * 20) / 20) : 0;

  // Threshold Tradeoff computations (for dataset B)
  const hasThresholds = Array.isArray(ds.thresholds) && ds.thresholds.length > 0;
  const deployedThreshold = hasThresholds
    ? ds.thresholds.find((t) => t.used) || ds.thresholds[ds.thresholds.length - 1]
    : null;

  // SVG chart points calculation: width=360, height=115
  // x from 35 to 335 (width=300), y from 15 to 95 (height=80, where y=15 is val 1.0, y=95 is val 0.0)
  const thresholdPoints = hasThresholds
    ? ds.thresholds.map((t, idx) => {
        const x = 35 + (idx / Math.max(ds.thresholds.length - 1, 1)) * 300;
        const yPrec = 15 + (1 - t.precision) * 80;
        const yRec = 15 + (1 - t.recall) * 80;
        return { ...t, x, yPrec, yRec };
      })
    : [];

  const precPath = thresholdPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yPrec.toFixed(1)}`)
    .join(" ");

  const recPath = thresholdPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yRec.toFixed(1)}`)
    .join(" ");

  const deployedPoint = thresholdPoints.find((p) => p.used);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/60 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold tracking-tight text-on-surface font-mono uppercase">
            Model Performance Dashboard
          </h2>
          <span className="hidden sm:inline text-xs font-mono text-outline">
            | {ds.splitLabel}
          </span>
        </div>

        {/* Dataset Toggle Switcher */}
        <div className="flex items-center">
          <div className="flex p-0.5 rounded bg-surface-container-low border border-outline-variant text-xs font-mono">
            <button
              type="button"
              onClick={() => setDatasetKey("B")}
              aria-pressed={datasetKey === "B"}
              className={`px-3 py-1 rounded transition-all ${
                datasetKey === "B"
                  ? "bg-primary text-on-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Domain Lexical Features
            </button>
            <button
              type="button"
              onClick={() => setDatasetKey("A")}
              aria-pressed={datasetKey === "A"}
              className={`px-3 py-1 rounded transition-all ${
                datasetKey === "A"
                  ? "bg-primary text-on-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              UCI Structural Features
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards (Calculated from Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Best ROC-AUC */}
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span className="uppercase tracking-wider">Best ROC-AUC</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-primary tabular">
              {bestRoc.val.toFixed(3)}
            </div>
            <div className="text-xs font-mono text-on-surface-variant mt-0.5 truncate" title={bestRoc.model}>
              {bestRoc.model}
            </div>
          </div>
        </div>

        {/* Card 2: Best F1-Score */}
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span className="uppercase tracking-wider">Best F1-Score</span>
            <SlidersHorizontal className="w-4 h-4 text-secondary" />
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-secondary tabular">
              {bestF1.val.toFixed(3)}
            </div>
            <div className="text-xs font-mono text-on-surface-variant mt-0.5 truncate" title={bestF1.model}>
              {bestF1.model}
            </div>
          </div>
        </div>

        {/* Card 3: Precision */}
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span className="uppercase tracking-wider">Precision</span>
            <ShieldCheck className="w-4 h-4 text-tertiary" />
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-tertiary tabular">
              {precisionKpi.val.toFixed(3)}
            </div>
            <div className="text-xs font-mono text-on-surface-variant mt-0.5 truncate" title={precisionKpi.sub}>
              {precisionKpi.sub}
            </div>
          </div>
        </div>

        {/* Card 4: Models Evaluated */}
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span className="uppercase tracking-wider">Models Evaluated</span>
            <Layers className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-on-surface tabular">
              {baseModelsCount} Classifiers
            </div>
            <div className="text-xs font-mono text-on-surface-variant mt-0.5 flex items-center justify-between gap-1 truncate">
              <span>{ds.sampleLabel}</span>
              <span className="text-outline text-[11px]">{ds.splitLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Column Grid: Comparison Chart (5 cols) & Benchmark Matrix (7 cols) */}
      <div id="matrix" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-28">
        {/* Left Column: Horizontal Bar Chart with Metric Tabs (5 cols on desktop) */}
        <div className="lg:col-span-5 p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
                Model Comparison Chart
              </h3>
              <span className="text-[11px] font-mono text-outline">
                Metric: {ds.metrics.find((m) => m.key === activeMetric)?.label || activeMetric}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              Sorted best first for the selected cross-model benchmark metric.
            </p>
          </div>

          {/* Metric Selection Tabs & Zoom Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-outline-variant/40">
            <div className="flex flex-wrap gap-1 p-0.5 rounded bg-surface-container-lowest border border-outline-variant text-xs font-mono">
              {ds.metrics.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetricKey(m.key)}
                  aria-pressed={activeMetric === m.key}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeMetric === m.key
                      ? "bg-surface-container-high text-primary font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-mono text-on-surface-variant cursor-pointer select-none">
              <input
                type="checkbox"
                checked={zoom}
                onChange={(e) => setZoom(e.target.checked)}
                className="rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary focus:ring-1"
              />
              <span>Zoom in on differences</span>
            </label>
          </div>

          {/* Horizontal Bars */}
          <ul className="mt-3 space-y-2.5">
            {rows.map((r, idx) => {
              const val = r[activeMetric];
              const w = Math.max(2, Math.min(100, ((val - min) / (1 - min)) * 100));
              const isBest = idx === 0;
              const isRunnerUp = idx === 1;

              let barColor = "bg-surface-container-highest";
              let textColor = "text-on-surface-variant";
              if (isBest) {
                barColor = "bg-primary";
                textColor = "text-primary font-bold";
              } else if (isRunnerUp) {
                barColor = "bg-secondary";
                textColor = "text-secondary font-semibold";
              }

              return (
                <li
                  key={r.name}
                  className="grid grid-cols-[10rem_1fr_4.5rem] sm:grid-cols-[13rem_1fr_4.5rem] items-center gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`truncate ${r.tuned ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {r.name}
                    </span>
                    {isBest && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 shrink-0">
                        BEST
                      </span>
                    )}
                  </div>

                  <div className="h-2.5 rounded-full bg-surface-container-lowest overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${w}%` }}
                    />
                  </div>

                  <span className={`text-right tabular font-mono ${textColor}`}>
                    {val.toFixed(4)}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Note on Scale */}
          <p className="mt-2 text-xs font-mono text-outline">
            {zoom
              ? `Scale starts at ${min.toFixed(2)}, so small gaps look larger.`
              : "Scale starts at 0.00."}{" "}
            Teal indicates top performer; blue indicates runner-up.
          </p>
        </div>

        {/* Right Column: Benchmark Evaluation Matrix (7 cols on desktop) */}
        <div className="lg:col-span-7 p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
                Benchmark Evaluation Matrix
              </h3>
              <span className="text-xs text-on-surface-variant font-mono">
                Quantitative evaluation across uniform held-out validation partitions.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant font-mono text-[11px] text-primary shrink-0">
              {ds.splitLabel}
            </span>
          </div>

          {/* Matrix Table in overflow-x-auto */}
          <div className="overflow-x-auto rounded border border-outline-variant/60 custom-scroll">
            <table className="w-full text-left font-mono text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-surface-container-high text-outline text-[12px] uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-2.5 px-3 font-medium">Model Architecture</th>
                  {ds.columns.map((c) => (
                    <th key={c.key} className="py-2.5 px-3 text-right font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {ds.models.map((m) => {
                  const isBestRow = m.name === topF1.name;
                  const displayName = m.tuned && !m.name.includes("(tuned)") ? `${m.name} (tuned)` : m.name;

                  return (
                    <tr
                      key={m.name}
                      className={`transition-colors ${
                        isBestRow
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-surface-container"
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {isBestRow && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <span
                            className={
                              isBestRow
                                ? "font-semibold text-primary"
                                : m.tuned
                                ? "text-on-surface"
                                : "text-on-surface-variant"
                            }
                          >
                            {displayName}
                          </span>
                        </div>
                      </td>

                      {ds.columns.map((c) => {
                        const v = m[c.key];
                        const isBest = v != null && v === bestInCol[c.key];
                        const formatted = c.fmt ? c.fmt(v) : (v == null ? "–" : v.toFixed(3));

                        return (
                          <td
                            key={c.key}
                            className={`py-2.5 px-3 text-right tabular ${
                              v == null
                                ? "text-outline"
                                : isBest
                                ? isBestRow
                                  ? "text-primary font-bold"
                                  : "text-on-surface font-bold"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {formatted}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Line with F1 Leader Statement and Seed */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-outline-variant/60 text-xs font-mono text-outline">
            <span>
              {topF1.name} has the highest F1 ({topF1.val.toFixed(3)}).
            </span>
            <span className="shrink-0">Seed: 42</span>
          </div>
        </div>
      </div>

      {/* Second Row: Classification Threshold Tradeoff (Left Half) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
                Classification Threshold Tradeoff
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Precision-recall calibration across classification cutoffs.
              </p>
            </div>
            {deployedThreshold && (
              <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-semibold shrink-0">
                Deployed: {deployedThreshold.cutoff.toFixed(2)}
              </span>
            )}
          </div>

          {hasThresholds && deployedPoint ? (
            <>
              {/* SVG Line Chart */}
              <div className="w-full bg-surface-container-lowest rounded border border-outline-variant/60 p-3 flex flex-col gap-1.5">
                <svg
                  className="w-full h-28"
                  viewBox="0 0 360 115"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Grid Lines */}
                  <line x1="30" x2="340" y1="15" y2="15" stroke="#1e2738" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="30" x2="340" y1="55" y2="55" stroke="#1e2738" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="30" x2="340" y1="95" y2="95" stroke="#263247" strokeWidth="1" />

                  {/* Y-Axis Labels */}
                  <text x="25" y="18" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono" textAnchor="end">1.0</text>
                  <text x="25" y="58" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono" textAnchor="end">0.5</text>
                  <text x="25" y="98" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono" textAnchor="end">0.0</text>

                  {/* Dashed Vertical Line & Label at Deployed Cutoff */}
                  <line
                    x1={deployedPoint.x}
                    x2={deployedPoint.x}
                    y1="10"
                    y2="95"
                    stroke="#22d3c5"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                  <text
                    x={deployedPoint.x}
                    y="8"
                    fill="#22d3c5"
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    Cutoff {deployedPoint.cutoff.toFixed(2)}
                  </text>

                  {/* Precision Curve (Teal) */}
                  <path
                    d={precPath}
                    fill="none"
                    stroke="#22d3c5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Recall Curve (Blue) */}
                  <path
                    d={recPath}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points on the Curves */}
                  {thresholdPoints.map((p) => (
                    <g key={p.cutoff}>
                      <circle
                        cx={p.x}
                        cy={p.yPrec}
                        r={p.used ? "3.5" : "2"}
                        fill="#22d3c5"
                      />
                      <circle
                        cx={p.x}
                        cy={p.yRec}
                        r={p.used ? "3.5" : "2"}
                        fill="#60a5fa"
                      />
                      <text
                        x={p.x}
                        y="108"
                        fill={p.used ? "#22d3c5" : "#64748b"}
                        fontSize="8"
                        fontFamily="JetBrains Mono"
                        textAnchor="middle"
                        fontWeight={p.used ? "bold" : "normal"}
                      >
                        {p.cutoff.toFixed(1)}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Legend & Measured Points Note */}
                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-outline pt-1 border-t border-outline-variant/40 gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-primary flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-0.5 bg-primary rounded-full" />
                      Precision ({deployedPoint.precision.toFixed(3)})
                    </span>
                    <span className="text-secondary flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-0.5 bg-secondary rounded-full" />
                      Recall ({deployedPoint.recall.toFixed(3)})
                    </span>
                  </div>
                  <span>Measured at 0.5, 0.6, 0.7, 0.8 and 0.9</span>
                </div>
              </div>

              {/* 3 Metric Tiles Under Chart */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                {/* Tile 1: Precision */}
                <div className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex flex-col justify-between">
                  <span className="text-[10px] text-outline uppercase tracking-wider">Precision</span>
                  <span className="text-base font-bold text-primary tabular mt-0.5">
                    {deployedPoint.precision.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">
                    {(100 - deployedPoint.precision * 100).toFixed(1)}% of flags wrong
                  </span>
                </div>

                {/* Tile 2: Recall */}
                <div className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex flex-col justify-between">
                  <span className="text-[10px] text-outline uppercase tracking-wider">Recall</span>
                  <span className="text-base font-bold text-secondary tabular mt-0.5">
                    {deployedPoint.recall.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">
                    most phishing missed
                  </span>
                </div>

                {/* Tile 3: Popular Sites Flagged (Tranco) */}
                <div className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex flex-col justify-between">
                  <span className="text-[10px] text-outline uppercase tracking-wider truncate" title="Popular sites flagged (Tranco top 1,000)">
                    Popular sites flagged
                  </span>
                  <span className="text-base font-bold text-on-surface tabular mt-0.5">
                    {deployedPoint.tranco} / 1000
                  </span>
                  <span className="text-[10px] text-outline mt-0.5">
                    Tranco top 1,000
                  </span>
                </div>
              </div>

              {/* Tradeoff Explanation */}
              <p className="text-xs text-on-surface-variant font-mono border-t border-outline-variant/60 pt-2 leading-relaxed">
                A higher cutoff means fewer false alarms but more phishing missed.
              </p>
            </>
          ) : (
            <div className="p-4 rounded bg-surface-container border border-outline-variant/40 text-xs font-mono text-on-surface-variant">
              The cutoff sweep was run only for the domain-level experiment.
            </div>
          )}

          {/* ds.caveat small amber note */}
          {ds.caveat && (
            <div className="p-2.5 rounded bg-warn/10 border border-warn/30 text-[11px] font-mono text-warn flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{ds.caveat}</span>
            </div>
          )}
        </div>

        {/* Right Half: Architecture & Limitations */}
        <div className="lg:col-span-6">
          <Architecture />
        </div>
      </div>
    </div>
  );
}
