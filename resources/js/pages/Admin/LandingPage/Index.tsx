import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Languages, Type, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
                                                </div>
                                                {renderTextField('better_company', locale === 'ko' ? 'Better Company 텍스트' : 'Better Company Text', true, 2)}
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
