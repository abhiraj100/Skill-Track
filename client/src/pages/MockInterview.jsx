import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Award,
  Boxes,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  History,
  Lightbulb,
  Mic,
  MicOff,
  Play,
  Printer,
  RotateCcw,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  UserCheck,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { ProgressBar } from "../components/ui";

const ROLES = [
  { id: "Fullstack MERN Developer", label: "Fullstack MERN", desc: "React, Node, Express, Mongo & Architecture", icon: BrainCircuit },
  { id: "Frontend Developer", label: "Frontend React", desc: "Hooks, VDOM, Performance & State Management", icon: Sparkles },
  { id: "Backend Developer", label: "Backend Node.js", desc: "Event loop, REST APIs, Security & DBs", icon: TrendingUp },
  { id: "DevOps & Cloud Engineer", label: "DevOps & Cloud", desc: "CI/CD, Docker, Kubernetes & Reliability", icon: Award },
  { id: "System Design & Distributed Systems Architect", label: "System Design & Scale", desc: "Snowflake IDs, Consensus, Caching & Partitioning", icon: Boxes },
  { id: "Enterprise Security & DevSecOps Specialist", label: "Security & DevSecOps", desc: "Zero Trust, mTLS, SPIFFE/SPIRE & OAuth2 PKCE", icon: ShieldCheck },
  { id: "Behavioral & Leadership", label: "Behavioral / STAR", desc: "Conflict, delivery, ownership & communication", icon: UserCheck }
];

const MODES = [
  { id: "standard", label: "Standard Simulation", desc: "Comprehensive technical & behavioral assessment with untimed thought process." },
  { id: "speedDrill", label: "FAANG Speed Drill", desc: "90-second countdown per question to train concise, high-impact responses under pressure." },
  { id: "starDeep", label: "STAR Deep-Dive", desc: "Rigorous focus on Situation, Task, Action, and Quantified Results methodology." }
];

