import React, { useState } from 'react';
import { 
  Trophy, Medal, Flame, Zap, Award, Crown, ArrowUp, ArrowDown, 
  Search, Shield, Star, Users, ChevronRight, Clock, Target, Sparkles
} from 'lucide-react';

const LEAGUES = [
  { name: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-700/20', border: 'border-amber-700/30', minXp: 0, icon: '🥉' },
  { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-400/20', border: 'border-gray-400/30', minXp: 1000, icon: '🥈' },
  { name: 'Gold', color: 'text-amber-400', bg: 'bg-amber-400/20', border: 'border-amber-400/30', minXp: 2500, icon: '🥇' },
  { name: 'Platinum', color: 'text-cyan-300', bg: 'bg-cyan-400/20', border: 'border-cyan-400/30', minXp: 5000, icon: '💎' },
  { name: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', minXp: 10000, icon: '💠' },
  { name: 'Master', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', minXp: 20000, icon: '👑' },
  { name: 'Legend', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30', minXp: 40000, icon: '🔥' }
];

const LEADERBOARD_USERS = [
  {
    rank: 1,
    name: 'Elena Rostova',
    handle: '@erostova',
    title: 'Senior Distributed Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    league: 'Legend',
    xp: 48920,
    streak: 84,
    solved: 312,
    change: 'up',
    badge: 'System Design Maestro'
  },
  {
    rank: 2,
    name: 'Marcus Vance',
    handle: '@mvance',
    title: 'Full Stack Staff Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    league: 'Legend',
    xp: 45210,
    streak: 62,
    solved: 285,
    change: 'neutral',
    badge: 'Algorithm Titan'
  },
  {
    rank: 3,
    name: 'Sophia Chen',
    handle: '@sophia_c',
    title: 'Cloud & Kubernetes Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    league: 'Master',
    xp: 39800,
    streak: 45,
    solved: 240,
    change: 'up',
    badge: 'DevOps Wizard'
  },
  {
    rank: 4,
    name: 'Devon Kim',
    handle: '@dkim',
    title: 'React & Frontend Core Contributor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    league: 'Master',
    xp: 32150,
    streak: 31,
    solved: 198,
    change: 'up',
    badge: 'UI Perfectionist'
  },
  {
    rank: 5,
    name: 'Amina Al-Mansoor',
    handle: '@amina_dev',
    title: 'Backend API Specialist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    league: 'Master',
    xp: 28900,
    streak: 29,
    solved: 174,
    change: 'down',
    badge: 'Database Guru'
  },
  {
    rank: 6,
    name: 'Lucas Silva',
    handle: '@lucas_br',
    title: 'Golang Microservices Dev',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    league: 'Diamond',
    xp: 19400,
    streak: 18,
    solved: 142,
    change: 'up',
    badge: 'Concurrency Ace'
  },
  {
    rank: 7,
    name: 'Priya Sharma',
    handle: '@priya_codes',
    title: 'Data Platform Engineer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    league: 'Diamond',
    xp: 16750,
    streak: 22,
    solved: 129,
    change: 'neutral',
    badge: 'Pipeline Architect'
  },
  {
    rank: 14,
    name: 'You (Alex Dev)',
    handle: '@alex_skilltrack',
    title: 'Aspiring Full Stack Engineer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    league: 'Diamond',
    xp: 12450,
    streak: 14,
    solved: 88,
    change: 'up',
    badge: 'Rising Star',
    isCurrentUser: true
  }
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [challengedUsers, setChallengedUsers] = useState([]);

  const currentUser = LEADERBOARD_USERS.find(u => u.isCurrentUser);

  const handleChallenge = (handle) => {
    if (!challengedUsers.includes(handle)) {
      setChallengedUsers(prev => [...prev, handle]);
    }
  };

  const filteredUsers = LEADERBOARD_USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = selectedLeague === 'All' || u.league === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  const top3 = LEADERBOARD_USERS.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600/30 via-purple-900/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5" /> Global Skill Arena
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Developer League Leaderboard
            </h1>
            <p className="text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
              Compete weekly against engineers worldwide across System Design, CodeLab challenges, and UNIX labs. Rise into the Legend League to unlock exclusive recruiter showcases!
            </p>
          </div>

          {/* League Reset Countdown & Multiplier */}
          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700/60 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Weekly Reset In</div>
              <div className="text-lg font-black text-white font-mono">2d 14h 32m</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> 2x Weekend XP Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Rank Spotlight Bar */}
      {currentUser && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-gray-900 to-purple-900/30 border border-indigo-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover shadow"
              />
              <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white">
                YOU
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{currentUser.name}</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-medium">
                  💠 {currentUser.league} League
                </span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                <span>Rank: <strong className="text-indigo-300">#{currentUser.rank}</strong> (Top 4%)</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Flame className="w-3.5 h-3.5" /> {currentUser.streak} Day Streak
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{currentUser.xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="text-right hidden md:block">
              <div className="text-[11px] text-gray-400">Next League: Master</div>
              <div className="text-xs text-indigo-300 font-semibold">+7,550 XP needed</div>
            </div>
            <div className="w-32 bg-gray-800 h-2.5 rounded-full overflow-hidden border border-gray-700">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[62%]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/90 border border-gray-700/80 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl relative order-2 md:order-1">
            <div className="absolute -top-5 w-10 h-10 rounded-full bg-gray-400 text-gray-950 font-black text-lg flex items-center justify-center shadow-lg">
              2
            </div>
            <img 
              src={top3[1].avatar} 
              alt={top3[1].name} 
              className="w-20 h-20 rounded-full border-4 border-gray-400 object-cover mt-2 shadow-xl"
            />
            <h3 className="text-lg font-bold text-white mt-3">{top3[1].name}</h3>
            <p className="text-xs text-gray-400">{top3[1].title}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                🔥 {top3[1].league}
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> {top3[1].streak}d
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-3 font-mono">
              {top3[1].xp.toLocaleString()} <span className="text-xs text-gray-400 font-normal">XP</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        {top3[0] && (
          <div className="bg-gradient-to-b from-amber-900/40 via-gray-900 to-amber-950/30 border-2 border-amber-400/70 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative order-1 md:order-2 md:-translate-y-4">
            <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-gray-950 font-black text-xl flex items-center justify-center shadow-2xl border-2 border-amber-300">
              <Crown className="w-6 h-6 text-amber-950 fill-amber-950" />
            </div>
            <img 
              src={top3[0].avatar} 
              alt={top3[0].name} 
              className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover mt-2 shadow-2xl ring-4 ring-amber-400/20"
            />
            <div className="mt-1 text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Reigning Champion
            </div>
            <h3 className="text-xl font-black text-white mt-1">{top3[0].name}</h3>
            <p className="text-xs text-gray-300">{top3[0].title}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                🔥 {top3[0].league}
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5" /> {top3[0].streak}d streak
              </span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-3 font-mono">
              {top3[0].xp.toLocaleString()} <span className="text-xs text-amber-400/80 font-normal">XP</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/90 border border-gray-700/80 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl relative order-3">
            <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-700 text-white font-black text-lg flex items-center justify-center shadow-lg">
              3
            </div>
            <img 
              src={top3[2].avatar} 
              alt={top3[2].name} 
              className="w-20 h-20 rounded-full border-4 border-amber-700 object-cover mt-2 shadow-xl"
            />
            <h3 className="text-lg font-bold text-white mt-3">{top3[2].name}</h3>
            <p className="text-xs text-gray-400">{top3[2].title}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                👑 {top3[2].league}
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> {top3[2].streak}d
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-3 font-mono">
              {top3[2].xp.toLocaleString()} <span className="text-xs text-gray-400 font-normal">XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Time Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-950 rounded-xl border border-gray-800 w-full md:w-auto">
          {['weekly', 'all-time', 'system-design', 'codelab'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* League Selector & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="bg-gray-950 text-gray-300 border border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Leagues</option>
            {LEAGUES.map(l => (
              <option key={l.name} value={l.name}>{l.icon} {l.name}</option>
            ))}
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search developers..."
              className="w-full bg-gray-950 text-gray-200 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold w-16 text-center">Rank</th>
                <th className="py-3.5 px-4 font-semibold">Engineer</th>
                <th className="py-3.5 px-4 font-semibold">Tier</th>
                <th className="py-3.5 px-4 font-semibold text-center">Streak</th>
                <th className="py-3.5 px-4 font-semibold text-center">Challenges Solved</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total XP</th>
                <th className="py-3.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredUsers.map((user) => {
                const isChallenged = challengedUsers.includes(user.handle);
                return (
                  <tr 
                    key={user.handle}
                    className={`hover:bg-gray-850/50 transition-colors ${
                      user.isCurrentUser ? 'bg-indigo-950/20 border-l-4 border-l-indigo-500' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {user.rank === 1 && <span className="text-amber-400 text-base">🥇</span>}
                      {user.rank === 2 && <span className="text-gray-300 text-base">🥈</span>}
                      {user.rank === 3 && <span className="text-amber-700 text-base">🥉</span>}
                      {user.rank > 3 && <span className="text-gray-400">#{user.rank}</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {user.name}
                            {user.isCurrentUser && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">YOU</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{user.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 border border-gray-700 text-gray-300">
                        {user.league}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-400 text-xs">
                        <Flame className="w-3.5 h-3.5" /> {user.streak}d
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-300">
                      {user.solved}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                      {user.xp.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {user.isCurrentUser ? (
                        <span className="text-xs text-gray-500">Your profile</span>
                      ) : (
                        <button
                          onClick={() => handleChallenge(user.handle)}
                          disabled={isChallenged}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            isChallenged 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          }`}
                        >
                          {isChallenged ? 'Invited' : 'Duel 1v1'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
