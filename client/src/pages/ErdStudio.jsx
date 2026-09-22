import { useState, useMemo } from "react";
import {
  Database,
  Table,
  Key,
  Link as LinkIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  FileCode2,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

const ERD_PRESETS = [
  {
    id: "ecommerce",
    name: "E-Commerce & Orders Core",
    tagline: "Users, Products, Orders & Line Items",
    tables: [
      {
        id: "users",
        name: "users",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "email", type: "VARCHAR(255)", isPk: false, isFk: false, unique: true },
          { name: "password_hash", type: "VARCHAR(255)", isPk: false, isFk: false },
          { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false },
        ]
      },
      {
        id: "products",
        name: "products",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "title", type: "VARCHAR(128)", isPk: false, isFk: false },
          { name: "price_cents", type: "INT", isPk: false, isFk: false },
          { name: "inventory_count", type: "INT", isPk: false, isFk: false },
        ]
      },
      {
        id: "orders",
        name: "orders",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "user_id", type: "UUID", isPk: false, isFk: true, fkTarget: "users.id" },
          { name: "total_amount", type: "INT", isPk: false, isFk: false },
          { name: "status", type: "VARCHAR(32)", isPk: false, isFk: false },
          { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false },
        ]
      },
      {
        id: "order_items",
        name: "order_items",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "order_id", type: "UUID", isPk: false, isFk: true, fkTarget: "orders.id" },
          { name: "product_id", type: "UUID", isPk: false, isFk: true, fkTarget: "products.id" },
          { name: "quantity", type: "INT", isPk: false, isFk: false },
          { name: "unit_price", type: "INT", isPk: false, isFk: false },
        ]
      }
    ]
  },
  {
    id: "saas",
    name: "Multi-Tenant B2B SaaS",
    tagline: "Organizations, Memberships, Subscriptions & Audit",
    tables: [
      {
        id: "organizations",
        name: "organizations",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "slug", type: "VARCHAR(64)", isPk: false, isFk: false, unique: true },
          { name: "plan", type: "VARCHAR(32)", isPk: false, isFk: false },
          { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false },
        ]
      },
      {
        id: "users",
        name: "users",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "email", type: "VARCHAR(255)", isPk: false, isFk: false, unique: true },
          { name: "name", type: "VARCHAR(100)", isPk: false, isFk: false },
        ]
      },
      {
        id: "memberships",
        name: "memberships",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "org_id", type: "UUID", isPk: false, isFk: true, fkTarget: "organizations.id" },
          { name: "user_id", type: "UUID", isPk: false, isFk: true, fkTarget: "users.id" },
          { name: "role", type: "VARCHAR(32)", isPk: false, isFk: false },
        ]
      },
      {
        id: "audit_logs",
        name: "audit_logs",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "org_id", type: "UUID", isPk: false, isFk: true, fkTarget: "organizations.id" },
          { name: "actor_id", type: "UUID", isPk: false, isFk: true, fkTarget: "users.id" },
          { name: "action", type: "VARCHAR(64)", isPk: false, isFk: false },
          { name: "payload", type: "JSONB", isPk: false, isFk: false },
        ]
      }
    ]
  },
  {
    id: "lms",
    name: "SkillTrack LMS Schema",
    tagline: "Users, Courses, Lessons, Quizzes & Verified Certs",
    tables: [
      {
        id: "users",
        name: "users",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "name", type: "VARCHAR(100)", isPk: false, isFk: false },
          { name: "email", type: "VARCHAR(255)", isPk: false, isFk: false, unique: true },
          { name: "role", type: "VARCHAR(20)", isPk: false, isFk: false },
        ]
      },
      {
        id: "courses",
        name: "courses",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "title", type: "VARCHAR(128)", isPk: false, isFk: false },
          { name: "category", type: "VARCHAR(64)", isPk: false, isFk: false },
          { name: "level", type: "VARCHAR(32)", isPk: false, isFk: false },
        ]
      },
      {
        id: "lessons",
        name: "lessons",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "course_id", type: "UUID", isPk: false, isFk: true, fkTarget: "courses.id" },
          { name: "title", type: "VARCHAR(128)", isPk: false, isFk: false },
          { name: "order_seq", type: "INT", isPk: false, isFk: false },
        ]
      },
      {
        id: "certificates",
        name: "certificates",
        columns: [
          { name: "id", type: "UUID", isPk: true, isFk: false },
          { name: "user_id", type: "UUID", isPk: false, isFk: true, fkTarget: "users.id" },
          { name: "course_id", type: "UUID", isPk: false, isFk: true, fkTarget: "courses.id" },
          { name: "cert_code", type: "VARCHAR(64)", isPk: false, isFk: false, unique: true },
        ]
      }
    ]
  }
];

