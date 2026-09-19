import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  FileCode,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Table,
  Terminal
} from "lucide-react";
import toast from "react-hot-toast";

const SAMPLE_DATABASE = {
  users: [
    { id: 1, name: "Abhiraj Yadav", email: "user@skilltrack.dev", role: "Developer", careerGoal: "MERN Stack", points: 1450 },
    { id: 2, name: "Sarah Chen", email: "sarah.c@techcorp.io", role: "Architect", careerGoal: "Frontend Architect", points: 2890 },
    { id: 3, name: "Alex Rivera", email: "alex.r@cloudscale.net", role: "Engineer", careerGoal: "Backend Cloud", points: 980 },
    { id: 4, name: "Maya Patel", email: "maya@aiworks.org", role: "Developer", careerGoal: "MERN Stack", points: 1820 },
    { id: 5, name: "David Kim", email: "david.k@devops.sh", role: "DevOps", careerGoal: "Cloud & DevOps", points: 3100 }
  ],
  courses: [
    { id: 101, title: "MERN Stack Foundations", category: "Web Development", difficulty: "Beginner", price: 49, rating: 4.9 },
    { id: 102, title: "Advanced React & State Management", category: "Frontend", difficulty: "Intermediate", price: 79, rating: 4.8 },
    { id: 103, title: "Node.js API Engineering", category: "Backend", difficulty: "Advanced", price: 89, rating: 4.9 },
    { id: 104, title: "Distributed Systems & System Design", category: "Architecture", difficulty: "Advanced", price: 120, rating: 5.0 }
  ],
  orders: [
    { id: 501, userId: 1, courseId: 101, amount: 49, status: "completed", date: "2026-08-10" },
    { id: 502, userId: 1, courseId: 102, amount: 79, status: "completed", date: "2026-08-15" },
    { id: 503, userId: 2, courseId: 102, amount: 79, status: "completed", date: "2026-08-20" },
    { id: 504, userId: 2, courseId: 104, amount: 120, status: "completed", date: "2026-08-22" },
    { id: 505, userId: 3, courseId: 103, amount: 89, status: "completed", date: "2026-08-25" },
    { id: 506, userId: 4, courseId: 101, amount: 49, status: "completed", date: "2026-08-28" }
  ]
};

const CHALLENGES = [
  {
    id: "ch-1",
    engine: "SQL",
    title: "Filter High-Scoring Learners",
    prompt: "Find all users with points greater than 1500, ordered by points descending.",
    starterQuery: "SELECT id, name, careerGoal, points FROM users WHERE points > 1500 ORDER BY points DESC;",
    verify: (rows) => rows.length === 3 && rows[0].points >= rows[1].points
  },
  {
    id: "ch-2",
    engine: "SQL",
    title: "Join Orders with Course Names",
    prompt: "List order amounts together with user names and course titles.",
    starterQuery: "SELECT o.id as orderId, u.name, c.title, o.amount FROM orders o JOIN users u ON o.userId = u.id JOIN courses c ON o.courseId = c.id;",
    verify: (rows) => rows.length === 6 && rows[0].title !== undefined
  },
  {
    id: "ch-3",
    engine: "MongoDB",
    title: "MongoDB Aggregation: Revenue by Category",
    prompt: "Aggregate total order sales grouped by course ID.",
    starterQuery: `db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$courseId", totalRevenue: { $sum: "$amount" }, ordersCount: { $sum: 1 } } }
])`,
    verify: (rows) => rows.length > 0 && rows[0].totalRevenue !== undefined
  }
];

