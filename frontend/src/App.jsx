import { useState, useEffect } from "react";
import { Link } from "lucide-react";
import { BRAND } from "./brand.js";
import Scanner from "./Scanner.jsx";
import Performance from "./Performance.jsx";
import DetailedAnalysis from "./DetailedAnalysis.jsx";

export default function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [datasetKey, setDatasetKey] = useState("B");

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/health");
        if (isMounted) {
          setApiOnline(res.ok);
        }
      } catch {
        if (isMounted) {
          setApiOnline(false);
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-surface-dim/90 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Brand & Desktop Navigation */}
            <div className="flex items-center gap-6">
              <a href="#scanner" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface-dim transition-colors">
                  <Link className="w-5 h-5 text-primary group-hover:text-surface-dim transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-on-surface">
                    {BRAND.name}
                  </span>
                  <span className="text-[11px] font-mono text-on-surface-variant -mt-0.5 tracking-wider uppercase">
                    {BRAND.tagline}
                  </span>
                </div>
              </a>

              {/* Desktop Nav */}
              <nav
                className="hidden md:flex items-center gap-1 ml-4 border-l border-outline-variant/60 pl-6"
                aria-label="Main navigation"
              >
                <a
                  href="#scanner"
                  className="px-3 py-1.5 rounded text-xs font-mono text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                >
                  Domain Scanner
                </a>
                <a
                  href="#benchmarks"
                  className="px-3 py-1.5 rounded text-xs font-mono text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                >
                  Model Evaluation
                </a>
                <a
                  href="#matrix"
                  className="px-3 py-1.5 rounded text-xs font-mono text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                >
                  Benchmark Matrix
                </a>
                <a
                  href="#architecture"
                  className="px-3 py-1.5 rounded text-xs font-mono text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                >
                  Architecture &amp; Specs
                </a>
              </nav>
            </div>

            {/* API Status Pill */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant text-[12px] font-mono">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    apiOnline ? "bg-safe animate-pulse" : "bg-danger"
                  }`}
                />
                <span
                  className={
                    apiOnline
                      ? "text-safe font-medium"
                      : "text-danger font-medium"
                  }
                >
                  {apiOnline ? "API: Online" : "API: Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Navigation (horizontally scrollable row below brand) */}
          <nav
            className="flex md:hidden overflow-x-auto pb-2.5 pt-1 gap-2 no-scrollbar text-xs font-mono border-t border-outline-variant/30"
            aria-label="Mobile navigation"
          >
            <a
              href="#scanner"
              className="whitespace-nowrap px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
            >
              Domain Scanner
            </a>
            <a
              href="#benchmarks"
              className="whitespace-nowrap px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
            >
              Model Evaluation
            </a>
            <a
              href="#matrix"
              className="whitespace-nowrap px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
            >
              Benchmark Matrix
            </a>
            <a
              href="#architecture"
              className="whitespace-nowrap px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
            >
              Architecture &amp; Specs
            </a>
          </nav>
        </div>
      </header>

      {/* Main Single Scrolling Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-12">
        <section id="scanner" className="scroll-mt-28">
          <Scanner />
        </section>

        <section id="benchmarks" className="scroll-mt-28">
          <Performance
            datasetKey={datasetKey}
            onDatasetChange={setDatasetKey}
          />
        </section>

        <section id="analysis" className="scroll-mt-28">
          <DetailedAnalysis datasetKey={datasetKey} />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-dim border-t border-outline-variant mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-outline">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-on-surface font-semibold">{BRAND.name}</span>
            <span>•</span>
            <span>Machine Learning Phishing Detection Benchmark</span>
          </div>
          <div className="flex items-center gap-2">
            <span>FastAPI &amp; XGBoost Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
