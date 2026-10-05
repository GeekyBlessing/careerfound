"""Taxonomy metadata for every career: category, related careers, search
keywords, who it is for, portfolio expectations and career progression.

Kept apart from career_paths.py (the career content itself). Relationships
are authored once as undirected edges below and expanded into symmetric
`related_slugs`, so "A relates to B" can never exist without "B relates to A".
Keep this file free of long dash characters (scripts/check_dashes.py).
"""

# Display order: category order, then the order within each category.
CATALOGUE_ORDER = [
    # Security
    "cybersecurity", "security-operations", "penetration-testing", "cloud-security",
    # Engineering
    "software-engineering", "frontend-development", "backend-engineering",
    "full-stack-development", "mobile-development", "qa-engineering",
    # Cloud & Infrastructure
    "cloud-engineering", "devops-engineering", "solutions-architecture",
    # Data & AI
    "data-analysis", "data-science", "data-engineering", "ai-engineering",
    # Design & Product
    "ui-ux-design", "product-design", "product-management", "graphic-design",
    # Operations & Digital
    "it-support", "no-code-automation", "technical-writing",
]

EDGES = [
    # Security
    ("cybersecurity", "security-operations"),
    ("cybersecurity", "penetration-testing"),
    ("cybersecurity", "cloud-security"),
    ("cybersecurity", "it-support"),
    ("security-operations", "cloud-security"),
    ("security-operations", "penetration-testing"),
    # Engineering
    ("software-engineering", "frontend-development"),
    ("software-engineering", "backend-engineering"),
    ("software-engineering", "full-stack-development"),
    ("software-engineering", "mobile-development"),
    ("software-engineering", "qa-engineering"),
    ("software-engineering", "technical-writing"),
    ("frontend-development", "full-stack-development"),
    ("backend-engineering", "full-stack-development"),
    ("frontend-development", "mobile-development"),
    ("frontend-development", "ui-ux-design"),
    ("backend-engineering", "cloud-engineering"),
    ("backend-engineering", "data-engineering"),
    ("backend-engineering", "solutions-architecture"),
    ("backend-engineering", "technical-writing"),
    ("qa-engineering", "devops-engineering"),
    # Cloud and infrastructure
    ("cloud-engineering", "devops-engineering"),
    ("cloud-engineering", "solutions-architecture"),
    ("cloud-engineering", "cloud-security"),
    ("devops-engineering", "solutions-architecture"),
    ("it-support", "cloud-engineering"),
    # Data and AI
    ("data-analysis", "data-science"),
    ("data-analysis", "data-engineering"),
    ("data-analysis", "product-management"),
    ("data-analysis", "no-code-automation"),
    ("data-science", "data-engineering"),
    ("data-science", "ai-engineering"),
    ("data-engineering", "ai-engineering"),
    ("backend-engineering", "ai-engineering"),
    # Design and product
    ("ui-ux-design", "product-design"),
    ("ui-ux-design", "graphic-design"),
    ("product-design", "product-management"),
    ("product-design", "graphic-design"),
    # Operations and digital
    ("it-support", "no-code-automation"),
    ("no-code-automation", "product-management"),
    ("technical-writing", "product-management"),
]


def _related(slug: str) -> list[str]:
    seen: list[str] = []
    for a, b in EDGES:
        other = b if a == slug else a if b == slug else None
        if other and other not in seen:
            seen.append(other)
    return seen


