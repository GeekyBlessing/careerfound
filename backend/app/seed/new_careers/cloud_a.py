"""Cloud, Infrastructure & DevOps careers, batch A: SRE, platform engineering, systems administration."""

CAREERS = [
    dict(
        slug="site-reliability-engineering", name="Site Reliability Engineering (SRE)",
        summary="Keep production services reliable using engineering: define reliability targets, measure them, alert on what matters, respond to incidents and automate away repetitive operations work.",
        beginner_summary="You'll learn to measure how well a live service is working, decide how reliable it needs to be, and build the alerts and automation that keep it there.",
        difficulty=4, avg_timeline_weeks=44,
        entry_roles=["Junior SRE (where the title exists)", "Junior DevOps Engineer", "Systems Engineer", "Production Support Engineer", "Systems Administrator"],
        tools=["Prometheus", "Grafana", "OpenTelemetry", "Alertmanager", "Linux", "Python", "Kubernetes", "Terraform"], remote_potential=75,
        earning_notes="SRE is usually a second step. Most people arrive after a year or two in systems administration, DevOps, backend or cloud work, and junior SRE postings are rare. Pay tends to rise with on-call responsibility and with evidence that you have run real production systems, not with certificates.",
        icon="activity",
        skills_required=["Defining SLIs, SLOs and error budgets for a service", "Monitoring and observability: metrics, logs and traces", "Alert design that pages on user impact rather than noise", "Incident response, communication and blameless postmortems", "Automating repetitive operational work in Python or shell", "Capacity planning and safe failure testing"],
        certifications=["Certified Kubernetes Administrator (CKA)", "Prometheus Certified Associate (PCA)"],
        interview_prep=[
            "Your service has a 99.9 percent availability SLO over 30 days. How much downtime is that, and what do you do when half the budget is gone in week one",
            "What is the difference between an SLI, an SLO and an SLA, and who should own each",
            "A page fires at 3am saying error rate is above threshold. Walk through your first ten minutes before you know the cause",
            "Your on-call engineers get forty alerts a night and most need no action. How do you fix that",
            "Explain what a burn-rate alert is and why it beats a plain error-rate threshold",
            "A deploy caused an outage and the engineer who shipped it feels responsible. How do you run the postmortem",
        ],
        learning_resources=[
            {"label": "Google's Site Reliability Engineering book", "note": "Free to read online, the original description of SLOs, error budgets, monitoring and postmortem culture."},
            {"label": "The Site Reliability Workbook", "note": "Google's free companion book with worked examples of SLO setup and alerting on burn rate."},
            {"label": "Prometheus official documentation", "note": "Free, official guide to metrics, PromQL and alerting rules."},
        ],
        roadmap_outline={
            "beginner": [
                "Get solid with Linux, networking basics and the command line, since you will debug live machines",
                "Learn to read process, memory, disk and network behaviour with top, ss, journalctl and curl",
                "Write small Python or bash tools that call an HTTP endpoint and report its health",
                "Learn Git and basic Docker so you can run a service and its monitoring locally",
            ],
            "intermediate": [
                "Instrument a small service with Prometheus metrics and chart it in Grafana using PromQL",
                "Learn the golden signals (latency, traffic, errors, saturation) and choose an SLI for each user journey",
                "Set an SLO, calculate its error budget and write burn-rate alerts in Alertmanager",
                "Learn structured logging and basic OpenTelemetry tracing to follow one request across services",
            ],
            "advanced": [
                "Write runbooks for your alerts and rehearse them as a mock on-call shift",
                "Run a game day: inject latency and failures on purpose and practise the incident roles",
                "Write a blameless postmortem with a timeline, contributing factors and tracked action items",
                "Measure toil in a workflow, then automate the largest piece of it",
                "Do a load test and write a capacity plan with headroom and a scaling trigger",
            ],
        },
    ),
    dict(
        slug="platform-engineering", name="Platform Engineering",
        summary="Build the internal platform other engineers deploy on: templates, self-service infrastructure and a developer portal, run as a product with real users.",
        beginner_summary="You'll learn to turn repeated infrastructure work into reusable templates and tools, so developers can ship without asking for help every time.",
        difficulty=5, avg_timeline_weeks=52,
        entry_roles=["Junior DevOps Engineer", "Junior Cloud Engineer", "Junior Backend Developer", "Infrastructure Engineer (junior)"],
        tools=["Terraform", "Kubernetes", "Helm", "Backstage", "ArgoCD", "GitHub Actions", "Kyverno", "Docker"], remote_potential=80,
        earning_notes="Platform engineering is rarely a first job. Teams hire people who have already run pipelines, clusters or cloud accounts and felt the pain of doing it for many teams. Pay follows the scale of what you support and the adoption you can show, more than any single certificate.",
        icon="layers",
        skills_required=["Infrastructure as code with reusable, versioned Terraform modules", "Kubernetes and Helm as a deployment surface for other teams", "Designing golden paths and CI templates that developers choose to use", "GitOps delivery and policy as code guardrails", "Treating the platform as a product: user research, documentation and adoption metrics"],
        certifications=["Certified Kubernetes Administrator (CKA)", "HashiCorp Certified: Terraform Associate"],
        interview_prep=[
            "What is a golden path, and how do you stop it becoming a mandate that developers resent",
            "Teams keep copying an old Terraform snippet instead of using your module. How do you find out why and what do you change",
            "A team says your platform blocks them because their service needs something the template does not support. How do you respond",
            "A bad Helm chart change was released to the shared template and fifteen services failed to deploy. What do you do in the first hour and afterwards",
            "How would you decide whether to adopt Backstage or build a simple internal catalogue",
            "How do you measure whether a platform is working, and which numbers would you refuse to rely on",
        ],
        learning_resources=[
            {"label": "HashiCorp Terraform tutorials", "note": "Free, official hands-on tutorials including writing and publishing modules."},
            {"label": "Backstage official documentation", "note": "Free docs for the open source developer portal, including software templates and the catalogue."},
            {"label": "Team Topologies by Matthew Skelton and Manuel Pais", "note": "The book that explains platform teams, and how they should serve stream-aligned teams."},
        ],
        roadmap_outline={
            "beginner": [
                "Build real depth first in DevOps, cloud or backend work, because platform teams hire from those roles",
                "Learn Terraform well enough to write a module with typed variables, outputs and a README",
                "Learn Kubernetes objects (Deployments, Services, Ingress, Namespaces) on a local kind or minikube cluster",
                "Package an application as a Helm chart with sensible default values",
            ],
            "intermediate": [
                "Write a reusable CI workflow that other repositories call instead of copying",
                "Create a golden path template: repo skeleton, Helm chart and pipeline that deploy a service in under an hour",
                "Learn GitOps with ArgoCD so deployments come from a Git repository, not a laptop",
                "Add policy as code (Kyverno or OPA Gatekeeper) to reject unsafe manifests with clear messages",
            ],
            "advanced": [
                "Set up Backstage with a software catalogue and a scaffolder template for new services",
                "Interview real developers about their pain points and turn the answers into a platform backlog",
                "Define adoption and developer experience metrics, such as time to first deploy and share of services on the template",
                "Version and release your modules and charts safely, with changelogs and a deprecation policy",
                "Write platform documentation and an onboarding guide that a new team can follow alone",
            ],
        },
    ),
    dict(
        slug="systems-administration", name="Systems Administration",
        summary="Run the servers and services an organisation depends on: install, secure, patch, back up, monitor and fix Linux and Windows machines, and automate the routine work.",
        beginner_summary="You'll learn to set up and look after servers and the accounts, network services and backups around them, so everything keeps working.",
        difficulty=3, avg_timeline_weeks=32,
        entry_roles=["Junior Systems Administrator", "Systems Administrator", "IT Administrator", "Linux Administrator (junior)", "Infrastructure Technician"],
        tools=["Linux", "Windows Server", "Active Directory", "PowerShell", "Bash", "Proxmox", "Hyper-V", "VirtualBox"], remote_potential=55,
        earning_notes="Sysadmin roles are a common and honest way into infrastructure, and many people reach them from IT support after a year or two. Pay rises with the scope you own (more servers, a domain, on-call) and with scripting skill, and the role is a frequent stepping stone to cloud, DevOps and SRE work.",
        icon="server",
        skills_required=["Linux and Windows Server installation and configuration", "User, group and permission management across systems", "Patching, backup and restore procedures, including testing restores", "Scripting repeated tasks in bash and PowerShell", "Directory services, DNS and DHCP administration", "Basic monitoring, troubleshooting and clear documentation"],
        certifications=["CompTIA Linux+", "Red Hat Certified System Administrator (RHCSA)", "CompTIA Server+"],
        interview_prep=[
            "A user says they cannot open a shared folder they used yesterday. Walk through how you check permissions on a Windows file server and a Linux one",
            "A server's disk is 98 percent full at 2pm on a Friday. What do you check and in what order",
            "How do you know your backups would actually work in a disaster",
            "What happens, step by step, when a Windows PC joins an Active Directory domain and a user logs in",
            "Explain what a Group Policy Object is and how you would debug one that is not applying",
            "You need to apply a security patch to twenty servers. How do you plan and sequence it",
        ],
        learning_resources=[
            {"label": "The Linux Command Line by William Shotts", "note": "Free to read online, the standard beginner book for the shell and basic administration."},
            {"label": "Microsoft Learn: Windows Server documentation", "note": "Free, official guides for Active Directory, DNS, DHCP and Group Policy."},
            {"label": "Proxmox VE documentation", "note": "Free, official admin guide for the open source virtualization platform."},
        ],
        roadmap_outline={
            "beginner": [
                "Install Ubuntu Server in a VirtualBox VM and learn the filesystem layout, package manager and systemd services",
                "Manage users, groups, file permissions and sudo on that server",
                "Set up SSH key login and a basic firewall, then turn off password logins",
                "Learn basic networking: IP addressing, subnets, DNS lookups and reading ports with ss",
            ],
            "intermediate": [
                "Write bash scripts for routine jobs such as disk reports, log rotation and user creation",
                "Schedule jobs with cron and systemd timers and check their output",
                "Set up automated backups with restic or rsync and perform a real restore test",
                "Install Windows Server (evaluation edition) and learn the Server Manager and PowerShell basics",
            ],
            "advanced": [
                "Build an Active Directory domain with DNS, DHCP, organisational units and Group Policy",
                "Automate account creation and reporting in PowerShell using Active Directory cmdlets",
                "Run two or more hypervisor VMs in Proxmox or Hyper-V and practise snapshots and migrations",
                "Set up basic monitoring and alerts for disk, memory and service health",
                "Write runbooks and a change log for everything you build, as an employer would expect",
            ],
        },
    ),
]

