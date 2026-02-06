import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Building2, Eye, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    project: {
        id: number;
        current_step: string;
        company?: {
            id: number;
            name?: string;
            industry?: string;
            hr_issues?: Array<{
                id: number;
                issue_type: string;
                is_custom: boolean;
                description?: string | null;
            }>;
        };
        ceo_philosophy?: {
            responses?: Record<string, any>;
            main_trait?: string;
            sub_trait?: string;
            completed_at?: string | null;
        };
    };
    allowCompanyReview?: boolean;
}

// Management Philosophy - 24 Likert items (will be shuffled)
const managementPhilosophyItems = [
    { id: 'mp1', text: 'Even if wage gaps widen, differential compensation based on performance is more important than internal equity.', category: 'performance' },
    { id: 'mp2', text: 'Achieving final results is more important than the completeness of the work process.', category: 'performance' },
    { id: 'mp3', text: 'Even if administrative burdens increase, performance reviews must be conducted regularly and thoroughly.', category: 'performance' },
    { id: 'mp4', text: 'Systematic internal and external training should precede immediate deployment to practical tasks upon hiring, as it is more effective.', category: 'learning' },
    { id: 'mp5', text: 'Hiring trained external talent is more effective than developing internal personnel.', category: 'learning' },
    { id: 'mp6', text: 'Even if short-term performance declines slightly, active investment in employee training and organizational learning is necessary.', category: 'learning' },
    { id: 'mp7', text: 'Members who present new ideas and opinions should be preferred, even if results do not appear immediately.', category: 'innovation' },
    { id: 'mp8', text: 'New attempts should be encouraged, even if a certain level of failure costs occur.', category: 'innovation' },
    { id: 'mp9', text: 'New approaches and attempts are often more important than proven methods.', category: 'innovation' },
    { id: 'mp10', text: 'Overall, how much employee evaluation and compensation criteria contribute to customer satisfaction is the core of our organization.', category: 'customer' },
    { id: 'mp11', text: 'To understand customer and market trends, it is necessary to actively utilize external reports, even if they are expensive.', category: 'customer' },
    { id: 'mp12', text: 'The role of a dedicated organization to confirm customer satisfaction and respond is decisive for our company\'s business performance.', category: 'customer' },
    { id: 'mp13', text: 'Long-term loyalty to the organization is prioritized over an individual\'s outstanding capabilities.', category: 'stability' },
    { id: 'mp14', text: 'Stable operations should take precedence over aggressive growth.', category: 'stability' },
    { id: 'mp15', text: 'Even in difficult times, protecting employees should take precedence over short-term profits.', category: 'stability' },
    { id: 'mp16', text: 'Budget management for cost control is necessary, even if administrative burdens increase.', category: 'efficiency' },
    { id: 'mp17', text: 'The effectiveness of each cost must be measured, even if it requires using external services.', category: 'efficiency' },
    { id: 'mp18', text: 'New hires are not necessary. Experienced hires can be made when needed.', category: 'efficiency' },
    { id: 'mp19', text: 'Teamwork across the organization is more important than an individual\'s outstanding abilities.', category: 'cooperation' },
    { id: 'mp20', text: 'Maintaining a harmonious internal environment is more important than winning external competition.', category: 'cooperation' },
    { id: 'mp21', text: 'Sufficient consensus among members is more important than the speed of decision-making.', category: 'cooperation' },
    { id: 'mp22', text: 'Adhering to rules and principles is more important than achieving short-term business goals.', category: 'compliance' },
    { id: 'mp23', text: 'Long-term corporate reputation in the industry is more important than short-term profits.', category: 'compliance' },
    { id: 'mp24', text: 'Ethical management is more important for long-term success than expanding market share.', category: 'compliance' },
];

// Shuffle items for display (without category labels) - use a stable seed based on project ID
// This ensures consistent ordering across page reloads
const getShuffledPhilosophyItems = (seed: number = 0) => {
    const items = [...managementPhilosophyItems];
    // Use a seeded random function for consistent shuffling
    let currentSeed = seed || 12345; // Default seed if project ID is 0
    const seededRandom = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };
    // Fisher-Yates shuffle with seeded random
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
};

