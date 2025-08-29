# Middleware Directory

This directory contains Next.js middleware for request/response processing.

## Next.js Middleware

Create `middleware.ts` or `middleware.js` in the root of your project (not in this folder) for Next.js edge middleware.

## Example Middleware Functions

### Authentication Middleware
```javascript
// middleware.js (in project root)
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for auth token
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

### API Route Middleware
For API routes, use this directory to store middleware functions:

```javascript
// middleware/auth.js
export const withAuth = (handler) => async (req, res) => {
  // Verify token
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Continue to handler
  return handler(req, res);
};
```