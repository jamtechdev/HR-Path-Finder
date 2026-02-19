import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import i18n from '@/lib/i18n';

export function LanguageToggle() {
    const { i18n: i18nInstance } = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18nInstance.language || 'ko');

    useEffect(() => {
        setCurrentLang(i18nInstance.language || 'ko');
    }, [i18nInstance.language]);

    const changeLanguage = (lang: string) => {
        i18nInstance.changeLanguage(lang);
        setCurrentLang(lang);
        // Store in localStorage
        localStorage.setItem('i18nextLng', lang);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
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
                    size="sm"
                    className="gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
                    <span className="sm:hidden">{currentLanguage.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`cursor-pointer ${currentLang === lang.code ? 'bg-gray-100 font-semibold' : ''}`}
                    >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
