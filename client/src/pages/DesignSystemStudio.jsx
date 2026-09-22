import { useState, useMemo } from "react";
import {
  Palette,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  Sparkles,
  Download,
  AlertTriangle,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import toast from "react-hot-toast";

const PALETTE_PRESETS = [
  { id: "indigo", name: "Modern Tech Indigo", primary: "#6366f1", primaryDark: "#4f46e5", accent: "#a855f7", bg: "#0f172a" },
  { id: "emerald", name: "FinTech & Growth Emerald", primary: "#10b981", primaryDark: "#059669", accent: "#06b6d4", bg: "#022c22" },
  { id: "rose", name: "Cyber & Pulse Rose", primary: "#f43f5e", primaryDark: "#e11d48", accent: "#fb923c", bg: "#1f1218" },
  { id: "cyan", name: "Cloud & DevSecOps Cyan", primary: "#06b6d4", primaryDark: "#0891b2", accent: "#3b82f6", bg: "#082f49" },
  { id: "amber", name: "Warm Editorial Amber", primary: "#f59e0b", primaryDark: "#d97706", accent: "#ef4444", bg: "#261a05" },
];

export default function DesignSystemStudio() {
  const [selectedPalette, setSelectedPalette] = useState("indigo");
  const [borderRadius, setBorderRadius] = useState("12px"); // 0px, 6px, 12px, 18px, 9999px
  const [shadowLevel, setShadowLevel] = useState("medium"); // 'none' | 'soft' | 'medium' | 'float'
  const [colorBlindMode, setColorBlindMode] = useState("normal"); // 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia'

  // Component preview interactive states
  const [btnLoading, setBtnLoading] = useState(false);
  const [switchActive, setSwitchActive] = useState(true);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const [copiedTokens, setCopiedTokens] = useState(false);

  const activeTheme = PALETTE_PRESETS.find((p) => p.id === selectedPalette) || PALETTE_PRESETS[0];

  // Contrast Ratio Calculator (Hex to relative luminance)
  const contrastAnalysis = useMemo(() => {
    // Relative luminance calculation for primary color vs white
    const hex = activeTheme.primary.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const sRGB = [r, g, b].map((val) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );
    const L1 = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    const L2 = 1.0; // White text

    const ratio = Number(((L2 + 0.05) / (L1 + 0.05)).toFixed(2));
    const isAaa = ratio >= 7.0;
    const isAa = ratio >= 4.5;

    return {
      ratio,
      isAa,
      isAaa,
      status: isAaa ? "AAA Passed (Exceptional)" : isAa ? "AA Passed (Standard)" : "AA Large Text Only",
    };
  }, [activeTheme]);

  // Color-blind filter style
  const colorBlindFilter = useMemo(() => {
    switch (colorBlindMode) {
      case "protanopia":
        return "sepia(40%) hue-rotate(-20deg)";
      case "deuteranopia":
        return "sepia(50%) hue-rotate(40deg)";
      case "tritanopia":
        return "sepia(60%) hue-rotate(180deg)";
      default:
        return "none";
    }
  }, [colorBlindMode]);

  // Generated Tailwind Config
  const generatedTailwindConfig = useMemo(() => {
    return `// ========================================================
// SkillTrack Design System - Generated tailwind.config.js
// Palette: ${activeTheme.name} | Radius: ${borderRadius}
// ========================================================

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '${activeTheme.primary}15',
          100: '${activeTheme.primary}25',
          500: '${activeTheme.primary}',
          600: '${activeTheme.primaryDark}',
          accent: '${activeTheme.accent}',
        },
      },
      borderRadius: {
        DEFAULT: '${borderRadius}',
        theme: '${borderRadius}',
      },
      boxShadow: {
        'theme-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
        'theme-md': '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
        'theme-lg': '0 16px 40px -8px rgba(0, 0, 0, 0.2)',
      },
    },
  },
};
`;
  }, [activeTheme, borderRadius]);

  const copyConfig = () => {
    navigator.clipboard.writeText(generatedTailwindConfig);
    setCopiedTokens(true);
    toast.success("Tailwind configuration copied!");
    setTimeout(() => setCopiedTokens(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12" style={{ filter: colorBlindFilter }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-purple-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30">
              <Palette size={14} /> Design Systems & Component Studio v2.7
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Accessible Design System & UI Sandbox
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Design cohesive design tokens with real-time WCAG 2.1 AA/AAA contrast auditing,
              color blindness simulation, and interactive component state testing with 1-click Tailwind export.
            </p>
          </div>

          {/* Quick Contrast Pill */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: activeTheme.primary }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">WCAG Contrast Ratio</p>
              <p className="text-2xl font-black text-white">{contrastAnalysis.ratio}:1</p>
              <p className="text-[10px] text-emerald-400 font-semibold">{contrastAnalysis.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Palette Selector */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Core Brand Themes & Tokens
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PALETTE_PRESETS.map((p) => {
            const isSelected = selectedPalette === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPalette(p.id);
                  toast.success(`Active theme: ${p.name}`);
                }}
                className={`text-left rounded-2xl p-4 transition-all border ${
                  isSelected
                    ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20 dark:bg-slate-900 dark:border-purple-500"
                    : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: p.primary }}></span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name.split(" ")[0]}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-purple-600" />}
                </div>
                <p className="mt-2 text-[10px] text-slate-400">{p.name}</p>
                <div className="mt-2 flex gap-1.5">
                  <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: p.primary }}></span>
                  <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: p.accent }}></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Controls Bar */}
      <div className="grid gap-4 sm:grid-cols-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs">
        {/* Radius control */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-900 dark:text-slate-100">Corner Radius Token</label>
          <div className="flex gap-1.5">
            {[
              { label: "None", val: "0px" },
              { label: "SM", val: "6px" },
              { label: "MD", val: "12px" },
              { label: "LG", val: "18px" },
              { label: "Full", val: "9999px" },
            ].map((r) => (
              <button
                key={r.val}
                onClick={() => setBorderRadius(r.val)}
                className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                  borderRadius === r.val
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-purple-950 dark:border-purple-600 dark:text-purple-300"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shadow control */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-900 dark:text-slate-100">Elevation & Shadow Scale</label>
          <div className="flex gap-1.5">
            {["none", "soft", "medium", "float"].map((s) => (
              <button
                key={s}
                onClick={() => setShadowLevel(s)}
                className={`px-2.5 py-1 rounded-lg border font-semibold capitalize transition ${
                  shadowLevel === s
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-purple-950 dark:border-purple-600 dark:text-purple-300"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Color blindness simulator */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Eye size={13} /> Color-Blind Accessibility Lens
          </label>
          <select
            value={colorBlindMode}
            onChange={(e) => setColorBlindMode(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="normal">Normal Vision (Full Spectrum)</option>
            <option value="protanopia">Protanopia (Red-Blind 1% of males)</option>
            <option value="deuteranopia">Deuteranopia (Green-Blind 5% of males)</option>
            <option value="tritanopia">Tritanopia (Blue-Blind Rare)</option>
          </select>
        </div>
      </div>

      {/* Live Component Sandbox Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" /> Interactive UI Component Matrix
          </h3>

          {/* Buttons Matrix */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Button Hierarchy</span>
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Solid */}
              <button
                style={{
                  backgroundColor: activeTheme.primary,
                  borderRadius: borderRadius,
                }}
                className="px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
              >
                Solid Primary
              </button>

              {/* Gradient Button */}
              <button
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.accent})`,
                  borderRadius: borderRadius,
                }}
                className="px-4 py-2 text-xs font-bold text-white transition hover:opacity-95 shadow-md"
              >
                Gradient Hero
              </button>

              {/* Outline Button */}
              <button
                style={{
                  borderColor: activeTheme.primary,
                  color: activeTheme.primary,
                  borderRadius: borderRadius,
                }}
                className="px-4 py-2 text-xs font-bold border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Outline Action
              </button>

              {/* Loading State Toggle */}
              <button
                onClick={() => setBtnLoading(!btnLoading)}
                style={{
                  borderRadius: borderRadius,
                }}
                className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
              >
                {btnLoading && <span className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></span>}
                {btnLoading ? "Processing..." : "Toggle Loading"}
              </button>
            </div>
          </div>

          {/* Badges & Status Pills */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Badges & Micro-Copy</span>
            <div className="flex flex-wrap gap-2">
              <span
                style={{
                  backgroundColor: `${activeTheme.primary}20`,
                  color: activeTheme.primary,
                  borderRadius: borderRadius,
                }}
                className="px-2.5 py-1 text-[11px] font-bold"
              >
                Featured Release
              </span>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ● Live Production
              </span>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                ▲ High Latency Warning
              </span>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                ■ Critical Vulnerability
              </span>
            </div>
          </div>

          {/* Interactive Form Controls */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Form Inputs & Validation</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Interactive search field..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{ borderRadius: borderRadius }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Feature Toggle State</span>
                <button onClick={() => setSwitchActive(!switchActive)} className="text-xl">
                  {switchActive ? (
                    <ToggleRight size={26} style={{ color: activeTheme.primary }} />
                  ) : (
                    <ToggleLeft size={26} className="text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Tabs */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tab Navigation Token</span>
            <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 max-w-sm">
              {["Overview", "Telemetry", "Audit Logs"].map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabIdx(idx)}
                  style={{
                    borderRadius: borderRadius,
                    backgroundColor: activeTabIdx === idx ? activeTheme.primary : "transparent",
                    color: activeTabIdx === idx ? "#ffffff" : undefined,
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold transition text-center ${
                    activeTabIdx === idx ? "shadow-sm" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: WCAG Compliance & Tailwind Exporter */}
        <div className="space-y-6">
          {/* WCAG Compliance Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>WCAG 2.1 Accessibility Audit</span>
              <span className="text-xs font-mono font-bold text-purple-600">{contrastAnalysis.ratio}:1</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-300">Level AA (Body Text &ge; 4.5:1)</span>
                <span className={`font-bold ${contrastAnalysis.isAa ? "text-emerald-600" : "text-rose-600"}`}>
                  {contrastAnalysis.isAa ? "✓ Passed" : "✗ Failed"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-300">Level AAA (Enhanced &ge; 7.0:1)</span>
                <span className={`font-bold ${contrastAnalysis.isAaa ? "text-emerald-600" : "text-amber-600"}`}>
                  {contrastAnalysis.isAaa ? "✓ Passed" : "Partial (Use on large text)"}
                </span>
              </div>
            </div>
          </div>

          {/* Tailwind Exporter */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Export tailwind.config.js
                </h4>
                <p className="text-[11px] text-slate-500">Includes active tokens and shadow scale</p>
              </div>
              <button
                onClick={copyConfig}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                {copiedTokens ? <Check size={12} /> : <Copy size={12} />}
                {copiedTokens ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-purple-300 max-h-48 overflow-y-auto">
              <pre className="leading-relaxed">{generatedTailwindConfig}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
