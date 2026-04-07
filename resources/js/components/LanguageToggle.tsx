import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import i18n from '@/lib/i18n';

interface LanguageToggleProps {
    /** When true, show only globe icon (e.g. in dashboard header). Default false for landing. */
    iconOnly?: boolean;
}

export function LanguageToggle({ iconOnly = false }: LanguageToggleProps) {
    const { i18n: i18nInstance } = useTranslation();
    const normalize = (l: string) => (l && l.startsWith('en') ? 'en' : 'ko');
    const currentLang = normalize(i18nInstance.language || 'ko');

    const changeLanguage = (lang: string) => {
        const code = lang === 'en' ? 'en' : 'ko'; // ensure only en or ko for persistence
        i18nInstance.changeLanguage(code);
        try {
            localStorage.setItem('i18nextLng', code);
        } catch (_) {}
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: code } }));
    };

    const languages = [
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
    ];

    const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size={iconOnly ? 'icon' : 'sm'}
                    className={iconOnly ? 'size-9' : 'gap-2 text-sm font-medium class="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline transition-colors" hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'}
                    title={iconOnly ? `${currentLanguage.flag} ${currentLanguage.name}` : undefined}
                >
                    <Globe className="w-4 h-4" />
                    {!iconOnly && (
                        <>
                            <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
                            <span className="sm:hidden">{currentLanguage.flag}</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 dark:bg-gray-900 dark:border-gray-700 z-9">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`cursor-pointer dark:text-gray-300 ${currentLang === lang.code ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'dark:hover:bg-gray-800'}`}
                    >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
