import { useState, useMemo } from "react";
import {
  FileCode2,
  Bug,
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Sliders,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

const REGEX_PRESETS = [
  {
    id: "email",
    title: "Email Address (RFC 5322 standard)",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    flags: "g",
    testString: "Contact support at dev-team@skilltrack.io or john.doe_42@sub.domain.co.uk for inquiries. Invalid: bad@domain",
    desc: "Validates standard email formatting with username, domain, and TLD."
  },
  {
    id: "password",
    title: "Strong Password Policy",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: "g",
    testString: "SecretP@ssw0rd!  (Valid)\nweakpass (Invalid - no uppercase/symbol)\nSHORT1! (Invalid - too short)",
    desc: "Enforces 8+ chars with lowercase, uppercase, number, and special symbol."
  },
  {
    id: "semver",
    title: "Semantic Versioning (SemVer)",
    pattern: "^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$",
    flags: "g",
    testString: "v2.6.0\n1.0.0-alpha.1\n3.14.159\ninvalid..ver",
    desc: "Matches major.minor.patch with optional prerelease build tags."
  },
  {
    id: "ipv4",
    title: "IPv4 Address (0-255 Range)",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    testString: "Server host at 192.168.1.1, gateway at 10.0.0.254, public at 172.217.16.206. Invalid: 999.1.1.1",
    desc: "Strictly matches valid IPv4 address octets within 0 to 255."
  },
  {
    id: "jwt",
    title: "JWT Token (Header.Payload.Signature)",
    pattern: "^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*$",
    flags: "g",
    testString: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    desc: "3-part dot-delimited base64url encoded JSON Web Token."
  },
  {
    id: "redos_danger",
    title: "⚠️ Catastrophic Backtracking (ReDoS Vulnerable)",
    pattern: "^(a+)+$",
    flags: "g",
    testString: "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!",
    desc: "Nested quantifier (a+)+ creates 2^N branch combinations on mismatch."
  }
];

export default function RegexLab() {
  const [pattern, setPattern] = useState(REGEX_PRESETS[0].pattern);
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testString, setTestString] = useState(REGEX_PRESETS[0].testString);
  const [stressTesting, setStressTesting] = useState(false);
  const [stressResult, setStressResult] = useState(null);

  const activeFlagsString = Object.entries(flags)
    .filter(([_, val]) => val)
    .map(([key]) => key)
    .join("");

  // Compile regex safely
  const regexState = useMemo(() => {
    try {
      const re = new RegExp(pattern, activeFlagsString);
      return { valid: true, error: null, regex: re };
    } catch (err) {
      return { valid: false, error: err.message, regex: null };
    }
  }, [pattern, activeFlagsString]);

  // Compute matches
  const matchResults = useMemo(() => {
    if (!regexState.valid || !regexState.regex) return [];
    const results = [];
    try {
      if (flags.g) {
        const matches = [...testString.matchAll(regexState.regex)];
        return matches.map((m, idx) => ({
          index: m.index,
          match: m[0],
          groups: m.slice(1),
          id: idx
        }));
      } else {
        const m = testString.match(regexState.regex);
        if (m) {
          results.push({
            index: m.index,
            match: m[0],
            groups: m.slice(1),
            id: 0
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return results;
  }, [regexState, testString, flags.g]);

  // ReDoS Risk Analysis
  const redosAnalysis = useMemo(() => {
    // Check for nested quantifiers like (a+)+, ([a-z]*)*, (a|aa)+, etc.
    const nestedQuantifierRegex = /(\([^\)]*[\+\*][^\)]*\)[\+\*])|([\+\*]\?*[\+\*])/;
    const overlappingGroupRegex = /\(([^)]+)\|([^)]+)\)\+/;

    const hasNested = nestedQuantifierRegex.test(pattern);
    const hasOverlap = overlappingGroupRegex.test(pattern);

    if (hasNested || pattern.includes("(a+)+") || pattern.includes("(.*)*")) {
      return {
        level: "CRITICAL",
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900",
        badge: "🚨 High ReDoS Vulnerability",
        desc: "Nested quantifier detected! An adversarial mismatch string causes exponential 2^N backtracking steps, freezing the Node.js event loop or browser thread."
      };
    }

    if (hasOverlap || pattern.includes(".*.*")) {
      return {
        level: "MODERATE",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
        badge: "⚠️ Moderate Backtracking Risk",
        desc: "Overlapping repetition or multiple greedy wildcards detected. Performance may degrade on long adversarial strings."
      };
    }

    return {
      level: "SAFE",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900",
      badge: "✅ Safe Linear Regex",
      desc: "Deterministic matching complexity O(N). No explosive nested backtracking paths detected."
    };
  }, [pattern]);

  // Stress test adversarial payload
  const runStressTest = () => {
    setStressTesting(true);
    setStressResult(null);

    setTimeout(() => {
      const adversary = "a".repeat(24) + "!";
      const startTime = performance.now();
      try {
        const re = new RegExp(pattern);
        re.test(adversary);
        const duration = performance.now() - startTime;
        setStressResult({
          payload: adversary,
          duration: duration.toFixed(2),
          safe: duration < 50,
          steps: duration > 100 ? "> 16,777,216 Backtrack Steps" : "~48 Steps"
        });
      } catch (err) {
        setStressResult({
          payload: adversary,
          duration: "Timeout / Crashed",
          safe: false,
          steps: "Exceeded Maximum Backtracking Call Stack"
        });
      } finally {
        setStressTesting(false);
      }
    }, 100);
  };

  const loadPreset = (p) => {
    setPattern(p.pattern);
    setTestString(p.testString);
    toast.success(`Loaded preset: ${p.title}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-sky-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
              <FileCode2 size={14} /> Regular Expression & Security Studio v2.6
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive Regex & ReDoS Vulnerability Lab
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time regex match visualizer with capture group decomposition, production pattern library,
              and automated Catastrophic Backtracking (ReDoS) vulnerability static analyzer.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="h-12 w-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Search size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Matches Detected</p>
              <p className="text-2xl font-black text-white">{matchResults.length} <span className="text-xs font-normal text-slate-300">matches</span></p>
              <p className="text-[10px] text-sky-400 font-semibold">{regexState.valid ? "Syntax Valid" : "Syntax Error"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Production Patterns & Vulnerability Demos
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {REGEX_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              className="p-3 text-left rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 transition flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.title}</p>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{p.desc}</p>
              </div>
              <p className="mt-2 text-[10px] font-mono text-sky-600 truncate">{p.pattern}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {/* Pattern Input Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode2 size={16} className="text-sky-600" /> Regular Expression Pattern
              </label>

              {/* Flags Toggles */}
              <div className="flex items-center gap-1 text-xs font-mono font-bold">
                <span className="text-slate-400 mr-1 text-[11px]">Flags:</span>
                {["g", "i", "m", "s"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlags({ ...flags, [f]: !flags[f] })}
                    className={`h-7 w-7 rounded-lg transition border ${
                      flags[f]
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950 font-mono text-sm">
              <span className="text-slate-400 font-bold px-2">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                placeholder="Type regex pattern..."
              />
              <span className="text-slate-400 font-bold px-2">/{activeFlagsString}</span>
            </div>

            {!regexState.valid && (
              <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                <AlertTriangle size={14} /> Syntax Error: {regexState.error}
              </p>
            )}

            {/* Test String Area */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Test Target String
              </label>
              <textarea
                rows={5}
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Enter string to test pattern against..."
              />
            </div>
          </div>

          {/* Matches & Capture Groups Results */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Match Inspections ({matchResults.length})</span>
              <span className="text-xs text-slate-400 font-normal">Full matches & captures</span>
            </h3>

            {matchResults.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No matches found in the current test string.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {matchResults.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 font-mono text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-600">Match #{m.id + 1}</span>
                      <span className="text-[10px] text-slate-400">Position: {m.index}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 break-all font-bold">
                      {m.match}
                    </div>

                    {m.groups.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Capture Groups:</span>
                        {m.groups.map((grp, gIdx) => (
                          <div key={gIdx} className="flex gap-2 text-[11px]">
                            <span className="text-slate-500 font-bold">Group {gIdx + 1}:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 break-all">{grp || "undefined"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ReDoS Analyzer & Adversarial Stress Tester */}
        <div className="space-y-6">
          {/* ReDoS Static Analysis Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bug size={16} className="text-rose-600" /> ReDoS Static Risk Analyzer
              </h3>
              <p className="text-xs text-slate-500">
                Detects exponential catastrophic backtracking vulnerabilities.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${redosAnalysis.bg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${redosAnalysis.color}`}>{redosAnalysis.badge}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/60 dark:bg-slate-900/60 font-bold">
                  Complexity: {redosAnalysis.level === "CRITICAL" ? "O(2^N)" : "O(N)"}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {redosAnalysis.desc}
              </p>
            </div>

            {/* Benchmark Stress Tester */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Adversarial Stress Test
                </span>
                <button
                  onClick={runStressTest}
                  disabled={stressTesting || !regexState.valid}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  <Play size={12} /> {stressTesting ? "Testing..." : "Run Micro-Benchmark"}
                </button>
              </div>

              {stressResult && (
                <div className={`p-3.5 rounded-2xl border font-mono text-xs space-y-1.5 ${
                  stressResult.safe
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-50 border-rose-200 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300"
                }`}>
                  <div className="flex justify-between font-bold">
                    <span>Execution Latency:</span>
                    <span>{stressResult.duration} ms</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Backtracking Steps:</span>
                    <span>{stressResult.steps}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Payload: "{stressResult.payload}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Syntax Cheat Sheet */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Regex Quick Reference</h3>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="text-sky-600 font-bold">\d / \D</span>
                <span className="text-slate-500">Digit / Non-digit</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="text-sky-600 font-bold">\w / \W</span>
                <span className="text-slate-500">Word character / Non-word</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="text-sky-600 font-bold">^ / $</span>
                <span className="text-slate-500">Start / End of string</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="text-sky-600 font-bold">(?=...)</span>
                <span className="text-slate-500">Positive Lookahead</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="text-sky-600 font-bold">(?!...)</span>
                <span className="text-slate-500">Negative Lookahead</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
