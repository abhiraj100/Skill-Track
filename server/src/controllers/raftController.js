// server/src/controllers/raftController.js
// Raft Consensus & Distributed Leader Election Simulation Engine
// Conforming to the Ongaro & Ousterhout Stanford Raft Protocol

let currentTerm = 1;
let leaderId = "node-1";
let clusterState = {
  term: 1,
  quorumSize: 3, // floor(5 / 2) + 1
  partitionActive: false,
  partitions: null, // e.g. { minority: ['node-1', 'node-2'], majority: ['node-3', 'node-4', 'node-5'] }
  nodes: [
    {
      id: "node-1",
      role: "LEADER",
      term: 1,
      votedFor: "node-1",
      votesReceived: 3,
      status: "HEALTHY",
      heartbeatTimerMs: 50,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2,
      lastApplied: 2
    },
    {
      id: "node-2",
      role: "FOLLOWER",
      term: 1,
      votedFor: "node-1",
      votesReceived: 0,
      status: "HEALTHY",
      heartbeatTimerMs: 180,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2,
      lastApplied: 2
    },
    {
      id: "node-3",
      role: "FOLLOWER",
      term: 1,
      votedFor: "node-1",
      votesReceived: 0,
      status: "HEALTHY",
      heartbeatTimerMs: 220,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2,
      lastApplied: 2
    },
    {
      id: "node-4",
      role: "FOLLOWER",
      term: 1,
      votedFor: "node-1",
      votesReceived: 0,
      status: "HEALTHY",
      heartbeatTimerMs: 195,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2,
      lastApplied: 2
    },
    {
      id: "node-5",
      role: "FOLLOWER",
      term: 1,
      votedFor: "node-1",
      votesReceived: 0,
      status: "HEALTHY",
      heartbeatTimerMs: 240,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2,
      lastApplied: 2
    }
  ],
  auditEvents: [
    {
      timestamp: new Date().toISOString(),
      type: "CLUSTER_INITIALIZED",
      details: "5-node Raft consensus cluster initialized with Quorum=3, Term=1, Leader=node-1"
    }
  ]
};

// GET /api/raft/state
export const getRaftState = (req, res) => {
  res.json({
    success: true,
    data: {
      ...clusterState,
      leaderId,
      healthyNodeCount: clusterState.nodes.filter(n => n.status === "HEALTHY").length
    }
  });
};

// POST /api/raft/replicate (propose state machine command)
export const replicateCommand = (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ success: false, message: "Command is required" });
  }

  const leader = clusterState.nodes.find(n => n.id === leaderId && n.status === "HEALTHY");
  if (!leader || leader.role !== "LEADER") {
    return res.status(503).json({
      success: false,
      message: "No active leader available to accept writes",
      leaderId: null
    });
  }

  // Check if leader is in minority partition
  if (clusterState.partitionActive && clusterState.partitions) {
    const isMinority = clusterState.partitions.minority.includes(leader.id);
    if (isMinority) {
      // Cannot achieve quorum!
      const uncommittedIndex = leader.log.length + 1;
      const uncommittedEntry = {
        index: uncommittedIndex,
        term: leader.term,
        command,
        committed: false,
        quorumReached: false
      };
      leader.log.push(uncommittedEntry);

      clusterState.auditEvents.unshift({
        timestamp: new Date().toISOString(),
        type: "WRITE_QUORUM_REJECTED",
        details: `Leader ${leader.id} accepted uncommitted write '${command}' in minority partition, but failed to reach quorum (2/3). Command remains uncommitted!`
      });

      return res.status(409).json({
        success: false,
        message: "Quorum failure: Leader is in minority network partition (2/5 nodes). Write cannot be safely committed!",
        entry: uncommittedEntry,
        cluster: clusterState
      });
    }
  }

  // Quorum is healthy (at least 3 nodes)
  const newIndex = leader.log.length + 1;
  const newEntry = {
    index: newIndex,
    term: leader.term,
    command,
    committed: true,
    quorumReached: true
  };

  // Replicate to eligible nodes
  let acks = 0;
  clusterState.nodes.forEach(node => {
    const canReach = !clusterState.partitionActive || 
      (clusterState.partitions?.majority.includes(node.id) && clusterState.partitions?.majority.includes(leader.id));

    if (node.status === "HEALTHY" && canReach) {
      if (node.id !== leader.id) {
        node.log.push({ ...newEntry });
      } else {
        node.log.push(newEntry);
      }
      node.commitIndex = newIndex;
      node.lastApplied = newIndex;
      acks++;
    }
  });

  clusterState.auditEvents.unshift({
    timestamp: new Date().toISOString(),
    type: "COMMAND_COMMITTED",
    details: `Command '${command}' committed at Log Index ${newIndex} across ${acks}/5 nodes (Quorum satisfied).`
  });

  res.json({
    success: true,
    message: `Command committed across ${acks} nodes`,
    entry: newEntry,
    data: clusterState
  });
};

