@if(isset($acceptUrl) && isset($rejectUrl))
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td style="padding-right: 10px;">
                            <a href="{{ $acceptUrl }}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Accept Invitation</a>
                        </td>
                        <td style="padding-left: 10px;">
                            <a href="{{ $rejectUrl }}" style="display: inline-block; padding: 12px 28px; background: #6b7280; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Reject</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
@elseif(isset($loginUrl))
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <a href="{{ $loginUrl }}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Login to Your Account</a>
            </td>
        </tr>
    </table>
@endif
