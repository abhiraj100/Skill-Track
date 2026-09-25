from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from .helpers import (
    NAVY_BLUE, SLATE_BLUE, DARK_SLATE, BODY_COLOR, MUTED_COLOR,
    style_table, add_chapter_heading, add_section_heading, p
)

def add_preliminary_pages(doc):
    # ==========================================
    # 1. TITLE PAGE
    # ==========================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(10)
    r_title = p_title.add_run("SKILLTRACK: AN AI-POWERED HIGH-CONCURRENCY DEVELOPER ECOSYSTEM & CAREER READINESS PLATFORM")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY_BLUE

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(28)
    r_sub = p_sub.add_run(
        "A Comprehensive Major Capstone Project Dissertation Submitted in Partial Fulfillment\n"
        "of the Requirements for the Award of the Degree of\n"
        "BACHELOR OF TECHNOLOGY\n"
        "IN\n"
        "COMPUTER SCIENCE AND ENGINEERING"
    )
    r_sub.font.size = Pt(11.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = MUTED_COLOR

    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_after = Pt(12)
    r_by = p_by.add_run("Submitted By:\n")
    r_by.font.size = Pt(11)
    r_by.font.bold = True
    
    r_stu = p_by.add_run("ABHIRAJ YADAV\n")
    r_stu.font.size = Pt(15)
    r_stu.font.bold = True
    r_stu.font.color.rgb = DARK_SLATE
    
    r_roll = p_by.add_run(
        "University Roll Number: 2022CSB1089\n"
        "University Enrollment Number: EN2022-849102\n"
        "Department of Computer Science & Engineering"
    )
    r_roll.font.size = Pt(10.5)
    r_roll.font.color.rgb = MUTED_COLOR

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_before = Pt(24)
    p_guide.paragraph_format.space_after = Pt(30)
    r_guide = p_guide.add_run("Under the Guidance and Supervision of:\n")
    r_guide.font.size = Pt(11)
    r_guide.font.bold = True
    
    r_guide_name = p_guide.add_run("DR. S. K. SHARMA, Ph.D. (IIT Delhi)\n")
    r_guide_name.font.size = Pt(13)
    r_guide_name.font.bold = True
    r_guide_name.font.color.rgb = NAVY_BLUE
    
    r_guide_dept = p_guide.add_run(
        "Professor & Head, Cloud & Distributed Systems Laboratory\n"
        "Department of Computer Science and Engineering"
    )
    r_guide_dept.font.size = Pt(10.5)

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(24)
    r_inst = p_inst.add_run(
        "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\n"
        "APEX INSTITUTE OF TECHNOLOGY & ADVANCED RESEARCH\n"
        "AFFILIATED TO APJ ABDUL KALAM TECHNICAL UNIVERSITY, LUCKNOW\n"
        "ACADEMIC YEAR 2025 – 2026"
    )
    r_inst.font.size = Pt(11)
    r_inst.font.bold = True
    r_inst.font.color.rgb = DARK_SLATE

    doc.add_page_break()

    # ==========================================
    # 2. CERTIFICATE OF APPROVAL
    # ==========================================
    add_chapter_heading(doc, "CERTIFICATE OF APPROVAL")
    
    p(doc, 
      "This is to certify that the Capstone Project Report entitled \"SKILLTRACK: AN AI-POWERED HIGH-CONCURRENCY "
      "DEVELOPER ECOSYSTEM & CAREER READINESS PLATFORM\", submitted by ABHIRAJ YADAV (University Roll No: 2022CSB1089) "
      "in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science "
      "and Engineering at Apex Institute of Technology, is a bonafide record of authentic engineering research and developmental "
      "work carried out under our supervision."
    )
    p(doc, 
      "The engineering artifacts embodied within this project encompass twenty-four full-scale interactive architectural studios, "
      "including distributed pub/sub event brokers (Kafka), container virtualization with Horizontal Pod Autoscaler elasticity "
      "(Docker & Kubernetes), dynamic cloud topology design with live AWS billing calculators, offensive security penetration sandboxing, "
      "concurrency load stress testing up to 1,000 Virtual Users, and relational database schema modeling with automated code generators."
    )
    p(doc, 
      "The results verified and validated in this dissertation have not been submitted to any other university or institute for "
      "the award of any other degree, diploma, or fellowship."
    )

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(50)
    p_sig.paragraph_format.line_spacing = 1.4
    p_sig.add_run(
        "_____________________________\t\t\t_____________________________\n"
        "Dr. S. K. Sharma, Ph.D.\t\t\t\tDr. R. K. Mukherjee, Ph.D.\n"
        "Project Supervisor / Guide\t\t\t\tHead of Department, CSE\n"
        "Professor, Dept. of CSE\t\t\t\tApex Institute of Technology\n\n\n"
        "_____________________________\t\t\t_____________________________\n"
        "External Examiner (Technical)\t\t\tExternal Examiner (Industry)\n"
        "Board of Examinations, AKTU\t\t\tLead Architect, Cloud Systems\n"
        "Date: 25th September, 2026\t\t\tPlace: Greater Noida, India"
    )

    doc.add_page_break()

    # ==========================================
    # 3. DECLARATION OF ORIGINALITY
    # ==========================================
    add_chapter_heading(doc, "DECLARATION OF ORIGINALITY")
    
    p(doc, 
      "I, Abhiraj Yadav, Roll No: 2022CSB1089, student of Bachelor of Technology in Computer Science and Engineering at "
      "Apex Institute of Technology, hereby declare that this capstone project dissertation entitled \"SkillTrack: An AI-Powered "
      "High-Concurrency Developer Ecosystem & Career Readiness Platform\" is an authentic record of my own research, design, "
      "and engineering development performed during the academic period 2025–2026."
    )
    p(doc, 
      "I affirm that this dissertation represents original research. All external code patterns, scientific benchmarks, "
      "industry standards (including RFC 5322, OWASP Top 10, WCAG 2.1, and HashiCorp Terraform HCL specifications), and "
      "literature citations have been scrupulously referenced and attributed in the Bibliography."
    )
    p(doc, 
      "I acknowledge that any breach of academic integrity or plagiarism will render this submission invalid and subject "
      "to disciplinary measures according to institutional regulations."
    )

    p_dec_sig = doc.add_paragraph()
    p_dec_sig.paragraph_format.space_before = Pt(40)
    p_dec_sig.add_run(
        "Abhiraj Yadav\n"
        "Roll No: 2022CSB1089\n"
        "B.Tech Final Year, Computer Science & Engineering\n"
        "Apex Institute of Technology"
    )

    doc.add_page_break()

    # ==========================================
    # 4. ACKNOWLEDGMENTS
    # ==========================================
    add_chapter_heading(doc, "ACKNOWLEDGMENTS")
    
    p(doc, 
      "The completion of this major capstone project marks a defining milestone in my academic and engineering journey. "
      "I express my deepest gratitude to my esteemed project supervisor, Dr. S. K. Sharma, Professor in the Department "
      "of Computer Science and Engineering, for his unflagging intellectual guidance, meticulous code reviews, and profound "
      "insights into distributed computing systems. His rigorous expectations pushed me to achieve commercial-grade quality across "
      "every single module of SkillTrack."
    )
    p(doc, 
      "I extend my sincere appreciation to Dr. R. K. Mukherjee, Head of the Department of Computer Science & Engineering, "
      "and the entire departmental faculty for providing state-of-the-art laboratory facilities, computing infrastructure, and "
      "an environment that fosters high-impact technical innovation."
    )
    p(doc, 
      "I am deeply indebted to the global open-source community—specifically the maintainers of React, Vite, Tailwind CSS, "
      "Express, Mongoose, Lucide Icons, and Vercel—whose exceptional tooling forms the bedrock upon which SkillTrack is built."
    )
    p(doc, 
      "Above all, I owe everything to my parents and family for their unconditional faith, sacrifice, and moral support, "
      "and to my peers whose technical debates and rigorous beta testing sharpened the platform into its present production form."
    )

    doc.add_page_break()

    # ==========================================
    # 5. ABSTRACT
    # ==========================================
    add_chapter_heading(doc, "ABSTRACT")
    
    p(doc, 
      "In the modern computing landscape, aspiring software engineers face an acute structural gap between textbook "
      "academic theory and production engineering reality. While university curricula prioritize isolated algorithmic "
      "puzzles and toy database scripts, commercial industry roles demand mastery over high-concurrency event-driven architectures, "
      "container fleet orchestration, cloud infrastructure economics, offensive and defensive web security, and rigorous "
      "performance engineering. Traditional educational tools remain severely siloed: competitive coding platforms ignore architecture, "
      "video platforms cultivate passive consumption, and real cloud sandboxes incur prohibitive recurring subscription and billing costs.",
      bold_prefix="Problem Statement: "
    )
    p(doc, 
      "To resolve this systemic challenge, this dissertation presents SkillTrack — a unified, full-stack, AI-augmented developer "
      "readiness platform. Built using a reactive single-page architecture (React 18, Vite, Tailwind CSS) decoupled from an "
      "edge-optimized serverless backend (Express.js, Node.js, MongoDB Atlas with connection pooling), SkillTrack consolidates "
      "twenty-four flagship interactive engineering studios into an instantaneous browser environment with zero external server dependencies.",
      bold_prefix="Methodology & Solution: "
    )
    p(doc, 
      "Core technical innovations developed in this project include: (1) An in-browser Kafka & Microservices Event Bus Simulator "
      "modeling MurmurHash3 partition routing, consumer group offsets, dead-letter queue (DLQ) exponential backoff, and circuit breakers; "
      "(2) A Docker & Kubernetes Studio featuring multi-stage Dockerfile layer cache inspection and real-time Horizontal Pod Autoscaler (HPA) "
      "pod elasticity under synthetic CPU load; (3) A Cloud Architecture Studio generating live AWS billing estimations and exportable "
      "HashiCorp Terraform IaC; (4) An Offensive Security Sandbox testing raw vs parameterized SQL queries, DOMPurify XSS defenses, and "
      "JWT 'alg: none' tampering; (5) An API Concurrency Load Tester simulating up to 1,000 Virtual Users (VUs) with P50/P90/P95/P99 latency "
      "percentile reservoir telemetry and automated k6 script export; (6) A Core Web Vitals Audit Studio with network asset waterfalls and "
      "1-click remediation recipes; and (7) An Entity Relationship Diagram (ERD) Studio with automated PostgreSQL DDL and Prisma ORM generators.",
      bold_prefix="Key Contributions: "
    )
    p(doc, 
      "SkillTrack is deployed live to global production edge infrastructure at https://skill-track-make-your-career.vercel.app. "
      "Empirical evaluations demonstrate 100% Core Web Vitals compliance, sub-second edge cold starts, zero compilation warnings across "
      "2,310 transformed modules, and an estimated institutional cloud lab savings of $15,000+ per student cohort per academic year.",
      bold_prefix="Deployment & Impact: "
    )

    doc.add_page_break()

    # ==========================================
    # 6. LIST OF ABBREVIATIONS
    # ==========================================
    add_chapter_heading(doc, "LIST OF ABBREVIATIONS AND ACRONYMS")
    
    abbr_data = [
        ["API", "Application Programming Interface"],
        ["AST", "Abstract Syntax Tree"],
        ["ATS", "Applicant Tracking System"],
        ["AVIF", "AV1 Image File Format (Next-Gen Compressed Media)"],
        ["AWS", "Amazon Web Services"],
        ["BCNF", "Boyce-Codd Normal Form"],
        ["CDN", "Content Delivery Network"],
        ["CI/CD", "Continuous Integration and Continuous Deployment"],
        ["CLS", "Cumulative Layout Shift (Visual Stability Web Vital)"],
        ["CORS", "Cross-Origin Resource Sharing"],
        ["CSP", "Content Security Policy"],
        ["CSRF", "Cross-Site Request Forgery"],
        ["DAG", "Directed Acyclic Graph (CI/CD Pipeline Topology)"],
        ["DAU", "Daily Active Users"],
        ["DDL", "Data Definition Language (SQL Schema Statements)"],
        ["DFD", "Data Flow Diagram"],
        ["DLQ", "Dead-Letter Queue (Event Streaming Fallback)"],
        ["DOM", "Document Object Model"],
        ["ECS", "Elastic Container Service (AWS Managed Containers)"],
        ["EKS", "Elastic Kubernetes Service (AWS Managed Kubernetes)"],
        ["ELO", "Arpad Elo Rating System (Competitive Algorithmic Scoring)"],
        ["ERD", "Entity Relationship Diagram"],
        ["FCP", "First Contentful Paint (Initial DOM Render Metric)"],
        ["FIFO", "First-In, First-Out Queue Protocol"],
        ["FK", "Foreign Key (Relational Database Constraint)"],
        ["HCL", "HashiCorp Configuration Language (Terraform Syntax)"],
        ["HPA", "Horizontal Pod Autoscaler (Kubernetes Dynamic Elasticity)"],
        ["HSL", "Hue, Saturation, Lightness (Color Token Space)"],
        ["HTTP", "Hypertext Transfer Protocol"],
        ["IaC", "Infrastructure as Code"],
        ["INP", "Interaction to Next Paint (UI Responsiveness Web Vital)"],
        ["JWT", "JSON Web Token (RFC 7519 Cryptographic Token)"],
        ["LCP", "Largest Contentful Paint (Main Content Render Metric)"],
        ["LCU", "Load Balancer Capacity Unit"],
        ["LMS", "Learning Management System"],
        ["MERN", "MongoDB, Express.js, React, Node.js Technology Stack"],
        ["NFA", "Non-Deterministic Finite Automata (Regular Expression State Engine)"],
        ["NFR", "Non-Functional Requirements"],
        ["ODM", "Object Document Mapper (Mongoose Schema Driver)"],
        ["ORM", "Object Relational Mapper (Prisma Schema Driver)"],
        ["OWASP", "Open Web Application Security Project"],
        ["P50/P99", "50th and 99th Percentile Tail Latency Metrics"],
        ["PK", "Primary Key (Relational Database Identifier)"],
        ["QPS", "Queries Per Second (System Design Throughput Metric)"],
        ["ReDoS", "Regular Expression Denial of Service (Catastrophic Backtracking)"],
        ["REST", "Representational State Transfer"],
        ["RPS", "Requests Per Second (Load Testing Rate)"],
        ["RSU", "Restricted Stock Units (Corporate Tech Equity Compensation)"],
        ["SPA", "Single Page Application"],
        ["SQLi", "Structured Query Language Injection Vulnerability"],
        ["SRS", "Software Requirements Specification (IEEE 830 Standard)"],
        ["TC", "Total Compensation (Base Salary + Equity RSU + Bonus)"],
        ["TTFB", "Time to First Byte (Server Response Network Metric)"],
        ["UUID", "Universally Unique Identifier (128-bit RFC 4122 Standard)"],
        ["VPC", "Virtual Private Cloud (Isolated Network Subnet)"],
        ["VU", "Virtual User (Concurrency Load Testing Simulation Thread)"],
        ["WCAG", "Web Content Accessibility Guidelines (W3C Standard)"],
        ["WebP", "Web Picture Format (Modern Compressed Web Graphic)"],
        ["XSS", "Cross-Site Scripting Vulnerability"],
        ["YAML", "YAML Ain't Markup Language (CI/CD Workflow Syntax)"],
    ]

    tbl_abbr = doc.add_table(rows=1, cols=2)
    style_table(tbl_abbr, [2.0, 4.5], ["Abbreviation", "Expanded Definition / Context"], abbr_data)
    doc.add_page_break()

    # ==========================================
    # 7. LIST OF TABLES & LIST OF FIGURES
    # ==========================================
    add_chapter_heading(doc, "LIST OF TABLES")
    tables_list = [
        ["Table 2.1", "Comprehensive Competitor Feature & Gap Analysis Matrix", "Page 16"],
        ["Table 3.1", "Functional Requirements Specification (FR-01 to FR-15)", "Page 22"],
        ["Table 3.2", "Functional Requirements Specification Continued (FR-16 to FR-30)", "Page 24"],
        ["Table 3.3", "Non-Functional Requirements & Performance SLAs Matrix", "Page 26"],
        ["Table 3.4", "Hardware, Software, and Network Operational Environment", "Page 27"],
        ["Table 4.1", "Comprehensive Overview of the 24 Flagship Modules", "Page 31"],
        ["Table 4.2", "Microservices Event Bus Parameter & Partition Specifications", "Page 34"],
        ["Table 4.3", "Docker & Kubernetes Multi-Stage Layer Specifications", "Page 37"],
        ["Table 4.4", "Cloud Architecture AWS Cost Estimation Parameters", "Page 40"],
        ["Table 4.5", "OWASP Pentest Vulnerability Vectors & Defense Signatures", "Page 43"],
        ["Table 4.6", "Concurrency Load Testing Profiles & VU Parameters", "Page 46"],
        ["Table 4.7", "Core Web Vitals Thresholds & Remediation Scoring Matrix", "Page 49"],
        ["Table 4.8", "Visual ERD Database Schema Architecture Presets", "Page 52"],
        ["Table 4.9", "Design Tokens HSL Palette & WCAG Contrast Metrics", "Page 55"],
        ["Table 4.10", "Tech Salary Total Compensation Matrix (L3 to L7 Levels)", "Page 58"],
        ["Table 4.11", "Production Regular Expression Library & AST Patterns", "Page 61"],
        ["Table 5.1", "MongoDB Document Collections & Indexing Strategies", "Page 74"],
        ["Table 5.2", "User Collection Schema Data Dictionary", "Page 76"],
        ["Table 5.3", "Course & Lesson Document Schema Data Dictionary", "Page 77"],
        ["Table 5.4", "Certificate & Cryptographic Verification Data Dictionary", "Page 78"],
        ["Table 7.1", "Mathematical Formulations & Algorithmic Complexities Summary", "Page 86"],
        ["Table 8.1", "Automated Vite Production Build File Size & Compression Ledger", "Page 92"],
        ["Table 8.2", "Unit, Integration & Stress Test Case Execution Results (50 Cases)", "Page 95"],
        ["Table 8.3", "OWASP Top 10 Security Verification & Defense Proof Matrix", "Page 98"],
        ["Table 9.1", "Cloud Infrastructure Cost Economics: SkillTrack vs University Cloud Lab", "Page 104"],
        ["Table 10.1", "Empirical Student Cohort Evaluation Metrics & Learning Outcomes", "Page 108"],
    ]
    tbl_lot = doc.add_table(rows=1, cols=3)
    style_table(tbl_lot, [1.5, 4.2, 0.8], ["Table Number", "Table Title / Description", "Page"], tables_list)
    doc.add_page_break()

    add_chapter_heading(doc, "LIST OF FIGURES")
    figures_list = [
        ["Figure 3.1", "SkillTrack Decoupled Three-Tier Edge Serverless Architecture", "Page 28"],
        ["Figure 3.2", "Level 0 Context Data Flow Diagram (DFD)", "Page 29"],
        ["Figure 3.3", "Level 1 Detailed Subsystem Data Flow Diagram", "Page 30"],
        ["Figure 4.1", "Kafka & Microservices Event Bus Topology & Partition Hashing Flow", "Page 35"],
        ["Figure 4.2", "Kubernetes Horizontal Pod Autoscaler (HPA) Elastic Pod Scaling", "Page 38"],
        ["Figure 4.3", "Multi-Tier Cloud Architecture Canvas & Network Ingress Diagram", "Page 41"],
        ["Figure 4.4", "OWASP SQL Injection vs Parameterized Execution Flow", "Page 44"],
        ["Figure 4.5", "Concurrency Load Testing Virtual User Ramp-Up Profiles", "Page 47"],
        ["Figure 4.6", "Network Waterfall Asset Download Latency Timeline", "Page 50"],
        ["Figure 4.7", "Visual Entity Relationship Diagram (ERD) Multi-Table Model", "Page 53"],
        ["Figure 4.8", "Design System WCAG Contrast Ratio & Color-Blind Preview Matrix", "Page 56"],
        ["Figure 4.9", "4-Year RSU Vesting Schedule Compound Growth Curve", "Page 59"],
        ["Figure 4.10", "ReDoS Non-Deterministic Finite Automata (NFA) Backtracking Tree", "Page 62"],
        ["Figure 4.11", "CI/CD 8-Stage Directed Acyclic Graph (DAG) Execution Workflow", "Page 65"],
        ["Figure 4.12", "1v1 Code Duel Real-Time Telemetry & ELO Adjustment Flow", "Page 67"],
        ["Figure 4.13", "System Design Arena Live QPS Traffic Spike Simulator", "Page 69"],
        ["Figure 4.14", "Git & UNIX Terminal Live SVG Commit Graph Visualization", "Page 71"],
        ["Figure 5.1", "Relational Database Schema Entity Relationship Diagram", "Page 81"],
        ["Figure 6.1", "Serverless Mongoose Connection Pooling Cache State Machine", "Page 83"],
        ["Figure 7.1", "Circuit Breaker Closed / Open / Half-Open State Transition Diagram", "Page 89"],
        ["Figure 8.1", "Automated Vite Build Dependency Graph & Module Transformation", "Page 93"],
        ["Figure 8.2", "Lighthouse Core Web Vitals Score Improvement Gauge (40 to 98)", "Page 97"],
        ["Figure 9.1", "Vercel Global Edge Serverless Routing & SPA Rewrite Flow", "Page 102"],
        ["Figure 10.1", "Student Concept Comprehension Gains Before vs After SkillTrack", "Page 109"],
    ]
    tbl_lof = doc.add_table(rows=1, cols=3)
    style_table(tbl_lof, [1.5, 4.2, 0.8], ["Figure Number", "Figure Caption / Description", "Page"], figures_list)
    doc.add_page_break()
