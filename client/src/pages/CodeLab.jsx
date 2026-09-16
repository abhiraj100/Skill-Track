import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Trophy,
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";

const CHALLENGES = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hash Maps",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    starterCode: `function twoSum(nums, target) {
  // Your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    tests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] }
    ],
    hints: [
      "Try using a Hash Map to store numbers you've seen and their indices.",
      "For each number, check if (target - num) is already in the map."
    ],
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) return [seen.get(diff), i];
    seen.set(nums[i], i);
  }
  return [];
}`
  },
  {
    id: "debounce",
    title: "Implement Debounce",
    difficulty: "Medium",
    category: "JavaScript Core & Closures",
    description: `Create a \`debounce\` function that delays invoking the passed \`fn\` until after \`delay\` milliseconds have elapsed since the last time the debounced function was invoked.`,
    starterCode: `function debounce(fn, delay) {
  // Return the debounced function
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
    tests: [
      {
        customRunner: true,
        run: async (fn) => {
          let count = 0;
          const increment = fn(() => { count++; }, 50);
          increment();
          increment();
          increment();
          await new Promise((r) => setTimeout(r, 80));
          return { pass: count === 1, actual: count, expected: 1 };
        }
      }
    ],
    hints: [
      "Use closures to retain a reference to a timer variable.",
      "Clear the existing timer every time the returned function is called."
    ],
    solution: `function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`
  },
  {
    id: "deep-clone",
    title: "Deep Clone Object",
    difficulty: "Medium",
    category: "Object Manipulation & Recursion",
    description: `Implement a \`deepClone\` function that creates a deep copy of a nested JavaScript object without modifying the original or sharing object references.`,
    starterCode: `function deepClone(obj) {
  // Your code here
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  
  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepClone(obj[key]);
    }
  }
  return copy;
}`,
    tests: [
      {
        input: [{ a: 1, b: { c: 2 } }],
        verify: (res, original) => {
          return JSON.stringify(res) === JSON.stringify(original[0]) && res !== original[0] && res.b !== original[0].b;
        }
      },
      {
        input: [{ list: [1, 2, [3, 4]] }],
        verify: (res, original) => {
          return JSON.stringify(res) === JSON.stringify(original[0]) && res.list !== original[0].list;
        }
      }
    ],
    hints: [
      "Check for primitive types and null first.",
      "Recursively handle both plain objects and arrays."
    ],
    solution: `function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const clone = {};
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key]);
  }
  return clone;
}`
  },
  {
    id: "flatten-array",
    title: "Flatten Nested Array",
    difficulty: "Easy",
    category: "Arrays & Recursion",
    description: `Write a function \`flatten\` that takes a nested array of arbitrary depth and returns a completely flat one-dimensional array.`,
    starterCode: `function flatten(arr) {
  // Your code here
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
    tests: [
      { input: [[[1, [2, [3, [4]], 5]]]], expected: [1, 2, 3, 4, 5] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[[]]], expected: [] }
    ],
    hints: [
      "Iterate over items and check Array.isArray().",
      "Spread recursive calls into your accumulator."
    ],
    solution: `function flatten(arr) {
  return arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []
  );
}`
  }
];

export default function CodeLab() {
  const [selectedChallenge, setSelectedChallenge] = useState(CHALLENGES[0]);
  const [code, setCode] = useState(CHALLENGES[0].starterCode);
  const [testResults, setTestResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [solvedMap, setSolvedMap] = useState({});
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const selectChallenge = (ch) => {
    setSelectedChallenge(ch);
    setCode(ch.starterCode);
    setTestResults(null);
    setLogs([]);
    setShowHints(false);
    setShowSolution(false);
  };

  const runCode = async () => {
    setRunning(true);
    setLogs([]);
    const capturedLogs = [];
    const customConsole = {
      log: (...args) => capturedLogs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
      error: (...args) => capturedLogs.push("[error] " + args.join(" "))
    };

    const startTime = performance.now();

    try {
      // Evaluate user function
      const wrapped = new Function(
        "console",
        `"use strict";
        ${code}
        return typeof ${selectedChallenge.starterCode.match(/function\s+([a-zA-Z0-9_]+)/)?.[1] || "twoSum"} !== "undefined"
          ? ${selectedChallenge.starterCode.match(/function\s+([a-zA-Z0-9_]+)/)?.[1] || "twoSum"}
          : null;`
      );

      const userFn = wrapped(customConsole);
      if (typeof userFn !== "function") {
        throw new Error("Could not find executable function in code.");
      }

      const results = [];
      for (let i = 0; i < selectedChallenge.tests.length; i++) {
        const test = selectedChallenge.tests[i];
        if (test.customRunner) {
          const res = await test.run(userFn);
          results.push({
            caseIndex: i + 1,
            passed: res.pass,
            expected: res.expected,
            actual: res.actual
          });
        } else {
          // Clone inputs so user code doesn't mutate test fixtures
          const inputCopy = JSON.parse(JSON.stringify(test.input));
          const actual = userFn(...inputCopy);
          let passed = false;

          if (test.verify) {
            passed = Boolean(test.verify(actual, test.input));
          } else {
            passed = JSON.stringify(actual) === JSON.stringify(test.expected);
          }

          results.push({
            caseIndex: i + 1,
            passed,
            input: test.input,
            expected: test.expected,
            actual
          });
        }
      }

      const duration = (performance.now() - startTime).toFixed(2);
      const allPassed = results.every((r) => r.passed);

      setTestResults({
        passed: allPassed,
        results,
        duration
      });
      setLogs(capturedLogs);

      if (allPassed) {
        setSolvedMap((prev) => ({ ...prev, [selectedChallenge.id]: true }));
        toast.success(`All ${results.length} tests passed in ${duration}ms!`);
      } else {
        toast.error("Some test cases failed. Check output below.");
      }
    } catch (err) {
      setTestResults({
        error: err.message,
        results: []
      });
      toast.error(`Runtime Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const resetCode = () => {
    setCode(selectedChallenge.starterCode);
    setTestResults(null);
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-300">
              <Code2 size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Interactive Coding Lab</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Algorithm & Practical Arena</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Solve real-world JavaScript and Data Structure challenges in-browser. Run test suites, analyze complexity, and master interview algorithms.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <Trophy className="text-amber-300" size={24} />
            <div>
              <p className="text-xs text-slate-300">Challenges Solved</p>
              <p className="text-xl font-bold">
                {Object.keys(solvedMap).length} / {CHALLENGES.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Challenges list sidebar */}
        <div className="space-y-3">
          <div className="card p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Problem Set</h2>
            <div className="mt-3 space-y-2">
              {CHALLENGES.map((ch) => {
                const isSelected = selectedChallenge.id === ch.id;
                const isSolved = solvedMap[ch.id];
                return (
                  <button
                    key={ch.id}
                    onClick={() => selectChallenge(ch)}
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-semibold text-sm">{ch.title}</p>
                      <span className={`text-[11px] font-bold ${
                        ch.difficulty === "Easy" ? "text-emerald-600" : ch.difficulty === "Medium" ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {ch.difficulty}
                      </span>
                    </div>
                    {isSolved ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card space-y-3 p-4">
            <h3 className="font-bold text-sm text-slate-900">Need Guidance?</h3>
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span className="flex items-center gap-1.5"><HelpCircle size={14} /> Hints</span>
              <span>{showHints ? "Hide" : "Show"}</span>
            </button>
            {showHints && (
              <div className="rounded-xl bg-amber-50/80 p-3 text-xs text-amber-900 space-y-2">
                {selectedChallenge.hints.map((hint, i) => (
                  <p key={i}>• {hint}</p>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span className="flex items-center gap-1.5"><Sparkles size={14} /> Solution</span>
              <span>{showSolution ? "Hide" : "Reveal"}</span>
            </button>
            {showSolution && (
              <pre className="rounded-xl bg-slate-900 p-3 text-[11px] text-emerald-400 overflow-x-auto">
                <code>{selectedChallenge.solution}</code>
              </pre>
            )}
          </div>
        </div>

        {/* Editor & Test Cases */}
        <div className="space-y-4">
          {/* Challenge Description */}
          <div className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-slate-900">{selectedChallenge.title}</h2>
              <span className={`badge ${
                selectedChallenge.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {selectedChallenge.difficulty} · {selectedChallenge.category}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
              {selectedChallenge.description}
            </p>
          </div>

          {/* Code Editor */}
          <div className="card overflow-hidden border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono">
                <Terminal size={14} className="text-brand-400" />
                <span>solution.js</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetCode}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  onClick={runCode}
                  disabled={running}
                  className="btn-primary py-1.5 px-4 text-xs font-bold"
                >
                  <Play size={13} /> {running ? "Testing..." : "Run Tests"}
                </button>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full resize-y bg-transparent font-mono text-sm leading-6 text-emerald-300 outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Test Results Output */}
          {testResults && (
            <div className="card p-5 sm:p-6 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {testResults.passed ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={18} /> All Tests Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600">
                      <XCircle size={18} /> Tests Failed
                    </span>
                  )}
                </h3>
                {testResults.duration && (
                  <span className="text-xs font-mono text-slate-500">
                    Execution time: {testResults.duration}ms
                  </span>
                )}
              </div>

              {testResults.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-mono text-rose-700">
                  {testResults.error}
                </div>
              ) : (
                <div className="space-y-2">
                  {testResults.results.map((r, i) => (
                    <div
                      key={i}
                      className={`flex flex-col gap-1 rounded-xl border p-3 text-xs ${
                        r.passed
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-rose-200 bg-rose-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className={r.passed ? "text-emerald-800" : "text-rose-800"}>
                          Case {r.caseIndex}: {r.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                      {r.input && (
                        <div className="font-mono text-slate-600">
                          Input: {JSON.stringify(r.input)}
                        </div>
                      )}
                      <div className="font-mono text-slate-600">
                        Expected: <span className="text-emerald-700 font-semibold">{JSON.stringify(r.expected)}</span> |
                        Actual: <span className={r.passed ? "text-emerald-700" : "text-rose-700 font-bold"}>{JSON.stringify(r.actual)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {logs.length > 0 && (
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-slate-300">
                  <p className="text-[10px] uppercase text-slate-500">Console Logs</p>
                  {logs.map((log, i) => (
                    <p key={i}>{log}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