META = {
    "site-reliability-engineering": dict(
        keywords=["sre", "site reliability engineer", "site reliability engineering", "reliability engineer", "production engineer", "slo", "sli", "error budget", "burn rate", "prometheus", "grafana", "opentelemetry", "observability", "monitoring", "alerting", "on-call", "incident response", "postmortem", "toil", "alertmanager"],
        who_its_for="People who like finding out why systems fail and prefer fixing the cause with code over firefighting. It suits calm, methodical thinkers who can handle on-call. The catch is that it is usually a second step after sysadmin, DevOps, backend or cloud work, so plan an adjacent first role.",
        portfolio_expectations=["A small service with Prometheus metrics, a Grafana dashboard and a written SLO", "Burn-rate alert rules with a test showing they fire on a real fault", "A blameless postmortem for an incident you caused and resolved in a lab", "A script or tool that removes a piece of manual operational work, with before and after time measured"],
        career_progression=["Junior SRE or Systems Engineer", "Site Reliability Engineer", "Senior Site Reliability Engineer", "Staff SRE, Reliability Lead or Engineering Manager"],
    ),
    "platform-engineering": dict(
        keywords=["platform engineer", "platform engineering", "internal developer platform", "idp", "developer portal", "backstage", "golden path", "paved road", "terraform modules", "helm", "argocd", "gitops", "kubernetes", "developer experience", "devex", "policy as code", "self-service infrastructure", "kyverno", "open policy agent", "infrastructure platform"],
        who_its_for="People who enjoy building tools and templates for other engineers, and who like talking to those engineers to learn what they need. It is rarely a first role: most platform engineers come from DevOps, cloud or backend work. The catch is that your users are colleagues who can ignore your platform if it is not better than their own scripts.",
        portfolio_expectations=["A versioned Terraform module with documented inputs, outputs and an example used by two consumers", "A golden path template (repo skeleton, Helm chart and CI workflow) that deploys a service to a local cluster", "A Backstage instance with a catalogue and a scaffolder template, with a short demo recording", "A write-up treating the platform as a product: users, pain points, adoption metrics and a roadmap"],
        career_progression=["Junior DevOps or Cloud Engineer", "Platform Engineer", "Senior Platform Engineer", "Staff Platform Engineer, Platform Product Manager or Head of Platform"],
    ),
    "systems-administration": dict(
        keywords=["sysadmin", "system administrator", "systems administrator", "linux administrator", "linux admin", "windows administrator", "windows server", "active directory", "group policy", "powershell", "bash", "server administration", "proxmox", "hyper-v", "virtualbox", "dns", "dhcp", "backups", "patching", "it administrator", "server admin"],
        who_its_for="People who like understanding how machines and services fit together, and who take care over small details like permissions and backups. It suits patient troubleshooters. The catch is that you are responsible when something stops working, which sometimes means evenings or weekends.",
        portfolio_expectations=["A documented home lab with at least two Linux VMs and a Windows Server domain controller", "A backup setup with a written restore test and the recovered files checked against the originals", "Bash and PowerShell scripts in a Git repository, each with a README and example output", "Runbooks for common tasks such as onboarding a user, patching a server and recovering from a full disk"],
        career_progression=["IT Support or Junior Systems Administrator", "Systems Administrator", "Senior Systems Administrator", "Infrastructure Lead, Cloud Engineer or Site Reliability Engineer"],
    ),
}

