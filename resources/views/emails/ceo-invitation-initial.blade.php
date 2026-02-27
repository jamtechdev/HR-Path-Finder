@include('emails.layouts.header', ['companyLogo' => $companyLogo, 'companyName' => $companyName, 'subject' => $subject])

<h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Dear Future CEO,</h2>

<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    We are excited to inform you that <strong>{{ $inviterName }}</strong> has invited you to join <strong>{{ $companyName }}</strong> as <strong>Chief Executive Officer (CEO)</strong> on HR Path-Finder.
</p>

@if($hasProject)
    <p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 Project Assignment</p>
    <p style="margin: 5px 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        You have been invited to participate in a comprehensive HR transformation project. As the CEO, your leadership will be essential in shaping the organization's HR strategy.
    </p>
@endif

<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">✨ What you will be able to do:</p>
<ul style="margin: 10px 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
    <li>Review and modify company information</li>
    <li>Complete the Management Philosophy Survey</li>
    <li>Collaborate on HR projects</li>
    <li>Review and approve HR strategy steps</li>
</ul>

<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">⏰ Important Details:</p>
<ul style="margin: 10px 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
    <li><strong>Invitation Expires:</strong> {{ $expiresAt }}</li>
    <li><strong>Invited By:</strong> {{ $inviterName }}</li>
    @if($existingUser)
        <li>You already have an account - use your existing credentials</li>
    @else
        <li>After accepting, you will receive your login credentials via email</li>
    @endif
</ul>

@include('emails.layouts.buttons', ['acceptUrl' => $acceptUrl, 'rejectUrl' => $rejectUrl])
@include('emails.layouts.footer')
