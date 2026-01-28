import { Head } from '@inertiajs/react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, HelpCircle } from 'lucide-react';

export default function HRQAndA() {
    const faqItems = [
        {
            question: 'How do I get started with HR system design?',
            answer: 'Start by completing Step 1: Diagnosis. The HR Manager will input company information, and then you\'ll complete the Management Philosophy Survey.',
        },
        {
            question: 'Can I modify company information after it\'s been submitted?',
            answer: 'Yes, as the CEO, you can review and modify company information before completing the Management Philosophy Survey. After the system is locked, changes require consultant approval.',
        },
        {
            question: 'What happens after all steps are completed?',
            answer: 'Once all steps are completed and approved, the HR system will be locked. You can then view the complete HR System Overview Dashboard, generate reports, and review policies.',
        },
        {
            question: 'How are recommendations generated?',
            answer: 'Recommendations are based on your company\'s growth stage, management philosophy, organizational sentiment, and previous step selections. The system uses consultant-defined logic rules.',
        },
        {
            question: 'Can I request changes after CEO approval?',
            answer: 'Yes, you can request changes at any point before the system is locked. After locking, changes require consultant review and approval.',
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="HR Operations Q&A" />

                <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <MessageSquare className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-display font-bold tracking-tight">
                                HR Operations Q&A
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Frequently asked questions about HR system design and operations
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqItems.map((item, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-start gap-2 text-lg">
                                        <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        {item.question}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-muted/50">
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground text-center">
                                Have more questions? Contact your consultant or HR Manager for assistance.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
