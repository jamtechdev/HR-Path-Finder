@include('emails.layouts.header')

<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <h2 style="color: #333; margin-bottom: 20px;">New KPIs Created</h2>
    
    <p style="color: #666; line-height: 1.6;">
        Hello,
    </p>
    
    <p style="color: #666; line-height: 1.6;">
        New Key Performance Indicators (KPIs) have been created for <strong>{{ $companyName }}</strong> and require your review.
    </p>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Summary:</h3>
        <ul style="color: #666; line-height: 1.8;">
            <li><strong>Project:</strong> {{ $companyName }}</li>
            <li><strong>Total KPIs Created:</strong> {{ count($kpis) }}</li>
            <li><strong>Organizations:</strong> {{ collect($kpis)->pluck('organization_name')->unique()->implode(', ') }}</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $reviewUrl }}" 
           style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Go to Dashboard
        </a>
    </div>
    
    <p style="color: #666; line-height: 1.6; margin-top: 20px;">
        Please login to your dashboard and review the KPIs from the "KPI Review" section. You can provide your feedback or approval there.
    </p>
    
    <p style="color: #666; line-height: 1.6;">
        If you have any questions, please contact the HR Manager.
    </p>
</div>

@include('emails.layouts.footer')
