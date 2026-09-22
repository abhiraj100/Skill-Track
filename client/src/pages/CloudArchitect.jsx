import { useState, useMemo } from "react";
import {
  Cloud,
  Server,
  Database,
  Globe,
  Layers,
  Cpu,
  Shield,
  Activity,
  DollarSign,
  Download,
  Copy,
  Check,
  RefreshCw,
  Zap,
  HardDrive,
  Network,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  TrendingDown
} from "lucide-react";
import toast from "react-hot-toast";

const ARCH_PRESETS = [
  {
    id: "saas",
    name: "Modern SaaS Web Platform",
    tagline: "High availability, decoupled tiers with multi-AZ resilience",
    description: "CloudFront CDN + ALB + Auto-scaling ECS Fargate containers + Aurora Serverless DB + Redis caching.",
    nodes: ["cdn", "alb", "ecs", "aurora", "redis", "s3"],
    dau: 25000,
    storageGb: 250,
    bandwidthGb: 1200,
    computeVcpu: 8,
  },
  {
    id: "streaming",
    name: "Video & Media Streaming Pipeline",
    tagline: "Petabyte-scale distributed CDN & transcode queue",
    description: "Global edge caching with S3 origin, SQS asynchronous transcode cluster, and DynamoDB metadata store.",
    nodes: ["cdn", "apigw", "lambda", "sqs", "dynamo", "s3"],
    dau: 120000,
    storageGb: 5000,
    bandwidthGb: 15000,
    computeVcpu: 16,
  },
  {
    id: "ai_inference",
    name: "AI / LLM Inference API Platform",
    tagline: "GPU container fleet with vector database & rate limiting",
    description: "Cloudflare edge DDoS protection + EKS GPU nodes + pgvector Postgres + Redis prompt cache.",
    nodes: ["cdn", "alb", "eks", "aurora", "redis", "s3"],
    dau: 40000,
    storageGb: 1200,
    bandwidthGb: 3500,
    computeVcpu: 32,
  },
  {
    id: "serverless",
    name: "Zero-Ops Serverless Microservices",
    tagline: "Pay-per-request event-driven architecture",
    description: "HTTP API Gateway + AWS Lambda microservices + DynamoDB Single-Table + S3 static SPA hosting.",
    nodes: ["cdn", "apigw", "lambda", "dynamo", "s3"],
    dau: 15000,
    storageGb: 100,
    bandwidthGb: 800,
    computeVcpu: 4,
  },
];

