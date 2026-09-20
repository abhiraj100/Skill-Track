import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, GitBranch, GitCommit, GitMerge, CheckCircle, 
  HelpCircle, RefreshCw, Folder, FileText, ChevronRight, 
  Play, Award, Sparkles, Copy, ArrowRight, ShieldCheck
} from 'lucide-react';

const INITIAL_COMMITS = [
  { id: 'c1', hash: 'a1b2c3d', message: 'Initial commit: project structure', branch: 'main', parent: null, x: 50, y: 100, timestamp: '2h ago' },
  { id: 'c2', hash: 'e4f5a6b', message: 'Add Express server & base routes', branch: 'main', parent: 'c1', x: 180, y: 100, timestamp: '1h ago' },
  { id: 'c3', hash: '9c8b7a6', message: 'Configure Tailwind & client assets', branch: 'main', parent: 'c2', x: 310, y: 100, timestamp: '30m ago' }
];

const GUIDED_CHALLENGES = [
  {
    id: 1,
    title: "1. The First Feature Branch",
    description: "Create and switch to a new branch called `feature/auth` to build user authentication safely.",
    hint: "Type `git checkout -b feature/auth` or `git switch -c feature/auth`",
    solution: "git checkout -b feature/auth",
    xp: 75,
    check: (state) => state.currentBranch === 'feature/auth'
  },
  {
    id: 2,
    title: "2. Stage & Commit Changes",
    description: "Stage files with `git add .` and create a commit with message `feat: add JWT auth middleware`.",
    hint: "Use `git add .` followed by `git commit -m \"feat: add JWT auth middleware\"`",
    solution: 'git commit -m "feat: add JWT auth middleware"',
    xp: 100,
    check: (state) => state.commits.some(c => c.branch === 'feature/auth' && c.message.toLowerCase().includes('jwt'))
  },
  {
    id: 3,
    title: "3. Merge to Main",
    description: "Switch back to `main` with `git checkout main` and merge `feature/auth`.",
    hint: "First: `git checkout main`, then: `git merge feature/auth`",
    solution: "git merge feature/auth",
    xp: 150,
    check: (state) => state.commits.some(c => c.isMerge)
  }
];