PROJECTS = {
    "site-reliability-engineering": {
        "skills": [
            {"key": "service_metrics", "label": "Service Metrics and Dashboards", "category": "foundation"},
            {"key": "slos_error_budgets", "label": "SLIs, SLOs and Error Budgets", "category": "core"},
            {"key": "alerting_on_call", "label": "Burn-Rate Alerting and On-Call", "category": "core"},
            {"key": "incident_response", "label": "Incident Response and Postmortems", "category": "advanced"},
            {"key": "toil_capacity", "label": "Toil Reduction and Capacity Planning", "category": "advanced"},
        ],
        "skill_edges": [
            ("service_metrics", "slos_error_budgets"),
            ("slos_error_budgets", "alerting_on_call"),
            ("alerting_on_call", "incident_response"),
            ("incident_response", "toil_capacity"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to see what a running service is doing. You will expose metrics from a small web app, scrape them with Prometheus and chart request rate, errors and latency in Grafana.",
                "skill_key": "service_metrics",
                "projects": [
                    {
                        "title": "Instrument a Web Service with Prometheus and Chart Its Golden Signals in Grafana",
                        "teaches": "how metrics are exposed, scraped and queried, and how to read request rate, error rate and latency from a live service",
                        "prerequisites": ["Docker and Docker Compose installed", "Basic Python (able to read a short Flask app)", "Comfort with the command line"],
                        "expected_output": "A Docker Compose stack with a Python web service, Prometheus and Grafana, and a Grafana dashboard with panels for requests per second, error percentage and 95th percentile latency, plus a screenshot taken while a load tool is running.",
                        "steps": [
                            "Create a folder and write a small Flask app with a /work endpoint that sleeps a random 20 to 300 ms and returns HTTP 500 about 5 percent of the time.",
                            "Install prometheus_client and add a Counter named http_requests_total with labels for status code, and a Histogram named http_request_duration_seconds. Expose them on /metrics.",
                            "Run the app and open /metrics in a browser to confirm the counters change as you refresh /work.",
                            "Write a prometheus.yml with a scrape_configs job pointing at the app, and add Prometheus and Grafana as services in docker-compose.yml.",
                            "Run docker compose up, open Prometheus on port 9090, go to Status > Targets and check the app shows as UP.",
                            "In the Prometheus expression browser, run rate(http_requests_total[1m]) and then the ratio of 5xx requests to all requests to get the error rate.",
                            "Add Prometheus as a data source in Grafana (port 3000) and build three panels: requests per second, error percentage, and histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)).",
                            "Generate traffic with `hey -z 60s -c 10 http://localhost:5000/work` (or a bash curl loop) and watch the panels move. Take a screenshot.",
                        ],
                        "hints": [
                            "Counters only go up. Always wrap them in rate() or increase() before graphing, never graph the raw value.",
                            "If a target shows DOWN, check the hostname: inside Compose use the service name, not localhost.",
                            "histogram_quantile needs the _bucket series and a sum by (le), otherwise you get empty or wrong results.",
                            "Use a short rate window (1m) while testing and a longer one (5m) once the dashboard is stable.",
                        ],
                        "common_mistakes": [
                            "Graphing a raw counter and wondering why the line only climbs.",
                            "Using localhost in prometheus.yml, which points at the Prometheus container itself.",
                            "Putting user IDs or full URLs in metric labels, which creates thousands of series and breaks Prometheus.",
                            "Averaging latency instead of using percentiles, which hides the slow requests users actually feel.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Turn raw metrics into a reliability target. You will define an SLI and SLO for the service, compute its error budget and write multi-window burn-rate alerts that fire on real user impact.",
                "skill_key": "alerting_on_call",
                "projects": [
                    {
                        "title": "Define an SLO and Write Multi-Window Burn-Rate Alerts for Your Service",
                        "teaches": "how to turn an availability goal into an error budget and alert on the speed the budget is being spent, not on every error",
                        "prerequisites": ["The Prometheus and Grafana stack from the Foundations project", "Understanding of PromQL rate() and sum by", "Docker Compose"],
                        "expected_output": "A one-page SLO document, Prometheus recording and alerting rules for a 99.5 percent availability SLO over 30 days, an Alertmanager that receives the alerts, and a test log showing a page fire during a fault and stay silent during a brief blip.",
                        "steps": [
                            "Write the SLI as a sentence: the proportion of /work requests that return a non-5xx status. Write the SLO: 99.5 percent over a rolling 30 days. Calculate the error budget (0.5 percent) and what that is in minutes of full outage (about 216).",
                            "Create a Prometheus rules file with recording rules for the error ratio over 5m, 30m, 1h and 6h, for example `job:sli_errors:ratio_rate5m`.",
                            "Write a fast-burn alert: error ratio above 14.4 times the budget rate (14.4 * 0.005) over both 1h and 5m, severity page.",
                            "Write a slow-burn alert: error ratio above 6 times the budget rate over both 6h and 30m, severity ticket.",
                            "Validate syntax with `promtool check rules` and unit test at least one alert with `promtool test rules`.",
                            "Add Alertmanager to Compose and route the page severity to a webhook receiver (a free webhook.site URL or a small local listener that prints the payload).",
                            "Change the app's failure rate to 30 percent, run `hey` for 10 minutes and confirm the fast-burn alert fires and arrives at the webhook.",
                            "Return the app to 5 percent failures, then cause a single 1 minute spike at 50 percent failures and confirm the multi-window rule keeps the page quiet. Record both results.",
                            "Add an error budget remaining panel to the Grafana dashboard.",
                        ],
                        "hints": [
                            "The two windows are the point: the long window stops flapping and the short one makes the alert resolve quickly after the problem ends.",
                            "Define a failed request the way a user would; a very slow response may need its own latency SLI.",
                            "Use `for:` sparingly with burn-rate alerts since the windows already do the smoothing.",
                            "Keep the SLO document short enough that a new teammate reads it in two minutes.",
                        ],
                        "common_mistakes": [
                            "Setting the SLO at 100 percent, which leaves no error budget and makes any change a breach.",
                            "Alerting on a plain error-rate threshold, which pages on tiny blips and misses slow steady burns.",
                            "Choosing an SLI the user cannot feel, such as CPU usage, instead of success and latency of requests.",
                            "Writing alerts without testing them, so they have never actually fired.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Practise being on call. You will break a multi-service app on purpose, respond using a runbook, write a blameless postmortem and automate the most repetitive step you find.",
                "skill_key": "incident_response",
                "projects": [
                    {
                        "title": "Run a Failure Game Day, Respond Using a Runbook and Write a Blameless Postmortem",
                        "teaches": "safe failure testing, incident response roles, runbook writing, blameless postmortems and removing toil with automation",
                        "prerequisites": ["The SLO and alerting project completed", "A three-service Docker Compose app (a frontend, an API and a Redis or Postgres container)", "Toxiproxy or tc for fault injection", "Basic Python or bash"],
                        "expected_output": "A game day report containing a written hypothesis, an incident timeline from real alert and dashboard timestamps, a runbook for the failing alert, a blameless postmortem with action items, and a script that automates one repeated recovery step, with before and after times.",
                        "steps": [
                            "Run a three-service app in Compose with metrics on each service and your SLO alerts from the previous project. Add Toxiproxy between the API and the database.",
                            "Write a game day plan first: hypothesis (for example, API p95 stays under 500 ms if the database adds 300 ms latency), blast radius (local only), stop condition and who plays incident commander and scribe (you can play both and note it).",
                            "Start a load test with k6 or hey, then use the Toxiproxy API to add 800 ms of latency and a 30 percent timeout toxic to the database connection.",
                            "Act as on-call: acknowledge the page, open the dashboard, note times, find the failing dependency and record every command you run in a timeline file.",
                            "Mitigate (remove the toxic or restart the connection pool), confirm recovery on the dashboard and note the time to detect, time to mitigate and error budget spent.",
                            "Write a runbook for this alert: symptoms, dashboards to check, first three diagnostic commands, mitigation steps and when to escalate.",
                            "Write a blameless postmortem: summary, impact, timeline, contributing factors (not people), what went well and badly, and action items each with an owner and a due date.",
                            "Find the most repeated manual step (for example restarting the API and checking health) and automate it with a small Python script. Time it by hand and with the script.",
                            "Fix at least one action item for real, such as adding a client timeout or retry limit, and rerun the game day to show the improvement.",
                        ],
                        "hints": [
                            "Write the hypothesis before you break anything; otherwise it becomes a demo, not a test.",
                            "Timestamps from Alertmanager and Grafana are better evidence than memory.",
                            "In the postmortem, ask 'what made this the easy mistake to make' rather than 'who did it'.",
                            "Keep the blast radius small and have a stop condition ready. A game day that cannot be stopped is an outage.",
                        ],
                        "common_mistakes": [
                            "Writing a postmortem that names a person as the cause and lists 'be more careful' as the action item.",
                            "Skipping the hypothesis and stop condition, so there is nothing to learn from or limit the damage.",
                            "Writing a runbook that says 'investigate the database' with no commands or dashboards.",
                            "Listing action items with no owner or date, so none get done.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "platform-engineering": {
        "skills": [
            {"key": "terraform_modules", "label": "Reusable Terraform Modules", "category": "foundation"},
            {"key": "kubernetes_helm", "label": "Kubernetes and Helm Packaging", "category": "core"},
            {"key": "golden_path_ci", "label": "Golden Path Templates and Reusable CI", "category": "core"},
            {"key": "gitops_policy", "label": "GitOps and Policy as Code", "category": "advanced"},
            {"key": "developer_portal", "label": "Developer Portal and Platform as a Product", "category": "advanced"},
        ],
        "skill_edges": [
            ("terraform_modules", "kubernetes_helm"),
            ("kubernetes_helm", "golden_path_ci"),
            ("golden_path_ci", "gitops_policy"),
            ("gitops_policy", "developer_portal"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Build the habit of packaging infrastructure so someone else can use it. You will write a Terraform module that gives any team a ready, limited Kubernetes namespace, and reuse it for two teams.",
                "skill_key": "terraform_modules",
                "projects": [
                    {
                        "title": "Write a Reusable Terraform Module That Gives Each Team a Namespace With Quotas",
                        "teaches": "module design: typed inputs, sensible defaults, outputs and documentation that let other people use infrastructure without reading its internals",
                        "prerequisites": ["Terraform installed", "Docker and the kind tool installed", "kubectl installed", "Basic Kubernetes vocabulary (namespace, quota)"],
                        "expected_output": "A Git repository with a Terraform module that creates a team namespace, ResourceQuota, LimitRange and a RoleBinding, a README listing inputs and outputs, and a root configuration that uses the module for two different teams on a local kind cluster.",
                        "steps": [
                            "Create a local cluster with `kind create cluster --name platform-lab` and confirm access with `kubectl get nodes`.",
                            "Create a folder `modules/team-namespace` with main.tf, variables.tf, outputs.tf and versions.tf, using the hashicorp/kubernetes provider.",
                            "In variables.tf declare team_name (string, with a validation block for lowercase letters and dashes), cpu_limit and memory_limit (with defaults), and owner_group.",
                            "In main.tf create a kubernetes_namespace, kubernetes_resource_quota, kubernetes_limit_range and a kubernetes_role_binding giving owner_group the built-in edit ClusterRole in that namespace.",
                            "Add outputs for the namespace name and the quota values, then write a README with a table of inputs and one usage example.",
                            "In a separate root folder, call the module twice (for example `payments` and `search`) with different quotas, then run `terraform init`, `terraform fmt`, `terraform validate` and `terraform plan`.",
                            "Run `terraform apply`, then check with `kubectl describe namespace payments` and `kubectl get resourcequota -A`.",
                            "Try an invalid team name such as `Payments_Team` and confirm your validation message appears at plan time.",
                        ],
                        "hints": [
                            "Give every variable a description. The description is the documentation people actually see in the plan output.",
                            "Keep the module small and opinionated. A module with forty optional flags is a copy of the provider.",
                            "Pin the provider version in versions.tf so the module behaves the same next month.",
                            "Use `terraform fmt -check` in your habit now; it becomes a CI step later.",
                        ],
                        "common_mistakes": [
                            "Hardcoding team names inside the module, so it cannot be reused.",
                            "Exposing every provider argument as a variable, creating a wrapper nobody understands.",
                            "Skipping validation blocks, so mistakes show up as confusing Kubernetes errors.",
                            "Forgetting outputs, forcing consumers to guess resource names.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Offer a path developers can follow. You will build a Helm chart and a reusable GitHub Actions workflow, then deploy two different sample services with nothing but a short values file each.",
                "skill_key": "golden_path_ci",
                "projects": [
                    {
                        "title": "Build a Golden Path: Shared Helm Chart and Reusable CI Workflow for Two Services",
                        "teaches": "how a platform team packages deployment knowledge into a chart and a workflow that many services can adopt with minimal configuration",
                        "prerequisites": ["The kind cluster and namespaces from the Foundations project", "Helm 3 installed", "A GitHub account (free) and Docker", "Basic YAML"],
                        "expected_output": "A platform repository holding a generic `service` Helm chart and a reusable GitHub Actions workflow, plus two small sample service repositories that each deploy to the kind cluster using only a short values file and a five-line workflow call.",
                        "steps": [
                            "Create a repo `platform-golden-path` and scaffold a chart with `helm create service`. Delete the sample templates you do not need.",
                            "Make the chart opinionated: a Deployment with readiness and liveness probes, resource requests and limits, a Service, an optional Ingress, and a non-root securityContext set by default.",
                            "Write values.yaml with safe defaults and a values.schema.json so `helm lint` rejects a missing image or a replicas value that is not a number.",
                            "Run `helm lint` and `helm template` against a sample values file, then install the chart into the `payments` namespace with `helm install`.",
                            "Create a reusable workflow `.github/workflows/build-and-publish.yml` with `on: workflow_call` that builds a Docker image, tags it with the commit SHA and pushes it to GitHub Container Registry.",
                            "Create two tiny sample services in separate repositories (one Python, one Node) and call the reusable workflow from each with a `uses:` line and a few inputs.",
                            "Deploy each service by running `helm upgrade --install` with only its own values.yaml (image, port, replicas). Check with `kubectl get pods -n payments`.",
                            "Tag the platform repo `v1.0.0`, make a chart change and release `v1.1.0`, and make one service pin to the earlier version to see why versioning matters.",
                        ],
                        "hints": [
                            "Start from the two services' real differences (port, env vars) and put only those in values; everything else belongs in the chart.",
                            "values.schema.json gives developers an error before the deploy, which is cheaper than debugging a broken pod.",
                            "Test the chart with `helm template | kubectl apply --dry-run=server -f -` to catch API errors.",
                            "Call reusable workflows by tag, never by branch, so a change to the platform cannot silently break every consumer.",
                        ],
                        "common_mistakes": [
                            "Exposing every Kubernetes field in values.yaml so developers must understand all of Kubernetes anyway.",
                            "Referencing the reusable workflow at `main`, so any platform change instantly affects all services.",
                            "Leaving out probes and resource limits in the defaults, which are the first things production needs.",
                            "Building the template around one service and discovering it fits no one else.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Wrap the platform in self-service and guardrails. You will add ArgoCD, a Kyverno policy and a Backstage template, then measure whether anyone would actually choose it.",
                "skill_key": "developer_portal",
                "projects": [
                    {
                        "title": "Self-Service Platform: Backstage Template, ArgoCD GitOps and Kyverno Guardrails With Adoption Metrics",
                        "teaches": "how the pieces of an internal developer platform connect, and how to treat the result as a product by measuring adoption and developer experience",
                        "prerequisites": ["The golden path chart and workflow from the previous project", "Node.js 20 or later and Yarn for Backstage", "A free GitHub account and a personal access token", "A kind cluster with at least 4 GB of RAM available"],
                        "expected_output": "A running local Backstage with a catalogue and a 'New Service' scaffolder template that creates a GitHub repo with the golden path files, an ArgoCD instance deploying that repo to kind, a Kyverno policy blocking unsafe workloads, and a one-page platform product brief with adoption metrics and feedback from at least two real users.",
                        "steps": [
                            "Install ArgoCD on the kind cluster with the official manifest, then log in via `kubectl port-forward svc/argocd-server -n argocd 8080:443`.",
                            "Create a `platform-config` GitHub repo and an ArgoCD ApplicationSet that creates one Application per folder under `services/`, deploying with the golden path chart.",
                            "Install Kyverno with Helm and write a ClusterPolicy that rejects Pods using the `latest` tag or missing resource limits, with a message that explains the fix. Test it with a bad manifest.",
                            "Create a Backstage app with `npx @backstage/create-app@latest` and start it locally with `yarn dev`.",
                            "Write a scaffolder template (template.yaml) that asks for service name, language and owner, then uses `fetch:template` to render the skeleton, `publish:github` to create the repo and a step that opens a pull request adding the service to `platform-config`.",
                            "Add a `catalog-info.yaml` to the skeleton so each new service registers itself in the Backstage catalogue with an owner and a link to its ArgoCD application.",
                            "Create three services through the template and time each from clicking Create to a healthy pod. Record the time to first deploy.",
                            "Interview at least two developers (friends or classmates are fine) as they try the template; note where they stall and what they ask.",
                            "Write a one-page product brief: users, top three pain points found, the metrics you will track (time to first deploy, share of services on the template, policy rejections), and the next quarter's roadmap.",
                        ],
                        "hints": [
                            "Keep the Backstage template small. Two inputs and a working result beat ten inputs and a broken one.",
                            "Run Kyverno policies in Audit mode first to see what would fail, then switch to Enforce.",
                            "Time to first deploy is your most honest metric. Measure it before and after the template.",
                            "Watch people use the platform without helping them. Their confusion is your backlog.",
                        ],
                        "common_mistakes": [
                            "Enforcing a policy immediately with an error message nobody can act on.",
                            "Building the portal before checking that developers want one.",
                            "Counting 'platform features shipped' as success instead of adoption and time saved.",
                            "Letting the template generate repos that skip the catalogue file, leaving the catalogue empty and stale.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "systems-administration": {
        "skills": [
            {"key": "linux_server_basics", "label": "Linux Server Administration", "category": "foundation"},
            {"key": "scripting_automation", "label": "Bash and PowerShell Scripting", "category": "core"},
            {"key": "backup_recovery", "label": "Patching, Backup and Tested Restores", "category": "core"},
            {"key": "dns_dhcp_services", "label": "DNS and DHCP Services", "category": "advanced"},
            {"key": "windows_active_directory", "label": "Active Directory and Group Policy", "category": "advanced"},
        ],
        "skill_edges": [
            ("linux_server_basics", "scripting_automation"),
            ("scripting_automation", "backup_recovery"),
            ("backup_recovery", "dns_dhcp_services"),
            ("dns_dhcp_services", "windows_active_directory"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Set up and secure your first server. You will install Ubuntu Server in a VM and practise the daily work of users, permissions, SSH keys, a firewall and automatic security updates.",
                "skill_key": "linux_server_basics",
                "projects": [
                    {
                        "title": "Build and Secure an Ubuntu Server VM With Users, Shared Folders and SSH Keys",
                        "teaches": "the core Linux server tasks every sysadmin does: accounts, permissions, remote access and basic hardening",
                        "prerequisites": ["VirtualBox installed", "Ubuntu Server 24.04 LTS ISO", "A computer with at least 8 GB of RAM"],
                        "expected_output": "A running Ubuntu Server VM with three users in two groups, a shared project directory with correct group permissions, key-only SSH login, an active firewall and automatic security updates, documented as a short setup checklist.",
                        "steps": [
                            "Create a VirtualBox VM (2 GB RAM, 20 GB disk, bridged or NAT with port forwarding for SSH) and install Ubuntu Server 24.04 LTS, enabling the OpenSSH server option.",
                            "Log in and run `sudo apt update && sudo apt upgrade`, then check the release with `lsb_release -a` and disk space with `df -h`.",
                            "Create groups `devs` and `ops` with `groupadd`, and three users with `adduser`, adding them to groups using `usermod -aG`.",
                            "Create `/srv/project` owned by root:devs with mode 2770 (setgid), then log in as different users to test who can read and write files.",
                            "Generate an SSH key pair on your host with `ssh-keygen -t ed25519`, copy it with `ssh-copy-id`, and log in without a password.",
                            "Edit `/etc/ssh/sshd_config` to set `PasswordAuthentication no` and `PermitRootLogin no`, test the config with `sudo sshd -t`, then restart the service while keeping a second session open.",
                            "Enable the firewall: `sudo ufw allow OpenSSH` then `sudo ufw enable`, and check `sudo ufw status verbose`.",
                            "Install `unattended-upgrades` and confirm it with `sudo unattended-upgrade --dry-run`; read recent entries with `journalctl -u ssh --since today`.",
                            "Write the steps as a numbered checklist another admin could follow to build the same server.",
                        ],
                        "hints": [
                            "Always keep one SSH session open when changing sshd_config, so a typo does not lock you out.",
                            "`ls -ld` and `namei -l` show permission problems up the whole path, not just on the file.",
                            "Take a VirtualBox snapshot before each major change so you can undo mistakes.",
                            "Read /var/log/auth.log (or journalctl) after a failed login to learn what the server records.",
                        ],
                        "common_mistakes": [
                            "Disabling password login before testing that the key works, and locking yourself out.",
                            "Fixing permission errors with chmod 777, which removes the access control you were trying to build.",
                            "Enabling the firewall before allowing SSH.",
                            "Doing everything as root and never testing as a normal user.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Learn the part that decides whether you can be trusted with servers: scripted routine work and backups proven by a real restore. You will back up one server to another and deliberately recover from deleted data.",
                "skill_key": "backup_recovery",
                "projects": [
                    {
                        "title": "Automate Backups With restic on Two Servers and Prove It With a Tested Restore",
                        "teaches": "scheduled backups, retention, disk monitoring and the discipline of testing restores before you need them",
                        "prerequisites": ["The Ubuntu Server VM from the Foundations project", "A second Ubuntu VM (clone the first)", "Basic bash and cron or systemd knowledge"],
                        "expected_output": "Two VMs where server A backs up /srv and /etc to server B nightly with restic, a systemd timer running a bash script with logging and a disk space check, and a written restore test showing deleted files recovered and verified with checksums.",
                        "steps": [
                            "Clone the first VM to make server B and give both a host-only network address so they can reach each other. Set up SSH key login from A to B.",
                            "On B create a user `backup` and a folder `/backups/restic`. On A install restic with `sudo apt install restic`.",
                            "Initialise a repository over SFTP with `restic -r sftp:backup@serverb:/backups/restic init`, storing the password in a root-only file referenced by `RESTIC_PASSWORD_FILE`.",
                            "Create sample data in /srv/project (about 50 files), then run `restic backup /srv /etc` and `restic snapshots`.",
                            "Write `/usr/local/bin/backup.sh` that runs the backup, then `restic forget --keep-daily 7 --keep-weekly 4 --prune`, logs to /var/log/backup.log and exits non-zero on failure.",
                            "Add a check in the script that warns (to the log and to `logger`) if the root filesystem is more than 85 percent full.",
                            "Create `backup.service` and `backup.timer` systemd units to run nightly, enable the timer and verify with `systemctl list-timers` and `journalctl -u backup`.",
                            "Run `sha256sum` over /srv/project, delete the folder, restore it with `restic restore latest --target /tmp/restore`, and compare checksums to prove the data matches.",
                            "Run `restic check`, and write a short restore runbook with exact commands and how long the restore took.",
                        ],
                        "hints": [
                            "Store the repository password somewhere other than the backed-up disk, or a lost server loses its backups too.",
                            "Test the script by hand as root first. Timers fail silently if the script depends on your shell environment.",
                            "Use full paths in scripts, since systemd does not give you your login PATH.",
                            "A backup you have not restored is a hope, not a backup.",
                        ],
                        "common_mistakes": [
                            "Keeping the only backup on the same disk or VM as the source.",
                            "Never testing a restore, then discovering missing files during an incident.",
                            "Running prune without a retention policy you understand, deleting history you needed.",
                            "Letting the script exit 0 on failure, so monitoring never notices.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Run a small office's identity and network services. You will build a Windows Server domain with DNS, DHCP and Group Policy, join a client, and onboard users from a CSV file with PowerShell.",
                "skill_key": "windows_active_directory",
                "projects": [
                    {
                        "title": "Build a Windows Domain With DNS, DHCP and Group Policy and Onboard Users With PowerShell",
                        "teaches": "how a Windows domain works end to end, and how to manage it reliably with Group Policy and PowerShell instead of manual clicking",
                        "prerequisites": ["VirtualBox or Hyper-V with at least 12 GB of RAM on the host", "Windows Server 2022 evaluation ISO from Microsoft Evaluation Center", "Windows 11 Enterprise evaluation ISO", "Basic PowerShell"],
                        "expected_output": "A working lab domain `lab.local` with a domain controller providing AD DS, DNS and DHCP, a Windows client joined to it, three Group Policy Objects that demonstrably apply, a PowerShell script that creates users from a CSV, and a Windows Server Backup of the domain controller with a documented restore procedure.",
                        "steps": [
                            "Create an internal VirtualBox network and install Windows Server 2022 (Desktop Experience). Set a static IP such as 192.168.50.10 and rename the machine DC01.",
                            "Install AD DS with `Install-WindowsFeature AD-Domain-Services -IncludeManagementTools`, then promote it using `Install-ADDSForest -DomainName lab.local`.",
                            "Install the DHCP role, authorise it in AD and create a scope 192.168.50.100 to 192.168.50.200 with the DC as DNS server and router options.",
                            "Create organisational units for Staff and Computers and groups `Sales` and `IT` using Active Directory Users and Computers.",
                            "Install Windows 11 as a client on the same internal network, confirm it gets an address from DHCP and that `nslookup lab.local` works, then join it to the domain.",
                            "In Group Policy Management create three GPOs: a password and lockout policy, a mapped network drive for Sales, and a screen lock timeout. Link them to the correct OUs and run `gpupdate /force` and `gpresult /r` on the client to prove they apply.",
                            "Write a PowerShell script using `Import-Csv` and `New-ADUser` to create ten users from users.csv, place them in OUs, add them to groups and set a temporary password requiring change at first logon.",
                            "Extend the script to disable accounts listed in a second CSV (offboarding) and write both actions to a log file.",
                            "Install Windows Server Backup, run `wbadmin start systemstatebackup` to an extra virtual disk, and document how you would restore the domain controller.",
                        ],
                        "hints": [
                            "Point the client's DNS only at the domain controller. Domain join problems are DNS problems most of the time.",
                            "Test GPOs on a test OU and one user first, then link more widely.",
                            "Use `-WhatIf` on destructive PowerShell commands while developing the script.",
                            "Take VM snapshots before promoting the domain controller and before editing policies.",
                        ],
                        "common_mistakes": [
                            "Pointing the client at a public DNS server, so it cannot find the domain.",
                            "Linking a new GPO to the whole domain before testing it.",
                            "Deleting accounts on offboarding instead of disabling them first.",
                            "Using the Administrator account for daily work in the lab instead of a named admin account.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
}