_META = {
    "cybersecurity": dict(
        category="security",
        keywords=["cyber security", "infosec", "information security", "security analyst", "network security", "threat", "blue team", "security+"],
        who_its_for="Curious, detail-oriented people who like understanding how systems work and how they fail. A good first step if you want security but have not chosen between monitoring, testing and cloud yet.",
        portfolio_expectations=["A documented home lab with a virtual network you built and secured", "Two or three written investigations or incident reports", "Capture the Flag write-ups that show how you reasoned, not just the flag", "A short threat-model or risk review of a small real system"],
        career_progression=["Junior Security Analyst", "Security Analyst", "Senior Security Analyst or a specialist track (SOC, cloud security, penetration testing)", "Security Engineer, Security Architect or Security Manager"],
    ),
    "security-operations": dict(
        category="security",
        keywords=["soc", "soc analyst", "blue team", "siem", "incident response", "threat detection", "alert triage", "monitoring", "security operations center"],
        who_its_for="People who stay calm under pressure, like methodical investigation and want a well-defined first security job. Shift work is common in this role.",
        portfolio_expectations=["Investigation write-ups that walk from alert to conclusion", "A set of SIEM searches and detection rules you wrote, with notes on false positives", "An incident report and handoff note in a professional format", "A mapping of one attack you studied to the MITRE ATT&CK framework"],
        career_progression=["SOC Analyst (Tier 1)", "SOC Analyst (Tier 2) or Incident Responder", "Threat Hunter or Detection Engineer", "SOC Lead, Security Engineer or Incident Response Manager"],
    ),
    "penetration-testing": dict(
        category="security",
        keywords=["pentest", "pen testing", "ethical hacking", "red team", "offensive security", "vulnerability assessment", "bug bounty", "hacker", "burp suite"],
        who_its_for="Persistent, creative problem solvers who enjoy thinking like an attacker and writing up findings clearly. Usually follows some foundation in networking, web or general security.",
        portfolio_expectations=["Write-ups of lab machines and web challenges with your method explained", "A sample penetration test report with severity ratings and fixes", "A small tool or script you wrote to automate part of testing", "Bug bounty or responsible disclosure results, where you have them"],
        career_progression=["Junior Penetration Tester", "Penetration Tester", "Senior Penetration Tester or Red Team Operator", "Security Consultant, Red Team Lead or Application Security Engineer"],
    ),
    "cloud-security": dict(
        category="security",
        keywords=["cloud security engineer", "iam", "aws security", "azure security", "devsecops", "cspm", "misconfiguration", "guardduty", "zero trust"],
        who_its_for="People who already know some cloud or security basics and want to combine them. A strong second step after Cloud Engineering or Cybersecurity.",
        portfolio_expectations=["A cloud account you hardened, with before and after findings", "An IAM review that finds and fixes over-broad permissions", "A monitoring setup that alerts on a realistic cloud attack", "A threat model of a small cloud architecture"],
        career_progression=["Junior Cloud Security Analyst", "Cloud Security Engineer", "Senior Cloud Security Engineer or DevSecOps Engineer", "Cloud Security Architect or Head of Cloud Security"],
    ),
    "software-engineering": dict(
        category="engineering",
        keywords=["software developer", "programmer", "coding", "programming", "computer science", "swe", "algorithms", "data structures", "git"],
        who_its_for="People who enjoy building things with logic and want the general foundation before specialising in frontend, backend, full-stack or mobile.",
        portfolio_expectations=["Two or three finished projects on GitHub with clear READMEs", "One project with a database, an API and automated tests", "A deployed app someone else can open and use", "Visible, readable commit history that shows how you work"],
        career_progression=["Junior Software Engineer", "Software Engineer", "Senior Software Engineer", "Staff Engineer, Engineering Manager or Architect"],
    ),
    "frontend-development": dict(
        category="engineering",
        keywords=["front end", "front-end", "web developer", "ui developer", "javascript", "react", "css", "html", "typescript", "web design implementation"],
        who_its_for="People who like seeing their work immediately in the browser and care about how things look, feel and work for real users.",
        portfolio_expectations=["Three responsive projects live on the web, one using a real API", "A polished React app with sensible components and state", "Evidence of accessibility, such as keyboard and screen reader support", "A pixel-faithful build of a real design file"],
        career_progression=["Junior Frontend Developer", "Frontend Developer", "Senior Frontend Engineer", "Staff Frontend Engineer, Design Systems Engineer or Engineering Manager"],
    ),
    "backend-engineering": dict(
        category="engineering",
        keywords=["back end", "back-end", "api developer", "server side", "databases", "python", "node", "sql", "microservices", "rest api"],
        who_its_for="People who like data, logic and reliability more than visual polish, and want to build the systems behind an app.",
        portfolio_expectations=["A documented REST API with authentication and tests", "A database schema with real relationships and migrations", "A containerised service deployed somewhere live", "A write-up of one performance or reliability problem you fixed"],
        career_progression=["Junior Backend Developer", "Backend Engineer", "Senior Backend Engineer", "Staff Engineer, Platform Engineer or Solutions Architect"],
    ),
    "full-stack-development": dict(
        category="engineering",
        keywords=["full stack", "fullstack", "web developer", "mern", "next.js", "javascript", "typescript", "end to end", "startup developer"],
        who_its_for="People who want to build a whole product alone or on a small team, and are comfortable moving between interface and server.",
        portfolio_expectations=["One complete product with accounts, data and a deployed frontend and backend", "A second, more ambitious project built alone", "Tests that cover both sides of the stack", "A clear write-up of the architecture and the tradeoffs you made"],
        career_progression=["Junior Full-Stack Developer", "Full-Stack Developer", "Senior Full-Stack Engineer", "Tech Lead, Founding Engineer or Engineering Manager"],
    ),
    "mobile-development": dict(
        category="engineering",
        keywords=["mobile engineer", "mobile app developer", "ios", "android", "swift", "kotlin", "react native", "flutter", "app development", "app store", "mobile engineering"],
        who_its_for="People who want to build the apps people use all day on their phones, and enjoy the details of touch, performance and device behaviour.",
        portfolio_expectations=["At least one app published or in TestFlight or Play internal testing", "An app that works offline and handles errors gracefully", "A project that uses a real API, local storage and notifications", "Screenshots, a short demo video and a write-up for each app"],
        career_progression=["Junior Mobile Developer", "Mobile Engineer", "Senior Mobile Engineer", "Mobile Tech Lead, Staff Engineer or Engineering Manager"],
    ),
    "qa-engineering": dict(
        category="engineering",
        keywords=["quality assurance", "software tester", "test automation", "sdet", "playwright", "selenium", "manual testing", "bug hunting", "testing"],
        who_its_for="Careful, curious people who enjoy finding what others miss, and want a practical way into a software team.",
        portfolio_expectations=["A test plan and test cases for a real app", "A small automated suite (Playwright or Selenium) running in CI", "Clear, reproducible bug reports you filed on real software", "A write-up of how you decided what to automate and what not to"],
        career_progression=["Junior QA Engineer", "QA Engineer or Test Automation Engineer", "Senior QA or SDET", "QA Lead, Quality Engineering Manager or Developer in Test"],
    ),
    "cloud-engineering": dict(
        category="cloud-infrastructure",
        keywords=["cloud engineer", "aws", "azure", "gcp", "google cloud", "terraform", "infrastructure", "networking", "vpc", "iac", "sysadmin"],
        who_its_for="People who like systems, networks and making things run reliably, including sysadmins and IT support staff who want to move up.",
        portfolio_expectations=["A cloud network you designed and built with Terraform", "A highly available app that survives a failed server in a test", "Cost, backup and monitoring settings you chose and explained", "An architecture diagram with notes for each decision"],
        career_progression=["Junior Cloud Engineer", "Cloud Engineer", "Senior Cloud Engineer", "Cloud Architect, Platform Lead or Solutions Architect"],
    ),
    "devops-engineering": dict(
        category="cloud-infrastructure",
        keywords=["devops", "ci/cd", "pipelines", "kubernetes", "docker", "github actions", "automation", "observability", "platform engineering", "sre", "site reliability"],
        who_its_for="People who like automating repeated work and sit between development and operations, often coming from software or sysadmin backgrounds.",
        portfolio_expectations=["A CI/CD pipeline that tests, builds and deploys a real app", "A containerised app running on Kubernetes or a similar platform", "Dashboards and alerts that show how you observe a service", "A rollback or incident runbook you wrote and tested"],
        career_progression=["Junior DevOps Engineer", "DevOps Engineer", "Senior DevOps or Site Reliability Engineer", "Platform Engineering Lead or Infrastructure Manager"],
    ),
    "solutions-architecture": dict(
        category="cloud-infrastructure",
        keywords=["solutions architect", "system design", "architecture", "aws", "azure", "gcp", "scalability", "integration", "technical design", "pre-sales"],
        who_its_for="Experienced engineers who want to design whole systems and explain decisions to business and technical teams. Usually not a first role.",
        portfolio_expectations=["Architecture diagrams with written tradeoffs for each decision", "A design for a system with clear scale, cost and reliability targets", "A build-versus-buy analysis for a real component", "A short design review you led or contributed to"],
        career_progression=["Associate Solutions Architect", "Solutions Architect", "Senior or Principal Solutions Architect", "Enterprise Architect, Head of Architecture or CTO track"],
    ),
    "data-analysis": dict(
        category="data-ai",
        keywords=["data analyst", "analytics", "sql", "excel", "dashboards", "tableau", "power bi", "looker", "business intelligence", "bi", "reporting", "python", "pandas"],
        who_its_for="People who like finding the story in numbers and explaining it simply. One of the most accessible ways into the data field.",
        portfolio_expectations=["Two or three dashboards built on public data with a clear audience", "A SQL project with a documented schema and business questions", "A written analysis that ends in a recommendation", "A data cleaning case study that shows your decisions"],
        career_progression=["Junior Data Analyst", "Data Analyst", "Senior Analyst or Analytics Engineer", "Data Scientist, Analytics Manager or Product Analyst lead"],
    ),
    "data-science": dict(
        category="data-ai",
        keywords=["data scientist", "statistics", "a/b testing", "experimentation", "forecasting", "predictive modelling", "machine learning", "python", "pandas", "jupyter", "hypothesis testing"],
        who_its_for="People with a taste for statistics who want to answer open-ended questions with evidence, often after starting in data analysis.",
        portfolio_expectations=["An A/B test analysis with power, results and caveats", "A forecasting project judged against a sensible baseline", "A predictive model with honest validation and error analysis", "Notebooks written so a non-expert can follow the reasoning"],
        career_progression=["Junior Data Scientist", "Data Scientist", "Senior Data Scientist", "Staff Data Scientist, Applied Scientist or Head of Data Science"],
    ),
    "data-engineering": dict(
        category="data-ai",
        keywords=["data engineer", "etl", "elt", "pipelines", "airflow", "warehouse", "spark", "dbt", "bigquery", "snowflake", "python", "sql", "data modelling"],
        who_its_for="Engineering-minded people who like building reliable systems that move and shape data for analysts and scientists.",
        portfolio_expectations=["A scheduled pipeline that loads data into a warehouse", "Data quality checks and alerting on that pipeline", "A star schema or dimensional model with documentation", "A write-up of one failure you handled and how"],
        career_progression=["Junior Data Engineer", "Data Engineer", "Senior Data Engineer or Analytics Engineer", "Staff Data Engineer, Data Platform Lead or Data Architect"],
    ),
    "ai-engineering": dict(
        category="data-ai",
        keywords=["ai engineer", "machine learning engineer", "ml engineer", "ml", "mlops", "deep learning", "pytorch", "llm", "rag", "generative ai", "genai", "nlp", "python", "ai/ml", "neural networks"],
        who_its_for="People strong in programming and maths who want to build models and AI features into real products. Competitive, with a steep first year.",
        portfolio_expectations=["A classical ML project with honest evaluation", "A deep learning model served behind an API", "An LLM or retrieval application with a measured quality score", "A short write-up of what failed first and what you changed"],
        career_progression=["Junior AI or ML Engineer", "AI Engineer", "Senior AI Engineer or MLOps Engineer", "Staff AI Engineer, Applied Research Engineer or AI Team Lead"],
    ),
    "ui-ux-design": dict(
        category="design-product",
        keywords=["ui designer", "ux designer", "user experience", "user interface", "interaction design", "wireframes", "prototyping", "usability testing", "accessibility", "figma", "user research"],
        who_its_for="People who care about how interfaces feel to use, who enjoy detail and testing ideas with real users.",
        portfolio_expectations=["Two or three case studies that show research, wireframes and final screens", "A usability test with findings and design changes", "An accessible, responsive flow with states for errors and empty views", "Interactive Figma prototypes people can click through"],
        career_progression=["Junior UI/UX Designer", "UI/UX Designer", "Senior UX Designer or UX Researcher", "Lead Designer, Design Manager or Product Designer"],
    ),
    "product-design": dict(
        category="design-product",
        keywords=["product designer", "design systems", "end to end design", "figma", "product thinking", "design handoff", "case study", "design ops", "ux"],
        who_its_for="Designers who want to own the problem as well as the screens, working closely with product managers and engineers across a whole product.",
        portfolio_expectations=["Two or three end-to-end case studies from problem framing to shipped result", "A small design system with tokens, components and usage rules", "Evidence of measurable outcomes or clear success criteria", "A documented handoff showing states, edge cases and specs"],
        career_progression=["Junior Product Designer", "Product Designer", "Senior Product Designer", "Staff Designer, Design Lead or Head of Design"],
    ),
    "product-management": dict(
        category="design-product",
        keywords=["product manager", "pm", "apm", "roadmap", "prioritization", "product strategy", "metrics", "discovery", "prd", "user stories", "agile"],
        who_its_for="Communicators who like deciding what to build and why, and can work across engineering, design and the business. Often reached from an adjacent role.",
        portfolio_expectations=["A product requirements document for a real or realistic feature", "A prioritised roadmap with the reasoning shown", "A metrics plan that defines success for a launch", "A product teardown that proposes and justifies one improvement"],
        career_progression=["Associate Product Manager", "Product Manager", "Senior Product Manager", "Group Product Manager, Director of Product or Chief Product Officer"],
    ),
    "graphic-design": dict(
        category="design-product",
        keywords=["graphic designer", "visual design", "branding", "logo design", "typography", "layout", "illustration", "figma", "illustrator", "photoshop", "canva", "brand identity"],
        who_its_for="Visually minded people who like communicating through type, colour and layout, whether for brands, campaigns or print.",
        portfolio_expectations=["One full brand identity with logo, palette, type and guidelines", "A multi-format campaign across print and digital", "Typography-led pieces that show hierarchy and layout control", "Before and after examples that show how you responded to feedback"],
        career_progression=["Junior Graphic Designer", "Graphic Designer", "Senior Designer or Art Director", "Creative Director or Brand Lead"],
    ),
    "it-support": dict(
        category="operations-digital",
        keywords=["help desk", "service desk", "desktop support", "technical support", "it technician", "comptia a+", "troubleshooting", "windows", "active directory", "ticketing"],
        who_its_for="Patient helpers who like solving practical problems, and anyone who wants the quickest route into a first tech job with no degree.",
        portfolio_expectations=["A home lab that shows you can set up and fix real machines", "Sample knowledge base articles and troubleshooting guides", "A write-up of tickets resolved, with steps and outcomes", "A short project that automated one repetitive support task"],
        career_progression=["Help Desk Technician", "IT Support Specialist", "Systems or Network Administrator", "Cloud, Security or IT Manager (a common launchpad into other paths)"],
    ),
    "no-code-automation": dict(
        category="operations-digital",
        keywords=["no code", "nocode", "low code", "automation", "zapier", "make", "airtable", "bubble", "webflow", "workflow", "internal tools", "citizen developer"],
        who_its_for="Practical problem solvers who want to build working tools fast without learning to program first, including future freelancers.",
        portfolio_expectations=["Three automations that solve real problems, with before and after time saved", "A working internal tool built in a no-code platform", "A small client-style project with a brief, scope and delivery", "Notes on failures and how you made automations reliable"],
        career_progression=["Automation Specialist", "No-Code Developer or Operations Automation Lead", "Automation Consultant or Freelance Builder", "Operations Manager, Product Owner or a move into software engineering"],
    ),
    "technical-writing": dict(
        category="operations-digital",
        keywords=["technical writer", "documentation", "docs", "api documentation", "docs as code", "markdown", "content design", "developer documentation", "knowledge base", "communication"],
        who_its_for="Clear communicators who enjoy learning how things work and explaining them well, including teachers, journalists and engineers.",
        portfolio_expectations=["Three samples in different formats, such as a tutorial, a reference and a guide", "An open-source documentation contribution", "A docs set organised with clear navigation", "Before and after rewrites that show your editing judgement"],
        career_progression=["Junior Technical Writer", "Technical Writer", "Senior Technical Writer or Documentation Engineer", "Documentation Lead, Developer Experience Lead or Content Strategist"],
    ),
}

CATALOGUE_META = {slug: {**meta, "related_slugs": _related(slug)} for slug, meta in _META.items()}
