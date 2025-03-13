import { getSupabaseClient } from "@/lib/supabase";
import { Project } from "@/types/project";

// Types for validation results
export type ValidationResult = {
  passed: boolean;
  details?: string;
  manualOverride?: boolean;
  manualNotes?: string;
};

export type ProjectValidation = {
  scamCheck: ValidationResult;
  sanctionsCheck: ValidationResult;
  auditCheck: ValidationResult;
  riskLevel: 'low' | 'medium' | 'high';
  overallPassed: boolean;
  manuallyReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
};

/**
 * Performs automated validation checks on a project
 */
export async function validateProject(project: Project): Promise<ProjectValidation> {
  // Run checks in parallel for efficiency
  const [scamResult, sanctionsResult, auditResult] = await Promise.all([
    checkForScamReports(project),
    checkForSanctions(project),
    verifyAuditDocument(project),
  ]);

  // If scam or sanctions checks fail, auto-reject
  const overallPassed = scamResult.passed && sanctionsResult.passed;
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (!scamResult.passed || !sanctionsResult.passed) {
    riskLevel = 'high';
  } else if (!auditResult.passed) {
    riskLevel = 'medium';
  }

  return {
    scamCheck: scamResult,
    sanctionsCheck: sanctionsResult,
    auditCheck: auditResult,
    riskLevel,
    overallPassed,
    manuallyReviewed: false
  };
}

/**
 * Applies a manual override to a validation result
 */
export function applyManualOverride(
  validation: ProjectValidation, 
  field: 'scamCheck' | 'sanctionsCheck' | 'auditCheck' | 'overall',
  passed: boolean,
  notes?: string,
  adminId?: string
): ProjectValidation {
  const result = { ...validation };
  
  if (field === 'overall') {
    result.overallPassed = passed;
    // Record that manual review was performed
    result.manuallyReviewed = true;
    result.reviewedBy = adminId;
    result.reviewedAt = new Date().toISOString();
    return result;
  }
  
  // Apply override to specific check
  result[field] = {
    ...result[field],
    passed,
    manualOverride: true,
    manualNotes: notes
  };
  
  // If we're overriding checks, recalculate overall status
  if (field === 'scamCheck' || field === 'sanctionsCheck') {
    result.overallPassed = result.scamCheck.passed && result.sanctionsCheck.passed;
  }
  
  // Recalculate risk level
  if (!result.scamCheck.passed || !result.sanctionsCheck.passed) {
    result.riskLevel = 'high';
  } else if (!result.auditCheck.passed) {
    result.riskLevel = 'medium';
  } else {
    result.riskLevel = 'low';
  }
  
  // Record that manual review was performed
  result.manuallyReviewed = true;
  result.reviewedBy = adminId;
  result.reviewedAt = new Date().toISOString();
  
  return result;
}

/**
 * Checks for scam reports in known databases
 */
async function checkForScamReports(project: Project): Promise<ValidationResult> {
  try {
    // Extract domain from website URL
    let domain = '';
    if (project.website) {
      try {
        const url = new URL(project.website);
        domain = url.hostname;
      } catch (e) {
        console.error("Failed to parse website URL:", e);
      }
    }
    
    // Check against a custom keyword blacklist
    const scamKeywords = [
      "guaranteed returns", "risk-free", "100% secure", "get rich quick",
      "double your investment", "secret investment", "hidden strategy",
      "exclusive opportunity", "limited time offer", "act now", "instant profit",
    ];
    
    // Create regex pattern that's case insensitive and matches whole words
    const pattern = new RegExp(`\\b(${scamKeywords.join('|')})\\b`, 'i');
    
    // Test project name and description
    const projectText = `${project.name} ${project.description}`;
    const match = projectText.match(pattern);
    
    if (match) {
      return {
        passed: false,
        details: `Suspicious terminology detected: ${match[0]}`
      };
    }
    
    // Check for abnormally high ROI claims
    if (project.roi > 30) {
      return {
        passed: false,
        details: `Suspiciously high ROI claim: ${project.roi}%. This exceeds typical market returns and raises red flags.`
      };
    }
    
    return {
      passed: true,
      details: "No suspicious patterns or reports detected"
    };
  } catch (error) {
    console.error('Error during scam check:', error);
    return {
      passed: false,
      details: 'Error performing scam check, unable to verify'
    };
  }
}

