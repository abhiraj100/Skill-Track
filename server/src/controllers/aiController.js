import { runAI } from "../services/aiService.js";

const skillSet = ["React", "JavaScript", "TypeScript", "Node.js", "Express.js", "MongoDB", "REST APIs", "Docker", "AWS", "Testing", "System Design", "Git"];

const interviewQuestionBank = {
  "Frontend Developer": [
    {
      question: "Explain the React Virtual DOM, how reconciliation works, and how the Fiber architecture prevents UI blocking.",
      topic: "React Architecture",
      idealAnswer: "The Virtual DOM is an in-memory representation of real DOM elements. During reconciliation, React diffs previous and next VDOM trees. Fiber introduced incremental rendering, prioritizing user inputs and animations by breaking updates into sliceable work units."
    },
    {
      question: "What are the key differences between useMemo, useCallback, and React.memo, and when might excessive memoization hurt performance?",
      topic: "Performance Optimization",
      idealAnswer: "useMemo caches computed values, useCallback caches function instances, and React.memo prevents re-rendering when props are shallowly equal. Excessive memoization adds memory overhead and comparison cost when components re-render infrequently."
    },
    {
      question: "How do you handle client-side state management in large SPAs, and when would you choose Context vs. Redux Toolkit vs. Server State (TanStack Query)?",
      topic: "State Management",
      idealAnswer: "Local UI state belongs in useState/useReducer. Low-frequency global state (themes, auth) fits React Context. Complex synchronous state suits Redux Toolkit, while remote asynchronous cache is best handled by TanStack Query with automated invalidation."
    }
  ],
  "Backend Developer": [
    {
      question: "How does the Node.js event loop handle asynchronous I/O, microtasks, and macrotasks across different phases?",
      topic: "Node.js Internals",
      idealAnswer: "Node's libuv event loop has phases: timers, pending callbacks, idle/prepare, poll, check (setImmediate), and close callbacks. Microtasks (process.nextTick, Promise callbacks) run immediately between phases and between individual tasks."
    },
    {
      question: "How would you design a rate limiter for a public REST API in Express to prevent abuse and DDoS?",
      topic: "API Security & System Design",
      idealAnswer: "Implement a token bucket or sliding window counter algorithm using Redis. Store IP/API key counts with TTLs. Return 429 Too Many Requests with Retry-After headers when the limit is breached."
    },
    {
      question: "Describe your strategy for database indexing in MongoDB and how you identify slow queries in production.",
      topic: "Databases & Optimization",
      idealAnswer: "Create compound indexes matching query patterns using the Equality, Sort, Range (ESR) rule. Monitor slow queries using MongoDB Database Profiler, explain('executionStats'), and ensure COLLSCANs are eliminated."
    }
  ],
  "Fullstack MERN Developer": [
    {
      question: "Walk through the entire lifecycle of a user authentication request from JWT generation on login to protected route verification in Express.",
      topic: "Security & Auth",
      idealAnswer: "On login, server validates credentials, signs a JWT with payload and secret. Client stores token securely (HTTP-only cookie or memory/auth header). For protected requests, an auth middleware extracts the token, verifies signature with jsonwebtoken, and attaches user to req."
    },
    {
      question: "How do you structure database schemas and transactions in MongoDB when dealing with multi-document updates (e.g. order checkout or enrollment)?",
      topic: "Data Consistency",
      idealAnswer: "For atomic multi-document operations, use MongoDB Multi-Document ACID Transactions with mongoose.startSession() and session.withTransaction(). Balance embedding for high-frequency reads with referencing to prevent document growth."
    },
    {
      question: "Tell me about a challenging bug you encountered in a full-stack JavaScript application and how you systematically diagnosed and resolved it.",
      topic: "Behavioral & Problem Solving",
      idealAnswer: "Describe situation using STAR format: state problem (e.g., race condition in async state or memory leak), reproduction steps, profiling tools (DevTools / node --inspect), root cause analysis, and permanent fix with unit/integration tests."
    }
  ],
  "DevOps & Cloud Engineer": [
    {
      question: "What is the difference between blue-green deployment and canary deployment, and how do you monitor rollout health?",
      topic: "CI/CD & Deployments",
      idealAnswer: "Blue-green maintains two identical environments, switching all router traffic instantly. Canary routes a small percentage (e.g. 5%) of real traffic to the new version first while monitoring error rates, latency, and logs before full migration."
    },
    {
      question: "How do you secure containerized microservices running in Docker and Kubernetes in production?",
      topic: "Cloud Security",
      idealAnswer: "Use non-root container users, minimal base images (Alpine/Distroless), scan CVEs with Trivy, inject secrets via vault/k8s secrets, enforce NetworkPolicies, and apply resource limits."
    }
  ],
  "System Design & Distributed Systems Architect": [
    {
      question: "How would you design a distributed ID generator (like Twitter Snowflake) that guarantees 64-bit integer IDs, K-sorted ordering, and 100,000+ IDs per second per node without central coordination?",
      topic: "Distributed Algorithms & ID Generation",
      idealAnswer: "Allocate bits: 1 sign bit (unused), 41 bits for epoch timestamp (gives ~69 years), 10 bits for datacenter/machine ID (1024 nodes), and 12 bits for sequence number (4096 IDs per millisecond per node). Nodes run independently without inter-node consensus locks."
    },
    {
      question: "Explain the Trade-offs between Eventual Consistency, Linearizability, and Strong Eventual Consistency (CRDTs) when designing high-concurrency real-time collaborative document systems.",
      topic: "Consistency Models & Consensus",
      idealAnswer: "Linearizability requires consensus (Raft/Paxos) on every mutation, sacrificing availability during network partitions. Eventual consistency allows temporary divergence. Conflict-Free Replicated Data Types (CRDTs) or Operational Transformation (OT) ensure strong eventual consistency where concurrent replica edits mathematically commute into an identical state without locking."
    },
    {
      question: "How do you mitigate Cache Stampedes (Thundering Herd) when a high-traffic cache key expires simultaneously for 50,000 concurrent client requests?",
      topic: "Distributed Caching & High Scale",
      idealAnswer: "Techniques: 1) Mutex Locking: only the first cache-miss acquires a distributed lock (e.g. Redlock) to query the DB while other threads sleep or await; 2) Probabilistic Early Expiration (XFetch algorithm): recomputes the cache item asynchronously in the background before the actual hard TTL lapses; 3) Stale-While-Revalidate background hydration."
    }
  ],
  "Enterprise Security & DevSecOps Specialist": [
    {
      question: "Walk through Zero Trust Architecture principles and how you implement mutual TLS (mTLS) and SPIFFE/SPIRE workload identities in Kubernetes service meshes.",
      topic: "Zero Trust & Service Mesh Security",
      idealAnswer: "Zero Trust assumes network breach by default: 'Never trust, always verify'. SPIRE acts as a control plane issuing short-lived X.509 SVID certificates to workloads. Envoy sidecars validate mTLS peer identities cryptographically on every East-West RPC, terminating unauthenticated traffic at the pod boundary."
    },
    {
      question: "How do you protect OAuth2/OIDC implementations against Authorization Code interception, CSRF in callback endpoints, and JWT 'alg: none' spoofing attacks?",
      topic: "Authentication & Cryptographic Security",
      idealAnswer: "Enforce PKCE (Proof Key for Code Exchange) using a high-entropy cryptographically random code_verifier and code_challenge (SHA-256). Bind state parameters in session storage to thwart CSRF. Explicitly whitelist permitted asymmetric JWT signing algorithms (e.g. RS256/ES256) on resource servers and reject tokens with 'alg: none' or mismatched keys."
    }
  ],
  "Behavioral & Leadership": [
    {
      question: "Tell me about a time when you disagreed with a teammate or product manager on a technical architectural decision. How did you resolve it?",
      topic: "Collaboration & Conflict",
      idealAnswer: "Used STAR method: listened actively to their reasoning, gathered benchmark data or prototype evidence, discussed trade-offs collaboratively, aligned on business priorities, and supported the final team decision wholeheartedly."
    },
    {
      question: "Describe a project that fell behind schedule. What steps did you take to manage stakeholder expectations and deliver quality software?",
      topic: "Delivery & Execution",
      idealAnswer: "Identified bottleneck early, communicated transparently with stakeholders, ruthlessly cut non-essential scope into a v2 release, reprioritized critical path features, and delivered a stable MVP without compromising security or core user experience."
    }
  ]
};

