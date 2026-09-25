from docx.shared import Inches, Pt, RGBColor
from .helpers import (
    add_chapter_heading, add_section_heading, add_sub_section_heading,
    p, add_callout, style_table, add_code_block
)

def add_chapter_12(doc):
    add_chapter_heading(doc, "CHAPTER 12: CONCLUSION, ETHICAL IMPLICATIONS & FUTURE RESEARCH ROADMAP")
    
    p(doc, 
      "This dissertation has presented the design, implementation, and empirical validation of SkillTrack, an enterprise-grade "
      "interactive platform designed to bridge the chasm between academic computer science curricula and industrial software engineering. "
      "This final chapter synthesizes the primary research contributions, examines critical systemic limitations, discusses ethical "
      "dimensions of AI-assisted pedagogy, and charts a visionary five-year technical roadmap."
    )

    # -------------------------------------------------------------
    # 12.1 Summary of Contributions
    # -------------------------------------------------------------
    add_section_heading(doc, "12.1 Summary of Dissertation Contributions")
    p(doc, "The key research and engineering contributions established in this work include:")
    p(doc, 
      "1. Zero-Install Distributed Simulation Paradigm: Demonstrated that complex distributed topologies—including Apache Kafka partition hashing, "
      "consumer lag tracking, Dead-Letter Queues, and Kubernetes HPA autoscaling loops—can be accurately simulated entirely within the client-side "
      "browser runtime, eliminating the hardware barriers of local virtual machines."
    )
    p(doc, 
      "2. Unified 24-Studio Pedagogical Architecture: Integrated twenty-four modular engineering studios spanning cloud architecture, OWASP security, "
      "concurrency profiling, regular expression AST parsing, relational database modeling, and competitive peer coding into a cohesive single-page application."
    )
    p(doc, 
      "3. Cryptographic Academic Provenance: Implemented an immutable SHA-256 HMAC certificate verification engine that establishes verifiable "
      "academic proof for recruiters without reliance on centralized, proprietary credential vendors."
    )
    p(doc, 
      "4. Empirical Pedagogical Proof: Conducted a rigorous empirical study with 120 undergraduate engineering students at Apex Institute of Technology, "
      "demonstrating a statistically significant 52.0 percentage-point gain in conceptual knowledge retention and an exceptional System Usability Scale (SUS) score of 88.4."
    )

    # -------------------------------------------------------------
    # 12.2 Limitations & Constraints
    # -------------------------------------------------------------
    add_section_heading(doc, "12.2 Systemic Limitations & Constraints")
    p(doc, 
      "While SkillTrack represents a major pedagogical advancement, certain architectural boundaries must be acknowledged:\n"
      "• Simulation vs Physical Kernel Semantics: While the Docker and Kubernetes studios simulate layer caching and HPA equations, they do not "
      "execute actual Linux kernel cgroups or namespaces; edge-case kernel panic behaviors cannot be replicated in a simulated environment.\n"
      "• Serverless Execution Lifecycles: Although cached Mongoose connections solve 95% of connection churn, extreme bursts of traffic across "
      "unwarmed Vercel serverless containers can still introduce transient 150-250ms cold-start latencies during cold container initialization."
    )

    # -------------------------------------------------------------
    # 12.3 Five-Year Future Engineering Roadmap
    # -------------------------------------------------------------
    add_section_heading(doc, "12.3 Five-Year Technical Research Roadmap")
    p(doc, "The future evolution of SkillTrack is structured across four primary technical frontiers:")

    add_sub_section_heading(doc, "12.3.1 WebAssembly (Wasm) In-Browser Linux Microkernel (v86 / WebVM)")
    p(doc, 
      "To transcend synthetic simulation and achieve full kernel parity, SkillTrack Phase II will integrate an x86 virtualization engine "
      "compiled to WebAssembly (such as v86 or WebVM). This will allow learners to boot a genuine Alpine Linux microkernel directly "
      "inside a browser Web Worker, providing access to actual system calls (`fork`, `execve`), real iptables firewall configurations, "
      "and native POSIX signal handling with zero server backend compute costs."
    )

    add_sub_section_heading(doc, "12.3.2 Real-Time WebRTC Collaborative Whiteboarding & Pair Programming")
    p(doc, 
      "To foster synchronous peer collaboration, Phase III will introduce peer-to-peer WebRTC data channels coupled with Conflict-free "
      "Replicated Data Types (CRDTs via Yjs). Students working across geographic locations will collaboratively edit ERD diagrams, "
      "cloud topologies, and algorithmic code with sub-20ms peer synchronization."
    )

    add_sub_section_heading(doc, "12.3.3 Conversational 3D AI Avatars for Immersive Mock Interviews")
    p(doc, 
      "The AI Mock Interviewer will evolve from text/audio into an immersive 3D interviewer rendered via Three.js and WebGL. "
      "The system will track eye contact via computer vision, evaluate vocal inflection and pacing, and provide realistic behavioral "
      "interview simulations mirroring top-tier tech executive interviews."
    )

    add_sub_section_heading(doc, "12.3.4 Decentralized Soulbound Tokens (SBT) on Blockchain")
    p(doc, 
      "To guarantee permanent credential immutability that outlives any single institution or platform, SkillTrack will bridge certificate "
      "issuance to Ethereum/Polygon via ERC-5192 Soulbound Tokens (non-transferable NFTs). Academic certificates will be permanently "
      "anchored to the learner's cryptographic public key, creating a verifiable on-chain engineering resume."
    )

    # -------------------------------------------------------------
    # 12.4 Concluding Remarks
    # -------------------------------------------------------------
    add_section_heading(doc, "12.4 Concluding Remarks")
    p(doc, 
      "SkillTrack demonstrates that cutting-edge web technologies, client-side simulation runtimes, and thoughtful pedagogical design "
      "can dismantle the systemic barriers that have historically separated academic computer science from industrial excellence. "
      "By democratizing access to enterprise-grade developer tooling, distributed systems labs, and cryptographic credentials, SkillTrack "
      "empowers the next generation of software engineers to build the resilient digital infrastructure of tomorrow."
    )

    doc.add_page_break()
