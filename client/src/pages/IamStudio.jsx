import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  FileCode,
  FileText,
  Key,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  Unlock,
  Users,
  XCircle,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const ENTERPRISE_RESOURCES = [
  { id: "res_prod_mongo_cluster", name: "Production MongoDB Primary Cluster", classification: "CONFIDENTIAL", allowedRoles: ["SuperAdmin", "DevOpsLead"] },
  { id: "res_stripe_keys", name: "Stripe Production API Secret Keys", classification: "CONFIDENTIAL", allowedRoles: ["SuperAdmin"] },
  { id: "res_user_pii_vault", name: "Customer PII & Credential Vault", classification: "RESTRICTED", allowedRoles: ["SuperAdmin", "SecurityAuditor"] },
  { id: "res_app_deployments", name: "Kubernetes Production Deployment DAG", classification: "INTERNAL", allowedRoles: ["SuperAdmin", "DevOpsLead", "SoftwareEngineer"] },
  { id: "res_course_catalog", name: "Course Curriculum & Lesson Markdown", classification: "PUBLIC", allowedRoles: ["*"] }
];

export default function IamStudio() {
  const [userId, setUserId] = useState("usr_eng_482");
  const [role, setRole] = useState("SoftwareEngineer");
  const [tenantId, setTenantId] = useState("tenant_enterprise_acme");
  const [mfaVerified, setMfaVerified] = useState(true);
  const [clientIp, setClientIp] = useState("10.0.4.18");
  const [isManagedDevice, setIsManagedDevice] = useState(true);
  const [selectedResourceId, setSelectedResourceId] = useState("res_app_deployments");
  const [action, setAction] = useState("DEPLOY");
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [evaluationResult, setEvaluationResult] = useState({
    decision: "ALLOW",
    decisionCode: 200,
    context: {
      userId: "usr_eng_482",
      role: "SoftwareEngineer",
      tenantId: "tenant_enterprise_acme",
      resourceName: "Kubernetes Production Deployment DAG",
      classification: "INTERNAL",
      action: "DEPLOY",
      evaluatedAt: "Just now"
    },
    evaluationLog: [
      { clause: "POLICY_001_TENANT_ISOLATION", description: "Verify request originates within authorized tenant boundary", passed: true, note: "Tenant [tenant_enterprise_acme] confirmed in strict schema isolation." },
      { clause: "POLICY_002_ZERO_TRUST_POSTURE", description: "Zero-Trust network telemetry check", passed: true, note: "Corporate device [10.0.4.18] posture verified." },
      { clause: "POLICY_003_MFA_STEP_UP", description: "MFA authorization state check", passed: true, note: "FIDO2 WebAuthn token verified." },
      { clause: "POLICY_004_LEAST_PRIVILEGE_RBAC", description: "RBAC entitlement confirmed", passed: true, note: "Role [SoftwareEngineer] explicitly authorized for [DEPLOY]." }
    ],
    regoExpression: "package authz.skilltrack\ndefault allow = false\nallow {\n  input.tenant == \"tenant_enterprise_acme\"\n  input.role in [\"SuperAdmin\", \"DevOpsLead\", \"SoftwareEngineer\"]\n  input.action == \"DEPLOY\"\n  input.mfa == true\n}"
  });

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/iam/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role,
          tenantId,
          mfaVerified,
          clientIp,
          isManagedDevice,
          resourceId: selectedResourceId,
          action
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data);
        if (data.decision === "ALLOW") {
          toast.success("Zero-Trust Policy Evaluation: ALLOW (HTTP 200)");
        } else {
          toast.error("Zero-Trust Policy Evaluation: DENY (HTTP 403 Forbidden)");
        }
        setIsEvaluating(false);
        return;
      }
    } catch {}

    // Simulated fallback
    const resource = ENTERPRISE_RESOURCES.find((r) => r.id === selectedResourceId);
    let allowed = true;
    const log = [];

    log.push({ clause: "POLICY_001_TENANT_ISOLATION", description: "Multi-tenant schema validation", passed: true, note: `Tenant [${tenantId}] confirmed.` });

    const isPrivate = clientIp.startsWith("10.") || clientIp.startsWith("192.168.");
    if (!isPrivate || !isManagedDevice) {
      if (resource.classification === "CONFIDENTIAL" || resource.classification === "RESTRICTED") {
        allowed = false;
        log.push({ clause: "POLICY_002_ZERO_TRUST_POSTURE", description: "Zero-Trust network telemetry check", passed: false, note: "Untrusted IP or device accessing confidential asset." });
      } else {
        log.push({ clause: "POLICY_002_ZERO_TRUST_POSTURE", description: "Zero-Trust network telemetry check", passed: true, note: "Public asset accessible." });
      }
    } else {
      log.push({ clause: "POLICY_002_ZERO_TRUST_POSTURE", description: "Zero-Trust network telemetry check", passed: true, note: "Trusted IP and managed device posture." });
    }

    if ((action === "DELETE" || action === "DEPLOY" || resource.classification === "CONFIDENTIAL") && !mfaVerified) {
      allowed = false;
      log.push({ clause: "POLICY_003_MFA_STEP_UP", description: "FIDO2 MFA token verification", passed: false, note: "Privileged action requires MFA step-up." });
    } else {
      log.push({ clause: "POLICY_003_MFA_STEP_UP", description: "MFA authorization state check", passed: true, note: mfaVerified ? "MFA verified." : "MFA not required." });
    }

    const isRoleOk = resource.allowedRoles.includes("*") || resource.allowedRoles.includes(role);
    if (!isRoleOk) {
      allowed = false;
      log.push({ clause: "POLICY_004_LEAST_PRIVILEGE_RBAC", description: "RBAC entitlement matrix", passed: false, note: `Role [${role}] not authorized on ${resource.name}.` });
    } else {
      log.push({ clause: "POLICY_004_LEAST_PRIVILEGE_RBAC", description: "RBAC entitlement matrix", passed: true, note: `Role [${role}] authorized.` });
    }

    setEvaluationResult({
      decision: allowed ? "ALLOW" : "DENY",
      decisionCode: allowed ? 200 : 403,
      context: { userId, role, tenantId, resourceName: resource.name, classification: resource.classification, action, evaluatedAt: "Just now" },
      evaluationLog: log,
      regoExpression: `package authz.skilltrack\ndefault allow = false\nallow {\n  input.tenant == "${tenantId}"\n  input.role in ${JSON.stringify(resource.allowedRoles)}\n  input.action == "${action}"\n  input.mfa == ${mfaVerified}\n}`
    });

    if (allowed) {
      toast.success("Zero-Trust Policy Evaluation: ALLOW (HTTP 200)");
    } else {
      toast.error("Zero-Trust Policy Evaluation: DENY (HTTP 403 Forbidden)");
    }
    setIsEvaluating(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 p-6 text-white shadow-2xl sm:p-8 border border-purple-900/40">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-purple-400">
              <ShieldCheck size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Zero-Trust Architecture & IAM Governance</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent">
              Enterprise IAM & OPA Policy Studio
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Role-Based Access Control (RBAC), Attribute-Based Access Control (ABAC), Open Policy Agent (OPA) Rego policy engines, and multi-tenant least-privilege security boundaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Shield className="text-emerald-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">Zero-Trust Model</p>
                <p className="text-xl font-black text-emerald-400">Never Trust, Verify</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Key className="text-amber-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">Policy Engine</p>
                <p className="text-xl font-black text-amber-300">OPA Rego 0.60</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Principles Pills */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-purple-900/60 pt-4 text-xs font-medium text-slate-300">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">✓ Multi-Tenant Data Isolation</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">✓ Principle of Least Privilege</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">✓ FIDO2 WebAuthn MFA Gate</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">✓ Dynamic Contextual ABAC</span>
        </div>
      </section>

      {/* Main Grid: Policy Simulator & OPA Decision Log */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Input Sandbox Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="text-purple-600" size={18} /> Zero-Trust Policy Evaluation Simulator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure contextual user credentials, network origins, device posture, and requested operations.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">User Identity:</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Role (RBAC):</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="SuperAdmin">SuperAdmin (Full Entitlements)</option>
                  <option value="DevOpsLead">DevOpsLead (Infra Deploy & Config)</option>
                  <option value="SecurityAuditor">SecurityAuditor (Read & Audit)</option>
                  <option value="SoftwareEngineer">SoftwareEngineer (Read/Write/Exec)</option>
                  <option value="Intern">Intern (Read-Only Least Privilege)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tenant Identifier:</label>
                <input
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Client IP Address:</label>
                <input
                  type="text"
                  value={clientIp}
                  onChange={(e) => setClientIp(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mfaToggle"
                  checked={mfaVerified}
                  onChange={(e) => setMfaVerified(e.target.checked)}
                  className="h-4 w-4 rounded accent-purple-600"
                />
                <label htmlFor="mfaToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  MFA / FIDO2 Token Verified
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deviceToggle"
                  checked={isManagedDevice}
                  onChange={(e) => setIsManagedDevice(e.target.checked)}
                  className="h-4 w-4 rounded accent-purple-600"
                />
                <label htmlFor="deviceToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Managed Corporate Laptop
                </label>
              </div>
            </div>

            {/* Target Resource & Action */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Enterprise Resource:</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {ENTERPRISE_RESOURCES.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.classification}] {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Requested Operation:</label>
              <div className="grid grid-cols-5 gap-2">
                {["READ", "WRITE", "DEPLOY", "DELETE", "CONFIG"].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAction(a)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      action === a
                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              {isEvaluating ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
              {isEvaluating ? "Evaluating OPA Rego Engine..." : "Evaluate Zero-Trust Access Policy"}
            </button>
          </div>
        </div>

        {/* Right: Decision Output & Rego Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="text-indigo-600" size={16} /> OPA Policy Decision Trace
              </h3>
              <span className={`px-3 py-1 rounded-xl text-xs font-black border font-mono ${
                evaluationResult.decision === "ALLOW"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/40"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/40"
              }`}>
                {evaluationResult.decision} ({evaluationResult.decisionCode})
              </span>
            </div>

            {/* Granular Policy Clauses Evaluation */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Evaluated Policy Clauses:
              </span>
              <div className="space-y-2">
                {evaluationResult.evaluationLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 border text-xs space-y-1 transition ${
                      log.passed
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200"
                        : "border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-[11px]">
                      <span>{log.clause}</span>
                      <span>{log.passed ? "PASS ✓" : "FAIL ✕"}</span>
                    </div>
                    <p className="text-[11px] font-sans opacity-90">{log.description}</p>
                    <p className="text-[10px] font-mono opacity-80 pt-0.5">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* OPA Rego Code */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Generated OPA Rego Authz Policy:
              </span>
              <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-purple-300 border border-slate-800 overflow-x-auto">
                {evaluationResult.regoExpression}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
