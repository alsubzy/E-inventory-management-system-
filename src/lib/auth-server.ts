import { auth } from '@clerk/nextjs/server';
import { UserRole } from './auth';

export async function getUserRole(): Promise<UserRole> {
    const { sessionClaims } = await auth();
    return (sessionClaims?.metadata as { role?: UserRole })?.role || 'STAFF';
}

export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
    const role = await getUserRole();
    return allowedRoles.includes(role);
}