const AVAILABLE_NODES = {
  cdn: {
    id: "cdn",
    name: "AWS CloudFront / Edge CDN",
    category: "Edge & Networking",
    icon: Globe,
    color: "from-sky-500 to-blue-600",
    tier: "Edge",
    baseCost: 15,
    unit: "$0.085/GB transfer",
    status: "Healthy",
    latency: "8ms",
  },
  alb: {
    id: "alb",
    name: "Application Load Balancer (ALB)",
    category: "Edge & Networking",
    icon: Network,
    color: "from-indigo-500 to-violet-600",
    tier: "Network",
    baseCost: 22,
    unit: "$0.0225/LCU-hour",
    status: "Healthy",
    latency: "12ms",
  },
  apigw: {
    id: "apigw",
    name: "API Gateway (HTTP / REST)",
    category: "Edge & Networking",
    icon: Zap,
    color: "from-violet-500 to-purple-600",
    tier: "Network",
    baseCost: 10,
    unit: "$1.00/million reqs",
    status: "Healthy",
    latency: "15ms",
  },
  ecs: {
    id: "ecs",
    name: "ECS Fargate (Container Fleet)",
    category: "Compute",
    icon: Cpu,
    color: "from-amber-500 to-orange-600",
    tier: "Compute",
    baseCost: 45,
    unit: "$0.04048/vCPU-hour",
    status: "Auto-scaled",
    latency: "28ms",
  },
  eks: {
    id: "eks",
    name: "EKS Kubernetes Cluster (GPU/Spot)",
    category: "Compute",
    icon: Server,
    color: "from-orange-500 to-red-600",
    tier: "Compute",
    baseCost: 73,
    unit: "$0.10/cluster-hour + nodes",
    status: "3 Nodes Active",
    latency: "22ms",
  },
  lambda: {
    id: "lambda",
    name: "AWS Lambda (Serverless)",
    category: "Compute",
    icon: Zap,
    color: "from-yellow-500 to-amber-600",
    tier: "Compute",
    baseCost: 5,
    unit: "$0.20/million requests",
    status: "Event-triggered",
    latency: "45ms cold / 6ms warm",
  },
  aurora: {
    id: "aurora",
    name: "Amazon Aurora Serverless v2",
    category: "Database",
    icon: Database,
    color: "from-emerald-500 to-teal-600",
    tier: "Data Store",
    baseCost: 65,
    unit: "$0.12/ACU-hour + storage",
    status: "Multi-AZ Primary",
    latency: "4ms",
  },
  dynamo: {
    id: "dynamo",
    name: "Amazon DynamoDB (NoSQL)",
    category: "Database",
    icon: Database,
    color: "from-blue-500 to-cyan-600",
    tier: "Data Store",
    baseCost: 20,
    unit: "$1.25/million WCU",
    status: "On-Demand Global",
    latency: "2ms",
  },
  redis: {
    id: "redis",
    name: "ElastiCache Redis / Valkey",
    category: "Caching",
    icon: HardDrive,
    color: "from-rose-500 to-red-600",
    tier: "Cache",
    baseCost: 35,
    unit: "cache.t4g.medium ($0.068/hr)",
    status: "Cluster Mode On",
    latency: "< 1ms",
  },
  sqs: {
    id: "sqs",
    name: "Amazon SQS Message Queue",
    category: "Messaging",
    icon: Layers,
    color: "from-purple-500 to-indigo-600",
    tier: "Queue",
    baseCost: 4,
    unit: "$0.40/million requests",
    status: "FIFO Dedicated",
    latency: "10ms",
  },
  s3: {
    id: "s3",
    name: "Amazon S3 Object Storage",
    category: "Storage",
    icon: HardDrive,
    color: "from-teal-500 to-emerald-600",
    tier: "Storage",
    baseCost: 10,
    unit: "$0.023/GB-month",
    status: "Standard + IA Lifecycle",
    latency: "25ms",
  },
};

