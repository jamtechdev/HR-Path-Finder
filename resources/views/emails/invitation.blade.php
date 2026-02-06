<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'CEO Invitation - HR Path-Finder' }}</title>
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
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .important {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .important p {
            margin: 5px 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎯 HR Path-Finder</h1>
        </div>
        
        <div class="greeting">
            {!! $greeting !!}
        </div>
        
        <div class="content">
            @if(isset($introLines) && is_array($introLines))
                @foreach($introLines as $line)
                    <p>{!! $line !!}</p>
                @endforeach
            @endif
            
            @if(isset($actionText) && isset($actionUrl))
                <div class="button-container">
                    <a href="{{ $actionUrl }}" class="button">
                        {!! $actionText !!}
                    </a>
                </div>
            @endif
            
            @if(isset($outroLines) && is_array($outroLines))
                @foreach($outroLines as $line)
                    <p>{!! $line !!}</p>
                @endforeach
            @endif
        </div>
        
        <div class="footer">
            {!! $salutation !!}
        </div>
    </div>
</body>
</html>
