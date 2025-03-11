import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localValidation, setLocalValidation] = useState<ProjectValidation | null>(validation);
  const [notes, setNotes] = useState<Record<string, string>>({
    scamCheck: '',
    sanctionsCheck: '',
    auditCheck: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({
    scamCheck: '',
    sanctionsCheck: '',
    auditCheck: ''
  });

  // When external validation changes, update local state
  useEffect(() => {
    if (validation !== null && JSON.stringify(validation) !== JSON.stringify(localValidation)) {
      setLocalValidation(validation);
      
      // Initialize notes from existing validation if available
      if (validation.scamCheck.manualNotes) {
        setNotes(prev => ({ ...prev, scamCheck: validation.scamCheck.manualNotes || '' }));
      }
      if (validation.sanctionsCheck.manualNotes) {
        setNotes(prev => ({ ...prev, sanctionsCheck: validation.sanctionsCheck.manualNotes || '' }));
      }
      if (validation.auditCheck.manualNotes) {
        setNotes(prev => ({ ...prev, auditCheck: validation.auditCheck.manualNotes || '' }));
      }
    }
  }, [validation]);

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
    
    // Require notes for any override
    if (notes[field].length < 3) {
      setErrors({
        ...errors,
        [field]: 'Please provide at least 3 characters of notes for overriding this check'
      });
      return;
    }
    
    setErrors({
      ...errors,
      [field]: ''
    });
    
    // Check if this is actually a change
    const isChanging = localValidation[field].passed !== passed;
    
    if (isChanging) {
      const updatedValidation = applyManualOverride(
        localValidation,
        field,
        passed,
        notes[field] || undefined,
        adminId
      );
      
      setLocalValidation(updatedValidation);
    }
  };

  const handleSaveChanges = async () => {
    if (!localValidation) return;
    
    // Validate that any changed field has notes
    const hasErrors = Object.entries(localValidation).some(([key, value]) => {
      if (['scamCheck', 'sanctionsCheck', 'auditCheck'].includes(key)) {
        const typedKey = key as 'scamCheck' | 'sanctionsCheck' | 'auditCheck';
        const originalValue = validation[typedKey];
        const hasChanged = originalValue.passed !== value.passed;
        
        if (hasChanged && (!notes[typedKey] || notes[typedKey].length < 3)) {
          setErrors(prev => ({
            ...prev,
            [typedKey]: 'Please provide at least 3 characters of notes for this change'
          }));
          return true;
        }
      }
      return false;
    });
    
    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please provide notes for all changes",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Apply all notes to the validation object
      const updatedValidation: ProjectValidation = {
        ...localValidation,
        scamCheck: {
          ...localValidation.scamCheck,
          manualNotes: notes.scamCheck || localValidation.scamCheck.manualNotes
        },
        sanctionsCheck: {
          ...localValidation.sanctionsCheck,
          manualNotes: notes.sanctionsCheck || localValidation.sanctionsCheck.manualNotes
        },
        auditCheck: {
          ...localValidation.auditCheck,
          manualNotes: notes.auditCheck || localValidation.auditCheck.manualNotes
        }
      };
      
      // Recalculate overall status
      updatedValidation.overallPassed = updatedValidation.scamCheck.passed && updatedValidation.sanctionsCheck.passed;
      
      // Update timestamp and reviewer
      updatedValidation.manuallyReviewed = true;
      updatedValidation.reviewedBy = adminId;
      updatedValidation.reviewedAt = new Date().toISOString();
      
      // Save changes
      await onValidationOverride(updatedValidation);
      
      toast({
        title: "Changes Saved",
        description: "Validation changes have been saved successfully",
        className: "bg-green-800 border-green-700 text-white",
      });
      
      // Update local state
      setLocalValidation(updatedValidation);
    } catch (error) {
      console.error("Error saving validation changes:", error);
      toast({
        title: "Error",
        description: "Failed to save validation changes",
        variant: "destructive",
      });
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
          Review and override automated validation checks if necessary
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
            placeholder="Admin notes about scam check (required for override)"
            value={notes.scamCheck}
            onChange={(e) => {
              setNotes({ ...notes, scamCheck: e.target.value });
              if (e.target.value.length >= 3) {
                setErrors({ ...errors, scamCheck: '' });
              }
            }}
            className={`bg-gray-900 border-${errors.scamCheck ? 'red-500' : 'gray-700'} mt-2`}
          />
          {errors.scamCheck && (
            <p className="text-red-500 text-sm">{errors.scamCheck}</p>
          )}
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
            placeholder="Admin notes about sanctions check (required for override)"
            value={notes.sanctionsCheck}
            onChange={(e) => {
              setNotes({ ...notes, sanctionsCheck: e.target.value });
              if (e.target.value.length >= 3) {
                setErrors({ ...errors, sanctionsCheck: '' });
              }
            }}
            className={`bg-gray-900 border-${errors.sanctionsCheck ? 'red-500' : 'gray-700'} mt-2`}
          />
          {errors.sanctionsCheck && (
            <p className="text-red-500 text-sm">{errors.sanctionsCheck}</p>
          )}
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
            placeholder="Admin notes about audit verification (required for override)"
            value={notes.auditCheck}
            onChange={(e) => {
              setNotes({ ...notes, auditCheck: e.target.value });
              if (e.target.value.length >= 3) {
                setErrors({ ...errors, auditCheck: '' });
              }
            }}
            className={`bg-gray-900 border-${errors.auditCheck ? 'red-500' : 'gray-700'} mt-2`}
          />
          {errors.auditCheck && (
            <p className="text-red-500 text-sm">{errors.auditCheck}</p>
          )}
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

        <div className="text-sm italic text-gray-400">
          Note: Overall status is automatically determined based on scam and sanctions checks. 
          It will be PASSED only if both these checks are passed.
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-4 pt-4">
        <Button
          variant="default"
          onClick={handleSaveChanges}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