export default function CloudArchitect() {
  const [selectedPreset, setSelectedPreset] = useState("saas");
  const [activeNodes, setActiveNodes] = useState(ARCH_PRESETS[0].nodes);
  const [dau, setDau] = useState(ARCH_PRESETS[0].dau);
  const [storageGb, setStorageGb] = useState(ARCH_PRESETS[0].storageGb);
  const [bandwidthGb, setBandwidthGb] = useState(ARCH_PRESETS[0].bandwidthGb);
  const [computeVcpu, setComputeVcpu] = useState(ARCH_PRESETS[0].computeVcpu);
  const [copiedTf, setCopiedTf] = useState(false);
  const [activeTab, setActiveTab] = useState("canvas"); // 'canvas' | 'costs' | 'terraform'

  // Apply preset
  const handleSelectPreset = (presetId) => {
    const p = ARCH_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setSelectedPreset(presetId);
    setActiveNodes(p.nodes);
    setDau(p.dau);
    setStorageGb(p.storageGb);
    setBandwidthGb(p.bandwidthGb);
    setComputeVcpu(p.computeVcpu);
    toast.success(`Loaded "${p.name}" architecture preset!`);
  };

  const toggleNode = (nodeId) => {
    if (activeNodes.includes(nodeId)) {
      if (activeNodes.length <= 2) {
        toast.error("Architecture must have at least 2 connected components");
        return;
      }
      setActiveNodes(activeNodes.filter((id) => id !== nodeId));
    } else {
      setActiveNodes([...activeNodes, nodeId]);
    }
  };

  // Cost Calculation Model
  const costBreakdown = useMemo(() => {
    // Traffic multipliers
    const monthlyRequests = dau * 40 * 30; // avg 40 reqs/day/user
    const bandwidthCost = activeNodes.includes("cdn")
      ? bandwidthGb * 0.08
      : bandwidthGb * 0.09;

    let computeCost = 0;
    if (activeNodes.includes("ecs")) {
      computeCost += computeVcpu * 0.04048 * 730; // 730 hours/mo
    }
    if (activeNodes.includes("eks")) {
      computeCost += 73 + (computeVcpu / 2) * 0.08 * 730;
    }
    if (activeNodes.includes("lambda")) {
      computeCost += (monthlyRequests / 1000000) * 0.2 + (computeVcpu * 0.0000166667 * 730 * 10);
    }

    let databaseCost = 0;
    if (activeNodes.includes("aurora")) {
      databaseCost += 45 + storageGb * 0.10 + (dau > 50000 ? 60 : 20);
    }
    if (activeNodes.includes("dynamo")) {
      databaseCost += 15 + (monthlyRequests / 1000000) * 1.25 + storageGb * 0.25;
    }

    let storageCost = 0;
    if (activeNodes.includes("s3")) {
      storageCost += storageGb * 0.023 + (monthlyRequests / 100000) * 0.005;
    }

    let networkCost = 0;
    if (activeNodes.includes("alb")) {
      networkCost += 22.5 + (bandwidthGb / 500) * 5;
    }
    if (activeNodes.includes("apigw")) {
      networkCost += (monthlyRequests / 1000000) * 1.0;
    }

    let cacheCost = 0;
    if (activeNodes.includes("redis")) {
      cacheCost += 34.5 + (dau > 50000 ? 50 : 0);
    }
    if (activeNodes.includes("sqs")) {
      cacheCost += (monthlyRequests / 1000000) * 0.4;
    }

    const total = computeCost + databaseCost + storageCost + networkCost + cacheCost + bandwidthCost;

    return {
      compute: Math.round(computeCost),
      database: Math.round(databaseCost),
      storage: Math.round(storageCost),
      network: Math.round(networkCost),
      cache: Math.round(cacheCost),
      bandwidth: Math.round(bandwidthCost),
      total: Math.round(total),
      monthlyRequests: Math.round(monthlyRequests),
    };
  }, [activeNodes, dau, storageGb, bandwidthGb, computeVcpu]);

  // Generated Terraform IaC
  const generatedTerraform = useMemo(() => {
    let tf = `# =======================================================
# SkillTrack Cloud Architect - Generated Terraform (AWS)
# Preset: ${selectedPreset.toUpperCase()} | Estimated: $${costBreakdown.total}/mo
# Target DAU: ${dau.toLocaleString()} | Compute vCPUs: ${computeVcpu}
# =======================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Environment = "production"
      ManagedBy   = "SkillTrack-Architect"
      Project     = "CloudScale"
    }
  }
}

# --- Virtual Private Cloud (VPC) ---
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "skilltrack-vpc" }
}

resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "us-east-1a"
}
`;

    if (activeNodes.includes("cdn")) {
      tf += `
# --- Edge CDN Distribution ---
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id   = "S3-Assets"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Assets"
    viewer_protocol_policy = "redirect-to-https"
  }
}
`;
    }

    if (activeNodes.includes("alb")) {
      tf += `
# --- Application Load Balancer ---
resource "aws_lb" "external" {
  name               = "skilltrack-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id]
}
`;
    }

    if (activeNodes.includes("ecs")) {
      tf += `
# --- ECS Fargate Cluster & Task Definition ---
resource "aws_ecs_cluster" "app_cluster" {
  name = "production-ecs-cluster"
}

resource "aws_ecs_task_definition" "web" {
  family                   = "web-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "${computeVcpu * 256}"
  memory                   = "${computeVcpu * 512}"
}
`;
    }

    if (activeNodes.includes("aurora")) {
      tf += `
# --- Aurora Serverless v2 PostgreSQL ---
resource "aws_rds_cluster" "aurora_db" {
  cluster_identifier = "skilltrack-aurora"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  database_name      = "skilltrack_prod"
  master_username    = "dbadmin"
  master_password    = "ChangeMeInSecretsManager123!"

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 16.0
  }
}
`;
    }

    if (activeNodes.includes("redis")) {
      tf += `
# --- ElastiCache Redis Subnet & Cluster ---
resource "aws_elasticache_cluster" "redis_cache" {
  cluster_id           = "skilltrack-redis"
  engine               = "redis"
  node_type            = "cache.t4g.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}
`;
    }

    if (activeNodes.includes("s3")) {
      tf += `
# --- S3 Object Storage Bucket ---
resource "aws_s3_bucket" "static_assets" {
  bucket = "skilltrack-storage-prod-\${uuid()}"
}

resource "aws_s3_bucket_versioning" "assets_versioning" {
  bucket = aws_s3_bucket.static_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}
`;
    }

    return tf;
  }, [activeNodes, selectedPreset, costBreakdown.total, dau, computeVcpu]);

  const copyTerraform = () => {
    navigator.clipboard.writeText(generatedTerraform);
    setCopiedTf(true);
    toast.success("Terraform code copied to clipboard!");
    setTimeout(() => setCopiedTf(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <Cloud size={14} /> Cloud Architecture Studio v2.6
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cloud Topology & Live AWS Cost Estimator
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Design production-grade AWS/GCP system topologies, calculate real-time monthly infrastructure bills
              based on active users and bandwidth, and export production-ready Terraform IaC in 1 click.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Estimated Monthly Run</p>
              <p className="text-2xl font-black text-white">${costBreakdown.total} <span className="text-xs font-normal text-slate-300">/ mo</span></p>
              <p className="text-[10px] text-emerald-400 font-semibold">~${(costBreakdown.total / (dau || 1)).toFixed(3)} per active user</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            System Architecture Templates
          </h2>
          <span className="text-xs text-brand-600 font-semibold">Click to swap preset</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ARCH_PRESETS.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`text-left rounded-2xl p-4 transition-all border ${
                  isSelected
                    ? "bg-brand-50/80 border-brand-500 shadow-md ring-2 ring-brand-500/20 dark:bg-brand-950/40 dark:border-brand-500"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-brand-600" />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">{p.tagline}</p>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono">
                    {p.nodes.length} Services
                  </span>
                  <span>{p.dau.toLocaleString()} DAU baseline</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "canvas"
              ? "border-brand-600 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Layers size={15} /> Topology Canvas ({activeNodes.length} Services)
        </button>
        <button
          onClick={() => setActiveTab("costs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "costs"
              ? "border-brand-600 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <DollarSign size={15} /> Bill Breakdown & Optimization
        </button>
        <button
          onClick={() => setActiveTab("terraform")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "terraform"
              ? "border-brand-600 text-brand-600 dark:text-brand-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Download size={15} /> Terraform HCL Export
        </button>
      </div>

      {/* TAB 1: TOPOLOGY CANVAS */}
      {activeTab === "canvas" && (
        <div className="space-y-6">
          {/* Active Topology Flow Visualization */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-900/50 dark:to-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity size={16} className="text-brand-600 animate-pulse" /> Live Request Pipeline Topology
                </h3>
                <p className="text-xs text-slate-500">
                  Visual tier sequence from edge ingress down to persistent storage. Toggle components below to inspect impact.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                P99 Ingress Latency ~42ms
              </span>
            </div>

            {/* Sequence Flow */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {activeNodes.map((nodeKey, idx) => {
                const node = AVAILABLE_NODES[nodeKey];
                if (!node) return null;
                const IconComponent = node.icon;
                return (
                  <div
                    key={node.id}
                    className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Tier {idx + 1}: {node.tier}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          {node.latency}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shadow-sm`}>
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{node.name}</p>
                          <p className="text-[10px] text-slate-500">{node.category}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{node.status}</span>
                      <button
                        onClick={() => toggleNode(node.id)}
                        className="text-[10px] text-rose-500 font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Component Catalog / Toggle Grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Cloud Service Catalog (Click to Enable / Disable)
                </h3>
                <p className="text-xs text-slate-500">
                  Select and assemble services into your custom architecture.
                </p>
              </div>
              <span className="text-xs text-slate-400">{Object.keys(AVAILABLE_NODES).length} AWS Services cataloged</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Object.values(AVAILABLE_NODES).map((item) => {
                const isActive = activeNodes.includes(item.id);
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleNode(item.id)}
                    className={`flex items-start gap-3 rounded-2xl p-3.5 text-left transition border ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-brand-950 dark:border-brand-600"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <div className={`mt-0.5 h-8 w-8 rounded-lg bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shrink-0`}>
                      <ItemIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                      </div>
                      <p className={`text-[10px] ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                        {item.unit}
                      </p>
                      <span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {isActive ? "✓ Included" : "+ Add"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COSTS & CAPACITY SLIDERS */}
      {activeTab === "costs" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Sliders Section */}
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders size={16} className="text-brand-600" /> Capacity & Traffic Dimensions
              </h3>
              <p className="text-xs text-slate-500">
                Adjust expected workload scale to test cost sensitivity and auto-scaling elasticity.
              </p>
            </div>

            {/* DAU Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Daily Active Users (DAU)</span>
                <span className="text-brand-600 font-mono font-bold">{dau.toLocaleString()} users/day</span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="5000"
                value={dau}
                onChange={(e) => setDau(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Calculates ~{(costBreakdown.monthlyRequests / 1000000).toFixed(1)}M requests/month across all API routes
              </p>
            </div>

            {/* Storage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Primary Database & Object Storage (GB)</span>
                <span className="text-brand-600 font-mono font-bold">{storageGb.toLocaleString()} GB</span>
              </div>
              <input
                type="range"
                min="10"
                max="10000"
                step="50"
                value={storageGb}
                onChange={(e) => setStorageGb(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Aurora DB provisioned storage + S3 compressed media storage</p>
            </div>

            {/* Bandwidth Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Outbound Data Transfer (GB/mo)</span>
                <span className="text-brand-600 font-mono font-bold">{bandwidthGb.toLocaleString()} GB / month</span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="250"
                value={bandwidthGb}
                onChange={(e) => setBandwidthGb(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Public internet egress via CloudFront edge locations</p>
            </div>

            {/* Compute vCPUs */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Peak Compute Capacity (vCPUs)</span>
                <span className="text-brand-600 font-mono font-bold">{computeVcpu} vCPUs (Across cluster)</span>
              </div>
              <input
                type="range"
                min="2"
                max="64"
                step="2"
                value={computeVcpu}
                onChange={(e) => setComputeVcpu(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Container worker nodes or concurrent execution containers</p>
            </div>
          </div>

          {/* Itemized Bill & Optimization Tips */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Itemized Cost Ledger</span>
                <span className="text-xs font-mono font-bold text-brand-600">${costBreakdown.total} / month</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Compute (ECS/Lambda/EKS)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">${costBreakdown.compute}/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Managed Databases (Aurora/Dynamo)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">${costBreakdown.database}/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Egress Data & CDN Bandwidth</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">${costBreakdown.bandwidth}/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Load Balancers & Ingress Gateway</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">${costBreakdown.network}/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Redis In-Memory Cache & Queues</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">${costBreakdown.cache}/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">S3 Object Storage & Snapshots</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">${costBreakdown.storage}/mo</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                <span>Annualized Total (12 Months)</span>
                <span className="font-mono text-brand-600">${(costBreakdown.total * 12).toLocaleString()} / yr</span>
              </div>
            </div>

            {/* Architecture Optimization Recommendations */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <TrendingDown size={16} /> Cost Optimization Insights
              </div>
              <ul className="space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>1-Year Compute Savings Plan:</strong> Committing to baseline compute will save ~34% (${Math.round(costBreakdown.compute * 0.34)}/mo).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>S3 Intelligent-Tiering:</strong> Move stale assets past 30 days to save up to 40% on storage bills.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>CloudFront Edge TTL:</strong> Caching static API responses at edge reduces container load by up to 55%.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TERRAFORM EXPORT */}
      {activeTab === "terraform" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Production-Ready HashiCorp Terraform Code
              </h3>
              <p className="text-xs text-slate-500">
                Directly matches your active topology configuration and security subnet isolation.
              </p>
            </div>
            <button
              onClick={copyTerraform}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-500 shadow-md shadow-brand-500/20"
            >
              {copiedTf ? <Check size={14} /> : <Copy size={14} />}
              {copiedTf ? "Copied HCL!" : "Copy Terraform"}
            </button>
          </div>

          <div className="relative rounded-3xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs text-slate-300 shadow-xl overflow-x-auto max-h-[550px]">
            <pre className="leading-relaxed">{generatedTerraform}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
