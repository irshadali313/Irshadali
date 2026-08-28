import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPortfolioApi = pathname.startsWith('/api/portfolio');
    const isAdminRoute = pathname.startsWith('/admin');
    if (isAdminRoute || (isPortfolioApi && request.method !== 'GET')) {
        const isAuthenticated = Boolean(request.cookies.get('admin_session')?.value);

        const isPublicAuthPage =
            pathname === '/admin/login' ||
            pathname.startsWith('/admin/login/') ||
            pathname === '/admin/reset-password' ||
            pathname.startsWith('/admin/reset-password/');
        if (isAdminRoute && isPublicAuthPage) {
            if (isAuthenticated) {
                // If already logged in, redirect to dashboard
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        } else if (!isAuthenticated) {
            if (isPortfolioApi) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        if (isPortfolioApi && request.method !== 'GET') {
            const origin = request.headers.get('origin');
            const host = request.headers.get('host');
            if (!origin || !host || new URL(origin).host !== host) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    // Set header to pass the current pathname to Server Components (like layouts)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: ['/admin', '/admin/:path*', '/api/portfolio/:path*'],
};
