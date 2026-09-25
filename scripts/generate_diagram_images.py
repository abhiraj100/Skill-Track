import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = "/Users/abhirajyadav/SkillTrack/scripts/diagram_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Color Palette (Corporate Academic Navy / Slate / Blue)
NAVY = "#1E3A8A"
SLATE = "#0F172A"
BLUE = "#2563EB"
LIGHT_BLUE = "#DBEAFE"
BG_COLOR = "#F8FAFC"
BORDER_COLOR = "#94A3B8"
ACCENT_GREEN = "#10B981"
ACCENT_PURPLE = "#8B5CF6"
ACCENT_AMBER = "#F59E0B"
ACCENT_RED = "#EF4444"

def draw_box(ax, x, y, w, h, title, subtitle="", color="#FFFFFF", edge_color=BLUE, title_color=NAVY):
    rect = patches.FancyBboxPatch(
        (x, y), w, h, boxstyle="round,pad=0.04,rounding_size=0.08",
        facecolor=color, edgecolor=edge_color, linewidth=1.5, zorder=2
    )
    ax.add_patch(rect)
    ax.text(x + w/2, y + h*0.65, title, ha="center", va="center", fontsize=9.5, fontweight="bold", color=title_color, zorder=3)
    if subtitle:
        ax.text(x + w/2, y + h*0.30, subtitle, ha="center", va="center", fontsize=7.5, color="#475569", zorder=3)

def draw_arrow(ax, x1, y1, x2, y2, label=""):
    ax.annotate(
        "", xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5, mutation_scale=12),
        zorder=4
    )
    if label:
        ax.text((x1+x2)/2, (y1+y2)/2 + 0.03, label, ha="center", va="bottom", fontsize=7.5, fontweight="bold", color="#1E293B", zorder=5)

# ==============================================================================
# 1. HIGH-LEVEL DESIGN (HLD) ARCHITECTURE DIAGRAM
# ==============================================================================
def generate_hld_diagram():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")
    
    # Title
    ax.text(5, 5.7, "SkillTrack: High-Level Design (HLD) Architecture", ha="center", va="center", fontsize=14, fontweight="bold", color=NAVY)
    
    # Layer 1: Client
    rect1 = patches.FancyBboxPatch((0.5, 4.3), 9.0, 1.05, boxstyle="round,pad=0.05", facecolor="#EFF6FF", edgecolor="#BFDBFE", lw=1.2)
    ax.add_patch(rect1)
    ax.text(0.7, 5.15, "CLIENT LAYER (Browser Single-Page Application)", fontsize=8.5, fontweight="bold", color=NAVY)
    draw_box(ax, 0.8, 4.45, 2.4, 0.65, "React 18 SPA", "Vite 6.4 | React Router v7", "#FFFFFF", BLUE)
    draw_box(ax, 3.8, 4.45, 2.4, 0.65, "24 Engineering Studios", "Kafka, K8s, OWASP, ERD", "#FFFFFF", BLUE)
    draw_box(ax, 6.8, 4.45, 2.4, 0.65, "HTML5 Web Workers", "Isolated Code Sandbox", "#FFFFFF", BLUE)
    
    # Arrow Layer 1 -> Layer 2
    draw_arrow(ax, 5.0, 4.3, 5.0, 3.8, "HTTPS / TLS 1.3 / REST")
    
    # Layer 2: Edge Serverless
    rect2 = patches.FancyBboxPatch((0.5, 2.5), 9.0, 1.25, boxstyle="round,pad=0.05", facecolor="#F1F5F9", edgecolor="#CBD5E1", lw=1.2)
    ax.add_patch(rect2)
    ax.text(0.7, 3.55, "SERVERLESS EDGE LAYER (Vercel Global Network)", fontsize=8.5, fontweight="bold", color=SLATE)
    draw_box(ax, 0.8, 2.65, 2.4, 0.75, "Anycast CDN Gateway", "Edge Cache | SPA Rewrites", "#FFFFFF", SLATE)
    draw_box(ax, 3.8, 2.65, 2.4, 0.75, "Express Serverless API", "Node.js Ephemeral Function", "#FFFFFF", SLATE)
    draw_box(ax, 6.8, 2.65, 2.4, 0.75, "Security & Auth Guard", "Dynamic CORS | JWT RBAC", "#FFFFFF", SLATE)
    
    # Arrow Layer 2 -> Layer 3
    draw_arrow(ax, 5.0, 2.5, 5.0, 1.9, "Pooled TCP / TLS 27017")
    
    # Layer 3: Persistence
    rect3 = patches.FancyBboxPatch((0.5, 0.4), 9.0, 1.45, boxstyle="round,pad=0.05", facecolor="#ECFDF5", edgecolor="#A7F3D0", lw=1.2)
    ax.add_patch(rect3)
    ax.text(0.7, 1.65, "DATA PERSISTENCE LAYER (MongoDB Atlas Multi-AZ Cluster)", fontsize=8.5, fontweight="bold", color="#065F46")
    draw_box(ax, 0.8, 0.6, 2.4, 0.85, "Primary Master Node", "Stateful ACID Writes", "#FFFFFF", "#059669", "#065F46")
    draw_box(ax, 3.8, 0.6, 2.4, 0.85, "Secondary Replica", "Auto-Failover | Snapshots", "#FFFFFF", "#059669", "#065F46")
    draw_box(ax, 6.8, 0.6, 2.4, 0.85, "WiredTiger Engine", "Snappy Block Compression", "#FFFFFF", "#059669", "#065F46")
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "hld_architecture.png"), dpi=300)
    plt.close()

