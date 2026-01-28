import { usePage } from '@inertiajs/react';
import HRManagerSidebar from './HRManagerSidebar';
import CEOSidebar from './CEOSidebar';
import ConsultantSidebar from './ConsultantSidebar';

interface User {
    id: number;
    name: string;
    email: string;
    roles?: Array<{ name: string }>;
}

interface PageProps {
    auth: {
        user: User;
    };
}

export default function RoleBasedSidebar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    
    // Check user roles
    const hasRole = (roleName: string) => {
        return user?.roles?.some(role => role.name === roleName) || false;
    };
    
    // Return appropriate sidebar based on role
    if (hasRole('ceo')) {
        return <CEOSidebar />;
    } else if (hasRole('hr_manager')) {
        return <HRManagerSidebar />;
    } else if (hasRole('consultant')) {
        return <ConsultantSidebar />;
    }
    
    // Default to HR Manager sidebar if no role found
    return <HRManagerSidebar />;
}