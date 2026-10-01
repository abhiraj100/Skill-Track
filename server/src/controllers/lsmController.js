// server/src/controllers/lsmController.js
// Log-Structured Merge (LSM) Tree & Storage Engine Engine
// Conforming to RocksDB, Cassandra, LevelDB & ClickHouse storage architectures

import crypto from "crypto";

// 16-bit simple bloom filter implementation
function computeBloomBits(key, size = 16) {
  const h1 = Math.abs(parseInt(crypto.createHash("md5").update(key).digest("hex").slice(0, 4), 16)) % size;
  const h2 = Math.abs(parseInt(crypto.createHash("sha1").update(key).digest("hex").slice(0, 4), 16)) % size;
  const h3 = Math.abs(parseInt(crypto.createHash("sha256").update(key).digest("hex").slice(0, 4), 16)) % size;
  return [h1, h2, h3];
}

function buildBloomFilter(entries, size = 16) {
  const bits = new Array(size).fill(0);
  entries.forEach(e => {
    const bitIndices = computeBloomBits(e.key, size);
    bitIndices.forEach(idx => { bits[idx] = 1; });
  });
  return bits;
}

function checkBloomFilter(key, bits, size = 16) {
  const indices = computeBloomBits(key, size);
  return indices.every(idx => bits[idx] === 1);
}

function buildSparseIndex(entries, step = 2) {
  const index = [];
  for (let i = 0; i < entries.length; i += step) {
    index.push({ key: entries[i].key, offset: i });
  }
  return index;
}

let sstCounter = 3;

let lsmState = {
  stats: {
    totalWrites: 12,
    totalReads: 28,
    bloomFilterFalsePositives: 0,
    bloomFilterZeroIoSkips: 42,
    diskBytesWrittenKb: 64.2
  },
  wal: [
    { seq: 101, op: "PUT", key: "user:101", value: '{"name":"Alice","tier":"Pro"}', ts: "2026-09-30T16:00:00Z" },
    { seq: 102, op: "PUT", key: "user:102", value: '{"name":"Bob","tier":"Enterprise"}', ts: "2026-09-30T16:02:00Z" },
    { seq: 103, op: "PUT", key: "metrics:qps", value: "84200", ts: "2026-09-30T16:05:00Z" }
  ],
  memtable: [
    { key: "metrics:qps", value: "84200", version: 3, tombstone: false },
    { key: "user:101", value: '{"name":"Alice","tier":"Pro"}', version: 1, tombstone: false },
    { key: "user:102", value: '{"name":"Bob","tier":"Enterprise"}', version: 2, tombstone: false }
  ],
  memtableThreshold: 4,
  levels: {
    L0: [
      {
        id: "sst_001",
        level: 0,
        createdAt: "2026-09-30T15:40:00Z",
        entries: [
          { key: "auth:token:jwt_88", value: "valid_signature", version: 1, tombstone: false },
          { key: "config:rate_limit", value: "10000", version: 1, tombstone: false },
          { key: "user:099", value: '{"name":"Zack","tier":"Free"}', version: 1, tombstone: false }
        ],
        bloomFilter: buildBloomFilter([
          { key: "auth:token:jwt_88" },
          { key: "config:rate_limit" },
          { key: "user:099" }
        ]),
        sparseIndex: [
          { key: "auth:token:jwt_88", offset: 0 },
          { key: "user:099", offset: 2 }
        ]
      },
      {
        id: "sst_002",
        level: 0,
        createdAt: "2026-09-30T15:50:00Z",
        entries: [
          { key: "billing:invoice:901", value: "$450.00", version: 1, tombstone: false },
          { key: "user:050", value: '{"name":"Chloe","tier":"Pro"}', version: 1, tombstone: false },
          { key: "user:088", value: "__TOMBSTONE__", version: 2, tombstone: true }
        ],
        bloomFilter: buildBloomFilter([
          { key: "billing:invoice:901" },
          { key: "user:050" },
          { key: "user:088" }
        ]),
        sparseIndex: [
          { key: "billing:invoice:901", offset: 0 },
          { key: "user:088", offset: 2 }
        ]
      }
    ],
    L1: [
      {
        id: "sst_base_01",
        level: 1,
        createdAt: "2026-09-30T14:30:00Z",
        entries: [
          { key: "app:theme", value: "dark", version: 1, tombstone: false },
          { key: "billing:plan:pro", value: "$29/mo", version: 1, tombstone: false },
          { key: "cluster:region", value: "us-east-1", version: 1, tombstone: false },
          { key: "feature:ai_copilot", value: "enabled", version: 1, tombstone: false }
        ],
        bloomFilter: buildBloomFilter([
          { key: "app:theme" },
          { key: "billing:plan:pro" },
          { key: "cluster:region" },
          { key: "feature:ai_copilot" }
        ]),
        sparseIndex: [
          { key: "app:theme", offset: 0 },
          { key: "cluster:region", offset: 2 }
        ]
      }
    ]
  },
  auditTrail: [
    {
      timestamp: new Date().toISOString(),
      action: "STORAGE_ENGINE_INITIALIZED",
      details: "LSM Tree Engine active: MemTable (Red-Black Sorted), WAL durability enabled, Leveled Compaction L0->L1."
    }
  ]
};