// Vision/Mission Questions
const visionMissionQuestions = [
    { id: 'vm1', question: 'From a business perspective, which time point—3 years, 5 years, or 10 years from now—do you set as the benchmark for company growth?', type: 'select', options: ['3 years', '5 years', '10 years'] },
    { id: 'vm2', question: 'At that time point, what is the ideal revenue scale for our company? (Billions of KRW)', type: 'number' },
    { id: 'vm3', question: 'Is there a specific area where you want us to become No.1 compared to competitors?', type: 'text' },
    { id: 'vm4', question: 'When leading the entire organization, do you place more emphasis on realistic goals or ideal goals?', type: 'select', options: ['Realistic', 'Ideal'] },
    { id: 'vm5', question: 'What is the one keyword you want customers to associate with us first when they think of us?', type: 'text' },
    { id: 'vm6', question: 'What is the most important value our company wants to contribute to society or the industry?', type: 'text' },
    { id: 'vm7', question: 'If there are 3 numerical indicators (revenue, market share, MAU, etc.) to judge whether the vision', type: 'text' },
    { id: 'vm8', question: 'If our company disappeared, what is the biggest value that would be lost in the customer or market?', type: 'text' },
    { id: 'vm9', question: 'If you were to express the most important core value in our main business with one word?', type: 'text' },
    { id: 'vm10', question: 'What is the mindset of a member that best fits our organizational culture?', type: 'text' },
    { id: 'vm11', question: 'If there is a characteristic of a member who is difficult to stay with long-term no matter how good their performance is, what is it?', type: 'text' },
];

// Growth Stage Options
const growthStageOptions = [
    { value: 'foundation', label: 'Foundation Building Phase', description: 'Actively building workforce and organization, but revenue structure is not yet stable.' },
    { value: 'growth', label: 'Growth Acceleration Phase', description: 'Revenue or customers are rapidly increasing, and issues related to organizational contribution, compensation, and roles emerge.' },
    { value: 'stable', label: 'Stable Expansion Phase', description: 'Growth momentum has slowed, but the organization is expanding and roles/responsibilities are being clarified.' },
    { value: 'profit', label: 'Profit Optimization Phase', description: 'Performance growth is stagnant or limited, focusing on operational efficiency and cost management rather than revenue expansion.' },
    { value: 'restructuring', label: 'Business Restructuring Phase', description: 'Market size is shrinking or competitiveness is weakening, reviewing business structure adjustment or workforce adjustment.' },
];

// Leadership Scenarios
const leadershipScenarios = [
    {
        id: 'lead1',
        question: 'Subordinates of a specific manager are resigning one after another this year.',
        optionA: 'Prioritize reviewing the manager\'s leadership style and organizational management responsibility, and re-evaluate their suitability for the managerial role regardless of short-term performance.',
        optionB: 'If the organization\'s quantitative performance is clearly maintained, view it as the manager\'s personal style and continue operations by recruiting replacements.',
    },
    {
        id: 'lead2',
        question: 'Operational errors by practitioners in a specific team are continuously occurring.',
        optionA: 'Before addressing the practitioners\' issues, check for deficiencies in work standards, training, and management systems, and consider the manager\'s management responsibility as well.',
        optionB: 'Judge it as a competency/attitude issue of the practitioners, and it is desirable to stabilize quickly through replacement or additional hiring.',
    },
    {
        id: 'lead3',
        question: 'Decision-making is delayed as team discussions on important matters drag on.',
        optionA: 'Sufficient discussion and consensus processes are necessary, but if delays repeat, the leader must clearly make the final decision.',
        optionB: 'Consensus and agreement among members are more important than decision speed, and a certain level of delay can be tolerated.',
    },
    {
        id: 'lead4',
        question: 'Field confusion is recurring, negatively impacting performance.',
        optionA: 'The manager\'s direct intervention is an inevitable temporary measure, but fundamentally, clarifying roles, responsibilities, and work standards is the leader\'s role.',
        optionB: 'The manager directly monitoring and intervening is an important role of leadership responsible for organizational performance.',
    },
    {
        id: 'lead5',
        question: 'There is a leader with outstanding performance but who frequently deviates from organizational norms and often expresses dissatisfaction.',
        optionA: 'Organizational standards and stability take precedence over performance, and clear adjustment is needed if it negatively impacts the organization long-term.',
        optionB: 'If they significantly contribute to organizational performance, a certain level of deviation from standards can be realistically tolerated.',
    },
];

