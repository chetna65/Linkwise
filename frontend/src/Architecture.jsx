import { BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { DATASETS } from "./data/results.js";

const usedT = DATASETS?.B?.thresholds?.find((t) => t.used);
const recallVal = usedT?.recall != null ? Number(usedT.recall).toFixed(2) : "0.21";
const cutoffVal = usedT?.cutoff != null ? Number(usedT.cutoff).toFixed(2) : "0.90";

export default function Architecture({ featureCount = 20 }) {
  const count = featureCount || 20;

  return (
    <div
      id="architecture"
      className="p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3.5 scroll-mt-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-on-surface">
            Architecture &amp; Limitations
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant font-mono text-[11px] text-outline shrink-0 font-medium">
          Research Prototype
        </span>
      </div>

      {/* Subsection 1: Inference Pipeline */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
          Inference Pipeline
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs font-mono text-on-surface-variant">
          <div className="flex items-start gap-2.5 p-2.5 rounded bg-surface-container border border-outline-variant/60">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-on-surface font-semibold">{count} URL-only features:</strong>{" "}
              domain length, hyphens, digits, entropy, TLD, keyword and brand terms.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded bg-surface-container border border-outline-variant/60">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-on-surface font-semibold">No network access during analysis:</strong>{" "}
              the input is parsed as text only, with no DNS lookup, page fetch, or certificate check.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded bg-surface-container border border-outline-variant/60">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-on-surface font-semibold">Tuned XGBoost:</strong>{" "}
              loaded from native JSON; a domain is flagged at a score of {cutoffVal} or higher.
            </div>
          </div>
        </div>
      </div>

      {/* Subsection 2: Important Scope Limits */}
      <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/60">
        <div className="text-[11px] font-mono uppercase tracking-wider text-danger font-semibold">
          Important Scope Limits
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs font-mono text-on-surface-variant">
          <div className="flex items-start gap-2.5 p-2.5 rounded bg-danger/5 border border-danger/20">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <strong className="text-on-surface font-semibold">No page content:</strong>{" "}
              forms, scripts and certificates are not examined.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded bg-danger/5 border border-danger/20">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <strong className="text-on-surface font-semibold">Domain level only:</strong>{" "}
              paths and queries are ignored, and shared hosting platforms such as web.app cannot be judged.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded bg-danger/5 border border-danger/20">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <strong className="text-on-surface font-semibold">Misses most phishing:</strong>{" "}
              at the {cutoffVal} cutoff, recall is {recallVal}.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded bg-danger/5 border border-danger/20">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <strong className="text-on-surface font-semibold">Research prototype:</strong>{" "}
              for education, not a security product.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
