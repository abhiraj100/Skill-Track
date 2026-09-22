import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  Scale,
  Sparkles,
  Copy,
  Check,
  Building2,
  PieChart,
  Award,
  ArrowRight,
  Sliders,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";

const ROLES_BENCHMARKS = [
  {
    id: "fullstack",
    title: "Full-Stack Engineer",
    levels: {
      l3: { level: "L3 / Junior (0-2 yrs)", base: 125000, rsu: 25000, bonus: 12000, tc: 162000 },
      l4: { level: "L4 / Mid-Level (2-5 yrs)", base: 165000, rsu: 55000, bonus: 20000, tc: 240000 },
      l5: { level: "L5 / Senior (5-8 yrs)", base: 205000, rsu: 110000, bonus: 32000, tc: 347000 },
      l6: { level: "L6 / Staff (8-12 yrs)", base: 255000, rsu: 220000, bonus: 50000, tc: 525000 },
      l7: { level: "L7 / Principal (12+ yrs)", base: 310000, rsu: 380000, bonus: 80000, tc: 770000 }
    }
  },
  {
    id: "frontend",
    title: "Frontend Architect",
    levels: {
      l3: { level: "L3 / Junior (0-2 yrs)", base: 120000, rsu: 20000, bonus: 10000, tc: 150000 },
      l4: { level: "L4 / Mid-Level (2-5 yrs)", base: 160000, rsu: 50000, bonus: 18000, tc: 228000 },
      l5: { level: "L5 / Senior (5-8 yrs)", base: 200000, rsu: 105000, bonus: 30000, tc: 335000 },
      l6: { level: "L6 / Staff (8-12 yrs)", base: 250000, rsu: 200000, bonus: 45000, tc: 495000 },
      l7: { level: "L7 / Principal (12+ yrs)", base: 300000, rsu: 350000, bonus: 75000, tc: 725000 }
    }
  },
  {
    id: "backend",
    title: "Distributed Systems & Backend",
    levels: {
      l3: { level: "L3 / Junior (0-2 yrs)", base: 130000, rsu: 28000, bonus: 14000, tc: 172000 },
      l4: { level: "L4 / Mid-Level (2-5 yrs)", base: 170000, rsu: 60000, bonus: 22000, tc: 252000 },
      l5: { level: "L5 / Senior (5-8 yrs)", base: 215000, rsu: 125000, bonus: 35000, tc: 375000 },
      l6: { level: "L6 / Staff (8-12 yrs)", base: 270000, rsu: 250000, bonus: 55000, tc: 575000 },
      l7: { level: "L7 / Principal (12+ yrs)", base: 325000, rsu: 420000, bonus: 90000, tc: 835000 }
    }
  },
  {
    id: "devops",
    title: "Cloud Architect & DevOps / SRE",
    levels: {
      l3: { level: "L3 / Junior (0-2 yrs)", base: 128000, rsu: 22000, bonus: 12000, tc: 162000 },
      l4: { level: "L4 / Mid-Level (2-5 yrs)", base: 168000, rsu: 52000, bonus: 20000, tc: 240000 },
      l5: { level: "L5 / Senior (5-8 yrs)", base: 210000, rsu: 115000, bonus: 32000, tc: 357000 },
      l6: { level: "L6 / Staff (8-12 yrs)", base: 260000, rsu: 210000, bonus: 48000, tc: 518000 },
      l7: { level: "L7 / Principal (12+ yrs)", base: 315000, rsu: 360000, bonus: 78000, tc: 753000 }
    }
  },
  {
    id: "ai_ml",
    title: "AI / Machine Learning Engineer",
    levels: {
      l3: { level: "L3 / Junior (0-2 yrs)", base: 140000, rsu: 35000, bonus: 18000, tc: 193000 },
      l4: { level: "L4 / Mid-Level (2-5 yrs)", base: 185000, rsu: 80000, bonus: 28000, tc: 293000 },
      l5: { level: "L5 / Senior (5-8 yrs)", base: 235000, rsu: 160000, bonus: 45000, tc: 440000 },
      l6: { level: "L6 / Staff (8-12 yrs)", base: 295000, rsu: 320000, bonus: 70000, tc: 685000 },
      l7: { level: "L7 / Principal (12+ yrs)", base: 360000, rsu: 550000, bonus: 110000, tc: 1020000 }
    }
  }
];

