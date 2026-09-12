import { useEffect, useRef, useState } from "react";
import { BrainCircuit, Crown, Play, RotateCcw, Timer, Trophy, Zap } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const settings = {
  easy: { label: "Easy", seconds: 45, points: 10, description: "Addition & subtraction" },
  medium: { label: "Medium", seconds: 60, points: 15, description: "Add, subtract & multiply" },
  hard: { label: "Hard", seconds: 75, points: 25, description: "Mixed operations & division" }
};

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function createQuestion(difficulty) {
  const level = settings[difficulty];
  if (difficulty === "easy") {
    const a = random(8, 50), b = random(3, 40), addition = Math.random() > .45;
    return addition ? { text: `${a} + ${b}`, answer: a + b } : { text: `${Math.max(a, b)} − ${Math.min(a, b)}`, answer: Math.abs(a - b) };
  }
  if (difficulty === "medium") {
    const operation = random(0, 2), a = random(8, 75), b = random(3, 20);
    if (operation === 0) return { text: `${a} + ${b}`, answer: a + b };
    if (operation === 1) return { text: `${Math.max(a, b)} − ${Math.min(a, b)}`, answer: Math.abs(a - b) };
    return { text: `${random(3, 12)} × ${random(3, 12)}`, answer: 0, compute: "multiply" };
  }
  const operation = random(0, 3), a = random(12, 99), b = random(3, 20);
  if (operation === 0) { const subtractor = random(2, 15); return { text: `${a} + ${b} − ${subtractor}`, answer: a + b - subtractor }; }
  if (operation === 1) { const left = random(4, 15), right = random(3, 12), extra = random(2, 20); return { text: `${left} × ${right} + ${extra}`, answer: left * right + extra }; }
  if (operation === 2) { const divisor = random(3, 12), quotient = random(3, 15); return { text: `${divisor * quotient} ÷ ${divisor}`, answer: quotient }; }
  return { text: `${a} − ${b}`, answer: a - b };
}

function resolvedQuestion(difficulty) {
  const question = createQuestion(difficulty);
  if (question.compute === "multiply") {
    const [left, right] = question.text.split(" × ").map(Number);
    return { ...question, answer: left * right };
  }
  return question;
}