// General Questions
const generalQuestions = [
    { id: 'gen1', question: 'Manager Role Perception', optionA: 'Practical Expert', optionB: 'Organization/Member Coordinator' },
    { id: 'gen2', question: 'Source of Performance', optionA: 'Key Talents', optionB: 'Systems within the Organization' },
    { id: 'gen3', question: 'Standards and Discretion', optionA: 'Manager\'s Judgment and Discretion', optionB: 'Clear Standards and Processes' },
    { id: 'gen4', question: 'Job Value', optionA: 'There are differentials in objective internal job values.', optionB: 'Ultimately, all jobs are equally important for business progression.' },
    { id: 'gen5', question: 'Decision-Making', optionA: 'Fast Speed, Individual Responsibility', optionB: 'Consensus First, Organizational Responsibility' },
    { id: 'gen6', question: 'Sharing Management Information with Members', optionA: 'Necessary Scope, Selective Sharing', optionB: 'As Transparent Sharing as Possible' },
    { id: 'gen7', question: 'Policy Application', optionA: 'Flexible, Customized', optionB: 'Consistent, Equitable' },
];

// HR Issues Categories
const hrIssueCategories = [
    { category: 'Recruitment / Retention', issues: ['Overall hiring cost is high (including headcount expense)', 'Difficulty hiring in compensation discussion'] },
    { category: 'Organizations', issues: ['R&R is not clearly defined', 'Organizational structure is vulnerable to change'] },
    { category: 'Culture / Leadership', issues: ['Weak employee engagement', 'Some managers lack leadership capability', 'Excessive competition or conflict between teams'] },
    { category: 'Evaluation / Compensation', issues: ['Weak performance-based compensation system'] },
    { category: 'Upskilling', issues: ['Low employee motivation for learning and development'] },
    { category: 'Others', issues: ['Slow decision-making', 'Organizational rigidity'] },
];

