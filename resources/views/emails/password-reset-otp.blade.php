<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP - HR Path-Finder</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .otp-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 8px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
        }
        .otp-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .content p {
            margin: 10px 0;
            color: #4b5563;
        }
        .content ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        .content li {
            margin: 8px 0;
            color: #4b5563;
        }
        .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box p {
            margin: 5px 0;
            color: #92400e;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 HR Path-Finder</h1>
        </div>
        
        <div class="greeting">
            Hello!
        </div>
        
        <div class="content">
            <p>You have requested to reset your password for your HR Path-Finder account.</p>
            
            <div class="otp-container">
                <div class="otp-label">Your OTP Code</div>
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-label">Valid for {{ $expiresIn }} minutes</div>
            </div>
            
            <div class="warning-box">
                <p><strong>⚠️ Important Security Information:</strong></p>
                <ul style="margin-top: 10px; padding-left: 20px;">
                    <li>This OTP is valid for {{ $expiresIn }} minutes only</li>
                    <li>Do not share this OTP with anyone</li>
                    <li>If you did not request this, please ignore this email</li>
                    <li>For security, this OTP can only be used once</li>
                </ul>
            </div>
            
            <p>Enter this OTP on the password reset page to verify your identity and set a new password.</p>
        </div>
        
        <div class="footer">
            Best regards,<br>
            <strong>The HR Path-Finder Team</strong>
        </div>
    </div>
</body>
</html>
