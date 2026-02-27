<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $subject ?? 'HR Path-Finder' }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            @if(isset($companyLogo) && $companyLogo)
                                <img src="{{ $companyLogo }}" alt="{{ $companyName ?? 'Company' }}" style="max-width: 100px; max-height: 100px; border-radius: 8px; background: white; padding: 8px; margin-bottom: 15px;" />
                            @else
                                <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; margin: 0 auto 15px; display: inline-block; line-height: 60px; font-size: 28px;">🏢</div>
                            @endif
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">HR Path-Finder</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 13px;">by BetterCompany</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
