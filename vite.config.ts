import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react-dom') || id.includes('react/')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@inertiajs')) {
                            return 'vendor-inertia';
                        }
                        if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('recharts')) {
                            return 'vendor-ui';
                        }
                        return 'vendor';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 600,
    },
});
