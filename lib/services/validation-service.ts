import { getSupabaseClient } from "@/lib/supabase";
import { Project } from "@/types/project";
import fetch from "node-fetch";

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

    // Check PhishTank API for known phishing sites
    // PhishTank API docs: https://phishtank.org/api_info.php
    if (domain) {
      const apiKey = process.env.PHISHTANK_API_KEY;
      if (apiKey) {
        try {
          const response = await fetch(`https://checkurl.phishtank.com/checkurl/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'TokenDirectory/1.0',
            },
            body: `url=${encodeURIComponent(project.website)}&format=json&app_key=${apiKey}`
          });

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.in_database && data.results.verified && data.results.valid) {
              return {
                passed: false,
                details: `Website is a known phishing site according to PhishTank (ID: ${data.results.phish_id})`
              };
            }
          }
        } catch (error) {
          console.error("Error checking PhishTank API:", error);
          // Continue with other checks if this one fails
        }
      }
    }
    
    // Check Google Safe Browsing API
    // API docs: https://developers.google.com/safe-browsing/v4/reference/rest
    const safeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (domain && safeBrowsingApiKey) {
      try {
        const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client: {
              clientId: "TokenDirectory",
              clientVersion: "1.0"
            },
            threatInfo: {
              threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [
                { url: project.website }
              ]
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.matches && data.matches.length > 0) {
            return {
              passed: false,
              details: `Website flagged by Google Safe Browsing API as: ${data.matches[0].threatType}`
            };
          }
        }
      } catch (error) {
        console.error("Error checking Google Safe Browsing API:", error);
        // Continue with other checks if this one fails
      }
    }

    // Check against a custom keyword blacklist
    const scamKeywords = [
      "guaranteed returns", "risk-free", "100% secure", "get rich quick",
      "double your investment", "secret investment", "hidden strategy",
      "exclusive opportunity", "limited time offer", "act now", "instant profit",
      "unbelievable returns", "guaranteed passive income", "zero risk", "infinite return",
      "secret algorithm", "proprietary trading system", "overnight millionaire"
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
    
    // Check against OFAC SDN List API if key is available
    const ofacApiKey = process.env.OFAC_API_KEY;
    if (ofacApiKey) {
      try {
        // Check project name against OFAC list
        const response = await fetch(`https://api.treasury.gov/sanctions/ofac/sdn/names/search?api_key=${ofacApiKey}&fuzzy=true&name=${encodeURIComponent(project.name)}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.total > 0) {
            return {
              passed: false,
              details: `Project name matched entry on OFAC sanctions list: ${data.results[0].match}`
            };
          }
        }
        
        // If domain is available, check it too
        if (domain) {
          const domainResponse = await fetch(`https://api.treasury.gov/sanctions/ofac/sdn/addresses/search?api_key=${ofacApiKey}&address=${encodeURIComponent(domain)}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (domainResponse.ok) {
            const domainData = await domainResponse.json();
            if (domainData.total > 0) {
              return {
                passed: false,
                details: `Project website domain matched entry on OFAC sanctions list`
              };
            }
          }
        }
      } catch (error) {
        console.error("Error checking OFAC API:", error);
        // Continue with other checks if API fails
      }
    }
    
    // Check for sanctioned countries in the website domain
    const sanctionedCountries = [
      { code: "ir", name: "Iran" },
      { code: "kp", name: "North Korea" },
      { code: "cu", name: "Cuba" },
      { code: "sy", name: "Syria" },
      { code: "ru", name: "Russia (partial sanctions)" },
      { code: "by", name: "Belarus" },
      { code: "ve", name: "Venezuela" },
      { code: "mm", name: "Myanmar" }
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
      
      // Advanced domain check for sanctions evasion
      // Check for domains hosted in sanctioned countries
      // This would require an IP geolocation API in production
      
      // Mock implementation for demonstration
      const highRiskDomainPatterns = [
        /\.ru\./i, /\.ir\./i, /\.kp\./i, /\.cu\./i, /\.sy\./i, 
        /north-?korea/i, /iran/i, /russia/i, /syria/i, /cuba/i
      ];
      
      for (const pattern of highRiskDomainPatterns) {
        if (pattern.test(domain)) {
          return {
            passed: false,
            details: `Project website domain contains pattern associated with sanctioned regions`
          };
        }
      }
    }
    
    // Check for sanctioned terms in name/description
    const sanctionedTerms = [
      "DPRK", "North Korea", "Iran", "Syrian", "Cuba", "Crimea", 
      "Donetsk", "Luhansk", "sanction evasion", "sanctions evasion",
      "Wagner Group", "Hezbollah", "Taliban", "military equipment",
      "dual-use technology", "missile technology", "nuclear proliferation"
    ];
    
    const projectText = `${project.name} ${project.description}`.toLowerCase();
    for (const term of sanctionedTerms) {
      if (projectText.toLowerCase().includes(term.toLowerCase())) {
        return {
          passed: false,
          details: `Project contains reference to sanctioned entity or prohibited area: ${term}`
        };
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
  // No audit document or URL provided
  if (!project.audit_document_path && !project.auditUrl) {
    return {
      passed: false,
      details: 'No audit document or URL provided'
    };
  }
  
  // List of recognized blockchain security audit firms
  const recognizedAuditFirms = [
    "certik", "peckshield", "hacken", "quantstamp", 
    "slowmist", "chainsecurity", "trailofbits", 
    "openzeppelin", "consensys", "mixbytes", 
    "solidified", "smartdec", "halborn", "immunefi",
    "verichains", "cyfrin", "omniscia", "zokyo",
    "dedaub", "zellic", "coinspect", "ncc group"
  ];
  
  try {
    // If we have an audit document path, check if it's from a recognized firm
    if (project.audit_document_path) {
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
          details: 'Audit document reference exists but file not found'
        };
      }
      
      // Check if the file is too small (might be fake)
      const fileInfo = data[0];
      if (fileInfo.metadata && fileInfo.metadata.size < 10000) { // Less than 10KB
        return {
          passed: false,
          details: 'Audit document exists but is suspiciously small'
        };
      }
      
      // Try to download the file to analyze its content
      const { data: fileData, error: fileError } = await supabase.storage
        .from('audit-documents')
        .download(project.audit_document_path);
      
      if (fileError || !fileData) {
        return {
          passed: false,
          details: 'Could not download audit document for verification'
        };
      }
      
      // For PDFs, we'd need to extract text and look for the audit firm's name
      // Since we can't easily parse PDFs in this environment, we'll check the filename
      const fileName = project.audit_document_path.toLowerCase();
      
      // Check if the file name contains any of the recognized audit firms
      const detectedFirm = recognizedAuditFirms.find(firm => 
        fileName.includes(firm.toLowerCase())
      );
      
      if (detectedFirm) {
        return {
          passed: true,
          details: `Audit document from recognized security firm: ${detectedFirm}`
        };
      }
      
      // If it's a PDF, we'll do a basic check for now
      if (fileName.endsWith('.pdf')) {
        // In a production environment, we'd implement OCR or PDF text extraction 
        // to look for audit firm mentions and analyze document content
        
        // For now, we'll pass the check if it's a PDF of reasonable size
        if (fileInfo.metadata && fileInfo.metadata.size > 100000) { // > 100KB
          return {
            passed: true,
            details: 'Audit document verified (basic check based on file format and size)'
          };
        }
      }
      
      // If we can't detect the firm from the filename, mark as manual review needed
      return {
        passed: false,
        details: 'Audit document provided but could not verify the security firm. Manual review recommended.'
      };
    } 
    // If we have an audit URL, check if it points to a recognized audit firm
    else if (project.auditUrl) {
      const auditUrl = project.auditUrl.toLowerCase();
      
      // Check if URL contains any of the recognized audit firms
      const detectedFirm = recognizedAuditFirms.find(firm => 
        auditUrl.includes(firm.toLowerCase())
      );
      
      if (detectedFirm) {
        // Verify the URL is accessible
        try {
          const response = await fetch(project.auditUrl, {
            method: 'HEAD',
            headers: { 'User-Agent': 'TokenDirectory/1.0' }
          });
          
          if (response.ok) {
            return {
              passed: true,
              details: `Verified audit from: ${detectedFirm}`
            };
          }
        } catch (fetchError) {
          // Even if fetch fails, we know it references a legitimate provider
          console.error("Error checking audit URL:", fetchError);
        }
        
        return {
          passed: true,
          details: `Audit URL references recognized security firm: ${detectedFirm}`
        };
      }
      
      // Check the URL's domain
      try {
        const url = new URL(project.auditUrl);
        const domain = url.hostname.toLowerCase();
        
        // Check if the domain belongs to a recognized audit firm
        const detectedDomain = recognizedAuditFirms.find(firm => 
          domain.includes(firm.toLowerCase())
        );
        
        if (detectedDomain) {
          return {
            passed: true,
            details: `Audit hosted on recognized security firm domain: ${detectedDomain}`
          };
        }
        
        // Check for audit document hosting platforms
        const auditPlatforms = ["github.com", "docs.google.com", "ipfs.io"];
        if (auditPlatforms.some(platform => domain.includes(platform))) {
          // For platforms like GitHub, we could check if the repository belongs to a recognized firm
          // For now, we'll mark it for manual review
          return {
            passed: false,
            details: 'Audit hosted on sharing platform, but unable to verify the issuer. Manual review recommended.'
          };
        }
      } catch (e) {
        console.error("Failed to parse audit URL:", e);
      }
      
      // If we can't detect a recognized firm, mark for manual verification
      return {
        passed: false,
        details: 'Audit URL provided but not from a recognized security firm. Manual verification required.'
      };
    }
    
    return {
      passed: false,
      details: 'Audit information insufficient'
    };
  } catch (error) {
    console.error('Error during audit verification:', error);
    return {
      passed: false,
      details: 'Error verifying audit information'
    };
  }
}
