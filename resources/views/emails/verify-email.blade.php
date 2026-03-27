<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - HR Path-Finder</title>
    <style>
        body { background:#f0f2f5; font-family: "DM Sans", Arial, sans-serif; margin:0; padding:40px 16px; color:#1a1744; }
        .email-wrapper { max-width:560px; margin:0 auto; }
        .topbar { display:flex; align-items:center; gap:10px; margin-bottom:8px; padding:0 4px; }
        .topbar-logo { width:28px; height:28px; background:#1a1744; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:700; }
        .topbar-name { font-size:13px; font-weight:600; color:#1a1744; letter-spacing:.02em; }
        .card { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 16px rgba(26,23,68,0.07), 0 0 0 1px rgba(26,23,68,0.05); }
        .card-header { background:#1a1744; padding:36px 48px 32px; position:relative; overflow:hidden; }
        .card-header:after { content:""; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.04); }
        .card-header:before { content:""; position:absolute; bottom:-40px; left:30%; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,0.03); }
        .header-label { font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.45); margin-bottom:10px; }
        .header-title { font-size:30px; color:#fff; line-height:1.2; letter-spacing:-.01em; margin-bottom:4px; font-weight:300; }
        .header-title em { font-style:italic; color:#7b9eff; }
        .header-sub { font-size:13px; color:rgba(255,255,255,.5); font-weight:300; margin-top:6px; }
        .card-body { padding:40px 48px; }
        .greeting { font-size:15px; color:#1a1744; font-weight:500; margin-bottom:10px; }
        .intro-text { font-size:14px; color:#6b7280; line-height:1.7; margin-bottom:32px; }
        .cta-wrap { text-align:center; margin-bottom:40px; }
        .cta-btn { display:inline-block; background:#1a1744; color:#fff !important; text-decoration:none; font-size:14px; font-weight:600; letter-spacing:.04em; padding:15px 40px; border-radius:8px; }
        .expire-note { text-align:center; font-size:12px; color:#9ca3af; margin-top:12px; }
        .divider { border:none; border-top:1px solid #f3f4f6; margin:0 0 32px; }
        .section-label { font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#9ca3af; margin-bottom:14px; }
        .benefit-list { margin:0 0 30px; padding-left:18px; color:#4b5563; font-size:13px; line-height:1.7; }
        .url-section { background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:20px 24px; margin-bottom:20px; }
        .url-section-title { font-size:12px; font-weight:600; color:#6b7280; margin-bottom:10px; }
        .url-text { font-family: "Courier New", monospace; font-size:11px; color:#4b5563; word-break:break-all; line-height:1.6; background:#fff; border:1px solid #e5e7eb; border-radius:6px; padding:10px 12px; }
        .card-footer { border-top:1px solid #f3f4f6; padding:24px 48px; color:#9ca3af; font-size:12px; }
        .bottom-note { text-align:center; margin-top:20px; font-size:11px; color:#9ca3af; line-height:1.6; padding:0 8px; }
        @media (max-width:480px) { .card-header,.card-body{padding-left:28px;padding-right:28px;} .header-title{font-size:24px;} }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="topbar">
        <div class="topbar-logo">HR</div>
        <span class="topbar-name">HR Path-Finder · by BetterCompany</span>
    </div>
    <div class="card">
        <div class="card-header">
            <div class="header-label">Account Verification</div>
            <div class="header-title">Verify your<br><em>email address</em></div>
            <div class="header-sub">One step away from your HR design workspace</div>
        </div>
        <div class="card-body">
            <p class="greeting">Hello {{ $user->name ?? 'there' }}!</p>
            <p class="intro-text">
                Thank you for signing up for HR Path-Finder. To complete your registration and start designing your HR system,
                please verify your email address by clicking the button below.
            </p>
            <div class="cta-wrap">
                <a href="{{ $verificationUrl }}" class="cta-btn">Verify Email Address →</a>
                <p class="expire-note">This link expires in 60 minutes</p>
            </div>
            <hr class="divider" />
            <div class="section-label">What happens next?</div>
            <ul class="benefit-list">
                <li>Access your dashboard</li>
                <li>Create and manage companies</li>
                <li>Start your HR system design journey</li>
                <li>Collaborate with your team</li>
            </ul>
            <div class="url-section">
                <div class="url-section-title">Having trouble clicking the button?</div>
                <div class="url-text">{{ $verificationUrl }}</div>
            </div>
        </div>
        <div class="card-footer">
            <strong>BetterCompany</strong> · HR Path-Finder
        </div>
    </div>
    <p class="bottom-note">
        If you did not create an account with HR Path-Finder, please ignore this email. No further action is required.
    </p>
</div>
</body>
</html>
