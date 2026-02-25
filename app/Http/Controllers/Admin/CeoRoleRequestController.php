<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CeoRoleRequest;
use App\Notifications\CeoRoleApprovedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class CeoRoleRequestController extends Controller
{
    /**
     * Display all CEO role requests.
     */
    public function index(Request $request): Response
    {
        $requests = CeoRoleRequest::with(['user', 'company', 'reviewer'])
            ->orderBy('requested_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'user_id' => $request->user_id,
                    'user_name' => $request->user->name,
                    'user_email' => $request->user->email,
                    'company_id' => $request->company_id,
                    'company_name' => $request->company->name,
                    'status' => $request->status,
                    'requested_at' => $request->requested_at->format('Y-m-d H:i:s'),
                    'reviewed_at' => $request->reviewed_at?->format('Y-m-d H:i:s'),
                    'reviewer_name' => $request->reviewer?->name,
                    'rejection_reason' => $request->rejection_reason,
                ];
            });

        return Inertia::render('Admin/CeoRoleRequests/Index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Approve a CEO role request.
     */
    public function approve(Request $request, CeoRoleRequest $ceoRoleRequest)
    {
        if ($ceoRoleRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'This request has already been processed.']);
        }

        $user = $ceoRoleRequest->user;
        $company = $ceoRoleRequest->company;

        // Assign CEO role to user
        if (!$user->hasRole('ceo')) {
            $user->assignRole('ceo');
        }

        // Associate user with company as CEO
        $company->users()->syncWithoutDetaching([
            $user->id => ['role' => 'ceo'],
        ]);

        // Update request status
        $ceoRoleRequest->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        // Send welcome email
        try {
            Log::info('Sending CEO Role Approved Notification', [
                'request_id' => $ceoRoleRequest->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'company_id' => $company->id,
                'mailer' => config('mail.default'),
            ]);

            Notification::route('mail', $user->email)
                ->notify(new CeoRoleApprovedNotification($ceoRoleRequest));

            Log::info('CEO Role Approved Notification sent successfully', [
                'request_id' => $ceoRoleRequest->id,
                'user_email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send CEO Role Approved Notification', [
                'request_id' => $ceoRoleRequest->id,
                'user_email' => $user->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return back()->with('success', 'CEO role request approved. Welcome email sent to ' . $user->email);
    }

    /**
     * Reject a CEO role request.
     */
    public function reject(Request $request, CeoRoleRequest $ceoRoleRequest)
    {
        if ($ceoRoleRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'This request has already been processed.']);
        }

        $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        // Update request status
        $ceoRoleRequest->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'rejection_reason' => $request->rejection_reason,
        ]);

        Log::info('CEO Role Request Rejected', [
            'request_id' => $ceoRoleRequest->id,
            'user_id' => $ceoRoleRequest->user_id,
            'company_id' => $ceoRoleRequest->company_id,
            'rejected_by' => $request->user()->id,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return back()->with('success', 'CEO role request rejected.');
    }
}
