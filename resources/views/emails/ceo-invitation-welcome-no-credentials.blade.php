@include('emails.layouts.header', ['companyName' => $companyName ?? 'HR Path-Finder', 'subject' => $subject ?? 'Your account is ready'])

<h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Your CEO account is ready</h2>

<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    You have completed your account setup for <strong>{{ $companyName }}</strong> on HR Path-Finder. You can log in anytime with the email and password you set.
</p>

<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Next steps</p>
<ul style="margin: 10px 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
    <li>Complete the Management Philosophy Survey</li>
    <li>Review and approve HR strategy steps</li>
    <li>Collaborate with your HR Manager</li>
</ul>

@include('emails.layouts.buttons', ['loginUrl' => $loginUrl])
@include('emails.layouts.footer')
