'use server';

import {
    createAdminSession, destroyAdminSession, verifyAdminCredentials, verifyAdminMfa,
} from '@/lib/serverAuth';

/**
 * Server action to authenticate the administrator and set a secure session cookie.
 */
export async function loginAdmin(username?: string, password?: string, mfaToken?: string) {
    if (username && password) {
        const admin = await verifyAdminCredentials(username, password);
        if (admin && await verifyAdminMfa(admin, mfaToken)) {
            await createAdminSession(admin);
            return { success: true };
        }
    }

    return { success: false, error: 'Incorrect password' };
}

/**
 * Server action to clear the administrator session cookie.
 */
export async function logoutAdmin() {
    await destroyAdminSession();
    return { success: true };
}
