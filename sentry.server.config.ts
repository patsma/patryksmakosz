import * as Sentry from "@sentry/nuxt";
 
Sentry.init({
  dsn: "https://351d1b8ad966fda1586b6cf39b982dba@o4510003718914048.ingest.de.sentry.io/4510003720486992",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
