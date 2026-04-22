import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    build: {
        // Suppress chunk-size yellow warning in production build logs.
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            onwarn(warning, warn) {
                // Ignore noisy third-party "use client" directive warnings from node_modules.
                if (
                    warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
                    typeof warning.id === 'string' &&
                    warning.id.includes('node_modules')
                ) {
                    return;
                }
                warn(warning);
            },
        },
    },
});
