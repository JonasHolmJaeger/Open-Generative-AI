import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    
    // 1. DATA ROUTING: Let the app's internal API folders talk to MuAPI freely
    if (url.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // 2. SECURITY: Only protect the visual website pages with the password
    const basicAuth = request.headers.get('authorization');
    let isAuthenticated = false;

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