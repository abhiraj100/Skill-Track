import os
from docx.shared import Inches, Pt, RGBColor
from .helpers import (
    add_chapter_heading, add_section_heading, add_sub_section_heading,
    p, add_callout, style_table, add_code_block, add_diagram_image
)

DIAGRAMS_DIR = "/Users/abhirajyadav/SkillTrack/scripts/diagram_assets"

def add_chapter_3(doc):
    add_chapter_heading(doc, "CHAPTER 3: SOFTWARE REQUIREMENTS SPECIFICATION, HLD, LLD & SYSTEM DIAGRAMS")
    
    p(doc, 
      "This chapter articulates the comprehensive system design and specification for SkillTrack in strict adherence to "
      "IEEE Standard 830-1998 (Recommended Practice for Software Requirements Specifications). It encompasses five user personas, "
      "forty exhaustive functional requirements, non-functional SLAs, High-Level Design (HLD) architecture, Low-Level Design (LLD) "
      "UML class hierarchies, design patterns, end-to-end system workflow diagrams, UML sequence diagrams, state machine specifications, "
      "data flow diagrams (DFDs), Entity-Relationship Diagrams (ERD), and production cloud deployment topologies."
    )

    # -------------------------------------------------------------
    # 3.1 IEEE 830 Compliance & Scope
    # -------------------------------------------------------------
    add_section_heading(doc, "3.1 IEEE 830 Standard Compliance & Scope")
    p(doc, 
      "The IEEE 830 standard mandates that a software requirements specification must be correct, unambiguous, complete, consistent, "
      "ranked for importance, verifiable, modifiable, and traceable. Every requirement specified herein is uniquely identified (FR-01 to FR-40), "
      "categorized across operational domains, and tied directly to validation test cases documented in Chapter 9."
    )

    # -------------------------------------------------------------
    # 3.2 Stakeholder Profiles & User Personas
    # -------------------------------------------------------------
    add_section_heading(doc, "3.2 Stakeholder Profiles & Comprehensive User Personas")
    p(doc, "The system serves five distinct stakeholder archetypes across educational and recruitment lifecycles:")
    
    personas = [
        ("Persona 1: Undergraduate Computer Science Student (Alex Rivera)", 
         "Age 21, 6th Semester B.Tech CSE student at Apex Institute of Technology. Needs to bridge textbook data structures with production engineering. "
         "Frustrated by complex local Minikube setups and expensive cloud bills on his 8 GB RAM laptop. Goals: Master system design QPS calculations, "
         "understand container autoscaling, and build a verified employer portfolio with verifiable digital certificates."),
        
        ("Persona 2: Career-Switching Software Engineer (Maya Lin)", 
         "Age 28, transitioning from manual QA to Full-Stack/DevOps. Needs structured career roadmaps, hands-on microservices pub/sub experience, "
         "and realistic tech salary negotiation data to evaluate competitive job offers and equity vesting schedules."),
        
        ("Persona 3: Academic Professor / Laboratory Instructor (Dr. S. K. Sharma)", 
         "University faculty managing a cohort of 180 students. Needs a zero-cost, zero-maintenance lab platform to demonstrate real-time SQL injection "
         "attacks, OWASP defenses, and concurrency testing without IT department server provisioning or cloud credit grants."),
        
        ("Persona 4: Technical Recruiter / Engineering Hiring Manager (Sarah Jenkins)", 
         "Tech lead reviewing candidate applications. Tired of bloated, unverifiable resumes with copied projects. Needs cryptographically proven "
         "credentials, GitHub telemetry, and live interactive portfolio demonstrations showcasing actual engineering code."),
        
        ("Persona 5: System Administrator / DevOps Lead (David Patel)", 
         "Infrastructure architect evaluating platform reliability. Demands serverless auto-scaling, sub-150ms P99 latency, zero database connection leaks, "
         "and strict Cross-Origin Resource Sharing (CORS) enforcement across dynamic edge domains.")
    ]
    for name, desc in personas:
        p(doc, desc, bold_prefix=f"• {name}: ")

    # -------------------------------------------------------------
    # 3.3 Exhaustive Functional Requirements (FR-01 to FR-40)
    # -------------------------------------------------------------
    add_section_heading(doc, "3.3 Exhaustive Functional Requirements Specification (FR-01 to FR-40)")
    p(doc, "The system architecture mandates forty formal functional requirements categorized across subsystem domains:")

    fr_data_part1 = [
        ["FR-01", "Secure Auth & Session Management", "System shall authenticate users using 256-bit signed JSON Web Tokens (JWT) with bcrypt salt rounds (10), role-based claims (Learner vs Admin), and automatic session persistence in localStorage."],
        ["FR-02", "Session Invalidation & Logout", "System shall invalidate active authentication tokens upon explicit logout and flush local user state."],
        ["FR-03", "Course Enrollment & Lesson Tracker", "System shall maintain user course enrollments, track toggleable lesson completion states, calculate aggregate completion percentages, and update active study streaks."],
        ["FR-04", "Course Catalog Filtering", "System shall allow filtering courses dynamically by category (Cloud, DevOps, Security, Web, Algorithms) and difficulty level."],
        ["FR-05", "Interactive Code Lab Playground", "System shall execute JavaScript algorithmic challenges in an isolated client-side Web Worker thread, evaluate custom test suites, and measure execution latency."],
        ["FR-06", "Web Worker Execution Timeout", "System shall terminate Web Worker threads executing algorithmic code that exceeds a 2,000-millisecond execution boundary to prevent browser freezing."],
        ["FR-07", "Kafka Topic & Partition Hashing", "System shall simulate distributed message publishing across N configurable partitions using MurmurHash3 hashing on message keys, displaying live consumer group offsets."],
        ["FR-08", "Dead-Letter Queue (DLQ) & Backoff", "System shall route failed message consumer deliveries into a dedicated DLQ with exponential retry backoff (1s, 2s, 4s) and maximum retry thresholds."],
        ["FR-09", "Circuit Breaker State Machine", "System shall implement a 3-state circuit breaker (CLOSED, OPEN, HALF-OPEN) that automatically trips open upon exceeding an error threshold percentage, blocking downstream traffic."],
        ["FR-10", "Docker Multi-Stage Layer Builder", "System shall visually construct multi-stage Dockerfiles, inspect cached vs uncached build layers, and compute compressed image artifact footprints."],
        ["FR-11", "Kubernetes HPA Elastic Pod Scaling", "System shall simulate a Kubernetes Horizontal Pod Autoscaler (HPA) that dynamically scales container pod replicas from 1 to 10 when synthetic CPU utilization exceeds 75%."],
        ["FR-12", "Cloud Topology Designer", "System shall provide an interactive multi-tier canvas linking Route53, CloudFront, ALB, ECS, Aurora, Redis, and S3 components with live latency badges."],
        ["FR-13", "Live AWS Cost Estimator", "System shall calculate real-time itemized monthly AWS bills ($/mo) driven by interactive sliders for DAU (1k to 500k), storage (GB), and egress bandwidth (GB/mo)."],
        ["FR-14", "Terraform IaC Code Generation", "System shall compile the active cloud topology into production-ready, downloadable HashiCorp Terraform (main.tf) code matching AWS VPC subnet configurations."],
        ["FR-15", "Interactive SQL Injection Lab", "System shall simulate SQL authentication queries, demonstrating authentication bypass via ' OR '1'='1' against raw concatenated strings vs zero-compromise parameterized statements."]
    ]
    tbl_fr1 = doc.add_table(rows=1, cols=3)
    style_table(tbl_fr1, [1.0, 1.8, 3.7], ["Req ID", "Subsystem Functional Domain", "IEEE 830 Functional Requirement Specification"], fr_data_part1)
    doc.add_paragraph()

    fr_data_part2 = [
        ["FR-16", "Stored XSS & DOMPurify Defense", "System shall simulate an interactive comment feed, executing malicious script payloads in vulnerable modes and neutralizing attacks via DOMPurify contextual HTML encoding."],
        ["FR-17", "JWT Algorithm Confusion Exploit", "System shall provide a 3-part Base64Url token inspector, testing privilege escalation (role: admin) and CVE-2015-9235 'alg: none' verification gate rejections."],
        ["FR-18", "CORS & CSRF Vulnerability Studio", "System shall simulate browser preflight OPTIONS requests, auditing wildcard origins (*) paired with credentials mode and demonstrating SameSite=Strict cookies."],
        ["FR-19", "Concurrency Load Stress Tester", "System shall simulate concurrent Virtual Users (10 to 1,000 VUs) generating synthetic HTTP requests across linear, spike, stress, and soak load profiles."],
        ["FR-20", "Percentile Tail Latency Reservoir", "System shall capture response timings in a streaming reservoir, computing real-time P50, P90, P95, and P99 latency percentiles and HTTP status distributions (2xx/4xx/5xx)."],
        ["FR-21", "Bottleneck Diagnostic Engine", "System shall analyze latency curves to detect connection pool starvation, thread contention, and memory leaks, providing actionable remediation advice."],
        ["FR-22", "k6 Load Test Script Exporter", "System shall generate runnable, standalone k6 JavaScript test scripts reflecting the active VU pacing, URL endpoints, and latency SLA thresholds."],
        ["FR-23", "Core Web Vitals Diagnostic Audit", "System shall simulate Google Lighthouse audits, computing LCP, INP, CLS, FCP, and TTFB scores across diverse website architecture presets."],
        ["FR-24", "Asset Waterfall Timeline", "System shall render a visual asset waterfall diagram detailing size (KB) and download latency (ms) for HTML, CSS, JS bundles, images, and fonts."],
        ["FR-25", "1-Click Performance Remediation", "System shall allow toggling optimizations (code-splitting, AVIF images, font preload, critical CSS) that dynamically recalculate the Lighthouse performance gauge."],
        ["FR-26", "Visual ERD Database Canvas", "System shall model relational database schemas as interactive visual tables with column types, primary key (PK), and foreign key (FK) connection linkages."],
        ["FR-27", "PostgreSQL DDL & Prisma Generator", "System shall automatically compile visual ERD schemas into PostgreSQL CREATE TABLE DDL statements with foreign key constraints and production Prisma schema models."],
        ["FR-28", "Design Tokens & WCAG Contrast", "System shall provide a live design token customizer (HSL palettes, radius, shadows) with real-time WCAG 2.1 AA/AAA contrast ratios and color-blindness simulation."],
        ["FR-29", "Tech Salary & Vesting Simulator", "System shall benchmark engineering total compensation (Base + RSU + Bonus) across 5 tracks and 5 tiers, modeling 4-year equity vesting with appreciation sliders."],
        ["FR-30", "Counter-Offer Negotiation Generator", "System shall evaluate side-by-side job offers and generate data-backed negotiation emails to bridge equity and sign-on bonus gaps."]
    ]
    tbl_fr2 = doc.add_table(rows=1, cols=3)
    style_table(tbl_fr2, [1.0, 1.8, 3.7], ["Req ID", "Subsystem Functional Domain", "IEEE 830 Functional Requirement Specification"], fr_data_part2)
    doc.add_paragraph()

    fr_data_part3 = [
        ["FR-31", "ReDoS Catastrophic Backtracking", "System shall statically scan regular expressions for nested quantifiers with overlapping sub-patterns, evaluating O(N) vs O(2^N) complexity with adversarial stress testing."],
        ["FR-32", "CI/CD Pipeline DAG Studio", "System shall render multi-stage CI/CD pipelines as Directed Acyclic Graphs (DAGs) with simulated log streaming and injectable failure stages."],
        ["FR-33", "1v1 Code Duel Matchmaking", "System shall match two learners in a real-time timed coding competition within ±150 ELO rating points."],
        ["FR-34", "ELO Rating Calculation Engine", "System shall dynamically adjust player ratings following match outcomes using the official FIDE ELO formula with K=32/24/16 weighting."],
        ["FR-35", "AI Mock Interview STAR Rubric", "System shall evaluate candidate interview responses across 4 dimensions (0-25 each, 100 total) adhering to the STAR methodology."],
        ["FR-36", "ATS Resume Studio & PDF Export", "System shall import user credentials into an ATS-optimized resume builder, compute keyword optimization scores, and export printable PDF formats."],
        ["FR-37", "Cryptographic Certificate Provenance", "System shall generate tamper-proof course completion certificates with unique verification IDs and SHA-256 digests, searchable via a public verification portal."],
        ["FR-38", "Live Developer Portfolio Showcase", "System shall generate a public portfolio URL for each student displaying interactive studio demonstrations, certificates, and GitHub activity."],
        ["FR-39", "Pomodoro Focus Station Audio", "System shall synthesize client-side binaural brown noise and ambient rain sounds via the Web Audio API without external streaming."],
        ["FR-40", "Mind Gym Cognitive Teasers", "System shall present 60-second micro-challenges (regex, bitwise, graph) during scheduled study breaks to refresh cognitive focus."]
    ]
    tbl_fr3 = doc.add_table(rows=1, cols=3)
    style_table(tbl_fr3, [1.0, 1.8, 3.7], ["Req ID", "Subsystem Functional Domain", "IEEE 830 Functional Requirement Specification"], fr_data_part3)
    doc.add_paragraph()

    # -------------------------------------------------------------
    # 3.4 Non-Functional Requirements & Performance SLAs
    # -------------------------------------------------------------
    add_section_heading(doc, "3.4 Non-Functional Requirements & Performance SLAs")
    p(doc, "The platform adheres to stringent Non-Functional Requirements (NFRs) codified in Table 3.4:")

    nfr_data = [
        ["Latency SLA (P99)", "P99 latency across all client UI transitions shall remain strictly under 150 milliseconds."],
        ["Edge Cold-Start Velocity", "Initial HTML payload delivery via Vercel edge CDN shall complete within 350 milliseconds."],
        ["Client Compilation Overhead", "Production JavaScript bundle shall compile cleanly with zero warnings in under 3.0 seconds."],
        ["Security Hardening", "All authentication endpoints shall enforce bcrypt salt rounds (10) and strict CORS origin matching."],
        ["Accessibility Compliance", "Color contrast ratios across all palettes shall pass WCAG 2.1 Level AA (4.5:1) for standard text."],
        ["High Availability SLA", "The serverless backend and MongoDB Atlas cluster shall maintain an operational uptime of 99.9%."],
        ["Mean Time to Recovery (MTTR)", "In the event of an uncaught React render exception, React ErrorBoundary shall restore UI in <1.0s."],
        ["Recovery Point Objective (RPO)", "Persistent document data in MongoDB Atlas shall have continuous automated point-in-time recovery."],
        ["Recovery Time Objective (RTO)", "Serverless compute failover to secondary Anycast edge regions shall execute in under 30 seconds."]
    ]
    tbl_nfr = doc.add_table(rows=1, cols=2)
    style_table(tbl_nfr, [2.2, 4.3], ["Non-Functional Dimension", "Service Level Agreement (SLA) & Engineering Target"], nfr_data)
    doc.add_paragraph()

    # -------------------------------------------------------------
    # 3.5 HIGH-LEVEL DESIGN (HLD) ARCHITECTURE TOPOLOGY
    # -------------------------------------------------------------
    add_section_heading(doc, "3.5 High-Level Design (HLD) Architecture Topology")
    p(doc, 
      "The High-Level Design (HLD) of SkillTrack models the macro-architectural decomposition across three tiers: "
      "Client Single-Page Application, Serverless Edge Compute Gateway, and Persistent Cloud Cluster. "
      "Figure 3.1 illustrates the complete High-Level Architecture topology:"
    )

    # Embed HLD Diagram Image
    hld_img_path = os.path.join(DIAGRAMS_DIR, "hld_architecture.png")
    add_diagram_image(doc, hld_img_path, "Figure 3.1: SkillTrack High-Level Design (HLD) Architecture Topology")

    p(doc, 
      "The High-Level Design enforces strict separation of concerns across tiers:\n"
      "1. Client Tier (React 18 SPA): Executes entirely inside the user's browser, offloading 95% of stateful simulations into client memory.\n"
      "2. Serverless Edge Gateway Tier (Vercel Anycast Edge): Serves static assets from edge points of presence (PoPs) with sub-40ms TTFB, "
      "while proxying API requests through an Express.js serverless micro-container.\n"
      "3. Persistence Tier (MongoDB Atlas Cloud): Multi-AZ document database cluster running WiredTiger engine with snappy block compression."
    )

    # -------------------------------------------------------------
    # 3.6 LOW-LEVEL DESIGN (LLD) CLASS MODEL & DESIGN PATTERNS
    # -------------------------------------------------------------
    add_section_heading(doc, "3.6 Low-Level Design (LLD) Class Model & Design Patterns")
    p(doc, 
      "The Low-Level Design (LLD) codifies the object-oriented structure, class interfaces, method signatures, and software design patterns "
      "governing SkillTrack's domain model. Figure 3.2 illustrates the core UML Class Diagram:"
    )

    # Embed LLD Diagram Image
    lld_img_path = os.path.join(DIAGRAMS_DIR, "lld_class_diagram.png")
    add_diagram_image(doc, lld_img_path, "Figure 3.2: SkillTrack Low-Level Design (LLD) UML Class Model")

    p(doc, "The platform incorporates five classic Gang-of-Four (GoF) design patterns to ensure modularity and extensibility:")
    p(doc, "• Singleton Pattern: The MongoDB connection pooling manager (`connectDB`) maintains a single cached database connection (`cachedConnection`) across serverless function invocations, avoiding connection pool saturation.")
    p(doc, "• Strategy Pattern: Authentication mechanisms and cryptographic hashing algorithms (MurmurHash3 vs bcrypt vs SHA-256 HMAC) are implemented as swappable strategy classes.")
    p(doc, "• Observer Pattern: The Kafka Event Bus topic coordinator dispatches published messages to multiple consumer groups registered as decoupled event listeners.")
    p(doc, "• State Pattern: The Circuit Breaker subsystem encapsulates CLOSED, OPEN, and HALF-OPEN operational modes into distinct state handlers.")
    p(doc, "• Factory Pattern: The Algorithmic Code Lab dynamically instantiates language-specific Web Worker harnesses based on the selected execution target (JavaScript vs Python vs C++).")

    # -------------------------------------------------------------
    # 3.7 SYSTEM WORKFLOW DIAGRAMS
    # -------------------------------------------------------------
    add_section_heading(doc, "3.7 Comprehensive System Workflow Diagrams")
    p(doc, "System workflows model the temporal sequence of activities and decision branches across primary user and system journeys:")

    # Workflow 1: Learner Journey
    add_sub_section_heading(doc, "3.7.1 End-to-End Student Learner Journey Workflow")
    p(doc, 
      "The student lifecycle begins with JWT registration, progresses through course discovery and hands-on simulation labs, "
      "and culminates in cryptographic certificate issuance and portfolio publishing. Figure 3.3 details this workflow:"
    )
    workflow_learner_path = os.path.join(DIAGRAMS_DIR, "workflow_learner_journey.png")
    add_diagram_image(doc, workflow_learner_path, "Figure 3.3: End-to-End Student Learner Journey Workflow Diagram")

    # Workflow 2: Kafka DLQ Event Flow
    add_sub_section_heading(doc, "3.7.2 Kafka Distributed Event Streaming & DLQ Fault Tolerance Workflow")
    p(doc, 
      "Figure 3.4 details message ingestion, MurmurHash3 partition routing, consumer offset commits, exponential backoff retries, "
      "and Dead-Letter Queue (DLQ) quarantine logic:"
    )
    workflow_kafka_path = os.path.join(DIAGRAMS_DIR, "workflow_kafka_dlq.png")
    add_diagram_image(doc, workflow_kafka_path, "Figure 3.4: Kafka Distributed Event Streaming & DLQ Fault Tolerance Workflow Diagram")

    # Workflow 3: Code Duel Real-Time Arena
    add_sub_section_heading(doc, "3.7.3 1v1 Real-Time Code Duel Arena Competitive Workflow")
    p(doc, 
      "Figure 3.5 illustrates the matchmaking queue, real-time code editor synchronization, Web Worker test runner, "
      "and FIDE ELO rating calibration workflow:"
    )
    workflow_duel_path = os.path.join(DIAGRAMS_DIR, "workflow_codeduel.png")
    add_diagram_image(doc, workflow_duel_path, "Figure 3.5: 1v1 Real-Time Code Duel Arena Competitive Workflow Diagram")

    # -------------------------------------------------------------
    # 3.8 FORMAL UML SEQUENCE DIAGRAMS
    # -------------------------------------------------------------
    add_section_heading(doc, "3.8 Formal UML Sequence Diagrams")
    p(doc, "Sequence diagrams model inter-object message exchanges across asynchronous temporal lifecycles:")

    add_code_block(
        doc,
        "SEQUENCE DIAGRAM 1: JWT AUTHENTICATION & SESSION ISSUANCE\n"
        "User Browser                Vercel Edge Gateway          MongoDB Atlas\n"
        "     |                               |                         |\n"
        "     |--- POST /api/auth/login ----->|                         |\n"
        "     |    { email, password }        |                         |\n"
        "     |                               |--- findOne({ email }) ->|\n"
        "     |                               |<-- User Document -------|\n"
        "     |                               |\n"
        "     |                               | [bcrypt.compare(pwd)]\n"
        "     |                               | [jwt.sign({ userId }, secret, 7d)]\n"
        "     |<-- 200 OK { token, user } ----|\n"
        "     |\n"
        "     | [Store token in localStorage]\n"
        "     | [Set AuthContext state]\n\n"
        "SEQUENCE DIAGRAM 2: COURSE COMPLETION & SHA-256 HMAC CERTIFICATE ISSUANCE\n"
        "User Browser                Vercel Edge Gateway          MongoDB Atlas\n"
        "     |                               |                         |\n"
        "     |--- POST toggle last lesson -->|                         |\n"
        "     |                               |--- Update Enrollment -->|\n"
        "     |                               |<-- Progress = 100% -----|\n"
        "     |                               |\n"
        "     |                               | [Generate UUID certificateCode]\n"
        "     |                               | [HMAC-SHA256(payload, secret)]\n"
        "     |                               |--- insert Certificate ->|\n"
        "     |                               |<-- Write Acknowledged --|\n"
        "     |<-- 201 Created { certCode } --|\n"
        "     | [Render Confetti & Download PDF]",
        "Listing 3.1: Formal UML Sequence Diagrams for Authentication and Certificate Issuance"
    )

    # -------------------------------------------------------------
    # 3.9 UML STATE MACHINE DIAGRAMS
    # -------------------------------------------------------------
    add_section_heading(doc, "3.9 UML State Machine Diagrams")
    p(doc, 
      "State machines model reactive system transitions. Below is the formal transition matrix for the Three-State Circuit Breaker:"
    )

    add_code_block(
        doc,
        "+-----------------------------------------------------------------------------------+\n"
        "|                 CIRCUIT BREAKER FORMAL STATE MACHINE SPECIFICATION                |\n"
        "+-----------------------------------------------------------------------------------+\n"
        "                   +-------------------------+\n"
        "                   |         CLOSED          | <-------------------+\n"
        "                   | (Normal Operations)     |                     |\n"
        "                   +-------------------------+                     |\n"
        "                                |                                  |\n"
        "                                | Failure Rate > 50%               |\n"
        "                                v                                  | 3 Consecutive\n"
        "                   +-------------------------+                     | 200 OK Probes\n"
        "                   |          OPEN           |                     |\n"
        "                   | (Fail-Fast Block Mode)  |                     |\n"
        "                   +-------------------------+                     |\n"
        "                                |                                  |\n"
        "                                | Recovery Timeout (10,000ms)      |\n"
        "                                v                                  |\n"
        "                   +-------------------------+                     |\n"
        "                   |        HALF-OPEN        | --------------------+\n"
        "                   | (Canary Probe Traffic)  |\n"
        "                   +-------------------------+\n"
        "                                |\n"
        "                                +---> Any Probe Failure ---> (Reset to OPEN)\n"
        "+-----------------------------------------------------------------------------------+",
        "Figure 3.6: Three-State Circuit Breaker State Transition Machine"
    )

    # -------------------------------------------------------------
    # 3.10 MULTI-LEVEL DATA FLOW DIAGRAMS (DFD)
    # -------------------------------------------------------------
    add_section_heading(doc, "3.10 Multi-Level Data Flow Diagrams (DFDs)")
    p(doc, 
      "The system data exchange is formally modeled across three abstraction tiers:\n"
      "• Level 0 Context DFD: Represents the global boundary between external entities (Student Learner, Admin, Recruiter) and SkillTrack.\n"
      "• Level 1 Subsystem DFD: Decomposes data flows between the Authentication Manager, Simulation Virtualization Engine, Curriculum Tracker, and Provenance Ledger.\n"
      "• Level 2 Detailed Process DFD: Traces low-level message flow through the MurmurHash3 partitioner, offset lag registry, and Dead-Letter Queue."
    )

    add_code_block(
        doc,
        "LEVEL 0 CONTEXT DFD:\n"
        " [Student Learner] --------(Credentials / Actions / Code)--------> [ SkillTrack ]\n"
        " [Student Learner] <---(Telemetry / Verifiable Certs / Scores)--- [ Platform   ]\n"
        " [Recruiter]       --------(Verification Code Lookup)------------> [ Subsystems ]\n"
        " [Recruiter]       <---(Cryptographic Proof / Candidate Resume)-- [            ]\n\n"
        "LEVEL 1 SUBSYSTEM DFD:\n"
        " [Input] --> (1.0 Auth Controller) ---------> [User Store]\n"
        "                 |\n"
        "                 v (JWT Verified)\n"
        " [Action] -> (2.0 Simulation Engine) -------> [Telemetry Reservoir] --> (P99 Analytics)\n"
        "                 |\n"
        "                 v (Course Finished)\n"
        "             (3.0 Certificate Engine) ------> [Certificate Store]  --> (Public Provenance)\n\n"
        "LEVEL 2 DETAILED EVENT BUS DFD:\n"
        " [Publish Event] -> (2.1 Key Inspector) -> (2.2 MurmurHash3) -> [Partition Ring]\n"
        "                                                                     |\n"
        "                                                                     v\n"
        " [Consumer Group] <-- (2.4 Offset Commit) <-- (2.3 Dispatcher) <-----+\n"
        "          | (Error > 3)\n"
        "          v\n"
        "      [Dead-Letter Queue (DLQ)]",
        "Figure 3.7: Multi-Level Data Flow Diagrams (DFD Levels 0, 1, and 2)"
    )

    # -------------------------------------------------------------
    # 3.11 ENTITY-RELATIONSHIP DIAGRAM (ERD)
    # -------------------------------------------------------------
    add_section_heading(doc, "3.11 Relational Entity-Relationship Diagram (ERD) Schema Topology")
    p(doc, 
      "The relational data topology maps entities, primary keys (PK), foreign keys (FK), and cardinalities across user accounts, "
      "course curriculums, progress tracking, cryptographic certificates, community posts, and interview sessions. "
      "Figure 3.8 illustrates the complete Entity-Relationship Diagram:"
    )

    # Embed ERD Diagram Image
    erd_img_path = os.path.join(DIAGRAMS_DIR, "erd_schema_diagram.png")
    add_diagram_image(doc, erd_img_path, "Figure 3.8: SkillTrack Relational Entity-Relationship Diagram (ERD)")

    # -------------------------------------------------------------
    # 3.12 PRODUCTION CLOUD DEPLOYMENT TOPOLOGY
    # -------------------------------------------------------------
    add_section_heading(doc, "3.12 Production Cloud Deployment Infrastructure Diagram (AWS VPC)")
    p(doc, 
      "Figure 3.9 illustrates the complete multi-tier AWS infrastructure topology generated by the Cloud Architect Studio, "
      "featuring an isolated VPC (10.0.0.0/16), public subnets for Application Load Balancers, private subnets for ECS Fargate containers, "
      "and isolated persistence subnets for Aurora Multi-AZ databases and ElastiCache Redis:"
    )

    # Embed Cloud Topology Diagram Image
    cloud_img_path = os.path.join(DIAGRAMS_DIR, "cloud_deployment_topology.png")
    add_diagram_image(doc, cloud_img_path, "Figure 3.9: Production Multi-Tier Cloud Deployment Topology (AWS VPC)")

    doc.add_page_break()
