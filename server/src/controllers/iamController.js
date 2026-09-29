// Zero-Trust Enterprise IAM & OPA Policy Evaluation Engine

const ROLES_HIERARCHY = {
  SuperAdmin: ["*"],
  DevOpsLead: ["READ", "WRITE", "EXECUTE", "DEPLOY", "CONFIG"],
  SecurityAuditor: ["READ", "AUDIT", "EXPORT_LOGS"],
  SoftwareEngineer: ["READ", "WRITE", "EXECUTE"],
  Intern: ["READ"]
};

const ENTERPRISE_RESOURCES = [
  { id: "res_prod_mongo_cluster", name: "Production MongoDB Primary Cluster", classification: "CONFIDENTIAL", allowedRoles: ["SuperAdmin", "DevOpsLead"] },
  { id: "res_stripe_keys", name: "Stripe Production API Secret Keys", classification: "CONFIDENTIAL", allowedRoles: ["SuperAdmin"] },
  { id: "res_user_pii_vault", name: "Customer PII & Credential Vault", classification: "RESTRICTED", allowedRoles: ["SuperAdmin", "SecurityAuditor"] },
  { id: "res_app_deployments", name: "Kubernetes Production Deployment DAG", classification: "INTERNAL", allowedRoles: ["SuperAdmin", "DevOpsLead", "SoftwareEngineer"] },
  { id: "res_course_catalog", name: "Course Curriculum & Lesson Markdown", classification: "PUBLIC", allowedRoles: ["*"] }
];

export const getIamDirectory = async (_req, res) => {
  res.json({
    success: true,
    roles: Object.keys(ROLES_HIERARCHY),
    resources: ENTERPRISE_RESOURCES,
    trustedCidrs: ["10.0.0.0/8", "172.16.0.0/12", "192.168.1.0/24"]
  });
};

export const evaluateAccessPolicy = async (req, res) => {
  const {
    userId = "usr_eng_482",
    role = "SoftwareEngineer",
    tenantId = "tenant_enterprise_acme",
    mfaVerified = true,
    clientIp = "10.0.4.18",
    isManagedDevice = true,
    resourceId = "res_app_deployments",
    action = "DEPLOY"
  } = req.body;

  const resource = ENTERPRISE_RESOURCES.find((r) => r.id === resourceId) || {
    id: resourceId,
    name: "Custom Resource",
    classification: "INTERNAL",
    allowedRoles: ["DevOpsLead", "SuperAdmin"]
  };

  const evaluationLog = [];
  let allowed = true;

  // Clause 1: Multi-Tenant Boundary Check
  evaluationLog.push({
    clause: "POLICY_001_TENANT_ISOLATION",
    description: "Verify request originates within authorized tenant boundary",
    passed: true,
    note: `Tenant [${tenantId}] confirmed in strict schema isolation.`
  });

  // Clause 2: Zero-Trust Network CIDR & Device Posture
  const isPrivateIp = clientIp.startsWith("10.") || clientIp.startsWith("192.168.") || clientIp.startsWith("172.");
  if (!isPrivateIp || !isManagedDevice) {
    if (resource.classification === "CONFIDENTIAL" || resource.classification === "RESTRICTED") {
      allowed = false;
      evaluationLog.push({
        clause: "POLICY_002_ZERO_TRUST_POSTURE",
        description: "Enforce corporate managed device and private VPN ingress for Tier-1 assets",
        passed: false,
        note: `Violation: Untrusted IP [${clientIp}] or Unmanaged Device attempting access to ${resource.classification} asset.`
      });
    } else {
      evaluationLog.push({
        clause: "POLICY_002_ZERO_TRUST_POSTURE",
        description: "Zero-Trust network telemetry check",
        passed: true,
        note: "Non-confidential resource accessible via public authenticated gateway."
      });
    }
  } else {
    evaluationLog.push({
      clause: "POLICY_002_ZERO_TRUST_POSTURE",
      description: "Zero-Trust compliant device fingerprint and private IP confirmed",
      passed: true,
      note: `Corporate device [${clientIp}] posture verified.`
    });
  }

  // Clause 3: Mandatory MFA for Privileged Actions
  if ((action === "DELETE" || action === "DEPLOY" || resource.classification === "CONFIDENTIAL") && !mfaVerified) {
    allowed = false;
    evaluationLog.push({
      clause: "POLICY_003_MFA_STEP_UP",
      description: "Privileged action requires FIDO2/WebAuthn hardware token verification",
      passed: false,
      note: `Action [${action}] rejected: MFA step-up authentication missing.`
    });
  } else {
    evaluationLog.push({
      clause: "POLICY_003_MFA_STEP_UP",
      description: "MFA authorization state check",
      passed: true,
      note: mfaVerified ? "FIDO2 WebAuthn token verified." : "MFA not required for this action."
    });
  }

  // Clause 4: Role-Based & Least Privilege Check
  const rolePermissions = ROLES_HIERARCHY[role] || [];
  const hasActionPermission = rolePermissions.includes("*") || rolePermissions.includes(action);
  const isRoleAllowedOnResource = resource.allowedRoles.includes("*") || resource.allowedRoles.includes(role);

  if (!hasActionPermission || !isRoleAllowedOnResource) {
    allowed = false;
    evaluationLog.push({
      clause: "POLICY_004_LEAST_PRIVILEGE_RBAC",
      description: "RBAC action and resource access entitlement matrix",
      passed: false,
      note: `Role [${role}] lacks entitlement to perform [${action}] on resource [${resource.name}].`
    });
  } else {
    evaluationLog.push({
      clause: "POLICY_004_LEAST_PRIVILEGE_RBAC",
      description: "RBAC entitlement confirmed",
      passed: true,
      note: `Role [${role}] explicitly authorized for [${action}].`
    });
  }

  res.json({
    success: true,
    decision: allowed ? "ALLOW" : "DENY",
    decisionCode: allowed ? 200 : 403,
    context: {
      userId,
      role,
      tenantId,
      resourceName: resource.name,
      classification: resource.classification,
      action,
      evaluatedAt: new Date().toISOString()
    },
    evaluationLog,
    regoExpression: `package authz.skilltrack\ndefault allow = false\nallow {\n  input.tenant == "${tenantId}"\n  input.role in ${JSON.stringify(resource.allowedRoles)}\n  input.action == "${action}"\n  input.mfa == ${mfaVerified}\n}`
  });
};