export const skillGap = async (req, res, next) => {
  try {
    const { careerGoal = "MERN Stack Developer", skills = [] } = req.body;
    const normalized = skills.map(s => s.toLowerCase());
    const gaps = skillSet.filter(s => !normalized.includes(s.toLowerCase())).slice(0, 6);
    const fallback = JSON.stringify({
      careerGoal,
      score: Math.max(35, 100 - gaps.length * 9),
      strengths: skillSet.filter(s => normalized.includes(s.toLowerCase())).slice(0, 6),
      gaps,
      roadmap: gaps.slice(0, 5).map((skill, i) => ({ order: i + 1, skill, reason: `Build practical ${skill} capability for ${careerGoal}.` }))
    });
    const result = await runAI(`Target role: ${careerGoal}. Current skills: ${skills.join(", ")}. Identify gaps and provide a JSON object with score, strengths, gaps and roadmap.`, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

export const resumeAnalysis = async (req, res, next) => {
  try {
    const text = String(req.body.text || "").slice(0, 12000);
    if (!text.trim()) { res.status(400); throw new Error("Resume text is required"); }
    const fallback = JSON.stringify({
      score: 78,
      strengths: ["Project experience", "Modern web stack", "API development"],
      improvements: ["Add measurable outcomes", "Mention testing and deployment", "Tailor keywords to each job"],
      keywords: ["React", "Node.js", "Express", "MongoDB", "REST API", "Git"]
    });
    const result = await runAI(`Analyze this resume text. Return JSON with score, strengths, improvements and keywords. Resume: ${text}`, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

export const jobMatch = async (req, res, next) => {
  try {
    const { resume = "", jobDescription = "" } = req.body;
    const fallback = JSON.stringify({
      match: 82,
      matched: ["React", "Node.js", "MongoDB", "REST API"],
      missing: ["Docker", "AWS"],
      recommendation: "Good match. Tailor your project bullets and highlight deployment experience."
    });
    const result = await runAI(`Compare resume and job description. Return JSON with match, matched, missing and recommendation. Resume: ${resume.slice(0,6000)} Job: ${jobDescription.slice(0,6000)}`, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

export const mockInterviewQuestions = async (req, res, next) => {
  try {
    const { role = "Fullstack MERN Developer", interviewType = "Technical & Behavioral", difficulty = "Intermediate" } = req.body;
    const categoryQuestions = interviewQuestionBank[role] || interviewQuestionBank["Fullstack MERN Developer"];
    const fallbackQuestions = [
      ...categoryQuestions,
      ...interviewQuestionBank["Behavioral & Leadership"]
    ].slice(0, 4);

    const fallback = JSON.stringify({ questions: fallbackQuestions });
    const prompt = `Generate 4 realistic mock interview questions for a ${difficulty} ${role} role focusing on ${interviewType}. Return a JSON object formatted as: {"questions": [{"question": "...", "topic": "...", "idealAnswer": "..."}]}`;

    const result = await runAI(prompt, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

export const evaluateInterviewAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer = "", role = "Software Engineer", topic = "General" } = req.body;
    if (!userAnswer.trim()) {
      return res.status(400).json({ success: false, message: "User answer is required for evaluation" });
    }

    const wordCount = userAnswer.trim().split(/\s+/).length;
    let baseScore = Math.min(94, Math.max(50, 50 + Math.floor(wordCount * 0.4)));

    const fallback = JSON.stringify({
      score: baseScore,
      clarityScore: Math.min(95, baseScore + 2),
      technicalScore: Math.max(55, baseScore - 4),
      problemSolvingScore: Math.min(92, baseScore + 1),
      feedback: `Strong conceptual direction. You articulated core principles of ${topic} well. To improve, incorporate specific production scenarios and performance metrics.`,
      strengths: [
        "Addressed the primary architectural prompt directly",
        "Demonstrated clear terminology and professional tone",
        "Structured the response logically"
      ],
      improvements: [
        "Include quantifiable metrics (e.g., latency reduction, memory footprints)",
        "Mention real-world edge cases or trade-offs"
      ],
      idealAnswer: `An exemplary answer covers foundational mechanics of ${topic}, trade-offs of chosen patterns, practical debugging tools, and how it directly affects end-user stability.`
    });

    const prompt = `You are a Principal Tech Interviewer evaluating a candidate's answer for a ${role} position.
Question: "${question}"
Topic: "${topic}"
Candidate Answer: "${userAnswer}"

Evaluate their response and return ONLY a JSON object with:
{
  "score": number (0-100),
  "clarityScore": number (0-100),
  "technicalScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "feedback": "2-3 sentences concise critique",
  "strengths": ["bullet 1", "bullet 2"],
  "improvements": ["bullet 1", "bullet 2"],
  "idealAnswer": "concise benchmark answer"
}`;

    const result = await runAI(prompt, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

export const generateCoverLetter = async (req, res, next) => {
  try {
    const { candidateName = "Candidate", careerGoal = "Software Engineer", skills = [], companyName = "the company", jobTitle = "Software Engineer", jobDescription = "", tone = "Professional & Confident" } = req.body;

    const skillsString = skills.length ? skills.join(", ") : "modern web technologies and cloud infrastructure";

    const fallbackCoverLetter = `Dear Hiring Team at ${companyName},

I am writing to express my enthusiastic interest in the ${jobTitle} role. As a ${careerGoal} with hands-on expertise in ${skillsString}, I am passionate about building resilient, performant, and scalable applications that solve real customer problems.

In my recent work, I have focused on designing maintainable architectures, clean RESTful APIs, and responsive, accessible interfaces. Having reviewed ${companyName}'s engineering goals, I am eager to apply my technical background and problem-solving mindset to help your team ship high-impact features.

Thank you for your time and consideration. I welcome the opportunity to discuss how my skill set aligns with your team's upcoming roadmap.

Sincerely,
${candidateName}`;

    const fallbackColdEmail = `Subject: ${jobTitle} application — ${candidateName}

Hi Hiring Team at ${companyName},

I recently saw the ${jobTitle} opening at ${companyName} and wanted to reach out directly.

With a strong foundation in ${skillsString}, I specialize in building reliable, high-performance web products. I've been following ${companyName}'s work and would love to contribute to your engineering velocity.

My portfolio and background are ready for your review. Would you be open to a brief 10-minute chat this week?

Best regards,
${candidateName}`;

    const fallback = JSON.stringify({
      coverLetter: fallbackCoverLetter,
      coldEmail: fallbackColdEmail,
      keyHighlights: [
        `Tailored to ${companyName} for ${jobTitle}`,
        `Spotlights top skills: ${skillsString}`,
        `Calibrated in ${tone} tone`
      ]
    });

    const prompt = `Write a high-converting cover letter and recruiter cold email for ${candidateName} (${careerGoal}) applying for ${jobTitle} at ${companyName}.
Key Candidate Skills: ${skillsString}.
Tone: ${tone}.
Target Job Description: ${jobDescription.slice(0, 2000)}.
Return JSON object: {"coverLetter": "...", "coldEmail": "...", "keyHighlights": ["..."]}`;

    const result = await runAI(prompt, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};
