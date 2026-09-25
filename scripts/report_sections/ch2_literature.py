from docx.shared import Inches, Pt, RGBColor
from .helpers import (
    add_chapter_heading, add_section_heading, add_sub_section_heading,
    p, add_callout, style_table, add_code_block
)

def add_chapter_2(doc):
    add_chapter_heading(doc, "CHAPTER 2: LITERATURE REVIEW, THEORETICAL FOUNDATIONS & GAP ANALYSIS")
    
    p(doc, 
      "To establish a sound theoretical and pedagogical foundation, this chapter examines existing paradigms in computer science "
      "education, critically reviews leading commercial and academic platforms, synthesizes cognitive learning theories, "
      "and presents a multi-dimensional gap analysis matrix justifying the engineering decisions behind SkillTrack."
    )

    # -------------------------------------------------------------
    # 2.1 Critical Review of Existing Platforms
    # -------------------------------------------------------------
    add_section_heading(doc, "2.1 Critical Evaluation of Existing Technical Platforms")
    p(doc, 
      "Technical education platforms have evolved through several technological generations over the past two decades. "
      "However, existing platforms remain fragmented, optimizing for narrow sub-disciplines while neglecting end-to-end "
      "cloud-native software engineering competency:"
    )

    platforms = [
        ("Competitive Algorithmic Platforms (LeetCode, HackerRank, Codeforces)",
         "While exemplary for isolated algorithmic problem solving (dynamic programming, graph traversals, bit manipulation), "
         "these platforms operate within a synthetic function-level harness: students receive an input array and return an output. "
         "They teach nothing about distributed event queues, container lifecycle management, cloud cost trade-offs, network tail latency, "
         "or security sanitization. Furthermore, this leads to 'LeetCode optimization syndrome', where students memorize obscure tricks "
         "while remaining unable to configure a Dockerfile or design a resilient relational schema."),
        
        ("Massive Open Online Courses (Coursera, edX, Udemy, Pluralsight)",
         "MOOCs provide broad theoretical coverage through recorded video lectures. However, completion rates across online computing courses "
         "remain notoriously low (typically 5% to 12%). Passive video consumption leads to the 'illusion of competence'—learners believe "
         "they understand Kubernetes autoscaling or Kafka rebalancing after watching an instructor configure it, but struggle when confronted "
         "with real-world configuration errors or network partition failures."),
        
        ("Commercial Cloud Training Sandboxes (AWS Skill Builder, Google Cloud Skills Boost, Qwiklabs)",
         "Commercial sandboxes provide access to genuine cloud consoles. However, they suffer from three fatal academic flaws: "
         "1. Extreme Financial Cost: Subscriptions cost $29 to $49 per user/month, rendering them unaffordable for public university departments; "
         "2. Fragile Time-Bounded Lifecycles: Laboratory environments terminate after 45-60 minutes, destroying all student configuration state; "
         "3. Credit Friction & Billing Phobia: Students routinely express deep anxiety over accidental background charges when cloud credits expire."),
        
        ("Interactive Terminal Sandboxes (Katacoda, Killercoda, Webminal)",
         "Terminal-based learning platforms provision remote Linux containers for learners. While interactive, they face severe operational scalability "
         "bottlenecks. Hosting thousands of concurrent remote container instances incurs heavy server hosting costs, resulting in frequent queue delays, "
         "cryptomining abuse shutdowns, and high connection latency for students in developing regions with constrained network bandwidth."),
        
        ("Curriculum Platforms (freeCodeCamp, The Odin Project)",
         "These open-source curricula excel at teaching foundational HTML, CSS, JavaScript, and basic CRUD applications. However, their coverage "
         "abruptly terminates prior to advanced distributed architectures, omitting production Kafka streaming, Kubernetes HPA, OWASP CVE exploitation, "
         "P99 latency reservoir sampling, and modern infrastructure-as-code automation.")
    ]
    for name, review in platforms:
        p(doc, review, bold_prefix=f"• {name}: ")

    # -------------------------------------------------------------
    # 2.2 Comparative Gap Analysis Matrix
    # -------------------------------------------------------------
    add_section_heading(doc, "2.2 Comparative Gap Analysis Matrix")
    p(doc, 
      "Table 2.1 provides a rigorous multi-dimensional comparison between SkillTrack and the five predominant educational paradigms "
      "across seven critical engineering dimensions:"
    )

    gap_data = [
        ["LeetCode / HackerRank", "High (Algorithms)", "None (0%)", "None (0%)", "None (0%)", "None (0%)", "Freemium ($35/mo)", "Function harness only"],
        ["Coursera / Udemy", "Medium (Passive)", "Low (Video demo)", "Low (Slides only)", "None (0%)", "None (0%)", "Paid ($39-$79/mo)", "Low retention (<10%)"],
        ["AWS Skill Builder", "Low (Theory)", "High (True AWS)", "High (Managed)", "Medium (IAM)", "None (0%)", "High ($29/mo/user)", "Timeouts & bill fears"],
        ["Katacoda / Killercoda", "Low (CLI only)", "Medium (CLI)", "Medium (Basic)", "Low (CLI)", "None (0%)", "High Server Cost", "Remote container latency"],
        ["freeCodeCamp", "Medium (Web)", "None (0%)", "None (0%)", "Low (Basic CRUD)", "None (0%)", "Free (Open-Source)", "Ends at basic CRUD"],
        ["SkillTrack (Proposed)", "High (24 Studios)", "High (Simulated)", "High (Interactive)", "High (OWASP Top 10)", "High (SHA-256 HMAC)", "100% Free / Serverless", "Zero-install, instant P99"]
    ]
    tbl_gap = doc.add_table(rows=1, cols=8)
    style_table(tbl_gap, [1.3, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9, 1.3], 
                ["Platform Paradigm", "Core DSA Depth", "Cloud Topology", "Kafka / Event Bus", "OWASP Security", "Crypto Certs", "Cost Profile", "Systemic Limitation"], gap_data)
    doc.add_paragraph()

    # -------------------------------------------------------------
    # 2.3 Theoretical Foundations
    # -------------------------------------------------------------
    add_section_heading(doc, "2.3 Theoretical Foundations & Pedagogical Models")
    p(doc, "SkillTrack's instructional and system architecture is grounded in four foundational scientific and cognitive theories:")

    add_sub_section_heading(doc, "2.3.1 Bloom's Revised Taxonomy in Experiential Computing")
    p(doc, 
      "Bloom's Revised Taxonomy (Anderson & Krathwohl, 2001) classifies cognitive learning into six progressive levels: "
      "Remembering, Understanding, Applying, Analyzing, Evaluating, and Creating. Traditional lecture-based computer science courses "
      "rarely progress beyond the first two levels ('Remembering' syntax and 'Understanding' definitions). "
      "In contrast, SkillTrack's 24 studios engage students directly in the top three cognitive tiers: "
      "'Analyzing' catastrophic regex backtracking in an AST tree, 'Evaluating' the trade-offs of single-stage vs distroless Docker builds, "
      "and 'Creating' complete multi-tier cloud architectures exported as production Terraform code."
    )

    add_sub_section_heading(doc, "2.3.2 Sweller's Cognitive Load Theory & Interactive Virtualization")
    p(doc, 
      "Cognitive Load Theory (John Sweller, 1988) posits that human working memory is severely constrained, capable of holding only 4 to 7 "
      "discrete information elements simultaneously. When students are forced to spend two hours wrestling with local Minikube virtual machine "
      "hypervisor drivers, port forwarding, and YAML syntax bugs, their extraneous cognitive load is maximized, leaving zero working memory "
      "available for germane learning (understanding container scheduling and replica sets). By eliminating local installation friction and "
      "presenting clean, visual, and reactive interfaces, SkillTrack minimizes extraneous cognitive load."
    )

    add_sub_section_heading(doc, "2.3.3 Finite State Automata & Regular Language Complexity")
    p(doc, 
      "Theoretical computer science formalizes regular expressions as representations of regular languages recognized by Deterministic "
      "Finite Automata (DFA) and Non-deterministic Finite Automata (NFA). While DFAs guarantee linear time processing O(N) by transitioning "
      "to exactly one state per input symbol, backtracking NFA implementations (such as PCRE, Java, and ECMAScript engines) explore multiple "
      "branches via recursion. When sub-patterns contain nested indeterminate quantifiers, state exploration explodes into exponential "
      "tree depth O(2^N). SkillTrack operationalizes this formal language theory into an intuitive visual analyzer."
    )

    add_sub_section_heading(doc, "2.3.4 Distributed Systems Consensus & Event Streaming Principles")
    p(doc, 
      "Distributed systems design is governed by fundamental theorems, including Brewer's CAP Theorem (Consistency, Availability, Partition Tolerance), "
      "Lamport's logical clocks, and the Chandy-Lamport distributed snapshot algorithm. In modern streaming architectures, Apache Kafka "
      "replaces synchronous two-phase commit (2PC) transactions with an append-only distributed commit log partitioned across a cluster. "
      "SkillTrack models these exact theoretical invariants—including strict per-partition ordering, independent consumer group offsets, "
      "and Dead-Letter Queue isolation—using client-side discrete event state machines."
    )

    add_callout(
        doc,
        "By synthesizing Sweller's Cognitive Load Theory with Bloom's experiential hierarchy, SkillTrack transforms abstract distributed "
        "systems and security theory into an intuitive, interactive engineering laboratory that accelerates student concept mastery.",
        "THEORETICAL SYNTHESIS SUMMARY"
    )

    doc.add_page_break()
