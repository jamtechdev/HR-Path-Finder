import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import type { Company } from '@/types/dashboard';

interface CompanyInfoCardProps {
    company: Company | null;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
    if (!company) {
        return null;
    }

    return (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{company.name}</h2>
                        <p className="text-muted-foreground">
                            {company.industry && company.hq_location
                                ? `${company.industry} • ${company.hq_location}`
                                : company.industry || company.hq_location || 'Company Information'
                            }
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
