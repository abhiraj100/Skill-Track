import React, { useState } from 'react';
import { 
  Users, UserCheck, Video, MessageSquare, Calendar, Sparkles, 
  Search, Filter, Globe, Clock, CheckCircle, Star, BookOpen, 
  Code, Shield, ArrowRight, PlusCircle, Check
} from 'lucide-react';

const BUDDIES_DATA = [
  {
    id: 'b1',
    name: 'David Kalu',
    handle: '@david_k',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    role: 'Targeting Senior Backend @ Stripe / Uber',
    track: 'Backend & Distributed Systems',
    timezone: 'UTC-5 (EST)',
    online: true,
    skills: ['Golang', 'Kafka', 'PostgreSQL', 'System Design'],
    rating: 4.9,
    sessionsCompleted: 24,
    availability: 'Mock Interview Ready',
    bio: 'Currently grinding distributed systems whiteboarding and high-throughput microservices. Looking for pair interview practice!'
  },
  {
    id: 'b2',
    name: 'Ananya Roy',
    handle: '@ananya_tech',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Targeting Frontend Staff @ Figma / Vercel',
    track: 'Frontend & UI Engineering',
    timezone: 'UTC+5:30 (IST)',
    online: true,
    skills: ['React 18', 'TypeScript', 'Web Workers', 'Tailwind'],
    rating: 5.0,
    sessionsCompleted: 38,
    availability: 'Pair Programming',
    bio: 'Obsessed with browser performance profiling and bespoke design systems. Seeking pair-coding buddies for complex canvas/DOM architectures.'
  },
  {
    id: 'b3',
    name: 'Liam O\'Connor',
    handle: '@liam_cloud',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'Targeting Platform / DevOps @ Datadog',
    track: 'Cloud & Platform Infrastructure',
    timezone: 'UTC+1 (BST)',
    online: false,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus'],
    rating: 4.8,
    sessionsCompleted: 19,
    availability: 'System Design Sprint',
    bio: 'Certified CKA/CKS engineer preparing for SRE architectural rounds. Let\'s practice failure blast radiuses and multi-region failovers.'
  },
  {
    id: 'b4',
    name: 'Mei-Ling Zhou',
    handle: '@ml_zhou',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    role: 'Targeting Full Stack Engineer @ Google',
    track: 'Full Stack Web',
    timezone: 'UTC-8 (PST)',
    online: true,
    skills: ['Next.js', 'Node.js', 'Redis', 'GraphQL'],
    rating: 4.9,
    sessionsCompleted: 42,
    availability: 'Mock Interview Ready',
    bio: 'Preparing for Google full stack loop next month! Doing 2 mock technical screenings daily.'
  }
];

const STUDY_SQUADS = [
  {
    id: 's1',
    title: 'Designing Data-Intensive Applications (DDIA)',
    topic: 'Chapter 7-9: Transactions, Consensus, Partitioning',
    track: 'Distributed Systems',
    membersCount: 5,
    maxMembers: 6,
    meetSchedule: 'Tues & Thurs @ 7:00 PM EST',
    tag: 'Deep Dive'
  },
  {
    id: 's2',
    title: 'NeetCode 150 Hard Problems Sprint',
    topic: 'Dynamic Programming & Graph Algorithmic Mastery',
    track: 'Data Structures & Algorithms',
    membersCount: 8,
    maxMembers: 10,
    meetSchedule: 'Daily 30-min Sprint @ 8:00 AM PST',
    tag: 'Sprint'
  },
  {
    id: 's3',
    title: 'Frontend System Design & Micro-frontends',
    topic: 'Module Federation, SSR Hydration, Offline Cache',
    track: 'Frontend Architecture',
    membersCount: 4,
    maxMembers: 5,
    meetSchedule: 'Saturdays @ 11:00 AM EST',
    tag: 'Architect'
  }
];