# ==============================================================================
# 2. LOW-LEVEL DESIGN (LLD) CLASS DIAGRAM
# ==============================================================================
def generate_lld_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")
    
    ax.text(5, 6.2, "SkillTrack: Low-Level Design (LLD) UML Class Model", ha="center", va="center", fontsize=14, fontweight="bold", color=NAVY)
    
    # Class 1: User
    draw_box(ax, 0.5, 3.6, 2.6, 2.2, "User", "+ id: UUID\n+ email: String\n+ passwordHash: String\n+ streakDays: Int\n+ xpPoints: Int\n+ eloRating: Int\n+ comparePassword()", "#FFFFFF", BLUE)
    
    # Class 2: Course
    draw_box(ax, 3.7, 3.6, 2.6, 2.2, "Course", "+ id: UUID\n+ slug: String\n+ title: String\n+ category: Enum\n+ lessonsCount: Int\n+ modules: Array\n+ publish()", "#FFFFFF", BLUE)
    
    # Class 3: Enrollment
    draw_box(ax, 6.9, 3.6, 2.6, 2.2, "Enrollment", "+ id: UUID\n+ userId: UUID (FK)\n+ courseId: UUID (FK)\n+ progress: Float\n+ completed: Array\n+ toggleLesson()", "#FFFFFF", BLUE)
    
    # Class 4: Certificate
    draw_box(ax, 0.5, 0.6, 2.6, 2.2, "Certificate", "+ id: UUID\n+ certificateCode: UUID\n+ sha256Digest: String\n+ issuedAt: Date\n+ generateHMAC()\n+ verifyAuthenticity()", "#FFFFFF", ACCENT_GREEN)
    
    # Class 5: CircuitBreaker
    draw_box(ax, 3.7, 0.6, 2.6, 2.2, "CircuitBreaker", "+ state: Enum\n+ failureThreshold: Float\n+ resetTimeoutMs: Int\n+ recordSuccess()\n+ recordFailure()\n+ tripOpen()", "#FFFFFF", ACCENT_PURPLE)
    
    # Class 6: KafkaCoordinator
    draw_box(ax, 6.9, 0.6, 2.6, 2.2, "KafkaCoordinator", "+ partitions: Array\n+ consumerGroups: Array\n+ dlqQueue: Array\n+ murmurHash3(key)\n+ commitOffset()\n+ routeDLQ()", "#FFFFFF", ACCENT_AMBER)
    
    # Linkages
    draw_arrow(ax, 1.8, 3.6, 1.8, 2.8, "1 : N")
    draw_arrow(ax, 5.0, 3.6, 5.0, 2.8, "1 : N")
    draw_arrow(ax, 3.1, 4.7, 3.7, 4.7, "enrolled")
    draw_arrow(ax, 6.3, 4.7, 6.9, 4.7, "tracks")
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "lld_class_diagram.png"), dpi=300)
    plt.close()

