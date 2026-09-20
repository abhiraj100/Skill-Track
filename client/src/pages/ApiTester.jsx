import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  ExternalLink,
  FolderOpen,
  Globe,
  History,
  Layers,
  Play,
  RotateCcw,
  Send,
  Server,
  Sparkles,
  Terminal,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const PRELOADED_COLLECTIONS = [
  {
    name: "SkillTrack System Health",
    method: "GET",
    url: "/api/health",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: ""
  },
  {
    name: "Courses Catalog",
    method: "GET",
    url: "/api/courses",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: ""
  },
  {
    name: "Community Discussions Feed",
    method: "GET",
    url: "/api/community/posts",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: ""
  },
  {
    name: "Tracked Job Pipeline",
    method: "GET",
    url: "/api/jobs",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: ""
  },
  {
    name: "AI Skill-Gap Analyzer",
    method: "POST",
    url: "/api/ai/skill-gap",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: JSON.stringify({ careerGoal: "MERN Stack Developer", skills: ["React", "JavaScript"] }, null, 2)
  }
];

export default function ApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("/api/health");
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState("body"); // 'body' | 'headers' | 'params'
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skilltrack_api_history")) || [];
    } catch {
      return [];
    }
  });

  const sendRequest = async () => {
    if (!url.trim()) return toast.error("Please enter a valid request URL");
    setLoading(true);
    setResponse(null);

    const startTime = performance.now();
    try {
      const headerObj = {};
      headers.forEach((h) => {
        if (h.key.trim()) headerObj[h.key.trim()] = h.value;
      });

      let payload = undefined;
      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        try {
          payload = JSON.parse(body);
        } catch {
          setLoading(false);
          return toast.error("Invalid JSON format in request body");
        }
      }

      const res = await api({
        method,
        url,
        headers: headerObj,
        data: payload
      });

      const duration = (performance.now() - startTime).toFixed(2);
      const resData = {
        status: res.status,
        statusText: res.statusText || "OK",
        data: res.data,
        headers: res.headers,
        duration,
        size: (JSON.stringify(res.data).length / 1024).toFixed(2)
      };

      setResponse(resData);
      saveToHistory(method, url, res.status);
      toast.success(`${method} ${url} succeeded in ${duration}ms!`);
    } catch (err) {
      const duration = (performance.now() - startTime).toFixed(2);
      const resData = {
        status: err.response?.status || 500,
        statusText: err.response?.statusText || "Error",
        data: err.response?.data || { message: err.message },
        headers: err.response?.headers || {},
        duration,
        size: "0.2"
      };
      setResponse(resData);
      saveToHistory(method, url, err.response?.status || 500);
      toast.error(`Request failed with status ${err.response?.status || 500}`);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (m, u, s) => {
    const item = { method: m, url: u, status: s, timestamp: new Date().toLocaleTimeString() };
    const updated = [item, ...history.slice(0, 15)];
    setHistory(updated);
    localStorage.setItem("skilltrack_api_history", JSON.stringify(updated));
  };

  const loadCollectionItem = (item) => {
    setMethod(item.method);
    setUrl(item.url);
    setHeaders(item.headers || [{ key: "Content-Type", value: "application/json" }]);
    setBody(item.body || "");
    setResponse(null);
    toast.success(`Loaded ${item.name}`);
  };

  const copyResponse = () => {
    if (!response?.data) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Response JSON copied to clipboard");
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const updateHeader = (idx, field, val) => {
    const updated = [...headers];
    updated[idx][field] = val;
    setHeaders(updated);
  };

  const removeHeader = (idx) => {
    setHeaders(headers.filter((_, i) => i !== idx));
  };

  const methodColors = {
    GET: "text-emerald-600 bg-emerald-50 border-emerald-200",
    POST: "text-amber-600 bg-amber-50 border-amber-200",
    PUT: "text-blue-600 bg-blue-50 border-blue-200",
    DELETE: "text-rose-600 bg-rose-50 border-rose-200",
    PATCH: "text-purple-600 bg-purple-50 border-purple-200"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-300">
              <Globe size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">REST API Sandbox</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Interactive In-Browser API Client</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Send live HTTP requests, test backend REST microservices, configure headers and payloads, and inspect formatted JSON responses without external tools.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <Server size={22} className="text-sky-300" />
            <div>
              <p className="text-xs text-slate-300">Active API Engine</p>
              <p className="text-sm font-bold text-white">SkillTrack Local Gateway</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Client Interface */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Collections & History Sidebar */}
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderOpen size={14} className="text-brand-600" />
              API Collections
            </h2>
            <div className="space-y-1.5">
              {PRELOADED_COLLECTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => loadCollectionItem(item)}
                  className="w-full text-left rounded-xl border border-slate-100 p-2.5 text-xs hover:border-brand-200 hover:bg-brand-50/50 transition flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="font-mono text-[10px] text-slate-400 truncate">{item.url}</p>
                  </div>
                  <span className={`badge text-[9px] font-bold ${methodColors[item.method]}`}>
                    {item.method}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Request History */}
          {history.length > 0 && (
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History size={14} className="text-slate-500" />
                  Recent Calls
                </h3>
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem("skilltrack_api_history");
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMethod(h.method);
                      setUrl(h.url);
                    }}
                    className="w-full text-left rounded-lg p-1.5 text-xs hover:bg-slate-50 transition flex items-center justify-between font-mono"
                  >
                    <span className="truncate pr-2 text-slate-700 text-[11px]">{h.url}</span>
                    <span className={`text-[10px] font-bold ${h.status < 400 ? "text-emerald-600" : "text-rose-600"}`}>
                      {h.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Request Builder & Response Inspector */}
        <div className="space-y-5">
          {/* URL & Method Bar */}
          <div className="card p-4 flex flex-wrap items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none"
            >
              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/api/courses"
              className="input flex-1 py-2 text-xs font-mono"
            />

            <button
              onClick={sendRequest}
              disabled={loading}
              className="btn-primary bg-sky-600 hover:bg-sky-500 text-xs px-5 py-2.5 font-bold shadow-md"
            >
              <Send size={13} /> {loading ? "Sending..." : "Send"}
            </button>
          </div>

          {/* Request Config Tabs */}
          <div className="card p-5 space-y-4">
            <div className="flex border-b border-slate-100 pb-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("body")}
                className={`pb-1 px-3 border-b-2 transition ${
                  activeTab === "body" ? "border-sky-600 text-sky-600" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Request Body (JSON)
              </button>
              <button
                onClick={() => setActiveTab("headers")}
                className={`pb-1 px-3 border-b-2 transition ${
                  activeTab === "headers" ? "border-sky-600 text-sky-600" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Headers ({headers.length})
              </button>
            </div>

            {/* Body Editor */}
            {activeTab === "body" && (
              <div className="space-y-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder={`{\n  "key": "value"\n}`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-sky-300 outline-none placeholder:text-slate-600"
                />
              </div>
            )}

            {/* Headers Editor */}
            {activeTab === "headers" && (
              <div className="space-y-2">
                {headers.map((h, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Header Name (e.g. Authorization)"
                      value={h.key}
                      onChange={(e) => updateHeader(idx, "key", e.target.value)}
                      className="input py-1.5 text-xs font-mono flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Header Value"
                      value={h.value}
                      onChange={(e) => updateHeader(idx, "value", e.target.value)}
                      className="input py-1.5 text-xs font-mono flex-1"
                    />
                    <button onClick={() => removeHeader(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addHeader} className="text-xs font-bold text-sky-600 hover:underline pt-1">
                  + Add Header
                </button>
              </div>
            )}
          </div>

          {/* Response Inspector */}
          {response && (
            <div className="card p-5 space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`badge font-mono font-bold text-xs py-1 px-2.5 ${
                    response.status < 400 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Clock size={13} /> {response.duration}ms
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {response.size} KB
                  </span>
                </div>

                <button
                  onClick={copyResponse}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy JSON"}
                </button>
              </div>

              {/* Formatted JSON Output */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 max-h-96 overflow-y-auto font-mono text-xs text-emerald-300">
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
