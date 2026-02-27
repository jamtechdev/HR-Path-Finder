@include('emails.layouts.header', ['companyLogo' => $companyLogo, 'companyName' => $companyName, 'subject' => $subject])

<h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Welcome to HR Path-Finder!</h2>

<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    <strong>Congratulations!</strong> Your CEO account for <strong>{{ $companyName }}</strong> has been successfully created.
</p>

<div style="margin: 20px 0; background-color: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; padding: 20px;">
    <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">🔐 Your Login Credentials:</p>
    <p style="margin: 5px 0; color: #1f2937; font-size: 14px; font-family: monospace;"><strong>Email:</strong> {{ $email }}</p>
    <p style="margin: 5px 0; color: #1f2937; font-size: 14px; font-family: monospace;"><strong>Password:</strong> {{ $temporaryPassword }}</p>
</div>

<div style="margin: 20px 0; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 15px;">
    <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⚠️ Security Notice:</strong> Please change your password immediately after your first login.</p>
</div>

@if($hasProject)
    <p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 Project Assignment</p>
    <p style="margin: 5px 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        You have been assigned to the HR transformation project for <strong>{{ $companyName }}</strong>.
    </p>
@endif

<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📝 Next Steps:</p>
<ol style="margin: 10px 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
    <li>Login using the credentials above</li>
    <li>Change your password immediately</li>
    <li>Complete the Management Philosophy Survey</li>
</ol>

@include('emails.layouts.buttons', ['loginUrl' => $loginUrl])
@include('emails.layouts.footer')