// GET /api/lsm/state
export const getLsmState = (req, res) => {
  res.json({
    success: true,
    data: lsmState
  });
};

function flushMemtableToSSTable() {
  if (lsmState.memtable.length === 0) return null;

  sstCounter += 1;
  const sstId = `sst_00${sstCounter}`;
  const entries = lsmState.memtable.map(e => ({ ...e }));
  const bloomFilter = buildBloomFilter(entries);
  const sparseIndex = buildSparseIndex(entries);

  const newSSTable = {
    id: sstId,
    level: 0,
    createdAt: new Date().toISOString(),
    entries,
    bloomFilter,
    sparseIndex
  };

  lsmState.levels.L0.unshift(newSSTable);
  lsmState.memtable = []; // Clear Memtable
  lsmState.wal = []; // WAL checkpointed and truncated

  lsmState.auditTrail.unshift({
    timestamp: new Date().toISOString(),
    action: "MEMTABLE_FLUSHED",
    details: `Flushed ${entries.length} keys to ${sstId} in Level 0. WAL truncated. Bloom filter generated.`
  });

  return newSSTable;
}

// POST /api/lsm/put
export const putKey = (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ success: false, message: "Key and Value are required" });
  }

  // 1. Write to WAL
  const seq = lsmState.wal.length + 101;
  lsmState.wal.push({
    seq,
    op: "PUT",
    key,
    value: typeof value === "object" ? JSON.stringify(value) : String(value),
    ts: new Date().toISOString()
  });

  // 2. Insert or update in Memtable (keep sorted by key)
  const existingIdx = lsmState.memtable.findIndex(e => e.key === key);
  const version = existingIdx >= 0 ? lsmState.memtable[existingIdx].version + 1 : 1;
  const newEntry = {
    key,
    value: typeof value === "object" ? JSON.stringify(value) : String(value),
    version,
    tombstone: false
  };

  if (existingIdx >= 0) {
    lsmState.memtable[existingIdx] = newEntry;
  } else {
    lsmState.memtable.push(newEntry);
  }
  lsmState.memtable.sort((a, b) => a.key.localeCompare(b.key));

  lsmState.stats.totalWrites += 1;
  lsmState.stats.diskBytesWrittenKb += 0.8;

  let flushed = false;
  // 3. Check if Memtable threshold reached
  if (lsmState.memtable.length >= lsmState.memtableThreshold) {
    flushMemtableToSSTable();
    flushed = true;
  }

  res.json({
    success: true,
    message: flushed 
      ? `Key '${key}' written to MemTable and flushed to L0 SSTable (Threshold ${lsmState.memtableThreshold} reached)`
      : `Key '${key}' written to WAL and MemTable`,
    flushed,
    data: lsmState
  });
};

