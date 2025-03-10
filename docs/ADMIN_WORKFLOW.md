# TokenDirectory Admin Workflow

This document describes the process for reviewing and managing project submissions in the TokenDirectory application.

## Project Lifecycle

Projects submitted to the TokenDirectory go through the following states:

1. **Pending** - Initial state when a project is first submitted
2. **Changes Requested** - Admin has reviewed and requested specific changes
3. **Approved** - Project has been approved and is listed in the public directory
4. **Rejected** - Project has been rejected and will not be listed

![Project Lifecycle Diagram](https://mermaid.ink/img/pako:eNplkE1rwzAMhv-K8LkdJG3WpLDDYJfBYGxslyE2amMS28N2xyj-77PdQgc7CfE-evVKJ2isJkzwYLzvQZluMOrTOGi3Q2OMc8iK_KFM19veCp2gQ-tl5aK5oNcH-wvfoTOSMXxuT4SPrUcmtIPGdWvKVYwfYeTB9egKJp_I2K-C65q4MIBkr1clT-JtyESI7ypJO5l8I9wS-3xVcpOKu7XcOW70BaIbfLYBUfZPfLqQTXQgB_iGzhx_SOI6Zs-yXc0eI-5F2eRlLbOyrGa7WFaL2dOtEAXfb6t8V5QiDeGfNpVpMHZYULb46V9s_kG5Ym6KtJyVl35JSGCbtcwWaVnXYrfLt5ey0Csl0v_6C7qadwo)

## Admin Review Process

As an administrator, you are responsible for reviewing project submissions and ensuring they meet the platform's quality standards. The review process includes:

1. **Initial Review**
   - Check basic information (name, description, blockchain, ROI, etc.)
   - Verify website and contact information
   - Review the audit document if provided

2. **Decision Making**
   - **Approve**: If the project meets all criteria, approve it to be listed in the directory
   - **Request Changes**: If minor issues need to be addressed, request specific changes
   - **Reject**: If the project does not meet quality standards or appears fraudulent

3. **Notification**
   - When you take an action on a project, the submitter will be notified via email
   - For "Changes Requested", provide clear instructions on what needs to be fixed

## Audit Documents

The audit document system is a critical part of the verification process:

### What is an Audit Document?

An audit document is a report provided by the project submitter that verifies the security, legal compliance, and technical soundness of their project. This might include:

- Smart contract security audits
- Legal compliance reviews
- Tokenomics analysis
- Risk assessments

### How Audit Documents are Handled

1. **Submission**: Project submitters can upload their audit documents during the submission process
2. **Storage**: Documents are stored securely in Supabase Storage under the "audit-documents" bucket
3. **Access**: 
   - Admins can view all audit documents
   - Public users can only view documents for approved projects
   - Documents are accessed via secure, time-limited signed URLs

### Reviewing Audit Documents

When reviewing an audit document, look for:

1. **Authenticity**: Is the audit performed by a recognized security firm or legal entity?
2. **Comprehensiveness**: Does it cover all aspects of the project's security and compliance?
3. **Findings**: Were any critical issues identified and have they been addressed?
4. **Recency**: Is the audit recent enough to be relevant?

## Using the Admin Interface

The admin interface provides tools to manage the project review process:

1. **Dashboard**: View statistics and summaries of project statuses
2. **Pending Reviews**: Review projects awaiting initial approval
3. **Changes Requested**: Monitor projects where changes have been requested
4. **Recent Activity**: Track recently updated projects

### Approval Process

To approve a project:

1. Navigate to the "Pending Reviews" tab
2. Review the project details and audit document
3. Click the "Approve" button
4. Optionally add approval notes
5. Confirm your decision

### Requesting Changes

To request changes:

1. Click the "Request Changes" button on a pending project
2. Enter detailed notes about what changes are needed
3. Be specific about what the submitter needs to fix
4. Confirm your decision

### Rejecting Projects

To reject a project:

1. Click the "Reject" button
2. Provide a clear reason for rejection
3. Confirm your decision

## Best Practices

1. **Be consistent** in applying review criteria
2. **Provide clear feedback** when requesting changes
3. **Document your decisions** with helpful notes
4. **Prioritize security** and user protection
5. **Maintain responsiveness** by reviewing projects promptly

## Troubleshooting

If you encounter issues with the admin workflow:

1. **Document Upload Failures**: Check Supabase storage permissions
2. **Email Notification Issues**: Verify the email service configuration
3. **Access Problems**: Ensure your admin role is properly set in the database

For technical support, contact the development team.