export default function TerminalLab() {
  // Terminal state
  const [history, setHistory] = useState([
    { type: 'system', text: '🚀 SkillTrack UNIX & Git Virtual Environment v2.4 initialized.' },
    { type: 'system', text: '💡 Type `help` for command list or click Quick Scenarios to practice.' },
    { type: 'system', text: 'Working directory: ~/skilltrack-app (branch: main)' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Git state
  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches, setBranches] = useState(['main']);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [unstagedFiles, setUnstagedFiles] = useState(['auth.js', 'tokenService.js']);
  const [commits, setCommits] = useState(INITIAL_COMMITS);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [files, setFiles] = useState([
    { name: 'src', isDir: true, children: ['index.js', 'App.jsx'] },
    { name: 'package.json', isDir: false },
    { name: 'README.md', isDir: false }
  ]);

  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Check challenges dynamically
  useEffect(() => {
    const activeChallenge = GUIDED_CHALLENGES[activeChallengeIdx];
    if (activeChallenge && !completedChallenges.includes(activeChallenge.id)) {
      if (activeChallenge.check({ currentBranch, commits, branches })) {
        setCompletedChallenges(prev => [...prev, activeChallenge.id]);
        setHistory(prev => [
          ...prev,
          { 
            type: 'success', 
            text: `🎉 Challenge Complete! "${activeChallenge.title}" (+${activeChallenge.xp} XP awarded to profile!)` 
          }
        ]);
        if (activeChallengeIdx < GUIDED_CHALLENGES.length - 1) {
          setActiveChallengeIdx(prev => prev + 1);
        }
      }
    }
  }, [currentBranch, commits, branches, activeChallengeIdx, completedChallenges]);

  const handleCommand = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIdx + 1 < cmdHistory.length ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '');
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '');
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
      return;
    }

    if (e.key !== 'Enter') return;
    e.preventDefault();

    const cmd = inputVal.trim();
    if (!cmd) return;

    // Record command history
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);

    const newHistory = [...history, { type: 'prompt', text: `skilltrack@dev:~/app (${currentBranch}) $ ${cmd}` }];
    setInputVal('');

    const parts = cmd.split(' ').filter(Boolean);
    const main = parts[0];
    const sub = parts[1];

    if (main === 'clear') {
      setHistory([]);
      return;
    }

    if (main === 'help') {
      newHistory.push({
        type: 'output',
        text: `Available Commands:
  • git status             - Show working tree & staging status
  • git add <files|.>      - Stage modifications
  • git commit -m "msg"    - Record staged changes to repository
  • git branch             - List local branches
  • git branch <name>      - Create new branch
  • git checkout <branch>  - Switch branches
  • git checkout -b <name> - Create and switch to new branch
  • git merge <branch>     - Merge specified branch into current HEAD
  • git log                - Show commit history graph
  • git reset --hard       - Reset changes to latest commit
  • ls [-la]               - List directory files
  • cat <file>             - Print file content
  • touch <file>           - Create mock file
  • pwd                    - Print current working directory
  • clear                  - Clear terminal output`
      });
    } else if (main === 'pwd') {
      newHistory.push({ type: 'output', text: '/home/skilltrack/workspace/skilltrack-app' });
    } else if (main === 'ls') {
      const items = files.map(f => f.isDir ? `📁 ${f.name}/` : `📄 ${f.name}`).join('   ');
      newHistory.push({ type: 'output', text: items });
    } else if (main === 'touch') {
      const filename = parts[1] || 'newfile.js';
      setFiles(prev => [...prev, { name: filename, isDir: false }]);
      setUnstagedFiles(prev => [...prev, filename]);
      newHistory.push({ type: 'output', text: `Created file ${filename} (untracked)` });
    } else if (main === 'cat') {
      const file = parts[1];
      if (!file) {
        newHistory.push({ type: 'error', text: 'cat: missing filename operand' });
      } else if (file === 'package.json') {
        newHistory.push({ type: 'output', text: '{\n  "name": "skilltrack-app",\n  "version": "2.4.0",\n  "private": true\n}' });
      } else if (file === 'README.md') {
        newHistory.push({ type: 'output', text: '# SkillTrack Full-Stack Platform\nNext-gen career & learning acceleration studio.' });
      } else {
        newHistory.push({ type: 'output', text: `// Content of ${file}\nexport const ready = true;` });
      }
    } else if (main === 'git') {
      if (!sub) {
        newHistory.push({ type: 'error', text: 'git: command missing. Try `git status`, `git branch`, or `git log`.' });
      } else if (sub === 'status') {
        let msg = `On branch ${currentBranch}\n`;
        if (stagedFiles.length === 0 && unstagedFiles.length === 0) {
          msg += 'nothing to commit, working tree clean';
        } else {
          if (stagedFiles.length > 0) {
            msg += `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n`;
            stagedFiles.forEach(f => { msg += `\tnew file:   \x1b[32m${f}\x1b[0m\n`; });
          }
          if (unstagedFiles.length > 0) {
            msg += `Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n`;
            unstagedFiles.forEach(f => { msg += `\t\x1b[31m${f}\x1b[0m\n`; });
          }
        }
        newHistory.push({ type: 'output', text: msg });
      } else if (sub === 'add') {
        const target = parts[2];
        if (!target) {
          newHistory.push({ type: 'error', text: 'Nothing specified, nothing added. Maybe you wanted to say `git add .`?' });
        } else {
          setStagedFiles(prev => [...new Set([...prev, ...unstagedFiles])]);
          setUnstagedFiles([]);
          newHistory.push({ type: 'output', text: `Staged changes ready for commit.` });
        }
      } else if (sub === 'commit') {
        const flag = parts[2];
        const rawMsg = parts.slice(3).join(' ').replace(/['"]/g, '');
        if (flag !== '-m' || !rawMsg) {
          newHistory.push({ type: 'error', text: 'Error: Commit message required. Use: git commit -m "your message"' });
        } else {
          const newHash = Math.random().toString(16).substring(2, 9);
          const lastCommitOnBranch = [...commits].reverse().find(c => c.branch === currentBranch) || commits[commits.length - 1];
          
          const newX = lastCommitOnBranch ? lastCommitOnBranch.x + 130 : 50;
          const newY = currentBranch === 'main' ? 100 : 200;

          const newCommitObj = {
            id: `c_${Date.now()}`,
            hash: newHash,
            message: rawMsg,
            branch: currentBranch,
            parent: lastCommitOnBranch ? lastCommitOnBranch.id : null,
            x: newX,
            y: newY,
            timestamp: 'just now'
          };

          setCommits(prev => [...prev, newCommitObj]);
          setStagedFiles([]);
          newHistory.push({
            type: 'success',
            text: `[${currentBranch} ${newHash}] ${rawMsg}\n ${stagedFiles.length || 1} file changed, ${Math.floor(Math.random()*40 + 5)} insertions(+)`
          });
        }
      } else if (sub === 'branch') {
        const branchName = parts[2];
        if (!branchName) {
          const list = branches.map(b => b === currentBranch ? `* \x1b[32m${b}\x1b[0m` : `  ${b}`).join('\n');
          newHistory.push({ type: 'output', text: list });
        } else {
          if (branches.includes(branchName)) {
            newHistory.push({ type: 'error', text: `fatal: A branch named '${branchName}' already exists.` });
          } else {
            setBranches(prev => [...prev, branchName]);
            newHistory.push({ type: 'output', text: `Created branch '${branchName}'` });
          }
        }
      } else if (sub === 'checkout' || sub === 'switch') {
        if (parts[2] === '-b' || parts[2] === '-c') {
          const newBranch = parts[3];
          if (!newBranch) {
            newHistory.push({ type: 'error', text: 'fatal: missing branch name' });
          } else {
            if (!branches.includes(newBranch)) {
              setBranches(prev => [...prev, newBranch]);
            }
            setCurrentBranch(newBranch);
            newHistory.push({ type: 'success', text: `Switched to a new branch '${newBranch}'` });
          }
        } else {
          const targetBranch = parts[2];
          if (!targetBranch) {
            newHistory.push({ type: 'error', text: 'fatal: specify a branch name to checkout' });
          } else if (!branches.includes(targetBranch)) {
            newHistory.push({ type: 'error', text: `error: pathspec '${targetBranch}' did not match any file(s) known to git` });
          } else {
            setCurrentBranch(targetBranch);
            newHistory.push({ type: 'output', text: `Switched to branch '${targetBranch}'` });
          }
        }
      } else if (sub === 'merge') {
        const sourceBranch = parts[2];
        if (!sourceBranch) {
          newHistory.push({ type: 'error', text: 'fatal: specify a branch to merge' });
        } else if (!branches.includes(sourceBranch)) {
          newHistory.push({ type: 'error', text: `merge: ${sourceBranch} - not something we can merge` });
        } else if (sourceBranch === currentBranch) {
          newHistory.push({ type: 'output', text: 'Already up to date.' });
        } else {
          const mergeHash = Math.random().toString(16).substring(2, 9);
          const lastCommit = commits[commits.length - 1];
          const newCommitObj = {
            id: `c_merge_${Date.now()}`,
            hash: mergeHash,
            message: `Merge branch '${sourceBranch}' into ${currentBranch}`,
            branch: currentBranch,
            parent: lastCommit.id,
            isMerge: true,
            sourceBranch,
            x: lastCommit.x + 130,
            y: currentBranch === 'main' ? 100 : 200,
            timestamp: 'just now'
          };
          setCommits(prev => [...prev, newCommitObj]);
          newHistory.push({
            type: 'success',
            text: `Merge made by the 'ort' strategy.\nMerged branch '${sourceBranch}' into '${currentBranch}' [${mergeHash}].`
          });
        }
      } else if (sub === 'log') {
        const logs = [...commits].reverse().map(c => 
          `commit ${c.hash} (${c.branch === currentBranch ? 'HEAD -> ' : ''}${c.branch})\nAuthor: Developer <dev@skilltrack.io>\nDate:   ${c.timestamp}\n\n    ${c.message}\n`
        ).join('\n');
        newHistory.push({ type: 'output', text: logs });
      } else if (sub === 'reset') {
        setStagedFiles([]);
        newHistory.push({ type: 'output', text: `HEAD is now at latest commit. Staging area cleared.` });
      } else {
        newHistory.push({ type: 'error', text: `git: '${sub}' is not a valid git command. Try 'help'.` });
      }
    } else {
      newHistory.push({ type: 'error', text: `bash: ${main}: command not found. Type 'help' to view valid commands.` });
    }

    setHistory(newHistory);
  };

  const handleResetLab = () => {
    setCommits(INITIAL_COMMITS);
    setCurrentBranch('main');
    setBranches(['main']);
    setStagedFiles([]);
    setUnstagedFiles(['auth.js', 'tokenService.js']);
    setHistory([
      { type: 'system', text: '🔄 Environment restored to initial baseline.' }
    ]);
  };

  const insertCommand = (cmdText) => {
    setInputVal(cmdText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-zinc-900 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-500/30">
            <Terminal className="w-3.5 h-3.5" /> Interactive Sandbox
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Git & UNIX Terminal Lab
            <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/40">v2.4 Live Graph</span>
          </h1>
          <p className="text-gray-400 mt-1 max-w-2xl text-sm leading-relaxed">
            Execute authentic UNIX commands, practice advanced Git branching & merging workflows, and visualize real-time commit branch topologies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleResetLab}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-medium text-gray-200 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reset Lab
          </button>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-2 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Challenges Passed</div>
              <div className="text-base font-bold text-white">{completedChallenges.length} / {GUIDED_CHALLENGES.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Guided Challenge Banner */}
      <div className="bg-gradient-to-r from-indigo-900/30 via-slate-900 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Active Challenge</span>
              {completedChallenges.includes(GUIDED_CHALLENGES[activeChallengeIdx]?.id) && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Solved
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-white mt-0.5">{GUIDED_CHALLENGES[activeChallengeIdx]?.title}</div>
            <p className="text-xs text-gray-300 mt-0.5">{GUIDED_CHALLENGES[activeChallengeIdx]?.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            onClick={() => insertCommand(GUIDED_CHALLENGES[activeChallengeIdx]?.solution || '')}
            className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-xl text-xs font-medium text-indigo-200 transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Auto-Fill Command
          </button>
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl font-mono">
            Hint: {GUIDED_CHALLENGES[activeChallengeIdx]?.hint}
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Graph + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Interactive Terminal */}
        <div className="lg:col-span-7 flex flex-col bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden min-h-[480px]">
          {/* Terminal Window Chrome */}
          <div className="bg-gray-900/90 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="text-xs font-mono text-gray-400 ml-2">bash - 80x24</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <GitBranch className="w-3.5 h-3.5" /> {currentBranch}
              </span>
              <span>HEAD</span>
            </div>
          </div>

          {/* Terminal Output Body */}
          <div className="p-4 font-mono text-xs text-gray-200 space-y-2 flex-1 overflow-y-auto max-h-[380px] select-text">
            {history.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line.type === 'system' && (
                  <span className="text-indigo-400">{line.text}</span>
                )}
                {line.type === 'prompt' && (
                  <span className="text-emerald-400 font-semibold">{line.text}</span>
                )}
                {line.type === 'output' && (
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono mt-0.5">{line.text}</pre>
                )}
                {line.type === 'error' && (
                  <span className="text-rose-400">{line.text}</span>
                )}
                {line.type === 'success' && (
                  <span className="text-emerald-300 font-semibold">{line.text}</span>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Input Bar */}
          <div className="p-3 bg-gray-900/60 border-t border-gray-800/80 flex items-center gap-2 font-mono text-xs">
            <span className="text-emerald-400 font-bold shrink-0">
              skilltrack@dev:~/app ({currentBranch}) $
            </span>
            <input 
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleCommand}
              placeholder="type git status, git branch, ls, help..."
              className="flex-1 bg-transparent text-gray-100 focus:outline-none placeholder-gray-600 font-mono"
              autoFocus
            />
          </div>
        </div>

        {/* Right 5 Cols: Live Visual Git Graph + File System */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live SVG Graph */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                Live Git Commit & Branch Graph
              </h3>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono">
                {commits.length} commits
              </span>
            </div>

            {/* SVG Visual Canvas */}
            <div className="bg-gray-950/80 rounded-xl p-3 border border-gray-800/80 overflow-x-auto">
              <svg width={Math.max(commits.length * 140 + 40, 480)} height="240" className="overflow-visible">
                <defs>
                  <linearGradient id="mainGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="featureGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Branch lane guide lines */}
                <line x1="30" y1="90" x2={commits.length * 140 + 30} y2="90" stroke="#1f2937" strokeWidth="2" strokeDasharray="4 4" />
                <text x="10" y="94" fill="#6b7280" fontSize="10" fontFamily="monospace">main</text>

                <line x1="30" y1="180" x2={commits.length * 140 + 30} y2="180" stroke="#1f2937" strokeWidth="2" strokeDasharray="4 4" />
                <text x="10" y="184" fill="#6b7280" fontSize="10" fontFamily="monospace">feat</text>

                {/* Draw connections */}
                {commits.map((c, i) => {
                  if (i === 0) return null;
                  const prevCommit = commits[i - 1];
                  const isCurved = c.y !== prevCommit.y;
                  return (
                    <g key={`edge_${c.id}`}>
                      {isCurved ? (
                        <path
                          d={`M ${prevCommit.x} ${prevCommit.y} C ${prevCommit.x + 50} ${prevCommit.y}, ${c.x - 50} ${c.y}, ${c.x} ${c.y}`}
                          fill="none"
                          stroke={c.branch === 'main' ? '#6366f1' : '#10b981'}
                          strokeWidth="2.5"
                        />
                      ) : (
                        <line
                          x1={prevCommit.x}
                          y1={prevCommit.y}
                          x2={c.x}
                          y2={c.y}
                          stroke={c.branch === 'main' ? '#6366f1' : '#10b981'}
                          strokeWidth="2.5"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Draw Commit Nodes */}
                {commits.map((c) => {
                  const isHead = commits[commits.length - 1].id === c.id;
                  const isMain = c.branch === 'main';
                  return (
                    <g key={`node_${c.id}`} className="cursor-pointer group">
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isHead ? 9 : 7}
                        fill={isMain ? '#3b82f6' : '#10b981'}
                        stroke="#ffffff"
                        strokeWidth={isHead ? 3 : 1.5}
                        className="transition-all hover:r-10"
                      />
                      {/* Commit hash label */}
                      <text
                        x={c.x}
                        y={c.y - 14}
                        fill="#9ca3af"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {c.hash}
                      </text>
                      {/* Short commit message preview */}
                      <text
                        x={c.x}
                        y={c.y + 20}
                        fill="#d1d5db"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                        className="max-w-[100px] truncate"
                      >
                        {c.message.length > 14 ? c.message.substring(0, 14) + '...' : c.message}
                      </text>

                      {isHead && (
                        <g>
                          <rect
                            x={c.x - 22}
                            y={c.y + 26}
                            width="44"
                            height="16"
                            rx="4"
                            fill="#ef4444"
                          />
                          <text
                            x={c.x}
                            y={c.y + 38}
                            fill="#ffffff"
                            fontSize="8"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            HEAD
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              💡 Commits automatically render onto branches. Run <code className="text-gray-300">git checkout -b feature/name</code> and commit to watch graph split!
            </p>
          </div>

          {/* Staging & File Inspector */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4 text-amber-400" />
              Repository File Status
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Staged for Commit ({stagedFiles.length})</span>
                {stagedFiles.length === 0 ? (
                  <div className="text-gray-500 italic mt-1">No changes staged. Run `git add .`</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {stagedFiles.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                        + {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Untracked Files ({unstagedFiles.length})</span>
                {unstagedFiles.length === 0 ? (
                  <div className="text-gray-500 italic mt-1">Working tree clean</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {unstagedFiles.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono">
                        ? {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick cheat sheet buttons */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Commands</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'git status',
                  'git add .',
                  'git commit -m "feat: login"',
                  'git checkout -b feature/auth',
                  'git checkout main',
                  'git merge feature/auth'
                ].map((c, i) => (
                  <button
                    key={i}
                    onClick={() => insertCommand(c)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-left font-mono text-[11px] text-indigo-300 transition-colors truncate border border-gray-700/60"
                  >
                    $ {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
