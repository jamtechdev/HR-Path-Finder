import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Building2, FileText } from 'lucide-react';

export default function CEODashboard({ companies, pendingApprovals, completedProjects, stats }) {
    return (
        <>
            <Head title="CEO Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold mb-8">CEO Dashboard</h1>
                            
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Companies</CardTitle>
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total_companies}</div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-600">{stats.pending_approvals}</div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{stats.completed_projects}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Pending Approvals */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Pending Approvals</span>
                                        <Link href="/dashboard/ceo/approvals">
                                            <Button variant="outline" size="sm">View All</Button>
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pendingApprovals.length > 0 ? (
                                        <div className="space-y-4">
                                            {pendingApprovals.slice(0, 5).map((project) => (
                                                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div>
                                                        <h3 className="font-semibold">{project.company.name}</h3>
                                                        <p className="text-sm text-gray-600">HR System Implementation</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="secondary">Pending Approval</Badge>
                                                        <Link href={`/hr-projects/${project.id}/ceo-approval`}>
                                                            <Button size="sm">Review</Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No pending approvals</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Companies */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Companies</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {companies.map((company) => (
                                            <div key={company.id} className="p-4 border rounded-lg">
                                                <h3 className="font-semibold">{company.name}</h3>
                                                <p className="text-sm text-gray-600">{company.industry}</p>
                                                <Badge variant="outline" className="mt-2">CEO</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}