import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    
    // --- 1. MUAPI ROUTING (Let the app talk to the AI freely) ---
    const isMuApi = url.pathname.startsWith('/api/workflow') || 
                    url.pathname.startsWith('/api/app') || 
                    url.pathname.startsWith('/api/v1');

    if (isMuApi) {
        // Send requests directly to MuAPI without asking for the team password again
        if (url.pathname.startsWith('/api/v1')) {
            const targetUrl = new URL(url.pathname + url.search, 'https://api.muapi.ai');
            return NextResponse.rewrite(targetUrl);
        }
        return NextResponse.next();
    }

    // --- 2. SECURITY (Only protect the visual website pages) ---
    const basicAuth = request.headers.get('authorization');
    let isAuthenticated = false;

    // Verify the password only if it's a standard web browser request
    if (basicAuth && basicAuth.startsWith('Basic ')) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        if (user === process.env.TEAM_USERNAME && pwd === process.env.TEAM_PASSWORD) {
            isAuthenticated = true;
        }
    }

    if (!isAuthenticated) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Private Team Portal"' },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};