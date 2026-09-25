from docx.shared import Inches, Pt, RGBColor
from .helpers import (
    add_chapter_heading, add_section_heading, add_sub_section_heading,
    p, add_callout, style_table, add_code_block
)

def add_chapter_6(doc):
    add_chapter_heading(doc, "CHAPTER 6: CORE SUBSYSTEM IMPLEMENTATION — PART III (CAREER, PEDAGOGY & ARTIFICIAL INTELLIGENCE)")
    
    p(doc, 
      "This chapter analyzes the third operational suite of SkillTrack, comprising Modules 17 through 24. These subsystems focus on "
      "career acceleration, collaborative peer learning, generative AI mock interviews, algorithmic problem solving, structured "
      "pedagogical pathways, automated resume parsing, public portfolio provenance, and cognitive productivity."
    )

    # -------------------------------------------------------------
    # 6.1 Module 17: Global Engineering Leaderboard & Streaks
    # -------------------------------------------------------------
    add_section_heading(doc, "6.1 Module 17: Global Engineering Leaderboard & Gamification Engine")
    p(doc, 
      "Gamified learning mechanics drive sustained engagement and prevent student drop-off. The Global Leaderboard tracks weekly "
      "and all-time engineering XP points earned through completed coding challenges, lab modules, and peer duels."
    )
    p(doc, 
      "The engine calculates active study streaks using timezone-aware UTC boundaries. Users earn visual badges across five tier "
      "classifications: Novice, Apprentice, Specialist, Architect, and Grandmaster. Streak freeze items and consistency bonuses incentivize "
      "daily deliberate practice."
    )

    badge_data = [
        ["Novice", "0 - 499 XP", "First Lab Completed, First Code Commit", "Bronze Shield"],
        ["Apprentice", "500 - 1,999 XP", "7-Day Streak, Docker Multi-Stage Master", "Silver Star"],
        ["Specialist", "2,000 - 4,999 XP", "OWASP Security Pro, SQL Query Optimizer", "Gold Crest"],
        ["Architect", "5,000 - 9,999 XP", "High Availability Cloud Master, Kafka DLQ Expert", "Platinum Crown"],
        ["Grandmaster", "10,000+ XP", "Top 1% Global ELO, 50-Day Unbroken Streak", "Diamond Phoenix"]
    ]
    tbl_badge = doc.add_table(rows=1, cols=4)
    style_table(tbl_badge, [1.4, 1.5, 2.3, 1.3], ["Achievement Tier", "XP Requirement", "Milestone Criteria", "Visual Insignia"], badge_data)
    doc.add_paragraph()

    add_code_block(
        doc,
        "// Timezone-Aware UTC Streak Calculation Engine\n"
        "function updateStreak(lastActiveDate, currentStreak) {\n"
        "  const now = new Date();\n"
        "  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());\n"
        "  \n"
        "  if (!lastActiveDate) return { newStreak: 1, lastActive: todayUTC };\n"
        "  \n"
        "  const lastUTC = Date.UTC(lastActiveDate.getUTCFullYear(), lastActiveDate.getUTCMonth(), lastActiveDate.getUTCDate());\n"
        "  const diffDays = Math.floor((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));\n"
        "  \n"
        "  if (diffDays === 0) return { newStreak: currentStreak, lastActive: todayUTC }; // Already counted today\n"
        "  if (diffDays === 1) return { newStreak: currentStreak + 1, lastActive: todayUTC }; // Consecutively active\n"
        "  return { newStreak: 1, lastActive: todayUTC }; // Streak broken, reset to 1\n"
        "}",
        "Listing 6.1: UTC Timezone-Aware Streak Maintenance Algorithm"
    )

    # -------------------------------------------------------------
    # 6.2 Module 18: Peer Study Buddy & Collaborative Network
    # -------------------------------------------------------------
    add_section_heading(doc, "6.2 Module 18: Peer Study Buddy & Collaborative Network")
    p(doc, 
      "Isolated self-study frequently leads to attrition. The Study Buddy network matches students based on shared learning objectives, "
      "target graduation dates, and complementary skill gaps (e.g., pairing a frontend specialist with a distributed systems learner)."
    )
    p(doc, 
      "The community subsystem facilitates peer code reviews, collaborative problem solving, threaded technical discussions, and "
      "upvoting mechanisms. Pinned solution threads provide multi-perspective explanations of complex data structures."
    )

    # -------------------------------------------------------------
    # 6.3 Module 19: AI Technical Mock Interviewer
    # -------------------------------------------------------------
    add_section_heading(doc, "6.3 Module 19: AI Technical Mock Interviewer")
    p(doc, 
      "Technical interviews at premier technology firms evaluate both algorithmic competence and behavioral communication. "
      "The AI Mock Interviewer conducts structured technical screenings combining Speech-to-Text (STT) input with LLM-driven "
      "evaluation rubrics."
    )

    add_sub_section_heading(doc, "6.3.1 STAR Methodology Evaluation Rubric")
    p(doc, 
      "Behavioral responses are parsed against the STAR framework (Situation, Task, Action, Result). The evaluation engine "
      "grades responses across four distinct 25-point dimensions (Total: 100 points):"
    )
    p(doc, "1. Problem Decomposition & Clarification (0-25): Candidate asks clarifying questions, identifies edge cases, and bounds problem scope.")
    p(doc, "2. Algorithmic Correctness & Time/Space Complexity (0-25): Candidate explains Big-O trade-offs and articulates correct data structures.")
    p(doc, "3. Code Cleanliness & Modular Structure (0-25): Proper naming conventions, separation of concerns, and defensive error handling.")
    p(doc, "4. Verbal Communication & STAR Articulation (0-25): Clear narrative structure explaining individual contributions and quantifiable impact.")

    add_code_block(
        doc,
        "// AI Interview Rubric Evaluation Prompt Schema\n"
        "const interviewRubricPrompt = {\n"
        "  systemPrompt: `You are a Principal Software Engineer conducting a L5 interview.\n"
        "  Evaluate the candidate's response across: 1. Clarity, 2. Correctness, 3. Complexity.\n"
        "  Provide feedback in JSON format conforming to the InterviewFeedback schema.`,\n"
        "  schema: {\n"
        "    score: 'number (0-100)',\n"
        "    starBreakdown: { situation: 25, task: 25, action: 25, result: 25 },\n"
        "    strengths: ['string'],\n"
        "    growthAreas: ['string'],\n"
        "    optimalSolutionNotes: 'string'\n"
        "  }\n"
        "};",
        "Listing 6.2: Generative AI Interview Scoring Rubric Schema"
    )

    # -------------------------------------------------------------
    # 6.4 Module 20: Algorithmic Code Lab & Data Structures
    # -------------------------------------------------------------
    add_section_heading(doc, "6.4 Module 20: Algorithmic Code Lab & Data Structures")
    p(doc, 
      "The Algorithmic Code Lab provides an interactive in-browser IDE executing JavaScript, Python, and C++ algorithms. "
      "To prevent malicious infinite loops (`while(true)`) from locking the user's browser UI thread, code execution is sandboxed "
      "within an isolated Web Worker thread with a strict 2,000-millisecond execution timeout."
    )

    add_code_block(
        doc,
        "// Isolated Web Worker Execution Harness with 2,000ms Timeout\n"
        "function executeUserAlgorithm(userCodeStr, testInputs) {\n"
        "  return new Promise((resolve, reject) => {\n"
        "    const workerBlob = new Blob([\n"
        "      `self.onmessage = function(e) {\n"
        "         try {\n"
        "           const userFn = new Function('input', e.data.code);\n"
        "           const startTime = performance.now();\n"
        "           const result = userFn(e.data.input);\n"
        "           const durationMs = performance.now() - startTime;\n"
        "           self.postMessage({ status: 'SUCCESS', result, durationMs });\n"
        "         } catch (err) {\n"
        "           self.postMessage({ status: 'ERROR', message: err.message });\n"
        "         }\n"
        "       };`\n"
        "    ], { type: 'application/javascript' });\n"
        "    \n"
        "    const worker = new Worker(URL.createObjectURL(workerBlob));\n"
        "    const timeoutTimer = setTimeout(() => {\n"
        "      worker.terminate();\n"
        "      reject(new Error('Time Limit Exceeded (TLE): Execution exceeded 2,000ms boundary'));\n"
        "    }, 2000);\n"
        "    \n"
        "    worker.onmessage = (e) => {\n"
        "      clearTimeout(timeoutTimer);\n"
        "      worker.terminate();\n"
        "      resolve(e.data);\n"
        "    };\n"
        "    worker.postMessage({ code: userCodeStr, input: testInputs });\n"
        "  });\n"
        "}",
        "Listing 6.3: Web Worker Sandboxed Execution Harness with Timeout Safeguard"
    )

    # -------------------------------------------------------------
    # 6.5 Module 21: Full-Stack Career Roadmaps
    # -------------------------------------------------------------
    add_section_heading(doc, "6.5 Module 21: Full-Stack Career Roadmaps")
    p(doc, 
      "Aspiring software engineers struggle to navigate the sprawling ecosystem of modern web and cloud technologies. "
      "SkillTrack provides interactive, step-by-step career roadmaps across five specialized tracks: Full-Stack Web Development, "
      "DevOps & Site Reliability Engineering, Distributed Backend Systems, Mobile Development, and AI Engineering."
    )
    p(doc, 
      "Each node in the roadmap graph links directly to interactive lessons, coding challenges, and verification quizzes. "
      "As students complete prerequisites, downstream nodes unlock dynamically, providing clear visual progression toward career readiness."
    )

    # -------------------------------------------------------------
    # 6.6 Module 22: ATS Resume Builder & Optimizer
    # -------------------------------------------------------------
    add_section_heading(doc, "6.6 Module 22: ATS Resume Builder & Semantic Keyword Optimizer")
    p(doc, 
      "Over 75% of engineering resumes are filtered out by automated Applicant Tracking Systems (ATS) prior to human review due to "
      "incompatible formatting, multi-column tables, or missing semantic industry keywords. The ATS Resume Builder solves this problem."
    )
    p(doc, 
      "The builder automatically pulls verified student project metrics, completed labs, and cryptographic certificates into a clean, "
      "single-column, ATS-compliant layout. An integrated natural language analyzer computes a Keyword Match Score (0-100%) against "
      "target job descriptions, flagging missing keywords (e.g., 'Kubernetes', 'CI/CD', 'REST API', 'Redis') and generating PDF exports."
    )

    add_code_block(
        doc,
        "// ATS Keyword Density & Cosine Similarity Evaluation Engine\n"
        "function evaluateResumeATS(resumeText, jobDescriptionText) {\n"
        "  const tokenize = (txt) => txt.toLowerCase().match(/\\b[a-z0-9+#.-]+\\b/g) || [];\n"
        "  const resumeTokens = new Set(tokenize(resumeText));\n"
        "  const targetKeywords = [\n"
        "    'docker', 'kubernetes', 'kafka', 'aws', 'terraform', 'react', 'node',\n"
        "    'rest api', 'graphql', 'mongodb', 'postgresql', 'redis', 'ci/cd', 'owasp'\n"
        "  ];\n"
        "  \n"
        "  const matched = targetKeywords.filter(kw => resumeTokens.has(kw));\n"
        "  const missing = targetKeywords.filter(kw => !resumeTokens.has(kw));\n"
        "  const score = Math.round((matched.length / targetKeywords.length) * 100);\n"
        "  \n"
        "  return { score, matchedKeywords: matched, missingKeywords: missing };\n"
        "}",
        "Listing 6.4: ATS Resume Semantic Keyword Density Evaluation Logic"
    )

    # -------------------------------------------------------------
    # 6.7 Module 23: Live Developer Portfolio Showcase
    # -------------------------------------------------------------
    add_section_heading(doc, "6.7 Module 23: Live Developer Portfolio Showcase")
    p(doc, 
      "Traditional static portfolio websites require manual hosting, domain configuration, and continuous updates. SkillTrack provides "
      "every student with a live, shareable public portfolio URL (`skilltrack.vercel.app/portfolio/:username`)."
    )
    p(doc, 
      "The portfolio showcases interactive demonstrations of completed engineering studios (e.g., embedded live Kafka simulations, "
      "ERD diagrams, and security labs), an automated GitHub commit contribution graph, verified course certificates with tamper-proof "
      "SHA-256 verification hashes, and an interactive skill radar chart."
    )

    # -------------------------------------------------------------
    # 6.8 Module 24: Pomodoro Focus Station & Mind Gym
    # -------------------------------------------------------------
    add_section_heading(doc, "6.8 Module 24: Pomodoro Focus Station & Mind Gym")
    p(doc, 
      "Deep cognitive focus is essential for complex programming and debugging tasks. The Pomodoro Focus Station incorporates a customizable "
      "work/break interval timer (25/5 min classic Pomodoro or 50/10 min deep work)."
    )
    p(doc, 
      "The station includes a client-side Web Audio API sound synthesizer generating binaural brown noise, pink noise, and rain sounds "
      "without external streaming latency. During scheduled breaks, the Mind Gym presents rapid 60-second algorithmic pattern puzzles "
      "designed to refresh cognitive focus without inducing digital fatigue."
    )

    add_code_block(
        doc,
        "// Client-Side Binaural Brown Noise Web Audio API Synthesizer\n"
        "function startBrownNoiseSynthesizer() {\n"
        "  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();\n"
        "  const bufferSize = audioCtx.sampleRate * 2;\n"
        "  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);\n"
        "  const output = noiseBuffer.getChannelData(0);\n"
        "  let lastOut = 0.0;\n"
        "  \n"
        "  for (let i = 0; i < bufferSize; i++) {\n"
        "    const white = Math.random() * 2 - 1;\n"
        "    output[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise single-pole filter\n"
        "    lastOut = output[i];\n"
        "    output[i] *= 3.5; // Gain compensation\n"
        "  }\n"
        "  \n"
        "  const whiteNoise = audioCtx.createBufferSource();\n"
        "  whiteNoise.buffer = noiseBuffer;\n"
        "  whiteNoise.loop = true;\n"
        "  whiteNoise.connect(audioCtx.destination);\n"
        "  whiteNoise.start();\n"
        "  return { stop: () => whiteNoise.stop() };\n"
        "}",
        "Listing 6.5: Web Audio API Client-Side Synthetic Soundscape Engine"
    )

    doc.add_page_break()
