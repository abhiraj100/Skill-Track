import { useState, useMemo } from "react";
import {
  Zap,
  Gauge,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sliders,
  Sparkles,
  FileCode2,
  Layers,
  Image,
  Globe,
  TrendingUp,
  RefreshCw,
  Code2
} from "lucide-react";
import toast from "react-hot-toast";

const AUDIT_PRESETS = [
  {
    id: "ecommerce",
    name: "Modern E-Commerce Store",
    framework: "Next.js / SSR",
    baselineScore: 58,
    url: "https://store.skilltrack.io/products/developer-gear",
    lcp: 3.8,
    inp: 280,
    cls: 0.18,
    fcp: 2.4,
    ttfb: 650,
  },
  {
    id: "media_blog",
    name: "Heavy Media & Content Blog",
    framework: "WordPress / Headless",
    baselineScore: 44,
    url: "https://blog.skilltrack.io/articles/distributed-systems-guide",
    lcp: 4.6,
    inp: 340,
    cls: 0.25,
    fcp: 3.1,
    ttfb: 820,
  },
  {
    id: "legacy",
    name: "Unoptimized Legacy Monolith",
    framework: "Client-side SPA (Webpack)",
    baselineScore: 32,
    url: "https://portal.legacy-systems.com/app/analytics",
    lcp: 5.8,
    inp: 480,
    cls: 0.38,
    fcp: 3.9,
    ttfb: 1200,
  },
  {
    id: "jamstack",
    name: "Optimized Edge Jamstack Site",
    framework: "Vite + Cloudflare Workers",
    baselineScore: 86,
    url: "https://docs.skilltrack.io/quickstart",
    lcp: 1.8,
    inp: 90,
    cls: 0.04,
    fcp: 1.1,
    ttfb: 280,
  },
];

