import { Shield, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProjectValidation } from "@/lib/services/validation-service";

interface ProjectValidationDetailsProps {
  validation: ProjectValidation | null;
  whitepaper?: string | null;
  auditUrl?: string | null;
  isLoading?: boolean;
}

export function ProjectValidationDetails({
  validation,
  whitepaper,
  auditUrl,
  isLoading = false
}: ProjectValidationDetailsProps) {
  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Project Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-6">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-700 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!validation) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Project Validation
          </CardTitle>
          <CardDescription>
            Automated security and compliance checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-6">
            <p className="text-gray-400">No validation data available for this project</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { scamCheck, sanctionsCheck, auditCheck, riskLevel, overallPassed } = validation;

  // Determine the warning message based on which checks failed
  let warningMessage = "";
  if (!scamCheck.passed || !sanctionsCheck.passed) {
    warningMessage = "This project has failed critical validation checks and should be rejected.";
  } else if (!auditCheck.passed) {
    warningMessage = "This project requires manual verification of the audit document before approval.";
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Project Validation
          </CardTitle>
          <Badge
            className={
              riskLevel === 'low'
                ? 'bg-green-600'
                : riskLevel === 'medium'
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }
          >
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
        <CardDescription>Automated security and compliance checks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <div className={`p-2 rounded-full mr-3 ${scamCheck.passed ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
              {scamCheck.passed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <p className="font-medium">Scam Database</p>
              <p className="text-sm text-gray-400">
                {scamCheck.details || (scamCheck.passed ? 'No matches found' : 'Scam indicators detected')}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className={`p-2 rounded-full mr-3 ${sanctionsCheck.passed ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
              {sanctionsCheck.passed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <p className="font-medium">Sanctions Check</p>
              <p className="text-sm text-gray-400">
                {sanctionsCheck.details || (sanctionsCheck.passed ? 'No sanctions detected' : 'Sanctions detected')}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div
              className={`p-2 rounded-full mr-3 ${
                auditCheck.passed ? 'bg-green-900/30' : 'bg-yellow-900/30'
              }`}
            >
              {auditCheck.passed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div>
              <p className="font-medium">Smart Contract Audit</p>
              <p className="text-sm text-gray-400">
                {auditCheck.details || (auditCheck.passed ? 'Verified' : 'Manual verification required')}
              </p>
            </div>
          </div>
        </div>

        {warningMessage && (
          <Alert className={!scamCheck.passed || !sanctionsCheck.passed ? "bg-red-900/20 border-red-700" : "bg-yellow-900/20 border-yellow-700"}>
            <AlertDescription className={!scamCheck.passed || !sanctionsCheck.passed ? "text-red-300" : "text-yellow-300"}>
              {warningMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {auditUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={auditUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Smart Contract Audit
              </a>
            </Button>
          )}
          
          {whitepaper && (
            <Button asChild variant="outline" size="sm">
              <a href={whitepaper} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Whitepaper
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
