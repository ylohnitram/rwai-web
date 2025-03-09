import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email address
const DEFAULT_FROM = process.env.EMAIL_FROM || 'do-not-reply@rwa-investors.com';

/**
 * Send notification email
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  from: string = DEFAULT_FROM
): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Exception when sending email:', error);
    return false;
  }
}

/**
 * Send project approval notification
 */
export async function sendProjectApprovalEmail(
  email: string,
  projectName: string
): Promise<boolean> {
  const subject = `Your project "${projectName}" has been approved`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Project Approved</h2>
      <p>Good news! Your project <strong>${projectName}</strong> has been approved and is now listed in the TokenDirectory.</p>
      <p>Your project is now visible in our public directory and available for potential investors to discover.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://rwa-directory.vercel.app'}/directory" 
           style="background-color: #F59E0B; color: #0F172A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Directory
        </a>
      </div>
      <p>Thank you for using TokenDirectory!</p>
    </div>
  `;

  return sendEmail(email, subject, htmlContent);
}

/**
 * Send project rejection notification
 */
export async function sendProjectRejectionEmail(
  email: string,
  projectName: string,
  reason?: string
): Promise<boolean> {
  const subject = `Update on your project "${projectName}"`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Project Update</h2>
      <p>We've completed the review of your project <strong>${projectName}</strong>.</p>
      <p>Unfortunately, we are unable to list your project at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you have any questions or would like to submit a revised project, please feel free to contact us.</p>
      <p>Thank you for your interest in TokenDirectory.</p>
    </div>
  `;

  return sendEmail(email, subject, htmlContent);
}

/**
 * Send request for changes notification
 */
export async function sendRequestChangesEmail(
  email: string,
  projectName: string,
  feedback: string
): Promise<boolean> {
  const subject = `Action Required: Changes needed for "${projectName}"`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Project Feedback</h2>
      <p>We've reviewed your project <strong>${projectName}</strong> and need some changes before we can approve it.</p>
      <div style="background-color: #F8FAFC; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Requested Changes:</h3>
        <p style="white-space: pre-line;">${feedback}</p>
      </div>
      <p>Please update your submission with these changes and resubmit.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://rwa-directory.vercel.app'}/submit" 
           style="background-color: #F59E0B; color: #0F172A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Update Submission
        </a>
      </div>
      <p>Thank you for your interest in TokenDirectory.</p>
    </div>
  `;

  return sendEmail(email, subject, htmlContent);
}