# ==============================================================================
# 3. WORKFLOW: LEARNER JOURNEY
# ==============================================================================
def generate_workflow_learner_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4.5)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")
    
    ax.text(5, 4.1, "SkillTrack: End-to-End Student Learner Journey Workflow", ha="center", va="center", fontsize=13, fontweight="bold", color=NAVY)
    
    steps = [
        ("1. Auth & Onboard", "JWT Login\nRole: Student", 0.3),
        ("2. Discover Lab", "Explore 24\nStudios", 2.3),
        ("3. Hands-On Sim", "Kafka / K8s /\nOWASP Sandbox", 4.3),
        ("4. Code & Quizzes", "Web Worker IDE\nTest Cases Pass", 6.3),
        ("5. Provenance", "SHA-256 Cert &\nLive Portfolio", 8.3)
    ]
    
    for title, sub, x in steps:
        draw_box(ax, x, 1.4, 1.4, 1.6, title, sub, "#F8FAFC", BLUE)
        if x < 8.0:
            draw_arrow(ax, x + 1.4, 2.2, x + 2.3, 2.2)
            
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "workflow_learner_journey.png"), dpi=300)
    plt.close()

# ==============================================================================
# 4. WORKFLOW: KAFKA DLQ FAULT TOLERANCE
# ==============================================================================
def generate_workflow_kafka_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")
    
    ax.text(5, 4.6, "Distributed Event Streaming & Dead-Letter Queue (DLQ) Workflow", ha="center", va="center", fontsize=13, fontweight="bold", color=NAVY)
    
    draw_box(ax, 0.4, 2.6, 1.8, 1.2, "Publisher", "Publish Event\nKey: 'user-101'", "#FFFFFF", BLUE)
    draw_box(ax, 2.7, 2.6, 2.1, 1.2, "MurmurHash3", "|Hash(Key)| % N\nAssign Partition", "#FFFFFF", SLATE)
    draw_box(ax, 5.3, 2.6, 2.0, 1.2, "Consumer Group", "Process Event\nTrack Offset", "#FFFFFF", BLUE)
    draw_box(ax, 7.8, 2.6, 1.8, 1.2, "Commit Offset", "Advance High\nWater Mark", "#ECFDF5", ACCENT_GREEN)
    
    draw_box(ax, 5.3, 0.5, 2.0, 1.2, "Retry Backoff", "Delay = 2^attempt\nMax Retries = 3", "#FFFBEB", ACCENT_AMBER)
    draw_box(ax, 7.8, 0.5, 1.8, 1.2, "DLQ Topic", "Quarantine\nPoison Pill", "#FEF2F2", ACCENT_RED)
    
    draw_arrow(ax, 2.2, 3.2, 2.7, 3.2)
    draw_arrow(ax, 4.8, 3.2, 5.3, 3.2)
    draw_arrow(ax, 7.3, 3.2, 7.8, 3.2, "Success")
    
    draw_arrow(ax, 6.3, 2.6, 6.3, 1.7, "Failure")
    draw_arrow(ax, 7.3, 1.1, 7.8, 1.1, "Retries > 3")
    draw_arrow(ax, 5.3, 1.1, 4.5, 2.6, "Retry")
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "workflow_kafka_dlq.png"), dpi=300)
    plt.close()

