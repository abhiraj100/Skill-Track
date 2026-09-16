import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Flame,
  Headphones,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const PRESETS = [
  { label: "Pomodoro", workMinutes: 25, breakMinutes: 5 },
  { label: "Deep Flow", workMinutes: 50, breakMinutes: 10 },
  { label: "Quick Sprint", workMinutes: 15, breakMinutes: 3 }
];

export default function FocusStation() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [mode, setMode] = useState("work"); // 'work' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundMode, setSoundMode] = useState("none"); // 'none' | 'binaural' | 'whitenoise' | 'rain'
  const [volume, setVolume] = useState(0.3);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review React useEffect cleanup functions", completed: false },
    { id: 2, text: "Solve 1 algorithmic challenge on Code Lab", completed: false }
  ]);
  const [newTask, setNewTask] = useState("");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const audioContextRef = useRef(null);
  const soundNodesRef = useRef([]);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Audio synthesis using native Web Audio API
  useEffect(() => {
    stopSound();
    if (soundMode === "none") return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (soundMode === "binaural") {
        // Deep Alpha binaural beat drone (200Hz left, 210Hz right -> 10Hz alpha)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.type = "sine";
        oscL.frequency.setValueAtTime(200, ctx.currentTime);
        oscR.type = "sine";
        oscR.frequency.setValueAtTime(210, ctx.currentTime);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-0.8, ctx.currentTime);
          pannerR.pan.setValueAtTime(0.8, ctx.currentTime);
          oscL.connect(pannerL);
          pannerL.connect(masterGain);
          oscR.connect(pannerR);
          pannerR.connect(masterGain);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start();
        oscR.start();
        soundNodesRef.current = [oscL, oscR, masterGain];
      } else if (soundMode === "whitenoise" || soundMode === "rain") {
        // Synthesize white / pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (soundMode === "rain") {
            // Low-pass filtered pink/brown noise gives gentle rain sound
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          } else {
            output[i] = white * 0.15;
          }
        }

        const whiteNoiseSource = ctx.createBufferSource();
        whiteNoiseSource.buffer = noiseBuffer;
        whiteNoiseSource.loop = true;

        if (soundMode === "rain") {
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(800, ctx.currentTime);
          whiteNoiseSource.connect(filter);
          filter.connect(masterGain);
        } else {
          whiteNoiseSource.connect(masterGain);
        }

        whiteNoiseSource.start();
        soundNodesRef.current = [whiteNoiseSource, masterGain];
      }
    } catch {
      // audio error handling
    }

    return () => stopSound();
  }, [soundMode, volume]);

  const stopSound = () => {
    soundNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {}
    });
    soundNodesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    stopSound();

    if (mode === "work") {
      const durationMin = PRESETS[presetIndex].workMinutes;
      setCompletedSessions((c) => c + 1);
      toast.success(`🎉 Focus block complete! ${durationMin} minutes logged to your daily streak.`);

      // Log progress to backend API
      try {
        await api.post("/progress/study-log", { minutes: durationMin });
      } catch {
        // silent fallback
      }

      // Switch to break
      setMode("break");
      setSecondsLeft(PRESETS[presetIndex].breakMinutes * 60);
    } else {
      toast.success("Break finished! Ready for another focus session?");
      setMode("work");
      setSecondsLeft(PRESETS[presetIndex].workMinutes * 60);
    }
  };

  const selectPreset = (idx) => {
    setPresetIndex(idx);
    setMode("work");
    setSecondsLeft(PRESETS[idx].workMinutes * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft((mode === "work" ? PRESETS[presetIndex].workMinutes : PRESETS[presetIndex].breakMinutes) * 60);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className={`space-y-6 ${fullscreen ? "fixed inset-0 z-50 overflow-y-auto bg-slate-950 p-8 text-white" : ""}`}>
      {/* Header */}
      {!fullscreen && (
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300">
                <Zap size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Deep Work Station</span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Pomodoro & Focus Soundscapes</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Eliminate distractions with timed deep focus blocks and ambient generative audio. Every session automatically advances your daily study streak.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <Flame className="text-orange-400" size={24} />
              <div>
                <p className="text-xs text-slate-300">Sessions Finished</p>
                <p className="text-xl font-bold">{completedSessions} blocks</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Timer Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1.1fr]">
        {/* Timer Box */}
        <div className="card flex flex-col items-center justify-between p-8 text-center sm:p-12 relative overflow-hidden">
          {/* Presets and Fullscreen */}
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.label}
                  onClick={() => selectPreset(idx)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    presetIndex === idx
                      ? "bg-brand-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="text-slate-400 hover:text-slate-700"
              title="Toggle Fullscreen"
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>

          {/* Countdown Display */}
          <div className="my-10 space-y-3">
            <span className={`badge text-xs font-bold tracking-wider uppercase ${
              mode === "work" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
            }`}>
              {mode === "work" ? "Deep Focus Interval" : "Rest & Recharge"}
            </span>
            <div className="font-mono text-7xl font-extrabold tracking-tight text-slate-900 sm:text-8xl">
              {timeString}
            </div>
            <p className="text-xs text-slate-400">
              {isRunning ? "Focus active — stay in the flow" : "Paused"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn-primary px-8 py-3.5 text-base shadow-lg"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? "Pause Session" : "Start Focus"}
            </button>
            <button
              onClick={resetTimer}
              className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-50"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Ambience & Tasks Sidebar */}
        <div className="space-y-6">
          {/* Ambient Sounds */}
          <div className="card space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Headphones size={18} className="text-brand-600" />
                Ambient Soundscapes
              </h3>
              {soundMode !== "none" && (
                <span className="text-[11px] font-bold text-emerald-600 animate-pulse">
                  Playing Ambient Audio
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: "Mute / Off", icon: VolumeX },
                { id: "binaural", label: "Alpha Wave (10Hz)", icon: Sparkles },
                { id: "rain", label: "Gentle Rain", icon: Volume2 },
                { id: "whitenoise", label: "White Noise", icon: Volume2 }
              ].map((s) => {
                const Icon = s.icon;
                const active = soundMode === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSoundMode(s.id)}
                    className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold transition text-left ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {soundMode !== "none" && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Ambience Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-brand-600"
                />
              </div>
            )}
          </div>

          {/* Session Focus Tasks */}
          <div className="card space-y-4 p-5 sm:p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-brand-600" />
              Focus Objectives
            </h3>

            <form onSubmit={addTask} className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What will you accomplish?"
                className="input py-2 text-xs"
              />
              <button type="submit" className="btn-primary py-2 px-3 text-xs">
                <Plus size={14} />
              </button>
            </form>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 text-xs"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center gap-2 text-left ${
                      task.completed ? "line-through text-slate-400" : "text-slate-700"
                    }`}
                  >
                    <span className={`grid h-4 w-4 place-items-center rounded border ${
                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                    }`}>
                      {task.completed && "✓"}
                    </span>
                    <span>{task.text}</span>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
