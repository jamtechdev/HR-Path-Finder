<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Path-Finder — CEO Invitation</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #EEE9E0; min-height: 100vh; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px 16px; }
        .card { background: #fff; max-width: 560px; margin: 0 auto; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 40px rgba(14,22,40,0.12); }
        .header { background: #0E1628; padding: 36px 40px 32px; position: relative; }
        .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .logo-icon { width: 36px; height: 36px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.35); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .logo-text { font-size: 15px; font-weight: 600; color: #fff; }
        .logo-by { font-size: 11px; font-weight: 300; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.06em; margin-left: 2px; }
        .inviter-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); border-radius: 20px; padding: 4px 12px 4px 8px; margin-bottom: 16px; }
        .inviter-avatar { width: 20px; height: 20px; background: #C9A84C; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #0E1628; }
        .inviter-label { font-size: 12px; color: #E8C96B; }
        .header-title { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.25; margin-bottom: 8px; }
        .header-title span { color: #E8C96B; }
        .header-sub { font-size: 13.5px; color: rgba(255,255,255,0.55); font-weight: 300; line-height: 1.5; }
        .body { padding: 32px 40px 36px; }
        .project-context { background: #F8F4ED; border-left: 3px solid #C9A84C; border-radius: 0 4px 4px 0; padding: 14px 18px; margin-bottom: 28px; }
        .project-context-label { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #C9A84C; margin-bottom: 5px; }
        .project-context-text { font-size: 13.5px; color: #4A4E69; line-height: 1.6; }
        .section-title { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #8A8FAA; margin-bottom: 14px; }
        .role-card { display: flex; align-items: center; gap: 14px; border: 1px solid #E8E4DC; border-radius: 6px; padding: 14px 18px; margin-bottom: 28px; background: #FAFAF8; }
        .role-icon { width: 40px; height: 40px; background: #0E1628; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .role-name { font-size: 16px; font-weight: 600; color: #1A1A2E; margin-bottom: 2px; }
        .role-company { font-size: 12px; color: #8A8FAA; }
        .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
        .action-item { background: #FAFAF8; border: 1px solid #E8E4DC; border-radius: 6px; padding: 12px 14px; display: flex; align-items: flex-start; gap: 10px; }
        .action-num { width: 20px; height: 20px; background: #0E1628; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #E8C96B; flex-shrink: 0; }
        .action-text { font-size: 12.5px; color: #4A4E69; line-height: 1.45; }
        .action-text strong { display: block; font-size: 12px; font-weight: 500; color: #1A1A2E; margin-bottom: 2px; }
        .process-strip { background: #0E1628; border-radius: 8px; padding: 18px 20px; margin-bottom: 28px; }
        .process-strip-label { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
        .process-steps { display: flex; align-items: center; }
        .process-step { flex: 1; text-align: center; }
        .ps-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; margin: 0 auto 6px; }
        .ps-dot.active { background: #C9A84C; color: #0E1628; }
        .ps-dot.pending { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.12); }
        .ps-label { font-size: 10.5px; color: rgba(255,255,255,0.55); line-height: 1.3; }
        .ps-label.active-label { color: rgba(255,255,255,0.85); }
        .security-notice { background: rgba(46,158,107,0.08); border: 1px solid rgba(46,158,107,0.2); border-radius: 6px; padding: 12px 16px; display: flex; align-items: flex-start; gap: 10px; margin-bottom: 28px; }
        .security-icon { font-size: 16px; flex-shrink: 0; }
        .security-text { font-size: 12.5px; color: #2A6B4A; line-height: 1.55; }
        .security-text strong { font-weight: 500; }
        .details-row { display: flex; gap: 10px; margin-bottom: 28px; }
        .detail-pill { flex: 1; background: #FAFAF8; border: 1px solid #E8E4DC; border-radius: 6px; padding: 10px 14px; }
        .detail-pill-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A8FAA; margin-bottom: 4px; font-weight: 500; }
        .detail-pill-value { font-size: 12.5px; color: #1A1A2E; font-weight: 500; }
        .expires-value { color: #4A4E69; font-weight: 400; font-size: 12px; }
        .cta-section { display: flex; gap: 12px; align-items: center; }
        .btn-accept { flex: 1; display: inline-block; text-align: center; background: #0E1628; color: #fff; border: none; border-radius: 6px; padding: 14px 24px; font-size: 14px; font-weight: 500; text-decoration: none; }
        .btn-decline { flex-shrink: 0; display: inline-block; text-align: center; background: transparent; border: 1px solid #DDD8CE; border-radius: 6px; padding: 14px 20px; font-size: 13px; color: #8A8FAA; text-decoration: none; }
        .footer { border-top: 1px solid #EEE9E0; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; }
        .footer-note { font-size: 11px; color: #8A8FAA; }
        .footer-logo { font-size: 11px; color: #8A8FAA; }
    </style>
</head>
<body>
<div class="card">
    <div class="header">
        <div class="logo-row">
            <div class="logo-icon">🏢</div>
            <div>
                <div class="logo-text">HR Path-Finder</div>
                <div class="logo-by">by BetterCompany</div>
            </div>
        </div>
        <div class="inviter-badge">
            <span class="inviter-avatar">{{ strtoupper(substr($inviterName ?? 'H', 0, 1)) }}</span>
            <span class="inviter-label">Invited by {{ $inviterName ?? 'HR Manager' }}</span>
        </div>
        <div class="header-title">
            {{ $companyName }}의<br><span>CEO로 초대합니다</span>
        </div>
        <div class="header-sub">HR 혁신 프로젝트에 귀하의 리더십이 필요합니다</div>
    </div>
    <div class="body">
        <div class="project-context">
            <div class="project-context-label">프로젝트 소개</div>
            <div class="project-context-text">
                HR Path-Finder는 귀사의 HR 전략을 5단계로 체계화하는 종합 진단 플랫폼입니다. 컨설턴트와 함께 맞춤형 HR 시스템 보고서를 완성하게 됩니다.
            </div>
        </div>
        <div class="section-title">초대 역할</div>
        <div class="role-card">
            <div class="role-icon">👔</div>
            <div>
                <div class="role-name">Chief Executive Officer (CEO)</div>
                <div class="role-company">{{ $companyName }}</div>
            </div>
        </div>
        <div class="section-title">참여 후 진행할 업무</div>
        <div class="actions-grid">
            <div class="action-item">
                <div class="action-num">1</div>
                <div class="action-text"><strong>회사 정보 검토 & 수정</strong>등록된 기본 정보를 확인하고 업데이트합니다</div>
            </div>
            <div class="action-item">
                <div class="action-num">2</div>
                <div class="action-text"><strong>경영 철학 설문 완성</strong>HR 전략 방향 수립을 위한 진단 설문에 응답합니다</div>
            </div>
            <div class="action-item">
                <div class="action-num">3</div>
                <div class="action-text"><strong>HR 프로젝트 협업</strong>컨설턴트, HR 담당자와 함께 진행 상황을 검토합니다</div>
            </div>
            <div class="action-item">
                <div class="action-num">4</div>
                <div class="action-text"><strong>전략 단계 검토 & 승인</strong>최종 HR 전략 보고서를 승인합니다</div>
            </div>
        </div>
        <div class="process-strip">
            <div class="process-strip-label">수락 후 진행 과정</div>
            <div class="process-steps">
                <div class="process-step">
                    <div class="ps-dot active">✓</div>
                    <div class="ps-label active-label">초대 수락</div>
                </div>
                <div class="process-step">
                    <div class="ps-dot pending">🔑</div>
                    <div class="ps-label">비밀번호<br>즉시 설정</div>
                </div>
                <div class="process-step">
                    <div class="ps-dot pending">🚀</div>
                    <div class="ps-label">바로<br>시작</div>
                </div>
            </div>
        </div>
        <div class="security-notice">
            <div class="security-icon">🔒</div>
            <div class="security-text">
                <strong>수락 즉시 비밀번호 설정 화면으로 이동합니다.</strong> 별도 이메일 없이 바로 계정을 완성하고 프로젝트를 시작할 수 있습니다.
            </div>
        </div>
        <div class="section-title">초대 상세 정보</div>
        <div class="details-row">
            <div class="detail-pill">
                <div class="detail-pill-label">초대자</div>
                <div class="detail-pill-value">{{ $inviterName ?? 'HR Manager' }}</div>
            </div>
            <div class="detail-pill">
                <div class="detail-pill-label">초대 유효 기간</div>
                <div class="detail-pill-value expires-value">{{ $expiresAt }}</div>
            </div>
        </div>
        <div class="cta-section">
            <a href="{{ $acceptUrl }}" class="btn-accept">초대 수락하기</a>
            <a href="{{ $rejectUrl }}" class="btn-decline">거절</a>
        </div>
    </div>
    <div class="footer">
        <span class="footer-note">문의: support@bettercompany.co.kr</span>
        <span class="footer-logo">HR Path-Finder</span>
    </div>
</div>
</body>
</html>
