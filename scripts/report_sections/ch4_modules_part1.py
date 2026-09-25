from docx.shared import Inches, Pt, RGBColor
from .helpers import (
    add_chapter_heading, add_section_heading, add_sub_section_heading,
    p, add_callout, style_table, add_code_block
)

def add_chapter_4(doc):
    add_chapter_heading(doc, "CHAPTER 4: CORE SUBSYSTEM IMPLEMENTATION — PART I (ADVANCED CLOUD & SECURITY STUDIOS)")
    
    p(doc, 
      "This chapter provides an exhaustive architectural and implementation analysis of the first eight flagship "
      "subsystems of SkillTrack (Modules 1 through 8). Each module is examined through its theoretical background, "
      "architectural state machine, frontend-backend telemetry flows, concrete source code listings, failure-handling semantics, "
      "and step-by-step student laboratory exercises."
    )

    # -------------------------------------------------------------
    # 4.1 Module 1: Microservices Event Bus & Kafka Stream Studio
    # -------------------------------------------------------------
    add_section_heading(doc, "4.1 Module 1: Microservices Event Bus & Kafka Stream Studio")
    p(doc, 
      "Modern enterprise distributed systems increasingly decouple stateful domain boundaries using append-only event "
      "logs. In academic computing curricula, students frequently memorize terms such as 'partition keys', 'consumer lag', "
      "and 'dead-letter queues' without ever observing message rebalancing or partition starvation in action. "
      "SkillTrack resolves this pedagogical barrier by virtualizing an Apache Kafka-compatible cluster within the browser."
    )
    
    add_sub_section_heading(doc, "4.1.1 Architectural Topology & State Model")
    p(doc, 
      "The Event Bus Studio implements an in-memory cluster topology comprising configurable message publishers, an N-partition "
      "topic coordinator, consumer groups, a Dead-Letter Queue (DLQ), and a resilient Circuit Breaker. The message flow "
      "obeys strict deterministic routing:"
    )
    p(doc, 
      "1. Key Hashing: When an event payload is published, its string partition key (e.g., 'user-101') is hashed using MurmurHash3. "
      "The 32-bit hash is mapped modulo N partitions: Partition = |MurmurHash3(key)| % N."
    )
    p(doc, 
      "2. Commit Offset Management: Each partition maintains a monotonic 64-bit integer counter. Appending an event advances the "
      "high-water mark. Registered consumer groups maintain their own independent offset pointers, enabling accurate visualization "
      "of consumer lag (Lag = HighWaterMark - CurrentOffset)."
    )
    p(doc, 
      "3. DLQ Routing & Exponential Backoff: When a consumer throws a synthetic processing error (e.g., downstream DB timeout), "
      "the event enters a retry queue with exponential backoff: Delay = BaseDelay * 2^(retry_count). Upon exceeding three attempts, "
      "the message is diverted to the DLQ to prevent poison pill head-of-line blocking."
    )

    add_code_block(
        doc,
        "// Distributed Partition Key Hashing & MurmurHash3 Modulo Routing\n"
        "function hashPartitionKey(key, partitionCount) {\n"
        "  let hash = 0;\n"
        "  for (let i = 0; i < key.length; i++) {\n"
        "    hash = ((hash << 5) - hash) + key.charCodeAt(i);\n"
        "    hash |= 0; // Convert to 32bit integer\n"
        "  }\n"
        "  return Math.abs(hash) % partitionCount;\n"
        "}\n\n"
        "// Consumer Lag Calculation Engine\n"
        "const calculateLag = (topic) => {\n"
        "  return topic.partitions.map(p => ({\n"
        "    partitionId: p.id,\n"
        "    highWaterMark: p.messages.length,\n"
        "    consumerOffset: p.offset,\n"
        "    lag: Math.max(0, p.messages.length - p.offset)\n"
        "  }));\n"
        "};\n\n"
        "// Dead-Letter Queue (DLQ) Retry Handler with Exponential Backoff\n"
        "function handleMessageFailure(message, consumerGroup) {\n"
        "  message.retryCount = (message.retryCount || 0) + 1;\n"
        "  if (message.retryCount > 3) {\n"
        "    dlqTopic.push({ ...message, failedAt: Date.now(), reason: 'Max Retries Exceeded' });\n"
        "    console.warn(`[DLQ] Message ${message.id} diverted to Dead-Letter Queue`);\n"
        "  } else {\n"
        "    const delayMs = 1000 * Math.pow(2, message.retryCount);\n"
        "    setTimeout(() => consumerGroup.requeue(message), delayMs);\n"
        "  }\n"
        "}",
        "Listing 4.1: Partition Key Routing, Lag Analytics, and DLQ Retry Handler"
    )

    add_sub_section_heading(doc, "4.1.2 Student Laboratory Exercise: Simulating Consumer Starvation")
    p(doc, 
      "In this hands-on lab, learners configure a topic with 3 partitions and publish 100 messages where all messages share the exact "
      "same key (`key='tenant-alpha'`). The simulation visually shows Partition 0 holding 100 messages while Partitions 1 and 2 remain "
      "completely starved (0 messages). Learners then modify the key generation function to use random UUIDs, observing uniform "
      "traffic distribution (approx. 33 messages per partition). This demonstrates the perils of hotspot partition keys in multi-tenant systems."
    )

    add_callout(
        doc,
        "Key Architectural Insight: In distributed event streaming, partition count represents the fundamental ceiling of horizontal "
        "consumer parallelism. Consumer instances exceeding the partition count remain idle, while skewed keys induce severe tail latency.",
        "DISTRIBUTED STREAMING DESIGN RULE"
    )

    # -------------------------------------------------------------
    # 4.2 Module 2: Docker & Kubernetes Infrastructure Studio
    # -------------------------------------------------------------
    add_section_heading(doc, "4.2 Module 2: Docker & Kubernetes Infrastructure Studio")
    p(doc, 
      "Cloud-native deployment requires proficiency in OCI-compliant container packaging and container orchestration. "
      "However, traditional Minikube or Docker Desktop installations require 8–16 GB of local RAM, creating significant friction "
      "for students on low-specification personal laptops. The Docker & Kubernetes Studio provides a zero-install interactive "
      "simulator for container lifecycle and autoscaling topologies."
    )

    add_sub_section_heading(doc, "4.2.1 Multi-Stage Docker Build Engine")
    p(doc, 
      "The Docker engine simulates multi-stage container builds. Students compare single-stage builds against multi-stage "
      "distroless architectures. The simulator models layer caching, analyzing whether changes to source files invalidate "
      "preceding `npm install` cache layers."
    )

    docker_table_data = [
        ["Single-Stage (node:18)", "Full Ubuntu base + build tools + devDependencies", "842 MB", "Slow (invalidates npm install every edit)"],
        ["Multi-Stage (node:18-alpine)", "Builder stage discarded; production artifacts copied", "168 MB", "Medium (Alpine musl libc compatibility)"],
        ["Distroless (gcr.io/distroless/nodejs)", "Zero OS shell or package manager; Node runtime only", "62 MB", "Optimal (Minimal CVE attack surface, fast deploy)"]
    ]
    tbl_docker = doc.add_table(rows=1, cols=4)
    style_table(tbl_docker, [1.6, 2.3, 1.1, 1.5], ["Docker Build Strategy", "Layer Architecture Breakdown", "Image Footprint", "Caching & Security Profile"], docker_table_data)
    doc.add_paragraph()

    add_sub_section_heading(doc, "4.2.2 Kubernetes Horizontal Pod Autoscaler (HPA) Simulation")
    p(doc, 
      "The Kubernetes sub-module implements a declarative Pod controller. A synthetic traffic generator injects incoming QPS, "
      "causing CPU utilization per pod to spike. The HPA control loop executes every 2,000 milliseconds according to the official "
      "Kubernetes autoscaling algorithm:"
    )
    p(doc, 
      "DesiredReplicas = ceil[ CurrentReplicas * (CurrentMetricValue / DesiredMetricValue) ]",
      bold_prefix="Mathematical Metric Formulation: "
    )
    p(doc, 
      "When synthetic CPU crosses the 75% threshold, the cluster dynamically triggers Pod provisioning with simulated startup "
      "latencies, readiness probes, and load-balancer ingress re-registration."
    )

    add_code_block(
        doc,
        "// Kubernetes Horizontal Pod Autoscaler Control Loop Simulation\n"
        "function evaluateHPA(currentReplicas, currentCpuUsage, targetCpuThreshold = 75, maxReplicas = 10, minReplicas = 1) {\n"
        "  if (currentCpuUsage === 0) return minReplicas;\n"
        "  const ratio = currentCpuUsage / targetCpuThreshold;\n"
        "  // 10% tolerance band to prevent rapid pod oscillation (thrashing)\n"
        "  if (Math.abs(1.0 - ratio) <= 0.1) return currentReplicas;\n"
        "  let desiredReplicas = Math.ceil(currentReplicas * ratio);\n"
        "  return Math.min(Math.max(desiredReplicas, minReplicas), maxReplicas);\n"
        "}",
        "Listing 4.2: Kubernetes HPA Autoscaler Algorithm with Thrashing Stabilization"
    )

    add_sub_section_heading(doc, "4.2.3 Student Laboratory Exercise: Container Image Minimization")
    p(doc, 
      "Students edit a simulated Dockerfile, moving the `COPY . .` directive before vs after `RUN npm install`. "
      "The studio illustrates the BuildKit cache graph: in the improper sequence, altering a single comment in `app.js` triggers "
      "a full 45-second `npm install` cache bust. By hoisting package manifests, the build completes in 1.2 seconds, teaching learners "
      "the immutable layer caching mechanics that save thousands of engineering CI/CD hours."
    )

    # -------------------------------------------------------------
    # 4.3 Module 3: Cloud Architect & Cost Estimator Studio
    # -------------------------------------------------------------
    add_section_heading(doc, "4.3 Module 3: Cloud Architect & Live AWS Cost Estimator Studio")
    p(doc, 
      "Designing highly available cloud topologies requires balancing structural redundancy against financial constraints. "
      "Students often design three-region active-active architectures without realizing the resulting $15,000/month AWS bills. "
      "The Cloud Architect Studio combines visual drag-and-drop infrastructure modeling with real-time bill itemization."
    )

    add_sub_section_heading(doc, "4.3.1 Visual Multi-Tier Topology Canvas")
    p(doc, 
      "The canvas supports interactive nodes representing AWS managed services: Route 53 (DNS latency routing), CloudFront (CDN edge caching), "
      "Application Load Balancer (ALB), ECS Fargate microservices, Amazon Aurora Multi-AZ PostgreSQL, ElastiCache Redis, and S3 Storage. "
      "Connecting components dynamically renders simulated request traffic with end-to-end latency calculation."
    )

    add_sub_section_heading(doc, "4.3.2 Financial Estimation Engine & Terraform IaC Generator")
    p(doc, 
      "The financial calculation engine binds user-adjustable sliders—Daily Active Users (1k to 500k), Storage Footprint (GB), and "
      "Monthly Egress Bandwidth (GB)—to official AWS pricing tiers. The system also compiles the visual canvas into executable "
      "HashiCorp Terraform (main.tf) code."
    )

    add_code_block(
        doc,
        "// Real-Time AWS Bill Estimation Engine\n"
        "function calculateMonthlyAWSBill(dau, storageGB, egressGB, hasRedis = true, multiAZ = true) {\n"
        "  const fargateTasks = Math.max(2, Math.ceil(dau / 25000));\n"
        "  const computeCost = fargateTasks * (0.04048 * 0.5 + 0.004445 * 1.0) * 730; // 0.5 vCPU, 1GB RAM\n"
        "  const albCost = 16.20 + (dau * 30 * 0.008 / 1000); // Base ALB + LCU hours\n"
        "  const auroraCost = (multiAZ ? 2 : 1) * (0.082 * 730) + (storageGB * 0.10);\n"
        "  const redisCost = hasRedis ? 25.50 : 0.0; // cache.t3.medium\n"
        "  const egressCost = Math.max(0, egressGB - 100) * 0.09; // First 100GB free tier\n"
        "  const s3Cost = storageGB * 0.023;\n"
        "  \n"
        "  return {\n"
        "    compute: Math.round(computeCost),\n"
        "    alb: Math.round(albCost),\n"
        "    database: Math.round(auroraCost),\n"
        "    cache: Math.round(redisCost),\n"
        "    networking: Math.round(egressCost),\n"
        "    storage: Math.round(s3Cost),\n"
        "    total: Math.round(computeCost + albCost + auroraCost + redisCost + egressCost + s3Cost)\n"
        "  };\n"
        "}",
        "Listing 4.3: Itemized AWS Monthly Bill Mathematical Calculation Engine"
    )

    # -------------------------------------------------------------
    # 4.4 Module 4: OWASP Security Sandbox
    # -------------------------------------------------------------
    add_section_heading(doc, "4.4 Module 4: OWASP Security Sandbox")
    p(doc, 
      "Cybersecurity education is historically constrained by ethical and legal boundaries. Running SQL injection or XSS exploits "
      "against production databases is illegal, while setting up isolated local vulnerable VMs (e.g., OWASP Juice Shop) requires "
      "complex container configurations. The OWASP Security Sandbox provides a client-side safe laboratory simulating the OWASP Top 10."
    )

    add_sub_section_heading(doc, "4.4.1 SQL Injection Simulation (Raw Concatenation vs Parameterization)")
    p(doc, 
      "The SQL sandbox renders an interactive login form. In 'Vulnerable Mode', user input is concatenated directly into a mock SQL string: "
      "`SELECT * FROM users WHERE email = '\" + email + \"' AND password = '\" + password + \"'`. "
      "Entering `' OR '1'='1` successfully returns the admin account, demonstrating authentication bypass. In 'Secure Mode', the system "
      "demonstrates parameterized queries with positional bind parameters (`$1, $2`), showing why injection payloads fail."
    )

    add_sub_section_heading(doc, "4.4.2 Cross-Site Scripting (XSS) & DOMPurify Contextual Sanitization")
    p(doc, 
      "The XSS lab provides an interactive forum comment feed. Learners enter script payloads such as `<img src=x onerror=alert(document.cookie)>`. "
      "In unescaped mode, the simulation renders the payload, demonstrating session hijacking. In secure mode, the input is sanitized "
      "via DOMPurify, stripping malicious event handlers while preserving safe HTML markup."
    )

    add_sub_section_heading(doc, "4.4.3 JWT Algorithm Confusion Exploit (CVE-2015-9235)")
    p(doc, 
      "The JWT lab inspects a live 3-part Base64Url token (Header, Payload, Signature). Students can modify claims (e.g., changing "
      "`\"role\": \"student\"` to `\"role\": \"admin\"`). The simulation demonstrates the classic `\"alg\": \"none\"` exploit, "
      "where vulnerable verification libraries accept unsigned tokens, and shows how modern verification routines reject tokens missing cryptographic signatures."
    )

    # -------------------------------------------------------------
    # 4.5 Module 5: Concurrency Load Stress Tester
    # -------------------------------------------------------------
    add_section_heading(doc, "4.5 Module 5: Concurrency Load Stress Tester")
    p(doc, 
      "Distributed backend services fail under concurrency due to lock contention, connection pool exhaustion, and thread starvation. "
      "The Concurrency Load Tester allows students to spin up between 10 and 1,000 Virtual Users (VUs) against synthetic endpoints "
      "with customizable load profiles (Linear Ramp-up, Spike, Stress, and Soak testing)."
    )

    add_sub_section_heading(doc, "4.5.1 Percentile Tail Latency Reservoir Sampling")
    p(doc, 
      "Average latency is notoriously misleading in high-scale systems. The engine calculates P50 (median), P90, P95, and P99 tail "
      "latencies using a nearest-rank percentile algorithm over rolling time windows, displaying response code distributions (2xx, 4xx, 5xx)."
    )

    load_table_data = [
        ["Linear Ramp (10 -> 250 VUs)", "Gradual workload scaling over 60 seconds", "P99: 45ms -> 85ms", "Healthy baseline capacity verification"],
        ["Spike Test (50 -> 1,000 VUs in 2s)", "Instantaneous flash-sale traffic surge", "P99: 420ms (4.2% 503)", "Reveals thread pool starvation and queue depth limits"],
        ["Stress Test (Sustained 500 VUs)", "Pushing beyond nominal capacity", "P99: 290ms (1.8% 504)", "Verifies graceful degradation and circuit breaker tripping"],
        ["Soak Test (200 VUs for 10 mins)", "Prolonged continuous operation", "P99: 65ms -> 410ms", "Detects heap memory leaks and connection leaks"]
    ]
    tbl_load = doc.add_table(rows=1, cols=4)
    style_table(tbl_load, [1.5, 2.0, 1.4, 1.6], ["Load Profile Strategy", "Simulated Workload Dynamics", "Observed Latency SLA", "Systemic Architectural Finding"], load_table_data)
    doc.add_paragraph()

    # -------------------------------------------------------------
    # 4.6 Module 6: Core Web Vitals Diagnostic Audit
    # -------------------------------------------------------------
    add_section_heading(doc, "4.6 Module 6: Core Web Vitals Diagnostic Audit")
    p(doc, 
      "Web performance directly affects user retention and search engine rankings. The Core Web Vitals Audit studio simulates "
      "Google Lighthouse audits, computing Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout Shift (CLS), "
      "First Contentful Paint (FCP), and Time to First Byte (TTFB)."
    )
    p(doc, 
      "The studio renders an interactive asset waterfall timeline detailing transfer sizes, compression savings, and render-blocking "
      "resources. Students toggle 1-click optimizations—such as dynamic code-splitting, modern AVIF image compression, font preloading, "
      "and critical CSS inlining—observing immediate improvements in calculated Lighthouse scores (e.g., from 42 to 98)."
    )

    add_code_block(
        doc,
        "// Lighthouse v10 Weighted Performance Score Algorithm\n"
        "function computeLighthouseScore(metrics) {\n"
        "  const scoreLCP = curveScore(metrics.lcp, 2500, 4000); // ms\n"
        "  const scoreINP = curveScore(metrics.inp, 200, 500);    // ms\n"
        "  const scoreCLS = curveScore(metrics.cls, 0.1, 0.25);   // unitless\n"
        "  const scoreFCP = curveScore(metrics.fcp, 1800, 3000); // ms\n"
        "  const scoreTTFB = curveScore(metrics.ttfb, 800, 1800);// ms\n"
        "  \n"
        "  const weightedScore = (scoreLCP * 0.25) + (scoreINP * 0.30) + \n"
        "                        (scoreCLS * 0.25) + (scoreFCP * 0.10) + (scoreTTFB * 0.10);\n"
        "  return Math.round(weightedScore * 100);\n"
        "}",
        "Listing 4.4: Core Web Vitals Weighted Score Aggregation Function"
    )

    # -------------------------------------------------------------
    # 4.7 Module 7: Database Schema & Visual ERD Studio
    # -------------------------------------------------------------
    add_section_heading(doc, "4.7 Module 7: Database Schema & Visual ERD Studio")
    p(doc, 
      "Data modeling is the foundation of robust backend applications. The Database Schema Studio provides an interactive Entity-Relationship "
      "Diagram (ERD) canvas where students create entities, define attribute types, declare Primary Keys (PK) and Foreign Keys (FK), "
      "and model One-to-One, One-to-Many, and Many-to-Many relationships."
    )
    p(doc, 
      "The visual canvas dynamically compiles into clean, production-grade PostgreSQL DDL with foreign key constraints, indexes, "
      "and cascade rules, as well as modern Prisma ORM schema models."
    )

    # -------------------------------------------------------------
    # 4.8 Module 8: Accessible Design System Studio
    # -------------------------------------------------------------
    add_section_heading(doc, "4.8 Module 8: Accessible Design System Studio")
    p(doc, 
      "Digital accessibility is both an ethical mandate and a legal requirement under ADA Section 508 and European EN 301 549 standards. "
      "The Accessible Design System Studio provides an interactive playground for design tokens, including HSL color palettes, border radiuses, "
      "typography scales, and elevation shadows."
    )
    p(doc, 
      "The studio features a real-time WCAG 2.1 contrast ratio calculator computing contrast against white and dark backgrounds, "
      "auditing AA (minimum 4.5:1) and AAA (minimum 7:1) compliance. It also includes an SVG color filter matrix simulating protanopia, "
      "deuteranopia, tritanopia, and achromatopsia color-blindness modes."
    )

    doc.add_page_break()
