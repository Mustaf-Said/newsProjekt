I am building a web application using Next.js (App Router) with TypeScript and Supabase as the backend. The website is still under development and I want to temporarily protect the entire site from public access.

Please implement a temporary development protection system with the following requirements:

1. Add a middleware that protects all routes and redirects unauthenticated users to /login.
2. Create a simple login page that uses Supabase email/password authentication.
3. After successful login, redirect the user to the homepage.
4. Use Supabase session cookies to determine if a user is authenticated.
5. Add clear comments in every file related to this feature:
   "TEMP: DEVELOPMENT SITE PROTECTION – remove before production launch".
6. Group any development-protection related logic so it is easy to remove later.
7. Add an environment variable called SITE_LOCK in .env.local.

Behavior:

* If SITE_LOCK=true → the middleware protects the entire site.
* If SITE_LOCK=false → the middleware does nothing and the site is public.

Project stack:

* Next.js (App Router)
* TypeScript
* Supabase Auth
* Tailwind CSS
* Deployment on Vercel

Please generate:

1. middleware.ts
2. login page
3. Supabase client setup
4. Example protected page
5. .env.local example
6. Instructions on how to disable the protection when launching the production site.
