import { getSupabaseClient } from "@/lib/supabase";
import { Project } from "@/types/project";

// Types for validation results
export type ValidationResult = {
  passed: boolean;
  details?: string;
};

export type ProjectValidation = {
  scamCheck: ValidationResult;
  sanctionsCheck: ValidationResult;
  auditCheck: ValidationResult;
  riskLevel: 'low' | 'medium' | 'high';
  overallPassed: boolean;
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
    overallPassed
  };
}

/**
 * Checks for scam reports in known databases
 * This is a placeholder - in a real implementation, you would 
 * integrate with external scam databases like Chainabuse
 */
async function checkForScamReports(project: Project): Promise<ValidationResult> {
  try {
    // In a real implementation, you would call an external API here
    // For now, we'll simulate an API call with a mockup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock implementation - check for suspicious terms in project name or description
    const suspiciousTerms = ['guaranteed returns', 'risk-free', '100x', 'get rich quick'];
    
    const projectText = `${project.name} ${project.description}`.toLowerCase();
    const foundTerms = suspiciousTerms.filter(term => projectText.includes(term));
    
    if (foundTerms.length > 0) {
      return {
        passed: false,
        details: `Suspicious terms detected: ${foundTerms.join(', ')}`
      };
    }
    
    return {
      passed: true,
      details: 'No suspicious terms or reports found'
    };
  } catch (error) {
    console.error('Error during scam check:', error);
    return {
      passed: false,
      details: 'Error performing scam check'
    };
  }
}

/**
 * Checks if the project or its associated addresses are in sanctions lists
 * This is a placeholder - in a real implementation, you would 
 * integrate with OFAC or similar sanctions lists
 */
async function checkForSanctions(project: Project): Promise<ValidationResult> {
  try {
    // In a real implementation, you would call an external API here
    // For now, we'll simulate an API call with a mockup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock implementation - we'll just check website domain for sanctioned countries TLDs
    const sanctionedTLDs = ['.ir', '.sy', '.cu', '.kp'];
    
    if (project.website) {
      const hasSanctionedTLD = sanctionedTLDs.some(tld => 
        project.website.toLowerCase().endsWith(tld)
      );
      
      if (hasSanctionedTLD) {
        return {
          passed: false,
          details: 'Project website domain is associated with a sanctioned country'
        };
      }
    }
    
    return {
      passed: true,
      details: 'No sanctions detected'
    };
  } catch (error) {
    console.error('Error during sanctions check:', error);
    return {
      passed: false,
      details: 'Error performing sanctions check'
    };
  }
}

/**
 * Verifies if a valid audit document is provided
 */
async function verifyAuditDocument(project: Project): Promise<ValidationResult> {
  // Check if an audit document path exists
  if (!project.audit_document_path) {
    return {
      passed: false,
      details: 'No audit document provided'
    };
  }
  
  try {
    // Verify the document exists in storage
    const supabase = getSupabaseClient();
    
    // Check if the file exists
    const { data, error } = await supabase.storage
      .from('audit-documents')
      .list('', {
        search: project.audit_document_path
      });
    
    if (error || !data || data.length === 0) {
      return {
        passed: false,
        details: 'Audit document not found in storage'
      };
    }
    
    // A real implementation would perform additional checks on the audit document
    // like checking the issuer, scan date, report content, etc.
    
    return {
      passed: true,
      details: 'Audit document provided and verified'
    };
  } catch (error) {
    console.error('Error during audit document verification:', error);
    return {
      passed: false,
      details: 'Error verifying audit document'
    };
  }
}
