export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

/**
 * Client-side version of role checking
 * Use this in client components with useUser()
 */
export function checkRole(user: any, allowedRoles: UserRole[]): boolean {
    if (!user) return false;
    const role = user.publicMetadata?.role as UserRole || 'STAFF';
    return allowedRoles.includes(role);
}
