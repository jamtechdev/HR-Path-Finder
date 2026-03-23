<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Duplicate company name window (minutes)
    |--------------------------------------------------------------------------
    |
    | Blocks creating another company with the same name (case-insensitive,
    | trimmed) for the same HR manager within this window to prevent accidental
    | double submissions.
    |
    */

    'duplicate_name_window_minutes' => (int) env('COMPANY_DUPLICATE_NAME_WINDOW_MINUTES', 5),

];
