import { useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import { ProgressBar } from "../components/ui";

const DEFAULT_DECKS = [
  {
    id: "js-quirks",
    title: "JavaScript Quirks & ES6+",
    badge: "Core",
    desc: "Closures, hoisting, Temporal Dead Zone, prototypes, and event loop microtasks.",
    cards: [
      {
        front: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
        back: "The period between variable binding creation and its declaration with let/const. Accessing the variable in this zone throws a ReferenceError, unlike var which is initialized to undefined."
      },
      {
        front: "How does JavaScript determine the value of 'this' in arrow functions vs regular functions?",
        back: "Regular functions bind 'this' dynamically based on how they are called. Arrow functions do not have their own 'this'; they inherit it lexically from the enclosing execution context."
      },
      {
        front: "What is the order of execution between microtasks and macrotasks in the Node/browser Event Loop?",
        back: "After the current synchronous stack executes, ALL microtasks (Promise.then, queueMicrotask, process.nextTick) run to exhaustion before the next single macrotask (setTimeout, setInterval, setImmediate) is executed."
      },
      {
        front: "Why use WeakMap instead of Map when associating metadata with DOM nodes or objects?",
        back: "WeakMap keys must be objects and are held weakly. When the key object has no other references, it is automatically garbage-collected, preventing severe memory leaks."
      }
    ]
  },
  {
    id: "react-internals",
    title: "React 18 & Fiber Internals",
    badge: "Frontend",
    desc: "Concurrent rendering, Fiber nodes, automatic batching, and hydration.",
    cards: [
      {
        front: "What problem does the React Fiber reconciliation architecture solve?",
        back: "Fiber turns recursive rendering into an incremental linked-list unit of work. It allows React to pause, abort, or prioritize high-priority user inputs over expensive background tree renders."
      },
      {
        front: "How does React 18 Automatic Batching differ from React 17?",
        back: "React 17 only batched state updates inside React synthetic event handlers. React 18 automatically batches multiple setState calls anywhere — including inside Promises, setTimeout, and native event handlers."
      },
      {
        front: "When should you use useTransition vs useDeferredValue?",
        back: "useTransition is used when you wrap the state updating code directly (e.g. setSearchTerm). useDeferredValue is used when you only have access to the resulting prop/value from an upstream component."
      }
    ]
  },
  {
    id: "system-design",
    title: "System Design & Distributed Patterns",
    badge: "Architecture",
    desc: "Consistent hashing, caching policies, idempotency, and partition tolerance.",
    cards: [
      {
        front: "How does Consistent Hashing minimize data movement during cluster scaling?",
        back: "Keys and nodes are mapped onto a 360° circular hash ring. When a new node joins or dies, only k/N keys (neighboring range) need remapping, rather than rehashing the entire keyspace as in modulo hashing."
      },
      {
        front: "What is the difference between Cache-Aside and Write-Through caching?",
        back: "Cache-Aside: The application reads cache first; on miss, fetches from DB and populates cache. Write-Through: The app writes directly to the cache, and the cache synchronously writes to the DB before returning success."
      },
      {
        front: "How do you achieve API idempotency on network retries?",
        back: "Clients generate a unique Idempotency-Key (UUID) per intent. The server caches this key in Redis/DB with the original response. If duplicate requests arrive, the server returns the cached response without re-executing business logic."
      }
    ]
  }
];

export default function Flashcards() {
  const [decks, setDecks] = useState(() => {
    try {
      const stored = localStorage.getItem("skilltrack_custom_decks");
      return stored ? JSON.parse(stored) : DEFAULT_DECKS;
    } catch {
      return DEFAULT_DECKS;
    }
  });

  const [activeDeckId, setActiveDeckId] = useState(decks[0].id);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const currentCard = activeDeck.cards[cardIndex] || activeDeck.cards[0];
  const totalInDeck = activeDeck.cards.length;

  const currentMasteredCount = activeDeck.cards.filter((_, idx) => masteredCards[`${activeDeck.id}-${idx}`]).length;
  const progressPercent = totalInDeck ? Math.round((currentMasteredCount / totalInDeck) * 100) : 0;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const nextCard = () => {
    setIsFlipped(false);
    setCardIndex((i) => (i + 1 < totalInDeck ? i + 1 : 0));
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCardIndex((i) => (i - 1 >= 0 ? i - 1 : totalInDeck - 1));
  };

  const rateCard = (difficulty) => {
    const key = `${activeDeck.id}-${cardIndex}`;
    if (difficulty === "easy") {
      setMasteredCards((prev) => ({ ...prev, [key]: true }));
      toast.success("Card marked as mastered!");
    } else {
      setMasteredCards((prev) => ({ ...prev, [key]: false }));
      toast("Queued for review", { icon: "🔄" });
    }
    nextCard();
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return toast.error("Fill both prompt and explanation");

    const updated = decks.map((d) =>
      d.id === activeDeck.id ? { ...d, cards: [...d.cards, { front: newFront.trim(), back: newBack.trim() }] } : d
    );
    setDecks(updated);
    localStorage.setItem("skilltrack_custom_decks", JSON.stringify(updated));
    setNewFront("");
    setNewBack("");
    setCreateModalOpen(false);
    toast.success("Card added to deck!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-300">
              <Brain size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Spaced Repetition System</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Smart Flashcards & Active Recall</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Reinforce high-yield JavaScript quirks, React internals, and system design patterns using science-backed active recall.
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary bg-rose-600 hover:bg-rose-500 text-xs px-4 py-2.5"
          >
            <Plus size={15} /> Add Custom Flashcard
          </button>
        </div>
      </section>

      {/* Deck Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {decks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => {
              setActiveDeckId(deck.id);
              setCardIndex(0);
              setIsFlipped(false);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeDeckId === deck.id
                ? "bg-slate-900 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <BookOpen size={14} />
            {deck.title}
            <span className="text-[10px] opacity-70">({deck.cards.length})</span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{activeDeck.title} Mastery</span>
          <span>{progressPercent}% ({currentMasteredCount} / {totalInDeck} cards)</span>
        </div>
        <ProgressBar value={progressPercent} />
      </div>

      {/* 3D Flashcard Presentation */}
      <div className="mx-auto max-w-2xl space-y-6">
        <div
          onClick={handleFlip}
          className="perspective-1000 group cursor-pointer"
        >
          <div
            className={`card min-h-[300px] flex flex-col justify-between p-8 text-center transition-all duration-300 transform border-slate-200 shadow-xl ${
              isFlipped ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={`badge ${isFlipped ? "bg-slate-800 text-rose-300" : "bg-rose-50 text-rose-700"}`}>
                {isFlipped ? "Key Explanation & Mechanics" : "Recall Prompt"}
              </span>
              <span className="font-mono text-slate-400">
                Card {cardIndex + 1} of {totalInDeck}
              </span>
            </div>

            <div className="my-auto py-8">
              <p className={`text-xl font-bold sm:text-2xl leading-relaxed ${isFlipped ? "text-emerald-300" : "text-slate-900"}`}>
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Click to {isFlipped ? "view question" : "reveal answer"} ↻
            </div>
          </div>
        </div>

        {/* Navigation & Spaced Repetition Rating */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={prevCard}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              title="Previous Card"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextCard}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              title="Next Card"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => rateCard("hard")}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              Repeat (Hard)
            </button>
            <button
              onClick={() => rateCard("good")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Good
            </button>
            <button
              onClick={() => rateCard("easy")}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              Mastered ✓
            </button>
          </div>
        </div>
      </div>

      {/* CREATE FLASHCARD MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add Card to {activeDeck.title}</h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Front Prompt / Question</label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  rows={3}
                  placeholder="e.g. What is the difference between optimistic vs pessimistic locking?"
                  className="input mt-1 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Back Explanation / Answer</label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  rows={4}
                  placeholder="e.g. Optimistic assumes no collision and checks version/timestamp on write..."
                  className="input mt-1 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-5">
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
