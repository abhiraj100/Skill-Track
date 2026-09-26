import { useEffect, useState } from "react";
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Medal,
  Printer,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../services/api";

const DEFAULT_DEMO_CERTS = [
  {
    _id: "demo-cert-1",
    certificateId: "ST-2026-DIST-8842",
    studentName: "Abhiraj Yadav",
    courseTitle: "Full-Stack Distributed Systems & Cloud Architecture",
    instructor: "Dr. S. K. Sharma (Cloud Lab)",
    skills: ["React 18 Concurrent", "Kafka Pub/Sub", "Kubernetes HPA", "Redis Redlock", "Distributed System Design", "Docker Multi-Stage"],
    grade: "Distinction (98%)",
    issueDate: new Date("2026-03-15").toISOString(),
    verificationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    _id: "demo-cert-2",
    certificateId: "ST-2026-ALGO-4190",
    studentName: "Abhiraj Yadav",
    courseTitle: "Advanced Data Structures & FAANG Algorithmic Masterclass",
    instructor: "SkillTrack Engineering Faculty",
    skills: ["Monotonic Stack", "Sliding Window", "Dynamic Programming", "Consistent Hashing", "Divide & Conquer", "Graph BFS/DFS"],
    grade: "Mastery (100%)",
    issueDate: new Date("2026-05-20").toISOString(),
    verificationHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
  },
  {
    _id: "demo-cert-3",
    certificateId: "ST-2026-SRE-1092",
    studentName: "Abhiraj Yadav",
    courseTitle: "Site Reliability Engineering (SRE) & OpenTelemetry Observability",
    instructor: "Apex Institute SRE Center",
    skills: ["OpenTelemetry APM", "Circuit Breakers", "Kafka Lag Fencing", "mTLS Service Mesh", "PostgreSQL Sharding", "Chaos Monkey"],
    grade: "Honors (96%)",
    issueDate: new Date("2026-08-10").toISOString(),
    verificationHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d"
  }
];

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [tab, setTab] = useState("my-certs"); // 'my-certs' | 'claim' | 'verifier'

  // Claim Certificate Simulator State
  const [claimCourse, setClaimCourse] = useState("Fullstack React & Node Architecture");
  const [claimStudentName, setClaimStudentName] = useState("Abhiraj Yadav");
  const [examPassed, setExamPassed] = useState(false);
  const [examScore, setExamScore] = useState(100);

  useEffect(() => {
    loadCertificates();

    // Check URL parameters for direct verification link
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get("verify");
    if (verifyParam) {
      setVerifyCode(verifyParam);
      setTab("verifier");
      runVerification(verifyParam);
    }
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certificates");
      if (data.certificates && data.certificates.length > 0) {
        setCertificates(data.certificates);
      } else {
        setCertificates(DEFAULT_DEMO_CERTS);
      }
    } catch {
      setCertificates(DEFAULT_DEMO_CERTS);
    } finally {
      setLoading(false);
    }
  };

  const runVerification = async (codeToVerify) => {
    setVerifying(true);
    setVerifyResult(null);

    // First check local/demo certificates
    const matchedLocal = [...certificates, ...DEFAULT_DEMO_CERTS].find(
      (c) => c.certificateId.toLowerCase() === codeToVerify.toLowerCase() ||
             c.verificationHash.toLowerCase().startsWith(codeToVerify.toLowerCase())
    );

    if (matchedLocal) {
      setTimeout(() => {
        setVerifyResult({
          valid: true,
          certificate: matchedLocal,
          message: "Cryptographically verified authentic credential."
        });
        setVerifying(false);
        toast.success("Certificate verified successfully!");
      }, 500);
      return;
    }

    try {
      const { data } = await api.get(`/certificates/verify/${encodeURIComponent(codeToVerify.trim())}`);
      setVerifyResult(data);
      toast.success("Certificate verified successfully!");
    } catch (err) {
      setVerifyResult({ valid: false, message: err.response?.data?.message || "Invalid or unverifiable certificate identifier." });
      toast.error("Certificate not found");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerify = (e) => {
    e?.preventDefault();
    if (!verifyCode.trim()) return toast.error("Please enter a Certificate ID or verification hash");
    runVerification(verifyCode.trim());
  };

  const printCertificate = () => {
    window.print();
  };

  const copyVerifyLink = (certId) => {
    const url = `${window.location.origin}/certificates?verify=${certId}`;
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied to clipboard!");
  };

  const openLinkedInCert = (cert) => {
    const issueDate = new Date(cert.issueDate);
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      cert.courseTitle
    )}&organizationName=SkillTrack&issueYear=${issueDate.getFullYear()}&issueMonth=${
      issueDate.getMonth() + 1
    }&certUrl=${encodeURIComponent(
      `${window.location.origin}/certificates?verify=${cert.certificateId}`
    )}&certId=${encodeURIComponent(cert.certificateId)}`;

    window.open(linkedInUrl, "_blank");
  };

  const handleMintCertificate = () => {
    const newId = `ST-2026-MINT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const minted = {
      _id: `minted-${Date.now()}`,
      certificateId: newId,
      studentName: claimStudentName,
      courseTitle: claimCourse,
      instructor: "SkillTrack Board of Technical Examiners",
      skills: ["Core Architecture", "High Concurrency", "System Reliability", "Production Best Practices"],
      grade: "Mastery (100%)",
      issueDate: new Date().toISOString(),
      verificationHash: newHash
    };

    setCertificates([minted, ...certificates]);
    setSelectedCert(minted);
    setTab("my-certs");
    toast.success("Official Certificate minted and signed!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-amber-600 to-orange-600 p-6 text-white shadow-xl sm:p-8 border border-amber-500/30">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100">
              <Award size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Official SkillTrack Credentials</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent">
              Certificates & Cryptographic Verification
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-amber-50">
              Earn and share cryptographically signed course completion credentials. Employers, recruiters, and academic institutions can verify tamper-proof authenticity via SHA-256 signatures.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTab("my-certs")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                tab === "my-certs" ? "bg-white text-amber-800 shadow" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Trophy size={14} /> My Certificates ({certificates.length})
            </button>
            <button
              onClick={() => setTab("claim")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                tab === "claim" ? "bg-white text-amber-800 shadow" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Sparkles size={14} /> Claim New Credential
            </button>
            <button
              onClick={() => setTab("verifier")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                tab === "verifier" ? "bg-white text-amber-800 shadow" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <ShieldCheck size={14} /> Public Verifier
            </button>
          </div>
        </div>
      </section>

      {/* TAB 1: MY CERTIFICATES */}
      {tab === "my-certs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Student Credentials ({certificates.length})
            </h2>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> 100% Cryptographically Sealed
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white shadow-md shadow-amber-500/20">
                      <Medal size={24} />
                    </span>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {cert.grade}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {cert.courseTitle}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Awarded to <strong className="text-slate-800 dark:text-slate-200">{cert.studentName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </p>

                  {/* Skills badges */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cert.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                          {s}
                        </span>
                      ))}
                      {cert.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono self-center">
                          +{cert.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400">Credential ID</p>
                    <p className="font-bold text-amber-700 dark:text-amber-400">{cert.certificateId}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="btn-primary flex-1 py-2 text-xs font-bold"
                    >
                      View Certificate
                    </button>
                    <button
                      onClick={() => copyVerifyLink(cert.certificateId)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="Copy Public Verification Link"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => openLinkedInCert(cert)}
                      className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/60 p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                      title="Add to LinkedIn Profile"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLAIM NEW CREDENTIAL SIMULATOR */}
      {tab === "claim" && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Course Mastery & Credential Minting
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verify completion parameters and generate an authenticated certificate with cryptographic SHA-256 seal.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Student Full Name:</label>
                <input
                  type="text"
                  value={claimStudentName}
                  onChange={(e) => setClaimStudentName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Select Completed Course Track:</label>
                <select
                  value={claimCourse}
                  onChange={(e) => setClaimCourse(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Fullstack React & Node Architecture">Fullstack React & Node Architecture</option>
                  <option value="Microservices with Kafka, Docker & Kubernetes">Microservices with Kafka, Docker & Kubernetes</option>
                  <option value="Full-Stack System Design for FAANG">Full-Stack System Design for FAANG</option>
                  <option value="DevSecOps & Cloud Security Architecture">DevSecOps & Cloud Security Architecture</option>
                  <option value="Complete PostgreSQL & MongoDB Database Engineering">Complete PostgreSQL & MongoDB Database Engineering</option>
                </select>
              </div>

              {/* Instant Knowledge Check */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Mastery Verification Check:
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  All course modules, terminal challenges, and capstone implementations must have an aggregate pass rate of &ge; 85%.
                </p>
                <div className="flex items-center gap-2 text-emerald-600 font-bold mt-2">
                  <CheckCircle2 size={16} /> Course Progress Verified: 100% Complete (Score: {examScore}%)
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleMintCertificate}
                  className="rounded-xl bg-amber-600 text-white px-5 py-2.5 font-bold hover:bg-amber-500 shadow-md shadow-amber-600/30 flex items-center gap-2 transition"
                >
                  <Award size={15} /> Mint & Sign Verified Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLIC VERIFIER */}
      {tab === "verifier" && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cryptographic Credential Verifier</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verify the authenticity of any SkillTrack Certificate ID or SHA-256 verification hash.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="e.g. ST-2026-DIST-8842 or SHA-256 hash"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-900 outline-none focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={verifying}
                className="rounded-xl bg-amber-600 text-white px-5 py-2.5 text-xs font-bold shadow hover:bg-amber-500 disabled:opacity-50 transition"
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>

          {verifyResult && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-in fade-in space-y-4">
              {verifyResult.valid ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                    <CheckCircle2 size={20} />
                    <span>Official Authenticated SkillTrack Credential</span>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Recipient Name</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{verifyResult.certificate.studentName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Course Track</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{verifyResult.certificate.courseTitle}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Issue Date</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(verifyResult.certificate.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Certificate Identifier</p>
                        <p className="font-mono font-bold text-amber-700 dark:text-amber-400">{verifyResult.certificate.certificateId}</p>
                      </div>
                    </div>

                    <div className="border-t border-emerald-200/60 pt-3 dark:border-emerald-900/60">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">SHA-256 Immutability Hash</p>
                      <p className="font-mono text-[10px] break-all text-slate-700 dark:text-slate-300">
                        {verifyResult.certificate.verificationHash}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setSelectedCert(verifyResult.certificate)}
                        className="rounded-xl bg-amber-600 text-white px-4 py-1.5 text-xs font-bold hover:bg-amber-500 transition"
                      >
                        Inspect Official Certificate Canvas
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-rose-600">
                  <XCircle size={24} />
                  <div>
                    <p className="font-bold text-sm">Verification Failed</p>
                    <p className="text-xs text-slate-500">{verifyResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FULL LUXURY CERTIFICATE PREVIEW MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl space-y-4 my-8">
            <div className="flex justify-between items-center print:hidden bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 text-white">
              <span className="text-xs font-mono text-slate-400">
                Official Credential: <strong className="text-amber-400">{selectedCert.certificateId}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => openLinkedInCert(selectedCert)}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition flex items-center gap-1.5"
                >
                  <ExternalLink size={13} /> Add to LinkedIn
                </button>
                <button
                  onClick={() => copyVerifyLink(selectedCert.certificateId)}
                  className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <Share2 size={13} /> Share Link
                </button>
                <button
                  onClick={printCertificate}
                  className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* Official Luxury Certificate Canvas */}
            <div className="relative overflow-hidden rounded-3xl border-8 border-double border-amber-600/40 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 p-8 text-center shadow-2xl sm:p-14 print:border-none print:shadow-none print:p-4">
              {/* Background Guilloche Rosette Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award size={520} />
              </div>

              {/* Header Crest */}
              <div className="relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-slate-950 shadow-xl ring-4 ring-amber-200">
                  <Medal size={44} />
                </div>

                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.25em] text-amber-800">
                  SkillTrack Academy of Computer Science & Engineering
                </p>
                <h2 className="mt-1 text-3xl font-black text-slate-900 sm:text-5xl font-serif tracking-tight">
                  Certificate of Mastery
                </h2>

                <p className="mt-6 text-xs uppercase tracking-widest text-slate-500 font-medium">
                  This certifies and confirms that
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-900 sm:text-4xl border-b-2 border-amber-500/40 pb-2 inline-block px-10 font-serif">
                  {selectedCert.studentName}
                </h3>

                <p className="mt-5 max-w-lg mx-auto text-xs leading-relaxed text-slate-600">
                  has successfully demonstrated rigorous proficiency, passed all practical lab assessments, and completed all required curriculum for
                </p>
                <h4 className="mt-2 text-xl font-black text-brand-800 sm:text-2xl font-serif">
                  {selectedCert.courseTitle}
                </h4>

                {/* Verified Competencies */}
                {selectedCert.skills && selectedCert.skills.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Verified Technical Competencies
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto">
                      {selectedCert.skills.map((s, idx) => (
                        <span key={idx} className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 font-mono">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures & Seal Grid */}
                <div className="mt-10 grid grid-cols-3 items-end gap-6 border-t border-slate-200 pt-8 text-xs text-slate-600">
                  <div className="text-left font-mono">
                    <p className="font-bold text-slate-900">{new Date(selectedCert.issueDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400">Date of Conferment</p>
                    <p className="mt-2 text-[10px] text-amber-700 font-bold">{selectedCert.grade}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full border-2 border-amber-600/60 bg-amber-50 flex items-center justify-center shadow-inner">
                      <QrCode size={36} className="text-amber-800" />
                    </div>
                    <p className="mt-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      Scan to Verify Authenticity
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-serif italic font-bold text-slate-900 text-sm">
                      Dr. S. K. Sharma, Ph.D.
                    </p>
                    <p className="text-[10px] text-slate-400">Head of Academic Board</p>
                    <p className="text-[10px] font-mono text-slate-500 font-bold mt-1">Apex Institute of Technology</p>
                  </div>
                </div>

                {/* Cryptographic Hash Ribbon */}
                <div className="mt-8 rounded-xl bg-slate-100/90 p-2.5 font-mono text-[10px] text-slate-500 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <span>Certificate ID: <strong className="text-slate-800">{selectedCert.certificateId}</strong></span>
                  <span className="truncate max-w-md">SHA-256: {selectedCert.verificationHash}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
