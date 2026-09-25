from docx.shared import Inches, Pt, RGBColor
from .helpers import (
    add_chapter_heading, add_section_heading, add_sub_section_heading,
    p, add_callout, style_table, add_code_block
)

def add_chapter_1(doc):
    add_chapter_heading(doc, "CHAPTER 1: INTRODUCTION & PEDAGOGICAL CONTEXT")
    
    # 1.1 Context & Background
    add_section_heading(doc, "1.1 Context, Motivation & Historical Background")
    p(doc, 
      "The global software engineering landscape is undergoing an unprecedented paradigm shift. Modern enterprise computing "
      "is no longer defined by monolithic server architectures executing synchronous database queries on single bare-metal servers. "
      "Instead, contemporary digital platforms are decentralized, asynchronous, event-driven, containerized, and elastically scaled "
      "across heterogeneous multi-cloud environments. Modern software engineers are expected to master distributed messaging queues "
      "(Apache Kafka, RabbitMQ), container orchestration (Docker, Kubernetes), immutable Infrastructure as Code (Terraform), "
      "stringent application security protocols (OWASP Top 10, Zero-Trust, SameSite cookies), sub-millisecond tail latency optimization (P99 SLAs), "
      "and complex compensation equity vesting structures."
    )
    p(doc, 
      "In stark contrast, undergraduate computer science and software engineering curricula have historically struggled to adapt to "
      "the velocity of cloud-native industrial practices. As documented in the ACM/IEEE-CS Computer Science Curricula Guidelines, "
      "university courses continue to focus predominantly on foundational theory—such as asymptotic algorithmic complexity, basic relational schema "
      "normalization, and rudimentary client-server socket programming—while leaving production distributed systems, container orchestration, "
      "and cloud cost economics to post-graduate on-the-job training. This structural mismatch creates a severe 'competency chasm' for graduating students."
    )
    p(doc, 
      "SkillTrack was conceived and engineered as a comprehensive, academic-grade solution to this systemic pedagogical gap. "
      "By integrating twenty-four interactive engineering studios into a single-page application (SPA) backed by serverless edge infrastructure, "
      "SkillTrack provides undergraduate engineering students with zero-friction, zero-install, hands-on laboratories that simulate "
      "complex distributed systems, container build caches, security exploits, and concurrency profiling entirely inside the browser."
    )

    # 1.2 Problem Statement
    add_section_heading(doc, "1.2 Formal Problem Statement & The Competency Chasm")
    p(doc, 
      "Undergraduate computer science education currently suffers from three acute structural barriers:\n"
      "1. The Hardware & Setup Barrier: Setting up production-grade distributed infrastructure—such as an Apache Kafka multi-broker cluster, "
      "a local Kubernetes cluster (Minikube / k3s), or a multi-tier AWS environment—requires 16+ GB of RAM and complex OS-specific CLI tools. "
      "Students with low-specification laptops are immediately excluded from practical experimentation.\n"
      "2. The Cloud Billing & Financial Barrier: Modern cloud platforms (AWS, Google Cloud, Azure) require credit card registration. "
      "Students routinely fear accidental cloud resource provisioning, where an unmonitored NAT Gateway or multi-AZ database instance can incur "
      "hundreds of dollars in unexpected charges. Consequently, students avoid hands-on cloud architecture practice.\n"
      "3. The Passive Learning Trap: Mainstream online learning platforms (e.g., Coursera, Udemy) rely overwhelmingly on passive video lectures "
      "and multiple-choice quizzes. Research in cognitive psychology (Kolb's Experiential Learning Model) demonstrates that abstract technical concepts "
      "are internalized effectively only when learners actively manipulate variables, observe immediate system feedback, and debug simulated failures."
    )

    add_callout(
        doc,
        "Formal Problem Statement: Traditional computer science curricula lack an accessible, zero-cost, and hands-on laboratory environment "
        "that allows undergraduate students to interactively design, stress-test, and debug enterprise distributed systems, container workflows, "
        "cloud topologies, and security vulnerability mitigations without incurring local hardware bottlenecks or commercial cloud billing risks.",
        "FORMAL RESEARCH PROBLEM STATEMENT"
    )

    # 1.3 Objectives
    add_section_heading(doc, "1.3 Formal Research & Engineering Objectives")
    p(doc, "To resolve the aforementioned challenges, the SkillTrack project formulated five formal engineering and research objectives:")
    
    objectives = [
        ("Objective 1: In-Browser Distributed Systems Virtualization", 
         "Develop client-side mathematical and discrete-event simulation models for Apache Kafka partition key hashing (MurmurHash3), "
         "consumer group offset management, consumer lag tracking, Dead-Letter Queues (DLQs), and three-state circuit breakers, "
         "operating with sub-10ms UI responsiveness inside standard web browsers."),
        ("Objective 2: Visual Cloud Infrastructure & Financial Modeling", 
         "Architect an interactive drag-and-drop cloud topology designer linked to real-time AWS pricing algorithms, enabling students to "
         "visually construct multi-tier architectures (ALB, ECS Fargate, Aurora Multi-AZ, Redis, S3), dynamically calculate itemized monthly costs "
         "driven by DAU and bandwidth sliders, and automatically export syntactically valid HashiCorp Terraform (main.tf) code."),
        ("Objective 3: Ethical OWASP Security & Concurrency Laboratories", 
         "Engineer safe, client-side sandbox environments demonstrating SQL injection (raw vs parameterized), stored XSS (DOMPurify sanitization), "
         "JWT algorithm confusion (CVE-2015-9235), and concurrency load testing (10-1,000 VUs) computing P50, P90, and P99 tail latencies."),
        ("Objective 4: Cryptographic Academic Provenance Ledger", 
         "Implement an immutable credential verification subsystem that generates tamper-proof SHA-256 HMAC digital signatures for completed "
         "course certifications, allowing recruiters and institutions to independently verify candidate authenticity via public verification endpoints."),
        ("Objective 5: Empirical Educational Efficacy Validation", 
         "Conduct a controlled empirical study with an active cohort of 120 undergraduate students at Apex Institute of Technology, measuring "
         "pre-test and post-test knowledge retention gains, learning velocity, and standardized System Usability Scale (SUS) scores.")
    ]
    for title, desc in objectives:
        p(doc, desc, bold_prefix=f"• {title}: ")

    # 1.4 Methodology & Work Breakdown Structure
    add_section_heading(doc, "1.4 Research Methodology & Project Lifecycle")
    p(doc, 
      "The project followed an Agile-Scrum iterative software engineering methodology combined with rigorous empirical evaluation. "
      "Development was partitioned across eight distinct phases over a 24-week lifecycle, detailed in Table 1.1:"
    )

    wbs_data = [
        ["Phase 1: Domain Analysis & IEEE 830 SRS", "Weeks 1 - 3", "Stakeholder interviews, user persona creation, 30 functional requirements", "Approved SRS Document"],
        ["Phase 2: Architectural & UX System Design", "Weeks 4 - 6", "Tailwind design system, token definitions, C4 topology, Mongoose schemas", "Wireframes & Schema DDL"],
        ["Phase 3: Core Simulation Engines (Part I)", "Weeks 7 - 10", "Kafka partition hasher, Docker multi-stage cache, K8s HPA autoscaler", "Interactive Modules 1-8"],
        ["Phase 4: Developer Tooling & Duels (Part II)", "Weeks 11 - 14", "ReDoS AST parser, CI/CD DAG, 1v1 Code Duel with ELO rating, UNIX shell", "Interactive Modules 9-16"],
        ["Phase 5: Career, Pedagogy & AI (Part III)", "Weeks 15 - 18", "AI Mock Interviewer with STAR rubric, ATS Resume Builder, Focus Station", "Interactive Modules 17-24"],
        ["Phase 6: Quality Assurance & Security Audit", "Weeks 19 - 20", "50-case automated test suite, OWASP Top 10 defense verification, k6 load testing", "Zero Critical CVEs / Tests Passed"],
        ["Phase 7: Serverless Edge Cloud Deployment", "Weeks 21 - 22", "Vercel edge CDN setup, dynamic CORS regex hardening, MongoDB Atlas pooling", "Live Production URL"],
        ["Phase 8: Empirical Cohort Study & Defense", "Weeks 23 - 24", "120-student pre/post testing, System Usability Scale survey, final thesis", "Empirical Evaluation Thesis"]
    ]
    tbl_wbs = doc.add_table(rows=1, cols=4)
    style_table(tbl_wbs, [1.8, 1.1, 2.3, 1.3], ["Development Phase", "Timeline", "Core Activities & Engineering Milestones", "Deliverables"], wbs_data)
    doc.add_paragraph()

    # 1.5 Scope, Boundaries & Constraints
    add_section_heading(doc, "1.5 Scope, Technical Boundaries & Operating Constraints")
    p(doc, 
      "To ensure deep pedagogical focus and operational reliability, the project established clear boundary constraints:\n"
      "• In-Scope: In-browser discrete simulation of distributed event messaging, container caching, cloud cost modeling, security sandboxes, "
      "concurrency tail latency analytics, relational schema compilation, competitive peer coding with ELO ratings, and cryptographic credential verification.\n"
      "• Out-of-Scope: Hosting native hypervisor-level virtual machines (e.g., QEMU) on university servers, issuing physical paper diplomas, "
      "or replacing institutional degree accreditations.\n"
      "• Target Hardware Baseline: Any commodity laptop or desktop computer with at least 2 GB of RAM running a modern ECMAScript 2022+ compliant browser "
      "(Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge) with active internet connectivity."
    )

    # 1.6 Report Organization
    add_section_heading(doc, "1.6 Dissertation Structure & Organization")
    p(doc, 
      "The remainder of this dissertation is organized as follows:\n"
      "• Chapter 2 presents a critical literature review of existing pedagogical platforms and theoretical foundations.\n"
      "• Chapter 3 details the Software Requirements Specification (SRS) conforming to IEEE 830, user personas, and architectural topologies.\n"
      "• Chapters 4, 5, and 6 provide comprehensive deep-dives into the twenty-four operational subsystems of SkillTrack.\n"
      "• Chapter 7 articulates the database design, twelve data dictionaries, indexing strategies, and Prisma ORM schemas.\n"
      "• Chapter 8 formalizes eight core algorithms and mathematical models deployed across the platform.\n"
      "• Chapter 9 outlines the quality assurance strategy, 50-test-case validation matrix, and OWASP Top 10 security hardening.\n"
      "• Chapter 10 analyzes serverless edge deployment, CORS dynamic filtering, and a 5-year institutional cost economics study.\n"
      "• Chapter 11 discusses the empirical evaluation and experimental findings from the 120-student study at Apex Institute of Technology.\n"
      "• Chapter 12 concludes the dissertation and outlines a visionary five-year research roadmap.\n"
      "• Appendices A through F provide the complete REST API catalog, Terraform IaC, Prisma schema, and k6 stress scripts, followed by 50+ IEEE references."
    )

    doc.add_page_break()
