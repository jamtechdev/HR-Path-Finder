<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Require admin approval before app access
    |--------------------------------------------------------------------------
    |
    | When true, new users receive access_granted_at = null until an admin
    | approves them. Login is blocked until approved; logged-in users without
    | access may only use verification routes and the pending-approval page.
    |
    */

    'require_admin_approval' => filter_var(env('BETA_REQUIRE_ADMIN_APPROVAL', false), FILTER_VALIDATE_BOOLEAN),

];