export default function PerfAudit() {
  const [selectedPreset, setSelectedPreset] = useState("ecommerce");

  // Remediation toggles
  const [optCodeSplitting, setOptCodeSplitting] = useState(false);
  const [optImages, setOptImages] = useState(false);
  const [optFontPreload, setOptFontPreload] = useState(false);
  const [optCriticalCss, setOptCriticalCss] = useState(false);
  const [optTreeShaking, setOptTreeShaking] = useState(false);

  const activePreset = AUDIT_PRESETS.find((p) => p.id === selectedPreset) || AUDIT_PRESETS[0];

  // Dynamic Score Calculation
  const computedMetrics = useMemo(() => {
    let bonus = 0;
    let lcpReduction = 0;
    let inpReduction = 0;
    let clsReduction = 0;
    let fcpReduction = 0;
    let ttfbReduction = 0;

    if (optCodeSplitting) {
      bonus += 12;
      lcpReduction += 0.6;
      fcpReduction += 0.4;
      inpReduction += 60;
    }
    if (optImages) {
      bonus += 14;
      lcpReduction += 1.1;
      clsReduction += 0.08;
    }
    if (optFontPreload) {
      bonus += 7;
      fcpReduction += 0.3;
      clsReduction += 0.05;
    }
    if (optCriticalCss) {
      bonus += 9;
      fcpReduction += 0.5;
      lcpReduction += 0.4;
    }
    if (optTreeShaking) {
      bonus += 8;
      inpReduction += 70;
      lcpReduction += 0.3;
    }

    const score = Math.min(100, activePreset.baselineScore + bonus);
    const lcp = Math.max(0.9, Number((activePreset.lcp - lcpReduction).toFixed(1)));
    const inp = Math.max(45, Math.round(activePreset.inp - inpReduction));
    const cls = Math.max(0.01, Number((activePreset.cls - clsReduction).toFixed(2)));
    const fcp = Math.max(0.6, Number((activePreset.fcp - fcpReduction).toFixed(1)));
    const ttfb = Math.max(120, Math.round(activePreset.ttfb - ttfbReduction));

    return {
      score,
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      gain: bonus,
    };
  }, [activePreset, optCodeSplitting, optImages, optFontPreload, optCriticalCss, optTreeShaking]);

  // Waterfall Items
  const waterfallItems = useMemo(() => {
    return [
      {
        name: "index.html (Document)",
        type: "Document",
        size: "18.4 KB",
        duration: computedMetrics.ttfb,
        optimized: true,
      },
      {
        name: "main.min.css (Styles)",
        type: "CSS",
        size: optCriticalCss ? "4.2 KB (Inlined)" : "84.2 KB (Blocking)",
        duration: optCriticalCss ? 35 : 240,
        optimized: optCriticalCss,
      },
      {
        name: "vendor.bundle.js",
        type: "JavaScript",
        size: optCodeSplitting ? "48.2 KB (Chunked)" : "385.6 KB (Monolith)",
        duration: optCodeSplitting ? 85 : 460,
        optimized: optCodeSplitting,
      },
      {
        name: "hero-banner.jpg",
        type: "Image",
        size: optImages ? "42.0 KB (AVIF/WebP)" : "850.4 KB (Raw PNG)",
        duration: optImages ? 65 : 620,
        optimized: optImages,
      },
      {
        name: "Inter-Variable.woff2",
        type: "Font",
        size: "24.5 KB",
        duration: optFontPreload ? 40 : 190,
        optimized: optFontPreload,
      },
      {
        name: "analytics-tracker.js",
        type: "3rd-Party",
        size: optTreeShaking ? "8.1 KB (Deferred)" : "64.0 KB",
        duration: optTreeShaking ? 25 : 180,
        optimized: optTreeShaking,
      },
    ];
  }, [computedMetrics.ttfb, optCriticalCss, optCodeSplitting, optImages, optFontPreload, optTreeShaking]);

  const resetToggles = () => {
    setOptCodeSplitting(false);
    setOptImages(false);
    setOptFontPreload(false);
    setOptCriticalCss(false);
    setOptTreeShaking(false);
    toast.success("Optimizations reset to site baseline");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-teal-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30">
              <Zap size={14} /> Core Web Vitals & Lighthouse Studio v2.7
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Web Vitals & Frontend Performance Audit
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Diagnose real-world LCP, INP, and CLS performance metrics, inspect asset waterfalls,
              and toggle instant engineering remediation recipes to shoot your Lighthouse score to 95+.
            </p>
          </div>

          {/* Dynamic Score Ring */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl font-black ${
              computedMetrics.score >= 90
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : computedMetrics.score >= 50
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}>
              {computedMetrics.score}
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Lighthouse Grade</p>
              <p className="text-sm font-bold text-white">
                {computedMetrics.score >= 90 ? "🟢 Good (Passes Core Web Vitals)" : computedMetrics.score >= 50 ? "🟡 Needs Improvement" : "🔴 Poor Performance"}
              </p>
              {computedMetrics.gain > 0 && (
                <p className="text-[10px] text-emerald-400 font-bold">+{computedMetrics.gain} pts from active optimizations</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Target Website Profiles to Audit
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIT_PRESETS.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPreset(p.id);
                  toast.success(`Loaded "${p.name}"`);
                }}
                className={`text-left rounded-2xl p-4 transition-all border ${
                  isSelected
                    ? "bg-teal-50/80 border-teal-500 shadow-md ring-2 ring-teal-500/20 dark:bg-teal-950/40 dark:border-teal-500"
                    : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-teal-600" />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-teal-600 dark:text-teal-400">{p.framework}</p>
                <p className="mt-2 text-[10px] font-mono text-slate-400 truncate">{p.url}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Baseline Score:</span>
                  <span className={p.baselineScore >= 80 ? "text-emerald-600" : "text-amber-600"}>
                    {p.baselineScore} / 100
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Web Vitals Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* LCP */}
        <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Largest Contentful Paint</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${computedMetrics.lcp <= 2.5 ? "text-emerald-600" : "text-amber-600"}`}>
              {computedMetrics.lcp}s
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">(Goal &lt; 2.5s)</span>
          </div>
          <p className="text-[10px] text-slate-500">Main banner/heading render speed</p>
        </div>

        {/* INP */}
        <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interaction to Next Paint</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${computedMetrics.inp <= 200 ? "text-emerald-600" : "text-amber-600"}`}>
              {computedMetrics.inp}ms
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">(Goal &lt; 200ms)</span>
          </div>
          <p className="text-[10px] text-slate-500">UI click-to-render responsiveness</p>
        </div>

        {/* CLS */}
        <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cumulative Layout Shift</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${computedMetrics.cls <= 0.1 ? "text-emerald-600" : "text-amber-600"}`}>
              {computedMetrics.cls}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">(Goal &lt; 0.1)</span>
          </div>
          <p className="text-[10px] text-slate-500">Visual stability without unexpected jumps</p>
        </div>

        {/* FCP */}
        <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Contentful Paint</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {computedMetrics.fcp}s
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">(Goal &lt; 1.8s)</span>
          </div>
          <p className="text-[10px] text-slate-500">Initial visual DOM paint timestamp</p>
        </div>

        {/* TTFB */}
        <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time to First Byte</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {computedMetrics.ttfb}ms
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">(Goal &lt; 800ms)</span>
          </div>
          <p className="text-[10px] text-slate-500">Edge CDN cache & server response</p>
        </div>
      </div>

      {/* Main Grid: Optimization Recipes Toggles & Asset Waterfall */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
        {/* Remediation Recipes Toggles */}
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders size={16} className="text-teal-600" /> 1-Click Engineering Remediation Recipes
              </h3>
              <p className="text-xs text-slate-500">Toggle fixes and watch Lighthouse score react instantly.</p>
            </div>
            <button
              onClick={resetToggles}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          <div className="space-y-3">
            {/* Toggle 1: Code Splitting */}
            <div
              onClick={() => setOptCodeSplitting(!optCodeSplitting)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                optCodeSplitting
                  ? "bg-teal-50/70 border-teal-400 dark:bg-teal-950/40 dark:border-teal-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Route-Level Dynamic Code Splitting (`React.lazy`)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    +12 Pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Breaks 400KB monolith JS into 40KB async route chunks</p>
              </div>
              <input
                type="checkbox"
                checked={optCodeSplitting}
                onChange={() => {}}
                className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Toggle 2: Next-Gen Images */}
            <div
              onClick={() => setOptImages(!optImages)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                optImages
                  ? "bg-teal-50/70 border-teal-400 dark:bg-teal-950/40 dark:border-teal-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Next-Gen AVIF / WebP Images with `srcset`
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    +14 Pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Compresses 850KB uncompressed banners down to 42KB</p>
              </div>
              <input
                type="checkbox"
                checked={optImages}
                onChange={() => {}}
                className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Toggle 3: Font Preload */}
            <div
              onClick={() => setOptFontPreload(!optFontPreload)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                optFontPreload
                  ? "bg-teal-50/70 border-teal-400 dark:bg-teal-950/40 dark:border-teal-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Font Preload (`&lt;link rel="preload"&gt;`)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    +7 Pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Eliminates Flash of Unstyled Text (FOUT) & layout shift</p>
              </div>
              <input
                type="checkbox"
                checked={optFontPreload}
                onChange={() => {}}
                className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Toggle 4: Critical CSS */}
            <div
              onClick={() => setOptCriticalCss(!optCriticalCss)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                optCriticalCss
                  ? "bg-teal-50/70 border-teal-400 dark:bg-teal-950/40 dark:border-teal-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Inline Above-The-Fold Critical CSS
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    +9 Pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Unblocks the render tree; non-critical styles deferred</p>
              </div>
              <input
                type="checkbox"
                checked={optCriticalCss}
                onChange={() => {}}
                className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Toggle 5: Tree-Shaking */}
            <div
              onClick={() => setOptTreeShaking(!optTreeShaking)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                optTreeShaking
                  ? "bg-teal-50/70 border-teal-400 dark:bg-teal-950/40 dark:border-teal-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Tree-Shake Unused Libraries & Defer Trackers
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    +8 Pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Replaces moment.js with dayjs; cuts 180ms off long main-thread tasks</p>
              </div>
              <input
                type="checkbox"
                checked={optTreeShaking}
                onChange={() => {}}
                className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Asset Waterfall Breakdown */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers size={16} className="text-teal-600" /> Network Waterfall Timeline
            </h3>
            <span className="text-xs font-mono text-slate-400">Download Latency</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {waterfallItems.map((item, idx) => {
              const maxBarMs = 650;
              const barWidthPct = Math.min(100, Math.round((item.duration / maxBarMs) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate max-w-[200px]">
                      {item.optimized ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                      {item.name}
                    </span>
                    <span className="text-slate-400 text-[10px]">{item.size} • {item.duration}ms</span>
                  </div>

                  {/* Latency Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.optimized
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-rose-500 to-amber-500"
                      }`}
                      style={{ width: `${barWidthPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Recipe Code Preview */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <FileCode2 size={12} /> Vite / React Code Splitting Pattern
            </span>
            <div className="p-3 rounded-2xl bg-slate-950 font-mono text-[11px] text-teal-300 leading-relaxed overflow-x-auto">
              {`// Split bundle per route chunk
const Analytics = lazy(() => import('./pages/Analytics'));
<Suspense fallback={<SkeletonLoader />}>
  <Analytics />
</Suspense>`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