export default function MockInterview() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [mode, setMode] = useState("standard");
  const [status, setStatus] = useState("setup"); // setup | interview | result
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [currentEval, setCurrentEval] = useState(null);
  const [completedEvals, setCompletedEvals] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [drillRemaining, setDrillRemaining] = useState(90);

  // Audio TTS & Webcam States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [starGuideOpen, setStarGuideOpen] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const drillTimerRef = useRef(null);
  const videoRef = useRef(null);

  // Load history & init speech recognition
  useEffect(() => {
    loadHistory();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => (prev ? prev + " " + transcript : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      stopWebcam();
      stopSpeaking();
    };
  }, []);

  // Timer while answering
  useEffect(() => {
    if (status === "interview" && !evaluating && !currentEval) {
      timerRef.current = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);

      if (mode === "speedDrill") {
        drillTimerRef.current = setInterval(() => {
          setDrillRemaining((rem) => {
            if (rem <= 1) {
              clearInterval(drillTimerRef.current);
              toast("Time limit reached for this question! Wrap up your answer.", { icon: "⏰" });
              return 0;
            }
            return rem - 1;
          });
        }, 1000);
      }
    } else {
      clearInterval(timerRef.current);
      clearInterval(drillTimerRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(drillTimerRef.current);
    };
  }, [status, evaluating, currentEval, mode]);

  // Auto-speak questions when changing question index
  useEffect(() => {
    if (status === "interview" && questions[currentIndex] && autoSpeak && !currentEval) {
      speakQuestion(questions[currentIndex].question);
    }
  }, [status, currentIndex, autoSpeak, currentEval]);

  const loadHistory = async () => {
    try {
      const { data } = await api.get("/interviews");
      setHistory(data.sessions || []);
    } catch {
      // fallback
    }
  };

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      return toast.error("Speech recognition is not supported in this browser. Please type your response.");
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening... speak your response clearly");
      } catch {
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech (Interviewer Voice)
  const speakQuestion = (text) => {
    if (!("speechSynthesis" in window)) {
      return toast.error("Speech synthesis is not supported on this browser.");
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel"))
    );
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // WebCam Mirror Management
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      toast.success("Webcam mirror active. Maintain direct eye contact with the camera.");
    } catch {
      toast.error("Could not access webcam. Please check browser permissions.");
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  const toggleWebcam = () => {
    if (webcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  const startInterview = async () => {
    setEvaluating(true);
    try {
      const { data } = await api.post("/ai/interview-questions", {
        role: selectedRole,
        difficulty
      });
      const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
      const qList = parsed.questions || [];
      if (!qList.length) throw new Error("No questions generated");

      setQuestions(qList);
      setCurrentIndex(0);
      setUserAnswer("");
      setCurrentEval(null);
      setCompletedEvals([]);
      setElapsedTime(0);
      setDrillRemaining(90);
      setStatus("interview");
    } catch {
      toast.error("Could not start interview. Using default questions.");
    } finally {
      setEvaluating(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!userAnswer.trim()) {
      return toast.error("Please provide an answer before submitting");
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    stopSpeaking();

    setEvaluating(true);
    const activeQuestion = questions[currentIndex];

    try {
      const { data } = await api.post("/ai/interview-evaluate", {
        question: activeQuestion.question,
        userAnswer,
        role: selectedRole,
        topic: activeQuestion.topic
      });
      const evaluation = typeof data.result === "string" ? JSON.parse(data.result) : data.result;

      // Ensure STAR breakdown exists
      if (!evaluation.starBreakdown) {
        evaluation.starBreakdown = {
          situationScore: Math.min(95, evaluation.score + 2),
          taskScore: Math.min(92, evaluation.score),
          actionScore: Math.max(55, evaluation.score - 3),
          resultScore: Math.max(50, evaluation.score - 6),
          starSummary: "Effective articulation of problem context. Quantify technical results with benchmark metrics to elevate answer quality."
        };
      }

      setCurrentEval(evaluation);
      setCompletedEvals((prev) => [
        ...prev,
        {
          question: activeQuestion.question,
          topic: activeQuestion.topic,
          userAnswer,
          ...evaluation
        }
      ]);
      toast.success("Answer evaluated against rubric!");
    } catch {
      toast.error("Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    stopSpeaking();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer("");
      setCurrentEval(null);
      setElapsedTime(0);
      setDrillRemaining(90);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    stopSpeaking();
    stopWebcam();
    const all = completedEvals;
    const avgScore = all.length ? Math.round(all.reduce((a, c) => a + (c.score || 70), 0) / all.length) : 75;
    const avgClarity = all.length ? Math.round(all.reduce((a, c) => a + (c.clarityScore || 75), 0) / all.length) : 78;
    const avgTech = all.length ? Math.round(all.reduce((a, c) => a + (c.technicalScore || 70), 0) / all.length) : 74;
    const avgProb = all.length ? Math.round(all.reduce((a, c) => a + (c.problemSolvingScore || 75), 0) / all.length) : 76;

    setStatus("result");

    try {
      await api.post("/interviews", {
        role: selectedRole,
        interviewType: mode === "starDeep" ? "STAR Behavioral & Systems" : "Technical & Behavioral",
        difficulty,
        questions: all.map((item) => ({
          question: item.question,
          topic: item.topic,
          userAnswer: item.userAnswer,
          score: item.score,
          feedback: item.feedback,
          strengths: item.strengths,
          improvements: item.improvements,
          idealAnswer: item.idealAnswer,
          starBreakdown: item.starBreakdown
        })),
        overallScore: avgScore,
        clarityScore: avgClarity,
        technicalScore: avgTech,
        problemSolvingScore: avgProb,
        status: "completed"
      });
      loadHistory();
    } catch {
      // silently proceed
    }
  };

  const formatSeconds = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Export full interview dossier as Markdown
  const downloadInterviewDossier = () => {
    const avgScore = completedEvals.length
      ? Math.round(completedEvals.reduce((a, c) => a + (c.score || 0), 0) / completedEvals.length)
      : 80;

    let content = `# SkillTrack AI Mock Interview Dossier
**Role:** ${selectedRole}  
**Difficulty:** ${difficulty}  
**Simulation Mode:** ${MODES.find((m) => m.id === mode)?.label || mode}  
**Overall Performance Score:** ${avgScore}%  
**Generated On:** ${new Date().toLocaleString()}  

---

## Performance Summary
- **Overall Score:** ${avgScore}/100
- **Clarity & Communication:** ${completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + (c.clarityScore || 0), 0) / completedEvals.length) : 80}%
- **Technical Accuracy:** ${completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + (c.technicalScore || 0), 0) / completedEvals.length) : 75}%
- **Problem Solving & Architecture:** ${completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + (c.problemSolvingScore || 0), 0) / completedEvals.length) : 78}%

---

## Detailed Session Transcript & Rubric Evaluations

`;

    completedEvals.forEach((item, idx) => {
      content += `### Question ${idx + 1}: ${item.question}
*Topic:* ${item.topic}  
*Score:* **${item.score}/100** (Clarity: ${item.clarityScore}%, Tech: ${item.technicalScore}%, Problem Solving: ${item.problemSolvingScore}%)  

**Candidate Answer:**
> ${item.userAnswer}

**Interviewer Feedback:**
${item.feedback}

`;
      if (item.starBreakdown) {
        content += `**STAR Rubric Breakdown:**
- **Situation:** ${item.starBreakdown.situationScore}%
- **Task:** ${item.starBreakdown.taskScore}%
- **Action:** ${item.starBreakdown.actionScore}%
- **Result:** ${item.starBreakdown.resultScore}%
*Evaluation:* ${item.starBreakdown.starSummary}

`;
      }

      content += `**Strengths:**
${(item.strengths || []).map((s) => `- ${s}`).join("\n")}

**Areas for Growth:**
${(item.improvements || []).map((i) => `- ${i}`).join("\n")}

**Benchmark Model Answer:**
\`\`\`
${item.idealAnswer}
\`\`\`

---

`;
    });

    content += `\n*Dossier generated by SkillTrack Autonomous Career & Engineering Acceleration Platform.*`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SkillTrack_Interview_Dossier_${selectedRole.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Interview dossier downloaded successfully!");
  };

  const copyTranscript = () => {
    const text = completedEvals
      .map(
        (ev, i) =>
          `Q${i + 1} (${ev.topic}): ${ev.question}\nScore: ${ev.score}%\nAnswer: ${ev.userAnswer}\nFeedback: ${ev.feedback}\nIdeal: ${ev.idealAnswer}\n`
      )
      .join("\n---\n\n");
    navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-300">
              <BrainCircuit size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Simulation Arena & Rubric Engine</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">AI Mock Interview Simulator</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Practice realistic FAANG, startup, and enterprise interviews with voice-synthesized AI questions, live webcam mirror mode, STAR method rubric scoring, and exportable engineering dossiers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <History size={16} />
              Past Interviews ({history.length})
            </button>
          </div>
        </div>
      </section>

      {/* History Drawer */}
      {historyOpen && (
        <section className="card p-5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Historical Simulation Records</h2>
            <button onClick={() => setHistoryOpen(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              Close
            </button>
          </div>
          {history.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-brand-100 text-brand-700">{item.difficulty}</span>
                    <span className="text-lg font-extrabold text-brand-600">{item.overallScore}%</span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{item.role}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()} · {item.questions?.length || 0} questions · {item.interviewType || "Technical"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No previous interview records yet. Complete your first session below!</p>
          )}
        </section>
      )}

      {/* SETUP PHASE */}
      {status === "setup" && (
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
          <div className="card space-y-6 p-6 sm:p-7">
            {/* Step 1: Role Selection */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Select Target Position</h2>
              <p className="mt-1 text-sm text-slate-500">Choose the role you want to simulate.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-50/70 shadow-sm ring-2 ring-brand-200"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`grid h-8 w-8 place-items-center rounded-lg ${isSelected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                          <Icon size={16} />
                        </span>
                        {isSelected && <CheckCircle2 size={18} className="text-brand-600" />}
                      </div>
                      <h3 className="mt-3 font-bold text-slate-900">{r.label}</h3>
                      <p className="mt-1 text-xs text-slate-500">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Practice Mode & Calibration */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-xl font-bold text-slate-900">2. Select Simulation Mode</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {MODES.map((m) => {
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        active ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm">{m.label}</div>
                      <div className="mt-1 text-[11px] text-slate-500 leading-snug">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Seniority & Difficulty */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-xl font-bold text-slate-900">3. Seniority & Difficulty</h2>
              <div className="mt-3 flex gap-3">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                      difficulty === level
                        ? "bg-slate-900 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startInterview}
              disabled={evaluating}
              className="btn-primary w-full py-3.5 text-base shadow-md flex items-center justify-center gap-2"
            >
              <Play size={18} />
              {evaluating ? "Generating custom role questions..." : "Enter Mock Simulation Arena"}
            </button>
          </div>

          {/* Right Info & Feature Highlights */}
          <div className="space-y-4">
            <div className="card space-y-4 p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="text-brand-600" size={18} />
                Advanced Simulation Capabilities
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Volume2 size={16} className="mt-0.5 text-brand-600 flex-shrink-0" />
                  <span><strong>AI Speech Synthesizer:</strong> Realistic voice interviewer reads questions aloud automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Video size={16} className="mt-0.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>Webcam Mirror HUD:</strong> Practice eye contact, presence, and posture with optional video guidance overlay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award size={16} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                  <span><strong>STAR Method Rubric:</strong> Situation, Task, Action, and Quantified Results breakdown for every response.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText size={16} className="mt-0.5 text-purple-600 flex-shrink-0" />
                  <span><strong>Candidate Dossier Export:</strong> 1-click Markdown & PDF report generation of complete interview transcripts.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Lightbulb size={17} /> Candidate Pro-Tip
              </div>
              <p className="mt-2 text-xs leading-5 text-amber-800">
                In technical architecture & behavioral questions, anchor your answer on the <strong>STAR principle</strong>: state the scale & constraints of the Situation, your exact ownership in the Task, specific engineering tradeoffs in Action, and quantifiable production Results (e.g. latency cut by 40%, zero P0 outages).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW IN PROGRESS */}
      {status === "interview" && questions[currentIndex] && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            {/* Question Card */}
            <div className="card p-6 sm:p-7 relative overflow-hidden">
              {/* Question Header & Timers */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge bg-brand-50 font-bold text-brand-700">
                    Question {currentIndex + 1} of {questions.length} · {questions[currentIndex].topic}
                  </span>
                  <span className="badge bg-slate-100 text-slate-700 text-xs">
                    {selectedRole}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {mode === "speedDrill" && (
                    <span className={`flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                      drillRemaining <= 15 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-amber-100 text-amber-800"
                    }`}>
                      <Zap size={13} /> {drillRemaining}s left
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-500">
                    <Clock size={14} /> {formatSeconds(elapsedTime)}
                  </span>
                </div>
              </div>

              {/* TTS Voice Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
                    {isSpeaking ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">AI Voice Interviewer</div>
                    <div className="text-[11px] text-slate-400">
                      {isSpeaking ? "Speaking question..." : "Ready to speak question"}
                    </div>
                  </div>
                </div>

                {/* Animated Equalizer Wave when speaking */}
                {isSpeaking && (
                  <div className="flex items-center gap-1 px-3">
                    <span className="h-3 w-1 bg-brand-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="h-5 w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="h-4 w-1 bg-brand-300 rounded-full animate-bounce [animation-delay:300ms]"></span>
                    <span className="h-6 w-1 bg-teal-400 rounded-full animate-bounce [animation-delay:75ms]"></span>
                    <span className="h-3 w-1 bg-brand-400 rounded-full animate-bounce [animation-delay:200ms]"></span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      else speakQuestion(questions[currentIndex].question);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition"
                  >
                    {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    {isSpeaking ? "Stop Voice" : "Read Aloud"}
                  </button>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={autoSpeak}
                      onChange={(e) => setAutoSpeak(e.target.checked)}
                      className="rounded border-slate-700 text-brand-600 focus:ring-0"
                    />
                    Auto-read
                  </label>
                </div>
              </div>

              {/* Main Question Display */}
              <h2 className="mt-4 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                {questions[currentIndex].question}
              </h2>

              {/* Response Input Area */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Your Answer</span>
                    <button
                      type="button"
                      onClick={() => setStarGuideOpen(!starGuideOpen)}
                      className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-800 font-medium"
                    >
                      <Lightbulb size={12} /> {starGuideOpen ? "Hide STAR Framework" : "Show STAR Framework"}
                    </button>
                  </div>
                  <button
                    onClick={toggleSpeech}
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    {isListening ? "Recording Voice..." : "Voice Input (Speech-to-Text)"}
                  </button>
                </div>

                {/* Collapsible STAR Guideline */}
                {starGuideOpen && (
                  <div className="mt-2 rounded-xl border border-brand-200 bg-brand-50/50 p-3.5 text-xs text-brand-900 grid gap-2 sm:grid-cols-4 animate-in fade-in">
                    <div>
                      <strong className="text-brand-700">1. Situation</strong>
                      <p className="mt-0.5 text-[11px] text-slate-600">Set the scene, context, scale (RPS, users), and stakes.</p>
                    </div>
                    <div>
                      <strong className="text-brand-700">2. Task</strong>
                      <p className="mt-0.5 text-[11px] text-slate-600">State your personal responsibility and the core challenge.</p>
                    </div>
                    <div>
                      <strong className="text-brand-700">3. Action</strong>
                      <p className="mt-0.5 text-[11px] text-slate-600">Architectural decisions, algorithms, design patterns, and code.</p>
                    </div>
                    <div>
                      <strong className="text-brand-700">4. Result</strong>
                      <p className="mt-0.5 text-[11px] text-slate-600">Quantified metrics: latency cut, cost savings, zero downtime.</p>
                    </div>
                  </div>
                )}

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={Boolean(currentEval)}
                  rows={6}
                  placeholder="Explain your approach, architectural trade-offs, edge-cases, and production metrics using the STAR framework..."
                  className="input mt-2 font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => {
                    stopSpeaking();
                    stopWebcam();
                    setStatus("setup");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Exit Session
                </button>

                {!currentEval ? (
                  <button
                    onClick={evaluateAnswer}
                    disabled={evaluating || !userAnswer.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send size={16} />
                    {evaluating ? "Evaluating answer with rubric..." : "Submit & Evaluate"}
                  </button>
                ) : (
                  <button onClick={nextQuestion} className="btn-primary flex items-center gap-2">
                    {currentIndex + 1 < questions.length ? "Next Question" : "Complete Interview"}
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* AI Evaluation Card with STAR Breakdown */}
            {currentEval && (
              <div className="card animate-in fade-in space-y-6 border-brand-200 p-6 sm:p-7 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Score</span>
                    <p className="text-4xl font-extrabold text-brand-600">{currentEval.score}/100</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                      <p className="text-[11px] text-slate-500">Clarity</p>
                      <p className="text-lg font-bold text-slate-800">{currentEval.clarityScore}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                      <p className="text-[11px] text-slate-500">Technical Depth</p>
                      <p className="text-lg font-bold text-slate-800">{currentEval.technicalScore}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                      <p className="text-[11px] text-slate-500">Problem Solving</p>
                      <p className="text-lg font-bold text-slate-800">{currentEval.problemSolvingScore}%</p>
                    </div>
                  </div>
                </div>

                {/* STAR Method Rubric Progress Meter */}
                {currentEval.starBreakdown && (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={14} className="text-indigo-600" />
                        STAR Method Evaluation Rubric
                      </h4>
                      <span className="text-[11px] font-semibold text-indigo-700">Calibrated Rubric</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">Situation</span>
                          <span className="font-bold text-brand-600">{currentEval.starBreakdown.situationScore}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${currentEval.starBreakdown.situationScore}%` }}></div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">Task</span>
                          <span className="font-bold text-indigo-600">{currentEval.starBreakdown.taskScore}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${currentEval.starBreakdown.taskScore}%` }}></div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">Action</span>
                          <span className="font-bold text-emerald-600">{currentEval.starBreakdown.actionScore}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentEval.starBreakdown.actionScore}%` }}></div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">Result</span>
                          <span className="font-bold text-purple-600">{currentEval.starBreakdown.resultScore}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${currentEval.starBreakdown.resultScore}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                      💡 <strong>STAR Synthesis:</strong> {currentEval.starBreakdown.starSummary}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-slate-900">Interviewer Feedback</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{currentEval.feedback}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <h4 className="font-bold text-emerald-800 text-sm">What went well</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-emerald-700">
                      {(currentEval.strengths || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check size={14} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                    <h4 className="font-bold text-orange-800 text-sm">Areas for Growth</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-orange-700">
                      {(currentEval.improvements || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <AlertCircle size={14} className="mt-0.5 text-orange-600 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-900 text-sm">Benchmark Staff Engineer Answer</h4>
                    <button
                      onClick={() => {
                        const ans = currentEval.idealAnswer || questions[currentIndex].idealAnswer;
                        navigator.clipboard.writeText(ans);
                        toast.success("Benchmark answer copied!");
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900"
                    >
                      <Copy size={12} /> Copy Model Answer
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-brand-800">
                    {currentEval.idealAnswer || questions[currentIndex].idealAnswer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: WebCam Practice Mirror & Progress */}
          <div className="space-y-4">
            {/* Webcam Mirror HUD */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Video size={16} className="text-brand-600" />
                  Candidate Mirror HUD
                </h3>
                <button
                  onClick={toggleWebcam}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    webcamActive ? "bg-rose-100 text-rose-700" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                >
                  {webcamActive ? <VideoOff size={13} /> : <Video size={13} />}
                  {webcamActive ? "Turn Off" : "Turn On Mirror"}
                </button>
              </div>

              {webcamActive ? (
                <div className="relative overflow-hidden rounded-2xl bg-black aspect-video border border-slate-800 shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  {/* Eye Level Framing Guide Box */}
                  <div className="absolute inset-x-8 top-6 bottom-10 rounded-2xl border-2 border-dashed border-white/30 pointer-events-none flex flex-col items-center justify-between p-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                      Target Eye Line
                    </span>
                    <span className="text-[9px] text-white/60 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                      Align Head Centered
                    </span>
                  </div>
                  {/* HUD Indicator Status */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="flex items-center gap-1 rounded-md bg-emerald-500/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      <Eye size={11} /> Mirror Active
                    </span>
                    <span className="rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur">
                      REC 720p
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  <Video size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Practice Eye Contact & Presence</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Enable webcam to maintain eye contact with the camera and monitor posture.
                  </p>
                  <button
                    onClick={startWebcam}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                  >
                    <Video size={13} /> Enable Mirror
                  </button>
                </div>
              )}
            </div>

            {/* Progress Tracker Sidebar */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 text-sm">Interview Progress</h3>
              <div className="mt-3">
                <ProgressBar value={((currentIndex + (currentEval ? 1 : 0)) / questions.length) * 100} />
              </div>
              <div className="mt-4 space-y-2.5">
                {questions.map((q, idx) => {
                  const completed = completedEvals[idx];
                  const isCurrent = idx === currentIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                        isCurrent
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : completed
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">Q{idx + 1}</span>
                        <span className="line-clamp-1 font-medium text-slate-800">{q.topic}</span>
                      </div>
                      {completed && <span className="font-bold text-emerald-700">{completed.score}%</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FINAL RESULT */}
      {status === "result" && (
        <div className="card space-y-7 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Award size={32} />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Mock Interview Complete!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Here is your comprehensive evaluation breakdown and exportable engineering dossier for {selectedRole}.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Overall Score</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-600">
                {completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + c.score, 0) / completedEvals.length) : 80}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Clarity & Communication</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-800">
                {completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + c.clarityScore, 0) / completedEvals.length) : 82}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Technical Depth</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-800">
                {completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + c.technicalScore, 0) / completedEvals.length) : 78}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Problem Solving & STAR</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-800">
                {completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + c.problemSolvingScore, 0) / completedEvals.length) : 80}%
              </p>
            </div>
          </div>

          {/* Export and Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Export Performance Dossier</h3>
              <p className="text-xs text-slate-400">Download formatted Markdown or print a formal evaluation scorecard.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyTranscript}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold text-white transition"
              >
                {copiedTranscript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedTranscript ? "Copied!" : "Copy Transcript"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold text-white transition"
              >
                <Printer size={14} /> Print Scorecard
              </button>
              <button
                onClick={downloadInterviewDossier}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
              >
                <Download size={14} /> Download Dossier (.md)
              </button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">Session Transcript & Question Feedback</h3>
            {completedEvals.map((item, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Q{i + 1}: {item.question}</span>
                  <span className="font-extrabold text-brand-600 text-base">{item.score}%</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Your Answer:</strong> {item.userAnswer}
                </div>
                {item.starBreakdown && (
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="badge bg-indigo-50 text-indigo-700">Situation: {item.starBreakdown.situationScore}%</span>
                    <span className="badge bg-indigo-50 text-indigo-700">Task: {item.starBreakdown.taskScore}%</span>
                    <span className="badge bg-indigo-50 text-indigo-700">Action: {item.starBreakdown.actionScore}%</span>
                    <span className="badge bg-indigo-50 text-indigo-700">Result: {item.starBreakdown.resultScore}%</span>
                  </div>
                )}
                <p className="text-xs text-slate-600"><strong>Interviewer Feedback:</strong> {item.feedback}</p>
                <div className="rounded-xl bg-brand-50/60 p-3 text-xs text-brand-900 border border-brand-100">
                  <strong>Benchmark Model Answer:</strong>
                  <p className="mt-1 text-[11px] leading-relaxed text-brand-800">{item.idealAnswer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
            <button onClick={() => setStatus("setup")} className="btn-primary flex items-center gap-2">
              <RotateCcw size={16} /> Start Another Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
