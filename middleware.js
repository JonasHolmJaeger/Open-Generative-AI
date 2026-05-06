import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    
    // --- 1. SECURITY (TEAM PASSWORD) ---
    const basicAuth = request.headers.get('authorization');
    let isAuthenticated = false;

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        // Checks against your secret Vercel environment variables
        if (user === process.env.TEAM_USERNAME && pwd === process.env.TEAM_PASSWORD) {
            isAuthenticated = true;
        }
    }

    // If they don't have the right password, block them immediately
    if (!isAuthenticated) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Private Team Portal"' },
        });
    }

    // --- 2. MUAPI ROUTING (ORIGINAL APP LOGIC) ---
    // If they are logged in, allow the app to talk to MuAPI normally
    const isMuApi = url.pathname.startsWith('/api/workflow') || 
                    url.pathname.startsWith('/api/app') || 
                    url.pathname.startsWith('/api/v1');

    if (isMuApi) {
        if (url.pathname.startsWith('/api/v1')) {
            const targetUrl = new URL(url.pathname + url.search, 'https://api.muapi.ai');
            return NextResponse.rewrite(targetUrl);
        }
    }

    return NextResponse.next();
}

// Match all paths so the password protects the whole site
export const config = {
    matcher: '/:path*',
};