// This file configures the initialization of Sentry on the client side
// Sentry helps with error tracking and performance monitoring

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: false,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Capture 10% of all sessions in production, and 100% in development
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Capture 100% of sessions with an error
    replaysOnErrorSampleRate: 1.0,
  });
}