// POST /api/lsm/delete
export const deleteKey = (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, message: "Key is required" });
  }

  // 1. Write Tombstone to WAL
  const seq = lsmState.wal.length + 101;
  lsmState.wal.push({
    seq,
    op: "DELETE",
    key,
    value: "__TOMBSTONE__",
    ts: new Date().toISOString()
  });

  // 2. Insert Tombstone in MemTable
  const existingIdx = lsmState.memtable.findIndex(e => e.key === key);
  const version = existingIdx >= 0 ? lsmState.memtable[existingIdx].version + 1 : 1;
  const tombstoneEntry = {
    key,
    value: "__TOMBSTONE__",
    version,
    tombstone: true
  };

  if (existingIdx >= 0) {
    lsmState.memtable[existingIdx] = tombstoneEntry;
  } else {
    lsmState.memtable.push(tombstoneEntry);
  }
  lsmState.memtable.sort((a, b) => a.key.localeCompare(b.key));

  lsmState.stats.totalWrites += 1;

  let flushed = false;
  if (lsmState.memtable.length >= lsmState.memtableThreshold) {
    flushMemtableToSSTable();
    flushed = true;
  }

  res.json({
    success: true,
    message: `Tombstone delete marker written for '${key}'`,
    flushed,
    data: lsmState
  });
};

// POST /api/lsm/flush
export const manualFlush = (req, res) => {
  if (lsmState.memtable.length === 0) {
    return res.status(400).json({ success: false, message: "MemTable is already empty" });
  }

  const sst = flushMemtableToSSTable();
  res.json({
    success: true,
    message: `MemTable manually flushed to Level 0 file ${sst.id}`,
    data: lsmState
  });
};

// POST /api/lsm/compact (Leveled Compaction L0 -> L1)
export const compactLeveled = (req, res) => {
  if (lsmState.levels.L0.length === 0) {
    return res.status(400).json({ success: false, message: "No SSTables in Level 0 to compact" });
  }

  const keyMap = new Map();

  lsmState.levels.L1.forEach(sst => {
    sst.entries.forEach(e => {
      keyMap.set(e.key, { ...e, sstSource: sst.id });
    });
  });

  const l0Reversed = [...lsmState.levels.L0].reverse();
  l0Reversed.forEach(sst => {
    sst.entries.forEach(e => {
      keyMap.set(e.key, { ...e, sstSource: sst.id });
    });
  });

  const mergedEntries = [];
  let purgedTombstones = 0;
  for (const [key, entry] of keyMap.entries()) {
    if (entry.tombstone || entry.value === "__TOMBSTONE__") {
      purgedTombstones++;
    } else {
      mergedEntries.push({
        key: entry.key,
        value: entry.value,
        version: entry.version,
        tombstone: false
      });
    }
  }

  mergedEntries.sort((a, b) => a.key.localeCompare(b.key));

  const l1SstId = `sst_l1_merged_${Date.now().toString().slice(-4)}`;
  const compactedL1 = {
    id: l1SstId,
    level: 1,
    createdAt: new Date().toISOString(),
    entries: mergedEntries,
    bloomFilter: buildBloomFilter(mergedEntries),
    sparseIndex: buildSparseIndex(mergedEntries)
  };

  const oldL0Count = lsmState.levels.L0.length;
  lsmState.levels.L0 = [];
  lsmState.levels.L1 = [compactedL1];

  lsmState.auditTrail.unshift({
    timestamp: new Date().toISOString(),
    action: "LEVELED_COMPACTION_COMPLETED",
    details: `Merged ${oldL0Count} L0 SSTables into ${l1SstId} (Level 1). Purged ${purgedTombstones} dead tombstone keys. Consolidated ${mergedEntries.length} unique active keys.`
  });

  res.json({
    success: true,
    message: `Leveled Compaction completed: ${oldL0Count} L0 files merged into L1. Purged ${purgedTombstones} tombstones.`,
    data: lsmState
  });
};

