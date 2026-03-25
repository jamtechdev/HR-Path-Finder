<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    |
    | These options configures if and how Inertia uses Server Side Rendering
    | to pre-render each initial request made to your application's pages
    | so that server rendered HTML is delivered for the user's browser.
    |
    | See: https://inertiajs.com/server-side-rendering
    |
    */

    'ssr' => [
        // SSR is optional. Use the SSR bundle (no remote `url` calls).
        // Enable only if `bootstrap/ssr/ssr.mjs` exists and the SSR build is available.
        'enabled' => (bool) env('INERTIA_SSR_ENABLED', false),
        'bundle' => base_path('bootstrap/ssr/ssr.mjs'),

    ],

    /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    |
    | The values described here are used to locate Inertia components on the
    | filesystem. For instance, when using `assertInertia`, the assertion
    | attempts to locate the component as a file relative to the paths.
    |
    */

    'testing' => [

        'ensure_pages_exist' => true,

        'page_paths' => [
            resource_path('js/pages'),
        ],

        'page_extensions' => [
            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Pages (runtime)
    |--------------------------------------------------------------------------
    |
    | Runtime pages live under `resources/js/pages` (lowercase).
    | On case-sensitive filesystems, using the wrong casing will cause
    | Inertia to fail resolving components and return HTTP 500.
    |
    */
    'ensure_pages_exist' => true,
    'page_paths' => [
        resource_path('js/pages'),
    ],
    'page_extensions' => [
        'js',
        'jsx',
        'svelte',
        'ts',
        'tsx',
        'vue',
    ],

];