// POST /api/raft/crash-leader
export const crashLeader = (req, res) => {
  const currentLeader = clusterState.nodes.find(n => n.id === leaderId);
  if (!currentLeader) {
    return res.status(400).json({ success: false, message: "No leader to crash" });
  }

  currentLeader.status = "CRASHED";
  currentLeader.role = "FOLLOWER";
  const oldLeaderId = leaderId;
  leaderId = null;

  currentTerm += 1;
  const eligibleFollowers = clusterState.nodes.filter(n => n.status === "HEALTHY" && n.id !== oldLeaderId);
  if (eligibleFollowers.length < 3) {
    clusterState.auditEvents.unshift({
      timestamp: new Date().toISOString(),
      type: "ELECTION_SPLIT_BRAIN_AVERTED",
      details: `Leader ${oldLeaderId} crashed. Remaining healthy nodes (${eligibleFollowers.length}) < Quorum (3). Election suspended!`
    });
    return res.json({
      success: true,
      message: `Leader ${oldLeaderId} crashed. Cluster lost quorum (${eligibleFollowers.length}/5), cannot elect leader.`,
      data: clusterState
    });
  }

  const newLeader = eligibleFollowers[0];
  newLeader.role = "LEADER";
  newLeader.term = currentTerm;
  newLeader.votedFor = newLeader.id;
  newLeader.votesReceived = eligibleFollowers.length;
  leaderId = newLeader.id;

  eligibleFollowers.slice(1).forEach(f => {
    f.term = currentTerm;
    f.votedFor = newLeader.id;
    f.role = "FOLLOWER";
  });

  clusterState.term = currentTerm;
  clusterState.auditEvents.unshift({
    timestamp: new Date().toISOString(),
    type: "LEADER_ELECTED",
    details: `Leader ${oldLeaderId} crashed. Election timeout fired! Candidate ${newLeader.id} won majority votes (${newLeader.votesReceived}/5) for Term ${currentTerm}.`
  });

  res.json({
    success: true,
    message: `Leader ${oldLeaderId} crashed. ${newLeader.id} elected as new Leader for Term ${currentTerm}.`,
    data: clusterState
  });
};

// POST /api/raft/recover-node
export const recoverNode = (req, res) => {
  const { nodeId } = req.body;
  const node = clusterState.nodes.find(n => n.id === nodeId);
  if (!node) {
    return res.status(404).json({ success: false, message: "Node not found" });
  }

  node.status = "HEALTHY";
  node.role = "FOLLOWER";
  node.term = currentTerm;
  node.votedFor = leaderId;

  const activeLeader = clusterState.nodes.find(n => n.id === leaderId && n.status === "HEALTHY");
  if (activeLeader) {
    node.log = activeLeader.log.map(item => ({ ...item }));
    node.commitIndex = activeLeader.commitIndex;
    node.lastApplied = activeLeader.lastApplied;
  }

  clusterState.auditEvents.unshift({
    timestamp: new Date().toISOString(),
    type: "NODE_RECOVERED",
    details: `Node ${nodeId} recovered and caught up with Leader log up to Index ${node.commitIndex}.`
  });

  res.json({
    success: true,
    message: `Node ${nodeId} recovered successfully`,
    data: clusterState
  });
};

