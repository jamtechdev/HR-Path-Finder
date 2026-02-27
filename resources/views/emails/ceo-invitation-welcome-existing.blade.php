@include('emails.layouts.header', ['companyLogo' => $companyLogo, 'companyName' => $companyName, 'subject' => $subject])

<h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Welcome back to HR Path-Finder!</h2>

<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    <strong>Great news!</strong> <strong>{{ $inviterName }}</strong> has assigned you as <strong>CEO</strong> for <strong>{{ $companyName }}</strong>.
</p>

@if($hasProject)
    <p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 Project Assignment</p>
    <p style="margin: 5px 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        You have been assigned to the HR transformation project. Please complete the Management Philosophy Survey to proceed.
    </p>
@endif

<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">🎯 What you need to do:</p>
<ul style="margin: 10px 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
    <li>Complete the Management Philosophy Survey</li>
    <li>Review and verify HR strategy steps</li>
    <li>Collaborate with the HR Manager</li>
</ul>

@include('emails.layouts.buttons', ['loginUrl' => $loginUrl])
@include('emails.layouts.footer')
