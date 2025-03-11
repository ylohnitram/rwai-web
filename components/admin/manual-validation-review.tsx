import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { ProjectValidation, applyManualOverride } from "@/lib/services/validation-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ManualValidationReviewProps {
  validation: ProjectValidation | null;
  isLoading?: boolean;
  projectId: string;
  onValidationOverride: (validation: ProjectValidation) => Promise<void>;
  adminId?: string;
}

export function ManualValidationReview({
  validation,
  isLoading = false,
  projectId,
  onValidationOverride,
  adminId
}: ManualValidationReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localValidation, setLocalValidation] = useState<ProjectValidation | null>(validation);
  const [notes, setNotes] = useState<Record<string, string>>({
    scamCheck: '',
    sanctionsCheck: '',
    auditCheck: ''
  });

  // When external validation changes, update local state
  if (validation !== null && validation !== localValidation) {
    setLocalValidation(validation);
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Manual Validation Review
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Loading validation data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Manual Validation Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-400 py-4">
            No validation data available. Please run the automated validation first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleToggleCheck = (field: 'scamCheck' | 'sanctionsCheck' | 'auditCheck', passed: boolean) => {
    if (!localValidation) return;
    
    const updatedValidation = applyManualOverride(
      localValidation,
      field,
      passed,
      notes[field] || undefined,
      adminId
    );
    
    setLocalValidation(updatedValidation);
  };

  const handleOverrideOverall = async (passed: boolean) => {
    if (!localValidation) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedValidation = applyManualOverride(
        localValidation,
        'overall',
        passed,
        "Manual overall assessment by admin.",
        adminId
      );
      
      setLocalValidation(updatedValidation);
      
      // Save the override using the new API endpoint
      const response = await fetch('/api/admin/validation-override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          validation: updatedValidation
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save validation override');
      }
      
      // Notify parent component about the changes
      onValidationOverride(updatedValidation);
    } catch (error) {
      console.error("Error applying validation override:", error);
      // You could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOverrides = async () => {
    if (!localValidation) return;
    
    setIsSubmitting(true);
    
    try {
      // Save using the new API endpoint
      const response = await fetch('/api/admin/validation-override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          validation: localValidation
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save validation override');
      }
      
      // Notify parent component about the changes
      onValidationOverride(localValidation);
    } catch (error) {
      console.error("Error saving validation overrides:", error);
      // You could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Manual Validation Review
          </CardTitle>
          <Badge 
            className={
              localValidation.manuallyReviewed 
                ? "bg-blue-600" 
                : localValidation.riskLevel === 'low'
                ? 'bg-green-600'
                : localValidation.riskLevel === 'medium'
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }
          >
            {localValidation.manuallyReviewed 
              ? "MANUALLY REVIEWED" 
              : `${localValidation.riskLevel.toUpperCase()} RISK`}
          </Badge>
        </div>
        <CardDescription>
          Override automated checks and apply manual review
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Scam Check Override */}
        <div className="border border-gray-700 rounded-md p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${
                localValidation.scamCheck.passed ? 'bg-green-900/30' : 'bg-red-900/30'
              }`}>
                {localValidation.scamCheck.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">Scam Check</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {localValidation.scamCheck.details || "No details available"}
                </p>
                {localValidation.scamCheck.manualOverride && (
                  <Badge className="mt-2 bg-blue-600">Manually Reviewed</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={localValidation.scamCheck.passed}
                onCheckedChange={(checked) => handleToggleCheck('scamCheck', checked)}
                id="scam-check"
              />
              <Label htmlFor="scam-check">
                {localValidation.scamCheck.passed ? "Pass" : "Fail"}
              </Label>
            </div>
          </div>
          
          <Textarea
            placeholder="Admin notes about scam check (optional)"
            value={notes.scamCheck}
            onChange={(e) => setNotes({ ...notes, scamCheck: e.target.value })}
            className="bg-gray-900 border-gray-700 mt-2"
          />
        </div>
        
        {/* Sanctions Check Override */}
        <div className="border border-gray-700 rounded-md p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${
                localValidation.sanctionsCheck.passed ? 'bg-green-900/30' : 'bg-red-900/30'
              }`}>
                {localValidation.sanctionsCheck.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">Sanctions Check</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {localValidation.sanctionsCheck.details || "No details available"}
                </p>
                {localValidation.sanctionsCheck.manualOverride && (
                  <Badge className="mt-2 bg-blue-600">Manually Reviewed</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={localValidation.sanctionsCheck.passed}
                onCheckedChange={(checked) => handleToggleCheck('sanctionsCheck', checked)}
                id="sanctions-check"
              />
              <Label htmlFor="sanctions-check">
                {localValidation.sanctionsCheck.passed ? "Pass" : "Fail"}
              </Label>
            </div>
          </div>
          
          <Textarea
            placeholder="Admin notes about sanctions check (optional)"
            value={notes.sanctionsCheck}
            onChange={(e) => setNotes({ ...notes, sanctionsCheck: e.target.value })}
            className="bg-gray-900 border-gray-700 mt-2"
          />
        </div>
        
        {/* Audit Check Override */}
        <div className="border border-gray-700 rounded-md p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${
                localValidation.auditCheck.passed 
                  ? 'bg-green-900/30' 
                  : 'bg-yellow-900/30'
              }`}>
                {localValidation.auditCheck.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">Audit Verification</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {localValidation.auditCheck.details || "No details available"}
                </p>
                {localValidation.auditCheck.manualOverride && (
                  <Badge className="mt-2 bg-blue-600">Manually Reviewed</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={localValidation.auditCheck.passed}
                onCheckedChange={(checked) => handleToggleCheck('auditCheck', checked)}
                id="audit-check"
              />
              <Label htmlFor="audit-check">
                {localValidation.auditCheck.passed ? "Pass" : "Fail"}
              </Label>
            </div>
          </div>
          
          <Textarea
            placeholder="Admin notes about audit verification (optional)"
            value={notes.auditCheck}
            onChange={(e) => setNotes({ ...notes, auditCheck: e.target.value })}
            className="bg-gray-900 border-gray-700 mt-2"
          />
        </div>

        <Separator className="bg-gray-700 my-6" />
        
        {/* Overall Assessment */}
        <Alert className={
          localValidation.overallPassed 
            ? "bg-green-900/30 border-green-700" 
            : "bg-red-900/30 border-red-700"
        }>
          <AlertTitle className="flex items-center">
            Overall Assessment
            {localValidation.manuallyReviewed && (
              <Badge className="ml-2 bg-blue-600">Manually Reviewed</Badge>
            )}
          </AlertTitle>
          <AlertDescription>
            Project validation status: <span className="font-bold">
              {localValidation.overallPassed ? "PASSED" : "FAILED"}
            </span>
            
            {localValidation.manuallyReviewed && localValidation.reviewedAt && (
              <div className="mt-2 text-sm opacity-70">
                Reviewed {new Date(localValidation.reviewedAt).toLocaleString()}
              </div>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="flex justify-between space-x-4 pt-4">
        <div>
          <Button
            variant="destructive"
            onClick={() => handleOverrideOverall(false)}
            disabled={isSubmitting}
          >
            Override: Fail
          </Button>
        </div>
        
        <div className="space-x-2">
          <Button
            variant="default"
            onClick={handleSubmitOverrides}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          
          <Button
            variant="outline"
            className="bg-green-600 hover:bg-green-700 border-0"
            onClick={() => handleOverrideOverall(true)}
            disabled={isSubmitting}
          >
            Override: Pass
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
