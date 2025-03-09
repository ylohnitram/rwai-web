import { NextResponse } from "next/server";
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email address
const DEFAULT_FROM = process.env.EMAIL_FROM || 'do-not-reply@rwa-investors.com';

export async function POST(request: Request) {
  try {
    // Check for admin authorization - in a real app, you would verify admin status
    // This is simple for testing purposes
    
    const body = await request.json();
    const { to, subject, html, type } = body;
    
    // Validate inputs
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          warning: true,
          message: 'RESEND_API_KEY not configured. Email would have been sent with this content.' 
        }
      );
    }
    
    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Test email sent successfully!'
    });
  } catch (error: any) {
    console.error('Unexpected error in test-email route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
