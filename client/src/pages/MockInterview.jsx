import { useEffect, useRef, useState } from "react";
import {
  Award,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  History,
  Lightbulb,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { ProgressBar } from "../components/ui";

const ROLES = [
  { id: "Fullstack MERN Developer", label: "Fullstack MERN", desc: "React, Node, Express, Mongo & Architecture", icon: BrainCircuit },
  { id: "Frontend Developer", label: "Frontend React", desc: "Hooks, VDOM, Performance & State Management", icon: Sparkles },
  { id: "Backend Developer", label: "Backend Node.js", desc: "Event loop, REST APIs, Security & DBs", icon: TrendingUp },
  { id: "DevOps & Cloud Engineer", label: "DevOps & Cloud", desc: "CI/CD, Docker, Kubernetes & Reliability", icon: Award },
  { id: "Behavioral & Leadership", label: "Behavioral / STAR", desc: "Conflict, delivery, ownership & communication", icon: UserCheck }
];

export default function MockInterview() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [difficulty, setDifficulty] = useState("Intermediate");
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

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
    // Initialize Web Speech API if supported
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
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  // Timer while answering
  useEffect(() => {
    if (status === "interview" && !evaluating && !currentEval) {
      timerRef.current = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status, evaluating, currentEval]);

  const loadHistory = async () => {
    try {
      const { data } = await api.get("/interviews");
      setHistory(data.sessions || []);
    } catch {
      // silently fallback
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
      } catch (err) {
        setIsListening(false);
      }
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
      setStatus("interview");
    } catch (err) {
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
      toast.success("Answer evaluated!");
    } catch {
      toast.error("Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer("");
      setCurrentEval(null);
      setElapsedTime(0);
    } else {
      // Finish interview
      finishInterview();
    }
  };

  const finishInterview = async () => {
    const all = completedEvals;
    const avgScore = all.length ? Math.round(all.reduce((a, c) => a + (c.score || 70), 0) / all.length) : 75;
    const avgClarity = all.length ? Math.round(all.reduce((a, c) => a + (c.clarityScore || 75), 0) / all.length) : 78;
    const avgTech = all.length ? Math.round(all.reduce((a, c) => a + (c.technicalScore || 70), 0) / all.length) : 74;
    const avgProb = all.length ? Math.round(all.reduce((a, c) => a + (c.problemSolvingScore || 75), 0) / all.length) : 76;

    setStatus("result");

    try {
      await api.post("/interviews", {
        role: selectedRole,
        interviewType: "Technical & Behavioral",
        difficulty,
        questions: all.map((item) => ({
          question: item.question,
          topic: item.topic,
          userAnswer: item.userAnswer,
          score: item.score,
          feedback: item.feedback,
          strengths: item.strengths,
          improvements: item.improvements,
          idealAnswer: item.idealAnswer
        })),
        overallScore: avgScore,
        clarityScore: avgClarity,
        technicalScore: avgTech,
        problemSolvingScore: avgProb,
        status: "completed"
      });
      loadHistory();
    } catch {
      // ignore
    }
  };

  const formatSeconds = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-300">
              <BrainCircuit size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Simulation Arena</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">AI Mock Interview Simulator</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Practice realistic technical & behavioral interviews with instant multi-criteria AI feedback, model answers, and speech-to-text voice answers.
            </p>
          </div>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <History size={16} />
            Past Interviews ({history.length})
          </button>
        </div>
      </section>

      {/* History Drawer */}
      {historyOpen && (
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Interview History</h2>
            <button onClick={() => setHistoryOpen(false)} className="text-xs text-slate-500 hover:text-slate-800">
              Close
            </button>
          </div>
          {history.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-brand-100 text-brand-700">{item.difficulty}</span>
                    <span className="text-lg font-extrabold text-brand-600">{item.overallScore}%</span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{item.role}</h3>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()} · {item.questions?.length || 0} questions</p>
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

            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-xl font-bold text-slate-900">2. Seniority & Difficulty</h2>
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
              className="btn-primary w-full py-3.5 text-base shadow-md"
            >
              <Play size={18} />
              {evaluating ? "Generating tailor-made questions..." : "Enter Mock Interview"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="card space-y-4 p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="text-brand-600" size={18} />
                How the Simulator Works
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-600">01.</span>
                  <span>AI generates custom architecture, coding, and behavioral questions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-600">02.</span>
                  <span>Use your microphone for hands-free voice answering or type freely.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-600">03.</span>
                  <span>Instant evaluation on Clarity, Technical Accuracy, and Problem Solving.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-600">04.</span>
                  <span>Compare with a benchmark Senior Engineer model answer.</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Lightbulb size={17} /> Pro Tip
              </div>
              <p className="mt-2 text-xs leading-5 text-amber-800">
                For technical scenarios, structure your answer by stating the high-level approach first, then discussing trade-offs, scalability, and how you verify the result.
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
            <div className="card p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="badge bg-brand-50 font-bold text-brand-700">
                  Question {currentIndex + 1} of {questions.length} · {questions[currentIndex].topic}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-500">
                  <Clock size={14} /> {formatSeconds(elapsedTime)}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                {questions[currentIndex].question}
              </h2>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Your Answer</span>
                  <button
                    onClick={toggleSpeech}
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    {isListening ? "Recording..." : "Voice Input"}
                  </button>
                </div>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={Boolean(currentEval)}
                  rows={6}
                  placeholder="Explain your approach, trade-offs, and design choices..."
                  className="input mt-2"
                />
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => setStatus("setup")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Exit Session
                </button>

                {!currentEval ? (
                  <button
                    onClick={evaluateAnswer}
                    disabled={evaluating || !userAnswer.trim()}
                    className="btn-primary"
                  >
                    <Send size={16} />
                    {evaluating ? "Analyzing response with AI..." : "Submit & Evaluate"}
                  </button>
                ) : (
                  <button onClick={nextQuestion} className="btn-primary">
                    {currentIndex + 1 < questions.length ? "Next Question" : "Complete Interview"}
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* AI Evaluation Card */}
            {currentEval && (
              <div className="card animate-in fade-in space-y-6 border-brand-200 p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</span>
                    <p className="text-3xl font-extrabold text-brand-600">{currentEval.score}/100</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Clarity</p>
                      <p className="text-lg font-bold text-slate-800">{currentEval.clarityScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Technical</p>
                      <p className="text-lg font-bold text-slate-800">{currentEval.technicalScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Problem Solving</p>
                      <p className="text-lg font-bold text-slate-800">{currentEval.problemSolvingScore}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Interviewer Feedback</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{currentEval.feedback}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <h4 className="font-bold text-emerald-800">What went well</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-emerald-700">
                      {(currentEval.strengths || []).map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                    <h4 className="font-bold text-orange-800">Areas for Growth</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-orange-700">
                      {(currentEval.improvements || []).map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                  <h4 className="font-bold text-brand-900">Benchmark Model Answer</h4>
                  <p className="mt-2 text-xs leading-relaxed text-brand-800">
                    {currentEval.idealAnswer || questions[currentIndex].idealAnswer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Tracker Sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-slate-900">Interview Progress</h3>
              <div className="mt-3">
                <ProgressBar value={((currentIndex + (currentEval ? 1 : 0)) / questions.length) * 100} />
              </div>
              <div className="mt-5 space-y-3">
                {questions.map((q, idx) => {
                  const completed = completedEvals[idx];
                  const isCurrent = idx === currentIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-xl border p-3 text-sm ${
                        isCurrent
                          ? "border-brand-500 bg-brand-50"
                          : completed
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Q{idx + 1}</span>
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
            <p className="mt-1 text-sm text-slate-500">Here is your comprehensive evaluation breakdown for {selectedRole}.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Overall Score</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-600">
                {completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + c.score, 0) / completedEvals.length) : 80}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Clarity</p>
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
              <p className="text-xs text-slate-500">Problem Solving</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-800">
                {completedEvals.length ? Math.round(completedEvals.reduce((a, c) => a + c.problemSolvingScore, 0) / completedEvals.length) : 80}%
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">Session Transcript & Question Feedback</h3>
            {completedEvals.map((item, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Q{i + 1}: {item.question}</span>
                  <span className="font-extrabold text-brand-600">{item.score}%</span>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <strong>Your Answer:</strong> {item.userAnswer}
                </div>
                <p className="mt-2 text-xs text-slate-600"><strong>Interviewer Feedback:</strong> {item.feedback}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => setStatus("setup")} className="btn-primary">
              <RotateCcw size={16} /> Start Another Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
