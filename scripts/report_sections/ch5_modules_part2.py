from docx.shared import Inches, Pt, RGBColor
from .helpers import (
    add_chapter_heading, add_section_heading, add_sub_section_heading,
    p, add_callout, style_table, add_code_block
)

def add_chapter_5(doc):
    add_chapter_heading(doc, "CHAPTER 5: CORE SUBSYSTEM IMPLEMENTATION — PART II (DEVELOPER TOOLING & COMPETITIVE CODING)")
    
    p(doc, 
      "This chapter presents the architectural and algorithmic details of Modules 9 through 16. These subsystems bridge the gap "
      "between theoretical computer science and professional developer tooling, covering compensation modeling, catastrophic "
      "regex backtracking, CI/CD directed acyclic graphs (DAGs), real-time peer duels, distributed system design, dual-engine "
      "querying, UNIX internals, and API instrumentation."
    )

    # -------------------------------------------------------------
    # 5.1 Module 9: Tech Salary Radar & Equity Vesting Simulator
    # -------------------------------------------------------------
    add_section_heading(doc, "5.1 Module 9: Tech Salary Radar & Equity Vesting Simulator")
    p(doc, 
      "Total compensation in modern software engineering is heavily weighted toward non-cash equity grants (Restricted Stock Units, RSUs), "
      "performance bonuses, and vesting schedules. Undergraduate students entering recruitment cycles often miscalculate equity, "
      "failing to understand 4-year vesting cliffs, 1-year cliffs, back-loaded vesting (e.g., Amazon 5/15/40/40), and stock appreciation."
    )

    add_sub_section_heading(doc, "5.1.1 Compensation Benchmark Engine")
    p(doc, 
      "The Salary Radar subsystem indexes market benchmarks across five engineering disciplines: Frontend Engineering, Backend Distributed "
      "Systems, DevOps & Cloud Engineering, Mobile Engineering, and AI/Machine Learning. Benchmark data is partitioned across five company "
      "tiers: Early-Stage Startups (Seed/Series A), High-Growth Scaleups (Series B/C), Established Unicorns, Tier-1 Tech Giants (FAANG/MAMAA), "
      "and Quantitative Trading Firms."
    )

    salary_data = [
        ["L3 / SDE I (Junior)", "$120,000 - $175,000", "$30,000 / yr (4-yr cliff)", "$15,000", "$165,000 - $220,000"],
        ["L4 / SDE II (Mid-Level)", "$160,000 - $215,000", "$75,000 / yr (25% equal)", "$25,000", "$260,000 - $315,000"],
        ["L5 / Senior Engineer", "$210,000 - $275,000", "$140,000 / yr (25% equal)", "$45,000", "$395,000 - $460,000"],
        ["L6 / Staff Engineer", "$260,000 - $340,000", "$250,000 / yr (back-loaded)", "$70,000", "$580,000 - $660,000"],
        ["L7 / Principal Engineer", "$320,000 - $425,000", "$450,000+ / yr", "$120,000", "$890,000 - $995,000+"]
    ]
    tbl_salary = doc.add_table(rows=1, cols=5)
    style_table(tbl_salary, [1.5, 1.3, 1.4, 0.9, 1.4], ["Engineering Career Level", "Base Salary (Annual)", "Equity Grant (RSU/yr)", "Target Bonus", "Total Compensation (TC)"], salary_data)
    doc.add_paragraph()

    add_sub_section_heading(doc, "5.1.2 4-Year Equity Vesting & Stock Appreciation Slider")
    p(doc, 
      "The interactive vesting simulator models total compensation trajectories across 48 months. Users adjust projected annual stock "
      "growth rates (-20% bear market to +50% hyper-growth). The engine evaluates the mathematical model:"
    )
    p(doc, 
      "TotalComp(Year_t) = BaseSalary + Bonus + UnitsVested(t) * InitialGrantPrice * (1 + GrowthRate)^t",
      bold_prefix="Vesting Equity Formulation: "
    )
    p(doc, 
      "Additionally, the Counter-Offer Negotiation Generator evaluates competitive offers side-by-side, producing structured "
      "negotiation scripts that highlight gaps in base compensation, signing bonuses, and equity liquidity."
    )

    add_code_block(
        doc,
        "// 4-Year Equity Vesting & Compound Stock Appreciation Engine\n"
        "function calculate4YearVesting(grantValue, vestingSchedule = [0.25, 0.25, 0.25, 0.25], annualGrowthRate = 0.15) {\n"
        "  return vestingSchedule.map((ratio, yearIndex) => {\n"
        "    const unadjustedVested = grantValue * ratio;\n"
        "    const compoundMultiplier = Math.pow(1 + annualGrowthRate, yearIndex + 1);\n"
        "    const realizedValue = Math.round(unadjustedVested * compoundMultiplier);\n"
        "    return {\n"
        "      year: yearIndex + 1,\n"
        "      unadjustedValue: Math.round(unadjustedVested),\n"
        "      realizedValue: realizedValue,\n"
        "      growthSurplus: realizedValue - Math.round(unadjustedVested)\n"
        "    };\n"
        "  });\n"
        "}",
        "Listing 5.1: 4-Year Equity Vesting and Compound Appreciation Logic"
    )

    # -------------------------------------------------------------
    # 5.2 Module 10: Interactive Regex Lab & ReDoS Catastrophic Backtracking Analyzer
    # -------------------------------------------------------------
    add_section_heading(doc, "5.2 Module 10: Interactive Regex Lab & ReDoS Catastrophic Backtracking Analyzer")
    p(doc, 
      "Regular expressions are ubiquitous in input validation, routing, and text processing. However, non-deterministic finite "
      "automata (NFA) engines used in V8, Python, and Ruby are vulnerable to Regular Expression Denial of Service (ReDoS). "
      "When a regex contains nested quantifiers with overlapping sub-patterns, evaluating an adversarial input results in exponential "
      "backtracking complexity O(2^N)."
    )

    add_sub_section_heading(doc, "5.2.1 Abstract Syntax Tree (AST) Vulnerability Detection")
    p(doc, 
      "The Regex Lab contains a static regex AST analyzer. It parses regular expressions into hierarchical token trees, "
      "flagging dangerous motifs such as `(a+)+`, `(a|a)+`, and `([a-zA-Z]+)*$`. The analyzer warns learners when a pattern "
      "exhibits super-linear or exponential state space explosion."
    )

    add_code_block(
        doc,
        "// Static AST Pattern Matcher for Nested Quantifiers (ReDoS Detection)\n"
        "function analyzeReDoSRisk(patternStr) {\n"
        "  const nestedQuantifierRegex = /\\([^)]*(\\+|\\*|\\{[0-9]+,\\})[^)]*\\)(\\+|\\*|\\{[0-9]+,\\})/;\n"
        "  const overlappingAlternations = /\\(([^)|]+)\\|(\\1)\\)/;\n"
        "  \n"
        "  if (nestedQuantifierRegex.test(patternStr)) {\n"
        "    return {\n"
        "      severity: 'CRITICAL',\n"
        "      complexity: 'O(2^N) Exponential Backtracking',\n"
        "      recommendation: 'Use atomic grouping or possessive quantifiers'\n"
        "    };\n"
        "  }\n"
        "  if (overlappingAlternations.test(patternStr)) {\n"
        "    return {\n"
        "      severity: 'HIGH',\n"
        "      complexity: 'O(N^2) Polynomial Backtracking',\n"
        "      recommendation: 'Eliminate redundant alternation branches'\n"
        "    };\n"
        "  }\n"
        "  return { severity: 'SAFE', complexity: 'O(N) Linear Time' };\n"
        "}",
        "Listing 5.2: Static Abstract Syntax Tree ReDoS Vulnerability Heuristic"
    )

    # -------------------------------------------------------------
    # 5.3 Module 11: CI/CD Pipeline Studio
    # -------------------------------------------------------------
    add_section_heading(doc, "5.3 Module 11: CI/CD Pipeline Studio")
    p(doc, 
      "Continuous Integration and Continuous Deployment (CI/CD) pipelines underpin modern DevOps workflows. The CI/CD Pipeline Studio "
      "visualizes multi-stage delivery pipelines as Directed Acyclic Graphs (DAGs)."
    )
    p(doc, 
      "Pipeline stages include: 1. Code Lint & Static Analysis (ESLint), 2. Unit & Integration Testing (Jest/Vitest), 3. Container Security "
      "Scanning (Trivy), 4. Multi-Arch Docker Build, 5. Staging Environment Deployment, and 6. Canary / Blue-Green Production Rollout. "
      "Learners can inject artificial failures (e.g., failed unit test or high-severity CVE) to observe automated pipeline halts, "
      "slack alert webhooks, and zero-downtime rollbacks."
    )

    add_code_block(
        doc,
        "// Directed Acyclic Graph (DAG) Pipeline Execution Coordinator\n"
        "class PipelineStageDAG {\n"
        "  constructor(stages) {\n"
        "    this.stages = stages; // Array of { id, name, dependencies: [], fn }\n"
        "    this.results = new Map();\n"
        "  }\n"
        "  \n"
        "  async executePipeline() {\n"
        "    for (const stage of this.stages) {\n"
        "      const depsPassed = stage.dependencies.every(depId => this.results.get(depId)?.status === 'SUCCESS');\n"
        "      if (!depsPassed) {\n"
        "        this.results.set(stage.id, { status: 'SKIPPED', error: 'Preceding dependency failed' });\n"
        "        continue;\n"
        "      }\n"
        "      try {\n"
        "        const output = await stage.fn();\n"
        "        this.results.set(stage.id, { status: 'SUCCESS', output });\n"
        "      } catch (err) {\n"
        "        this.results.set(stage.id, { status: 'FAILED', error: err.message });\n"
        "        break; // Fast-fail pipeline execution\n"
        "      }\n"
        "    }\n"
        "    return this.results;\n"
        "  }\n"
        "}",
        "Listing 5.3: DAG Pipeline Stage Dependency Execution Coordinator"
    )

    # -------------------------------------------------------------
    # 5.4 Module 12: 1v1 Real-Time Code Duel Arena
    # -------------------------------------------------------------
    add_section_heading(doc, "5.4 Module 12: 1v1 Real-Time Code Duel Arena")
    p(doc, 
      "Gamified peer competition accelerates algorithmic problem-solving skills. The 1v1 Code Duel Arena matches two learners "
      "in a head-to-head timed programming battle. The platform coordinates live code sync, diff inspection, and automated test suite evaluation."
    )

    add_sub_section_heading(doc, "5.4.1 ELO Rating Adjustment Model")
    p(doc, 
      "Player skill ratings are dynamically adjusted using the formal FIDE ELO rating system. Given Player A with rating R_A and "
      "Player B with rating R_B, the expected probability of victory E_A is computed as:"
    )
    p(doc, 
      "E_A = 1 / (1 + 10^((R_B - R_A) / 400))",
      bold_prefix="Expected Score Formula: "
    )
    p(doc, 
      "Following the match outcome S_A (1.0 for win, 0.5 for draw, 0.0 for loss), the updated rating is determined by:"
    )
    p(doc, 
      "R'_A = R_A + K * (S_A - E_A)",
      bold_prefix="Updated ELO Formula: "
    )
    p(doc, 
      "SkillTrack implements a dynamic K-factor: K=32 for provisional players (<30 matches), K=24 for intermediate players (rating < 2000), "
      "and K=16 for veteran master coders, ensuring rapid skill calibration while stabilizing elite leaderboards."
    )

    # -------------------------------------------------------------
    # 5.5 Module 13: System Design Interactive Arena
    # -------------------------------------------------------------
    add_section_heading(doc, "5.5 Module 13: System Design Interactive Arena")
    p(doc, 
      "Senior technical interviews require designing distributed architectures serving tens of millions of users. The System Design Arena "
      "provides an interactive whiteboard and capacity planning calculator for real-world scenarios: Designing Twitter/X, URL Shortener (Bitly), "
      "Distributed Rate Limiter, and Uber Geospatial Dispatch."
    )

    add_sub_section_heading(doc, "5.5.1 Capacity Estimation & Storage Math")
    p(doc, 
      "The arena provides an automated estimation engine that translates business metrics into hardware sizing:"
    )
    p(doc, 
      "• Read/Write QPS: Given 100M Daily Active Users with 5 tweets read and 0.5 tweets written per day: "
      "Write QPS = (100M * 0.5) / 86,400s ≈ 578 QPS; Read QPS = (100M * 5) / 86,400s ≈ 5,787 QPS (Peak 2x ≈ 11,500 QPS)."
    )
    p(doc, 
      "• Storage Requirements: 50M new tweets/day * 500 bytes metadata = 25 GB/day = 9.1 TB/year. Media storage (assuming 20% tweets have images) = "
      "10M images/day * 200 KB = 2 TB/day = 730 TB/year."
    )
    p(doc, 
      "• Redis Cache Sizing: Applying the 80/20 Pareto principle (caching 20% of daily read volume): "
      "Cache RAM = 0.20 * (500M reads/day * 500 bytes) = 50 GB RAM cluster."
    )

    # -------------------------------------------------------------
    # 5.6 Module 14: SQL & MongoDB Dual-Engine Query Lab
    # -------------------------------------------------------------
    add_section_heading(doc, "5.6 Module 14: SQL & MongoDB Dual-Engine Query Lab")
    p(doc, 
      "Modern full-stack engineers must navigate both relational (RDBMS) and document-oriented (NoSQL) database paradigms. "
      "The Dual-Engine Query Lab provides side-by-side execution of SQL queries (PostgreSQL dialect) and MongoDB aggregation pipelines."
    )
    p(doc, 
      "The lab translates queries bidirectionally: for example, a relational `SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id HAVING SUM(amount) > 1000` "
      "is rendered alongside its equivalent MongoDB `$group` and `$match` aggregation pipeline. The visual execution plan displays "
      "Index Scan vs Sequential Table Scan cost metrics."
    )

    # -------------------------------------------------------------
    # 5.7 Module 15: Git Graph & UNIX Terminal Sandbox
    # -------------------------------------------------------------
    add_section_heading(doc, "5.7 Module 15: Git Graph & UNIX Terminal Sandbox")
    p(doc, 
      "Proficiency in Git version control and UNIX shell commands is fundamental to software engineering. Yet, students routinely "
      "fear corrupting repositories when performing interactive rebases or merge conflict resolutions."
    )
    p(doc, 
      "The Git Graph Sandbox renders a live visual commit DAG. Executing commands like `git checkout -b feature`, `git commit -m 'feat'`, "
      "`git rebase main`, and `git cherry-pick <hash>` animates commit node transitions in real time. The embedded UNIX terminal "
      "simulates a virtual POSIX shell environment supporting piped utilities (`grep`, `awk`, `sed`, `sort`, `uniq`, `find`), "
      "allowing learners to practice command-line log analysis and text manipulation."
    )

    # -------------------------------------------------------------
    # 5.8 Module 16: REST API Client Studio & Mock Server
    # -------------------------------------------------------------
    add_section_heading(doc, "5.8 Module 16: REST API Client Studio & Mock Server")
    p(doc, 
      "To test and debug HTTP APIs without leaving the browser, SkillTrack incorporates a Postman-like REST Client Studio. "
      "The studio supports GET, POST, PUT, PATCH, and DELETE methods, custom HTTP request headers, query parameter builders, "
      "and JSON request body editing."
    )
    p(doc, 
      "The client formats JSON response payloads with syntax highlighting, header inspection, round-trip timing breakdowns (DNS, TCP, TLS, "
      "TTFB, Content Download), and 1-click cURL and fetch() code snippet generation."
    )

    doc.add_page_break()
