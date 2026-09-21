import React, { useState, useEffect } from 'react';
import { 
  Swords, Trophy, Play, CheckCircle2, XCircle, Clock, Zap, 
  Sparkles, RefreshCw, Flame, Shield, ArrowRight, Check, Award
} from 'lucide-react';

const CHALLENGES = [
  {
    id: 'c1',
    title: 'Two Sum (O(N) Hash Map Lookup)',
    difficulty: 'Medium',
    timeLimit: 600, // 10 mins
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may not use the same element twice.',
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    tests: [
      { input: 'twoSum([2, 7, 11, 15], 9)', expected: '[0, 1]' },
      { input: 'twoSum([3, 2, 4], 6)', expected: '[1, 2]' },
      { input: 'twoSum([3, 3], 6)', expected: '[0, 1]' }
    ]
  },
  {
    id: 'c2',
    title: 'Valid Parentheses (Stack Evaluation)',
    difficulty: 'Easy',
    timeLimit: 480,
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    starterCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
    tests: [
      { input: 'isValid("()")', expected: 'true' },
      { input: 'isValid("()[]{}")', expected: 'true' },
      { input: 'isValid("(]")', expected: 'false' }
    ]
  }
];

export default function CodeArena() {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const challenge = CHALLENGES[activeChallengeIdx];

  const [userCode, setUserCode] = useState(challenge.starterCode);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);
  const [isRunningDuel, setIsRunningDuel] = useState(false);
  const [duelEnded, setDuelEnded] = useState(false);
  const [winner, setWinner] = useState(null); // 'user' | 'rival'

  // Rival state
  const [rivalProgress, setRivalProgress] = useState(0); // 0 to 100%
  const [rivalPassedTests, setRivalPassedTests] = useState(0);

  // Test Runner state
  const [userPassedTests, setUserPassedTests] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [userElo, setUserElo] = useState(1640);

  // Duel Timer
  useEffect(() => {
    let timer;
    if (isRunningDuel && timeLeft > 0 && !duelEnded) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunningDuel, timeLeft, duelEnded]);

  // Rival AI typing & test progression simulation
  useEffect(() => {
    let rivalTimer;
    if (isRunningDuel && !duelEnded) {
      rivalTimer = setInterval(() => {
        setRivalProgress(prev => {
          const next = prev + Math.floor(Math.random() * 8) + 4;
          if (next >= 100) {
            setRivalPassedTests(challenge.tests.length);
            // Rival finishes if user hasn't finished yet
            if (userPassedTests < challenge.tests.length) {
              setWinner('rival');
              setDuelEnded(true);
              setIsRunningDuel(false);
            }
            return 100;
          }
          if (next > 66) setRivalPassedTests(2);
          else if (next > 33) setRivalPassedTests(1);
          return next;
        });
      }, 2000);
    }
    return () => clearInterval(rivalTimer);
  }, [isRunningDuel, duelEnded, userPassedTests, challenge.tests.length]);

  const handleStartDuel = () => {
    setIsRunningDuel(true);
    setDuelEnded(false);
    setWinner(null);
    setTimeLeft(challenge.timeLimit);
    setRivalProgress(0);
    setRivalPassedTests(0);
    setUserPassedTests(0);
    setTestResults([]);
  };

  const handleRunTests = () => {
    // Simulate real in-browser evaluation
    const results = challenge.tests.map((t, idx) => ({
      name: `Test Case ${idx + 1}: ${t.input}`,
      expected: t.expected,
      passed: true,
      runtime: `${Math.floor(Math.random() * 12) + 4}ms`
    }));

    setTestResults(results);
    setUserPassedTests(results.length);

    if (results.length === challenge.tests.length) {
      setWinner('user');
      setDuelEnded(true);
      setIsRunningDuel(false);
      setUserElo(prev => prev + 28);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900/40 via-slate-900 to-indigo-950/60 border border-rose-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-rose-500/30">
              <Swords className="w-3.5 h-3.5" /> 1v1 Competitive Arena
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Real-Time Code Duel Arena
            </h1>
            <p className="text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
              Duel head-to-head in rapid algorithmic speed coding. Race against rival engineers and AI bots, pass all test cases first, and climb the competitive ELO rating ladder!
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Your Arena Rating</div>
              <div className="text-xl font-black text-white font-mono">{userElo} ELO</div>
              <div className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                <Flame className="w-3 h-3" /> Master Tier (Top 5%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duel Control & Matchup Bar */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-left">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Active Challenge</span>
            <div className="text-base font-bold text-white mt-0.5">{challenge.title}</div>
          </div>
        </div>

        {/* Timer & Start Action */}
        <div className="flex items-center gap-4">
          <div className="bg-gray-950 border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-base font-bold text-white">
            <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-gray-400'}`} />
            {formatTime(timeLeft)}
          </div>

          {!isRunningDuel && !duelEnded && (
            <button
              onClick={handleStartDuel}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-rose-600/30"
            >
              <Swords className="w-4 h-4" /> Start 1v1 Match
            </button>
          )}

          {isRunningDuel && (
            <button
              onClick={handleRunTests}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
            >
              <Play className="w-4 h-4 fill-white" /> Submit & Run Tests
            </button>
          )}

          {duelEnded && (
            <button
              onClick={handleStartDuel}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-gray-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rematch
            </button>
          )}
        </div>
      </div>

      {/* Victory / Defeat Modal Alert */}
      {duelEnded && (
        <div className={`p-6 rounded-2xl border text-center space-y-3 shadow-2xl animate-in zoom-in-95 ${
          winner === 'user' 
            ? 'bg-gradient-to-r from-emerald-950/80 via-gray-900 to-emerald-950/80 border-emerald-500/60' 
            : 'bg-gradient-to-r from-rose-950/80 via-gray-900 to-rose-950/80 border-rose-500/60'
        }`}>
          <div className="text-3xl">
            {winner === 'user' ? '🏆 VICTORY! You won the duel!' : '⚔️ DEFEAT! Rival finished first!'}
          </div>
          <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
            {winner === 'user' 
              ? `Incredible speed! You solved all test cases cleanly in ${formatTime(challenge.timeLimit - timeLeft)}. +28 ELO awarded to your profile rankings!` 
              : 'The rival bot passed the final test suite first. Review the optimal hash map approach and try a rematch!'}
          </p>
          <div className="inline-flex items-center gap-3 font-mono text-xs text-white bg-gray-950/80 px-4 py-1.5 rounded-xl border border-gray-800">
            <span>ELO: {userElo} ({winner === 'user' ? '+28' : '-12'})</span>
            <span>•</span>
            <span className="text-amber-400">XP: +150 Solved</span>
          </div>
        </div>
      )}

      {/* Split Arena: Left User Workspace, Right Rival Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: User Code Editor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-xl font-mono text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> solution.js
              </span>
              <span className="text-[11px] text-gray-500">Language: JavaScript (ES2024)</span>
            </div>

            <textarea
              rows={14}
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full bg-gray-900/70 text-gray-100 font-mono text-xs p-4 rounded-xl border border-gray-800/80 mt-3 focus:outline-none focus:border-rose-500 leading-relaxed"
            />

            {/* Test Results Output */}
            {testResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Test Results:</span>
                  <span className="text-emerald-400">{userPassedTests}/{challenge.tests.length} Passed</span>
                </div>
                <div className="space-y-1.5">
                  {testResults.map((r, i) => (
                    <div key={i} className="p-2 bg-gray-900 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {r.name}
                      </span>
                      <span className="text-gray-500">{r.runtime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Rival Status & Match Telemetry */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-400" />
              Opponent Telemetry
            </h3>

            {/* Rival Profile Card */}
            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Rival"
                className="w-12 h-12 rounded-full border-2 border-rose-500 object-cover"
              />
              <div>
                <div className="font-bold text-white text-sm">Elena (AlgoRacer AI)</div>
                <div className="text-xs text-rose-400 font-mono">1,685 ELO • Master</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Typing at ~75 WPM</div>
              </div>
            </div>

            {/* Rival Live Progress Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Rival Code Completion</span>
                  <span className="font-mono text-rose-400 font-bold">{rivalProgress}%</span>
                </div>
                <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
                  <div 
                    className="bg-gradient-to-r from-rose-600 to-amber-500 h-full transition-all duration-700" 
                    style={{ width: `${rivalProgress}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Tests Passing</span>
                  <span className="font-mono text-gray-200">{rivalPassedTests} / {challenge.tests.length}</span>
                </div>
                <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-700" 
                    style={{ width: `${(rivalPassedTests / challenge.tests.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Match Rules & Quick Tips */}
            <div className="pt-4 border-t border-gray-800 space-y-2 text-xs text-gray-400 leading-relaxed">
              <div className="font-semibold text-white uppercase text-[11px] tracking-wider">Duel Rules</div>
              <p>• First engineer to pass 100% of test cases wins the duel.</p>
              <p>• Winning awards +28 ELO and +150 XP toward weekly league rankings.</p>
              <p>• Timeouts result in a draw with no ELO penalty.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
