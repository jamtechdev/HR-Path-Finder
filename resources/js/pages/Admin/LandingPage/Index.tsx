import { Head, router, useForm } from '@inertiajs/react';
import { Save, Eye, Languages, Type, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    translations: Record<string, any>;
    locales: Record<string, string>;
    currentLocale: string;
}

// Text size options for Korean content
const textSizeOptions = [
    { value: 'text-xs', label: '매우 작음 (12px)', size: '12px' },
    { value: 'text-sm', label: '작음 (14px)', size: '14px' },
    { value: 'text-base', label: '기본 (16px)', size: '16px' },
    { value: 'text-lg', label: '큼 (18px)', size: '18px' },
    { value: 'text-xl', label: '더 큼 (20px)', size: '20px' },
    { value: 'text-2xl', label: '2XL (24px)', size: '24px' },
    { value: 'text-3xl', label: '3XL (30px)', size: '30px' },
    { value: 'text-4xl', label: '4XL (36px)', size: '36px' },
    { value: 'text-5xl', label: '5XL (48px)', size: '48px' },
    { value: 'text-6xl', label: '6XL (60px)', size: '60px' },
];

export default function LandingPageIndex({ 
    translations,
    locales, 
    currentLocale
}: Props) {
    const [editedTranslations, setEditedTranslations] = useState<Record<string, any>>({});
    const [locale, setLocale] = useState(currentLocale);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        hero: true,
        benchmark: true,
        everything: true,
        why: true,
        features: true,
        cta: true,
        header: true,
        footer: true,
        hero_revision: true,
        benchmark_card: false,
        trust_bar: false,
        trust_section: false,
        roi: false,
        process: false,
        payband_showcase: false,
        cta_block: false,
    });

    useEffect(() => {
        setEditedTranslations({});
    }, [translations, locale]);

    const handleValueChange = (key: string, value: any) => {
        setEditedTranslations(prev => {
            const newState = { ...prev };
            const keys = key.split('.');
            let current = newState;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const getNestedValue = (obj: any, path: string): any => {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return '';
            }
        }
        return current;
    };

    const handleSave = () => {
        const merged = JSON.parse(JSON.stringify(translations));
        
        const mergeObject = (target: any, source: any) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeObject(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        };
        
        mergeObject(merged, editedTranslations);

        router.put('/admin/landing-page', {
            locale: locale,
            translations: merged,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditedTranslations({});
            },
        });
    };

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderTextField = (key: string, label: string, isTextarea = false, rows = 3) => {
        const currentValue = getNestedValue(translations, key);
        const editedValue = getNestedValue(editedTranslations, key);
        const displayValue = editedValue !== undefined ? editedValue : currentValue;
        const hasChanges = editedValue !== undefined;
        
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        {label}
                        {hasChanges && <Badge variant="outline" className="ml-2 text-xs">수정됨</Badge>}
                    </Label>
                    <span className="text-xs font-mono text-muted-foreground">{key}</span>
                </div>
                {isTextarea ? (
                    <Textarea
                        value={displayValue || ''}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        rows={rows}
                        className="font-sans text-base"
                        placeholder={locale === 'ko' ? '텍스트를 입력하세요...' : 'Enter text...'}
                    />
                ) : (
                    <Input
                        value={displayValue || ''}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        className="font-sans text-base"
                        placeholder={locale === 'ko' ? '텍스트를 입력하세요...' : 'Enter text...'}
                    />
                )}
                {displayValue && (
                    <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">미리보기:</span>
                        <div className="mt-1 p-2 bg-muted rounded border border-dashed">
                            {displayValue}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCardFields = (prefix: string, cards: any) => {
        if (!cards || typeof cards !== 'object') return null;
        
        return Object.entries(cards).map(([cardKey, cardData]: [string, any]) => (
            <Card key={cardKey} className="mb-4">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{cardKey.replace('_', ' ').toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {renderTextField(`${prefix}.${cardKey}.title`, locale === 'ko' ? '제목' : 'Title')}
                    {renderTextField(`${prefix}.${cardKey}.description`, locale === 'ko' ? '설명' : 'Description', true, 2)}
                </CardContent>
            </Card>
        ));
    };

    const renderArrayField = (key: string, label: string, items: any[]) => {
        if (!Array.isArray(items)) return null;
        
        return (
            <div className="space-y-3">
                <Label className="text-sm font-medium">{label}</Label>
                {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                        <Input
                            value={item || ''}
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[index] = e.target.value;
                                handleValueChange(key, newItems);
                            }}
                            className="flex-1"
                            placeholder={locale === 'ko' ? `항목 ${index + 1}` : `Item ${index + 1}`}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const hasChanges = Object.keys(editedTranslations).length > 0;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={locale === 'ko' ? '랜딩 페이지 편집' : 'Landing Page Editor'} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">
                                    {locale === 'ko' ? '랜딩 페이지 편집' : 'Landing Page Editor'}
                                </h1>
                                <p className="text-muted-foreground">
                                    {locale === 'ko' 
                                        ? 'JSON 파일에 저장된 랜딩 페이지 콘텐츠를 편집합니다 (한국어 및 영어)'
                                        : 'Edit landing page content stored in JSON files (Korean and English)'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <a href="/" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                        <Eye className="w-4 h-4 mr-2" />
                                        {locale === 'ko' ? '미리보기' : 'Preview'}
                                    </Button>
                                </a>
                                <Button 
                                    onClick={handleSave} 
                                    disabled={!hasChanges}
                                    className="bg-primary"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {locale === 'ko' ? '변경사항 저장' : 'Save Changes'}
                                    {hasChanges && (
                                        <Badge variant="secondary" className="ml-2">
                                            {Object.keys(editedTranslations).length}
                                        </Badge>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Languages className="w-5 h-5" />
                                    {locale === 'ko' ? '언어 선택' : 'Language Selection'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Label>{locale === 'ko' ? '언어' : 'Language'}</Label>
                                    <Select 
                                        value={locale} 
                                        onValueChange={(v) => {
                                            setLocale(v);
                                            router.get('/admin/landing-page', { locale: v }, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(locales).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <Languages className="w-4 h-4" />
                                                        {label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content */}
                        <Tabs defaultValue="content" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="content">
                                    {locale === 'ko' ? '콘텐츠 편집' : 'Content'}
                                </TabsTrigger>
                                <TabsTrigger value="structure">
                                    {locale === 'ko' ? '구조 편집' : 'Structure'}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-4">
                                {/* Hero Section */}
                                <Card>
                                    <Collapsible open={openSections.hero} onOpenChange={() => toggleSection('hero')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '히어로 섹션' : 'Hero Section'}
                                                    </CardTitle>
                                                    {openSections.hero ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <CardDescription>
                                                    {locale === 'ko' 
                                                        ? '메인 제목, 설명, 버튼 텍스트 등을 편집합니다'
                                                        : 'Edit main title, description, button text, etc.'}
                                                </CardDescription>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('hero.badge', locale === 'ko' ? '배지 텍스트' : 'Badge Text')}
                                                {renderTextField('hero.title', locale === 'ko' ? '메인 제목' : 'Main Title', true, 2)}
                                                {renderTextField('hero.description', locale === 'ko' ? '설명' : 'Description', true, 4)}
                                                {renderTextField('hero.cta_primary', locale === 'ko' ? '주요 버튼 텍스트' : 'Primary Button')}
                                                {renderTextField('hero.cta_secondary', locale === 'ko' ? '보조 버튼 텍스트' : 'Secondary Button')}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Benchmark Section */}
                                <Card>
                                    <Collapsible open={openSections.benchmark} onOpenChange={() => toggleSection('benchmark')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '보상 벤치마크' : 'Compensation Benchmark'}
                                                    </CardTitle>
                                                    {openSections.benchmark ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('benchmark.title', locale === 'ko' ? '제목' : 'Title')}
                                                {renderTextField('benchmark.industry_overall', locale === 'ko' ? '업종 전체' : 'Industry Overall')}
                                                {renderTextField('benchmark.target_competitors', locale === 'ko' ? '타겟 경쟁사' : 'Target Competitors')}
                                                {renderTextField('benchmark.industry_segment', locale === 'ko' ? '업종 세그먼트' : 'Industry Segment')}
                                                {renderTextField('benchmark.our_company', locale === 'ko' ? '우리 회사' : 'Our Company')}
                                                {renderTextField('benchmark.summary', locale === 'ko' ? '요약 텍스트' : 'Summary Text', true, 2)}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Everything Section */}
                                <Card>
                                    <Collapsible open={openSections.everything} onOpenChange={() => toggleSection('everything')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '핵심 영역 섹션' : 'Everything Section'}
                                                    </CardTitle>
                                                    {openSections.everything ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('everything.title', locale === 'ko' ? '제목' : 'Title')}
                                                {renderTextField('everything.description', locale === 'ko' ? '설명' : 'Description', true, 3)}
                                                {translations.everything?.cards && (
                                                    <div className="mt-4">
                                                        <Label className="text-base font-semibold mb-3 block">
                                                            {locale === 'ko' ? '카드 항목' : 'Cards'}
                                                        </Label>
                                                        {renderCardFields('everything.cards', translations.everything.cards)}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Why Section */}
                                <Card>
                                    <Collapsible open={openSections.why} onOpenChange={() => toggleSection('why')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '핵심 가치 섹션' : 'Why Section'}
                                                    </CardTitle>
                                                    {openSections.why ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('why.title', locale === 'ko' ? '제목' : 'Title')}
                                                {renderTextField('why.description', locale === 'ko' ? '설명' : 'Description', true, 3)}
                                                {translations.why?.items && Array.isArray(translations.why.items) && (
                                                    <div className="mt-4">
                                                        <Label className="text-base font-semibold mb-3 block">
                                                            {locale === 'ko' ? '항목 목록' : 'Items List'}
                                                        </Label>
                                                        {renderArrayField('why.items', '', translations.why.items)}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Features Section */}
                                <Card>
                                    <Collapsible open={openSections.features} onOpenChange={() => toggleSection('features')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '기능 섹션' : 'Features Section'}
                                                    </CardTitle>
                                                    {openSections.features ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {translations.features && (
                                                    <div>
                                                        <Label className="text-base font-semibold mb-3 block">
                                                            {locale === 'ko' ? '기능 카드' : 'Feature Cards'}
                                                        </Label>
                                                        {renderCardFields('features', translations.features)}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* CTA Section */}
                                <Card>
                                    <Collapsible open={openSections.cta} onOpenChange={() => toggleSection('cta')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? 'CTA 섹션' : 'CTA Section'}
                                                    </CardTitle>
                                                    {openSections.cta ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('cta.title', locale === 'ko' ? '제목' : 'Title')}
                                                {renderTextField('cta.description', locale === 'ko' ? '설명' : 'Description', true, 3)}
                                                {renderTextField('cta.button', locale === 'ko' ? '버튼 텍스트' : 'Button Text')}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Header & Footer */}
                                <Card>
                                    <Collapsible open={openSections.header} onOpenChange={() => toggleSection('header')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '헤더 및 푸터' : 'Header & Footer'}
                                                    </CardTitle>
                                                    {openSections.header ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                <div className="space-y-4">
                                                    <Label className="text-base font-semibold">
                                                        {locale === 'ko' ? '헤더' : 'Header'}
                                                    </Label>
                                                    {renderTextField('header.logo', locale === 'ko' ? '로고 텍스트' : 'Logo Text')}
                                                    {renderTextField('header.company', locale === 'ko' ? '회사 텍스트' : 'Company Text')}
                                                    {renderTextField('header.sign_in', locale === 'ko' ? '로그인 텍스트' : 'Sign In Text')}
                                                    {renderTextField('header.get_started', locale === 'ko' ? '시작하기 텍스트' : 'Get Started Text')}
                                                </div>
                                                <div className="space-y-4 pt-4 border-t">
                                                    <Label className="text-base font-semibold">
                                                        {locale === 'ko' ? '푸터' : 'Footer'}
                                                    </Label>
                                                    {renderTextField('footer.copyright', locale === 'ko' ? '저작권 텍스트' : 'Copyright Text')}
                                                    {renderTextField('footer.brand_line', locale === 'ko' ? '브랜드 라인' : 'Brand Line')}
                                                    {renderTextField('footer.contact_link', locale === 'ko' ? '문의 링크 텍스트' : 'Contact Link Text')}
                                                </div>
                                                {renderTextField('better_company', locale === 'ko' ? 'Better Company 텍스트' : 'Better Company Text', true, 2)}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Hero (Revision) */}
                                <Card>
                                    <Collapsible open={openSections.hero_revision} onOpenChange={() => toggleSection('hero_revision')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '히어로 (Revision)' : 'Hero (Revision)'}
                                                    </CardTitle>
                                                    {openSections.hero_revision ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <CardDescription>
                                                    {locale === 'ko' ? '상단 배지/제목/버튼/숫자 통계를 편집합니다' : 'Edit hero badge, headline, buttons, and stats'}
                                                </CardDescription>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('hero_revision.badge', locale === 'ko' ? '배지 텍스트' : 'Badge Text')}
                                                {renderTextField('hero_revision.headline.line1', locale === 'ko' ? '제목 1 (라인)' : 'Headline line 1')}
                                                {renderTextField('hero_revision.headline.line2', locale === 'ko' ? '제목 2 (라인)' : 'Headline line 2')}
                                                {renderTextField('hero_revision.headline.highlight_line1', locale === 'ko' ? '하이라이트 1' : 'Highlight line 1')}
                                                {renderTextField('hero_revision.headline.highlight_line2', locale === 'ko' ? '하이라이트 2' : 'Highlight line 2')}
                                                {renderTextField('hero_revision.sub', locale === 'ko' ? '설명' : 'Description', true, 3)}
                                                {renderTextField('hero_revision.primary_button', locale === 'ko' ? '주요 버튼' : 'Primary Button')}
                                                {renderTextField('hero_revision.secondary_button', locale === 'ko' ? '보조 버튼' : 'Secondary Button')}

                                                <div className="pt-2 border-t">
                                                    <Label className="text-base font-semibold mb-3 block">
                                                        {locale === 'ko' ? '숫자 통계' : 'Stats'}
                                                    </Label>
                                                    {renderTextField('hero_revision.stats.stat1.value', locale === 'ko' ? '통계 1 값' : 'Stat 1 value')}
                                                    {renderTextField('hero_revision.stats.stat1.label', locale === 'ko' ? '통계 1 라벨' : 'Stat 1 label', true, 2)}
                                                    {renderTextField('hero_revision.stats.stat2.value', locale === 'ko' ? '통계 2 값' : 'Stat 2 value')}
                                                    {renderTextField('hero_revision.stats.stat2.label', locale === 'ko' ? '통계 2 라벨' : 'Stat 2 label', true, 2)}
                                                    {renderTextField('hero_revision.stats.stat3.value', locale === 'ko' ? '통계 3 값' : 'Stat 3 value')}
                                                    {renderTextField('hero_revision.stats.stat3.label', locale === 'ko' ? '통계 3 라벨' : 'Stat 3 label', true, 2)}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Benchmark Card */}
                                <Card>
                                    <Collapsible open={openSections.benchmark_card} onOpenChange={() => toggleSection('benchmark_card')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '벤치마크 카드' : 'Benchmark Card'}
                                                    </CardTitle>
                                                    {openSections.benchmark_card ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <CardDescription>
                                                    {locale === 'ko' ? '벤치마크 헤더/설명/인사이트/푸터 편집' : 'Edit header, subtitle, insight, and footer'}
                                                </CardDescription>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('benchmark_card.header.left_label', locale === 'ko' ? '헤더 좌측 라벨' : 'Header left label')}
                                                {renderTextField('benchmark_card.header.badge', locale === 'ko' ? '배지 텍스트' : 'Badge Text')}
                                                {renderTextField('benchmark_card.subtitle', locale === 'ko' ? '서브 타이틀' : 'Subtitle', true, 2)}
                                                {renderTextField('benchmark_card.insight.strong', locale === 'ko' ? '인사이트 강조 문구' : 'Insight strong', true, 2)}
                                                {renderTextField('benchmark_card.insight.suffix', locale === 'ko' ? '인사이트 나머지' : 'Insight suffix', true, 2)}
                                                {renderTextField('benchmark_card.footer.left', locale === 'ko' ? '푸터 좌측' : 'Footer left')}
                                                {renderTextField('benchmark_card.footer.right', locale === 'ko' ? '푸터 우측' : 'Footer right')}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Trust Bar */}
                                <Card>
                                    <Collapsible open={openSections.trust_bar} onOpenChange={() => toggleSection('trust_bar')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '신뢰 바' : 'Trust Bar'}
                                                    </CardTitle>
                                                    {openSections.trust_bar ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('trust_bar.item1', locale === 'ko' ? '항목 1' : 'Item 1')}
                                                {renderTextField('trust_bar.item2', locale === 'ko' ? '항목 2' : 'Item 2')}
                                                {renderTextField('trust_bar.item3', locale === 'ko' ? '항목 3' : 'Item 3')}
                                                {renderTextField('trust_bar.item4', locale === 'ko' ? '항목 4' : 'Item 4')}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* ROI */}
                                <Card>
                                    <Collapsible open={openSections.roi} onOpenChange={() => toggleSection('roi')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? 'ROI' : 'ROI'}
                                                    </CardTitle>
                                                    {openSections.roi ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('roi.eyebrow', locale === 'ko' ? '섹션 라벨' : 'Eyebrow')}
                                                {renderTextField('roi.title', locale === 'ko' ? '타이틀' : 'Title')}
                                                {renderTextField('roi.description', locale === 'ko' ? '설명' : 'Description', true, 3)}
                                                {renderTextField('roi.table.headers.category', locale === 'ko' ? '테이블 헤더: 구분' : 'Header: category')}
                                                {renderTextField('roi.table.headers.hr', locale === 'ko' ? '테이블 헤더: HR' : 'Header: HR')}
                                                {renderTextField('roi.table.headers.traditional', locale === 'ko' ? '테이블 헤더: 일반' : 'Header: traditional')}

                                                <div className="pt-2 border-t">
                                                    <Label className="text-base font-semibold mb-3 block">
                                                        {locale === 'ko' ? '테이블 행' : 'Table rows'}
                                                    </Label>
                                                    {renderTextField('roi.rows.row_1.label', 'Row 1 label')}
                                                    {renderTextField('roi.rows.row_1.good', 'Row 1 good', true, 2)}
                                                    {renderTextField('roi.rows.row_1.bad', 'Row 1 bad', true, 2)}
                                                    {renderTextField('roi.rows.row_2.label', 'Row 2 label')}
                                                    {renderTextField('roi.rows.row_2.good', 'Row 2 good', true, 2)}
                                                    {renderTextField('roi.rows.row_2.bad', 'Row 2 bad', true, 2)}
                                                    {renderTextField('roi.rows.row_3.label', 'Row 3 label')}
                                                    {renderTextField('roi.rows.row_3.good', 'Row 3 good', true, 2)}
                                                    {renderTextField('roi.rows.row_3.bad', 'Row 3 bad', true, 2)}
                                                    {renderTextField('roi.rows.row_4.label', 'Row 4 label')}
                                                    {renderTextField('roi.rows.row_4.good', 'Row 4 good', true, 2)}
                                                    {renderTextField('roi.rows.row_4.bad', 'Row 4 bad', true, 2)}
                                                    {renderTextField('roi.rows.row_5.label', 'Row 5 label')}
                                                    {renderTextField('roi.rows.row_5.good', 'Row 5 good', true, 2)}
                                                    {renderTextField('roi.rows.row_5.bad', 'Row 5 bad', true, 2)}
                                                </div>

                                                {renderTextField('roi.table.note', locale === 'ko' ? '노트' : 'Note', true, 3)}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Process */}
                                <Card>
                                    <Collapsible open={openSections.process} onOpenChange={() => toggleSection('process')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '프로세스' : 'Process'}
                                                    </CardTitle>
                                                    {openSections.process ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('process.lead.line1', locale === 'ko' ? '리드 라인 1' : 'Lead line 1')}
                                                {renderTextField('process.lead.highlight', locale === 'ko' ? '리드 하이라이트' : 'Lead highlight', true, 2)}
                                                {renderTextField('process.lead.line3', locale === 'ko' ? '리드 라인 3' : 'Lead line 3')}

                                                <div className="pt-2 border-t">
                                                    <Label className="text-base font-semibold mb-3 block">
                                                        {locale === 'ko' ? '단계 (01~05)' : 'Steps (01~05)'}
                                                    </Label>
                                                    {renderTextField('process.step_01.title', 'Step 01 title')}
                                                    {renderTextField('process.step_01.desc', 'Step 01 desc', true, 3)}
                                                    {renderTextField('process.step_02.title', 'Step 02 title')}
                                                    {renderTextField('process.step_02.desc', 'Step 02 desc', true, 3)}
                                                    {renderTextField('process.step_03.title', 'Step 03 title')}
                                                    {renderTextField('process.step_03.desc', 'Step 03 desc', true, 3)}
                                                    {renderTextField('process.step_04.title', 'Step 04 title')}
                                                    {renderTextField('process.step_04.desc', 'Step 04 desc', true, 3)}
                                                    {renderTextField('process.step_05.title', 'Step 05 title')}
                                                    {renderTextField('process.step_05.desc', 'Step 05 desc', true, 3)}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Pay Band Showcase */}
                                <Card>
                                    <Collapsible open={openSections.payband_showcase} onOpenChange={() => toggleSection('payband_showcase')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? 'Pay Band 쇼케이스' : 'Pay Band Showcase'}
                                                    </CardTitle>
                                                    {openSections.payband_showcase ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('payband_showcase.eyebrow', locale === 'ko' ? '섹션 라벨' : 'Eyebrow')}
                                                {renderTextField('payband_showcase.title_prefix', locale === 'ko' ? '타이틀 프리픽스' : 'Title prefix')}
                                                {renderTextField('payband_showcase.title_highlight', locale === 'ko' ? '하이라이트' : 'Highlight', true, 2)}
                                                {renderTextField('payband_showcase.title_suffix', locale === 'ko' ? '타이틀 서픽스' : 'Title suffix')}
                                                {renderTextField('payband_showcase.sample_badge', locale === 'ko' ? '배지' : 'Badge')}

                                                {renderTextField('payband_showcase.factors.factorA.label', 'Factor A label')}
                                                {renderTextField('payband_showcase.factors.factorB.label', 'Factor B label')}
                                                {renderTextField('payband_showcase.chart.unit', locale === 'ko' ? '차트 유닛(본문)' : 'Chart unit', true, 2)}
                                                {renderTextField('payband_showcase.chart.aria_label', locale === 'ko' ? '차트 ARIA 라벨' : 'Chart aria label')}

                                                <div className="pt-2 border-t">
                                                    <Label className="text-base font-semibold mb-3 block">
                                                        {locale === 'ko' ? '숫자 축 단위' : 'Axis units'}
                                                    </Label>
                                                    {renderTextField('payband_showcase.chart.units.large', 'Large unit')}
                                                    {renderTextField('payband_showcase.chart.units.small', 'Small unit')}
                                                </div>

                                                <div className="pt-2 border-t">
                                                    <Label className="text-base font-semibold mb-3 block">
                                                        {locale === 'ko' ? 'Grade 라벨' : 'Grade labels'}
                                                    </Label>
                                                    {renderTextField('payband_showcase.grades.A', 'Grade A')}
                                                    {renderTextField('payband_showcase.grades.B', 'Grade B')}
                                                    {renderTextField('payband_showcase.grades.C', 'Grade C')}
                                                    {renderTextField('payband_showcase.grades.D', 'Grade D')}
                                                    {renderTextField('payband_showcase.grades.E', 'Grade E')}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* Trust Section */}
                                <Card>
                                    <Collapsible open={openSections.trust_section} onOpenChange={() => toggleSection('trust_section')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? '신뢰 섹션' : 'Trust Section'}
                                                    </CardTitle>
                                                    {openSections.trust_section ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('trust_section.title_prefix', locale === 'ko' ? '타이틀 프리픽스' : 'Title prefix')}
                                                {renderTextField('trust_section.title_highlight', locale === 'ko' ? '하이라이트' : 'Highlight', true, 2)}
                                                {renderTextField('trust_section.description', locale === 'ko' ? '설명' : 'Description', true, 3)}

                                                <div className="pt-2 border-t">
                                                    <Label className="text-base font-semibold mb-3 block">
                                                        {locale === 'ko' ? '카드 3개' : '3 Cards'}
                                                    </Label>
                                                    {renderTextField('trust_cards.card1_title', 'Card 1 title')}
                                                    {renderTextField('trust_cards.card1_desc', 'Card 1 desc', true, 3)}
                                                    {renderTextField('trust_cards.card2_title', 'Card 2 title')}
                                                    {renderTextField('trust_cards.card2_desc', 'Card 2 desc', true, 3)}
                                                    {renderTextField('trust_cards.card3_title', 'Card 3 title')}
                                                    {renderTextField('trust_cards.card3_desc', 'Card 3 desc', true, 3)}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>

                                {/* CTA Block */}
                                <Card>
                                    <Collapsible open={openSections.cta_block} onOpenChange={() => toggleSection('cta_block')}>
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl">
                                                        {locale === 'ko' ? 'CTA 블록' : 'CTA Block'}
                                                    </CardTitle>
                                                    {openSections.cta_block ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                {renderTextField('cta_block.eyebrow', locale === 'ko' ? '섹션 라벨' : 'Eyebrow')}
                                                {renderTextField('cta_block.title_line1', locale === 'ko' ? '타이틀 라인 1' : 'Title line 1')}
                                                {renderTextField('cta_block.title_highlight', locale === 'ko' ? '하이라이트' : 'Highlight', true, 2)}
                                                {renderTextField('cta_block.description', locale === 'ko' ? '설명' : 'Description', true, 3)}
                                                {renderTextField('cta_block.button', locale === 'ko' ? '버튼 텍스트' : 'Button text')}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            </TabsContent>

                            <TabsContent value="structure" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {locale === 'ko' ? 'JSON 구조 보기' : 'JSON Structure View'}
                                        </CardTitle>
                                        <CardDescription>
                                            {locale === 'ko' 
                                                ? '전체 JSON 구조를 보고 편집할 수 있습니다'
                                                : 'View and edit the complete JSON structure'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={JSON.stringify(translations, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setEditedTranslations(parsed);
                                                } catch (err) {
                                                    // Invalid JSON, ignore
                                                }
                                            }}
                                            rows={20}
                                            className="font-mono text-sm"
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Save Button at Bottom */}
                        {hasChanges && (
                            <div className="sticky bottom-0 bg-background border-t p-4 mt-6 flex justify-end gap-2 shadow-lg">
                                <Button variant="outline" onClick={() => setEditedTranslations({})}>
                                    {locale === 'ko' ? '취소' : 'Cancel'}
                                </Button>
                                <Button onClick={handleSave} className="bg-primary">
                                    <Save className="w-4 h-4 mr-2" />
                                    {locale === 'ko' ? '변경사항 저장' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
