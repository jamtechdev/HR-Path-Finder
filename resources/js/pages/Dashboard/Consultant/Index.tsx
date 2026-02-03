import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, Building2 } from 'lucide-react';

export default function ConsultantDashboard({ assignedProjects, completedReviews, stats }) {
    return (
        <>
            <Head title="Consultant Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold mb-8">Consultant Dashboard</h1>
                            
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-600">{stats.pending_reviews}</div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{stats.completed_reviews}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Assigned Projects */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Projects Awaiting Review</span>
                                        <Link href="/dashboard/consultant/reviews">
                                            <Button variant="outline" size="sm">View All</Button>
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {assignedProjects.length > 0 ? (
                                        <div className="space-y-4">
                                            {assignedProjects.slice(0, 5).map((project) => (
                                                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <Building2 className="h-8 w-8 text-gray-400" />
                                                        <div>
                                                            <h3 className="font-semibold">{project.company.name}</h3>
                                                            <p className="text-sm text-gray-600">HR System Implementation</p>
                                                            <p className="text-xs text-gray-500">
                                                                Submitted: {new Date(project.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="secondary">Pending Review</Badge>
                                                        <Link href={`/hr-projects/${project.id}/consultant-review`}>
                                                            <Button size="sm">
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Review
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No projects awaiting review</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Completed Reviews */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Completed Reviews</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {completedReviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {completedReviews.map((review) => (
                                                <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                                        <div>
                                                            <h3 className="font-semibold">{review.hr_project.company.name}</h3>
                                                            <p className="text-sm text-gray-600">
                                                                Rating: {review.overall_rating}/10
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Completed: {new Date(review.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-green-600">Completed</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No completed reviews yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}