export default function StudyBuddy() {
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sentInvites, setSentInvites] = useState([]);
  const [joinedSquads, setJoinedSquads] = useState([]);
  const [activeTab, setActiveTab] = useState('buddies'); // 'buddies' | 'squads' | 'upcoming'

  const [upcomingSessions, setUpcomingSessions] = useState([
    {
      id: 'sess_1',
      peerName: 'David Kalu',
      peerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      type: 'Mock Technical Interview: Microservices & Rate Limiter',
      time: 'Today at 6:30 PM EST',
      status: 'Confirmed'
    }
  ]);

  const handleSendInvite = (buddyId) => {
    if (!sentInvites.includes(buddyId)) {
      setSentInvites(prev => [...prev, buddyId]);
    }
  };

  const handleJoinSquad = (squadId) => {
    if (!joinedSquads.includes(squadId)) {
      setJoinedSquads(prev => [...prev, squadId]);
    }
  };

  const filteredBuddies = BUDDIES_DATA.filter(b => {
    const matchesTrack = selectedTrack === 'All' || b.track.includes(selectedTrack);
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          b.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = !onlineOnly || b.online;
    return matchesTrack && matchesSearch && matchesOnline;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-indigo-950/50 border border-teal-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
              <Users className="w-3.5 h-3.5" /> Peer Collaborative Network
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Study Buddy & Pair Network
            </h1>
            <p className="text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
              Never prepare alone. Match 1-on-1 with ambitious engineers, conduct live peer mock interviews, join technical study squads, and conquer Big Tech hiring loops together.
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Active Matchmaking</div>
              <div className="text-lg font-black text-white">428 Peers Online</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> Average match time: &lt; 2 mins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('buddies')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'buddies' 
              ? 'bg-teal-600 text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Find 1-on-1 Buddies ({filteredBuddies.length})
        </button>
        <button
          onClick={() => setActiveTab('squads')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'squads' 
              ? 'bg-teal-600 text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Study Squads ({STUDY_SQUADS.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'upcoming' 
              ? 'bg-teal-600 text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> Upcoming Sessions ({upcomingSessions.length})
        </button>
      </div>

      {/* TAB 1: 1-ON-1 BUDDIES */}
      {activeTab === 'buddies' && (
        <div className="space-y-6">
          {/* Controls Filter */}
          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {['All', 'Backend', 'Frontend', 'Cloud', 'Full Stack'].map(track => (
                <button
                  key={track}
                  onClick={() => setSelectedTrack(track)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTrack === track 
                      ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40' 
                      : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none bg-gray-950 px-3 py-2 rounded-xl border border-gray-800">
                <input 
                  type="checkbox" 
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="rounded text-teal-500 focus:ring-0 bg-gray-800 border-gray-700"
                />
                <span>Online Only</span>
              </label>

              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by skill, name, target role..."
                  className="w-full bg-gray-950 text-gray-200 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-teal-500 placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Buddies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBuddies.map(buddy => {
              const isInvited = sentInvites.includes(buddy.id);
              return (
                <div 
                  key={buddy.id}
                  className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Online Dot */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img 
                            src={buddy.avatar} 
                            alt={buddy.name} 
                            className="w-14 h-14 rounded-2xl object-cover border border-gray-700 shadow"
                          />
                          {buddy.online && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900" title="Online Now"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{buddy.name}</h3>
                            <span className="text-xs text-gray-400 font-mono">{buddy.handle}</span>
                          </div>
                          <div className="text-xs text-teal-400 font-medium mt-0.5">{buddy.role}</div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-gray-500" /> {buddy.timezone}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> {buddy.rating} ({buddy.sessionsCompleted} sessions)</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/30 shrink-0">
                        {buddy.availability}
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-300 mt-4 leading-relaxed line-clamp-2">
                      "{buddy.bio}"
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {buddy.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded bg-gray-950 text-gray-300 border border-gray-800 text-[11px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
                    <button 
                      onClick={() => alert(`Direct message opened with ${buddy.name}`)}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>

                    <button
                      onClick={() => handleSendInvite(buddy.id)}
                      disabled={isInvited}
                      className={`flex-1 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        isInvited 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-teal-600 hover:bg-teal-500 text-white'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Invite Sent
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5" /> Request Mock Interview
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STUDY SQUADS */}
      {activeTab === 'squads' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STUDY_SQUADS.map(squad => {
            const isJoined = joinedSquads.includes(squad.id);
            return (
              <div 
                key={squad.id}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {squad.tag}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {squad.membersCount} / {squad.maxMembers} members
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{squad.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{squad.track}</p>

                  <div className="bg-gray-950 rounded-xl p-3 border border-gray-800/80 mt-4 space-y-1.5">
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Current Syllabus:</div>
                    <div className="text-xs text-gray-200">{squad.topic}</div>
                    <div className="text-[11px] text-teal-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {squad.meetSchedule}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleJoinSquad(squad.id)}
                    disabled={isJoined}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isJoined 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Enrolled in Squad
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" /> Join Study Squad
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: UPCOMING SESSIONS */}
      {activeTab === 'upcoming' && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            Scheduled Peer Sessions
          </h2>

          <div className="space-y-4">
            {upcomingSessions.map(sess => (
              <div 
                key={sess.id}
                className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={sess.peerAvatar} 
                    alt={sess.peerName} 
                    className="w-12 h-12 rounded-xl object-cover border border-gray-700"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{sess.type}</div>
                    <div className="text-xs text-gray-400">With {sess.peerName} • <span className="text-teal-400 font-medium">{sess.time}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {sess.status}
                  </span>
                  <button 
                    onClick={() => alert(`Launching live peer video call & collaborative code editor with ${sess.peerName}...`)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <Video className="w-3.5 h-3.5" /> Join Call Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
