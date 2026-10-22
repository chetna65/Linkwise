import { useState } from "react";
import { Shield, ShieldCheck, Info, FlaskConical, ChevronDown } from "lucide-react";
import { DATASETS } from "./data/results.js";

// Compute dynamic recall percentage for the used cutoff
const usedThreshold = DATASETS?.B?.thresholds?.find((t) => t.used);
const recallPct = usedThreshold ? Math.round(usedThreshold.recall * 100) : 21;

function getStatusConfig(verdict, score) {
  if (verdict === "phishing") {
    return {
      label: "Likely phishing",
      text: "text-danger",
      dot: "bg-danger animate-pulse",
      chip: "bg-danger/15 border-danger/30 text-danger",
      bar: "bg-danger",
      scoreText: "text-danger",
    };
  }
  if (verdict === "unknown") {
    return {
      label: "Shared hosting, can't judge",
      text: "text-warn",
      dot: "bg-warn",
      chip: "bg-warn/15 border-warn/30 text-warn",
      bar: "bg-warn",
      scoreText: "text-warn",
    };
  }
  if (score >= 0.5) {
    return {
      label: "Elevated score, below cutoff",
      text: "text-warn",
      dot: "bg-warn",
      chip: "bg-warn/15 border-warn/30 text-warn",
      bar: "bg-warn",
      scoreText: "text-warn",
    };
  }
  return {
    label: "No strong phishing signal",
    text: "text-secondary",
    dot: "bg-secondary",
    chip: "bg-surface-container-highest border-outline-variant text-secondary",
    bar: "bg-secondary",
    scoreText: "text-secondary",
  };
}

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);

  const executeCheck = async (domainToCheck) => {
    const target = (domainToCheck !== undefined ? domainToCheck : url).trim();
    if (!target) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      if (!res.ok) {
        let msg = "Request failed";
        try {
          const body = await res.json();
          msg = body.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (
        err.name === "TypeError" ||
        err.message === "Failed to fetch" ||
        err.message.includes("NetworkError") ||
        err.message.includes("Load failed")
      ) {
        setError("Can't reach the server. Is the backend running on port 8000?");
      } else {
        setError(err.message);
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeCheck();
  };

  const handleQuickTest = (sampleDomain) => {
    setUrl(sampleDomain);
    executeCheck(sampleDomain);
  };

  const score = result ? result.phishing_probability ?? 0 : 0;
  const statusCfg = result ? getStatusConfig(result.verdict, score) : null;
  const cutoff = result?.threshold ?? 0.9;
  const cutoffPct = cutoff * 100;
  const scorePct = Math.min(Math.max(score * 100, 0), 100);
  const feats = result?.features || {};
  const numFeatures = Object.keys(feats).length;
  const keywords = result?.matched_keywords || [];
  const brands = result?.matched_brands || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1 pb-4 border-b border-outline-variant/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-primary font-mono text-[11px] font-medium tracking-wider uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Static Lexical Telemetry &amp; GBDT Scoring
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
            Analyze Domains. <span className="text-primary font-semibold">Understand the Risk.</span>
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl mt-1">
            Explore domain-level phishing predictions powered by machine learning and inspect structural lexical signals in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-outline shrink-0">
          <Shield className="w-4 h-4 text-tertiary" />
          <span>Zero-Network Offline Inspection</span>
        </div>
      </div>

      {/* Input Card */}
      <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <span className="absolute left-3.5 text-outline font-mono text-xs select-none">
              https://
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter fully qualified domain name, e.g. account-update.com"
              aria-label="Domain or URL to check"
              className="w-full bg-surface-container-lowest text-on-surface font-mono text-sm pl-20 pr-4 py-2.5 rounded border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2.5 rounded bg-primary text-on-primary font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? "Analyzing…" : "Analyze Domain"}</span>
          </button>
        </form>

        {/* Quick Test Scenarios */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-outline text-[11px] uppercase tracking-wider">
              Quick Test Scenarios:
            </span>
            <button
              type="button"
              onClick={() => handleQuickTest("paypal-security-update.com")}
              className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant hover:border-danger text-danger text-[11px] transition-colors"
            >
              paypal-security-update.com
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest("github.com")}
              className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant hover:border-tertiary text-tertiary text-[11px] transition-colors"
            >
              github.com
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest("account-verify-login.net")}
              className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant hover:border-secondary text-secondary text-[11px] transition-colors"
            >
              account-verify-login.net
            </button>
          </div>

          <span className="text-[11px] text-outline flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Analyzes domain text only. Does not open or visit the website.
          </span>
        </div>
      </div>

      {/* Result Panel in aria-live region */}
      <div aria-live="polite">
        {error && (
          <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-sm font-mono text-danger">
            {error}
          </div>
        )}

        {result && statusCfg && (
          <div className="flex flex-col gap-2">
            <div className="p-4 rounded-lg bg-surface-container border border-outline-variant grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Target Evaluation */}
              <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded bg-surface-container-low border border-outline-variant/80">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-outline">
                      Target Evaluation
                    </span>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border font-mono text-xs font-semibold ${statusCfg.chip}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span>{statusCfg.label}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-mono text-outline">Domain analysed</div>
                    <div className="text-base font-mono font-bold text-on-surface truncate mt-0.5">
                      {result.site}
                    </div>
                  </div>

                  {/* Probability Gauge or Shared Hosting Message */}
                  {result.verdict === "unknown" ? (
                    <div className="p-3 rounded bg-surface-container border border-outline-variant/60 text-xs font-mono text-on-surface-variant mt-2 leading-relaxed">
                      This domain is a shared hosting platform, so the domain does not show who owns or operates the page.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 pt-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-mono text-on-surface-variant">
                          Model Risk Probability:
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className={`font-mono text-2xl font-bold tabular ${statusCfg.scoreText}`}>
                            {score.toFixed(3)}
                          </span>
                          <span className="text-xs font-mono text-outline">/ 1.000</span>
                        </div>
                      </div>

                      {/* Risk Progress Bar with Cutoff Marker */}
                      <div className="relative w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${statusCfg.bar}`}
                          style={{ width: `${scorePct}%` }}
                        />
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-on-surface z-10"
                          style={{ left: `${cutoffPct}%` }}
                          title={`Operational Cutoff: ${cutoff.toFixed(2)}`}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-outline pt-0.5">
                        <span>0.00 Low</span>
                        <span className="text-primary font-medium">Cutoff {cutoff.toFixed(2)}</span>
                        <span>1.00 High</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Line */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/60 text-xs font-mono text-outline">
                  <span>Model: Tuned XGBoost</span>
                  <span>Inference: {result.inference_ms != null ? `${result.inference_ms} ms` : "–"}</span>
                </div>
              </div>

              {/* Right Column: Extracted Lexical Signals */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-outline">
                    Extracted Lexical Signals (Feature Vector)
                  </span>
                  <span className="text-[11px] font-mono text-primary font-medium">
                    {numFeatures} Features Computed
                  </span>
                </div>

                {/* 4 Feature Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/60 flex flex-col">
                    <span className="text-[11px] font-mono text-on-surface-variant">Domain Length</span>
                    <span className="font-mono text-sm font-semibold text-on-surface mt-1 tabular">
                      {feats.site_len ?? "–"} chars
                    </span>
                    <span className="text-[10px] font-mono text-outline mt-0.5">site_len</span>
                  </div>

                  <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/60 flex flex-col">
                    <span className="text-[11px] font-mono text-on-surface-variant">Hyphen Count</span>
                    <span className="font-mono text-sm font-semibold text-on-surface mt-1 tabular">
                      {feats.num_hyphens ?? "–"}
                    </span>
                    <span className="text-[10px] font-mono text-outline mt-0.5">num_hyphens</span>
                  </div>

                  <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/60 flex flex-col">
                    <span className="text-[11px] font-mono text-on-surface-variant">Abused TLD</span>
                    <span className="font-mono text-sm font-semibold text-on-surface mt-1">
                      {feats.abused_tld ? "Yes" : "No"}
                    </span>
                    <span className="text-[10px] font-mono text-outline mt-0.5">abused_tld</span>
                  </div>

                  <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/60 flex flex-col">
                    <span className="text-[11px] font-mono text-on-surface-variant">Shannon Entropy</span>
                    <span className="font-mono text-sm font-semibold text-on-surface mt-1 tabular">
                      {feats.entropy != null ? Number(feats.entropy).toFixed(2) : "–"} bits
                    </span>
                    <span className="text-[10px] font-mono text-outline mt-0.5">entropy</span>
                  </div>
                </div>

                {/* Flagged Keywords Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded bg-surface-container-high border border-outline-variant/60 text-xs font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-on-surface-variant">Flagged Keywords:</span>
                    {keywords.length === 0 && brands.length === 0 ? (
                      <span className="text-outline">none</span>
                    ) : (
                      <>
                        {keywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-error font-semibold font-mono bg-error-container/30 px-2 py-0.5 rounded border border-error/20"
                          >
                            &quot;{kw}&quot;
                          </span>
                        ))}
                        {brands.map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1 text-warn font-semibold font-mono bg-warn/15 px-2 py-0.5 rounded border border-warn/30"
                          >
                            <span>&quot;{b}&quot;</span>
                            <span className="text-[10px] font-normal text-on-surface-variant">
                              (brand name in domain)
                            </span>
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-outline text-[11px] shrink-0">
                    <FlaskConical className="w-3.5 h-3.5 text-primary" />
                    <span>Research notice: heuristic output only</span>
                  </div>
                </div>

                {/* Show All Features Toggle */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowFeatures((s) => !s)}
                    aria-expanded={showFeatures}
                    className="self-start text-xs font-mono text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                  >
                    <span>{showFeatures ? "Hide features" : "Show all features"}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${showFeatures ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showFeatures && feats && (
                    <div className="p-3 rounded bg-surface-container-high border border-outline-variant/60">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs font-mono">
                        {Object.entries(feats).map(([k, val]) => (
                          <div
                            key={k}
                            className="flex justify-between items-center gap-2 border-b border-outline-variant/30 py-1"
                          >
                            <dt className="text-outline truncate">{k}</dt>
                            <dd className="font-semibold text-on-surface tabular">
                              {Number.isInteger(val) ? val : Number(val).toFixed(4)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Warning Note under the Card */}
            <p className="text-xs font-mono text-outline mt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-outline" />
              <span>
                No strong signal does not mean safe. At the deployed cutoff the model catches about {recallPct}% of phishing domains.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
