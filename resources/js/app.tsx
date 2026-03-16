import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner'; // ⭐ ADD THIS
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import './lib/i18n'; // Initialize i18n

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pageModules = import.meta.glob('./pages/**/*.tsx');

function kebabToPascal(str) {
    return str.replace(/(^|-)([a-z])/g, (_, pre, c) => c.toUpperCase());
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const path = `./pages/${name}.tsx`;
        const parts = name.split('/');
        const filePart = parts.pop() || '';
        const pascalFile = kebabToPascal(filePart) + '.tsx';
        const pathPascal = parts.length
            ? `./pages/${parts.join('/')}/${pascalFile}`
            : `./pages/${pascalFile}`;
        const pathsToTry = path === pathPascal ? path : [path, pathPascal];
        return resolvePageComponent(pathsToTry, pageModules);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <>
                    <App {...props} />
                    <Toaster position="top-right" richColors closeButton />{' '}
                    {/* ⭐ ADD THIS */}
                </>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