// POST /api/lsm/query
export const queryKey = (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, message: "Key to query is required" });
  }

  lsmState.stats.totalReads += 1;
  const trace = [];

  // Step 1: Check MemTable
  trace.push({
    target: "MemTable (RAM)",
    status: "PROBING",
    type: "MEMORY"
  });

  const memEntry = lsmState.memtable.find(e => e.key === key);
  if (memEntry) {
    if (memEntry.tombstone || memEntry.value === "__TOMBSTONE__") {
      trace.push({
        target: "MemTable (RAM)",
        status: "HIT_TOMBSTONE",
        details: `Key '${key}' found in MemTable with Tombstone marker. Key was recently deleted!`,
        result: null
      });
      return res.json({
        success: true,
        found: false,
        isDeleted: true,
        source: "MemTable",
        trace
      });
    }

    trace.push({
      target: "MemTable (RAM)",
      status: "HIT_ACTIVE",
      details: `Key '${key}' resolved in MemTable with zero disk I/O.`,
      result: memEntry.value
    });
    return res.json({
      success: true,
      found: true,
      value: memEntry.value,
      source: "MemTable (RAM)",
      trace
    });
  }

  trace.push({
    target: "MemTable (RAM)",
    status: "MISS",
    details: `Key '${key}' not in RAM. Proceeding to disk SSTables.`
  });

  // Step 2: Check Level 0 SSTables
  for (const sst of lsmState.levels.L0) {
    const bloomHit = checkBloomFilter(key, sst.bloomFilter);
    if (!bloomHit) {
      lsmState.stats.bloomFilterZeroIoSkips += 1;
      trace.push({
        target: `Level 0 -> ${sst.id}`,
        status: "BLOOM_FILTER_NEGATIVE",
        details: `Bloom Filter returned 0 (definitely not present). Skipped disk block read completely!`
      });
      continue;
    }

    trace.push({
      target: `Level 0 -> ${sst.id}`,
      status: "BLOOM_FILTER_POSITIVE",
      details: `Bloom Filter returned 1 (possibly present). Probing Sparse Index and reading data block.`
    });

    const entry = sst.entries.find(e => e.key === key);
    if (entry) {
      if (entry.tombstone || entry.value === "__TOMBSTONE__") {
        trace.push({
          target: `Level 0 -> ${sst.id}`,
          status: "HIT_TOMBSTONE",
          details: `Found Tombstone marker in ${sst.id}. Key has been deleted.`
        });
        return res.json({
          success: true,
          found: false,
          isDeleted: true,
          source: sst.id,
          trace
        });
      }

      trace.push({
        target: `Level 0 -> ${sst.id}`,
        status: "HIT_ACTIVE",
        details: `Key resolved from ${sst.id} after sparse index lookup.`
      });
      return res.json({
        success: true,
        found: true,
        value: entry.value,
        source: sst.id,
        trace
      });
    } else {
      lsmState.stats.bloomFilterFalsePositives += 1;
      trace.push({
        target: `Level 0 -> ${sst.id}`,
        status: "BLOOM_FILTER_FALSE_POSITIVE",
        details: `Bloom filter hash collision. Data block read from disk, but key not present.`
      });
    }
  }

  // Step 3: Check Level 1 SSTables
  for (const sst of lsmState.levels.L1) {
    const bloomHit = checkBloomFilter(key, sst.bloomFilter);
    if (!bloomHit) {
      lsmState.stats.bloomFilterZeroIoSkips += 1;
      trace.push({
        target: `Level 1 -> ${sst.id}`,
        status: "BLOOM_FILTER_NEGATIVE",
        details: `Bloom Filter returned 0. Skipped disk read completely!`
      });
      continue;
    }

    trace.push({
      target: `Level 1 -> ${sst.id}`,
      status: "BLOOM_FILTER_POSITIVE",
      details: `Bloom Filter returned 1. Probing Level 1 Sparse Index.`
    });

    const entry = sst.entries.find(e => e.key === key);
    if (entry) {
      if (entry.tombstone || entry.value === "__TOMBSTONE__") {
        trace.push({
          target: `Level 1 -> ${sst.id}`,
          status: "HIT_TOMBSTONE",
          details: `Found Tombstone marker in ${sst.id}.`
        });
        return res.json({
          success: true,
          found: false,
          isDeleted: true,
          source: sst.id,
          trace
        });
      }

      trace.push({
        target: `Level 1 -> ${sst.id}`,
        status: "HIT_ACTIVE",
        details: `Key resolved from Level 1 consolidated SSTable ${sst.id}.`
      });
      return res.json({
        success: true,
        found: true,
        value: entry.value,
        source: sst.id,
        trace
      });
    }
  }

  trace.push({
    target: "All Levels Exhausted",
    status: "KEY_NOT_FOUND",
    details: `Key '${key}' does not exist in any storage hierarchy.`
  });

  res.json({
    success: true,
    found: false,
    value: null,
    source: null,
    trace
  });
};