# ==============================================================================
# 5. WORKFLOW: 1v1 CODE DUEL
# ==============================================================================
def generate_workflow_codeduel_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4.5)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")
    
    ax.text(5, 4.1, "1v1 Real-Time Code Duel Arena Competitive Workflow", ha="center", va="center", fontsize=13, fontweight="bold", color=NAVY)
    
    nodes = [
        ("Player Matchmaking", "ELO Window ±150\nQueue Pairing", 0.4),
        ("Real-Time Battle", "Live Code Editor\nSyntax Telemetry", 2.8),
        ("Worker Sandbox", "Isolated Thread\n2,000ms Timeout", 5.2),
        ("ELO Calibration", "FIDE K=32 Formula\nLeaderboard Update", 7.6)
    ]
    
    for title, sub, x in nodes:
        draw_box(ax, x, 1.4, 2.0, 1.6, title, sub, "#F8FAFC", BLUE)
        if x < 7.0:
            draw_arrow(ax, x + 2.0, 2.2, x + 2.8, 2.2)
            
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "workflow_codeduel.png"), dpi=300)
    plt.close()

# ==============================================================================
# 6. ENTITY-RELATIONSHIP DIAGRAM (ERD)
# ==============================================================================
def generate_erd_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")
    
    ax.text(5, 6.2, "SkillTrack: Relational Entity-Relationship Diagram (ERD)", ha="center", va="center", fontsize=14, fontweight="bold", color=NAVY)
    
    draw_box(ax, 0.5, 3.5, 2.6, 2.2, "USERS (PK)", "PK: id (UUID)\n* email: VARCHAR\n* password_hash\n* full_name\n* streak_days\n* xp_points", "#EFF6FF", BLUE)
    draw_box(ax, 6.9, 3.5, 2.6, 2.2, "COURSES (PK)", "PK: id (UUID)\n* slug: VARCHAR\n* title: VARCHAR\n* category\n* level\n* lessons_count", "#EFF6FF", BLUE)
    draw_box(ax, 3.7, 3.5, 2.6, 2.2, "ENROLLMENTS (FK)", "PK: id (UUID)\nFK: user_id (Users)\nFK: course_id (Courses)\n* progress_percent\n* is_completed", "#F1F5F9", SLATE)
    
    draw_box(ax, 0.5, 0.6, 2.6, 2.2, "CERTIFICATES (FK)", "PK: id (UUID)\nFK: user_id (Users)\nFK: course_id (Courses)\n* certificate_code\n* sha256_digest", "#ECFDF5", ACCENT_GREEN)
    draw_box(ax, 3.7, 0.6, 2.6, 2.2, "COMMUNITY_POSTS", "PK: id (UUID)\nFK: author_id (Users)\n* title: VARCHAR\n* body: TEXT\n* upvotes: INT", "#FFFBEB", ACCENT_AMBER)
    draw_box(ax, 6.9, 0.6, 2.6, 2.2, "INTERVIEW_SESSIONS", "PK: id (UUID)\nFK: user_id (Users)\n* track: VARCHAR\n* total_score: INT\n* star_rubric: JSON", "#FDF2F8", ACCENT_PURPLE)
    
    draw_arrow(ax, 3.1, 4.6, 3.7, 4.6, "1 : N")
    draw_arrow(ax, 6.9, 4.6, 6.3, 4.6, "1 : N")
    draw_arrow(ax, 1.8, 3.5, 1.8, 2.8, "1 : N")
    draw_arrow(ax, 3.1, 3.8, 3.7, 1.7, "1 : N")
    draw_arrow(ax, 3.1, 3.6, 6.9, 1.7, "1 : N")
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "erd_schema_diagram.png"), dpi=300)
    plt.close()

