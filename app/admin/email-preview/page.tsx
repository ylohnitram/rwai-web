'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, FileEdit } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EmailPreviewPage() {
  const [activeTab, setActiveTab] = useState('approval')
  const [projectName, setProjectName] = useState('Sample Project')
  const [email, setEmail] = useState('user@example.com')
  const [feedback, setFeedback] = useState('Please provide more details about your project\'s tokenization model.\n\nWe also need a copy of your audit report.')
  const [rejectReason, setRejectReason] = useState('The project does not meet our requirements for tokenized real-world assets.')
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const SITE_URL = 'https://rwa-directory.vercel.app'

  // HTML templates for emails
  const approvalEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Project Approved</h2>
      <p>Good news! Your project <strong>${projectName}</strong> has been approved and is now listed in the TokenDirectory.</p>
      <p>Your project is now visible in our public directory and available for potential investors to discover.</p>
      <div style="margin: 30px 0;">
        <a href="${SITE_URL}/directory" 
           style="background-color: #F59E0B; color: #0F172A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Directory
        </a>
      </div>
      <p>Thank you for using TokenDirectory!</p>
    </div>
  `

  const rejectionEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Project Update</h2>
      <p>We've completed the review of your project <strong>${projectName}</strong>.</p>
      <p>Unfortunately, we are unable to list your project at this time.</p>
      ${rejectReason ? `<p><strong>Reason:</strong> ${rejectReason}</p>` : ''}
      <p>If you have any questions or would like to submit a revised project, please feel free to contact us.</p>
      <p>Thank you for your interest in TokenDirectory.</p>
    </div>
  `

  const changesEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Project Feedback</h2>
      <p>We've reviewed your project <strong>${projectName}</strong> and need some changes before we can approve it.</p>
      <div style="background-color: #F8FAFC; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Requested Changes:</h3>
        <p style="white-space: pre-line;">${feedback}</p>
      </div>
      <p>Please update your submission with these changes and resubmit.</p>
      <div style="margin: 30px 0;">
        <a href="${SITE_URL}/submit" 
           style="background-color: #F59E0B; color: #0F172A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Update Submission
        </a>
      </div>
      <p>Thank you for your interest in TokenDirectory.</p>
    </div>
  `

  const getActiveEmailHTML = () => {
    switch(activeTab) {
      case 'approval': return approvalEmailHTML
      case 'rejection': return rejectionEmailHTML
      case 'changes': return changesEmailHTML
      default: return approvalEmailHTML
    }
  }

  const getActiveEmailSubject = () => {
    switch(activeTab) {
      case 'approval': return `Your project "${projectName}" has been approved`
      case 'rejection': return `Update on your project "${projectName}"`
      case 'changes': return `Action Required: Changes needed for "${projectName}"`
      default: return `Your project "${projectName}" has been approved`
    }
  }

  const testSendEmail = async () => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: getActiveEmailSubject(),
          html: getActiveEmailHTML(),
          type: activeTab,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setTestResult({ success: false, message: data.error || 'Failed to send test email' })
      } else {
        setTestResult({ success: true, message: 'Test email sent successfully!' })
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter mb-6">Email Notifications Preview</h1>
        <p className="text-gray-400 mb-8">Preview and test email notifications sent to project submitters</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Configure the email notification template</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList className="bg-gray-800 border border-gray-700">
                    <TabsTrigger value="approval" className="data-[state=active]:bg-green-900/30">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approval
                    </TabsTrigger>
                    <TabsTrigger value="rejection" className="data-[state=active]:bg-red-900/30">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Rejection
                    </TabsTrigger>
                    <TabsTrigger value="changes" className="data-[state=active]:bg-amber-900/30">
                      <FileEdit className="h-4 w-4 mr-2" />
                      Changes
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Recipient Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  {activeTab === 'changes' && (
                    <div className="space-y-2">
                      <Label htmlFor="feedback">Feedback Message</Label>
                      <Textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[150px] bg-gray-800 border-gray-700"
                      />
                    </div>
                  )}

                  {activeTab === 'rejection' && (
                    <div className="space-y-2">
                      <Label htmlFor="reason">Rejection Reason</Label>
                      <Textarea
                        id="reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[100px] bg-gray-800 border-gray-700"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={testSendEmail} 
                    disabled={isLoading}
                    className="w-full mt-4"
                  >
                    {isLoading ? 'Sending...' : 'Send Test Email'}
                  </Button>

                  {testResult && (
                    <Alert className={`mt-4 ${testResult.success ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'}`}>
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertTitle>{testResult.success ? 'Success' : 'Error'}</AlertTitle>
                      <AlertDescription>
                        {testResult.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
                <CardDescription>
                  Subject: {getActiveEmailSubject()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white text-gray-900 rounded-md p-4 overflow-auto max-h-[500px]">
                  <div dangerouslySetInnerHTML={{ __html: getActiveEmailHTML() }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