export default function CeoPhilosophy({ project, allowCompanyReview = false }: Props) {
    // #region agent log
    const logEntry1 = {location:'ceo-philosophy.tsx:170',message:'Component render start',data:{projectExists:!!project,projectId:project?.id,projectData:project?JSON.stringify(project).substring(0,200):'null',allowCompanyReview},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'};
    console.log('DEBUG [A] Component render:', logEntry1);
    fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry1)}).catch((e)=>console.error('Log fetch failed:',e));
    // #endregion
    
    // Use defaults if project is not provided
    const projectId = project?.id || 0;
    const savedResponses = project?.ceo_philosophy?.responses || {};
    const [currentSection, setCurrentSection] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>(savedResponses);
    const [isSaving, setIsSaving] = useState(false);
    
    // #region agent log
    console.log('DEBUG [B] Before getShuffledPhilosophyItems:', {projectId});
    // #endregion
    
    // Get shuffled items once based on project ID for consistency
    let shuffledPhilosophyItems;
    try {
        shuffledPhilosophyItems = getShuffledPhilosophyItems(projectId);
        // #region agent log
        console.log('DEBUG [B] After getShuffledPhilosophyItems:', {shuffledItemsCount: shuffledPhilosophyItems?.length});
        // #endregion
    } catch (error) {
        console.error('DEBUG [B] Error in getShuffledPhilosophyItems:', error);
        shuffledPhilosophyItems = [];
    }
    
    // #region agent log
    const logData = {location:'ceo-philosophy.tsx:200',message:'State initialized',data:{projectId:projectId,shuffledItemsCount:shuffledPhilosophyItems?.length,currentSection,savedResponsesCount:Object.keys(savedResponses).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'};
    console.log('DEBUG [B] State initialized:', logData);
    fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch((e)=>console.error('Log fetch failed:',e));
    // #endregion

    // Initialize responses for leadership sliders if not present
    useEffect(() => {
        const newResponses = { ...responses };
        leadershipScenarios.forEach(scenario => {
            if (!newResponses[scenario.id]) {
                newResponses[scenario.id] = [50]; // Default to middle (50%)
            }
        });
        setResponses(newResponses);
    }, []);

    const { data, setData, put, post, processing } = useForm({
        responses: responses,
        main_trait: project?.ceo_philosophy?.main_trait || '',
        sub_trait: project?.ceo_philosophy?.sub_trait || '',
    });

    // Calculate sections with shuffled items - ensure shuffledPhilosophyItems is valid
    const sections = [
        { id: 0, title: 'Before you begin', type: 'info' },
        { id: 1, title: 'Management Philosophy', type: 'likert', count: shuffledPhilosophyItems?.length || 0 },
        { id: 2, title: 'Vision/Mission/Ideal Talent Type', type: 'vision', count: visionMissionQuestions?.length || 0 },
        { id: 3, title: 'Growth Stage', type: 'growth', count: 1 },
        { id: 4, title: 'Leadership', type: 'leadership', count: leadershipScenarios?.length || 0 },
        { id: 5, title: 'General Questions', type: 'general', count: generalQuestions?.length || 0 },
        { id: 6, title: 'Issues', type: 'issues', count: 1 },
        { id: 7, title: 'CEO\'s Concerns', type: 'concerns', count: 1 },
    ];
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ceo-philosophy.tsx:230',message:'Sections array created',data:{sectionsCount:sections.length,sections:sections.map(s=>({id:s.id,type:s.type,count:s.count})),shuffledItemsCount:shuffledPhilosophyItems?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Calculate total questions for progress
    const totalQuestions = (shuffledPhilosophyItems?.length || 0) + (visionMissionQuestions?.length || 0) + 1 + (leadershipScenarios?.length || 0) + (generalQuestions?.length || 0) + 1 + 1;
    const answeredQuestions = Object.keys(responses).filter(key => {
        const value = responses[key];
        if (Array.isArray(value)) return value[0] !== undefined && value[0] !== null;
        return value !== undefined && value !== null && value !== '';
    }).length;
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;

    // Auto-save when response changes
    useEffect(() => {
        if (Object.keys(responses).length > 0 && !isSaving) {
            const saveTimeout = setTimeout(() => {
                saveProgress();
            }, 2000); // Debounce auto-save

            return () => clearTimeout(saveTimeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [responses]);

    const handleResponseChange = (key: string, value: any) => {
        const newResponses = { ...responses, [key]: value };
        setResponses(newResponses);
        setData('responses', newResponses);
    };

    const saveProgress = async () => {
        if (Object.keys(responses).length === 0) return;
        
        setIsSaving(true);
        setData('responses', responses);
        put(`/ceo/hr-projects/${projectId}/ceo-philosophy`, {
            preserveScroll: true,
            only: ['project'],
            onSuccess: () => {
                setIsSaving(false);
            },
            onError: () => {
                setIsSaving(false);
            },
        });
    };

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
            saveProgress();
        }
    };

    const handleBack = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('responses', responses);
        post(`/ceo/hr-projects/${projectId}/ceo-philosophy/submit`, {
                preserveScroll: true,
                onSuccess: () => {
                // Redirect will be handled by the controller
                },
            });
    };

    const isCompleted = project?.ceo_philosophy?.completed_at !== null && project?.ceo_philosophy?.completed_at !== undefined;
    const currentSectionData = sections[currentSection] || sections[0]; // Fallback to first section
    const isLastSection = currentSection === sections.length - 1;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ceo-philosophy.tsx:300',message:'Render state check',data:{isCompleted,currentSection,sectionsLength:sections.length,currentSectionData:currentSectionData?{id:currentSectionData.id,type:currentSectionData.type}:null,isLastSection},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Safety check - ensure currentSection is valid
    useEffect(() => {
        if (currentSection >= sections.length) {
            setCurrentSection(0);
        }
    }, [currentSection, sections.length]);

    // Get HR issues from project (with defaults)
    const hrIssues = project?.company?.hr_issues || [];
    const allHrIssues = Array.isArray(hrIssues) ? hrIssues.map((issue: any) => issue?.issue_type).filter(Boolean) : [];

    const renderSection = () => {
        // #region agent log
        const logData = {location:'ceo-philosophy.tsx:315',message:'renderSection called',data:{currentSectionData:currentSectionData?{id:currentSectionData.id,type:currentSectionData.type}:null,hasType:!!currentSectionData?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
        console.log('DEBUG [D] renderSection:', logData);
        fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch((e)=>console.error('Log fetch failed:',e));
        // #endregion
        
        if (!currentSectionData || !currentSectionData.type) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ceo-philosophy.tsx:317',message:'Section data missing',data:{currentSectionData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return (
                <Card className="shadow-lg">
                    <CardContent className="p-8">
                        <Alert>
                            <AlertDescription>
                                Section not found. Please refresh the page.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            );
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ceo-philosophy.tsx:330',message:'Entering switch statement',data:{sectionType:currentSectionData.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        switch (currentSectionData.type) {
            case 'info':
                // #region agent log
                console.log('DEBUG [D] Rendering info section');
                fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ceo-philosophy.tsx:331',message:'Rendering info section',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch((e)=>console.error('Log fetch failed:',e));
                // #endregion
                return (
                    <Card className="shadow-lg">
                        <CardContent className="p-8 md:p-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Info className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold">Before you begin</h2>
                                </div>
                                <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
                                    <p>This diagnostic is not an evaluation of your leadership or performance.</p>
                                    <p>There are no right or wrong answers.</p>
                                    <p>This assessment is designed to understand your current management priorities and decision-making perspective, based on your responses at this point in time.</p>
                                    <div className="mt-6 space-y-3">
                                        <p className="font-semibold text-foreground">Please note the following:</p>
                                        <ul className="list-disc list-inside space-y-2 ml-4">
                                            <li>Your individual responses will not be shared as-is with the HR manager or any other employees.</li>
                                            <li>No one will be able to view your original answers to individual questions.</li>
                                            <li>Results will be used only after being aggregated, interpreted, and anonymized into summary insights.</li>
                                            <li>Any comparison with HR input is intended to understand differences in perspective, not to judge or evaluate individuals.</li>
                                            <li>For the most meaningful outcome, please answer honestly and instinctively, based on what you consider most important right now, rather than what may appear ideal or socially desirable.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'likert':
                if (!shuffledPhilosophyItems || shuffledPhilosophyItems.length === 0) {
                    return (
                        <Card className="shadow-lg">
                            <CardContent className="p-8">
                                <Alert>
                                    <AlertDescription>
                                        Survey questions are loading. Please refresh the page.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    );
                }
                return (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Management Philosophy</CardTitle>
                            <CardDescription>
                                This section explores your core management beliefs and decision-making principles to understand how your organization is fundamentally operated.
                            </CardDescription>
                            <CardDescription className="text-xs mt-2">
                                Please rate each statement on a scale of 1 (Strongly Disagree) to 7 (Strongly Agree)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {shuffledPhilosophyItems.map((item, index) => (
                                <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                                    <Label className="text-sm font-medium">{index + 1}. {item.text}</Label>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-muted-foreground w-20">Strongly Disagree</span>
                                        <div className="flex-1 flex items-center gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                                                <label key={value} className="flex flex-col items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={item.id}
                                                        value={value}
                                                        checked={responses[item.id] === value}
                                                        onChange={(e) => handleResponseChange(item.id, parseInt(e.target.value))}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-xs mt-1">{value}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground w-20 text-right">Strongly Agree</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'vision':
                return (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Vision/Mission/Ideal Talent Type</CardTitle>
                            <CardDescription>
                                This section clarifies the future direction of your company and the type of talent needed to achieve that vision.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {visionMissionQuestions.map((q, index) => (
                                <div key={q.id} className="space-y-2">
                                    <Label className="text-sm font-medium">{index + 1}. {q.question}</Label>
                                    {q.type === 'select' ? (
                                        <Select
                                            value={responses[q.id] || ''}
                                            onValueChange={(value) => handleResponseChange(q.id, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {q.options?.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : q.type === 'number' ? (
                                        <Input
                                            type="number"
                                            value={responses[q.id] || ''}
                                            onChange={(e) => handleResponseChange(q.id, e.target.value)}
                                            placeholder="Enter number"
                                        />
                                    ) : (
                                        <Input
                                            type="text"
                                            value={responses[q.id] || ''}
                                            onChange={(e) => handleResponseChange(q.id, e.target.value)}
                                            placeholder="Enter your answer"
                                        />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'growth':
                return (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Growth Stage</CardTitle>
                            <CardDescription>
                                This section identifies your company's current growth phase to align organizational structure and people strategy with business maturity.
                            </CardDescription>
                            <CardDescription className="text-xs mt-2">
                                Choose the most similar stage even if it doesn't match perfectly
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={responses['growth_stage'] || ''}
                                onValueChange={(value) => handleResponseChange('growth_stage', value)}
                            >
                                {growthStageOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border">
                                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                                        <div className="flex-1">
                                            <Label htmlFor={option.value} className="font-semibold cursor-pointer">
                                                {option.label}
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                );

            case 'leadership':
                return (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Leadership</CardTitle>
                            <CardDescription>
                                This section examines leadership style and management practices to assess how leadership impacts execution and organizational culture.
                            </CardDescription>
                            <CardDescription className="text-xs mt-2">
                                Use the slider to indicate your preference between the two options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {leadershipScenarios.map((scenario, index) => {
                                const sliderValue = responses[scenario.id]?.[0] || 50;
                                return (
                                    <div key={scenario.id} className="space-y-4 p-4 border rounded-lg">
                                        <Label className="text-sm font-medium">{index + 1}. {scenario.question}</Label>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className={`p-3 rounded border ${sliderValue < 50 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                                <p className="text-xs text-muted-foreground mb-1">Option A</p>
                                                <p className="text-sm">{scenario.optionA}</p>
                                            </div>
                                            <div className={`p-3 rounded border ${sliderValue > 50 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                                <p className="text-xs text-muted-foreground mb-1">Option B</p>
                                                <p className="text-sm">{scenario.optionB}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Option A</span>
                                                <span>Option B</span>
                                            </div>
                                            <Slider
                                                value={[sliderValue]}
                                                onValueChange={(value) => handleResponseChange(scenario.id, value)}
                                                min={0}
                                                max={100}
                                                step={1}
                                                className="w-full"
                                            />
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>0%</span>
                                                <span className="font-medium">{sliderValue}%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                );

            case 'general':
                return (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>General Questions</CardTitle>
                            <CardDescription>
                                This section gathers overall operational context to support a balanced and accurate interpretation of your responses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {generalQuestions.map((q, index) => (
                                <div key={q.id} className="space-y-3 p-4 border rounded-lg">
                                    <Label className="text-sm font-medium">{index + 1}. {q.question}</Label>
                                    <RadioGroup
                                        value={responses[q.id] || ''}
                                        onValueChange={(value) => handleResponseChange(q.id, value)}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-start space-x-3 p-3 rounded border cursor-pointer hover:bg-muted/50" onClick={() => handleResponseChange(q.id, 'A')}>
                                            <RadioGroupItem value="A" id={`${q.id}-A`} />
                                            <Label htmlFor={`${q.id}-A`} className="font-normal cursor-pointer flex-1">
                                                {q.optionA}
                                            </Label>
                                        </div>
                                        <div className="flex items-start space-x-3 p-3 rounded border cursor-pointer hover:bg-muted/50" onClick={() => handleResponseChange(q.id, 'B')}>
                                            <RadioGroupItem value="B" id={`${q.id}-B`} />
                                            <Label htmlFor={`${q.id}-B`} className="font-normal cursor-pointer flex-1">
                                                {q.optionB}
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'issues':
                return (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Issues</CardTitle>
                            <CardDescription>
                                These issues have been identified by your HR manager as key challenges currently facing the company.
                                Please select the issues that you also agree are relevant from your perspective as CEO.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {hrIssueCategories.map((category) => (
                                <div key={category.category} className="space-y-3">
                                    <h3 className="font-semibold text-sm">{category.category}</h3>
                                    <div className="space-y-2 ml-4">
                                        {category.issues.map((issue) => {
                                            const isChecked = responses['hr_issues']?.includes(issue) || false;
                                            return (
                                                <div key={issue} className="flex items-start space-x-3">
                                                    <Checkbox
                                                        id={`issue-${issue}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const currentIssues = responses['hr_issues'] || [];
                                                            if (checked) {
                                                                handleResponseChange('hr_issues', [...currentIssues, issue]);
                                                            } else {
                                                                handleResponseChange('hr_issues', currentIssues.filter((i: string) => i !== issue));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`issue-${issue}`} className="font-normal cursor-pointer text-sm">
                                                        {issue}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {/* Also include HR manager identified issues */}
                            {allHrIssues.length > 0 && (
                                <div className="space-y-3 mt-6 pt-6 border-t">
                                    <h3 className="font-semibold text-sm">HR Manager Identified Issues</h3>
                                    <div className="space-y-2 ml-4">
                                        {allHrIssues.map((issue) => {
                                            const isChecked = responses['hr_issues']?.includes(issue) || false;
                                            return (
                                                <div key={issue} className="flex items-start space-x-3">
                                                    <Checkbox
                                                        id={`issue-${issue}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const currentIssues = responses['hr_issues'] || [];
                                                            if (checked) {
                                                                handleResponseChange('hr_issues', [...currentIssues, issue]);
                                                            } else {
                                                                handleResponseChange('hr_issues', currentIssues.filter((i: string) => i !== issue));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`issue-${issue}`} className="font-normal cursor-pointer text-sm">
                                                        {issue}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'concerns':
                return (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>CEO's Concerns</CardTitle>
                            <CardDescription>
                                This section captures the key concerns and priorities you currently have as CEO, providing direct input for defining practical focus areas and next steps.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>What is the biggest people or organizational challenge you are currently facing?</Label>
                                <Textarea
                                    value={responses['ceo_concerns'] || ''}
                                    onChange={(e) => handleResponseChange('ceo_concerns', e.target.value)}
                                    placeholder="Please describe your concerns..."
                                    rows={8}
                                    className="w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return (
                    <Card className="shadow-lg">
                        <CardContent className="p-8">
                            <Alert>
                                <AlertDescription>
                                    Unknown section type: {currentSectionData?.type || 'undefined'}. Please refresh the page.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                );
        }
    };

    // #region agent log
    console.log('DEBUG [E] About to render JSX:', {projectId, sectionsLength: sections?.length, currentSection, isCompleted, shuffledItemsCount: shuffledPhilosophyItems?.length});
    // #endregion
    
    // Early return if critical data is missing
    if (!sections || sections.length === 0) {
        console.error('DEBUG [E] Sections array is empty or undefined!', {sections});
        return (
            <SidebarProvider defaultOpen={true}>
                <Sidebar collapsible="icon" variant="sidebar">
                    <RoleBasedSidebar />
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-auto p-8">
                        <div className="max-w-4xl mx-auto">
                            <Card>
                                <CardContent className="p-8">
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            Error: Survey sections not loaded. Please refresh the page.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
            <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                <Head title="Management Philosophy Survey" />
                
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit('/ceo/dashboard')}
                                    className="cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Return to Dashboard
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
                                    Management Philosophy Survey
                                </h1>
                                {isCompleted ? (
                                    <Badge className="bg-green-500 text-white px-3 py-1">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Complete
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="px-3 py-1">
                                        In Progress
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm md:text-base">
                                {isCompleted ? 'Your survey has been submitted' : 'Define your leadership style and organizational values'}
                            </p>
                        </div>

                        {/* Company Info Review Alert */}
                            {!isCompleted && allowCompanyReview && project?.company && (
                            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <span className="text-sm text-blue-900 dark:text-blue-100">
                                        Before completing the survey, you can review and modify the company information provided by the HR Manager.
                                    </span>
                                        <Link href={`/companies/${project?.company?.id || 1}`} className="flex-shrink-0">
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                            <Eye className="w-4 h-4 mr-2" />
                                            Review Company Info
                                        </Button>
                                    </Link>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Survey Form or Completion Card */}
                        {/* #region agent log */}
                        {(() => {
                            const logData = {location:'ceo-philosophy.tsx:720',message:'Rendering main content',data:{isCompleted,currentSection,sectionsLength:sections.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
                            console.log('DEBUG [E] Main render:', logData);
                            fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch((e)=>console.error('Log fetch failed:',e));
                            return null;
                        })()}
                        {/* #endregion */}
                        {isCompleted ? (
                            <Card className="shadow-lg border-2">
                                <CardContent className="p-8 md:p-12">
                                    <div className="text-center space-y-6">
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                                Survey Complete
                                            </h2>
                                            <p className="text-muted-foreground text-sm md:text-base">
                                                Your management philosophy has been analyzed and will guide the HR system design.
                                            </p>
                                        </div>
                                        <div className="pt-6">
                                            <Button
                                                onClick={() => router.visit('/ceo/dashboard')}
                                                size="lg"
                                                className="w-full sm:w-auto min-w-[200px]"
                                            >
                                                Return to Dashboard
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                    {/* #region agent log */}
                                    {(() => {
                                        fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ceo-philosophy.tsx:730',message:'Rendering survey form',data:{currentSection,currentSectionData:currentSectionData?{id:currentSectionData.id,type:currentSectionData.type}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                                        return null;
                                    })()}
                                    {/* #endregion */}
                                {/* Progress Card */}
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                        Section {currentSection + 1} of {sections.length}: {currentSectionData.title}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {Math.round(progressPercentage)}% Complete
                                            </span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                    </CardContent>
                                </Card>

                                    {/* Section Content */}
                                    {/* #region agent log */}
                                    {(() => {
                                        const sectionResult = renderSection();
                                        fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ceo-philosophy.tsx:750',message:'renderSection result',data:{hasResult:!!sectionResult,resultType:sectionResult?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                                        return null;
                                    })()}
                                    {/* #endregion */}
                                    {renderSection()}

                                            {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between pt-6">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleBack}
                                            disabled={currentSection === 0 || processing}
                                                    className="cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                                    Back
                                                </Button>
                                                
                                                {isSaving && (
                                                    <span className="text-sm text-muted-foreground">Saving...</span>
                                                )}

                                        {isLastSection ? (
                                                    <form onSubmit={handleFinalSubmit} className="inline">
                                                        <Button
                                                            type="submit"
                                                    disabled={processing}
                                                            className="cursor-pointer"
                                                        >
                                                    {processing ? 'Submitting...' : 'Submit Survey'}
                                                            <CheckCircle2 className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={handleNext}
                                                disabled={processing}
                                                        className="cursor-pointer"
                                                    >
                                                Next Section
                                                        <ChevronRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                )}
                                            </div>

                                    {/* Section Progress */}
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        {sections.map((section, index) => (
                                        <button
                                                key={section.id}
                                            type="button"
                                            onClick={() => {
                                                    if (index <= currentSection || index === 0) {
                                                        setCurrentSection(index);
                                                    }
                                                }}
                                                className={`px-3 py-1 rounded text-xs transition-all ${
                                                    index === currentSection
                                                        ? 'bg-primary text-primary-foreground'
                                                        : index < currentSection
                                                        ? 'bg-primary/50 text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                } ${index <= currentSection || index === 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                                aria-label={`Section ${index + 1}: ${section.title}`}
                                            >
                                                {index + 1}. {section.title}
                                            </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