# ==============================================================================
# 7. CLOUD DEPLOYMENT TOPOLOGY
# ==============================================================================
def generate_cloud_topology_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")
    
    ax.text(5, 6.2, "Production Cloud Infrastructure Deployment Topology (AWS VPC)", ha="center", va="center", fontsize=14, fontweight="bold", color=NAVY)
    
    # Outer VPC boundary
    vpc = patches.FancyBboxPatch((0.4, 0.4), 9.2, 5.5, boxstyle="round,pad=0.08", facecolor="#F8FAFC", edgecolor="#64748B", lw=1.5, ls="--")
    ax.add_patch(vpc)
    ax.text(0.6, 5.6, "AWS Virtual Private Cloud (VPC: 10.0.0.0/16)", fontsize=9, fontweight="bold", color="#334155")
    
    # Ingress
    draw_box(ax, 0.8, 4.3, 2.4, 1.0, "Route 53 DNS", "Latency Routing\nDNS Failover", "#FFFFFF", BLUE)
    draw_box(ax, 3.8, 4.3, 2.4, 1.0, "CloudFront CDN", "Edge Caching\n100+ Global PoPs", "#FFFFFF", BLUE)
    draw_box(ax, 6.8, 4.3, 2.4, 1.0, "Application LB", "Multi-AZ Ingress\nSSL Termination", "#FFFFFF", BLUE)
    
    draw_arrow(ax, 3.2, 4.8, 3.8, 4.8)
    draw_arrow(ax, 6.2, 4.8, 6.8, 4.8)
    
    # Subnet 1: Private App Tier
    sub1 = patches.FancyBboxPatch((0.8, 2.3), 8.4, 1.6, boxstyle="round,pad=0.05", facecolor="#EFF6FF", edgecolor="#BFDBFE", lw=1.0)
    ax.add_patch(sub1)
    ax.text(1.0, 3.65, "Private Application Subnet (ECS Fargate Containers)", fontsize=8, fontweight="bold", color=NAVY)
    draw_box(ax, 1.2, 2.5, 2.2, 0.9, "ECS Task Replica 1", "0.5 vCPU | 1GB RAM", "#FFFFFF", BLUE)
    draw_box(ax, 3.9, 2.5, 2.2, 0.9, "ECS Task Replica 2", "0.5 vCPU | 1GB RAM", "#FFFFFF", BLUE)
    draw_box(ax, 6.6, 2.5, 2.2, 0.9, "ECS Auto-Scaler", "CPU > 75% Scale-Up", "#FFFFFF", BLUE)
    
    draw_arrow(ax, 8.0, 4.3, 8.0, 3.9)
    
    # Subnet 2: Private Data Tier
    sub2 = patches.FancyBboxPatch((0.8, 0.6), 8.4, 1.4, boxstyle="round,pad=0.05", facecolor="#ECFDF5", edgecolor="#A7F3D0", lw=1.0)
    ax.add_patch(sub2)
    ax.text(1.0, 1.75, "Private Persistence Subnet (Aurora PostgreSQL & ElastiCache)", fontsize=8, fontweight="bold", color="#065F46")
    draw_box(ax, 1.2, 0.8, 2.2, 0.8, "Aurora Primary", "Multi-AZ Writer", "#FFFFFF", "#059669", "#065F46")
    draw_box(ax, 3.9, 0.8, 2.2, 0.8, "Aurora Standby", "Auto-Failover Node", "#FFFFFF", "#059669", "#065F46")
    draw_box(ax, 6.6, 0.8, 2.2, 0.8, "ElastiCache Redis", "In-Memory Session Store", "#FFFFFF", "#059669", "#065F46")
    
    draw_arrow(ax, 2.3, 2.5, 2.3, 1.6)
    draw_arrow(ax, 5.0, 2.5, 5.0, 1.6)
    draw_arrow(ax, 7.7, 2.5, 7.7, 1.6)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "cloud_deployment_topology.png"), dpi=300)
    plt.close()

if __name__ == "__main__":
    print("Generating High-Resolution Architectural Diagram Images...")
    generate_hld_diagram()
    generate_lld_diagram()
    generate_workflow_learner_diagram()
    generate_workflow_kafka_diagram()
    generate_workflow_codeduel_diagram()
    generate_erd_diagram()
    generate_cloud_topology_diagram()
    print("All Diagram Images Successfully Generated in:", OUTPUT_DIR)
