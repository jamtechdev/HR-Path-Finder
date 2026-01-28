import { Head } from '@inertiajs/react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Building2, FileText } from 'lucide-react';

export default function LaborLawAdvisory() {
    // Mock comparison data - this is UI only per MVP scope
    const lawFirms = [
        {
            id: 1,
            name: 'Legal Advisors Group',
            specialization: 'Employment Law',
            rating: 4.8,
            services: ['HR Compliance', 'Labor Relations', 'Employment Contracts'],
            estimatedCost: '$5,000 - $10,000/month',
        },
        {
            id: 2,
            name: 'Corporate Legal Partners',
            specialization: 'HR & Employment',
            rating: 4.6,
            services: ['Policy Development', 'Compliance Audits', 'Dispute Resolution'],
            estimatedCost: '$4,000 - $8,000/month',
        },
        {
            id: 3,
            name: 'Employment Law Experts',
            specialization: 'Labor & Employment',
            rating: 4.9,
            services: ['HR Consulting', 'Legal Documentation', 'Training Programs'],
            estimatedCost: '$6,000 - $12,000/month',
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Labor Law Firm Advisory" />

                <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Scale className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-display font-bold tracking-tight">
                                Labor Law Firm Advisory
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Compare multiple labor law firms for your HR compliance needs
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 italic">
                            Note: This is a demonstration feature. Contact information and detailed comparisons will be available in future versions.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {lawFirms.map((firm) => (
                            <Card key={firm.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <CardTitle className="text-lg">{firm.name}</CardTitle>
                                        <Badge variant="secondary">{firm.rating}★</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{firm.specialization}</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                            Services
                                        </p>
                                        <ul className="space-y-1">
                                            {firm.services.map((service, index) => (
                                                <li key={index} className="text-sm flex items-center gap-2">
                                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                                    {service}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                                            Estimated Cost
                                        </p>
                                        <p className="text-sm font-medium">{firm.estimatedCost}</p>
                                    </div>
                                    <div className="pt-2">
                                        <button className="w-full text-sm text-primary hover:underline">
                                            View Details (Coming Soon)
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-muted/50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold mb-1">Need Help Choosing?</p>
                                    <p className="text-sm text-muted-foreground">
                                        Contact your consultant for personalized recommendations based on your company's
                                        specific needs and industry requirements.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