export default function MindGym() {
  const [difficulty, setDifficulty] = useState("easy");
  const [status, setStatus] = useState("ready");
  const [question, setQuestion] = useState(() => resolvedQuestion("easy"));
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(settings.easy.seconds);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [summary, setSummary] = useState(null);
  const savedGame = useRef(false);

  const loadSummary = async () => {
    try { const { data } = await api.get("/mind-games/summary"); setSummary(data); } catch { toast.error("Could not load Mind Gym records"); }
  };
  useEffect(() => { loadSummary(); }, []);
  useEffect(() => {
    if (status !== "playing") return undefined;
    const timer = window.setInterval(() => setTimeLeft((value) => {
      if (value <= 1) { setStatus("finished"); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [status]);
  useEffect(() => {
    if (status !== "finished" || !total || savedGame.current) return;
    savedGame.current = true;
    api.post("/mind-games/attempts", { difficulty, score, correct, total, duration: settings[difficulty].seconds })
      .then(() => { loadSummary(); toast.success("Game saved to your Mind Gym record"); })
      .catch(() => toast.error("Game ended, but the score could not be saved"));
  }, [status, total, difficulty, score, correct]);

  function startGame() {
    savedGame.current = false;
    setScore(0); setCorrect(0); setTotal(0); setAnswer(""); setFeedback("");
    setQuestion(resolvedQuestion(difficulty)); setTimeLeft(settings[difficulty].seconds); setStatus("playing");
  }
  function changeDifficulty(value) {
    if (status === "playing") return;
    setDifficulty(value); setQuestion(resolvedQuestion(value)); setTimeLeft(settings[value].seconds); setStatus("ready"); setFeedback("");
  }
  function submitAnswer(event) {
    event.preventDefault();
    if (status !== "playing" || answer.trim() === "") return;
    const isCorrect = Number(answer) === question.answer;
    setTotal((value) => value + 1);
    if (isCorrect) { setCorrect((value) => value + 1); setScore((value) => value + settings[difficulty].points); setFeedback("Correct! Keep going."); }
    else setFeedback(`Answer: ${question.answer}`);
    setAnswer(""); setQuestion(resolvedQuestion(difficulty));
  }
  const accuracy = total ? Math.round(correct / total * 100) : 0;
  const rankIcon = (index) => index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;

  return <div className="mx-auto max-w-6xl space-y-7"><section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-800 via-brand-700 to-cyan-600 p-6 text-white shadow-xl sm:p-9"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex items-center gap-2 text-white/75"><BrainCircuit size={19}/><span className="text-sm font-bold">SKILLTRACK MIND GYM</span></div><h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Sharpen your thinking.</h1><p className="mt-3 max-w-xl leading-7 text-white/80">Take a quick calculation sprint between lessons. Build focus, speed, and accuracy—then beat your personal best.</p></div><div className="hidden rounded-3xl border border-white/15 bg-white/10 p-5 text-center md:block"><Zap className="mx-auto text-amber-300"/><p className="mt-3 text-xs font-semibold text-white/70">BEST SESSION</p><p className="mt-1 text-3xl font-extrabold">{Math.max(0, ...Object.values(summary?.best || {}).map((entry) => entry.score))}</p></div></div></section>
    <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><section className="card overflow-hidden"><div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Quick calculation</h2><p className="mt-1 text-sm text-slate-500">Answer as many as you can before time runs out.</p></div><div className={`rounded-xl px-3 py-2 text-sm font-bold ${status === "playing" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}><Timer className="mr-1 inline" size={16}/>{timeLeft}s</div></div><div className="mt-5 grid grid-cols-3 gap-2">{Object.entries(settings).map(([key, value])=><button disabled={status === "playing"} key={key} onClick={()=>changeDifficulty(key)} className={`rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed ${difficulty===key ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:border-slate-300"}`}><p className="text-sm font-bold">{value.label}</p><p className="mt-1 text-[11px] text-slate-500">{value.description}</p></button>)}</div></div><div className="p-5 sm:p-8"><div className="grid grid-cols-3 gap-3"><Metric label="Score" value={score}/><Metric label="Correct" value={`${correct}/${total}`}/><Metric label="Accuracy" value={`${accuracy}%`}/></div><div className="my-8 rounded-3xl bg-slate-950 px-5 py-10 text-center text-white shadow-inner sm:px-8"><p className="text-sm font-semibold tracking-wide text-cyan-300">SOLVE THIS</p><p className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{question.text} = ?</p>{status === "playing" ? <form onSubmit={submitAnswer} className="mx-auto mt-7 flex max-w-sm gap-2"><input autoFocus inputMode="numeric" aria-label="Your answer" value={answer} onChange={(event)=>setAnswer(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-xl font-bold text-white outline-none placeholder:text-white/40 focus:border-cyan-300" placeholder="Answer"/><button className="rounded-xl bg-cyan-300 px-5 font-bold text-slate-900">Go</button></form> : <button onClick={startGame} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-900"><Play size={16}/>{status === "finished" ? "Play again" : "Start game"}</button>}{feedback && <p className={`mt-4 text-sm font-semibold ${feedback.startsWith("Correct") ? "text-emerald-300" : "text-rose-300"}`}>{feedback}</p>}</div>{status === "finished" && <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-center"><p className="font-bold text-brand-800">Time’s up — {score} points!</p><p className="mt-1 text-sm text-brand-700">You answered {correct} of {total} correctly with {accuracy}% accuracy.</p></div>}</div></section>
      <aside className="space-y-6"><section className="card p-5"><div className="flex items-center gap-2"><Trophy className="text-amber-500" size={20}/><h2 className="font-bold">Personal bests</h2></div><div className="mt-4 space-y-3">{Object.entries(settings).map(([key, value])=>{const best=summary?.best?.[key]; return <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><div><p className="text-sm font-semibold">{value.label}</p><p className="text-xs text-slate-500">{best ? `${best.correct}/${best.total} correct` : "No session yet"}</p></div><strong className="text-lg text-brand-600">{best?.score || 0}</strong></div>})}</div></section><section className="card p-5"><div className="flex items-center gap-2"><Crown className="text-amber-500" size={20}/><h2 className="font-bold">Community leaders</h2></div><div className="mt-4 space-y-3">{summary?.leaderboard?.length ? summary.leaderboard.map((entry,index)=><div key={`${entry.name}-${index}`} className="flex items-center gap-3"><span className="w-6 text-center text-sm font-bold">{rankIcon(index)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{entry.name}</p><p className="text-xs capitalize text-slate-500">{entry.difficulty}</p></div><strong className="text-sm text-brand-600">{entry.score}</strong></div>) : <p className="text-sm text-slate-500">Be the first to set a score.</p>}</div></section></aside></div></div>;
}

function Metric({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-lg font-extrabold">{value}</p></div>; }
