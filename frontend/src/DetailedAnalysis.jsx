import { useState } from "react";
import { AlertTriangle, LineChart, Image as ImageIcon } from "lucide-react";
import { DATASETS } from "./data/results.js";

function Plot({ file, title }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex flex-col gap-2">
      {failed ? (
        <div className="rounded-lg border border-dashed border-outline-variant p-6 text-xs font-mono text-outline text-center flex flex-col items-center justify-center gap-1.5 min-h-[140px] bg-surface-container-lowest">
          <ImageIcon className="w-5 h-5 text-outline mb-1" />
          <span>
            Add <code className="text-on-surface font-semibold">{file}</code> to{" "}
            <code className="text-on-surface">public/plots/</code> to show this plot here.
          </span>
        </div>
      ) : (
        <img
          src={`/plots/${file}`}
          alt={title}
          onError={() => setFailed(true)}
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest"
        />
      )}
      <figcaption className="text-xs font-mono text-on-surface-variant">{title}</figcaption>
    </figure>
  );
}

export default function DetailedAnalysis({ datasetKey = "B" }) {
  const ds = DATASETS[datasetKey] || DATASETS.B;

  // Overfitting calculations (dataset A)
  const overfitRows = (ds.models || []).filter((m) => m.trainAcc != null);
  const pos = (v) => `${Math.max(2, Math.min(100, ((v - 0.85) / 0.15) * 100))}%`;

  // Confusion matrix rows (dataset A)
  const confusionRows = (ds.models || []).filter((m) => m.confusion);

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold tracking-tight text-on-surface font-mono uppercase">
            Detailed analysis
          </h2>
          <span className="hidden sm:inline text-xs font-mono text-outline">
            | {ds.tab}
          </span>
        </div>
        <span className="text-xs font-mono text-primary px-2.5 py-0.5 rounded bg-surface-container-high border border-outline-variant">
          {ds.sampleLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs font-mono text-on-surface-variant max-w-3xl leading-relaxed">
        {ds.description}
      </p>

      {/* Card 1: What Stands Out */}
      <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
            What stands out
          </h3>
          <span className="text-xs text-on-surface-variant font-mono">
            Key empirical findings and trade-offs observed during evaluation.
          </span>
        </div>

        <ul className="space-y-2 text-xs font-mono text-on-surface-variant pt-1">
          {ds.takeaways.map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>

        {ds.caveat && (
          <div className="p-2.5 rounded bg-warn/10 border border-warn/30 text-[11px] font-mono text-warn flex items-start gap-2 leading-relaxed mt-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{ds.caveat}</span>
          </div>
        )}
      </div>

      {/* Dataset A Only: Overfitting Check & Confusion Matrices */}
      {datasetKey === "A" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Overfitting Check (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
                Overfitting check
              </h3>
              <span className="text-xs text-on-surface-variant font-mono">
                A large gap between training and test accuracy indicates memorization.
              </span>
            </div>

            <ul className="space-y-3 mt-1">
              {overfitRows.map((r) => {
                const gap = (r.trainAcc - r.testAcc) * 100;
                return (
                  <li
                    key={r.name}
                    className="grid grid-cols-[9rem_1fr_4rem] sm:grid-cols-[11rem_1fr_4.5rem] items-center gap-3 text-xs font-mono"
                  >
                    <span className="text-on-surface truncate">{r.name}</span>
                    <div className="space-y-1">
                      {/* Train bar */}
                      <div className="h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-300"
                          style={{ width: pos(r.trainAcc) }}
                          title={`Train: ${(r.trainAcc * 100).toFixed(1)}%`}
                        />
                      </div>
                      {/* Test bar */}
                      <div className="h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                        <div
                          className="h-full rounded-full bg-secondary transition-all duration-300"
                          style={{ width: pos(r.testAcc) }}
                          title={`Test: ${(r.testAcc * 100).toFixed(1)}%`}
                        />
                      </div>
                    </div>
                    <span className="text-right tabular font-mono text-on-surface-variant font-medium">
                      {gap.toFixed(1)} pt
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-2 text-xs font-mono text-outline pt-2 border-t border-outline-variant/40">
              Teal: training accuracy. Blue: test accuracy. Right column: accuracy gap. Scale starts at 85%.
            </p>
          </div>

          {/* Errors on the Test Set: Confusion Matrices (7 cols) */}
          <div className="lg:col-span-7 p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
                Errors on the test set
              </h3>
              <span className="text-xs text-on-surface-variant font-mono">
                The red cell is the dangerous error: phishing that the model called legitimate.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {confusionRows.map((r) => (
                <div
                  key={r.name}
                  className="p-3 rounded bg-surface-container border border-outline-variant/60 flex flex-col gap-2"
                >
                  <p className="text-xs font-mono font-semibold text-on-surface truncate" title={r.name}>
                    {r.name}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-center text-xs font-mono">
                    {/* TN */}
                    <div className="flex flex-col items-center justify-center rounded p-2 bg-surface-container-high border border-outline-variant/40">
                      <span className="text-base font-bold text-on-surface tabular">
                        {r.confusion.tn}
                      </span>
                      <span className="text-[10px] text-outline">legit, called legit</span>
                    </div>

                    {/* FP */}
                    <div className="flex flex-col items-center justify-center rounded p-2 bg-surface-container-high border border-outline-variant/40">
                      <span className="text-base font-bold text-on-surface tabular">
                        {r.confusion.fp}
                      </span>
                      <span className="text-[10px] text-outline">legit, flagged</span>
                    </div>

                    {/* FN: Missed Phishing (Danger Red) */}
                    <div className="flex flex-col items-center justify-center rounded p-2 bg-danger/15 border border-danger/30">
                      <span className="text-base font-bold text-danger tabular">
                        {r.confusion.fn}
                      </span>
                      <span className="text-[10px] text-danger font-medium">phishing, missed</span>
                    </div>

                    {/* TP */}
                    <div className="flex flex-col items-center justify-center rounded p-2 bg-surface-container-high border border-outline-variant/40">
                      <span className="text-base font-bold text-on-surface tabular">
                        {r.confusion.tp}
                      </span>
                      <span className="text-[10px] text-outline">phishing, caught</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dataset B Only: Why the Raw URLs Were Not Used */}
      {datasetKey === "B" && Array.isArray(ds.shortcut) && (
        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
              Why the raw URLs were not used
            </h3>
            <span className="text-xs text-on-surface-variant font-mono">
              Every legitimate URL in the raw dataset was a bare https://www. homepage, so a model could score high without learning anything about phishing.
            </span>
          </div>

          <ul className="space-y-3 mt-1">
            {ds.shortcut.map((r) => (
              <li
                key={r.name}
                className="grid grid-cols-[10rem_1fr_4.5rem] sm:grid-cols-[18rem_1fr_4.5rem] items-center gap-3 text-xs font-mono"
              >
                <span className="text-on-surface truncate">{r.name}</span>
                <div className="h-2.5 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-300"
                    style={{ width: `${r.value * 100}%` }}
                  />
                </div>
                <span className="text-right tabular font-mono font-semibold text-on-surface">
                  {(r.value * 100).toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs font-mono text-outline pt-2 border-t border-outline-variant/40">
            Accuracy metric. Always predicting legitimate scores {(ds.baselineAccuracy * 100).toFixed(1)}% ({ds.baselineAccuracy.toFixed(4)}) on the domain-level data.
          </p>
        </div>
      )}

      {/* Plots Section */}
      {Array.isArray(ds.plots) && ds.plots.length > 0 && (
        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
              Visual evaluation plots
            </h3>
            <span className="text-xs text-on-surface-variant font-mono">
              High-resolution diagnostics generated during offline training and validation.
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            {ds.plots.map((p) => (
              <Plot key={p.file} {...p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