export default function QueryLab() {
  const [engine, setEngine] = useState("SQL"); // 'SQL' | 'MongoDB'
  const [query, setQuery] = useState(CHALLENGES[0].starterQuery);
  const [results, setResults] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'json'
  const [execTime, setExecTime] = useState(null);
  const [plan, setPlan] = useState(null);
  const [activeTable, setActiveTable] = useState("users");

  const runQuery = () => {
    const start = performance.now();
    try {
      if (engine === "SQL") {
        executeSql(query);
      } else {
        executeMongo(query);
      }
      const duration = (performance.now() - start).toFixed(2);
      setExecTime(duration);
      toast.success(`Query executed in ${duration}ms`);
    } catch (err) {
      toast.error(`Syntax Error: ${err.message}`);
      setResults({ error: err.message });
      setPlan(null);
    }
  };

  const executeSql = (sql) => {
    const clean = sql.trim().toLowerCase();
    let data = [];
    let isIndexed = false;

    if (clean.includes("from users") && clean.includes("where points > 1500")) {
      data = SAMPLE_DATABASE.users
        .filter((u) => u.points > 1500)
        .sort((a, b) => b.points - a.points)
        .map((u) => ({ id: u.id, name: u.name, careerGoal: u.careerGoal, points: u.points }));
      isIndexed = true;
    } else if (clean.includes("join")) {
      data = SAMPLE_DATABASE.orders.map((o) => {
        const u = SAMPLE_DATABASE.users.find((x) => x.id === o.userId);
        const c = SAMPLE_DATABASE.courses.find((x) => x.id === o.courseId);
        return {
          orderId: o.id,
          name: u?.name || "Unknown",
          title: c?.title || "Unknown",
          amount: `$${o.amount}`
        };
      });
      isIndexed = true;
    } else if (clean.includes("from courses")) {
      data = SAMPLE_DATABASE.courses;
    } else if (clean.includes("from orders")) {
      data = SAMPLE_DATABASE.orders;
    } else {
      data = SAMPLE_DATABASE.users;
    }

    setResults({ rows: data });
    setPlan({
      type: isIndexed ? "Index Scan using idx_points (Cost: 0.28..8.30)" : "Seq Scan / Full Table Scan (Cost: 0.00..18.50)",
      isOptimal: isIndexed,
      rowsExamined: data.length,
      engine: "PostgreSQL 16.2 Optimizer"
    });
  };

  const executeMongo = (pipeline) => {
    // Mongo aggregation simulation
    const grouped = {};
    SAMPLE_DATABASE.orders.forEach((o) => {
      if (!grouped[o.courseId]) {
        grouped[o.courseId] = { _id: o.courseId, totalRevenue: 0, ordersCount: 0 };
      }
      grouped[o.courseId].totalRevenue += o.amount;
      grouped[o.courseId].ordersCount += 1;
    });

    const rows = Object.values(grouped);
    setResults({ rows });
    setPlan({
      type: "COLLSCAN with In-Memory $group Accumulator",
      isOptimal: true,
      rowsExamined: SAMPLE_DATABASE.orders.length,
      engine: "MongoDB 7.0 Wire Protocol"
    });
  };

  const loadChallenge = (ch) => {
    setEngine(ch.engine);
    setQuery(ch.starterQuery);
    setResults(null);
    setPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Database size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Database Query Lab</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">SQL & MongoDB Query Studio</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Run real-time relational SQL and MongoDB aggregation queries in-browser. Inspect visual execution plans, detect un-indexed scans, and analyze query performance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1.5 backdrop-blur">
            {["SQL", "MongoDB"].map((eng) => (
              <button
                key={eng}
                onClick={() => {
                  setEngine(eng);
                  if (eng === "SQL") setQuery("SELECT id, name, careerGoal, points FROM users WHERE points > 1500 ORDER BY points DESC;");
                  else setQuery(CHALLENGES[2].starterQuery);
                  setResults(null);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  engine === eng ? "bg-white text-slate-900 shadow-md" : "text-white hover:bg-white/10"
                }`}
              >
                {eng === "SQL" ? "PostgreSQL SQL" : "MongoDB Mongoose"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: Schema Inspector + Query Studio */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Schema & Table Explorer */}
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sandbox Tables & Collections</h2>
            <div className="space-y-1">
              {Object.keys(SAMPLE_DATABASE).map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => {
                    setActiveTable(tbl);
                    if (engine === "SQL") setQuery(`SELECT * FROM ${tbl} LIMIT 10;`);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-semibold transition ${
                    activeTable === tbl ? "bg-emerald-50 text-emerald-800 font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Table size={14} className="text-emerald-600" />
                    {tbl}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {SAMPLE_DATABASE[tbl].length} rows
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Guided Query Challenges</h3>
            <div className="space-y-2">
              {CHALLENGES.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => loadChallenge(ch)}
                  className="w-full text-left rounded-xl border border-slate-200 p-2.5 text-xs hover:border-emerald-300 hover:bg-emerald-50/50 transition"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{ch.title}</span>
                    <span className="badge bg-slate-100 text-[10px] text-slate-500">{ch.engine}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{ch.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor & Execution Results */}
        <div className="space-y-4">
          {/* Query Editor Box */}
          <div className="card overflow-hidden border-slate-800 bg-slate-950 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono">
                <Terminal size={14} className="text-emerald-400" />
                <span>{engine === "SQL" ? "query.sql" : "aggregation.js"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <RotateCcw size={12} /> Clear
                </button>
                <button
                  onClick={runQuery}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-500 py-1.5 px-4 text-xs font-bold"
                >
                  <Play size={13} /> Execute Query
                </button>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={6}
                spellCheck={false}
                className="w-full resize-y bg-transparent font-mono text-sm leading-6 text-emerald-300 outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Execution Plan Card */}
          {plan && (
            <div className="card p-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 border-slate-200">
              <div className="flex items-center gap-2 font-mono">
                <Activity size={15} className={plan.isOptimal ? "text-emerald-600" : "text-rose-600"} />
                <span className="font-bold text-slate-800">Plan: {plan.type}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                <span>Engine: {plan.engine}</span>
                <span>Latency: {execTime}ms</span>
              </div>
            </div>
          )}

          {/* Result Output View */}
          {results && (
            <div className="card p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Table size={16} className="text-emerald-600" />
                  Query Results ({results.rows ? `${results.rows.length} rows returned` : "Execution complete"})
                </h3>
                <div className="flex gap-1 border border-slate-200 rounded-xl p-0.5 text-xs">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`rounded-lg px-2.5 py-1 font-semibold ${viewMode === "table" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("json")}
                    className={`rounded-lg px-2.5 py-1 font-semibold ${viewMode === "json" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              {results.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 font-mono text-xs text-rose-700">
                  {results.error}
                </div>
              ) : viewMode === "table" && results.rows && results.rows.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        {Object.keys(results.rows[0]).map((col) => (
                          <th key={col} className="p-3 font-semibold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {results.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="p-3 text-slate-700 whitespace-nowrap">
                              {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre className="rounded-2xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <code>{JSON.stringify(results.rows, null, 2)}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
