<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - HR Path-Finder</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo-container {
            width: 80px;
            height: 80px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }
        .logo-text {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
        }
        .email-header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .email-header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .verify-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }
        .info-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 6px;
            margin: 30px 0;
        }
        .info-box p {
            font-size: 14px;
            color: #4a5568;
            margin: 0;
        }
        .link-fallback {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
        }
        .link-fallback p {
            font-size: 13px;
            color: #718096;
            margin-bottom: 10px;
        }
        .link-fallback a {
            color: #667eea;
            word-break: break-all;
            font-size: 12px;
        }
        .email-footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .email-footer p {
            font-size: 13px;
            color: #718096;
            margin-bottom: 8px;
        }
        .email-footer .brand {
            font-weight: 600;
            color: #667eea;
        }
        .security-note {
            background-color: #fff5f5;
            border-left: 4px solid #fc8181;
            padding: 15px;
            border-radius: 6px;
            margin-top: 25px;
        }
        .security-note p {
            font-size: 13px;
            color: #c53030;
            margin: 0;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }
            .email-header, .email-body, .email-footer {
                padding: 30px 20px;
            }
            .verify-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo-container">
                <div class="logo-text">HR</div>
            </div>
            <h1>HR Path-Finder</h1>
            <p>by BetterCompany</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">Hello {{ $user->name ?? 'there' }}!</div>
            
            <div class="message">
                Thank you for signing up for HR Path-Finder. To complete your registration and start designing your HR system, please verify your email address by clicking the button below.
            </div>

            <div class="button-container">
                <a href="{{ $verificationUrl }}" class="verify-button">Verify Email Address</a>
            </div>

            <div class="info-box">
                <p><strong>What happens next?</strong></p>
                <p style="margin-top: 8px;">Once you verify your email, you'll be able to:</p>
                <ul style="margin-top: 8px; padding-left: 20px; color: #4a5568;">
                    <li>Access your dashboard</li>
                    <li>Create and manage companies</li>
                    <li>Start your HR system design journey</li>
                    <li>Collaborate with your team</li>
                </ul>
            </div>

            <div class="link-fallback">
                <p><strong>Having trouble clicking the button?</strong></p>
                <p>Copy and paste the URL below into your web browser:</p>
                <a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a>
            </div>

            <div class="security-note">
                <p><strong>🔒 Security Note:</strong> If you did not create an account with HR Path-Finder, please ignore this email. No further action is required.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p>This verification link will expire in 60 minutes.</p>
            <p>If you need a new verification link, you can request one from your account settings.</p>
            <p style="margin-top: 20px;">
                <span class="brand">HR Path-Finder</span> by BetterCompany
            </p>
            <p style="font-size: 12px; margin-top: 15px; color: #a0aec0;">
                © {{ date('Y') }} BetterCompany. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
