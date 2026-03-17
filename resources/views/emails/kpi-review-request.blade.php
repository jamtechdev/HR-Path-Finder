@php
    $companyLogo = $hrProject->company->logo_path ?? null;
    $companyName = $hrProject->company->name ?? 'the company';
    $subject = "KPI Review Request - {$organizationName} - {$companyName}";
@endphp

@include('emails.layouts.header', ['companyLogo' => $companyLogo, 'companyName' => $companyName, 'subject' => $subject])

<h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Hello {{ $reviewToken->name }},</h2>

<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    You have been requested to review the Key Performance Indicators (KPIs) for <strong>{{ $organizationName }}</strong> in {{ $companyName }}.
</p>

<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    Please review the proposed KPIs and provide your feedback.
</p>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
    <tr>
        <td align="center" style="padding: 20px 0;">
            <a href="{{ $reviewUrl }}" style="display: inline-block; padding: 12px 28px; background: #2ec4a0; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Review KPIs</a>
        </td>
    </tr>
</table>

<p style="margin: 20px 0 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    <strong>Important Details:</strong>
</p>
<ul style="margin: 10px 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
    <li>This review link will expire on <strong>{{ $reviewToken->expires_at->format('F d, Y') }}</strong></li>
    <li>You can submit your review up to <strong>3 times</strong> using this link</li>
</ul>

<p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
    If you did not expect this request, please ignore this email.
</p>

@include('emails.layouts.footer')
