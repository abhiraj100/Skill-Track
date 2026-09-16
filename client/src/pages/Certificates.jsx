import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [tab, setTab] = useState("my-certs"); // 'my-certs' | 'verifier'

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certificates");
      setCertificates(data.certificates || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!verifyCode.trim()) return toast.error("Please enter a certificate ID or verification hash");

    setVerifying(true);
    setVerifyResult(null);
    try {
      const { data } = await api.get(`/certificates/verify/${encodeURIComponent(verifyCode.trim())}`);
      setVerifyResult(data);
      toast.success("Certificate verified successfully!");
    } catch (err) {
      setVerifyResult({ valid: false, message: err.response?.data?.message || "Invalid or unverifiable certificate." });
      toast.error("Certificate not found");
    } finally {
      setVerifying(false);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-amber-600 to-orange-600 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100">
              <Award size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Official Credentials</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Certificates & Verification</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-amber-50">
              Earn verifiable course completion credentials by mastering all lessons. Employers and peers can cryptographically verify your achievements.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("my-certs")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === "my-certs" ? "bg-white text-amber-800 shadow" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              My Certificates ({certificates.length})
            </button>
            <button
              onClick={() => setTab("verifier")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === "verifier" ? "bg-white text-amber-800 shadow" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Public Verifier
            </button>
          </div>
        </div>
      </section>

      {/* MY CERTIFICATES TAB */}
      {tab === "my-certs" && (
        <div>
          {loading ? (
            <div className="py-20 text-center text-slate-500">Loading your credentials...</div>
          ) : certificates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="card group flex flex-col justify-between overflow-hidden border-amber-200/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                        <Award size={22} />
                      </span>
                      <span className="badge bg-emerald-50 text-emerald-700 font-bold">
                        {cert.grade}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{cert.courseTitle}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Issued to <strong className="text-slate-800">{cert.studentName}</strong> on {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-slate-400">
                      ID: {cert.certificateId}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      View Certificate
                    </button>
                    <button
                      onClick={() => {
                        setVerifyCode(cert.certificateId);
                        setTab("verifier");
                      }}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                      title="Verify Authenticity"
                    >
                      <ShieldCheck size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Award size={48} className="mx-auto text-amber-500" />
              <h3 className="mt-4 text-xl font-bold text-slate-900">No Certificates Earned Yet</h3>
              <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">
                Complete 100% of any enrolled course to unlock your official verified certificate of completion.
              </p>
              <Link to="/courses" className="btn-primary mt-5">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      )}

      {/* PUBLIC VERIFIER TAB */}
      {tab === "verifier" && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="card p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Cryptographic Credential Verifier</h2>
                <p className="text-xs text-slate-500">
                  Verify the authenticity of any SkillTrack Certificate ID or sha256 verification hash.
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
                  placeholder="e.g. ST-2026-ABCD1234 or SHA-256 hash"
                  className="input pl-10"
                />
              </div>
              <button type="submit" disabled={verifying} className="btn-primary px-5">
                {verifying ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>

          {verifyResult && (
            <div className="card p-6 sm:p-8 animate-in fade-in space-y-5">
              {verifyResult.valid ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 size={24} />
                    <span className="text-lg font-bold">Authentic Verified Certificate</span>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500">Student Name</p>
                        <p className="font-bold text-slate-900 text-sm">{verifyResult.certificate.studentName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Course</p>
                        <p className="font-bold text-slate-900 text-sm">{verifyResult.certificate.courseTitle}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Issue Date</p>
                        <p className="font-semibold text-slate-800">
                          {new Date(verifyResult.certificate.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Certificate ID</p>
                        <p className="font-mono font-bold text-brand-600">{verifyResult.certificate.certificateId}</p>
                      </div>
                    </div>

                    <div className="border-t border-emerald-200/50 pt-3">
                      <p className="text-[11px] text-slate-500">Cryptographic Hash</p>
                      <p className="font-mono text-[10px] break-all text-slate-600">
                        {verifyResult.certificate.verificationHash}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-rose-600">
                  <XCircle size={24} />
                  <div>
                    <p className="font-bold">Verification Failed</p>
                    <p className="text-xs text-slate-500">{verifyResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FULL CERTIFICATE PREVIEW MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl space-y-4">
            <div className="flex justify-end gap-2 print:hidden">
              <button onClick={printCertificate} className="btn-primary text-xs">
                <Printer size={14} /> Print / Download PDF
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close ✕
              </button>
            </div>

            {/* Official Certificate Canvas */}
            <div className="rounded-3xl border-8 border-double border-amber-600/30 bg-white p-8 text-center shadow-2xl sm:p-12 print:border-none print:shadow-none relative overflow-hidden">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-inner">
                <Award size={36} />
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-700">
                SkillTrack Academy · Verified Credential
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl font-serif">
                Certificate of Completion
              </h2>

              <p className="mt-6 text-sm text-slate-500">This certifies that</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 inline-block px-8">
                {selectedCert.studentName}
              </h3>

              <p className="mt-4 text-sm text-slate-500">has successfully demonstrated mastery and completed all requirements for</p>
              <h4 className="mt-2 text-xl font-extrabold text-brand-700">
                {selectedCert.courseTitle}
              </h4>

              <div className="mt-8 flex flex-wrap items-center justify-around gap-6 border-t border-slate-100 pt-6 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-800">{new Date(selectedCert.issueDate).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-400">Issue Date</p>
                </div>
                <div>
                  <p className="font-serif italic font-bold text-slate-800 text-sm">SkillTrack Academic Board</p>
                  <p className="text-[10px] text-slate-400">Authorized Signature</p>
                </div>
                <div>
                  <p className="font-mono font-bold text-slate-800">{selectedCert.certificateId}</p>
                  <p className="text-[10px] text-slate-400">Certificate Identifier</p>
                </div>
              </div>

              <div className="mt-6 text-[10px] text-slate-400 font-mono">
                Verification Hash: {selectedCert.verificationHash?.slice(0, 32)}...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
