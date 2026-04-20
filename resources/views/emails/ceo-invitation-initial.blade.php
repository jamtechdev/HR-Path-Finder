<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Path Finder — CEO Invitation</title>
    <style>
        @media only screen and (max-width: 700px) {
            .container { width: 100% !important; }
            .pad-outer { padding: 20px 12px !important; }
            .pad-header { padding: 22px 20px !important; }
            .pad-body { padding: 22px 20px 24px !important; }
            .stack-col { display: block !important; width: 100% !important; padding-right: 0 !important; }
            .stack-gap { height: 8px !important; display: block !important; }
            .btn-row td { display: block !important; width: 100% !important; padding: 0 !important; }
            .btn-row td + td { padding-top: 10px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background:#ECE7DE; font-family:'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#151A30;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ECE7DE;">
    <tr>
        <td class="pad-outer" style="padding:30px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="640" class="container" align="center" style="width:640px; max-width:640px; margin:0 auto; background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(14,22,40,0.15);">
                <tr>
                    <td class="pad-header" style="background:linear-gradient(135deg,#0B1631 0%,#101E40 100%); padding:26px 30px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="padding-bottom:18px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="width:38px; height:38px; background:rgba(201,168,76,0.22); border:1px solid rgba(201,168,76,0.38); border-radius:9px; text-align:center; vertical-align:middle; font-size:18px;">&#127970;</td>
                                            <td style="padding-left:10px;">
                                                <div style="font-size:24px; line-height:26px; font-weight:700; color:#FFFFFF;">HR Path Finder</div>
                                                <div style="font-size:11px; line-height:16px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.58);">by BetterCompany</div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom:14px;">
                                    <span style="display:inline-block; border-radius:999px; padding:5px 12px 5px 8px; background:rgba(201,168,76,0.14); border:1px solid rgba(201,168,76,0.35);">
                                        <span style="display:inline-block; width:18px; height:18px; border-radius:50%; text-align:center; line-height:18px; font-size:10px; font-weight:700; color:#111A33; background:#C9A84C;">{{ strtoupper(substr($inviterName ?? 'H', 0, 1)) }}</span>
                                        <span style="font-size:12px; color:#E8C96B; margin-left:6px;">Invited by {{ $inviterName ?? 'HR Manager' }}</span>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div style="font-size:40px; line-height:36px; font-weight:800; color:#FFFFFF; letter-spacing:-0.01em;">
                                        {{ $companyName }}의 CEO로 초대합니다
                                    </div>
                                    <div style="margin-top:8px; font-size:13px; line-height:20px; color:rgba(255,255,255,0.74);">
                                        HR 혁신 프로젝트에 귀하의 리더십이 필요합니다
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td class="pad-body" style="padding:26px 30px 30px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="padding-bottom:18px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F5F1E8; border:1px solid #E3D8BF; border-radius:10px;">
                                        <tr>
                                            <td style="padding:14px 16px;">
                                                <div style="font-size:10px; line-height:14px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#B08E35;">프로젝트 소개</div>
                                                <div style="margin-top:6px; font-size:14px; line-height:22px; color:#3E4968;">
                                                    HR Path Finder는 귀사의 HR 전략을 5단계로 체계화하는 종합 진단 플랫폼입니다. 컨설턴트와 함께 맞춤형 HR 시스템 보고서를 완성하게 됩니다.
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-bottom:10px; font-size:11px; line-height:16px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7F88A5;">
                                    초대 역할
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom:18px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F9FAFC; border:1px solid #E3E7F0; border-radius:10px;">
                                        <tr>
                                            <td style="padding:15px 16px;">
                                                <table role="presentation" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="width:42px; height:42px; border-radius:10px; background:#0F1A36; text-align:center; vertical-align:middle; font-size:18px;">&#128086;</td>
                                                        <td style="padding-left:12px;">
                                                            <div style="font-size:23px; line-height:22px; font-weight:700; color:#1B223A;">Chief Executive Officer (CEO)</div>
                                                            <div style="margin-top:3px; font-size:13px; line-height:18px; color:#7C86A5;">{{ $companyName }}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-bottom:10px; font-size:11px; line-height:16px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7F88A5;">
                                    참여 후 진행할 업무
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom:16px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td class="stack-col" width="50%" style="padding-right:6px; vertical-align:top;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFBFD; border:1px solid #E4E8F1; border-radius:10px;">
                                                    <tr><td style="padding:13px 14px;">
                                                        <table role="presentation"><tr><td style="width:22px; height:22px; border-radius:50%; background:#0F1A36; color:#E8C96B; font-size:10px; font-weight:700; text-align:center; line-height:22px;">1</td><td style="padding-left:10px;"><div style="font-size:13px; line-height:18px; font-weight:700; color:#1E2742;">회사 정보 검토 &amp; 수정</div><div style="margin-top:2px; font-size:12px; line-height:17px; color:#4E5876;">등록된 기본 정보를 확인하고 업데이트합니다</div></td></tr></table>
                                                    </td></tr>
                                                </table>
                                            </td>
                                            <td class="stack-gap" style="width:0; font-size:0; line-height:0;">&nbsp;</td>
                                            <td class="stack-col" width="50%" style="padding-left:6px; vertical-align:top;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFBFD; border:1px solid #E4E8F1; border-radius:10px;">
                                                    <tr><td style="padding:13px 14px;">
                                                        <table role="presentation"><tr><td style="width:22px; height:22px; border-radius:50%; background:#0F1A36; color:#E8C96B; font-size:10px; font-weight:700; text-align:center; line-height:22px;">2</td><td style="padding-left:10px;"><div style="font-size:13px; line-height:18px; font-weight:700; color:#1E2742;">경영 철학 설문 완성</div><div style="margin-top:2px; font-size:12px; line-height:17px; color:#4E5876;">HR 전략 방향 수립을 위한 진단 설문에 응답합니다</div></td></tr></table>
                                                    </td></tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr><td colspan="3" style="height:8px;"></td></tr>
                                        <tr>
                                            <td class="stack-col" width="50%" style="padding-right:6px; vertical-align:top;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFBFD; border:1px solid #E4E8F1; border-radius:10px;">
                                                    <tr><td style="padding:13px 14px;">
                                                        <table role="presentation"><tr><td style="width:22px; height:22px; border-radius:50%; background:#0F1A36; color:#E8C96B; font-size:10px; font-weight:700; text-align:center; line-height:22px;">3</td><td style="padding-left:10px;"><div style="font-size:13px; line-height:18px; font-weight:700; color:#1E2742;">HR 프로젝트 협업</div><div style="margin-top:2px; font-size:12px; line-height:17px; color:#4E5876;">컨설턴트, HR 담당자와 함께 진행 상황을 검토합니다</div></td></tr></table>
                                                    </td></tr>
                                                </table>
                                            </td>
                                            <td class="stack-gap" style="width:0; font-size:0; line-height:0;">&nbsp;</td>
                                            <td class="stack-col" width="50%" style="padding-left:6px; vertical-align:top;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFBFD; border:1px solid #E4E8F1; border-radius:10px;">
                                                    <tr><td style="padding:13px 14px;">
                                                        <table role="presentation"><tr><td style="width:22px; height:22px; border-radius:50%; background:#0F1A36; color:#E8C96B; font-size:10px; font-weight:700; text-align:center; line-height:22px;">4</td><td style="padding-left:10px;"><div style="font-size:13px; line-height:18px; font-weight:700; color:#1E2742;">전략 단계 검토 &amp; 승인</div><div style="margin-top:2px; font-size:12px; line-height:17px; color:#4E5876;">최종 HR 전략 보고서를 승인합니다</div></td></tr></table>
                                                    </td></tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-bottom:16px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0E1628; border-radius:10px;">
                                        <tr>
                                            <td style="padding:16px;">
                                                <div style="font-size:10px; line-height:14px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.48); margin-bottom:12px;">수락 후 진행 과정</div>
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td width="33%" align="center" style="padding:0 8px;">
                                                            <div style="width:30px; height:30px; border-radius:50%; background:#C9A84C; color:#0D1934; font-size:11px; font-weight:700; line-height:30px; margin:0 auto 6px;">&#10003;</div>
                                                            <div style="font-size:11px; color:#FFFFFF;">초대 수락</div>
                                                        </td>
                                                        <td width="33%" align="center" style="padding:0 8px;">
                                                            <div style="width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.24); font-size:12px; line-height:28px; margin:0 auto 6px;">&#128274;</div>
                                                            <div style="font-size:11px; color:rgba(255,255,255,0.70);">비밀번호 즉시 설정</div>
                                                        </td>
                                                        <td width="33%" align="center" style="padding:0 8px;">
                                                            <div style="width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.24); font-size:12px; line-height:28px; margin:0 auto 6px;">&#128640;</div>
                                                            <div style="font-size:11px; color:rgba(255,255,255,0.70);">바로 시작</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-bottom:18px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(46,158,107,0.09); border:1px solid rgba(46,158,107,0.25); border-radius:10px;">
                                        <tr>
                                            <td style="padding:12px 14px;">
                                                <table role="presentation"><tr><td style="font-size:16px; padding-right:10px; vertical-align:top;">&#128274;</td><td style="font-size:13px; line-height:20px; color:#2A6B4A;"><strong style="font-weight:700;">수락 즉시 비밀번호 설정 화면으로 이동합니다.</strong> 별도 이메일 없이 바로 계정을 완성하고 프로젝트를 시작할 수 있습니다.</td></tr></table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-bottom:10px; font-size:11px; line-height:16px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7F88A5;">
                                    초대 상세 정보
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom:18px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td class="stack-col" width="50%" style="padding-right:6px; vertical-align:top;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFBFD; border:1px solid #E4E8F1; border-radius:10px;">
                                                    <tr><td style="padding:11px 14px;"><div style="font-size:10px; line-height:14px; text-transform:uppercase; letter-spacing:0.06em; color:#7F88A5; font-weight:700; margin-bottom:4px;">초대자</div><div style="font-size:13px; line-height:18px; color:#1F2742; font-weight:600;">{{ $inviterName ?? 'HR Manager' }}</div></td></tr>
                                                </table>
                                            </td>
                                            <td class="stack-gap" style="width:0; font-size:0; line-height:0;">&nbsp;</td>
                                            <td class="stack-col" width="50%" style="padding-left:6px; vertical-align:top;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFBFD; border:1px solid #E4E8F1; border-radius:10px;">
                                                    <tr><td style="padding:11px 14px;"><div style="font-size:10px; line-height:14px; text-transform:uppercase; letter-spacing:0.06em; color:#7F88A5; font-weight:700; margin-bottom:4px;">초대 유효 기간</div><div style="font-size:13px; line-height:18px; color:#4C5675;">{{ $expiresAt }}</div></td></tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="btn-row">
                                        <tr>
                                            <td style="padding-right:6px;">
                                                <a href="{{ $acceptUrl }}" style="display:block; text-align:center; text-decoration:none; font-size:14px; font-weight:700; line-height:20px; color:#FFFFFF; background:#0E1628; border-radius:10px; padding:13px 20px;">
                                                    초대 수락하기
                                                </a>
                                            </td>
                                            <td style="width:12px;">&nbsp;</td>
                                            <td style="width:150px;">
                                                <a href="{{ $rejectUrl }}" style="display:block; text-align:center; text-decoration:none; font-size:13px; font-weight:600; line-height:20px; color:#7E88A7; border:1px solid #D9DFEA; border-radius:10px; background:#FFFFFF; padding:13px 16px;">
                                                    거절
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="border-top:1px solid #E5E9F1; padding:14px 30px; background:#FBFCFF;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="font-size:11px; line-height:16px; color:#7E88A7;">문의: support@bettercompany.co.kr</td>
                                <td align="right" style="font-size:11px; line-height:16px; color:#7E88A7;">HR Path Finder</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