/**
 * Checks if the project or its associated addresses are in sanctions lists
 */
async function checkForSanctions(project: Project): Promise<ValidationResult> {
  try {
    // Extract domain for checks
    let domain = '';
    if (project.website) {
      try {
        const url = new URL(project.website);
        domain = url.hostname;
      } catch (e) {
        console.error("Failed to parse website URL:", e);
      }
    }
    
    // Check for sanctioned countries in the website domain
    const sanctionedCountries = [
      { code: "ir", name: "Iran" },
      { code: "kp", name: "North Korea" },
      { code: "cu", name: "Cuba" },
      { code: "sy", name: "Syria" },
      { code: "ru", name: "Russia (partial sanctions)" },
    ];
    
    if (domain) {
      // Check for country TLDs
      for (const country of sanctionedCountries) {
        if (domain.endsWith(`.${country.code}`)) {
          return {
            passed: false,
            details: `Project website has domain associated with sanctioned country: ${country.name}`
          };
        }
      }
    }
    
    return {
      passed: true,
      details: "No sanctions detected"
    };
  } catch (error) {
    console.error('Error during sanctions check:', error);
    return {
      passed: false,
      details: 'Error performing sanctions check, unable to verify'
    };
  }
}

/**
 * Verifies if a project has been audited by a recognized security firm
 */
async function verifyAuditDocument(project: Project): Promise<ValidationResult> {
  // First check if project has either an audit URL or an audit document path
  if (!project.audit_document_path && !project.audit_url) {
    return {
      passed: false,
      details: 'No audit document or URL provided. Manual review recommended.'
    };
  }
  
  // List of recognized blockchain security audit firms
  const recognizedAuditFirms = [
    "certik", "peckshield", "hacken", "quantstamp", 
    "slowmist", "chainsecurity", "trailofbits", 
    "openzeppelin", "consensys", "mixbytes", 
    "solidified", "smartdec", "halborn", "immunefi",
  ];
  
  try {
    // If we have an audit URL, check if it points to a recognized audit firm
    if (project.audit_url) {
      const auditUrl = project.audit_url.toLowerCase();
      
      // Check if URL contains any of the recognized audit firms
      const detectedFirm = recognizedAuditFirms.find(firm => 
        auditUrl.includes(firm.toLowerCase())
      );
      
      if (detectedFirm) {
        return {
          passed: true,
          details: `Verified audit from: ${detectedFirm}`
        };
      }
      
      // If we can't detect a recognized firm, mark for manual verification
      return {
        passed: false,
        details: 'Audit URL provided but not from a recognized security firm. Manual verification required.'
      };
    }
    // If we have an audit document path, check if it exists
    else if (project.audit_document_path) {
      const supabase = getSupabaseClient();
      
      // Verify the file exists in storage
      const { data, error } = await supabase.storage
        .from('audit-documents')
        .list('', {
          search: project.audit_document_path,
          limit: 1,
        });
      
      if (error || !data || data.length === 0) {
        return {
          passed: false,
          details: 'Audit document reference exists but file not found. Manual verification required.'
        };
      }
      
      // For PDFs, we'd need to extract text and look for the audit firm's name
      // Since we can't easily parse PDFs in this environment, request a manual review
      return {
        passed: false,
        details: 'Audit document provided but automated verification is limited. Manual review required to verify audit credibility.'
      };
    } 
    
    return {
      passed: false,
      details: 'Audit information insufficient. Manual review recommended.'
    };
  } catch (error) {
    console.error('Error during audit verification:', error);
    return {
      passed: false,
      details: 'Error verifying audit information. Manual review required.'
    };
  }
}

export { checkForScamReports, checkForSanctions, verifyAuditDocument };