// POST /api/raft/partition (simulate split-brain network partition)
export const simulatePartition = (req, res) => {
  clusterState.partitionActive = true;
  clusterState.partitions = {
    minority: ["node-1", "node-2"],
    majority: ["node-3", "node-4", "node-5"]
  };

  const majorityLeader = clusterState.nodes.find(n => n.id === "node-3");
  if (majorityLeader && majorityLeader.status === "HEALTHY") {
    currentTerm += 1;
    majorityLeader.role = "LEADER";
    majorityLeader.term = currentTerm;
    majorityLeader.votesReceived = 3;
    majorityLeader.votedFor = "node-3";

    const node4 = clusterState.nodes.find(n => n.id === "node-4");
    const node5 = clusterState.nodes.find(n => n.id === "node-5");
    if (node4) { node4.term = currentTerm; node4.votedFor = "node-3"; }
    if (node5) { node5.term = currentTerm; node5.votedFor = "node-3"; }

    leaderId = "node-3";
    clusterState.term = currentTerm;
  }

  clusterState.auditEvents.unshift({
    timestamp: new Date().toISOString(),
    type: "NETWORK_PARTITION_CREATED",
    details: "Network partitioned into [node-1, node-2] (Minority, 2/5) and [node-3, node-4, node-5] (Majority, 3/5). Majority elected node-3 as authoritative Leader!"
  });

  res.json({
    success: true,
    message: "Network partition active. Majority partition holds quorum with Leader node-3.",
    data: clusterState
  });
};

// POST /api/raft/heal-partition
export const healPartition = (req, res) => {
  clusterState.partitionActive = false;
  clusterState.partitions = null;

  const authoritativeLeader = clusterState.nodes.find(n => n.id === "node-3");
  if (authoritativeLeader) {
    leaderId = authoritativeLeader.id;
    currentTerm = authoritativeLeader.term;

    clusterState.nodes.forEach(n => {
      n.status = "HEALTHY";
      if (n.id !== leaderId) {
        n.role = "FOLLOWER";
        n.term = currentTerm;
        n.votedFor = leaderId;
        n.log = authoritativeLeader.log.map(entry => ({ ...entry }));
        n.commitIndex = authoritativeLeader.commitIndex;
        n.lastApplied = authoritativeLeader.lastApplied;
      }
    });
  }

  clusterState.auditEvents.unshift({
    timestamp: new Date().toISOString(),
    type: "NETWORK_PARTITION_HEALED",
    details: `Network partition healed! All 5 nodes synchronized with authoritative Leader ${leaderId} (Term ${currentTerm}). Uncommitted split logs overwritten.`
  });

  res.json({
    success: true,
    message: "Network partition healed. Single authoritative leader established across all 5 nodes.",
    data: clusterState
  });
};

// POST /api/raft/reset
export const resetCluster = (req, res) => {
  currentTerm = 1;
  leaderId = "node-1";
  clusterState.term = 1;
  clusterState.partitionActive = false;
  clusterState.partitions = null;
  clusterState.nodes = [
    {
      id: "node-1", role: "LEADER", term: 1, votedFor: "node-1", votesReceived: 3, status: "HEALTHY", heartbeatTimerMs: 50,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2, lastApplied: 2
    },
    {
      id: "node-2", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 180,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2, lastApplied: 2
    },
    {
      id: "node-3", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 220,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2, lastApplied: 2
    },
    {
      id: "node-4", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 195,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2, lastApplied: 2
    },
    {
      id: "node-5", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 240,
      log: [
        { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
        { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
      ],
      commitIndex: 2, lastApplied: 2
    }
  ];
  clusterState.auditEvents = [
    {
      timestamp: new Date().toISOString(),
      type: "CLUSTER_RESET",
      details: "Raft consensus cluster reset to baseline initial state."
    }
  ];

  res.json({
    success: true,
    message: "Raft cluster reset to baseline",
    data: clusterState
  });
};