export default function ErdStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState("ecommerce");
  const [tables, setTables] = useState(ERD_PRESETS[0].tables);
  const [activeTableId, setActiveTableId] = useState(ERD_PRESETS[0].tables[0].id);

  // New column state
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("VARCHAR(128)");
  const [newColFk, setNewColFk] = useState("");

  const [activeTab, setActiveTab] = useState("diagram"); // 'diagram' | 'sql' | 'prisma'
  const [copiedCode, setCopiedCode] = useState(false);

  // Load preset
  const handleSelectPreset = (pId) => {
    const p = ERD_PRESETS.find((x) => x.id === pId);
    if (!p) return;
    setSelectedPresetId(pId);
    setTables(p.tables);
    setActiveTableId(p.tables[0].id);
    toast.success(`Loaded "${p.name}" ERD template`);
  };

  // Add Column to Active Table
  const handleAddColumn = () => {
    if (!newColName.trim()) {
      toast.error("Please enter a column name");
      return;
    }

    setTables(
      tables.map((t) => {
        if (t.id !== activeTableId) return t;
        const newCol = {
          name: newColName.toLowerCase().replace(/\s+/g, "_"),
          type: newColType,
          isPk: false,
          isFk: Boolean(newColFk),
          fkTarget: newColFk || undefined,
        };
        return {
          ...t,
          columns: [...t.columns, newCol],
        };
      })
    );

    setNewColName("");
    setNewColFk("");
    toast.success("Column added successfully!");
  };

  // Remove Column
  const handleRemoveColumn = (tableId, colName) => {
    setTables(
      tables.map((t) => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          columns: t.columns.filter((c) => c.name !== colName),
        };
      })
    );
  };

  // Generated PostgreSQL DDL
  const generatedSql = useMemo(() => {
    let sql = `-- ========================================================\n-- SkillTrack Visual ERD Studio - Generated PostgreSQL DDL\n-- Generated on: ${new Date().toISOString()}\n-- ========================================================\n\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;

    tables.forEach((t) => {
      sql += `CREATE TABLE ${t.name} (\n`;
      const colDefs = t.columns.map((c) => {
        let def = `  ${c.name} ${c.type}`;
        if (c.isPk) def += " PRIMARY KEY DEFAULT uuid_generate_v4()";
        if (c.unique && !c.isPk) def += " UNIQUE NOT NULL";
        return def;
      });
      sql += colDefs.join(",\n");
      sql += "\n);\n\n";
    });

    // Foreign Keys
    sql += "-- Foreign Key Relationships\n";
    tables.forEach((t) => {
      t.columns.forEach((c) => {
        if (c.isFk && c.fkTarget) {
          const [targetTable, targetCol] = c.fkTarget.split(".");
          sql += `ALTER TABLE ${t.name} ADD CONSTRAINT fk_${t.name}_${c.name}\n`;
          sql += `  FOREIGN KEY (${c.name}) REFERENCES ${targetTable}(${targetCol}) ON DELETE CASCADE;\n\n`;
        }
      });
    });

    return sql;
  }, [tables]);

  // Generated Prisma Schema
  const generatedPrisma = useMemo(() => {
    let prisma = `// ========================================================\n// SkillTrack Visual ERD Studio - Generated Prisma Schema\n// ========================================================\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;

    tables.forEach((t) => {
      const modelName = t.name.charAt(0).toUpperCase() + t.name.slice(1);
      prisma += `model ${modelName} {\n`;
      t.columns.forEach((c) => {
        let prismaType = "String";
        if (c.type.includes("INT")) prismaType = "Int";
        if (c.type.includes("TIMESTAMP")) prismaType = "DateTime @default(now())";
        if (c.type.includes("BOOLEAN")) prismaType = "Boolean @default(false)";
        if (c.type.includes("JSONB")) prismaType = "Json";

        let attrs = "";
        if (c.isPk) attrs = "@id @default(uuid())";
        if (c.unique && !c.isPk) attrs = "@unique";

        prisma += `  ${c.name.padEnd(16)} ${prismaType.padEnd(12)} ${attrs}\n`;
      });
      prisma += `\n  @@map("${t.name}")\n}\n\n`;
    });

    return prisma;
  }, [tables]);

  const copyCode = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeTable = tables.find((t) => t.id === activeTableId) || tables[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-blue-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
              <Database size={14} /> Database Schema & ERD Studio v2.7
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Entity Relationship Diagram (ERD) Studio
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Design relational database models with visual primary & foreign key linkages.
              Inspect live table schemas, add columns interactively, and export PostgreSQL DDL & Prisma ORM schemas.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Table size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Schema Complexity</p>
              <p className="text-2xl font-black text-white">{tables.length} <span className="text-xs font-normal text-slate-300">Tables</span></p>
              <p className="text-[10px] text-blue-400 font-semibold">
                {tables.reduce((acc, t) => acc + t.columns.length, 0)} Total Attributes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Industry Architecture Presets
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {ERD_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`text-left rounded-2xl p-4 transition-all border ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20 dark:bg-blue-950/40 dark:border-blue-500"
                    : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{p.tagline}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>{p.tables.length} Tables</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("diagram")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "diagram"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Layers size={15} /> Visual ERD Canvas
        </button>
        <button
          onClick={() => setActiveTab("sql")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "sql"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Database size={15} /> PostgreSQL DDL SQL Export
        </button>
        <button
          onClick={() => setActiveTab("prisma")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "prisma"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <FileCode2 size={15} /> Prisma ORM Schema Export
        </button>
      </div>

      {/* TAB 1: VISUAL ERD CANVAS */}
      {activeTab === "diagram" && (
        <div className="space-y-6">
          {/* Tables Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tables.map((t) => {
              const isActive = activeTableId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTableId(t.id)}
                  className={`rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                    isActive
                      ? "border-blue-500 shadow-lg ring-2 ring-blue-500/20 dark:border-blue-500"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                  } bg-white dark:bg-slate-900`}
                >
                  {/* Table Header */}
                  <div className={`p-3.5 border-b flex items-center justify-between ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 border-slate-100 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  }`}>
                    <div className="flex items-center gap-2 font-mono font-bold text-xs">
                      <Table size={15} />
                      <span>{t.name}</span>
                    </div>
                    <span className="text-[10px] opacity-80">{t.columns.length} cols</span>
                  </div>

                  {/* Columns List */}
                  <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                    {t.columns.map((c) => (
                      <div key={c.name} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          {c.isPk ? (
                            <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1 py-0.5 rounded font-bold">
                              PK
                            </span>
                          ) : c.isFk ? (
                            <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1 py-0.5 rounded font-bold">
                              FK
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                          )}
                          <span className={`font-semibold ${c.isPk ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"}`}>
                            {c.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Column Editor Drawer */}
          {activeTable && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Table size={16} className="text-blue-600" /> Managing Table: <span className="font-mono text-blue-600">{activeTable.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500">Add or inspect field attributes and foreign key references.</p>
                </div>
                <span className="text-xs font-mono text-slate-400">{activeTable.columns.length} Columns Defined</span>
              </div>

              {/* Add Column Row */}
              <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Column name (e.g. status)"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950 flex-1 min-w-[140px]"
                />

                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="VARCHAR(128)">VARCHAR(128)</option>
                  <option value="VARCHAR(255)">VARCHAR(255)</option>
                  <option value="TEXT">TEXT</option>
                  <option value="INT">INT</option>
                  <option value="BIGINT">BIGINT</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="TIMESTAMP">TIMESTAMP</option>
                  <option value="JSONB">JSONB</option>
                  <option value="UUID">UUID</option>
                </select>

                <select
                  value={newColFk}
                  onChange={(e) => setNewColFk(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">No FK (Standard Field)</option>
                  {tables
                    .filter((t) => t.id !== activeTable.id)
                    .map((t) => (
                      <option key={t.id} value={`${t.name}.id`}>
                        FK &rarr; {t.name}.id
                      </option>
                    ))}
                </select>

                <button
                  onClick={handleAddColumn}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  <Plus size={14} /> Add Column
                </button>
              </div>

              {/* Table Column Detail List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <tr>
                      <th className="p-2.5">Attribute Name</th>
                      <th className="p-2.5">SQL Type</th>
                      <th className="p-2.5">Key Type</th>
                      <th className="p-2.5">Foreign Key Target</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeTable.columns.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{c.type}</td>
                        <td className="p-2.5">
                          {c.isPk ? (
                            <span className="text-[10px] font-bold text-amber-600">Primary Key (PK)</span>
                          ) : c.isFk ? (
                            <span className="text-[10px] font-bold text-blue-600">Foreign Key (FK)</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Standard Field</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500">{c.fkTarget || "—"}</td>
                        <td className="p-2.5 text-right">
                          {!c.isPk && (
                            <button
                              onClick={() => handleRemoveColumn(activeTable.id, c.name)}
                              className="text-rose-500 hover:text-rose-600 p-1 rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SQL DDL EXPORT */}
      {activeTab === "sql" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Generated PostgreSQL DDL Statements
              </h3>
              <p className="text-xs text-slate-500">
                Execute directly in PostgreSQL / Supabase / Neon SQL editor.
              </p>
            </div>
            <button
              onClick={() => copyCode(generatedSql, "PostgreSQL DDL")}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              {copiedCode ? "Copied SQL!" : "Copy SQL DDL"}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs text-blue-300 shadow-xl overflow-x-auto max-h-[550px]">
            <pre className="leading-relaxed">{generatedSql}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: PRISMA SCHEMA EXPORT */}
      {activeTab === "prisma" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Generated Prisma ORM Schema (`schema.prisma`)
              </h3>
              <p className="text-xs text-slate-500">
                Directly paste into your Next.js or Node.js Prisma repository.
              </p>
            </div>
            <button
              onClick={() => copyCode(generatedPrisma, "Prisma Schema")}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              {copiedCode ? "Copied Prisma!" : "Copy Prisma Schema"}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs text-emerald-300 shadow-xl overflow-x-auto max-h-[550px]">
            <pre className="leading-relaxed">{generatedPrisma}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