// POST /api/lsm/reset
export const resetLsm = (req, res) => {
  sstCounter = 3;
  lsmState.memtable = [
    { key: "metrics:qps", value: "84200", version: 3, tombstone: false },
    { key: "user:101", value: '{"name":"Alice","tier":"Pro"}', version: 1, tombstone: false },
    { key: "user:102", value: '{"name":"Bob","tier":"Enterprise"}', version: 2, tombstone: false }
  ];
  lsmState.wal = [
    { seq: 101, op: "PUT", key: "user:101", value: '{"name":"Alice","tier":"Pro"}', ts: "2026-09-30T16:00:00Z" },
    { seq: 102, op: "PUT", key: "user:102", value: '{"name":"Bob","tier":"Enterprise"}', ts: "2026-09-30T16:02:00Z" },
    { seq: 103, op: "PUT", key: "metrics:qps", value: "84200", ts: "2026-09-30T16:05:00Z" }
  ];
  lsmState.levels.L0 = [
    {
      id: "sst_001",
      level: 0,
      createdAt: "2026-09-30T15:40:00Z",
      entries: [
        { key: "auth:token:jwt_88", value: "valid_signature", version: 1, tombstone: false },
        { key: "config:rate_limit", value: "10000", version: 1, tombstone: false },
        { key: "user:099", value: '{"name":"Zack","tier":"Free"}', version: 1, tombstone: false }
      ],
      bloomFilter: buildBloomFilter([
        { key: "auth:token:jwt_88" },
        { key: "config:rate_limit" },
        { key: "user:099" }
      ]),
      sparseIndex: [
        { key: "auth:token:jwt_88", offset: 0 },
        { key: "user:099", offset: 2 }
      ]
    },
    {
      id: "sst_002",
      level: 0,
      createdAt: "2026-09-30T15:50:00Z",
      entries: [
        { key: "billing:invoice:901", value: "$450.00", version: 1, tombstone: false },
        { key: "user:050", value: '{"name":"Chloe","tier":"Pro"}', version: 1, tombstone: false },
        { key: "user:088", value: "__TOMBSTONE__", version: 2, tombstone: true }
      ],
      bloomFilter: buildBloomFilter([
        { key: "billing:invoice:901" },
        { key: "user:050" },
        { key: "user:088" }
      ]),
      sparseIndex: [
        { key: "billing:invoice:901", offset: 0 },
        { key: "user:088", offset: 2 }
      ]
    }
  ];
  lsmState.levels.L1 = [
    {
      id: "sst_base_01",
      level: 1,
      createdAt: "2026-09-30T14:30:00Z",
      entries: [
        { key: "app:theme", value: "dark", version: 1, tombstone: false },
        { key: "billing:plan:pro", value: "$29/mo", version: 1, tombstone: false },
        { key: "cluster:region", value: "us-east-1", version: 1, tombstone: false },
        { key: "feature:ai_copilot", value: "enabled", version: 1, tombstone: false }
      ],
      bloomFilter: buildBloomFilter([
        { key: "app:theme" },
        { key: "billing:plan:pro" },
        { key: "cluster:region" },
        { key: "feature:ai_copilot" }
      ]),
      sparseIndex: [
        { key: "app:theme", offset: 0 },
        { key: "cluster:region", offset: 2 }
      ]
    }
  ];
  lsmState.auditTrail = [
    {
      timestamp: new Date().toISOString(),
      action: "STORAGE_RESET",
      details: "LSM Tree storage engine reset to baseline initial state."
    }
  ];

  res.json({
    success: true,
    message: "LSM Tree storage engine reset to baseline",
    data: lsmState
  });
};
