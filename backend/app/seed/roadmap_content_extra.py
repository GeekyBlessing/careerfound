"""Lighter, but still fully real, "project catalog" content for the 22
career paths beyond the two fully-authored end-to-end roadmaps
(Cybersecurity, Software Engineering).

Each path here gets a compact skill graph (4-5 skills) and three phases:
Foundations / Building Real Skills / Advanced Practice, each holding one
real, fully-specified project at that difficulty tier (Beginner ~1,
Intermediate ~3, Expert ~5). No lessons/exercises/quizzes are included for
these paths; that fuller curriculum remains a documented Phase 2 item
(see docs/PHASE_2.md item #5). Every project below is real, specific
content, not lorem ipsum, naming actual tools, commands, and workflows.
"""

PATH_PROJECTS = {
    "frontend-development": {
        "skills": [
            {"key": "html_css_fundamentals", "label": "HTML & CSS Fundamentals", "category": "foundation"},
            {"key": "javascript_dom", "label": "JavaScript & the DOM", "category": "foundation"},
            {"key": "react_components", "label": "React Components & Hooks", "category": "core"},
            {"key": "state_data_fetching", "label": "State Management & Data Fetching", "category": "core"},
            {"key": "frontend_performance_deployment", "label": "Performance & Deployment", "category": "advanced"},
        ],
        "skill_edges": [
            ("html_css_fundamentals", "javascript_dom"),
            ("javascript_dom", "react_components"),
            ("react_components", "state_data_fetching"),
            ("state_data_fetching", "frontend_performance_deployment"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Covers semantic HTML, the CSS box model, Flexbox/Grid layout, and responsive design with media queries, the building blocks every frontend developer uses daily before touching a framework.",
                "skill_key": "html_css_fundamentals",
                "projects": [
                    {
                        "title": "Build a Responsive Personal Portfolio Page",
                        "teaches": "semantic HTML structure, CSS Flexbox/Grid layout, and responsive design with media queries",
                        "prerequisites": ["Basic computer literacy", "A text editor (e.g., VS Code)"],
                        "expected_output": "A single-page personal portfolio site (index.html + style.css) with a nav bar, hero section, project cards, and a contact section that reflows correctly on mobile, tablet, and desktop widths.",
                        "steps": [
                            "Sketch a wireframe of the page with three sections: header/nav, project showcase, contact footer.",
                            "Write semantic HTML using <header>, <nav>, <main>, <section>, and <footer> tags instead of generic <div>s.",
                            "Lay out the nav bar with Flexbox (display: flex, justify-content: space-between).",
                            "Lay out the project cards grid with CSS Grid (display: grid, grid-template-columns: repeat(auto-fit, minmax(...))).",
                            "Add a mobile-first media query at 600px and 900px breakpoints to adjust the grid columns and font sizes.",
                            "Validate your HTML with the W3C validator and fix any unclosed tags or missing alt attributes.",
                            "Deploy the page for free with GitHub Pages.",
                        ],
                        "hints": [
                            "auto-fit with minmax() in grid-template-columns lets cards reflow without writing a separate media query for every breakpoint.",
                            "Use rem units for font sizes so the layout respects the user's browser zoom/accessibility settings.",
                            "Chrome DevTools' device toolbar (Ctrl+Shift+M) lets you preview breakpoints without a real phone.",
                        ],
                        "common_mistakes": [
                            "Using divs for everything instead of semantic tags, which hurts accessibility and SEO.",
                            "Setting fixed pixel widths on containers, which breaks the layout on smaller screens.",
                            "Forgetting the viewport meta tag, causing mobile browsers to render a zoomed-out desktop layout.",
                            "Nesting Flexbox and Grid unnecessarily instead of picking the right tool for each layout problem.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Introduces React's component model, hooks, and client-side data fetching by building an interactive app that talks to a real API.",
                "skill_key": "react_components",
                "projects": [
                    {
                        "title": "Build a Weather Dashboard with React",
                        "teaches": "component composition, useState/useEffect hooks, controlled forms, and fetching/handling async data from a REST API",
                        "prerequisites": ["HTML/CSS fundamentals", "JavaScript ES6+ (arrow functions, promises, destructuring)", "Node.js and npm installed"],
                        "expected_output": "A React app (built with Vite) where a user types a city name, submits a form, and sees current temperature, conditions, and a 3-day forecast pulled live from a public weather API, with loading and error states handled gracefully.",
                        "steps": [
                            "Scaffold the project with `npm create vite@latest weather-app -- --template react`.",
                            "Build a SearchBar component with a controlled input tied to useState.",
                            "Sign up for a free API key (e.g., OpenWeatherMap) and store it in a .env file (VITE_WEATHER_API_KEY).",
                            "Write a useEffect hook that calls fetch() to the weather API whenever the submitted city changes.",
                            "Add isLoading and error state variables and conditionally render a spinner or error message.",
                            "Break the UI into CurrentWeather and ForecastList child components that receive data via props.",
                            "Style the components with CSS Modules or plain CSS so each component's styles are scoped.",
                        ],
                        "hints": [
                            "Never commit your API key, add .env to .gitignore and use import.meta.env in Vite.",
                            "Put the fetch logic in a custom hook like useWeather(city) to keep components focused on rendering.",
                            "Use a dependency array on useEffect correctly, or you'll trigger an infinite fetch loop.",
                            "AbortController lets you cancel a stale fetch if the user searches again before the first request finishes.",
                        ],
                        "common_mistakes": [
                            "Missing or wrong useEffect dependency arrays, causing infinite re-renders or stale data.",
                            "Not handling the loading/error states, so the UI shows blank or broken data on a bad city name.",
                            "Mutating state directly (e.g., pushing into an array in state) instead of using the setter with a new array.",
                            "Hardcoding the API key directly in the source file and pushing it to a public GitHub repo.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Covers production concerns: client-side routing, global state, code-splitting, bundling, and deploying a real multi-page app with a CI pipeline.",
                "skill_key": "frontend_performance_deployment",
                "projects": [
                    {
                        "title": "Build and Ship a Full E-Commerce Product Catalog",
                        "teaches": "React Router for multi-page navigation, global state with Context/useReducer, code-splitting with React.lazy, and production deployment with a CI pipeline",
                        "prerequisites": ["React components & hooks", "Fetching data with useEffect/fetch", "Basic Git/GitHub workflow"],
                        "expected_output": "A deployed multi-page React app (catalog, product detail, cart, checkout summary) with client-side routing, a persisted shopping cart using Context + useReducer, lazy-loaded routes, and automatic deployment to Vercel/Netlify triggered by a GitHub Actions workflow on every push to main.",
                        "steps": [
                            "Set up React Router with routes for /, /products/:id, and /cart.",
                            "Build a CartContext using useReducer to handle ADD_ITEM, REMOVE_ITEM, and UPDATE_QUANTITY actions.",
                            "Persist the cart to localStorage so it survives a page refresh.",
                            "Wrap the /cart and /checkout routes in React.lazy + Suspense to code-split them out of the main bundle.",
                            "Run `npm run build` and inspect the output bundle sizes; use a bundle visualizer plugin to spot bloat.",
                            "Write a GitHub Actions workflow (.github/workflows/deploy.yml) that runs lint + build on every push and deploys to Vercel/Netlify on success.",
                            "Run a Lighthouse audit and fix at least one performance issue (e.g., unoptimized images, missing image width/height).",
                        ],
                        "hints": [
                            "useReducer scales better than multiple useState calls once you have several related cart actions.",
                            "Suspense fallback should be a real loading UI, not just null, or users will see a jarring blank flash.",
                            "Set explicit width/height on img tags to prevent layout shift, a Core Web Vitals metric.",
                            "Environment-specific variables (API base URL) should be injected via Vercel/Netlify's environment variable settings, not hardcoded.",
                        ],
                        "common_mistakes": [
                            "Putting all state in one giant Context, causing every consumer to re-render on any change instead of splitting contexts by concern.",
                            "Forgetting a Suspense boundary around a lazy-loaded route, which crashes the app with an unhandled promise.",
                            "Shipping unminified images/fonts and never running a Lighthouse or bundle-size check before calling it 'done'.",
                            "Not testing the production build (`npm run preview`) before deploying, only ever testing the dev server.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "backend-engineering": {
        "skills": [
            {"key": "server_fundamentals", "label": "HTTP & Server Fundamentals", "category": "foundation"},
            {"key": "relational_databases_sql", "label": "Relational Databases & SQL", "category": "foundation"},
            {"key": "api_design_auth", "label": "API Design & Authentication", "category": "core"},
            {"key": "containerization_docker", "label": "Containerization with Docker", "category": "core"},
            {"key": "scalable_backend_systems", "label": "Caching, Queues & Scalable Systems", "category": "advanced"},
        ],
        "skill_edges": [
            ("server_fundamentals", "relational_databases_sql"),
            ("relational_databases_sql", "api_design_auth"),
            ("api_design_auth", "containerization_docker"),
            ("containerization_docker", "scalable_backend_systems"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Covers how HTTP requests and responses work, building simple server routes, and modeling/querying data with SQL, the basics every backend service is built on.",
                "skill_key": "server_fundamentals",
                "projects": [
                    {
                        "title": "Build a REST API for a To-Do List",
                        "teaches": "HTTP methods/status codes, routing, and request/response handling using a lightweight backend framework",
                        "prerequisites": ["Basic Python or JavaScript syntax", "Command line basics (installing packages with pip/npm)"],
                        "expected_output": "A running local server (Express.js or Flask) exposing GET /todos, POST /todos, PUT /todos/:id, and DELETE /todos/:id endpoints, backed by an in-memory array, testable with curl or Postman.",
                        "steps": [
                            "Initialize a project with `npm init` + Express, or a Python virtualenv + Flask.",
                            "Create a GET /todos route that returns a JSON array of todo objects.",
                            "Add POST /todos that reads a JSON body (express.json() or Flask's request.get_json()) and appends a new todo.",
                            "Add PUT /todos/:id and DELETE /todos/:id that find the todo by id and update/remove it.",
                            "Return correct HTTP status codes: 201 on create, 404 when an id isn't found, 400 on a malformed body.",
                            "Test every route with curl or Postman, including error cases like requesting a non-existent id.",
                            "Add basic request logging middleware so you can see each incoming request in the console.",
                        ],
                        "hints": [
                            "Status codes matter: don't return 200 for a failed lookup, that breaks any client relying on status to detect errors.",
                            "express.json() (or Flask's request.get_json()) must run before your route handlers or req.body will be undefined.",
                            "Use Postman collections or a .http file to save your test requests instead of retyping curl commands.",
                            "Keep the in-memory array in a separate module so route handlers stay focused on request/response logic.",
                        ],
                        "common_mistakes": [
                            "Forgetting body-parsing middleware, so POST/PUT requests silently receive an empty body.",
                            "Returning 200 for every response regardless of outcome, including errors and not-found cases.",
                            "Mutating the in-memory array by index without checking the id actually exists, causing crashes on bad ids.",
                            "Not using nodemon or Flask's debug reloader, and testing against stale code.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Moves from an in-memory API to a real relational database, adding user accounts, authentication, and relationships between resources.",
                "skill_key": "api_design_auth",
                "projects": [
                    {
                        "title": "Build an Authenticated Blogging API with PostgreSQL",
                        "teaches": "relational schema design, SQL joins, password hashing, and stateless authentication with JWTs",
                        "prerequisites": ["Building a basic REST API", "SQL basics (SELECT/INSERT/JOIN)", "PostgreSQL installed locally or via Docker"],
                        "expected_output": "A REST API where users can register, log in, and receive a JWT; authenticated users can create/edit/delete their own blog posts; anyone can list posts and comments, with data persisted in PostgreSQL and enforced foreign-key relationships between users, posts, and comments.",
                        "steps": [
                            "Design a schema with users, posts, and comments tables, using foreign keys (posts.user_id references users.id).",
                            "Write the schema as SQL migration files (or use an ORM like Prisma/SQLAlchemy) and run them against a local Postgres instance.",
                            "Implement POST /auth/register that hashes passwords with bcrypt before storing them, never store plaintext passwords.",
                            "Implement POST /auth/login that verifies the password and returns a signed JWT (using jsonwebtoken or PyJWT).",
                            "Write middleware that verifies the JWT on protected routes and attaches the user id to the request.",
                            "Implement POST /posts and DELETE /posts/:id so only the post's owner (checked via the JWT's user id) can modify or delete it.",
                            "Write a GET /posts/:id/comments endpoint that uses a SQL JOIN to return comments with the commenter's username attached.",
                        ],
                        "hints": [
                            "Always compare passwords with bcrypt.compare(), never decrypt and compare plaintext.",
                            "Store the JWT secret in an environment variable, not in source code.",
                            "Use parameterized queries (or your ORM's query builder) everywhere, never string-concatenate user input into SQL.",
                            "An ON DELETE CASCADE (or explicit cleanup logic) on the foreign key prevents orphaned comments when a post is deleted.",
                        ],
                        "common_mistakes": [
                            "Building raw SQL queries with string concatenation, opening the API to SQL injection.",
                            "Checking only that a JWT is valid but not that the requesting user actually owns the resource they're modifying.",
                            "Storing the JWT secret or database password directly in the code and committing it to git.",
                            "Forgetting indexes on foreign key columns, which makes joins slow once the tables have real data volume.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Covers containerizing the service and adding caching and background job processing, running the whole system as coordinated Docker containers, mirroring how backend services actually run in production.",
                "skill_key": "scalable_backend_systems",
                "projects": [
                    {
                        "title": "Build a Production-Grade Job Board API",
                        "teaches": "Docker/docker-compose multi-service orchestration, Redis caching, rate limiting, and background job processing",
                        "prerequisites": ["Authenticated REST API with a relational database", "Basic Docker concepts (images vs. containers)", "Understanding of async/event-driven code"],
                        "expected_output": "A dockerized job board API (Node/Express or Python/Flask) with a Postgres database, Redis cache, and a background worker process, all orchestrated via docker-compose: browsing job listings is cached in Redis, applying to a job enqueues an email-notification background job processed by a worker (BullMQ or Celery), and the API enforces per-IP rate limiting.",
                        "steps": [
                            "Write a Dockerfile for the API service and a docker-compose.yml that wires together the api, postgres, redis, and worker containers.",
                            "Move all config (DB URL, Redis URL, JWT secret) into environment variables passed through docker-compose.yml.",
                            "Add a Redis-backed cache layer on GET /jobs so repeated requests within a TTL window skip the database.",
                            "Implement rate limiting middleware (e.g., express-rate-limit or Flask-Limiter) backed by Redis so limits are shared across API instances.",
                            "Set up a job queue (BullMQ with Redis, or Celery with Redis/RabbitMQ) and enqueue a 'send confirmation email' job whenever a user applies to a job posting.",
                            "Write a separate worker process (its own container) that consumes the queue and processes jobs, retrying failed jobs with exponential backoff.",
                            "Add a health-check endpoint (GET /health) that verifies DB and Redis connectivity, and reference it in the Dockerfile's HEALTHCHECK.",
                        ],
                        "hints": [
                            "Cache invalidation is the hard part, clear or update the Redis key for GET /jobs whenever a job posting is created or edited.",
                            "Run the worker as a separate docker-compose service so it can be scaled independently of the API.",
                            "Set explicit TTLs on cached keys; an unbounded cache silently serves stale data forever.",
                            "Use docker-compose's depends_on plus a wait-for script or healthcheck condition, since Postgres/Redis can take a moment to be ready when containers start together.",
                        ],
                        "common_mistakes": [
                            "Caching data with no invalidation strategy, so users see stale job listings after an edit.",
                            "Doing slow work (like sending an email) synchronously inside the request handler instead of a background job, making the API feel slow or time out.",
                            "Rate limiting in-memory per container instead of via shared Redis state, so limits reset whenever a container restarts or don't apply across multiple instances.",
                            "Not setting resource limits or restart policies in docker-compose, so a crashed worker silently stops processing jobs.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "full-stack-development": {
        "skills": [
            {"key": "typescript_fundamentals", "label": "TypeScript Fundamentals", "category": "foundation"},
            {"key": "react_ui_development", "label": "React UI Development", "category": "core"},
            {"key": "nodejs_api_development", "label": "Node.js API Development", "category": "core"},
            {"key": "relational_data_modeling", "label": "Relational Data Modeling with an ORM", "category": "core"},
            {"key": "fullstack_auth_deployment", "label": "Auth, Payments & Deployment", "category": "advanced"},
        ],
        "skill_edges": [
            ("typescript_fundamentals", "react_ui_development"),
            ("react_ui_development", "nodejs_api_development"),
            ("nodejs_api_development", "relational_data_modeling"),
            ("relational_data_modeling", "fullstack_auth_deployment"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Covers sharing TypeScript types between a React frontend and a Node/Express backend, and wiring a full request/response cycle end to end.",
                "skill_key": "typescript_fundamentals",
                "projects": [
                    {
                        "title": "Build a Type-Safe Full-Stack Notes App",
                        "teaches": "sharing TypeScript types between a React frontend and a Node/Express backend, and wiring a full request/response cycle end to end",
                        "prerequisites": ["JavaScript ES6+ fundamentals", "Basic React (components, props)", "Basic Express or Node http basics"],
                        "expected_output": "A minimal full-stack app: a Node/Express + TypeScript backend exposing GET/POST /api/notes backed by an in-memory array, a React + TypeScript frontend that lists and creates notes, and a shared Note interface used by both sides.",
                        "steps": [
                            "Scaffold a backend with TypeScript + Express (tsconfig.json, ts-node-dev for hot reload).",
                            "Scaffold a frontend with `npm create vite@latest client -- --template react-ts`.",
                            "Define a shared Note interface (id, title, body, createdAt) and use it on both the API response types and the React component props.",
                            "Implement GET /api/notes and POST /api/notes on the backend, typing the request body with an interface instead of `any`.",
                            "Build a NoteList and NoteForm component in React, typing useState<Note[]> and the form's onSubmit handler.",
                            "Configure a Vite dev proxy (or CORS on the backend) so the React app can call the Express API during local development.",
                            "Run `tsc --noEmit` on both projects to confirm there are zero type errors before considering it done.",
                        ],
                        "hints": [
                            "Avoid `any`, if you don't know a type yet, use `unknown` and narrow it, which forces you to handle it safely.",
                            "Vite's server.proxy config in vite.config.ts avoids CORS headaches during local development.",
                            "Keep the shared Note interface in one file and import it in both projects (or a small shared workspace package) so a schema change fails to compile on both sides.",
                            "Turn on tsconfig's `strict: true` from day one, it catches far more real bugs than the default config.",
                        ],
                        "common_mistakes": [
                            "Typing API responses as `any`, which defeats the purpose of using TypeScript across the stack.",
                            "Letting the frontend and backend definitions of the same data shape drift apart because they're duplicated instead of shared.",
                            "Not handling CORS during local dev, then being confused why fetch requests fail silently in the browser console.",
                            "Ignoring TypeScript errors with a ts-ignore comment instead of fixing the underlying type mismatch.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Covers designing a relational schema with an ORM, building authenticated REST endpoints, and building a drag-and-drop React UI that stays in sync with the backend.",
                "skill_key": "relational_data_modeling",
                "projects": [
                    {
                        "title": "Build a Multi-User Kanban Board",
                        "teaches": "designing a relational schema with Prisma, building authenticated REST endpoints, and building a drag-and-drop React UI that stays in sync with the backend",
                        "prerequisites": ["Type-safe full-stack basics", "SQL fundamentals", "React state management (useState/useEffect)"],
                        "expected_output": "A full-stack Kanban board (React + TypeScript frontend, Node/Express + TypeScript backend, PostgreSQL via Prisma) where authenticated users can create boards, add columns and cards, and drag cards between columns, with changes persisted to the database and reflected after a page refresh.",
                        "steps": [
                            "Model the schema in Prisma: User, Board, Column, and Card, with Card belonging to a Column via a foreign key and an `order` integer field.",
                            "Run `npx prisma migrate dev` to create the tables and generate a typed Prisma client.",
                            "Implement JWT-based auth (register/login) and protect all /api/boards routes with an auth middleware.",
                            "Implement PATCH /api/cards/:id to update a card's columnId and order when it's dragged to a new column.",
                            "Build the board UI with a drag-and-drop library (e.g., @dnd-kit), rendering columns and cards from data fetched via a typed API client.",
                            "On drop, optimistically update local React state immediately, then call the PATCH endpoint, and roll back the UI if the request fails.",
                            "Add a loading skeleton for the initial board fetch and an error toast if the API call fails.",
                        ],
                        "hints": [
                            "Store an integer `order` field per card within its column so you can sort cards deterministically instead of relying on array position alone.",
                            "Optimistic UI updates make drag-and-drop feel instant, but you must handle the failure/rollback path or the UI can silently drift from the database.",
                            "Prisma's generated types let you import the exact Card shape the database returns instead of hand-writing a duplicate interface.",
                            "Debounce or batch reordering PATCH calls if a user drags multiple cards quickly, to avoid flooding the API.",
                        ],
                        "common_mistakes": [
                            "Persisting drag-and-drop order only in frontend state, so it resets to the original order on every page refresh.",
                            "Not scoping queries to the logged-in user's boards, letting one user fetch or modify another user's data.",
                            "Skipping the rollback logic for optimistic updates, leaving the UI in a broken state after a failed request.",
                            "Running Prisma migrations directly against a shared dev database without a local/dev separation, corrupting teammates' data.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Covers OAuth-based authentication, Stripe subscription billing, background webhook handling, and CI/CD deployment of a coupled frontend/backend.",
                "skill_key": "fullstack_auth_deployment",
                "projects": [
                    {
                        "title": "Build and Deploy a Subscription-Based SaaS Platform",
                        "teaches": "OAuth-based authentication, Stripe subscription billing, background webhook handling, and CI/CD deployment of a coupled frontend/backend",
                        "prerequisites": ["Full-stack CRUD app with a relational database", "JWT authentication", "Basic understanding of webhooks"],
                        "expected_output": "A deployed SaaS-style app (React + TypeScript frontend, Node/Express + TypeScript backend, PostgreSQL) with Google OAuth login, a Stripe Checkout subscription flow, a webhook handler that updates a user's subscription status in the database, plan-gated features in the UI, and a GitHub Actions pipeline that runs tests and deploys the frontend and backend on every merge to main.",
                        "steps": [
                            "Implement Google OAuth login (e.g., via Passport.js or Auth.js) alongside or instead of email/password.",
                            "Create a Stripe account in test mode, define a subscription Product/Price, and implement a POST /api/checkout-session endpoint that creates a Stripe Checkout session for the logged-in user.",
                            "Redirect the user to Stripe Checkout on the frontend, then handle the success/cancel redirect URLs.",
                            "Implement a POST /api/webhooks/stripe endpoint that verifies the Stripe signature and updates the user's subscriptionStatus in Postgres on checkout.session.completed and customer.subscription.deleted events.",
                            "Gate a feature in the React UI (e.g., an 'export data' button) behind the user's current subscription status fetched from the backend.",
                            "Write integration tests for the checkout and webhook flows using the Stripe CLI (`stripe trigger checkout.session.completed`) to simulate events locally.",
                            "Set up a GitHub Actions workflow that runs `tsc --noEmit`, lint, and tests on every PR, and deploys the frontend (Vercel) and backend (Render/Fly.io/Railway) on merge to main.",
                        ],
                        "hints": [
                            "Always verify the Stripe webhook signature (stripe.webhooks.constructEvent) or anyone can POST fake 'payment succeeded' events to your endpoint.",
                            "Webhook handlers must be idempotent, Stripe can and does retry/redeliver the same event, so check you haven't already applied it.",
                            "Use the Stripe CLI's `stripe listen --forward-to localhost:3000/api/webhooks/stripe` to test webhooks locally before deploying.",
                            "Keep Stripe secret keys and the webhook signing secret in environment variables/secrets manager, never in the repo.",
                        ],
                        "common_mistakes": [
                            "Trusting the client-side redirect after checkout to mark a subscription active instead of relying on the verified webhook event.",
                            "Not verifying the Stripe webhook signature, leaving the endpoint open to forged subscription events.",
                            "Handling webhooks non-idempotently, so a retried event double-applies internal state (e.g., extends a subscription twice).",
                            "Deploying frontend and backend with mismatched CORS/env configuration, so the production frontend calls the wrong API URL or gets blocked by CORS.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "cloud-engineering": {
        "skills": [
            {"key": "linux_cloud_fundamentals", "label": "Linux & Cloud Fundamentals", "category": "foundation"},
            {"key": "cloud_networking_compute", "label": "Cloud Networking & Compute", "category": "core"},
            {"key": "infrastructure_as_code", "label": "Infrastructure as Code (Terraform)", "category": "core"},
            {"key": "containers_orchestration", "label": "Containers on Cloud Compute", "category": "core"},
            {"key": "cicd_observability", "label": "Reliability, Monitoring & Cost", "category": "advanced"},
        ],
        "skill_edges": [
            ("linux_cloud_fundamentals", "cloud_networking_compute"),
            ("cloud_networking_compute", "infrastructure_as_code"),
            ("infrastructure_as_code", "containers_orchestration"),
            ("containers_orchestration", "cicd_observability"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Covers core AWS building blocks, IAM users/policies, S3 static hosting, and CloudFront CDN distribution, plus basic Linux/CLI usage via the AWS CLI.",
                "skill_key": "linux_cloud_fundamentals",
                "projects": [
                    {
                        "title": "Host a Static Website on AWS S3 + CloudFront",
                        "teaches": "core AWS building blocks, IAM users/policies, S3 static website hosting, and CloudFront CDN distribution, plus basic Linux CLI usage via the AWS CLI",
                        "prerequisites": ["A free-tier AWS account", "Basic command-line familiarity", "A simple static HTML/CSS site to deploy"],
                        "expected_output": "A static website live on the internet over HTTPS via a CloudFront distribution, backed by a private S3 bucket, deployed and updated from the terminal using the AWS CLI rather than the console.",
                        "steps": [
                            "Create an IAM user with programmatic access and a least-privilege policy scoped to the one S3 bucket you'll use, instead of using your root account or admin credentials.",
                            "Install and configure the AWS CLI (`aws configure`) with that IAM user's access key.",
                            "Create a private S3 bucket and upload your site files with `aws s3 sync ./site s3://your-bucket-name`.",
                            "Create a CloudFront distribution with an Origin Access Control (OAC) pointing at the S3 bucket, so the bucket stays private but CloudFront can still serve it.",
                            "Set the CloudFront default root object to index.html and confirm the site loads over the distribution's HTTPS URL.",
                            "Write a one-line shell script that re-runs `aws s3 sync` and then creates a CloudFront invalidation (`aws cloudfront create-invalidation`) so updates go live without waiting for the cache TTL.",
                            "(Optional) Point a custom domain at the distribution using Route 53 and an ACM certificate.",
                        ],
                        "hints": [
                            "S3 static website hosting (public bucket) and S3-as-CloudFront-origin (private bucket + OAC) are different patterns, prefer the private+OAC approach, it's the current AWS-recommended one.",
                            "CloudFront edge caches are not instant to update, you must invalidate the cache path (or version your file names) after every deploy.",
                            "`aws configure list` is a fast way to confirm which credentials/region the CLI is actually using before you run a command.",
                            "Tag your bucket and distribution (e.g., project=portfolio-site) so you can find and clean them up later to avoid surprise charges.",
                        ],
                        "common_mistakes": [
                            "Using root account credentials for everyday CLI work instead of creating a scoped IAM user.",
                            "Making the S3 bucket fully public instead of using CloudFront Origin Access Control, widening the attack surface unnecessarily.",
                            "Forgetting to invalidate the CloudFront cache after updating files, so visitors keep seeing the old version.",
                            "Leaving unused S3 buckets/CloudFront distributions running after finishing the project and getting a surprise bill.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Covers infrastructure as code with Terraform, VPC networking (public/private subnets, NAT), and deploying a containerized app behind a load balancer.",
                "skill_key": "infrastructure_as_code",
                "projects": [
                    {
                        "title": "Provision a 3-Tier VPC with Terraform",
                        "teaches": "infrastructure as code with Terraform, VPC networking (public/private subnets, route tables, NAT), and deploying a containerized app behind a load balancer",
                        "prerequisites": ["AWS CLI/IAM basics", "Basic Docker (building and running an image)", "Terraform installed locally"],
                        "expected_output": "A Terraform project (main.tf, variables.tf, outputs.tf) that provisions a VPC with public and private subnets across two availability zones, a NAT gateway, an Application Load Balancer, and an EC2 instance in a private subnet running a Dockerized web app that's reachable only through the load balancer.",
                        "steps": [
                            "Write a Terraform VPC module (or use the official terraform-aws-modules/vpc/aws module) defining a VPC with 2 public and 2 private subnets across two AZs.",
                            "Add an Internet Gateway for the public subnets and a NAT Gateway so private-subnet instances can reach the internet outbound without being publicly reachable.",
                            "Define security groups: one for the ALB (allow 80/443 from the internet) and one for the EC2 instance (allow traffic only from the ALB's security group on the app port).",
                            "Write an EC2 launch template with user_data that installs Docker and runs your container on instance boot.",
                            "Define an Application Load Balancer with a target group pointed at the EC2 instance's app port, and a listener on port 80.",
                            "Run `terraform plan` to review the diff, then `terraform apply` to provision everything, and confirm the app is reachable via the ALB's DNS name.",
                            "Run `terraform destroy` at the end and confirm in the AWS console that no resources were left behind.",
                        ],
                        "hints": [
                            "Never hardcode AWS credentials in .tf files, use the AWS CLI's configured profile or environment variables, and add terraform.tfstate to .gitignore since it can contain sensitive data.",
                            "Always run `terraform plan` before `apply` and actually read the diff, especially the 'destroy' lines, before approving.",
                            "Security groups are stateful and reference each other by ID, pointing the EC2 SG's allowed source at the ALB's SG (not a CIDR range) keeps things locked down as the ALB's IPs change.",
                            "Store Terraform state in a remote backend (e.g., an S3 bucket + DynamoDB lock table) once you're working with more than a solo local project.",
                        ],
                        "common_mistakes": [
                            "Putting the EC2 instance in a public subnet with a public IP, defeating the purpose of the private-subnet/ALB architecture.",
                            "Opening the EC2 security group to 0.0.0.0/0 on the app port instead of scoping it to the ALB's security group only.",
                            "Forgetting `terraform destroy` after the exercise, leaving a NAT Gateway (which bills hourly) running indefinitely.",
                            "Committing terraform.tfstate to git, which can leak resource IDs and sometimes secrets.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Design for failure: build a multi-AZ web platform with a managed database, backups and alarms on AWS, then break it on purpose and prove it recovers.",
                "skill_key": "cicd_observability",
                "projects": [
                    {
                        "title": "Build a highly available, self-healing web platform on AWS and prove it survives a failure",
                        "teaches": "designing for availability across two availability zones, an Auto Scaling group behind a load balancer, a managed Multi-AZ database with backups, CloudWatch alarms and cost tags, and testing recovery on purpose",
                        "prerequisites": ["Terraform VPC project", "AWS IAM, VPC and EC2 fundamentals", "A simple web app that reads and writes to a SQL database"],
                        "expected_output": "A Terraform-managed platform with an Application Load Balancer, an Auto Scaling group spread across two availability zones in private subnets, an RDS database in Multi-AZ mode with automated backups, CloudWatch alarms for unhealthy hosts and database load, and a short failure-drill report showing the app stayed up when an instance and then a whole zone's worth of capacity was removed.",
                        "steps": [
                            "Reuse your VPC code and add a launch template and an Auto Scaling group that spreads at least two instances across private subnets in two availability zones.",
                            "Place the Application Load Balancer in the public subnets and attach the group to its target group with a health check on a real /health path.",
                            "Create an RDS PostgreSQL or MySQL instance with Multi-AZ enabled, in private subnets, reachable only from the application security group.",
                            "Keep the database password in AWS Secrets Manager and give the instances an IAM role that can read only that secret.",
                            "Enable automated backups with a retention period and take a manual snapshot, then restore it into a throwaway instance to prove the backup works.",
                            "Create CloudWatch alarms for unhealthy target count, load balancer 5xx errors and database CPU, sending notifications to an SNS topic.",
                            "Run a failure drill: terminate one instance, then stop every instance in one zone, and record how long the app took to recover and what users saw.",
                            "Tag every resource with project and owner, check the cost explorer after a day, then run terraform destroy and confirm nothing is left billing.",
                        ],
                        "hints": [
                            "Multi-AZ keeps a standby copy for failover; it is not a read replica and it is not a backup, so you need all three ideas straight.",
                            "Test the restore, not only the backup. A backup you have never restored is a hope, not a plan.",
                            "Keep instances in private subnets and let only the load balancer face the internet.",
                            "Write down your recovery time during the drill. That number is the most useful thing in your portfolio write-up.",
                        ],
                        "common_mistakes": [
                            "Putting both instances in the same availability zone and calling it highly available.",
                            "Enabling Multi-AZ but never running a failover or restore, so recovery is untested.",
                            "Health checks that only confirm the web server is up, not that it can reach its database.",
                            "Leaving the NAT gateway, load balancer and database running after the exercise and paying for them for weeks.",
                        ],
                        "difficulty": 5,
                    },
                ],
            },
        ],
    },
    "cloud-security": {
        "skills": [
            {"key": "cloud_fundamentals", "label": "Cloud Fundamentals", "category": "foundation"},
            {"key": "iam_and_access_control", "label": "IAM & Access Control", "category": "foundation"},
            {"key": "network_security_in_cloud", "label": "Cloud Network Security", "category": "core"},
            {"key": "cloud_security_monitoring", "label": "Cloud Security Monitoring", "category": "core"},
            {"key": "cloud_security_automation", "label": "Cloud Security Automation", "category": "advanced"},
        ],
        "skill_edges": [
            ("cloud_fundamentals", "iam_and_access_control"),
            ("iam_and_access_control", "network_security_in_cloud"),
            ("network_security_in_cloud", "cloud_security_monitoring"),
            ("cloud_security_monitoring", "cloud_security_automation"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Get hands-on with a real cloud account and learn why misconfigured IAM and storage settings are the leading cause of cloud breaches.",
                "skill_key": "cloud_fundamentals",
                "projects": [
                    {
                        "title": "Audit and harden a personal AWS free-tier account's IAM and S3 settings",
                        "teaches": "how misconfigured cloud resources (public S3 buckets, root account usage, weak IAM policies) become the #1 cause of cloud breaches",
                        "prerequisites": ["Basic command-line comfort", "An email address for a free AWS account"],
                        "expected_output": "A hardened personal AWS account with MFA enabled, an IAM admin user replacing root usage, account-wide S3 Block Public Access enabled, and CloudTrail logging turned on.",
                        "steps": [
                            "Create a free-tier AWS account and enable MFA on the root user.",
                            "Create an IAM admin user for daily use and stop using the root account.",
                            "Use IAM Access Analyzer or Trusted Advisor to check for public S3 buckets.",
                            "Create a private S3 bucket, then intentionally misconfigure it as public and observe the 'Public' warning banner in the console.",
                            "Enable the account-wide 'Block Public Access' setting for S3.",
                            "Turn on CloudTrail logging to record API calls, and review the log for your own actions.",
                            "Write a short report documenting the changes made and why.",
                        ],
                        "hints": [
                            "AWS's free tier includes limited AWS Config and CloudTrail usage, watch the limits.",
                            "S3 Block Public Access has four separate toggles; check all of them.",
                            "Use the IAM Policy Simulator to check what your admin user can actually do.",
                            "Set a billing alarm immediately so a misconfiguration doesn't turn into a surprise bill.",
                        ],
                        "common_mistakes": [
                            "Leaving the root account with no MFA enabled.",
                            "Using root credentials for daily tasks instead of an IAM user.",
                            "Enabling public read on a bucket 'just for testing' and forgetting to revert it.",
                            "Not setting a billing alarm before enabling logging services that incur cost.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Design a segmented cloud network with least-privilege access, the pattern behind every real production cloud environment.",
                "skill_key": "network_security_in_cloud",
                "projects": [
                    {
                        "title": "Design a segmented VPC with least-privilege IAM roles for a 3-tier web app",
                        "teaches": "real-world cloud network segmentation (public/private subnets), security groups vs. NACLs, and IAM role-based (not user-based) access for compute resources",
                        "prerequisites": ["Completion of the IAM/S3 hardening project", "Basic understanding of subnets and routing"],
                        "expected_output": "A working VPC with a public web tier and a private database tier, security groups restricting traffic by port and source, an IAM role scoping EC2 permissions, and a secret stored outside the instance.",
                        "steps": [
                            "Create a VPC with public and private subnets across two availability zones.",
                            "Place a web server in the public subnet and a database in the private subnet with no direct internet route.",
                            "Configure security groups so the database only accepts traffic from the web server's security group on its specific port (e.g., 5432).",
                            "Create an IAM role (not a user with static keys) for the EC2 instance, scoped to only the S3 bucket and Secrets Manager entries it needs.",
                            "Store the database password in AWS Secrets Manager instead of hardcoding it.",
                            "Enable VPC Flow Logs and review them for unexpected traffic.",
                            "Use the IAM Policy Simulator to verify the role can't do anything beyond its intended scope.",
                        ],
                        "hints": [
                            "NACLs are stateless, security groups are stateful, know when to use each.",
                            "Follow 'deny by default, allow explicitly' for every security group rule.",
                            "Test least privilege by trying an action that should fail and confirming it does.",
                            "Tag every resource for cost and security tracking from the start.",
                        ],
                        "common_mistakes": [
                            "Attaching overly broad AWS managed policies like AdministratorAccess to test resources.",
                            "Opening security group ports to 0.0.0.0/0 for convenience during testing.",
                            "Forgetting Flow Logs incur ongoing cost if left running indefinitely.",
                            "Putting secrets in EC2 user-data scripts, which are readable via the instance metadata API.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Build production-grade tooling that continuously detects and remediates cloud misconfigurations, the kind of automation real cloud security teams run.",
                "skill_key": "cloud_security_automation",
                "projects": [
                    {
                        "title": "Build an automated cloud security posture scanner with remediation for an AWS account",
                        "teaches": "production-grade cloud security engineering, writing Python/boto3 tooling to continuously detect misconfigurations (like Prowler/ScoutSuite do) and auto-remediate common issues, integrated with GuardDuty alerts",
                        "prerequisites": ["Comfort with Python and boto3", "Completion of the VPC/IAM segmentation project", "A sandbox AWS account, not production"],
                        "expected_output": "A deployed, scheduled scanning tool that reports misconfigurations with severity ratings and automatically remediates at least one finding type, with GuardDuty-triggered automated response for a compromised instance.",
                        "steps": [
                            "Use boto3 to write a Python scanner that checks for public S3 buckets, unencrypted EBS volumes, IAM users without MFA, and overly permissive security groups.",
                            "Output findings as a structured JSON/CSV report with severity ratings.",
                            "Enable GuardDuty and write a Lambda function triggered by EventBridge that responds to specific GuardDuty findings, such as automatically isolating an EC2 instance flagged as compromised by changing its security group.",
                            "Add an automated remediation action for at least one finding type (e.g., auto-revoke public S3 access) with a dry-run mode.",
                            "Deploy the scanner as a scheduled Lambda function using infrastructure as code (CloudFormation or Terraform).",
                            "Send alerts to a Slack channel or SNS topic when critical findings appear.",
                            "Document the tool and compare its output against an open-source tool like Prowler or ScoutSuite to validate coverage.",
                        ],
                        "hints": [
                            "boto3 paginators are needed for accounts with many resources, unpaginated calls silently miss results.",
                            "GuardDuty findings include a 'severity' field you can filter and act on.",
                            "Give the Lambda its own tightly scoped IAM execution role, never long-lived credentials.",
                            "Test remediation logic against a sandbox account with a dry-run flag before enabling live changes.",
                        ],
                        "common_mistakes": [
                            "Shipping auto-remediation without a dry-run or approval step, causing accidental outages.",
                            "Hardcoding AWS credentials in Lambda code instead of using an execution role.",
                            "Scanning too many resources at once and hitting API rate limits without backoff/retry logic.",
                            "Only checking a single region (e.g., us-east-1) and missing resources in other regions.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "security-operations": {
        "skills": [
            {"key": "log_and_event_fundamentals", "label": "Log & Event Fundamentals", "category": "foundation"},
            {"key": "siem_operations", "label": "SIEM Operations", "category": "foundation"},
            {"key": "alert_triage_and_investigation", "label": "Alert Triage & Investigation", "category": "core"},
            {"key": "incident_detection_and_response", "label": "Incident Detection & Response", "category": "core"},
            {"key": "threat_hunting", "label": "Threat Hunting", "category": "advanced"},
        ],
        "skill_edges": [
            ("log_and_event_fundamentals", "siem_operations"),
            ("siem_operations", "alert_triage_and_investigation"),
            ("alert_triage_and_investigation", "incident_detection_and_response"),
            ("incident_detection_and_response", "threat_hunting"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn how raw system logs become searchable security data by building a home SIEM lab and ingesting real log sources.",
                "skill_key": "log_and_event_fundamentals",
                "projects": [
                    {
                        "title": "Build a home lab and ingest Windows/Linux logs into Splunk Free",
                        "teaches": "how raw system/security logs (Windows Event Logs, syslog) become structured, searchable data in a SIEM, the foundation of all SOC work",
                        "prerequisites": ["Basic comfort with virtual machines", "Basic command-line usage"],
                        "expected_output": "A working Splunk Free instance receiving live Windows and/or Linux logs, with a search returning failed login events and a basic dashboard panel visualizing them.",
                        "steps": [
                            "Install Splunk Free (or the Splunk Enterprise trial) on a local VM or your host machine.",
                            "Set up a Windows VM (or enable Sysmon on your own machine) and install the Splunk Universal Forwarder.",
                            "Configure the forwarder to send Windows Security Event Log events (e.g., 4624, 4625) to Splunk.",
                            "Alternatively or additionally, forward Linux /var/log/auth.log or syslog to Splunk.",
                            "In Splunk's search bar, run basic SPL queries like `index=main EventCode=4625` to find failed logins.",
                            "Build a simple dashboard panel showing failed login attempts over time.",
                            "Document what each log source represents and why a SOC analyst cares about it.",
                        ],
                        "hints": [
                            "Event ID 4624 is a successful logon, 4625 is a failed logon in Windows.",
                            "Run `index=* | stats count by sourcetype` first to confirm what's actually flowing in.",
                            "Sysmon gives far richer process-creation logs than default Windows logging.",
                            "Splunk Free has a daily indexing volume limit, watch it so ingestion doesn't stop.",
                        ],
                        "common_mistakes": [
                            "Forgetting to configure the forwarder's outputs.conf, so no data ever arrives.",
                            "Confusing sourcetype with index when writing searches.",
                            "Not enabling Windows Security auditing policy, so 4625 events are never generated at all.",
                            "Ignoring timezone mismatches between the log source and the Splunk indexer.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Practice the core Tier-1 SOC workflow: taking a raw alert, enriching it with context, and deciding whether it's a real threat.",
                "skill_key": "alert_triage_and_investigation",
                "projects": [
                    {
                        "title": "Triage a simulated brute-force and phishing alert set using Splunk and a triage playbook",
                        "teaches": "real SOC Tier-1 workflow, taking a raw alert, enriching it with context, deciding true/false positive, and escalating with a written justification",
                        "prerequisites": ["Completion of the Splunk log ingestion project", "Basic SPL search syntax"],
                        "expected_output": "Three completed triage write-ups (alert summary, evidence, verdict, recommended action) built from a real or simulated brute-force dataset, plus one escalated ticket with IOCs.",
                        "steps": [
                            "Use a dataset like Splunk's 'Boss of the SOC' (BOTS) dataset or generate your own by simulating failed RDP/SSH logins with a script.",
                            "Write an SPL search that flags an account with more than 10 failed logins in 5 minutes followed by a success (a classic brute-force pattern).",
                            "Pivot from the alert to related data: source IP geolocation, the user's normal login pattern, and any process execution right after the successful login.",
                            "Create a simple triage template (alert summary, evidence, false-positive/true-positive verdict, recommended action) and fill it out for 3 different alerts.",
                            "Practice checking a suspicious IP against threat intel sources like AbuseIPDB or VirusTotal.",
                            "Escalate one finding as if opening a ticket, including IOCs (IPs, usernames, timestamps).",
                            "Time yourself, real SOC analysts are measured on mean-time-to-triage.",
                        ],
                        "hints": [
                            "`stats count by ... | where count > N` combined with `bucket _time span=5m` helps detect burst patterns in SPL.",
                            "Always check whether the 'attacker' IP is internal, it could be a misconfigured service, not an attack.",
                            "Enrich with a lookup table of known-good service accounts to cut false positives.",
                            "Document your reasoning, not just your verdict, SOC leads review the write-up, not just the outcome.",
                        ],
                        "common_mistakes": [
                            "Treating every alert as a true positive without checking baseline behavior first.",
                            "Only looking at one log source (auth logs) and missing the process execution that follows.",
                            "Writing a vague ticket with no IOCs or timestamps that a Tier-2 analyst can't act on.",
                            "Rushing triage due to alert fatigue, leading to missed context.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Move from reactive alerting to proactive threat hunting, forming and testing a hypothesis to find an attacker no alert has caught yet.",
                "skill_key": "threat_hunting",
                "projects": [
                    {
                        "title": "Run a structured threat hunt for lateral movement across a simulated small network",
                        "teaches": "proactive threat hunting methodology, forming a hypothesis, searching for TTPs mapped to MITRE ATT&CK, and finding an attacker who hasn't triggered any existing alert",
                        "prerequisites": ["Completion of the alert triage project", "Familiarity with MITRE ATT&CK basics", "Sysmon deployed in the lab"],
                        "expected_output": "A written hunt report (hypothesis, methodology, findings, intrusion timeline mapped to ATT&CK) plus a new saved Splunk correlation search that closes the detection gap found during the hunt.",
                        "steps": [
                            "Set up a small lab (2-3 VMs) and use an attack simulation tool like Atomic Red Team to execute real lateral movement techniques (e.g., T1021 Remote Services via PsExec/WMI) without a pre-built alert for them.",
                            "Form a hunting hypothesis, e.g., 'An attacker with one compromised host is using WMI to move laterally.'",
                            "In Splunk, search for indicators like unusual WMI process creation (wmiprvse.exe spawning cmd.exe) or PsExec service installation events (Event ID 7045).",
                            "Map findings to MITRE ATT&CK techniques and tactics.",
                            "Build a timeline of the simulated intrusion from initial access through lateral movement.",
                            "Write a hunt report including hypothesis, methodology, findings, and a new detection rule (SPL correlation search) to catch this behavior automatically next time.",
                            "Deploy that new correlation search as a saved alert in Splunk to close the detection gap.",
                        ],
                        "hints": [
                            "Atomic Red Team maps every test directly to an ATT&CK technique ID, which makes documenting coverage easy.",
                            "Event ID 7045 (new service installed) is a classic PsExec artifact worth searching for.",
                            "Sysmon Event ID 1 (process creation) with full command-line logging gives the richest lateral movement evidence.",
                            "A good hunt report is reusable, it should let another analyst repeat the hunt exactly.",
                        ],
                        "common_mistakes": [
                            "Hunting without a specific, testable hypothesis and just 'looking for weird stuff'.",
                            "Not mapping findings to ATT&CK, making the work hard to communicate to other analysts.",
                            "Forgetting to convert a successful hunt into a permanent detection rule, leaving the same gap next time.",
                            "Running the attack simulation on a network that isn't isolated from anything real.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "penetration-testing": {
        "skills": [
            {"key": "recon_and_footprinting", "label": "Recon & Footprinting", "category": "foundation"},
            {"key": "vulnerability_scanning", "label": "Vulnerability Scanning", "category": "foundation"},
            {"key": "web_application_exploitation", "label": "Web Application Exploitation", "category": "core"},
            {"key": "network_and_system_exploitation", "label": "Network & System Exploitation", "category": "core"},
            {"key": "reporting_and_post_exploitation", "label": "Post-Exploitation & Reporting", "category": "advanced"},
        ],
        "skill_edges": [
            ("recon_and_footprinting", "vulnerability_scanning"),
            ("vulnerability_scanning", "web_application_exploitation"),
            ("web_application_exploitation", "network_and_system_exploitation"),
            ("network_and_system_exploitation", "reporting_and_post_exploitation"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn the recon and enumeration phase of the penetration testing methodology (PTES) against a fully legal, intentionally vulnerable target.",
                "skill_key": "recon_and_footprinting",
                "projects": [
                    {
                        "title": "Perform reconnaissance and vulnerability scanning against a legal practice target (TryHackMe/DVWA)",
                        "teaches": "the recon phase of the penetration testing methodology (PTES), passive and active information gathering before any exploitation is attempted",
                        "prerequisites": ["Kali Linux installed (VM or WSL)", "Basic Linux command-line usage"],
                        "expected_output": "A written recon report listing open ports, service versions, discovered web directories, and candidate CVEs for an authorized lab target such as TryHackMe's Basic Pentesting room or a local Metasploitable2/DVWA VM.",
                        "steps": [
                            "Set up Kali Linux (VM or WSL) and spin up an intentionally vulnerable target like TryHackMe's 'Basic Pentesting' room or a local DVWA/Metasploitable2 VM.",
                            "Perform passive recon: check DNS records with `whois` and `dig`/`nslookup` (or read the room's provided info if it's an isolated lab).",
                            "Run an active port/service scan with `nmap -sV -sC <target>` to identify open ports and running service versions.",
                            "Enumerate a discovered web service with `gobuster` or `dirb` to find hidden directories/files.",
                            "Research the identified service versions for known CVEs using `searchsploit`.",
                            "Write up findings in a simple recon report: open ports, services, versions, and any obvious leads (e.g., outdated software).",
                            "Confirm you only scanned the authorized lab target, never anything outside the assigned scope.",
                        ],
                        "hints": [
                            "`nmap -sC -sV -oN scan.txt <target>` saves output for later reference instead of re-running the scan.",
                            "`searchsploit -x <path>` shows exploit code without needing to download it separately.",
                            "gobuster needs a wordlist, install SecLists, the standard one used in most labs.",
                            "Always double-check the target IP/scope before running any scan, every time.",
                        ],
                        "common_mistakes": [
                            "Scanning outside the authorized IP range on a shared lab network.",
                            "Running plain `nmap` without `-sV` and missing service version info needed to find exploits.",
                            "Not saving scan output (no `-oN`/`-oX`) and having to redo the scan later.",
                            "Skipping the room description or scope document and missing an intended hint or boundary.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Use Burp Suite to intercept and manipulate real HTTP traffic, exploiting the OWASP Top 10 in a legal web application lab.",
                "skill_key": "web_application_exploitation",
                "projects": [
                    {
                        "title": "Exploit and document OWASP Top 10 vulnerabilities in DVWA/Juice Shop using Burp Suite",
                        "teaches": "hands-on web application penetration testing, intercepting and manipulating HTTP traffic with Burp Suite to find and exploit SQL injection, XSS, and broken access control",
                        "prerequisites": ["Completion of the recon project", "Docker installed", "Basic understanding of HTTP requests"],
                        "expected_output": "A set of documented vulnerability findings (SQL injection, XSS, and an IDOR) against DVWA or Juice Shop, each with reproduction steps, evidence, and a remediation recommendation, tested across multiple security levels.",
                        "steps": [
                            "Set up DVWA or OWASP Juice Shop locally (Docker is the easiest way) and set the security level to low initially.",
                            "Configure Burp Suite as an intercepting proxy between your browser and the target application.",
                            "Use Burp's Repeater to manually test a login form for SQL injection (e.g., `' OR '1'='1`) and observe the response.",
                            "Use Burp's Intruder to fuzz a parameter for reflected XSS, confirming with a payload like `<script>alert(1)</script>`.",
                            "Test for broken access control by manipulating an object ID in the URL/request to access another user's data (IDOR).",
                            "Increase DVWA's security level and repeat the tests, noting which techniques still work and which are now blocked.",
                            "Write a mini vulnerability report per finding: description, steps to reproduce, evidence (screenshot/request), impact, and remediation.",
                        ],
                        "hints": [
                            "Use Burp's built-in browser to avoid extra proxy/certificate setup headaches.",
                            "Save requests to Repeater so you can replay them with small tweaks instead of retyping.",
                            "Turn Intercept off in Burp Proxy when just browsing, or every request will hang waiting for you.",
                            "Map each finding to its OWASP Top 10 category to structure the report professionally.",
                        ],
                        "common_mistakes": [
                            "Leaving Burp's certificate untrusted in the browser, causing constant HTTPS errors.",
                            "Forgetting to turn off Intercept and wondering why the page won't load.",
                            "Testing only at the lowest DVWA security setting and assuming the app is always this vulnerable.",
                            "Not capturing evidence (request/response pairs) needed to write a credible report.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Run a full, scoped, multi-host penetration test end to end, from initial exploitation through privilege escalation and pivoting, and deliver a professional report.",
                "skill_key": "reporting_and_post_exploitation",
                "projects": [
                    {
                        "title": "Run a full authorized penetration test against a multi-host lab and deliver a professional report",
                        "teaches": "end-to-end penetration testing methodology (PTES), chaining recon, exploitation with Metasploit, privilege escalation, lateral movement, and professional reporting, the way a real paid engagement is run",
                        "prerequisites": ["Completion of the Burp Suite web exploitation project", "Working knowledge of Metasploit basics", "A written, defined scope for the lab"],
                        "expected_output": "A completed multi-host compromise (initial foothold, privilege escalation, and pivot to a second network segment) with full evidence, and a professional penetration test report containing an executive summary, technical findings with severity ratings, and remediation guidance.",
                        "steps": [
                            "Deploy a multi-VM lab (e.g., HackTheBox Pro Labs, TryHackMe network rooms, or a local setup with Metasploitable2 plus a Windows target) with a defined, written scope.",
                            "Perform full recon and vulnerability scanning across all in-scope hosts, prioritizing by exploitability and impact.",
                            "Use Metasploit to exploit an identified vulnerability and get an initial foothold on a target.",
                            "Perform local privilege escalation on the compromised host using enumeration scripts (e.g., LinPEAS/WinPEAS) to identify a path to root/admin.",
                            "From the compromised host, pivot into an internal-only network segment using Metasploit's routing/port-forwarding features to reach a second target.",
                            "Collect evidence throughout (commands run, screenshots, loot) using a note-taking tool like CherryTree or Obsidian.",
                            "Write a full penetration test report: executive summary (business risk, non-technical), technical findings with CVSS-style severity, reproduction steps, and prioritized remediation recommendations.",
                        ],
                        "hints": [
                            "Keep a `scope.txt` open and re-check it before every exploitation attempt.",
                            "Metasploit's `sessions -l` and `route add` are how you pivot into a second network from a compromised host.",
                            "LinPEAS/WinPEAS output is long, grep for the highlighted 'interesting' findings first instead of reading everything.",
                            "A report that only lists vulnerabilities without business impact and remediation isn't a real pentest report.",
                        ],
                        "common_mistakes": [
                            "Exploiting a host that turns out to be out of scope because scope wasn't double-checked.",
                            "Using Metasploit's default settings and forgetting to clean up (leaving a backdoor/service running) after the engagement.",
                            "Writing a report full of raw tool output instead of a translated executive summary a non-technical stakeholder can act on.",
                            "Not validating findings are still exploitable at report time, since conditions can change during a multi-day engagement.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "devops-engineering": {
        "skills": [
            {"key": "linux_and_cli_fundamentals", "label": "Linux & CLI Fundamentals", "category": "foundation"},
            {"key": "containerization", "label": "Containerization", "category": "foundation"},
            {"key": "ci_cd_pipelines", "label": "CI/CD Pipelines", "category": "core"},
            {"key": "infra_as_code_devops", "label": "Infrastructure as Code", "category": "core"},
            {"key": "orchestration_and_reliability", "label": "Orchestration & Reliability", "category": "advanced"},
        ],
        "skill_edges": [
            ("linux_and_cli_fundamentals", "containerization"),
            ("containerization", "ci_cd_pipelines"),
            ("ci_cd_pipelines", "infra_as_code_devops"),
            ("infra_as_code_devops", "orchestration_and_reliability"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn containerization fundamentals by packaging a real application with Docker, the basic unit of nearly every modern deployment.",
                "skill_key": "linux_and_cli_fundamentals",
                "projects": [
                    {
                        "title": "Dockerize a simple web application and run it with Docker Compose",
                        "teaches": "containerization fundamentals, writing a Dockerfile, building an image, and running multi-container apps with Docker Compose",
                        "prerequisites": ["Basic Linux command-line usage", "A simple web app (or willingness to write a one-endpoint Flask app)"],
                        "expected_output": "A working multi-container app (web service + database/cache) started with a single `docker-compose up` command, with a small, properly ignored image.",
                        "steps": [
                            "Write a simple web app (e.g., a Python Flask 'hello world' API with one endpoint) if you don't already have one.",
                            "Write a Dockerfile that starts from an official base image, copies your code, installs dependencies, and defines the run command.",
                            "Build the image locally with `docker build -t myapp:v1 .` and run it with `docker run -p 5000:5000 myapp:v1`.",
                            "Add a second container (e.g., a Redis or Postgres database) and connect the two using a `docker-compose.yml` file.",
                            "Use `docker-compose up` to start both services together and verify the app can reach the database container by its service name.",
                            "Add a `.dockerignore` file to keep unnecessary files (like `.git`, `venv`) out of the image.",
                            "Check the image size with `docker images` and try slimming it down using a smaller base image (e.g., `python:3.11-slim`).",
                        ],
                        "hints": [
                            "Containers on the same Docker Compose network reach each other by service name, not `localhost`.",
                            "Copy `requirements.txt` and run `pip install` before `COPY . .` so Docker's layer cache speeds up rebuilds.",
                            "`docker logs <container>` is the first place to check when a container exits immediately.",
                            "Pin base image versions instead of using `latest` to keep builds reproducible.",
                        ],
                        "common_mistakes": [
                            "Using `localhost` instead of the service name to connect containers in Compose, so the app can't reach the database.",
                            "Copying the entire project directory (including secrets or `.git`) into the image with no `.dockerignore`.",
                            "Forgetting port mapping and wondering why the app is unreachable from the host.",
                            "Building huge images from a full OS base image instead of a slim/alpine variant.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Automate testing, building, and deployment with GitHub Actions, the day-to-day core of the DevOps role.",
                "skill_key": "ci_cd_pipelines",
                "projects": [
                    {
                        "title": "Build a GitHub Actions CI/CD pipeline that tests, builds, and deploys a containerized app",
                        "teaches": "real CI/CD practice, automatically running tests on every push, building a Docker image, and deploying it on merge",
                        "prerequisites": ["Completion of the Docker/Compose project", "A GitHub account and repository", "Basic YAML syntax"],
                        "expected_output": "A GitHub Actions pipeline where every pull request runs automated tests, merges to main automatically build and push a tagged Docker image, and a passing pipeline is required before merge.",
                        "steps": [
                            "Push the Dockerized app from the previous project to a GitHub repository.",
                            "Write a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs automated tests (e.g., pytest) on every pull request.",
                            "Add a job that builds the Docker image and pushes it to a registry (Docker Hub or GitHub Container Registry) only when tests pass and the push is to `main`.",
                            "Use GitHub Actions secrets to store registry credentials instead of hardcoding them.",
                            "Add a deployment job that SSHes into a small cloud VM (or uses a PaaS like Render/Fly.io) and pulls/runs the new image.",
                            "Set up branch protection so `main` can't be merged into unless the CI checks pass.",
                            "Intentionally break a test in a pull request and confirm the pipeline correctly blocks the merge.",
                        ],
                        "hints": [
                            "Use `needs:` in GitHub Actions to run jobs in order (test -> build -> deploy) and skip later jobs if an earlier one fails.",
                            "Tag Docker images with the Git commit SHA, not just `latest`, so you can trace a deployed image back to exact code.",
                            "GitHub Actions secrets are masked in logs automatically, but never `echo` them directly anyway.",
                            "`actions/cache` speeds up dependency installs between workflow runs.",
                        ],
                        "common_mistakes": [
                            "Hardcoding credentials directly in the workflow file instead of using GitHub Secrets.",
                            "Forgetting `needs:` so the deploy job can run even if the test job failed.",
                            "Not pinning action versions (e.g., using `@main` instead of `@v4`), causing pipelines to break unexpectedly when an action updates.",
                            "Deploying on every push, including feature branches, instead of only on merges to `main`.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Run a multi-service app on Kubernetes with autoscaling, health checks, and monitoring, the reliability engineering pattern behind real production systems.",
                "skill_key": "orchestration_and_reliability",
                "projects": [
                    {
                        "title": "Deploy a multi-service app to Kubernetes with autoscaling, health checks, and monitoring",
                        "teaches": "production-grade orchestration and reliability engineering, running containers at scale with Kubernetes, defining self-healing and autoscaling behavior, and observing system health",
                        "prerequisites": ["Completion of the CI/CD pipeline project", "Basic Kubernetes concepts (pods, deployments, services)", "minikube or a cloud Kubernetes cluster"],
                        "expected_output": "A running Kubernetes deployment with liveness/readiness probes, a working Horizontal Pod Autoscaler validated under load, Prometheus/Grafana dashboards showing real metrics, and a written runbook for diagnosing a crash-looping pod.",
                        "steps": [
                            "Set up a local Kubernetes cluster (minikube or kind) or a managed one (a free-tier GKE/EKS cluster).",
                            "Write Kubernetes manifests (Deployment, Service) for your containerized app from the earlier projects, including resource requests/limits.",
                            "Add liveness and readiness probes so Kubernetes can detect and restart unhealthy pods automatically.",
                            "Configure a Horizontal Pod Autoscaler (HPA) to scale replicas based on CPU usage, and load-test the app (e.g., with `hey` or `k6`) to trigger a scale-up.",
                            "Deploy Prometheus and Grafana (or a managed equivalent) to collect and visualize metrics like request latency and pod CPU/memory.",
                            "Simulate a failure (`kubectl delete pod <name>`) and confirm Kubernetes reschedules it automatically, observing the recovery in Grafana.",
                            "Write a short runbook documenting how to diagnose and respond to a pod crash-loop, including the `kubectl` commands used for investigation.",
                        ],
                        "hints": [
                            "`kubectl describe pod <name>` and `kubectl logs <name> --previous` are the first two commands to run when a pod is crash-looping.",
                            "Readiness probes control traffic routing while liveness probes control restarts, they serve different purposes.",
                            "Set realistic resource requests/limits, or the scheduler and HPA will behave unpredictably.",
                            "`kubectl top pods` requires metrics-server to be installed in the cluster to work at all.",
                        ],
                        "common_mistakes": [
                            "Confusing liveness and readiness probes, causing healthy-but-slow-starting pods to be killed prematurely.",
                            "Setting no resource limits, letting one pod starve others on the node.",
                            "Not installing metrics-server, so the HPA silently never scales.",
                            "Treating a single-replica deployment as 'production ready' with no redundancy.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "data-analysis": {
        "skills": [
            {"key": "spreadsheet_fundamentals", "label": "Spreadsheet Fundamentals", "category": "foundation"},
            {"key": "sql_querying", "label": "SQL Querying", "category": "foundation"},
            {"key": "python_data_wrangling", "label": "Python Data Wrangling (pandas)", "category": "core"},
            {"key": "data_visualization", "label": "Data Visualization", "category": "core"},
            {"key": "statistical_storytelling", "label": "Statistical Storytelling", "category": "advanced"},
        ],
        "skill_edges": [
            ("spreadsheet_fundamentals", "sql_querying"),
            ("sql_querying", "python_data_wrangling"),
            ("python_data_wrangling", "data_visualization"),
            ("data_visualization", "statistical_storytelling"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Get comfortable cleaning messy real-world data and pulling out a first useful summary using spreadsheet tools everyone already has.",
                "skill_key": "spreadsheet_fundamentals",
                "projects": [
                    {
                        "title": "Clean and analyze a messy sales spreadsheet in Excel/Google Sheets",
                        "teaches": "cleaning messy real-world data, standardizing text and dates, and summarizing it with pivot tables",
                        "prerequisites": ["Basic computer literacy", "Comfort opening spreadsheet software"],
                        "expected_output": "A cleaned spreadsheet with a pivot table summarizing monthly sales by region/product, plus a pivot chart.",
                        "steps": [
                            "Download a public messy dataset (e.g., a Kaggle 'Superstore' sales CSV) and open it in Excel/Google Sheets.",
                            "Identify inconsistent entries and fix them: trim whitespace, standardize date formats, fix typos in category names.",
                            "Use TRIM, PROPER, and Find & Replace to normalize text columns before doing anything else.",
                            "Remove or flag duplicate rows using conditional formatting or Data > Remove Duplicates.",
                            "Build a Pivot Table summarizing total sales by month and region.",
                            "Add a pivot chart to visualize the trend.",
                            "Write 3-4 bullet takeaways from what the pivot table reveals.",
                        ],
                        "hints": [
                            "Use =TRIM(A2) combined with =PROPER(A2) to normalize inconsistent text before deduping.",
                            "Convert the Date column with DATEVALUE if dates were imported as text, check first with ISTEXT.",
                            "Freeze the header row so you don't lose track of columns while scrolling.",
                        ],
                        "common_mistakes": [
                            "Deleting rows with missing values instead of investigating why they're missing.",
                            "Sorting one column without selecting the whole table, which scrambles rows.",
                            "Using Remove Duplicates without first deciding which columns actually define a 'duplicate'.",
                            "Not converting text-formatted numbers before creating the pivot table, causing SUM to silently return 0.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Combine SQL and pandas to answer a real business question, customer churn, that a single spreadsheet can't handle well.",
                "skill_key": "python_data_wrangling",
                "projects": [
                    {
                        "title": "Analyze customer churn using SQL and pandas",
                        "teaches": "joining relational tables with SQL, pulling query results into pandas, and computing cohort/churn metrics over time",
                        "prerequisites": ["SQL SELECT/WHERE/GROUP BY", "Basic Python syntax", "pandas DataFrame basics"],
                        "expected_output": "A Jupyter notebook that queries a sample SQLite subscriptions database, computes monthly churn rate via SQL, and builds a cohort retention table in pandas.",
                        "steps": [
                            "Set up a local SQLite database with customers, subscriptions, and payments tables (use a synthetic subscriptions dataset).",
                            "Write SQL JOINs combining customer signup dates with subscription cancellation dates.",
                            "Use sqlite3 or sqlalchemy in Python to run the query and load results into a pandas DataFrame.",
                            "Use groupby() and pd.Grouper(freq='M') to compute monthly active and churned customer counts.",
                            "Calculate churn rate as churned / customers_active_at_start_of_month for each cohort.",
                            "Build a cohort retention matrix using pivot_table().",
                            "Visualize the churn trend with matplotlib/seaborn and annotate any anomalies.",
                        ],
                        "hints": [
                            "strftime('%Y-%m', date) in SQLite groups signups by month for cohorting.",
                            "pd.merge_asof() is handy for joining events to the nearest prior subscription record.",
                            "Use .resample('M') on a datetime-indexed DataFrame instead of manual date math.",
                        ],
                        "common_mistakes": [
                            "Computing churn as churned/total_customers instead of churned/customers_active_at_start_of_period, which understates churn.",
                            "Forgetting to convert SQL date strings to pandas datetime with pd.to_datetime, breaking groupby.",
                            "Double-counting customers who churned and resubscribed within the same period.",
                            "Ignoring format mismatches between SQL date strings and pandas datetime parsing.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Ship a full analysis product: an interactive dashboard with statistically grounded anomaly detection and a written narrative for stakeholders.",
                "skill_key": "statistical_storytelling",
                "projects": [
                    {
                        "title": "Build an end-to-end sales performance dashboard with anomaly detection",
                        "teaches": "combining SQL extraction, pandas rolling statistics for anomaly detection, and Tableau/Looker dashboarding for stakeholder storytelling",
                        "prerequisites": ["SQL joins and aggregation", "pandas time series analysis", "Basic statistics (mean, standard deviation)", "Tableau or Looker Studio basics"],
                        "expected_output": "A published interactive dashboard (Tableau Public or Looker Studio) with an anomaly layer flagging weeks that deviated significantly from trend, plus a one-page written executive summary.",
                        "steps": [
                            "Extract and join multi-table sales data via SQL (orders, products, regions) into one analysis-ready table.",
                            "Use pandas to compute a rolling 4-week average and rolling standard deviation of weekly revenue per region.",
                            "Flag weeks where actual revenue falls outside 2 standard deviations of the rolling average as anomalies.",
                            "Export the enriched dataset (with anomaly flags) and connect it to Tableau/Looker Studio.",
                            "Build an interactive dashboard with filters by region/product, a trend line, and anomaly markers.",
                            "Add drill-down so a viewer can click an anomalous week and see the contributing orders.",
                            "Write an executive summary explaining the 2-3 most significant anomalies and a recommended action for each.",
                            "Share the dashboard with a stakeholder, gather feedback, and iterate on one requested change.",
                        ],
                        "hints": [
                            "A rolling z-score (value - rolling_mean)/rolling_std is more robust to seasonality than flagging revenue against a single global average.",
                            "In Tableau, use a calculated field with WINDOW_AVG and WINDOW_STDEV to replicate the pandas rolling stats natively in the dashboard.",
                            "Keep the anomaly threshold configurable as a parameter so stakeholders can tighten or loosen sensitivity themselves.",
                            "Pair every chart with a one-line 'so what' insight, don't just show what happened.",
                        ],
                        "common_mistakes": [
                            "Using a single global mean/std instead of a rolling window, causing normal seasonal peaks to be flagged as anomalies.",
                            "Building a dashboard with too many charts and no clear narrative, so stakeholders don't know what to look at first.",
                            "Not validating the anomaly logic against a known historical event (like a real promotion week) before trusting it.",
                            "Publishing static exports instead of a live connection, so the dashboard goes stale after the first view.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "data-engineering": {
        "skills": [
            {"key": "sql_fundamentals_de", "label": "SQL Fundamentals", "category": "foundation"},
            {"key": "python_scripting_for_data", "label": "Python Scripting for Data", "category": "foundation"},
            {"key": "etl_pipeline_design", "label": "ETL Pipeline Design", "category": "core"},
            {"key": "workflow_orchestration_de", "label": "Workflow Orchestration (Airflow)", "category": "core"},
            {"key": "cloud_data_warehousing", "label": "Cloud Data Warehousing", "category": "advanced"},
        ],
        "skill_edges": [
            ("sql_fundamentals_de", "python_scripting_for_data"),
            ("python_scripting_for_data", "etl_pipeline_design"),
            ("etl_pipeline_design", "workflow_orchestration_de"),
            ("workflow_orchestration_de", "cloud_data_warehousing"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to design a normalized schema and load data into it reliably and repeatably, the core skill underneath every pipeline.",
                "skill_key": "sql_fundamentals_de",
                "projects": [
                    {
                        "title": "Build a normalized database schema and load CSV data with a Python ETL script",
                        "teaches": "schema design (normalization), writing an idempotent Python load script, and basic SQL DDL/DML",
                        "prerequisites": ["Basic Python syntax", "Basic SQL SELECT"],
                        "expected_output": "A local PostgreSQL or SQLite database with a normalized schema (3+ related tables) populated from a messy source CSV via a repeatable Python script.",
                        "steps": [
                            "Pick a raw dataset (e.g., a flat CSV of orders with customer name, product, and address repeated in every row).",
                            "Design a normalized schema on paper: separate customers, products, and orders tables with foreign keys.",
                            "Write SQL CREATE TABLE statements with primary keys and foreign key constraints.",
                            "Write a Python script using psycopg2/sqlite3 that reads the CSV with pandas.read_csv() and inserts rows into the right tables.",
                            "Add logic to avoid inserting duplicate customers/products (INSERT ... ON CONFLICT DO NOTHING or an existence check).",
                            "Run the script twice and confirm it doesn't create duplicate rows the second time (idempotency).",
                            "Write 2-3 SQL JOIN queries to verify the data loaded correctly.",
                        ],
                        "hints": [
                            "Use INSERT ... ON CONFLICT (email) DO NOTHING in Postgres to make inserts idempotent without pre-checking every row.",
                            "Load dimension tables (customers, products) before the fact table (orders) to satisfy foreign key constraints.",
                            "pandas.read_csv(dtype=...) lets you force column types so IDs don't get silently read as floats.",
                        ],
                        "common_mistakes": [
                            "Loading the fact table before the dimension tables, causing foreign key violations.",
                            "Not handling duplicate customers, so the same person ends up with several different customer_ids.",
                            "Hardcoding the CSV file path instead of taking it as a script argument, making the script un-reusable.",
                            "Forgetting to commit the transaction, so the script appears to work but no data actually persists.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Move from one-off loads to a real incremental pipeline that safely re-runs on a schedule against a live external source.",
                "skill_key": "etl_pipeline_design",
                "projects": [
                    {
                        "title": "Build an incremental ETL pipeline that syncs an API into a warehouse table",
                        "teaches": "incremental/delta loading with a watermark, handling API pagination and rate limits, and validating data before load",
                        "prerequisites": ["SQL DDL/DML", "Python requests library", "pandas basics"],
                        "expected_output": "A Python pipeline that pulls new/changed records from a public API since the last run, validates and transforms them, and upserts them into a Postgres table, tracking a watermark of the last successful sync.",
                        "steps": [
                            "Choose a public REST API with a timestamp/updated_at filter parameter (e.g., an open data API).",
                            "Write a Python function that requests only records updated since the stored watermark timestamp.",
                            "Handle pagination, loop through pages until the API signals no more results.",
                            "Add retry logic with exponential backoff for rate-limit (429) or transient errors.",
                            "Validate incoming records (required fields present, correct types) and quarantine bad rows instead of crashing.",
                            "Upsert (INSERT ... ON CONFLICT ... DO UPDATE) valid records into the warehouse table.",
                            "After a successful run, persist the new watermark (max updated_at seen) so the next run only pulls new data.",
                            "Add logging so you can see rows processed, skipped, and failed per run.",
                        ],
                        "hints": [
                            "Store the watermark in a small 'pipeline_state' table in the same database, not a local file, so it survives across environments.",
                            "Use exponential backoff (2**attempt) rather than a fixed sleep to recover gracefully from rate limits.",
                            "Test incremental logic by running the pipeline twice in a row, the second run should process zero or near-zero rows.",
                        ],
                        "common_mistakes": [
                            "Using 'now()' as the new watermark instead of the max updated_at actually seen in the batch, which can skip records if the API lags behind real time.",
                            "Not handling pagination correctly and silently only ingesting the first page of results.",
                            "Crashing the whole pipeline on one malformed record instead of quarantining it and continuing.",
                            "Forgetting idempotency, so re-running after a failure duplicates already-loaded rows.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Orchestrate a production-style pipeline across multiple sources into a cloud warehouse with layered SQL transformations and automated quality checks.",
                "skill_key": "cloud_data_warehousing",
                "projects": [
                    {
                        "title": "Orchestrate a multi-source Airflow pipeline into a cloud data warehouse with layered SQL transformations",
                        "teaches": "DAG design in Airflow, task dependencies and retries, loading raw data into a cloud warehouse, and building tested raw-to-staging-to-mart SQL transformation layers",
                        "prerequisites": ["ETL pipeline design", "SQL window functions", "Basic Airflow or willingness to learn DAG syntax", "A free-tier cloud data warehouse account (BigQuery sandbox, Snowflake trial, etc.)"],
                        "expected_output": "A running Airflow DAG (local via Docker) that pulls data from 2+ sources, loads raw data into a cloud warehouse, and runs layered SQL transformations (raw -> staging -> marts) with automated data quality checks, scheduled to run daily.",
                        "steps": [
                            "Set up Airflow locally (via the official Docker Compose setup) and a free-tier cloud warehouse (BigQuery sandbox or Snowflake trial).",
                            "Design a DAG with separate tasks: extract_source_a, extract_source_b, load_raw, transform_staging, transform_marts, run_data_quality_checks.",
                            "Implement extract tasks as PythonOperators that pull from an API and a CSV/S3 source, writing raw files to cloud storage.",
                            "Implement load tasks that load raw files into raw-layer tables in the warehouse.",
                            "Write staging SQL models that clean and standardize raw tables (deduping, type casting, renaming).",
                            "Write mart SQL models that join staging tables into an analysis-ready fact table.",
                            "Add a data quality task that fails the DAG if row counts drop unexpectedly or nulls appear in required columns.",
                            "Set retries, failure alerting, and a daily schedule_interval, and document the DAG's source -> raw -> staging -> mart lineage.",
                        ],
                        "hints": [
                            "Use Airflow's task dependencies (>>) to enforce that transform tasks never run before their upstream load task succeeds.",
                            "Prefer idempotent, partition-aware loads (e.g., load only yesterday's partition with a templated {{ ds }}) so backfills are safe to re-run.",
                            "Keep transformation SQL in versioned .sql files rather than inline strings, so you can diff and review changes like code.",
                            "Set on_failure_callback on critical tasks so a broken pipeline gets flagged immediately instead of silently producing stale data.",
                        ],
                        "common_mistakes": [
                            "Writing one giant task that does extract+load+transform, making failures hard to isolate and retries expensive.",
                            "Not making tasks idempotent, so a retried task duplicates data instead of safely overwriting it.",
                            "Skipping data quality checks and only discovering a broken pipeline when a stakeholder notices bad numbers in a dashboard.",
                            "Hardcoding today's date instead of using Airflow's execution date context, which breaks backfills.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "ai-engineering": {
        "skills": [
            {
                "key": "python_api_foundations",
                "label": "Python and API Foundations",
                "category": "foundation"
            },
            {
                "key": "prompting_structured_output",
                "label": "Prompting and Structured Output",
                "category": "foundation"
            },
            {
                "key": "llm_application_development",
                "label": "Building with LLM APIs and Tool Calling",
                "category": "core"
            },
            {
                "key": "retrieval_and_grounding",
                "label": "Retrieval and Grounding (RAG)",
                "category": "core"
            },
            {
                "key": "rag_and_evaluation",
                "label": "Evaluating LLM Applications",
                "category": "advanced"
            },
            {
                "key": "production_llm_apps",
                "label": "Cost, Safety and Deployment",
                "category": "advanced"
            }
        ],
        "skill_edges": [
            [
                "python_api_foundations",
                "prompting_structured_output"
            ],
            [
                "prompting_structured_output",
                "llm_application_development"
            ],
            [
                "llm_application_development",
                "retrieval_and_grounding"
            ],
            [
                "retrieval_and_grounding",
                "rag_and_evaluation"
            ],
            [
                "rag_and_evaluation",
                "production_llm_apps"
            ]
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Call a hosted model from Python, learn what a prompt can and cannot control, and measure results against a labelled set from the very first project.",
                "skill_key": "python_api_foundations",
                "projects": [
                    {
                        "title": "Build a support-message classifier with an LLM API and score it on 40 labelled examples",
                        "teaches": "calling a hosted model from Python, writing a clear prompt, and measuring accuracy against a fixed labelled set instead of judging by feel",
                        "prerequisites": [
                            "Python basics (functions, dictionaries, reading a CSV)",
                            "An API key for any LLM provider with a free or low-cost tier, or a local model running in Ollama"
                        ],
                        "expected_output": "A Python script that sends 40 customer messages to a model, gets back one of five categories, and prints accuracy and a confusion table, plus a short log of three prompt versions and their scores.",
                        "steps": [
                            "Pick five intents from the public Banking77 dataset on Hugging Face (for example card arrival, lost card, exchange rate, top up failed, pending transfer) and copy 8 messages for each into a CSV with the true label.",
                            "Create a virtual environment, install the provider's Python package and store the API key in an environment variable, never in the code.",
                            "Write a function that sends one message with a system prompt listing the five categories and asking for the category name only.",
                            "Loop over the 40 rows, store the predictions in a new column and print overall accuracy.",
                            "Print a confusion table with pandas.crosstab and read the wrong answers one by one.",
                            "Write a second prompt version with a one-line definition and one example per category, run it and record the new score.",
                            "Set temperature to 0, run the same prompt twice and check the two runs agree.",
                            "Log prompt version, accuracy, total tokens and approximate cost for each run in a small table in your README."
                        ],
                        "hints": [
                            "Keep the label set small and the instructions short for your first prompt, then add detail only where the confusion table shows mistakes.",
                            "Ask for the category name only and compare in code after lower-casing, so wording differences do not count as errors.",
                            "Do not tune the prompt on all 40 rows and then call the score your result. Keep 10 rows aside that you only score once at the end.",
                            "Read the token usage in the API response so you learn what each run costs."
                        ],
                        "common_mistakes": [
                            "Judging the prompt by trying three messages instead of the whole labelled set.",
                            "Committing the API key to a public repository.",
                            "Counting 'Card Arrival' and 'card_arrival' as different answers because the output was never normalised.",
                            "Changing the prompt and the examples at the same time, so you cannot tell which change helped."
                        ],
                        "difficulty": 1
                    }
                ]
            },
            {
                "title": "Building Real Skills",
                "summary": "Get validated structured output and tool calling working in a small service, with the retries, logging and cost tracking a real application needs.",
                "skill_key": "llm_application_development",
                "projects": [
                    {
                        "title": "Build an LLM-powered assistant with structured outputs and tool calling",
                        "teaches": "calling an LLM API, designing prompts, forcing structured JSON outputs validated with a schema, calling tools, and handling errors, retries and cost",
                        "prerequisites": [
                            "Python and API basics",
                            "Basic prompt engineering",
                            "An API key for an LLM provider"
                        ],
                        "expected_output": "A small Python service that takes free-text support requests, returns validated JSON (category, urgency, summary), calls at least one tool such as an order lookup, and logs token usage, with a test file of 20 example inputs and their expected results.",
                        "steps": [
                            "Choose a narrow task, such as classifying and summarising customer support emails, and write 20 realistic example inputs.",
                            "Write a system prompt and call the LLM API from Python, keeping the key in an environment variable.",
                            "Define a Pydantic model for the output and validate every response against it, retrying once with an error message on failure.",
                            "Add one tool the model can call, such as a function that looks up an order, and handle the tool-call loop.",
                            "Add timeouts, retry with backoff and a fallback response for provider errors.",
                            "Log prompt version, latency and token counts for every call.",
                            "Run the 20 examples, record accuracy by hand, and improve the prompt twice, noting what changed the results."
                        ],
                        "hints": [
                            "Keep temperature low for extraction and classification so results are repeatable.",
                            "Validate outputs in code. Never trust that the model returned the shape you asked for.",
                            "Save the exact prompt version with every result so you can tell which change helped.",
                            "Check cost early. Long prompts repeated thousands of times add up quickly."
                        ],
                        "common_mistakes": [
                            "Judging quality by trying three inputs instead of a fixed test set.",
                            "Parsing free text from the model with string matching instead of structured outputs.",
                            "Putting API keys in the repository.",
                            "Letting a model-chosen tool call run without validating its arguments."
                        ],
                        "difficulty": 3
                    }
                ]
            },
            {
                "title": "Advanced Practice",
                "summary": "Ground a model in real documents with retrieval, measure retrieval and answer quality separately, then add guardrails and deploy the app.",
                "skill_key": "rag_and_evaluation",
                "projects": [
                    {
                        "title": "Build a retrieval-augmented generation app, measure its answer quality and deploy it",
                        "teaches": "chunking and embedding documents, storing vectors, retrieving context, grounding answers with citations, evaluating retrieval and answers against a test set, and serving the app behind an API",
                        "prerequisites": [
                            "LLM API experience",
                            "Basic SQL or vector database concepts",
                            "FastAPI or Flask basics",
                            "Docker basics"
                        ],
                        "expected_output": "A deployed question-answering API over a real document set (for example a product's documentation) that cites its sources, backed by a vector store, with an evaluation report measuring retrieval hit rate and answer correctness on at least 30 test questions and a before and after comparison of one improvement.",
                        "steps": [
                            "Collect a document set you can legally use, such as an open-source project's docs, and split it into chunks with sensible sizes and overlap.",
                            "Create embeddings and store them in a vector database such as pgvector, Chroma or Qdrant.",
                            "Write a retrieval function that returns the top matching chunks and build a prompt that answers only from them and cites the source.",
                            "Write 30 test questions with the correct source passage for each.",
                            "Measure retrieval hit rate (was the right chunk in the top k) and answer correctness, using manual grading plus a rubric-based LLM judge you spot-check.",
                            "Make one improvement, such as a different chunk size, hybrid search or reranking, and report the metrics before and after.",
                            "Wrap the pipeline in a FastAPI endpoint with input limits and rate limiting, and containerise it.",
                            "Deploy it somewhere reachable and write up failure cases, such as questions the documents cannot answer and how the app refuses them."
                        ],
                        "hints": [
                            "Evaluate retrieval separately from generation. Most bad answers start with bad retrieval.",
                            "Tell the model to say it does not know when the context is insufficient, and test that case on purpose.",
                            "Change one thing at a time so you know what moved the numbers.",
                            "Spot-check any LLM-based judge by hand on a sample, since judges have their own biases."
                        ],
                        "common_mistakes": [
                            "Chunking blindly by character count and splitting answers in half.",
                            "Skipping evaluation and shipping on the strength of a few good-looking demos.",
                            "Stuffing too many chunks into the prompt, which raises cost and lowers answer quality.",
                            "Ignoring prompt injection from retrieved documents in an app that handles untrusted content."
                        ],
                        "difficulty": 5
                    }
                ]
            }
        ]
    },
    "product-design": {
        "skills": [
            {"key": "user_research_fundamentals", "label": "Problem Framing & User Research", "category": "foundation"},
            {"key": "wireframing_and_ia", "label": "Flows & Information Architecture", "category": "foundation"},
            {"key": "figma_prototyping", "label": "End-to-End Flow Design", "category": "core"},
            {"key": "product_usability_testing", "label": "Design Systems & Engineering Handoff", "category": "advanced"},
        ],
        "skill_edges": [
            ("user_research_fundamentals", "wireframing_and_ia"),
            ("wireframing_and_ia", "figma_prototyping"),
            ("figma_prototyping", "product_usability_testing"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to talk to real users and turn what they say into a usable persona instead of guessing what they want.",
                "skill_key": "user_research_fundamentals",
                "projects": [
                    {
                        "title": "Conduct user interviews and build a persona for a simple app idea",
                        "teaches": "writing unbiased interview questions, running an interview without leading the participant, and synthesizing qualitative research into a persona",
                        "prerequisites": ["None, a starting project", "Access to 3-5 people willing to be interviewed"],
                        "expected_output": "A written interview script, notes from 3-5 user interviews, and a one-page persona document summarizing goals, frustrations, and behaviors.",
                        "steps": [
                            "Pick a simple problem space (e.g., 'how people track personal expenses' or 'how students pick which classes to take').",
                            "Write 8-10 open-ended interview questions that avoid leading the interviewee ('Would you like a feature that...' is a trap).",
                            "Recruit 3-5 people who represent your target user and schedule 20-30 minute interviews.",
                            "Conduct the interviews, taking notes on verbatim quotes and observed behaviors, not just stated opinions.",
                            "Affinity-map your notes, grouping recurring pain points and needs into themes (sticky notes in FigJam or Miro).",
                            "Synthesize the themes into one persona: name, goals, frustrations, a representative quote, and current workaround behavior.",
                            "Write 3 key insights that will inform your next design decisions.",
                        ],
                        "hints": [
                            "Ask about specific past behavior ('Tell me about the last time you...') rather than hypotheticals ('Would you use...'), people are unreliable predictors of their own future behavior.",
                            "Let silence sit for a few seconds before your next question; people often add their most honest thoughts there.",
                            "One persona is enough for a first project, resist making five personas before you've validated even one.",
                            "Record the interview (with permission) so you can focus on listening instead of frantic note-taking.",
                        ],
                        "common_mistakes": [
                            "Asking leading questions that plant a solution in the interviewee's head ('Don't you wish this app had a dark mode?').",
                            "Interviewing only friends or family who aren't representative of the actual target user.",
                            "Treating a single strong opinion from one interview as universal truth without checking if it repeats across interviews.",
                            "Building a persona around demographics (age, job title) instead of goals and behaviors, which doesn't actually inform design decisions.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Translate research into an actual interactive product experience, built with reusable Figma components.",
                "skill_key": "figma_prototyping",
                "projects": [
                    {
                        "title": "Design and prototype a mobile app flow in Figma with a clickable prototype",
                        "teaches": "translating a user flow into a polished UI, using Figma auto-layout and components, and building an interactive clickable prototype",
                        "prerequisites": ["Basic Figma navigation", "A defined user flow or wireframe", "Basic understanding of mobile UI patterns"],
                        "expected_output": "A Figma file with a small component library (buttons, cards, nav bar), 6-10 high-fidelity screens for a core user flow, and a clickable prototype shareable via link and testable on a phone.",
                        "steps": [
                            "Define the core user flow you're designing (e.g., 'sign up, add first expense, view spending summary').",
                            "Sketch a low-fidelity wireframe of each screen in the flow before touching high-fidelity design.",
                            "Build a small component library in Figma (buttons, input fields, cards) using Auto Layout so they resize consistently.",
                            "Design each screen at high fidelity using your components, keeping consistent spacing, type scale, and color.",
                            "Use Figma's Prototype tab to wire up click interactions between screens, with an appropriate transition per tap.",
                            "Add at least one micro-interaction (e.g., a button state change or a loading spinner) to show interaction detail.",
                            "Generate a shareable prototype link and test it yourself on a real phone via the Figma mobile app.",
                            "Get feedback from 2-3 people clicking through the prototype cold and note where they got confused.",
                            "Write down the one product metric this flow should move (for example, completed first expense) and how you would know it worked.",
                        ],
                        "hints": [
                            "Use Auto Layout on every component from the start, retrofitting it onto a finished design is much more painful.",
                            "Name your layers and frames meaningfully (e.g., 'Screen 2 - Add Expense'), a messy layer panel makes prototyping links error-prone.",
                            "Use Figma variants for button states (default, pressed, disabled) instead of duplicating and manually editing each button.",
                            "Test the prototype cold with someone who hasn't seen the flow before, you already know how to use it, so you won't notice confusing spots.",
                        ],
                        "common_mistakes": [
                            "Designing every screen from scratch instead of using reusable components, so a small change like a button color requires editing dozens of screens by hand.",
                            "Skipping low-fidelity wireframes and jumping straight to high-fidelity, wasting time polishing a flow that isn't right yet.",
                            "Wiring up 'happy path' interactions only and leaving dead-end taps on secondary buttons, breaking the illusion during user testing.",
                            "Ignoring mobile-specific constraints like minimum tap target size and safe areas.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Scale a design from one flow to a whole product: turn an audit into a design system and hand it to engineers so it ships consistently.",
                "skill_key": "product_usability_testing",
                "projects": [
                    {
                        "title": "Build a design system from a product audit and hand it off to engineers with specs and states",
                        "teaches": "auditing a product for inconsistent patterns, defining design tokens and reusable components with variants, documenting usage rules, and handing designs to engineers with specs, states and edge cases",
                        "prerequisites": ["An end-to-end flow designed in Figma", "Components and Auto Layout", "Basic understanding of how front-end code uses tokens and components"],
                        "expected_output": "A Figma library with colour, type and spacing tokens, 10 or more documented components with variants, applied to redesign at least 8 screens, plus an engineering handoff file listing specs, interaction states, edge cases and a short adoption plan agreed with a developer.",
                        "steps": [
                            "Audit an existing product or your own earlier flow and collect every button, input, card and colour in use, noting the inconsistencies.",
                            "Define tokens for colour, type scale and spacing, using semantic names such as color-primary and space-4.",
                            "Build the core components (buttons, inputs, cards, navigation, modals) with variants for size, state and disabled behaviour.",
                            "Write usage documentation for each component: when to use it, when not to, and its accessibility notes.",
                            "Apply the library to redesign at least 8 screens and note which old patterns it replaced.",
                            "Prepare a handoff page covering specs, every interaction state, empty, loading and error cases, and responsive behaviour.",
                            "Walk a developer or engineering friend through the handoff, collect their questions and update the file.",
                            "Write a short adoption plan: what ships first, how the library is versioned and who owns changes.",
                        ],
                        "hints": [
                            "Start from the audit. A system built from real inconsistencies is more convincing than one invented from scratch.",
                            "Use semantic token names so a brand colour change updates every screen without breaking them.",
                            "Engineers need states and edge cases more than extra polish. Show loading, empty and error views explicitly.",
                            "A design system is a product with users. Decide how requests and changes are handled.",
                        ],
                        "common_mistakes": [
                            "Building a large component library nobody documents, so it is reimplemented inconsistently in code.",
                            "Handing off only the happy path and leaving states and edge cases for engineers to invent.",
                            "Naming tokens after values (blue-500 everywhere) instead of purpose, which makes changes painful.",
                            "Treating the system as finished instead of versioning it as the product evolves.",
                        ],
                        "difficulty": 5,
                    },
                ],
            },
        ],
    },
    "ui-ux-design": {
        "skills": [
            {"key": "uxd_user_research", "label": "User Research", "category": "foundation"},
            {"key": "uxd_wireframing", "label": "Wireframing", "category": "foundation"},
            {"key": "uxd_visual_design", "label": "Interface & Visual Design", "category": "core"},
            {"key": "uxd_prototyping", "label": "Prototyping", "category": "core"},
            {"key": "uxd_usability_testing", "label": "Usability Testing & Accessibility", "category": "advanced"},
        ],
        "skill_edges": [
            ("uxd_user_research", "uxd_wireframing"),
            ("uxd_wireframing", "uxd_visual_design"),
            ("uxd_visual_design", "uxd_prototyping"),
            ("uxd_prototyping", "uxd_usability_testing"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to translate a real interface's content into a clear visual hierarchy using low-fidelity wireframes in Figma, before any color or polish is applied.",
                "skill_key": "uxd_wireframing",
                "projects": [
                    {
                        "title": "Wireframe a redesign of a cluttered mobile app screen",
                        "teaches": "translating a real interface's content into a clear information hierarchy using low-fidelity wireframes",
                        "prerequisites": ["Basic Figma navigation", "Familiarity with mobile app UI conventions"],
                        "expected_output": "A set of 3-5 low-fidelity wireframes in Figma for a redesigned screen (e.g. a cluttered food delivery checkout screen), with a one-paragraph rationale.",
                        "steps": [
                            "Pick an app screen you find confusing or cluttered and take a screenshot of it.",
                            "List every piece of content and every action the screen currently asks the user to notice or do.",
                            "Group related items and rank them by importance to the user's primary task.",
                            "In Figma, create low-fidelity wireframes using only boxes, lines, and placeholder text (no color, no real copy) for 3-5 screen states.",
                            "Use Figma's frame and auto-layout tools to keep spacing consistent across screens.",
                            "Write a short rationale explaining why you moved, removed, or added each element.",
                            "Get feedback from at least 2 people who haven't seen the original screen and revise based on their confusion points.",
                        ],
                        "hints": [
                            "Constrain yourself to grayscale and default system fonts at this stage; color and typography are a later problem.",
                            "Use Figma's frame presets (e.g. iPhone 14) so your wireframe respects real screen dimensions.",
                            "If you can't explain in one sentence why an element is on the screen, it's a candidate for removal.",
                        ],
                        "common_mistakes": [
                            "Jumping straight to high-fidelity color and imagery before the layout and hierarchy are solid.",
                            "Designing for an assumed user instead of writing down who the user actually is and what task they're doing.",
                            "Cramming every feature onto one screen instead of splitting flows across multiple screens.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Turn static wireframes into an interactive Figma prototype and validate the flow by moderating real usability test sessions.",
                "skill_key": "uxd_prototyping",
                "projects": [
                    {
                        "title": "Prototype an onboarding flow and run a moderated usability test",
                        "teaches": "interactive prototyping (component states, transitions) and running and moderating a usability test to validate a flow",
                        "prerequisites": ["Wireframing", "Basic Figma components and auto layout", "A defined user flow to test"],
                        "expected_output": "A clickable Figma prototype covering a full task flow (e.g. sign-up and onboarding, 6-8 screens) plus a written usability test report from 5 test sessions.",
                        "steps": [
                            "Convert your wireframes into mid or high-fidelity screens using reusable Figma components such as buttons, inputs, and a nav bar.",
                            "Wire up interactions in Figma's prototyping tab: link hotspots between frames, set transition animations, and add overlay states for modals.",
                            "Write a 5-task usability test script, e.g. 'Create an account and reach the dashboard.'",
                            "Recruit 5 people and run moderated sessions, screen-sharing the prototype and asking them to think aloud.",
                            "Record where users hesitate, misclick, or get confused, timestamping each issue.",
                            "Synthesize findings into a severity-ranked list of usability issues.",
                            "Revise the prototype to fix the top 3 issues and note what changed and why.",
                        ],
                        "hints": [
                            "Use Figma variants and component properties so a button's hover or pressed state updates everywhere at once.",
                            "Ask users to think aloud rather than asking 'does this make sense?' since leading questions bias results.",
                            "Test with 5 users first; that sample size tends to surface most major usability issues.",
                        ],
                        "common_mistakes": [
                            "Explaining the interface to the tester instead of watching them struggle silently.",
                            "Only testing the happy path and never testing error states like a wrong password or an empty form.",
                            "Treating every piece of feedback as equally important instead of ranking it by severity and frequency.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Make an interface work for everyone: audit a live product against accessibility standards and redesign the interactions that fail.",
                "skill_key": "uxd_usability_testing",
                "projects": [
                    {
                        "title": "Audit a live interface against WCAG 2.2 AA and redesign the failing screens with accessible interaction patterns",
                        "teaches": "auditing an interface for contrast, keyboard use, focus order, touch target size and screen reader labelling, then redesigning forms, navigation and feedback patterns so they work for people using assistive technology",
                        "prerequisites": ["Prototyping", "Usability testing", "Basic understanding of WCAG principles (perceivable, operable, understandable, robust)"],
                        "expected_output": "An accessibility audit of 5 to 8 real screens with each issue rated by severity and mapped to a WCAG success criterion, plus redesigned screens in Figma with annotated focus order, contrast values, labels and error states, and a short test report from at least two people using keyboard-only or screen reader navigation.",
                        "steps": [
                            "Pick a real website or app with a sign-up or checkout flow and capture 5 to 8 representative screens.",
                            "Check colour contrast of text and controls against WCAG AA (4.5 to 1 for body text, 3 to 1 for large text and interface components).",
                            "Navigate the whole flow with the keyboard only and note every place focus is lost, trapped or invisible.",
                            "Run a screen reader pass (VoiceOver or NVDA) and list unlabelled controls, missing headings and confusing announcements.",
                            "Log each problem with the WCAG criterion it breaks and a severity based on how badly it blocks the task.",
                            "Redesign the failing screens in Figma: accessible form labels and error messages, visible focus states, adequate touch targets and clear status feedback.",
                            "Annotate the designs with focus order, reading order and the text alternatives engineers will need.",
                            "Test the redesign with at least two people using keyboard or screen reader navigation and revise what still fails.",
                        ],
                        "hints": [
                            "Never rely on colour alone to show an error or a state. Add text or an icon too.",
                            "Placeholder text is not a label. Use a visible label that stays on screen while typing.",
                            "A contrast plugin in Figma and the browser's built-in accessibility inspector make the first pass fast.",
                            "Automated tools catch only a fraction of issues. The keyboard and screen reader passes find the rest.",
                        ],
                        "common_mistakes": [
                            "Treating accessibility as a final checklist instead of designing for it from the first wireframe.",
                            "Removing the focus outline because it looks untidy, leaving keyboard users lost.",
                            "Writing error messages like 'Invalid input' that do not say what is wrong or how to fix it.",
                            "Annotating nothing, so engineers have to guess the focus order and labels.",
                        ],
                        "difficulty": 5,
                    },
                ],
            },
        ],
    },
    "product-management": {
        "skills": [
            {"key": "pm_user_research", "label": "User Research", "category": "foundation"},
            {"key": "pm_prioritization", "label": "Prioritization", "category": "foundation"},
            {"key": "pm_roadmapping", "label": "Roadmapping", "category": "core"},
            {"key": "pm_analytics_metrics", "label": "Analytics & Metrics", "category": "core"},
            {"key": "pm_stakeholder_alignment", "label": "Stakeholder Alignment", "category": "advanced"},
        ],
        "skill_edges": [
            ("pm_user_research", "pm_prioritization"),
            ("pm_prioritization", "pm_roadmapping"),
            ("pm_roadmapping", "pm_analytics_metrics"),
            ("pm_analytics_metrics", "pm_stakeholder_alignment"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to run structured customer discovery interviews and turn raw conversations into a defensible written problem statement before jumping to solutions.",
                "skill_key": "pm_user_research",
                "projects": [
                    {
                        "title": "Run customer discovery interviews and write a problem brief",
                        "teaches": "structuring and running discovery interviews and synthesizing them into a written problem statement, without solutioning too early",
                        "prerequisites": ["A starting product idea or existing product to investigate"],
                        "expected_output": "A one-page problem brief backed by notes from 5 customer discovery interviews, including a clear problem statement, target user, and supporting evidence.",
                        "steps": [
                            "Pick a product or feature idea and write down your assumptions about who has the problem.",
                            "Draft an interview guide of 8-10 open-ended questions, avoiding yes/no and leading questions.",
                            "Recruit 5 people who match your target user and schedule 20-30 minute conversations.",
                            "Run the interviews asking about their current behavior and past experiences, not hypothetical future preferences.",
                            "Take verbatim notes or record with permission, and tag recurring pains, workarounds, and quotes.",
                            "Synthesize notes into a one-page problem brief: problem statement, evidence, and who is most affected.",
                            "Share the brief with 2 peers and ask them to poke holes in your evidence before you move to solutioning.",
                        ],
                        "hints": [
                            "Ask 'tell me about the last time...' to get concrete stories instead of opinions.",
                            "If 4 of 5 users mention the same workaround unprompted, that's a strong signal; one mention isn't.",
                            "Separate what people say from what they do, and watch for gaps between stated and actual behavior.",
                        ],
                        "common_mistakes": [
                            "Pitching your solution during the interview instead of listening for the problem.",
                            "Asking hypothetical questions like 'would you pay for this?' that produce unreliable answers.",
                            "Writing the problem brief around one compelling quote instead of the pattern across interviews.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Turn a messy backlog into a prioritized, sequenced roadmap using a scoring framework, and learn to communicate trade-offs to stakeholders.",
                "skill_key": "pm_roadmapping",
                "projects": [
                    {
                        "title": "Build a RICE-scored quarterly roadmap and present it",
                        "teaches": "translating a backlog of feature ideas into a prioritized, sequenced roadmap using a scoring framework (RICE) and communicating trade-offs",
                        "prerequisites": ["User research", "A backlog of at least 10-15 candidate features or ideas", "Basic spreadsheet skills"],
                        "expected_output": "A RICE-scored backlog spreadsheet, a quarterly roadmap showing Now/Next/Later, and a one-page stakeholder narrative explaining the sequencing.",
                        "steps": [
                            "Collect 10-15 candidate features or ideas from research, support tickets, and stakeholder requests.",
                            "Score each on Reach, Impact, Confidence, and Effort (RICE) using explicit, written assumptions for each score.",
                            "Rank items by RICE score and sanity-check the ranking against business goals.",
                            "Group ranked items into a Now/Next/Later roadmap for the next quarter using a roadmapping tool.",
                            "Identify dependencies between items and adjust the sequencing accordingly.",
                            "Write a one-page narrative explaining why the top 3 items were prioritized and what got deprioritized and why.",
                            "Present the roadmap to 2-3 mock stakeholders from engineering, sales, and support, and revise based on pushback.",
                        ],
                        "hints": [
                            "Write down your Reach, Impact, and Confidence assumptions in the spreadsheet, not just the final number.",
                            "A roadmap without explicit 'later' items invites scope creep; say what you're not doing.",
                            "Confidence scores should be honest; a 100 percent confidence guess is a red flag.",
                        ],
                        "common_mistakes": [
                            "Scoring every feature as 'high impact' because it's hard to be honest about weak ideas.",
                            "Building a roadmap as a fixed list of dates instead of a sequenced set of outcomes that can flex.",
                            "Presenting the roadmap without a narrative, so stakeholders only see the 'no' and not the reasoning.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Run a full product cycle: define success metrics before launch, instrument analytics, ship a phased rollout, and use real usage data to make an iterate, scale, or kill decision.",
                "skill_key": "pm_analytics_metrics",
                "projects": [
                    {
                        "title": "Ship a feature and run a metrics-driven post-launch analysis",
                        "teaches": "running a full product cycle: defining success metrics before launch, instrumenting analytics, launching with a rollout plan, and analyzing usage data to decide iterate, kill, or scale",
                        "prerequisites": ["Roadmapping", "Basic SQL or analytics tool literacy (e.g. Amplitude, Mixpanel, or GA4)", "Access to or a simulated dataset for a shipped feature"],
                        "expected_output": "A pre-launch PRD with defined success metrics and an instrumentation plan, a phased rollout plan, a post-launch analytics dashboard, and a written decision memo backed by data.",
                        "steps": [
                            "Write a PRD that defines the problem, target metric (e.g. activation rate, weekly retention), and a specific success threshold before writing any code or design.",
                            "Define the event tracking plan: which user actions need to be logged, with what properties, to measure the target metric.",
                            "Implement or simulate the feature and instrument analytics events using a tool like Amplitude, Mixpanel, GA4, or a mock dataset.",
                            "Plan a phased rollout, e.g. 10 percent to 50 percent to 100 percent, with a defined rollback trigger if a guardrail metric worsens.",
                            "After a defined observation window, pull the data and build a simple dashboard showing the target metric and 1-2 guardrail metrics.",
                            "Segment the data by cohort or platform to check whether the effect is uniform or concentrated in one group.",
                            "Write a decision memo recommending iterate, scale, or kill, with the evidence and its limitations stated explicitly.",
                            "Present the memo to mock stakeholders and defend the recommendation against pushback.",
                        ],
                        "hints": [
                            "Define the success threshold before you see the data; post-hoc thresholds are how teams fool themselves.",
                            "Watch for Simpson's paradox, where an overall metric can look flat while it's up in one segment and down in another.",
                            "A guardrail metric matters as much as the target metric; a feature that boosts engagement but tanks retention isn't a win.",
                        ],
                        "common_mistakes": [
                            "Shipping without an instrumentation plan, then trying to reconstruct usage data after the fact.",
                            "Declaring success from a metric bump without checking statistical significance or sample size.",
                            "Writing a decision memo that only presents supporting data and omits contradicting signals.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "technical-writing": {
        "skills": [
            {"key": "markdown_fundamentals", "label": "Markdown Fundamentals", "category": "foundation"},
            {"key": "tw_information_architecture", "label": "Information Architecture", "category": "foundation"},
            {"key": "api_documentation", "label": "API Documentation", "category": "core"},
            {"key": "docs_as_code_workflows", "label": "Docs-as-Code Workflows", "category": "core"},
            {"key": "style_and_editing_at_scale", "label": "Style & Editing at Scale", "category": "advanced"},
        ],
        "skill_edges": [
            ("markdown_fundamentals", "tw_information_architecture"),
            ("tw_information_architecture", "api_documentation"),
            ("api_documentation", "docs_as_code_workflows"),
            ("docs_as_code_workflows", "style_and_editing_at_scale"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to write clear, scannable Markdown documentation and structure it so a first-time user can actually install and use a tool.",
                "skill_key": "markdown_fundamentals",
                "projects": [
                    {
                        "title": "Write a README for an existing open-source CLI tool",
                        "teaches": "writing clear, scannable technical documentation in Markdown, and structuring a README so a new user can install and use a tool",
                        "prerequisites": ["Basic command-line familiarity", "A GitHub account"],
                        "expected_output": "A polished README.md with installation, usage, and troubleshooting sections, rendered correctly on GitHub, for a real tool with a thin or missing README.",
                        "steps": [
                            "Find a small open-source CLI tool or script with a thin or missing README, or use one of your own scripts.",
                            "Install and actually run the tool yourself, writing down every step and every error you hit.",
                            "Structure the README with standard sections: Overview, Installation, Usage, Examples, Troubleshooting.",
                            "Write installation steps as copy-pasteable shell commands in fenced code blocks with the correct language tag.",
                            "Add at least 2 realistic usage examples showing input and expected output.",
                            "Use Markdown headings consistently, one H1 followed by H2s, so a table of contents can be auto-generated.",
                            "Have someone unfamiliar with the tool follow your README exactly and note where they get stuck.",
                        ],
                        "hints": [
                            "Test every command in your README by actually running it; copy-paste errors are the most common README bug.",
                            "Use fenced code blocks with a language identifier, like triple-backtick bash, so GitHub applies syntax highlighting.",
                            "Put the most common use case first; don't make readers scroll through edge cases to find how to start.",
                        ],
                        "common_mistakes": [
                            "Writing installation steps from memory instead of running them fresh on a clean environment.",
                            "Skipping the context of why someone would use the tool and jumping straight into flags and options.",
                            "Inconsistent heading levels that break auto-generated tables of contents.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Document a real REST API end to end: endpoint reference, authentication, error handling, and a task-based quickstart, following the conventions of docs like Stripe's or Twilio's.",
                "skill_key": "api_documentation",
                "projects": [
                    {
                        "title": "Document a REST API with a reference and quickstart guide",
                        "teaches": "writing API reference documentation (endpoints, parameters, request/response examples) and a task-based getting-started guide",
                        "prerequisites": ["Markdown and docs-as-code basics", "Ability to make HTTP requests with a tool like Postman or curl", "A public API to document, or an OpenAPI/Swagger spec"],
                        "expected_output": "A set of Markdown documentation pages covering a public API's authentication, 5+ endpoints with real request and response examples, and a quickstart tutorial that gets a developer to a successful first API call.",
                        "steps": [
                            "Pick a public API with an OpenAPI/Swagger spec, or a simple API you build yourself, and get authenticated access.",
                            "Make real requests to at least 5 endpoints using curl or Postman, capturing actual request and response payloads.",
                            "Write a reference page per endpoint: method, URL, parameters with types and whether they're required, a real request example, and a real response example including error responses.",
                            "Write a quickstart tutorial that gets a developer from getting an API key to a successful authenticated call in under 10 minutes of reading.",
                            "Document error codes and rate limits, including what a client should do when it hits them.",
                            "Organize the docs as Markdown files in a Git repo, structured so they could be built by a static site generator like Docusaurus or MkDocs.",
                            "Have a developer who has never used the API try the quickstart and time how long it takes them to get a successful response.",
                        ],
                        "hints": [
                            "Always show a real, working curl example; invented examples with placeholder values often have subtle syntax errors.",
                            "Document error responses with the same rigor as success responses; that's what developers search for when debugging.",
                            "Keep the quickstart to the minimum path to one successful call, and save configuration options for the reference pages.",
                        ],
                        "common_mistakes": [
                            "Documenting only the happy path and leaving error handling as an afterthought or omitting it entirely.",
                            "Letting reference docs drift out of sync with the actual API because they were written once and never re-verified.",
                            "Writing parameter descriptions that just restate the parameter name, like 'id: the id', instead of explaining what it means and valid values.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Build a versioned docs-as-code pipeline with automated link and style checks in CI, and lead a documentation overhaul that edits multiple contributors into a single consistent style.",
                "skill_key": "style_and_editing_at_scale",
                "projects": [
                    {
                        "title": "Build a CI-checked, versioned docs-as-code pipeline and edit multi-writer contributions",
                        "teaches": "building a scalable documentation system with a docs-as-code pipeline, automated builds, link checking, style linting in CI, versioning for multiple releases, and editing contributions from multiple writers into a consistent style guide",
                        "prerequisites": ["API documentation", "Git and GitHub workflow basics", "Familiarity with a static site generator like MkDocs or Docusaurus"],
                        "expected_output": "A live documentation site built from a docs-as-code repo, CI that runs link-checking and a style linter on every pull request, versioned docs for at least 2 product releases, and a written style guide used to edit at least 3 externally contributed pages into consistency.",
                        "steps": [
                            "Set up a docs-as-code repo using a static site generator, MkDocs or Docusaurus, with Markdown source files and a build pipeline.",
                            "Configure CI, such as GitHub Actions, to build the docs, run a broken-link checker, and fail the build on broken links.",
                            "Add a prose linter such as Vale, configured with a written style guide covering terminology, voice, heading capitalization, and sentence length, and wire it into CI.",
                            "Set up versioned docs, such as v1 and v2, so users on an older product version see accurate docs for that version.",
                            "Recruit or simulate 3 external contributors submitting doc pull requests, and edit their drafts for structure, accuracy, and style-guide compliance.",
                            "Write review comments that teach the contributor the reasoning behind each edit, not just the fix, so future submissions need less editing.",
                            "Measure and report a docs health metric, such as the percentage of pages updated in the last 2 releases or the number of broken links caught by CI before merge.",
                            "Publish the versioned site and write a contribution guide so new writers and engineers can add docs without your direct involvement.",
                        ],
                        "hints": [
                            "A style guide only helps if it's enforced automatically; a linter like Vale catches inconsistencies like 'utilize' vs. 'use' that humans miss in review.",
                            "Version docs by URL path, like /v1/ and /v2/, so old links from support tickets keep working.",
                            "When editing a contributor's draft, preserve their technical accuracy first and fix voice and structure second; don't introduce inaccuracies while copyediting.",
                        ],
                        "common_mistakes": [
                            "Adding CI checks that block merges without a clear message telling the contributor how to fix the failure, causing frustration and bypassed checks.",
                            "Letting old API versions' docs silently go stale because there's no versioning strategy.",
                            "Writing a style guide nobody reads because it's a wall of prose instead of a short, example-driven reference.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "qa-engineering": {
        "skills": [
            {"key": "test_case_design", "label": "Test Case Design", "category": "foundation"},
            {"key": "bug_reporting_tracking", "label": "Bug Reporting & Tracking", "category": "foundation"},
            {"key": "test_automation", "label": "Test Automation", "category": "core"},
            {"key": "regression_and_ci_testing", "label": "Regression & CI Testing", "category": "core"},
            {"key": "test_strategy_at_scale", "label": "Test Strategy at Scale", "category": "advanced"},
        ],
        "skill_edges": [
            ("test_case_design", "bug_reporting_tracking"),
            ("bug_reporting_tracking", "test_automation"),
            ("test_automation", "regression_and_ci_testing"),
            ("regression_and_ci_testing", "test_strategy_at_scale"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to design structured manual test cases covering positive, negative, and boundary conditions, then write bug reports precise enough for a stranger to reproduce.",
                "skill_key": "test_case_design",
                "projects": [
                    {
                        "title": "Write and execute a manual test suite for a login flow",
                        "teaches": "designing structured manual test cases (positive, negative, boundary) for a feature, executing them, and writing clear, reproducible bug reports",
                        "prerequisites": ["Access to any web app with a login or signup form, yours or a public demo site"],
                        "expected_output": "A test case document covering 15-20 test cases for a login and signup flow, execution results, and 3-5 filed bug reports with clear repro steps for real bugs found.",
                        "steps": [
                            "Pick a real login or signup flow to test, such as a demo e-commerce site or your own project.",
                            "Write test cases covering positive paths like valid login, negative paths like wrong password or empty fields, and boundary cases like max-length passwords or special characters in email.",
                            "Structure each test case with an ID, title, preconditions, steps, expected result, actual result, and pass or fail.",
                            "Execute all test cases manually, recording actual results exactly as observed.",
                            "For every failure, write a bug report with title, environment (browser and OS), exact repro steps, expected vs. actual result, and severity.",
                            "Attach a screenshot or screen recording to at least 2 bug reports.",
                            "Peer-review one bug report with someone else and check whether they can reproduce the bug from your steps alone.",
                        ],
                        "hints": [
                            "A good bug report is reproducible by a stranger; if your steps require 'you'll know it when you see it,' they're incomplete.",
                            "Boundary and negative cases, like empty input or a 300-character name, find more real bugs than the happy path.",
                            "Separate 'expected result' from 'actual result' explicitly in every test case; don't just write pass or fail.",
                        ],
                        "common_mistakes": [
                            "Only testing the happy path and skipping negative and edge cases, missing the bugs that actually ship to users.",
                            "Writing vague bug titles like 'login broken' instead of specific ones like 'login fails silently with valid credentials when email has trailing whitespace'.",
                            "Omitting environment details like browser version and OS, making bugs hard for developers to reproduce.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Automate a UI regression suite with Playwright or Selenium using a page object model, so critical flows are checked without hours of repetitive manual testing.",
                "skill_key": "test_automation",
                "projects": [
                    {
                        "title": "Automate a UI regression suite with Playwright and a page object model",
                        "teaches": "writing maintainable automated UI tests using Playwright or Selenium, structuring tests with the page object model, and running them as a repeatable suite",
                        "prerequisites": ["Test case design", "Basic JavaScript or Python", "A web app to test, a demo site or your own"],
                        "expected_output": "An automated test suite of 10-15 tests built with Playwright or Selenium covering a critical user flow, structured with a page object model, runnable from the command line with a pass/fail report.",
                        "steps": [
                            "Choose a critical user flow on a real web app, such as search, add to cart, and checkout on a demo e-commerce site.",
                            "Set up a Playwright or Selenium project with a test runner such as pytest or Playwright Test.",
                            "Build page object classes that encapsulate selectors and actions for each page, such as LoginPage.login(username, password), instead of hardcoding selectors in tests.",
                            "Write 10-15 tests covering the flow's happy paths and key negative cases, using explicit waits and assertions rather than fixed sleeps.",
                            "Add data-driven tests where the same test runs against multiple input sets, such as different invalid card numbers at checkout.",
                            "Run the suite locally and capture a screenshot automatically on any test failure.",
                            "Intentionally break one part of the app, or simulate a regression, and confirm your suite catches it.",
                        ],
                        "hints": [
                            "Prefer explicit waits for an element or state over time.sleep(); sleeps make suites slow and still flaky.",
                            "Use stable selectors like data-testid attributes instead of CSS classes that change with styling updates.",
                            "Keep one assertion focus per test so a failure tells you exactly what broke.",
                        ],
                        "common_mistakes": [
                            "Hardcoding selectors directly in test files instead of a page object model, so a UI change breaks 10 tests instead of 1 method.",
                            "Using fixed sleep() calls that make the suite slow and still flaky under different load conditions.",
                            "Writing tests that depend on execution order or leftover state from a previous test instead of resetting test data.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Integrate automated tests into a CI/CD pipeline with parallel cross-browser execution and flaky-test handling, and back it with a risk-based test strategy for what deserves automation.",
                "skill_key": "test_strategy_at_scale",
                "projects": [
                    {
                        "title": "Build a CI-integrated regression pipeline with a risk-based test strategy",
                        "teaches": "integrating automated tests into a CI/CD pipeline that runs on every pull request, parallelizing cross-browser execution, and applying a risk-based test strategy to decide what to automate vs. test manually vs. skip",
                        "prerequisites": ["Test automation with Selenium or Playwright", "Basic CI/CD familiarity such as GitHub Actions", "An existing automated test suite"],
                        "expected_output": "A CI pipeline that runs the automated suite in parallel across at least 2 browsers on every pull request, blocks merges on failure, reports flaky tests separately from real failures, plus a written risk-based test strategy document.",
                        "steps": [
                            "Take an existing automated UI suite and wire it into a CI pipeline that runs on every pull request.",
                            "Configure the suite to run across at least 2 browsers or engines, such as Chromium and WebKit via Playwright, in parallel to control total run time.",
                            "Add retry logic or a flaky-test quarantine so a genuinely flaky test doesn't block every PR, while still tracking it for a fix.",
                            "Set up the pipeline to fail the build on real test failures and post results as a PR comment.",
                            "Write a risk-based test strategy: map product areas by risk, frequency of use times cost of failure, and decide per area whether it gets automated regression coverage, manual exploratory testing each release, or minimal coverage.",
                            "Add a smoke test subset that runs in under 5 minutes for every commit, separate from the full regression suite that runs nightly.",
                            "Track and report a metric over time, such as suite runtime, flaky test rate, or defect escape rate, the bugs found in production that tests should have caught.",
                            "Present the strategy and pipeline to a mock engineering team, defending trade-offs for why some areas aren't automated.",
                        ],
                        "hints": [
                            "Separate 'flaky and re-passed on retry' from 'failed twice' in your CI report; treating them the same erodes trust in the whole suite.",
                            "Not everything deserves automation; high-risk, low-frequency-of-change areas are often better served by scripted manual or exploratory testing.",
                            "Track defect escape rate to know if your test strategy is actually working, not just whether tests pass.",
                        ],
                        "common_mistakes": [
                            "Automating everything indiscriminately, producing a slow, brittle suite that the team starts ignoring or disabling.",
                            "Blocking every PR on a full slow suite instead of a fast smoke suite, so engineers start merging around CI or disabling checks.",
                            "Never revisiting the risk-based strategy as the product changes, so coverage stays frozen on features that no longer matter.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "workflow-automation": {
        "skills": [
            {
                "key": "automation_logic",
                "label": "Triggers, Actions and Filters",
                "category": "foundation"
            },
            {
                "key": "spreadsheet_database_thinking",
                "label": "Spreadsheet and Airtable Data Structuring",
                "category": "foundation"
            },
            {
                "key": "nca_workflow_orchestration",
                "label": "Multi-Step Workflow Orchestration",
                "category": "core"
            },
            {
                "key": "api_webhook_integration",
                "label": "Webhooks and API Integration",
                "category": "core"
            },
            {
                "key": "workflow_reliability",
                "label": "Error Handling, Monitoring and Handover",
                "category": "advanced"
            }
        ],
        "skill_edges": [
            [
                "automation_logic",
                "spreadsheet_database_thinking"
            ],
            [
                "spreadsheet_database_thinking",
                "nca_workflow_orchestration"
            ],
            [
                "nca_workflow_orchestration",
                "api_webhook_integration"
            ],
            [
                "api_webhook_integration",
                "workflow_reliability"
            ]
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn the trigger-action model that underlies every no-code automation, and build a real working Zap that connects two apps together.",
                "skill_key": "automation_logic",
                "projects": [
                    {
                        "title": "Build a 'New Form Submission to Slack' Zap",
                        "teaches": "how trigger-action automation works and how to connect apps without writing code",
                        "prerequisites": [
                            "A free Zapier account",
                            "A Google account",
                            "A Slack workspace (or Discord)"
                        ],
                        "expected_output": "A live Zapier automation (a Zap) that automatically posts a formatted Slack message every time someone submits a Google Form.",
                        "steps": [
                            "Create a Google Form with 3-4 fields (e.g., name, email, message).",
                            "In Zapier, create a new Zap and choose 'Google Forms - New Form Response' as the trigger.",
                            "Connect your Google account and select the specific form to watch.",
                            "Add a 'Slack - Send Channel Message' action step.",
                            "Use Zapier's field-mapping to insert the form's answers into the Slack message text.",
                            "Test the Zap with a sample form submission and confirm the Slack message appears correctly formatted.",
                            "Turn the Zap on and submit a real test response to confirm it fires automatically."
                        ],
                        "hints": [
                            "Zapier's 'Test trigger' step pulls a real past submission, use it to check your field mapping before turning the Zap on.",
                            "Use Slack's mrkdwn formatting (*bold*, _italic_) directly in the message field for a cleaner-looking notification.",
                            "If the trigger doesn't show new data, check the Google account permissions Zapier was granted."
                        ],
                        "common_mistakes": [
                            "Leaving the Zap in draft/off mode and wondering why nothing fires.",
                            "Hardcoding placeholder text in the Slack message instead of mapping the actual form field, so every message looks the same.",
                            "Not testing with real data first, causing the Zap to fail silently on edge cases like empty fields.",
                            "Choosing the wrong trigger event (e.g., 'New Response in Spreadsheet' vs 'New Form Response') and getting duplicate or missed triggers."
                        ],
                        "difficulty": 1
                    }
                ]
            },
            {
                "title": "Building Real Skills",
                "summary": "Move from single-step automations to branching, multi-app workflows backed by a real Airtable database, the kind of pipeline a small business actually runs on.",
                "skill_key": "nca_workflow_orchestration",
                "projects": [
                    {
                        "title": "Build a Multi-Step Lead Qualification Pipeline with Airtable + Zapier",
                        "teaches": "conditional branching (Paths/Filters), relational data modeling in Airtable, and multi-app workflow orchestration",
                        "prerequisites": [
                            "Completed a basic single-step Zap",
                            "Airtable account",
                            "Understanding of Airtable tables/views"
                        ],
                        "expected_output": "A working pipeline where leads submitted via a form are scored, routed to different follow-up actions based on criteria, and tracked in an Airtable CRM base.",
                        "steps": [
                            "Build an Airtable base with a Leads table (fields: Name, Email, Company Size, Budget, Status).",
                            "Create a form (Typeform or Google Forms) that feeds new leads into a Zapier trigger.",
                            "Add a Zapier 'Create Record' action to insert each new lead into the Airtable Leads table.",
                            "Add a Zapier 'Paths' step that branches based on Budget/Company Size (e.g., >$10k routes to a 'Hot Lead' path).",
                            "For the Hot Lead path, send a Slack alert to sales AND update the Airtable Status field to 'Priority'.",
                            "For the Cold Lead path, enroll the contact in a scheduled follow-up email via a Delay step plus an email action.",
                            "Add a native Airtable automation that changes a record's view/color when Status changes, to visually track pipeline stage.",
                            "Test with at least 3 different sample leads to confirm each path fires correctly."
                        ],
                        "hints": [
                            "Use Zapier's Paths feature instead of chaining separate Zaps with Filters, it's far easier to debug one branching Zap than five linked ones.",
                            "Airtable linked records let you connect a Leads table to a Companies table instead of retyping company data every time.",
                            "Add a Zapier Delay step before follow-up emails so cold leads don't get contacted immediately after form submission.",
                            "Use Airtable's single-select field type for Status so downstream automations can reliably match on exact values."
                        ],
                        "common_mistakes": [
                            "Building separate parallel Zaps for each branch instead of one Zap with Paths, making the logic hard to maintain.",
                            "Forgetting to update the Status field in every path, leaving some records stuck with no visible state.",
                            "Not handling the case where a required field like Budget is blank, causing the filter logic to break.",
                            "Testing only the happy path and never checking what happens when a filter condition evaluates false."
                        ],
                        "difficulty": 3
                    }
                ]
            },
            {
                "title": "Advanced Practice",
                "summary": "Take webhooks, duplicate protection and error handling from theory to a workflow a business could rely on, with a failure log and alert you can trust.",
                "skill_key": "workflow_reliability",
                "projects": [
                    {
                        "title": "Build an order-to-fulfilment workflow with webhooks, retries and a failure log in Make",
                        "teaches": "receiving data through a webhook, validating it, writing to several apps, and handling failures with retries, a log table and an alert instead of failing silently",
                        "prerequisites": [
                            "Two earlier multi-step automations built in Zapier or Make",
                            "An Airtable account",
                            "A Slack workspace or Discord server",
                            "Basic understanding of JSON"
                        ],
                        "expected_output": "A Make scenario that receives order data on a webhook, rejects bad payloads, creates an Airtable record once per order, notifies the team in Slack, and logs any failure to a separate table with an alert, tested against at least eight sample payloads.",
                        "steps": [
                            "Create an Airtable base with an Orders table (order id, customer email, item, quantity, status) and a Failures table (order id, reason, raw payload, time).",
                            "In Make, create a scenario that starts with a Custom webhook module and copy the webhook URL.",
                            "Send a sample JSON order to the webhook from a free tool such as Hoppscotch or curl so Make learns the data structure.",
                            "Add a filter that stops payloads with no email or a quantity below one, and route those to a module that writes a row to the Failures table.",
                            "Add an Airtable search step by order id, then a router that creates the order only when none exists, so a repeated payload does not create a duplicate.",
                            "Add a Slack message for each new order and an error handler route on the Airtable and Slack modules with a retry and a failure-log entry.",
                            "Send eight test payloads: valid, duplicate, missing email, quantity zero, an extra unexpected field, and a malformed JSON body. Record what each one did.",
                            "Turn the scenario on, read the execution history in Make and fix anything that behaved differently from what you expected.",
                            "Draw the scenario as a diagram and write a one page owner's guide that says what to check when the Slack alert for a failure appears."
                        ],
                        "hints": [
                            "Build the happy path first and send one clean payload before adding filters and error handling.",
                            "Use the order id as the key for duplicate checks, never the customer's email.",
                            "Store the raw payload in the Failures table so you can replay a failed order later.",
                            "Turn on the scenario's execution history and read it after every test run."
                        ],
                        "common_mistakes": [
                            "Testing with only valid data and finding the broken cases only when a real customer hits them.",
                            "Letting an error handler ignore the failure with no log and no alert.",
                            "Creating a record without first checking whether the order already exists.",
                            "Leaving the webhook URL unprotected in a public place such as a shared screenshot."
                        ],
                        "difficulty": 5
                    }
                ]
            }
        ]
    },
    "it-support": {
        "skills": [
            {"key": "os_troubleshooting", "label": "Operating System Troubleshooting (Windows/Mac)", "category": "foundation"},
            {"key": "hardware_peripheral_support", "label": "Hardware & Peripheral Support", "category": "core"},
            {"key": "its_networking_fundamentals", "label": "Networking Fundamentals", "category": "core"},
            {"key": "ticketing_and_documentation", "label": "Ticketing & Documentation Workflows", "category": "advanced"},
            {"key": "user_access_management", "label": "User & Access Management (Active Directory/M365)", "category": "advanced"},
        ],
        "skill_edges": [
            ("os_troubleshooting", "hardware_peripheral_support"),
            ("hardware_peripheral_support", "its_networking_fundamentals"),
            ("its_networking_fundamentals", "ticketing_and_documentation"),
            ("ticketing_and_documentation", "user_access_management"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn the core diagnostic workflow every support tech uses on Windows and Mac machines, from Task Manager to Event Viewer.",
                "skill_key": "os_troubleshooting",
                "projects": [
                    {
                        "title": "Diagnose and Fix a Slow-Booting Windows PC",
                        "teaches": "real operating-system troubleshooting steps for one of the most common IT support tickets",
                        "prerequisites": ["Access to a Windows PC (or a VirtualBox VM)", "Basic comfort navigating Settings/Control Panel"],
                        "expected_output": "A written troubleshooting log documenting the diagnosis and fix for a slow-booting, slow-running Windows machine, plus a before/after boot-time measurement.",
                        "steps": [
                            "Set up a test Windows environment (a real old PC or a VirtualBox VM) and record its current boot time using Task Manager's Startup tab.",
                            "Open Task Manager > Startup, identify high-impact startup programs, and disable the unnecessary ones.",
                            "Run Disk Cleanup and check available free disk space (below 15% free noticeably slows Windows).",
                            "Check Windows Update history and install any pending updates.",
                            "Open Event Viewer and look under Windows Logs > System for recurring Warning/Error entries around boot time.",
                            "Use Task Manager's Performance tab to check CPU, memory, and disk usage at idle to spot a runaway process.",
                            "Re-measure boot time after changes and write a short ticket-style summary: symptom, diagnosis, steps taken, result.",
                        ],
                        "hints": [
                            "Event Viewer's 'Filter Current Log' narrows thousands of entries down to just Errors/Warnings from the last boot.",
                            "A disk at 100% usage in Task Manager with low read/write speed is a classic sign of a failing or full HDD, not just too many programs.",
                            "Not every startup item should be disabled, antivirus and driver-related entries should stay enabled.",
                            "Compare boot time with a stopwatch from power-on to a usable desktop, not just from the login screen.",
                        ],
                        "common_mistakes": [
                            "Disabling every startup item including security software, causing new problems.",
                            "Assuming a slow PC just needs 'more RAM' without checking Task Manager to confirm memory is actually the bottleneck.",
                            "Not documenting the before/after state, leaving no proof the fix worked.",
                            "Skipping Windows Updates because 'it takes too long,' missing a known performance-fix patch.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Apply layered network troubleshooting to a realistic connectivity issue and practice writing the kind of ticket documentation a support team can actually reuse.",
                "skill_key": "its_networking_fundamentals",
                "projects": [
                    {
                        "title": "Troubleshoot and Document a 'No Internet Access' Office Connectivity Issue",
                        "teaches": "layered network troubleshooting (physical to IP to DNS to application) and professional support-ticket documentation",
                        "prerequisites": [
                            "Completed a basic OS troubleshooting project",
                            "Understanding of IP addresses and DHCP basics",
                            "Access to a router/network (home network is fine)",
                        ],
                        "expected_output": "A documented, step-by-step network diagnosis for a simulated 'can't connect to the internet' issue, including command-line evidence, resolved and written up as a closed support ticket.",
                        "steps": [
                            "Simulate the issue: on a test machine, either set an incorrect static IP or use a machine with a real connectivity problem.",
                            "Run `ipconfig /all` (Windows) or `ifconfig` (Mac) to check whether the device has a valid IP address, subnet mask, and default gateway.",
                            "Ping the default gateway (e.g., `ping 192.168.1.1`) to test local network connectivity.",
                            "Ping a public IP (e.g., `ping 8.8.8.8`) to isolate whether the issue is local network vs. internet/ISP.",
                            "Ping a domain name (e.g., `ping google.com`) to check whether DNS resolution is the problem versus general connectivity.",
                            "If IP config is invalid, run `ipconfig /release` and `ipconfig /renew` to force a new DHCP lease, or restart the router if the gateway is unreachable.",
                            "Log the full diagnosis into a mock ticket in a free tool (Freshdesk/Zendesk trial): symptom, steps taken with command output, root cause, resolution, time to resolve.",
                            "Close the ticket with a clear resolution summary a non-technical user could understand.",
                        ],
                        "hints": [
                            "The gateway-then-8.8.8.8-then-domain ping sequence is the standard way to isolate whether it's your device, your network, or DNS, memorize that order.",
                            "An IP address starting with 169.254.x.x means the device never got a DHCP lease (APIPA), that's a strong, specific clue.",
                            "`nslookup google.com` tells you specifically whether DNS resolution is failing even when raw IP pings work fine.",
                            "Restarting the router should be a later step, not the first move, once you know whether the problem is local or upstream.",
                        ],
                        "common_mistakes": [
                            "Jumping straight to 'restart the router' without checking ipconfig first, missing the actual root cause like a bad static IP.",
                            "Not distinguishing between 'no internet' and 'no DNS,' leading to fixing the wrong layer.",
                            "Writing vague ticket notes like 'fixed connection issue' instead of documenting the actual diagnostic commands and results.",
                            "Closing the ticket before confirming the user can actually browse the web after the fix.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Run a full small-office IT operation: provision users and access in a real directory service, and build a ticketing system with SLAs an actual support team would rely on.",
                "skill_key": "user_access_management",
                "projects": [
                    {
                        "title": "Set Up and Support a Small-Office IT Environment: AD/M365 User Provisioning + Ticketing SLA System",
                        "teaches": "end-to-end IT support operations, user lifecycle management, least-privilege access control, and running a ticketing system with SLAs and escalation, at a Tier 2 support level",
                        "prerequisites": [
                            "Networking troubleshooting experience",
                            "Free Microsoft 365 developer tenant or Azure AD trial",
                            "Familiarity with a ticketing tool (Freshdesk/Zendesk/Jira Service Management free tier)",
                        ],
                        "expected_output": "A functioning mock small-office IT environment: a Microsoft 365/Azure AD tenant with properly configured users, groups, and permissions, plus a ticketing system with SLA rules, escalation paths, and a documented runbook for the 3 most common ticket types.",
                        "steps": [
                            "Sign up for a free Microsoft 365 Developer tenant and create an Azure AD (Entra ID) directory.",
                            "Create a realistic org structure: 3-4 departments (Sales, Engineering, HR), each with its own security group and shared drive/SharePoint permissions.",
                            "Provision 5-10 test user accounts, assign them to the correct groups, and configure Conditional Access (e.g., require MFA) and a password policy.",
                            "Set up a ticketing system with categories (Access Request, Hardware, Software, Network) and define SLA response/resolution times per priority (e.g., P1 = 1hr response, P4 = 24hr).",
                            "Configure an escalation rule so tickets unresolved past their SLA auto-escalate to a Tier 2 queue/notification.",
                            "Simulate and resolve 5 realistic tickets end-to-end (new-hire provisioning, AD account lockout, printer not on network, missing SharePoint access).",
                            "For each ticket, apply least-privilege principles, only add the user to the specific group required, not a broader admin group.",
                            "Write a runbook: for the 3 most common ticket types, document standard diagnostic/resolution steps another tech could follow unaided.",
                            "Run a mock offboarding, disable a departing employee's account, remove group memberships, revoke device access, and document it as a repeatable checklist.",
                        ],
                        "hints": [
                            "Use Azure AD group-based access instead of assigning permissions to individuals one by one, it scales and is auditable.",
                            "SLA timers should be based on ticket priority, not just creation time, a 'whole office down' ticket needs a very different SLA than a desktop-background question.",
                            "When offboarding, disable the account first rather than deleting it immediately, in case data or email access still needs to be transferred.",
                            "Write runbooks as if a brand-new hire with zero context has to follow them, vague steps like 'fix the permissions' aren't useful.",
                        ],
                        "common_mistakes": [
                            "Granting broad admin/global access to resolve a ticket quickly instead of the specific permission needed, creating a security risk.",
                            "Setting SLA rules that don't match real urgency, so genuinely urgent tickets don't get escalated.",
                            "Deleting a departing employee's account immediately instead of disabling it, losing access to files or email that still needed transferring.",
                            "Resolving tickets without documenting what was done, so the same issue gets solved from scratch every time it recurs.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "solutions-architecture": {
        "skills": [
            {"key": "system_design_fundamentals", "label": "System Design Fundamentals", "category": "foundation"},
            {"key": "cloud_architecture_patterns", "label": "Cloud Architecture Patterns (AWS/Azure/GCP)", "category": "core"},
            {"key": "cross_domain_integration", "label": "Cross-Domain Integration (Data, Security, Ops)", "category": "core"},
            {"key": "scalability_reliability_design", "label": "Scalability & Reliability Design", "category": "advanced"},
            {"key": "enterprise_architecture_tradeoffs", "label": "Enterprise Architecture Trade-off Analysis", "category": "advanced"},
        ],
        "skill_edges": [
            ("system_design_fundamentals", "cloud_architecture_patterns"),
            ("cloud_architecture_patterns", "cross_domain_integration"),
            ("cross_domain_integration", "scalability_reliability_design"),
            ("scalability_reliability_design", "enterprise_architecture_tradeoffs"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to break an application into its fundamental architectural tiers and communicate that design clearly through a professional diagram and rationale.",
                "skill_key": "system_design_fundamentals",
                "projects": [
                    {
                        "title": "Design and Diagram a Three-Tier Web Application Architecture",
                        "teaches": "the fundamental building blocks of system design, presentation/application/data tiers, and how to communicate architecture visually",
                        "prerequisites": ["2+ years of software/IT experience", "Familiarity with basic web app concepts (frontend, backend, database)"],
                        "expected_output": "A clean architecture diagram (in draw.io or Lucidchart) of a three-tier web app, plus a one-page written rationale explaining each component choice.",
                        "steps": [
                            "Pick a realistic app scenario (e.g., a food-ordering web app with ~10,000 users).",
                            "List the required components: load balancer, web/app servers, database, static asset storage/CDN, DNS.",
                            "Draw the architecture using draw.io or Lucidchart, using standard AWS/Azure icon sets for each component.",
                            "Label the traffic flow with arrows: DNS -> CDN/Load balancer -> App servers -> Database.",
                            "Choose a database type (relational vs. NoSQL) and justify it in writing based on the app's actual data (e.g., orders need transactional consistency, so relational/Postgres).",
                            "Add a simple redundancy element (e.g., two app server instances behind the load balancer) and explain why single points of failure matter.",
                            "Write a one-page rationale document explaining each component choice as if presenting to a non-technical stakeholder.",
                        ],
                        "hints": [
                            "Use standard cloud provider icon libraries (free in draw.io) instead of generic boxes, it signals fluency and helps other architects read the diagram.",
                            "Always show the direction of data flow with arrows; an undirected diagram is ambiguous about which side calls which.",
                            "Justify the database choice based on the actual data shape and access pattern (read-heavy vs. write-heavy, structured vs. unstructured), not personal preference.",
                            "Keep the diagram to one page, if it needs a second page, the scope is probably too broad for a foundational exercise.",
                        ],
                        "common_mistakes": [
                            "Drawing a diagram with only one app server and no mention of redundancy, missing the most basic reliability concept.",
                            "Mixing architecture layers in one box (e.g., putting the database and app logic together) instead of clearly separating tiers.",
                            "Choosing a NoSQL database 'because it's modern' without a data-access reason, which a reviewer will immediately question.",
                            "Skipping the written rationale and submitting only a picture, when the reasoning is the actual skill being tested.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Apply cloud-specific patterns, auto-scaling, multi-AZ redundancy, caching, and async processing, to design a realistic architecture for a growing SaaS product.",
                "skill_key": "cloud_architecture_patterns",
                "projects": [
                    {
                        "title": "Architect a Multi-Region, Auto-Scaling AWS Deployment for a Growing SaaS Product",
                        "teaches": "applying cloud-specific architecture patterns and trade-offs, auto-scaling, multi-AZ/region redundancy, managed services, to a realistic growth scenario",
                        "prerequisites": [
                            "Completed a basic three-tier architecture diagram",
                            "Familiarity with at least one cloud provider's console (AWS preferred)",
                            "Understanding of load balancing and databases",
                        ],
                        "expected_output": "A detailed AWS architecture diagram and design document for a SaaS product scaling from 5,000 to 500,000 users, including auto-scaling policies, a chosen multi-AZ database strategy, and a cost-estimate breakdown.",
                        "steps": [
                            "Define the scaling scenario: current state (single-region, single-AZ, 5k users) and target state (500k users, 99.9% uptime SLA).",
                            "Redesign the compute layer using an Auto Scaling Group behind an Application Load Balancer, with concrete scaling policies (e.g., scale out when average CPU > 70% for 5 minutes).",
                            "Move the database to Amazon RDS Multi-AZ (or Aurora) and explain the failover behavior versus a single-instance database.",
                            "Add a caching layer (ElastiCache/Redis) in front of the database for read-heavy endpoints, identifying which specific queries benefit.",
                            "Introduce an async pattern using SQS + Lambda (or a worker fleet) for a slow operation like sending emails or generating reports, decoupling it from the request path.",
                            "Decide multi-region vs. single-region with multi-AZ, and write a trade-off analysis covering latency, cost, and complexity.",
                            "Use the AWS Pricing Calculator to produce a rough monthly cost estimate for the target-state architecture.",
                            "Document a failure plan: what happens if the auto-scaling group over-provisions, or the primary database AZ goes down.",
                        ],
                        "hints": [
                            "Multi-AZ is about high availability (automatic failover within a region); multi-region is about disaster recovery and global latency, don't conflate the two when justifying your choice.",
                            "Caching everything isn't free, identify hot, read-heavy, rarely-changing queries specifically, rather than caching the whole database layer.",
                            "Scaling policies need both a scale-out AND scale-in condition with a cooldown, or you'll end up permanently over-provisioned and expensive.",
                            "The AWS Pricing Calculator forces you to confront real cost trade-offs (e.g., Aurora vs. RDS Postgres) instead of treating cloud capacity as infinite and free.",
                        ],
                        "common_mistakes": [
                            "Recommending multi-region 'for reliability' without acknowledging the added cost, data-replication complexity, and cross-region latency it introduces.",
                            "Setting an auto-scaling policy with no cooldown period, causing rapid scale-out/scale-in thrashing.",
                            "Adding a cache layer without a cache-invalidation strategy, leading to stale data being served to users.",
                            "Producing a diagram with no cost estimate, making the design impossible to actually evaluate against a budget.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Produce a full enterprise architecture decision package for a high-stakes, cross-domain migration, the kind of deliverable a senior solutions architect presents to leadership.",
                "skill_key": "enterprise_architecture_tradeoffs",
                "projects": [
                    {
                        "title": "Produce an Enterprise Architecture Decision Record for Migrating a Monolith to Microservices Across Multiple Business Domains",
                        "teaches": "enterprise-level solutions architecture, cross-domain trade-off analysis, stakeholder alignment, and producing a formal Architecture Decision Record (ADR) for a high-stakes, org-wide migration",
                        "prerequisites": [
                            "Experience designing multi-tier cloud architectures",
                            "Understanding of microservices vs. monolith trade-offs",
                            "Familiarity with domain-driven design concepts",
                            "2+ years cross-functional tech experience",
                        ],
                        "expected_output": "A complete, presentation-ready enterprise architecture package for migrating a legacy monolithic order-management system (spanning Sales, Inventory, and Finance) to microservices: an ADR, a bounded-context diagram, a phased migration roadmap, and a risk register.",
                        "steps": [
                            "Define the current-state monolith: a single relational database and codebase shared across Sales, Inventory, and Finance, with documented pain points (e.g., a Finance deploy breaks Sales, database contention during peak orders).",
                            "Apply domain-driven design to identify bounded contexts and propose service boundaries (Order Service, Inventory Service, Billing Service) with clear data ownership per service.",
                            "Design the inter-service communication pattern: choose synchronous REST/gRPC vs. asynchronous event-driven messaging (Kafka/SQS/SNS) per interaction, justifying each (e.g., inventory reservation must be synchronous to prevent overselling; order-confirmation-to-Finance can be async).",
                            "Address cross-service data consistency by choosing and justifying a pattern (e.g., Saga) for a flow like place order -> reserve inventory -> charge payment -> confirm order.",
                            "Design the supporting cloud infrastructure: container orchestration (EKS/ECS/GKE), an API gateway, service mesh considerations, and per-service CI/CD pipelines.",
                            "Write a formal ADR covering context, decision, alternatives considered (e.g., a 'modular monolith' as a lower-risk alternative), and consequences of going with microservices.",
                            "Build a phased migration roadmap using the Strangler Fig pattern, which service is extracted first and why, how monolith and new services coexist mid-transition, and rollback criteria per phase.",
                            "Produce a risk register with at least 5 concrete risks (e.g., data-duplication drift, team's lack of distributed-systems experience, increased operational overhead) and mitigations for each.",
                            "Present the package as if to a CTO and engineering leadership, including a one-page executive summary of cost, timeline, and risk trade-offs in plain language.",
                        ],
                        "hints": [
                            "Extract the least-coupled, highest-pain domain first under the Strangler Fig pattern (often Inventory or a reporting/read-heavy domain), don't start with the most tightly coupled domain like Finance.",
                            "The Saga pattern requires explicit compensating transactions (e.g., 'release inventory reservation' as the undo for 'reserve inventory'), a distributed transaction without a defined rollback path isn't a Saga, it's a bug waiting to happen.",
                            "A 'modular monolith' with clear internal boundaries is a legitimate, lower-risk alternative worth including in the ADR's alternatives-considered section, not every boundary needs its own database from day one.",
                            "Executive audiences care about timeline, cost, and risk, not technology names, translate 'we chose async messaging' into 'this reduces the chance a Finance outage takes down order placement.'",
                        ],
                        "common_mistakes": [
                            "Proposing a 'big bang' full rewrite instead of an incremental strangler-fig migration, dramatically underestimating risk and business disruption.",
                            "Choosing synchronous calls for every inter-service interaction out of habit, recreating the monolith's tight coupling in distributed form (a 'distributed monolith').",
                            "Ignoring data ownership and letting multiple services write to the same underlying tables, defeating the purpose of the service boundaries.",
                            "Writing an ADR with only one option considered, skipping the alternatives-considered section that's the actual point of an ADR.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "data-science": {
        "skills": [
            {"key": "ds_statistics", "label": "Statistics & Hypothesis Testing", "category": "foundation"},
            {"key": "ds_experimentation", "label": "Experiment Design & A/B Testing", "category": "core"},
            {"key": "ds_predictive_modelling", "label": "Predictive Modelling & Forecasting", "category": "core"},
            {"key": "ds_decision_communication", "label": "Communicating Evidence & Uncertainty", "category": "advanced"},
        ],
        "skill_edges": [
            ("ds_statistics", "ds_experimentation"),
            ("ds_experimentation", "ds_predictive_modelling"),
            ("ds_predictive_modelling", "ds_decision_communication"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to turn a vague question into a testable hypothesis and answer it with the right statistical test, not just a chart.",
                "skill_key": "ds_statistics",
                "projects": [
                    {
                        "title": "Answer a business question from a public dataset with hypothesis tests and confidence intervals",
                        "teaches": "framing a question as a hypothesis, choosing between a t-test, a chi-square test and a proportion test, reporting effect sizes with confidence intervals, and checking assumptions",
                        "prerequisites": ["Python and pandas basics", "High school statistics", "Jupyter notebooks"],
                        "expected_output": "A Jupyter notebook that answers one clear question (for example, do students who sleep more score higher, or do delivery times differ by city) with a stated hypothesis, an appropriate test, a confidence interval and a plain-language conclusion.",
                        "steps": [
                            "Pick a public dataset from Kaggle or a government open-data portal and write one specific, testable question about it.",
                            "State the null and alternative hypotheses and the significance level before you look at results.",
                            "Explore the data with summary statistics and plots, and note missing values and outliers.",
                            "Choose a test that fits the data type and check its assumptions, such as normality and independent samples.",
                            "Run the test with scipy or statsmodels and report the p-value, the effect size and a 95 percent confidence interval.",
                            "Write a short conclusion for a non-technical reader that says what you found, how sure you are, and what you cannot conclude.",
                        ],
                        "hints": [
                            "A small p-value says an effect is unlikely to be chance, not that it is large or important. Always report the size.",
                            "Decide your hypothesis before looking at the data to avoid fitting the story to the numbers.",
                            "Plot each group first. Many assumption problems are visible before any test is run.",
                            "If you test many questions, remember that some will look significant by chance alone.",
                        ],
                        "common_mistakes": [
                            "Running several tests until one is significant and reporting only that one.",
                            "Treating correlation as proof that one thing causes another.",
                            "Ignoring assumptions, such as using a t-test on heavily skewed data with tiny samples.",
                            "Reporting a p-value with no effect size or interval.",
                        ],
                        "difficulty": 1,
                    },
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Design and analyse an experiment end to end, including how many users you need and what could invalidate the result.",
                "skill_key": "ds_experimentation",
                "projects": [
                    {
                        "title": "Design and analyse an A/B test for a checkout change, including sample size and pitfalls",
                        "teaches": "choosing a primary metric and guardrails, calculating sample size from a minimum detectable effect, checking randomisation, analysing conversion results, and recognising peeking and novelty effects",
                        "prerequisites": ["Hypothesis testing", "pandas and numpy", "Basic probability"],
                        "expected_output": "An experiment design document and a notebook that simulates or analyses an A/B test for a checkout button change, with a sample size calculation, a randomisation check, a result with confidence interval, a guardrail metric check and a ship or do-not-ship recommendation.",
                        "steps": [
                            "Write the experiment brief: the change, the user group, the primary metric (conversion rate) and at least one guardrail metric such as refund rate.",
                            "Choose a minimum detectable effect and calculate the required sample size per group with statsmodels power analysis.",
                            "Simulate or obtain a dataset of users randomly assigned to control and treatment.",
                            "Check that the assignment is balanced across device type and country before analysing outcomes.",
                            "Run a two-proportion z-test and report the lift with a confidence interval.",
                            "Check the guardrail metric and look for segments where the effect differs, labelling these clearly as exploratory.",
                            "Write the recommendation, including what you would do if the result were inconclusive.",
                        ],
                        "hints": [
                            "Decide the sample size and run length in advance and stick to them.",
                            "Check that groups are balanced before trusting any outcome difference.",
                            "Pick one primary metric. Extra metrics are for context, not for rescuing a flat result.",
                            "A flat result is still a result. Say what effect size you could and could not rule out.",
                        ],
                        "common_mistakes": [
                            "Peeking at results every day and stopping the test the moment it looks significant.",
                            "Running the test for too short a period and missing weekday and weekend differences.",
                            "Slicing into many segments after the fact and presenting a lucky segment as the finding.",
                            "Ignoring guardrail metrics and shipping a change that raised conversion but hurt refunds.",
                        ],
                        "difficulty": 3,
                    },
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Forecast something that matters, judge the forecast honestly against a baseline, and deliver a recommendation that shows its uncertainty.",
                "skill_key": "ds_predictive_modelling",
                "projects": [
                    {
                        "title": "Forecast weekly demand against a baseline and deliver a decision memo that shows its uncertainty",
                        "teaches": "building baseline and model-based forecasts, backtesting with a time-ordered split, measuring error with MAE and MAPE, producing prediction intervals, and communicating a decision with its uncertainty",
                        "prerequisites": ["Hypothesis testing", "scikit-learn model evaluation", "Time series basics (trend and seasonality)"],
                        "expected_output": "A notebook and a two-page decision memo for a retail or ride-demand dataset: a naive baseline, a seasonal model and a machine learning model, a backtest across several time windows, prediction intervals, and a recommendation (for example, how much stock to order) that states the risk of being wrong.",
                        "steps": [
                            "Choose a weekly or daily demand dataset and split it by time, never at random.",
                            "Build a naive baseline (last value or last season) and record its error.",
                            "Fit a seasonal model such as Holt-Winters or Prophet and a gradient boosted model using lag and calendar features.",
                            "Backtest each model over at least three rolling windows and compare MAE and MAPE against the baseline.",
                            "Produce prediction intervals and check how often real values fall inside them.",
                            "Inspect where the best model fails, such as holidays or promotions, and describe it honestly.",
                            "Write the decision memo: the recommendation, the expected range, the cost of over- and under-ordering, and the assumptions that would change your advice.",
                        ],
                        "hints": [
                            "A forecast that cannot beat a naive baseline is not worth deploying, however sophisticated.",
                            "Use rolling-origin backtests so one lucky test window does not fool you.",
                            "Lead the memo with the decision, then the evidence, then the caveats.",
                            "Intervals matter more than point estimates when a decision has an uneven cost of being wrong.",
                        ],
                        "common_mistakes": [
                            "Randomly shuffling time series data, which leaks the future into training.",
                            "Reporting only a single test period and a single error number.",
                            "Hiding the uncertainty to make the recommendation sound more confident.",
                            "Adding features that would not be known at forecast time, such as same-week sales.",
                        ],
                        "difficulty": 5,
                    },
                ],
            },
        ],
    },
    "graphic-design": {
        "skills": [
            {"key": "gd_typography_layout", "label": "Typography, Layout & Hierarchy", "category": "foundation"},
            {"key": "gd_colour_composition", "label": "Colour & Composition", "category": "foundation"},
            {"key": "gd_brand_identity", "label": "Brand Identity & Logo Design", "category": "core"},
            {"key": "gd_campaign_production", "label": "Campaign Systems & Print Production", "category": "advanced"},
        ],
        "skill_edges": [
            ("gd_typography_layout", "gd_colour_composition"),
            ("gd_colour_composition", "gd_brand_identity"),
            ("gd_brand_identity", "gd_campaign_production"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Train your eye on hierarchy, type and layout by studying a professional poster and then redesigning it with your own decisions.",
                "skill_key": "gd_typography_layout",
                "projects": [
                    {
                        "title": "Study a professional event poster, recreate its layout, then redesign it with a new concept",
                        "teaches": "visual hierarchy, type pairing, alignment and spacing on a grid, and how contrast and scale direct the eye",
                        "prerequisites": ["Basic Figma or Illustrator navigation", "A free font library such as Google Fonts"],
                        "expected_output": "Two A3 posters for the same event: a faithful recreation of a poster you admire built on a visible grid, and an original redesign with a different concept, plus a one-page note on the decisions behind both.",
                        "steps": [
                            "Choose a well-designed poster and identify its grid, type sizes, colours and focal point.",
                            "Rebuild it from scratch in Figma or Illustrator, matching spacing and hierarchy closely, using your own copy and imagery.",
                            "Write down three things the original does to guide the eye, such as scale contrast, alignment or whitespace.",
                            "Create a new concept for the same event with a different type pairing and a different layout structure.",
                            "Limit yourself to two typefaces and a restricted palette so the hierarchy has to come from scale and placement.",
                            "Get critique from at least two people, ask what they look at first, and revise.",
                            "Export both posters and write the short decision note.",
                        ],
                        "hints": [
                            "Squint at your design. If the main message does not stand out blurred, the hierarchy is weak.",
                            "Use whitespace deliberately. Empty space is a design tool, not leftover room.",
                            "Pick one display typeface and one text typeface and vary size and weight instead of adding fonts.",
                            "Align everything to the grid, and break it only on purpose.",
                        ],
                        "common_mistakes": [
                            "Using many typefaces and effects so nothing stands out.",
                            "Centring everything by default instead of choosing an alignment.",
                            "Placing text over busy imagery with poor contrast.",
                            "Copying the original so closely that the redesign adds no new thinking.",
                        ],
                        "difficulty": 1,
                    },
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Build a complete brand identity for a small business, from a clear brief to a logo, palette and type system that work together.",
                "skill_key": "gd_brand_identity",
                "projects": [
                    {
                        "title": "Design a brand identity for a small local business: logo, colour palette and type system",
                        "teaches": "turning a brief into a concept, sketching and refining a logo, building a palette and type system with purpose, and testing the identity at different sizes and on different backgrounds",
                        "prerequisites": ["Typography and layout basics", "Vector drawing in Illustrator or Figma", "Colour theory basics"],
                        "expected_output": "A brand identity package for a real or fictional small business: a primary logo with a simplified mark, a colour palette with accessible contrast pairs, a type system, and mockups on at least three applications such as a sign, packaging and a social profile.",
                        "steps": [
                            "Write a one-page brief: the business, its audience, three brand personality words and what to avoid.",
                            "Sketch at least 20 rough logo ideas on paper and pick three to develop.",
                            "Refine your best concept as a vector logo and test it in black and white, at 24 pixels and on a dark background.",
                            "Build a palette with a primary, a secondary and neutral colours and check text and background contrast.",
                            "Choose a heading typeface and a body typeface that match the personality words.",
                            "Create a simplified mark or icon for small uses such as a profile picture.",
                            "Apply the identity to three mockups and write a short rationale linking each choice to the brief.",
                        ],
                        "hints": [
                            "A good logo works in one colour at a small size before it works in colour at a large one.",
                            "Sketch widely before opening the computer. The first idea is rarely the best one.",
                            "Tie every choice back to the brief so you can defend it to a client.",
                            "Show the identity in context. Mockups reveal problems a flat logo sheet hides.",
                        ],
                        "common_mistakes": [
                            "Starting on screen and polishing the first idea instead of exploring options.",
                            "Picking trendy colours or fonts that do not fit the audience.",
                            "A logo with fine detail that disappears at small sizes.",
                            "Delivering a logo with no usage rules, palette values or type specifications.",
                        ],
                        "difficulty": 3,
                    },
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Extend an identity into a campaign and guideline system, and prepare files correctly for both print and digital use.",
                "skill_key": "gd_campaign_production",
                "projects": [
                    {
                        "title": "Build a brand guideline and a multi-format campaign, with print-ready and digital files",
                        "teaches": "extending a visual identity across formats, writing usage guidelines, setting up print files with bleed and colour modes, and keeping a campaign consistent across channels",
                        "prerequisites": ["A completed brand identity", "Layout and typography skills", "Basic understanding of CMYK, RGB, bleed and export formats"],
                        "expected_output": "A brand guideline document (PDF, 10 or more pages) and a campaign for the same brand: a print poster, a flyer, a social media set and a web banner, with print-ready PDFs including bleed and crop marks, and web-optimised exports.",
                        "steps": [
                            "Start from your brand identity and define the campaign idea, audience and a single message.",
                            "Create a layout system with a grid and reusable templates for each format.",
                            "Design the poster and flyer in CMYK with 3 mm bleed and check that text stays inside the safe area.",
                            "Create social and web banner versions in RGB, adapting the layout to each size instead of just scaling it.",
                            "Run a preflight on the print files: check image resolution, fonts and colour modes.",
                            "Write the guideline document covering logo use, clear space, colour values, typography, imagery style and examples of correct and incorrect use.",
                            "Export the final set, name the files clearly and present the campaign as a case study with the problem, the process and the result.",
                        ],
                        "hints": [
                            "Design for the format. A poster layout does not simply shrink into a banner.",
                            "Convert and check colours early. Bright RGB colours often look duller in CMYK.",
                            "Outline or embed fonts and package linked images so files open correctly for the printer.",
                            "A guideline should show wrong uses as well as right ones.",
                        ],
                        "common_mistakes": [
                            "Forgetting bleed, so white edges appear when the print is trimmed.",
                            "Using low-resolution images that look fine on screen and blurry in print.",
                            "Writing guidelines so vague that someone else could not apply them.",
                            "Letting the campaign drift between formats until it no longer looks like one brand.",
                        ],
                        "difficulty": 5,
                    },
                ],
            },
        ],
    },
    "mobile-development": {
        "skills": [
            {"key": "mob_app_fundamentals", "label": "Mobile App Fundamentals & UI Components", "category": "foundation"},
            {"key": "mob_navigation_state", "label": "Navigation & State Management", "category": "core"},
            {"key": "mob_data_networking", "label": "APIs, Local Storage & Authentication", "category": "core"},
            {"key": "mob_release_engineering", "label": "Offline Support, Notifications & App Store Release", "category": "advanced"},
        ],
        "skill_edges": [
            ("mob_app_fundamentals", "mob_navigation_state"),
            ("mob_navigation_state", "mob_data_networking"),
            ("mob_data_networking", "mob_release_engineering"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Build a first multi-screen app and learn how mobile layouts, navigation and component state work on a real device.",
                "skill_key": "mob_app_fundamentals",
                "projects": [
                    {
                        "title": "Build a multi-screen habit tracker with navigation and local state",
                        "teaches": "building screens from components, laying out for different phone sizes, navigating between screens, and holding simple state, using React Native with Expo (the same ideas apply in Flutter, SwiftUI or Jetpack Compose)",
                        "prerequisites": ["Basic JavaScript or another programming language", "Node.js and Expo installed", "A phone or an emulator"],
                        "expected_output": "A working app with a list screen, an add-habit screen and a detail screen, tab or stack navigation, state that updates the interface, and a layout that looks right on a small and a large phone, running on a real device.",
                        "steps": [
                            "Create a new Expo project and run it on your phone using Expo Go.",
                            "Build a list screen that shows habits with a name, a streak count and a completion button.",
                            "Add a form screen to create a habit, with input validation and a keyboard that does not cover the fields.",
                            "Set up navigation (a stack and a tab bar) between the list, the form and a detail screen.",
                            "Hold the habit list in state and update streaks when a habit is completed.",
                            "Make the layout work in portrait on small and large screens using flex layouts and safe areas.",
                            "Commit the project to GitHub with a README and screenshots.",
                        ],
                        "hints": [
                            "Test on a real device early. Emulators hide real-world touch and performance issues.",
                            "Keep components small and reusable. A habit row should be one component.",
                            "Use safe area handling so content is not hidden behind notches and home indicators.",
                            "Make tap targets at least 44 points tall so they are easy to hit.",
                        ],
                        "common_mistakes": [
                            "Hardcoding pixel sizes that break on other screens.",
                            "Putting all logic in one huge screen file.",
                            "Forgetting keyboard handling, so a text field is hidden by the keyboard.",
                            "Never running the app on a real phone until the end.",
                        ],
                        "difficulty": 1,
                    },
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Connect the app to the outside world: a real API, saved data, a login flow, and honest loading and error states.",
                "skill_key": "mob_data_networking",
                "projects": [
                    {
                        "title": "Build an app that loads data from an API with local storage and a login flow",
                        "teaches": "fetching and caching data from a REST API, handling loading and error states, persisting data locally, and implementing token-based authentication with secure storage",
                        "prerequisites": ["Multi-screen app experience", "Understanding of REST APIs and JSON", "Async code in your language of choice"],
                        "expected_output": "A mobile app (for example a recipe or movie browser) that signs a user in against an API, fetches a paginated list, shows loading, empty and error states, caches data locally so it opens instantly, saves favourites on the device, and stores the login token in secure storage.",
                        "steps": [
                            "Pick a free public API, or build a small backend, with a list endpoint and a login endpoint.",
                            "Fetch the list and render it in a performant list component with pull to refresh and pagination.",
                            "Add explicit loading, empty and error states, including a retry button.",
                            "Cache the last response locally so the app shows data immediately on the next launch.",
                            "Let users save favourites and persist them using local storage or SQLite.",
                            "Add a login screen, store the token in the platform's secure storage and attach it to requests.",
                            "Handle an expired token by returning the user to the login screen without losing their place.",
                            "Test with the network turned off and record what the user sees.",
                        ],
                        "hints": [
                            "Never store tokens in plain local storage. Use the platform's secure storage.",
                            "Show cached data first, then refresh in the background, so the app feels fast.",
                            "Test slow and absent networks on purpose, not just the happy path.",
                            "Handle empty lists as a state with its own message, not a blank screen.",
                        ],
                        "common_mistakes": [
                            "Fetching all data on every screen open with no caching.",
                            "Showing an endless spinner when a request fails.",
                            "Storing passwords or tokens insecurely on the device.",
                            "Blocking the main thread with heavy work, which makes scrolling stutter.",
                        ],
                        "difficulty": 3,
                    },
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Ship a real build: notifications, offline behaviour and a signed release in TestFlight or Play internal testing.",
                "skill_key": "mob_release_engineering",
                "projects": [
                    {
                        "title": "Ship an app to TestFlight or Play internal testing with push notifications and offline support",
                        "teaches": "building offline-first behaviour with a sync queue, wiring push notifications, handling permissions, crash reporting, and producing and distributing a signed release build to testers",
                        "prerequisites": ["An app with API and local storage", "An Apple Developer or Google Play Console account (the Play fee is one time, Apple's is yearly)", "Basic understanding of app signing"],
                        "expected_output": "A signed build installed from TestFlight or Play internal testing by at least three testers, with push notifications for a real event, an offline queue that syncs when the connection returns, crash reporting enabled, and a release checklist and write-up.",
                        "steps": [
                            "Add an offline queue so actions taken without a connection are stored and sent when the network returns.",
                            "Detect connectivity changes and show clear offline and syncing indicators.",
                            "Request notification permission at a sensible moment and implement a push notification for one real event.",
                            "Add crash and error reporting such as Sentry or Firebase Crashlytics and trigger a test crash.",
                            "Configure app identifiers, icons, splash screen and version numbers for release.",
                            "Create a signed release build and upload it to TestFlight or Play internal testing.",
                            "Invite at least three testers, collect their feedback and fix the top issue in a second build.",
                            "Write a release checklist and a case study covering offline handling, performance and what you learned.",
                        ],
                        "hints": [
                            "Ask for notification permission after showing the user why it is useful, not at first launch.",
                            "Resolve conflicts deliberately when offline changes meet server changes. Decide a rule and document it.",
                            "Keep a record of signing keys and credentials somewhere safe. Losing them blocks updates.",
                            "Test the release build, not just the debug build. They can behave differently.",
                        ],
                        "common_mistakes": [
                            "Requesting every permission up front and being denied.",
                            "Assuming the network is always available.",
                            "Submitting a debug build and finding release-only crashes after distribution.",
                            "Skipping crash reporting, so problems from testers cannot be diagnosed.",
                        ],
                        "difficulty": 5,
                    },
                ],
            },
        ],
    },
}


# Roadmaps for the careers added in the catalogue restructure live beside
# their career content in app/seed/new_careers and join the same catalogue.
from app.seed.new_careers import NEW_PROJECTS  # noqa: E402

assert not set(NEW_PROJECTS) & set(PATH_PROJECTS), "a new career repeats an existing roadmap"
PATH_PROJECTS.update(NEW_PROJECTS)
