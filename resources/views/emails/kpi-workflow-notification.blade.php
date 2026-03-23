@php
    $subject = $emailSubject ?? "KPI Notification - {$organizationName} - {$companyName}";
@endphp

@include('emails.layouts.header', ['companyLogo' => $companyLogo ?? null, 'companyName' => $companyName, 'subject' => $subject])

<h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Hello {{ $recipientName ?? 'User' }},</h2>

<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    {!! $messageLine1 !!}
</p>

@if(!empty($messageLine2))
<p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    {!! $messageLine2 !!}
</p>
@endif

@if(!empty($actionUrl))
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
    <tr>
        <td align="center" style="padding: 20px 0;">
            <a href="{{ $actionUrl }}" style="display: inline-block; padding: 12px 28px; background: #2ec4a0; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">{{ $actionText ?? 'Open KPI Review' }}</a>
        </td>
    </tr>
</table>
@endif

@if(!empty($details) && is_array($details))
<p style="margin: 20px 0 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    <strong>Important Details:</strong>
</p>
<ul style="margin: 10px 0 20px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
    @foreach($details as $detail)
        <li>{!! $detail !!}</li>
    @endforeach
</ul>
@endif

@if(!empty($footerNote))
<p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
    {!! $footerNote !!}
</p>
@endif

@include('emails.layouts.footer')