export default function SalaryRadar() {
  const [activeTab, setActiveTab] = useState("explorer"); // 'explorer' | 'vesting' | 'compare' | 'negotiate'

  // Benchmark filters
  const [selectedRole, setSelectedRole] = useState("fullstack");
  const [selectedLevel, setSelectedLevel] = useState("l5");
  const [tierMultiplier, setTierMultiplier] = useState(1.0); // 1.15 for Tier 1, 1.0 for Tier 2, 0.85 for Tier 3

  // Vesting Simulator
  const [grantAmount, setGrantAmount] = useState(200000);
  const [basePay, setBasePay] = useState(180000);
  const [annualBonus, setAnnualBonus] = useState(25000);
  const [vestSchedule, setVestSchedule] = useState("equal"); // 'equal' | 'amazon' | 'frontloaded'
  const [annualAppreciation, setAnnualAppreciation] = useState(15); // % per year

  // Offer Comparison
  const [offerA, setOfferA] = useState({
    name: "Tier-1 Cloud Corp (Offer A)",
    base: 195000,
    rsu: 240000, // 4-yr total ($60k/yr)
    bonus: 30000,
    signon: 35000,
    remote: true,
    pto: 25
  });

  const [offerB, setOfferB] = useState({
    name: "AI Unicorn Startup (Offer B)",
    base: 180000,
    rsu: 360000, // 4-yr total ($90k/yr)
    bonus: 20000,
    signon: 15000,
    remote: false,
    pto: 20
  });

  const [copiedEmail, setCopiedEmail] = useState(false);

  // Active role benchmark data
  const currentRole = ROLES_BENCHMARKS.find((r) => r.id === selectedRole) || ROLES_BENCHMARKS[0];
  const currentLevelData = currentRole.levels[selectedLevel];

  const scaledSalary = useMemo(() => {
    return {
      base: Math.round(currentLevelData.base * tierMultiplier),
      rsu: Math.round(currentLevelData.rsu * tierMultiplier),
      bonus: Math.round(currentLevelData.bonus * tierMultiplier),
      tc: Math.round(currentLevelData.tc * tierMultiplier)
    };
  }, [currentLevelData, tierMultiplier]);

  // Vesting yearly model
  const vestingTimeline = useMemo(() => {
    let percentages = [0.25, 0.25, 0.25, 0.25];
    if (vestSchedule === "amazon") percentages = [0.05, 0.15, 0.40, 0.40];
    if (vestSchedule === "frontloaded") percentages = [0.33, 0.33, 0.22, 0.12];

    const growthRate = 1 + annualAppreciation / 100;

    return [1, 2, 3, 4].map((year, idx) => {
      const stockMultiplier = Math.pow(growthRate, year - 1);
      const vestedGrantBaseline = grantAmount * percentages[idx];
      const vestedStockValue = Math.round(vestedGrantBaseline * stockMultiplier);
      const totalComp = basePay + annualBonus + vestedStockValue;

      return {
        year: `Year ${year}`,
        percentage: Math.round(percentages[idx] * 100),
        base: basePay,
        bonus: annualBonus,
        vestedStock: vestedStockValue,
        total: totalComp
      };
    });
  }, [grantAmount, basePay, annualBonus, vestSchedule, annualAppreciation]);

  // Offer A vs B Calculations
  const comparison = useMemo(() => {
    const aYr1 = offerA.base + offerA.bonus + offerA.signon + offerA.rsu / 4;
    const a4Yr = offerA.base * 4 + offerA.bonus * 4 + offerA.signon + offerA.rsu;

    const bYr1 = offerB.base + offerB.bonus + offerB.signon + offerB.rsu / 4;
    const b4Yr = offerB.base * 4 + offerB.bonus * 4 + offerB.signon + offerB.rsu;

    return {
      aYr1,
      a4Yr,
      bYr1,
      b4Yr,
      yr1Diff: aYr1 - bYr1,
      totalDiff: a4Yr - b4Yr
    };
  }, [offerA, offerB]);

  // Negotiation Counter Email Template
  const negotiationEmail = useMemo(() => {
    return `Subject: Re: Offer Discussion - ${offerA.name} / ${currentRole.title}

Dear [Hiring Manager / Recruiter],

Thank you so much for extending the offer to join ${offerA.name} as a ${currentRole.title}. I have thoroughly enjoyed our technical discussions with the team and remain extremely excited about the company's roadmap and mission.

After carefully reviewing the total compensation package alongside an active competing offer that provides strong guaranteed cash and initial equity grants, I would love to see if there is flexibility to bridge the gap.

Specifically, if we are able to adjust the initial equity grant to $${Math.round(offerA.rsu * 1.15).toLocaleString()} over 4 years (or consider a sign-on bonus adjustment to $${Math.round(offerA.signon + 15000).toLocaleString()}), I would be ready to accept and sign immediately.

SkillTrack is my top choice, and I am confident I will deliver outsized impact across architecture, reliability, and team velocity from day one.

Thank you again for your time, consideration, and partnership throughout this process.

Warm regards,
[Your Name]
Full-Stack / Distributed Systems Engineer`;
  }, [offerA, currentRole]);

  const copyEmail = () => {
    navigator.clipboard.writeText(negotiationEmail);
    setCopiedEmail(true);
    toast.success("Negotiation script copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              <DollarSign size={14} /> Career & Compensation Intelligence v2.6
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tech Salary Radar & Negotiation Intelligence
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore market total compensation (TC = Base + RSU + Bonus) across engineering tracks,
              model 4-year equity vesting with appreciation sliders, and generate high-leverage counter-offer emails.
            </p>
          </div>

          {/* Quick Highlight Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Selected Role TC Benchmark</p>
              <p className="text-2xl font-black text-white">${scaledSalary.tc.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ yr</span></p>
              <p className="text-[10px] text-emerald-400 font-semibold">{currentLevelData.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("explorer")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "explorer"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Building2 size={15} /> 1. Market Compensation Explorer
        </button>
        <button
          onClick={() => setActiveTab("vesting")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "vesting"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <PieChart size={15} /> 2. 4-Year RSU Vesting Simulator
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "compare"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Scale size={15} /> 3. Side-by-Side Offer Evaluator
        </button>
        <button
          onClick={() => setActiveTab("negotiate")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === "negotiate"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Sparkles size={15} /> 4. Counter-Offer Scripts
        </button>
      </div>

      {/* TAB 1: MARKET EXPLORER */}
      {activeTab === "explorer" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Filters */}
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Engineering Specialization</h3>
              <p className="text-xs text-slate-500">Select target domain for accurate market percentiles.</p>
            </div>

            <div className="space-y-2">
              {ROLES_BENCHMARKS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition border ${
                    selectedRole === r.id
                      ? "bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{r.title}</span>
                  <ChevronRight size={14} className={selectedRole === r.id ? "text-emerald-600" : "text-slate-400"} />
                </button>
              ))}
            </div>

            {/* Company Tier Multiplier */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">Company Compensation Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Tier 1 (FAANG)", val: 1.15 },
                  { label: "Tier 2 (Growth)", val: 1.0 },
                  { label: "Tier 3 (Enterprise)", val: 0.85 }
                ].map((tier) => (
                  <button
                    key={tier.label}
                    onClick={() => setTierMultiplier(tier.val)}
                    className={`p-2.5 rounded-xl text-center text-[11px] font-bold border transition ${
                      tierMultiplier === tier.val
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-300"
                        : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seniority Levels & TC Breakdown Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>{currentRole.title} Levels</span>
              <span className="text-xs text-slate-400">Total Compensation (TC) = Base + Stock + Bonus</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(currentRole.levels).map(([lvlKey, data]) => {
                const isSelected = selectedLevel === lvlKey;
                const tcScaled = Math.round(data.tc * tierMultiplier);
                const baseScaled = Math.round(data.base * tierMultiplier);
                const rsuScaled = Math.round(data.rsu * tierMultiplier);
                const bonusScaled = Math.round(data.bonus * tierMultiplier);

                return (
                  <div
                    key={lvlKey}
                    onClick={() => setSelectedLevel(lvlKey)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 dark:bg-slate-900 dark:border-emerald-500"
                        : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center uppercase">
                          {lvlKey}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{data.level}</p>
                          <p className="text-[11px] text-slate-400">Industry Median Band</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 dark:text-slate-100">${tcScaled.toLocaleString()}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">Annual TC</p>
                      </div>
                    </div>

                    {/* Breakdown bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Base Pay</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${baseScaled.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Annual RSUs</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${rsuScaled.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Target Bonus</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">${bonusScaled.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VESTING SIMULATOR */}
      {activeTab === "vesting" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders size={16} className="text-emerald-600" /> Grant & Pay Configuration
              </h3>
              <p className="text-xs text-slate-500">Configure your initial 4-year grant and annual base.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Base Salary ($/yr)</label>
                <input
                  type="number"
                  step="5000"
                  value={basePay}
                  onChange={(e) => setBasePay(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Initial 4-Year Stock Grant ($)</label>
                <input
                  type="number"
                  step="10000"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Target Performance Bonus ($/yr)</label>
                <input
                  type="number"
                  step="2500"
                  value={annualBonus}
                  onChange={(e) => setAnnualBonus(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Vesting Schedule</label>
                <select
                  value={vestSchedule}
                  onChange={(e) => setVestSchedule(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="equal">Standard 4-Year Equal (25% / 25% / 25% / 25%)</option>
                  <option value="amazon">Amazon Backloaded (5% / 15% / 40% / 40%)</option>
                  <option value="frontloaded">Frontloaded (33% / 33% / 22% / 12%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Stock Annual Growth (%)</span>
                  <span className="text-emerald-600 font-mono font-bold">+{annualAppreciation}% / year</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="60"
                  step="5"
                  value={annualAppreciation}
                  onChange={(e) => setAnnualAppreciation(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Yearly Vesting Payout Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Projected 4-Year Earnings Timeline</span>
              <span className="text-xs text-emerald-600 font-bold">Compound Growth Factored</span>
            </h3>

            <div className="grid gap-3">
              {vestingTimeline.map((item) => (
                <div
                  key={item.year}
                  className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.year}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({item.percentage}% vested)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        ${item.total.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Total TC</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Base</span>
                      <p className="font-mono font-bold text-slate-700 dark:text-slate-300">${item.base.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Bonus</span>
                      <p className="font-mono font-bold text-slate-700 dark:text-slate-300">${item.bonus.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Stock Vested</span>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${item.vestedStock.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIDE-BY-SIDE OFFER EVALUATOR */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Offer A */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={offerA.name}
                  onChange={(e) => setOfferA({ ...offerA, name: e.target.value })}
                  className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:text-slate-100"
                />
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                  Offer A
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Base Salary</label>
                  <input
                    type="number"
                    value={offerA.base}
                    onChange={(e) => setOfferA({ ...offerA, base: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">4-Year RSUs Total</label>
                  <input
                    type="number"
                    value={offerA.rsu}
                    onChange={(e) => setOfferA({ ...offerA, rsu: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Annual Bonus</label>
                  <input
                    type="number"
                    value={offerA.bonus}
                    onChange={(e) => setOfferA({ ...offerA, bonus: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Sign-on Bonus</label>
                  <input
                    type="number"
                    value={offerA.signon}
                    onChange={(e) => setOfferA({ ...offerA, signon: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Year 1 Total Cash & Equity:</span>
                  <span className="font-mono text-indigo-600">${comparison.aYr1.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>4-Year Cumulative Total:</span>
                  <span className="font-mono">${comparison.a4Yr.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Offer B */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={offerB.name}
                  onChange={(e) => setOfferB({ ...offerB, name: e.target.value })}
                  className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:text-slate-100"
                />
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Offer B
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Base Salary</label>
                  <input
                    type="number"
                    value={offerB.base}
                    onChange={(e) => setOfferB({ ...offerB, base: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">4-Year RSUs Total</label>
                  <input
                    type="number"
                    value={offerB.rsu}
                    onChange={(e) => setOfferB({ ...offerB, rsu: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Annual Bonus</label>
                  <input
                    type="number"
                    value={offerB.bonus}
                    onChange={(e) => setOfferB({ ...offerB, bonus: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Sign-on Bonus</label>
                  <input
                    type="number"
                    value={offerB.signon}
                    onChange={(e) => setOfferB({ ...offerB, signon: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Year 1 Total Cash & Equity:</span>
                  <span className="font-mono text-emerald-600">${comparison.bYr1.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>4-Year Cumulative Total:</span>
                  <span className="font-mono">${comparison.b4Yr.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Banner */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Evaluation Delta</span>
              <p className="text-sm font-bold">
                {comparison.yr1Diff >= 0
                  ? `${offerA.name} leads Year 1 Total Comp by $${comparison.yr1Diff.toLocaleString()}`
                  : `${offerB.name} leads Year 1 Total Comp by $${Math.abs(comparison.yr1Diff).toLocaleString()}`}
              </p>
            </div>
            <button
              onClick={() => setActiveTab("negotiate")}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              Generate Counter Script <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: NEGOTIATION SCRIPT */}
      {activeTab === "negotiate" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                High-Leverage Counter-Offer Negotiation Email
              </h3>
              <p className="text-xs text-slate-500">
                Polite, data-backed email template to bridge cash and equity gaps without burning bridges.
              </p>
            </div>
            <button
              onClick={copyEmail}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
            >
              {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
              {copiedEmail ? "Copied Script!" : "Copy Email"}
            </button>
          </div>

          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 font-mono text-xs text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">{negotiationEmail}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
