import crypto from "crypto";

// In-Memory Append-Only Event Store
let eventStore = [];
let snapshots = {};

// Helper: Compute cryptographic sequence hash
function computeEventHash(prevHash, sequence, eventType, payload) {
  const content = `${prevHash || "0".repeat(64)}:${sequence}:${eventType}:${JSON.stringify(payload)}`;
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Seed default high-fidelity domain event stream
function seedDefaultEvents() {
  eventStore = [];
  snapshots = {};

  const defaultStream = [
    {
      aggregateId: "AGG-STUDENT-8842",
      aggregateType: "CandidateCareerProfile",
      eventType: "ProfileCreated",
      payload: {
        studentId: "STU-8842",
        name: "Abhiraj Yadav",
        careerTrack: "Full-Stack Distributed Systems Architect",
        targetLevel: "L5 / Senior Staff",
        registeredAt: "2026-01-10T08:30:00.000Z"
      }
    },
    {
      aggregateId: "AGG-STUDENT-8842",
      aggregateType: "CandidateCareerProfile",
      eventType: "SkillMasteryAchieved",
      payload: {
        skill: "Distributed Sagas & 2PC Compensation",
        proficiencyScore: 98,
        evaluator: "SkillTrack SRE Arena",
        verifiedAt: "2026-02-14T14:15:00.000Z"
      }
    },
    {
      aggregateId: "AGG-STUDENT-8842",
      aggregateType: "CandidateCareerProfile",
      eventType: "CredentialIssued",
      payload: {
        certificateId: "ST-2026-DIST-8842",
        courseTitle: "Full-Stack Distributed Systems & Cloud Architecture",
        grade: "Distinction (98%)",
        merkleLeafHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        issuedAt: "2026-03-15T10:00:00.000Z"
      }
    },
    {
      aggregateId: "AGG-STUDENT-8842",
      aggregateType: "CandidateCareerProfile",
      eventType: "CompensationOfferReceived",
      payload: {
        company: "Stripe Infrastructure",
        role: "Staff Distributed Systems Engineer",
        totalCompensationUSD: 385000,
        baseSalary: 215000,
        rsuEquityGrant: 140000,
        signingBonus: 30000,
        receivedAt: "2026-04-02T16:45:00.000Z"
      }
    },
    {
      aggregateId: "AGG-STUDENT-8842",
      aggregateType: "CandidateCareerProfile",
      eventType: "SecurityTokenRotated",
      payload: {
        keyFingerprint: "SHA256:4b227777d4dd1fc61c6f884f",
        actor: "Admin (Automated KMS)",
        reason: "Scheduled 90-day cryptographic key rotation",
        rotatedAt: "2026-04-10T09:00:00.000Z"
      }
    }
  ];

  let prevHash = "0".repeat(64);
  defaultStream.forEach((e, idx) => {
    const sequence = idx + 1;
    const hash = computeEventHash(prevHash, sequence, e.eventType, e.payload);
    eventStore.push({
      id: `EVT-${Date.now()}-${sequence}`,
      aggregateId: e.aggregateId,
      aggregateType: e.aggregateType,
      sequence,
      eventType: e.eventType,
      payload: e.payload,
      previousHash: prevHash,
      hash,
      timestamp: e.payload.registeredAt || e.payload.verifiedAt || e.payload.issuedAt || e.payload.receivedAt || e.payload.rotatedAt || new Date().toISOString()
    });
    prevHash = hash;
  });
}

// Initialize seed
seedDefaultEvents();

// Project event stream into materialized view
function projectAggregate(events) {
  const state = {
    aggregateId: null,
    aggregateType: null,
    version: 0,
    studentName: null,
    careerTrack: null,
    skills: [],
    certificates: [],
    offers: [],
    securityAuditLog: [],
    lastUpdated: null
  };

  for (const evt of events) {
    state.aggregateId = evt.aggregateId;
    state.aggregateType = evt.aggregateType;
    state.version = evt.sequence;
    state.lastUpdated = evt.timestamp;

    switch (evt.eventType) {
      case "ProfileCreated":
        state.studentName = evt.payload.name;
        state.careerTrack = evt.payload.careerTrack;
        break;
      case "SkillMasteryAchieved":
        state.skills.push({
          skill: evt.payload.skill,
          score: evt.payload.proficiencyScore,
          verifiedAt: evt.payload.verifiedAt
        });
        break;
      case "CredentialIssued":
        state.certificates.push({
          id: evt.payload.certificateId,
          course: evt.payload.courseTitle,
          grade: evt.payload.grade,
          hash: evt.payload.merkleLeafHash
        });
        break;
      case "CompensationOfferReceived":
        state.offers.push({
          company: evt.payload.company,
          role: evt.payload.role,
          tc: evt.payload.totalCompensationUSD,
          receivedAt: evt.payload.receivedAt
        });
        break;
      case "SecurityTokenRotated":
        state.securityAuditLog.push({
          fingerprint: evt.payload.keyFingerprint,
          reason: evt.payload.reason,
          rotatedAt: evt.payload.rotatedAt
        });
        break;
      default:
        break;
    }
  }

  return state;
}

// GET /api/events/stream/:aggregateId
export const getEventStream = async (req, res) => {
  const { aggregateId } = req.params;
  const stream = aggregateId
    ? eventStore.filter((e) => e.aggregateId === aggregateId)
    : eventStore;

  const currentSnapshot = snapshots[aggregateId] || null;
  const materializedState = projectAggregate(stream);

  return res.status(200).json({
    success: true,
    aggregateId: aggregateId || "ALL_AGGREGATES",
    totalEvents: stream.length,
    latestSequence: stream.length > 0 ? stream[stream.length - 1].sequence : 0,
    headHash: stream.length > 0 ? stream[stream.length - 1].hash : "0".repeat(64),
    snapshot: currentSnapshot,
    materializedState,
    events: stream
  });
};

// POST /api/events/append
export const appendEvent = async (req, res) => {
  const { aggregateId, aggregateType, eventType, payload, expectedVersion } = req.body;

  if (!aggregateId || !eventType || !payload) {
    return res.status(400).json({
      success: false,
      message: "aggregateId, eventType, and payload are required"
    });
  }

  const existingStream = eventStore.filter((e) => e.aggregateId === aggregateId);
  const currentVersion = existingStream.length;

  // Optimistic concurrency check
  if (expectedVersion !== undefined && expectedVersion !== null && expectedVersion !== currentVersion) {
    return res.status(409).json({
      success: false,
      error: "OPTIMISTIC_CONCURRENCY_CONFLICT",
      message: `Concurrency conflict on aggregate '${aggregateId}'. Expected version ${expectedVersion}, but current version is ${currentVersion}.`,
      currentVersion
    });
  }

  const lastEvent = eventStore.length > 0 ? eventStore[eventStore.length - 1] : null;
  const prevHash = lastEvent ? lastEvent.hash : "0".repeat(64);
  const sequence = existingStream.length + 1;

  const newHash = computeEventHash(prevHash, sequence, eventType, payload);
  const newEvent = {
    id: `EVT-${Date.now()}-${sequence}`,
    aggregateId,
    aggregateType: aggregateType || "DomainAggregate",
    sequence,
    eventType,
    payload,
    previousHash: prevHash,
    hash: newHash,
    timestamp: new Date().toISOString()
  };

  eventStore.push(newEvent);

  // Re-project state
  const updatedStream = eventStore.filter((e) => e.aggregateId === aggregateId);
  const projectedState = projectAggregate(updatedStream);

  return res.status(201).json({
    success: true,
    message: `Event '${eventType}' appended successfully with sequence #${sequence}`,
    event: newEvent,
    projectedState
  });
};

// POST /api/events/replay (Time-Travel Debugging)
export const replayEvents = async (req, res) => {
  const { aggregateId, targetSequence } = req.body;

  const stream = aggregateId
    ? eventStore.filter((e) => e.aggregateId === aggregateId)
    : eventStore;

  const seqLimit = targetSequence !== undefined ? parseInt(targetSequence, 10) : stream.length;
  const slicedStream = stream.filter((e) => e.sequence <= seqLimit);

  // Check if a point-in-time snapshot exists before or at seqLimit
  let baseState = null;
  let eventsToFold = slicedStream;

  if (snapshots[aggregateId] && snapshots[aggregateId].snapshotSequence <= seqLimit) {
    baseState = snapshots[aggregateId].state;
    eventsToFold = slicedStream.filter((e) => e.sequence > snapshots[aggregateId].snapshotSequence);
  }

  const replayedState = projectAggregate(slicedStream);

  return res.status(200).json({
    success: true,
    replayedToSequence: seqLimit,
    eventsEvaluated: slicedStream.length,
    baseSnapshotUtilized: !!baseState,
    reconstructedState: replayedState,
    timeline: slicedStream.map((e) => ({
      sequence: e.sequence,
      eventType: e.eventType,
      timestamp: e.timestamp,
      hash: e.hash
    }))
  });
};

// POST /api/events/snapshot
export const createSnapshot = async (req, res) => {
  const { aggregateId } = req.body;
  const stream = eventStore.filter((e) => e.aggregateId === aggregateId);

  if (stream.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No events found for aggregate '${aggregateId}'`
    });
  }

  const currentState = projectAggregate(stream);
  const snapshotSequence = stream[stream.length - 1].sequence;

  snapshots[aggregateId] = {
    aggregateId,
    snapshotSequence,
    state: currentState,
    createdAt: new Date().toISOString(),
    eventCountCompacted: stream.length
  };

  return res.status(200).json({
    success: true,
    message: `Snapshot compacted at sequence #${snapshotSequence} for aggregate '${aggregateId}'`,
    snapshot: snapshots[aggregateId]
  });
};

// GET /api/events/projections
export const getProjections = async (_req, res) => {
  const aggregates = [...new Set(eventStore.map((e) => e.aggregateId))];
  const projections = aggregates.map((aggId) => {
    const stream = eventStore.filter((e) => e.aggregateId === aggId);
    return projectAggregate(stream);
  });

  return res.status(200).json({
    success: true,
    totalAggregates: aggregates.length,
    projections
  });
};

// POST /api/events/reset
export const resetLedger = async (_req, res) => {
  seedDefaultEvents();
  return res.status(200).json({
    success: true,
    message: "Event Store reset to baseline seed with 5 cryptographic domain events",
    totalEvents: eventStore.length
  });
};
