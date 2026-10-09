"""New careers: Data & Artificial Intelligence (batch 2).

Business Intelligence Engineering, Machine Learning Engineering, MLOps
Engineering and Analytics Engineering. `category` and `related_slugs` are
added by the catalogue owner, so they are not set here.
"""

CAREERS = [
    dict(
        slug="business-intelligence-engineering", name="Business Intelligence Engineering",
        summary="Build and look after the governed reporting layer a company runs on: dimensional models, shared KPI definitions, Power BI or Tableau semantic models, row level security and refresh schedules people can trust.",
        beginner_summary="You'll learn to design the tables behind a report, define metrics once so everyone gets the same number, and keep reports fast, secure and up to date.",
        difficulty=3, avg_timeline_weeks=28,
        entry_roles=["Junior BI Developer", "BI Analyst", "Reporting Analyst", "Power BI Developer (junior)"],
        tools=["Power BI", "DAX", "Power Query", "Tableau", "SQL", "PostgreSQL", "DAX Studio", "Tabular Editor"],
        remote_potential=75,
        earning_notes="Hiring is spread across finance, retail, healthcare, logistics and the public sector, because every large organisation needs reporting it can rely on. Most people start as a reporting or BI analyst and move into BI development as they take ownership of data models and refreshes. Depth in one platform (Power BI is the most common in job adverts) and a certification such as PL-300 help in Microsoft shops; pay moves with how much of the model, security and governance you own, not with how nice your charts look.",
        icon="layout-dashboard",
        skills_required=[
            "Dimensional modelling: choosing the grain, building facts and dimensions, handling slowly changing dimensions",
            "Writing DAX measures or Tableau calculations that respect filter context",
            "Defining KPIs precisely, with an owner, a formula and known exceptions",
            "Row level security design and testing",
            "Refresh design, performance tuning and report usage monitoring",
            "Data quality checking that catches bad numbers before users see them",
        ],
        certifications=[
            "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
            "Tableau Certified Data Analyst",
            "Microsoft Certified: Fabric Analytics Engineer Associate (DP-600, longer-term goal)",
        ],
        interview_prep=[
            "What is the grain of a fact table, and what goes wrong when a table mixes two grains",
            "Explain filter context in DAX and why the same measure can show different numbers in two visuals",
            "Two executives show you dashboards with different revenue totals for last month. How do you find out why, and what do you change so it cannot happen again",
            "A report that loaded in three seconds last month now takes forty. Walk through how you find the cause",
            "How would you design row level security so regional managers see only their own region, and how would you prove it works",
            "When would you use a Type 2 slowly changing dimension, and what does it cost you in the model",
        ],
        learning_resources=[
            {"label": "Microsoft Learn: Power BI Data Analyst (PL-300) learning path", "note": "Free, official modules covering data prep, modelling, DAX, security and the service, aligned to the exam."},
            {"label": "The Data Warehouse Toolkit by Ralph Kimball and Margy Ross", "note": "The standard book on dimensional modelling, including slowly changing dimensions and conformed dimensions."},
            {"label": "SQLBI articles and DAX Patterns", "note": "Free, in-depth writing on DAX, filter context and model performance from the authors of The Definitive Guide to DAX."},
        ],
        roadmap_outline={
            "beginner": [
                "Learn SQL joins, aggregation and window functions until you can reproduce any report number from its source tables",
                "Learn star schema ideas: facts, dimensions, grain and surrogate keys, using a retail rentals or sales example",
                "Build a first report in Power BI Desktop (or Tableau Public) on top of a clean star schema",
                "Learn Power Query basics for shaping, merging and appending source data",
            ],
            "intermediate": [
                "Write DAX measures properly: filter context, CALCULATE, time intelligence, and measures versus calculated columns",
                "Model slowly changing dimensions (Type 1 and Type 2) and a shared date dimension",
                "Write a KPI definition document with an owner, formula, grain and known exceptions for each metric",
                "Add row level security with roles and test every role using View as",
                "Prepare for PL-300 using Microsoft's learning path and free practice assessment",
            ],
            "advanced": [
                "Configure incremental refresh and a refresh schedule, then deliberately break a refresh and recover it",
                "Measure report speed with Performance Analyzer and DAX Studio, and fix the slowest visual",
                "Add data quality checks that run before refresh and a view of who opens which reports",
                "Learn how workspaces and deployment pipelines keep development separate from production",
                "Document one governed semantic model end to end for your portfolio",
            ],
        },
    ),
    dict(
        slug="machine-learning-engineering", name="Machine Learning Engineering",
        summary="Train, evaluate and serve machine learning models: build features, choose honest validation and metrics, find where a model fails, and package it behind an API other software can call.",
        beginner_summary="You'll learn to train models on real tables of data, test them without fooling yourself, and turn a working model into a service.",
        difficulty=5, avg_timeline_weeks=52,
        entry_roles=["Junior Machine Learning Engineer", "Associate ML Engineer", "Software Engineer (ML team)", "Junior Data Scientist"],
        tools=["Python", "scikit-learn", "XGBoost", "LightGBM", "PyTorch", "FastAPI", "pandas", "Jupyter"],
        remote_potential=75,
        earning_notes="Competitive at entry level. Many teams hire ML engineers from software engineering, or from data science roles with strong coding, and a master's degree or a research record helps even where it is not required. Pay moves with how much production machine learning you have actually owned, so a small model that you trained, validated and served end to end counts for more than a stack of course certificates.",
        icon="brain",
        skills_required=[
            "Python and pandas fluency, including writing code other people can run",
            "Validation design: baselines, split strategy and spotting data leakage",
            "Choosing metrics and thresholds that match the cost of different errors",
            "Training and tuning gradient boosted trees and neural networks",
            "Error analysis: finding which cases a model gets wrong and why",
            "Packaging a model and serving it through an API, in batch or online",
        ],
        certifications=[
            "AWS Certified Machine Learning Engineer - Associate",
            "Google Cloud Professional Machine Learning Engineer (longer-term goal)",
        ],
        interview_prep=[
            "Your model scores 0.97 AUC in validation but performs badly in production. What do you check first",
            "Explain data leakage and give two ways it can sneak into a feature pipeline",
            "Why might gradient boosted trees beat a neural network on a tabular dataset",
            "Fraud is 0.2 percent of transactions and your classifier is 99.8 percent accurate. What do you report instead, and how do you choose a threshold",
            "A product team wants a prediction within 100 milliseconds on every page load. How do you decide between online and batch inference",
            "Walk through how you would split data for a model that predicts which customers will cancel next month",
        ],
        learning_resources=[
            {"label": "scikit-learn user guide", "note": "Free, official guide with clear sections on model evaluation, pipelines and cross-validation."},
            {"label": "fast.ai Practical Deep Learning for Coders", "note": "Free, code-first course that gets you training real neural networks early."},
            {"label": "Designing Machine Learning Systems by Chip Huyen", "note": "A practical book on data, training, deployment and failure modes in real ML systems."},
        ],
        roadmap_outline={
            "beginner": [
                "Get fluent in Python, NumPy and pandas, then learn the linear algebra, probability and calculus needed to read a loss function",
                "Learn the supervised learning loop in scikit-learn: split, fit, predict, score, always against a dummy baseline",
                "Learn Pipeline and ColumnTransformer so preprocessing is only ever fitted on training data",
                "Finish one tabular prediction problem and write down what your first model got wrong",
            ],
            "intermediate": [
                "Learn validation strategy: stratified, grouped and time-based splits, and how leakage inflates scores",
                "Pick metrics that match the cost of errors (precision, recall, PR-AUC, calibration, MAE) and choose a threshold",
                "Train gradient boosted trees with XGBoost or LightGBM using early stopping and sensible tuning",
                "Do systematic error analysis: slice errors by segment, read the worst predictions, decide what to fix next",
                "Enter a tabular Kaggle competition and study the top public notebooks afterwards",
            ],
            "advanced": [
                "Learn PyTorch: tensors, autograd, Dataset and DataLoader, and a training loop with validation and early stopping",
                "Learn where deep learning clearly wins (images, text, audio) and where boosted trees usually still do (tabular data)",
                "Package a model with its preprocessing and serve it from a FastAPI endpoint with input validation and tests",
                "Compare batch and online inference for one problem, including latency and freshness trade-offs",
                "Practise simple ML system design on a whiteboard: data, features, training, serving, evaluation and failure modes",
            ],
        },
    ),
    dict(
        slug="mlops-engineering", name="MLOps Engineering",
        summary="Build the machinery that ships and runs models reliably: versioned data and experiments, automated training pipelines, containerised serving, and monitoring that shows when a model has gone stale.",
        beginner_summary="You'll learn to make machine learning work repeatable: track every experiment, automate retraining, package models in containers and watch them once they are live.",
        difficulty=4, avg_timeline_weeks=44,
        entry_roles=["Junior DevOps Engineer", "Junior Machine Learning Engineer", "Junior Data Engineer", "Junior MLOps Engineer (uncommon as a first role)"],
        tools=["MLflow", "DVC", "Docker", "GitHub Actions", "Prefect", "Airflow", "BentoML", "Evidently"],
        remote_potential=80,
        earning_notes="This is usually a second step rather than a first job. Most people arrive from DevOps, backend, data engineering or ML engineering, and dedicated MLOps titles are mostly found at companies already running models in production. Pay tends to follow the engineering side of the market, and it rises as you take ownership of pipelines, serving and incident response. A working, monitored pipeline in your portfolio matters more than any certificate.",
        icon="workflow",
        skills_required=[
            "Reproducibility: versioning data, code, parameters and models together",
            "Experiment tracking and model registry practice",
            "Building and scheduling training pipelines with retries and validation steps",
            "CI/CD for machine learning code, including quality gates on model metrics",
            "Containerising and serving models, and measuring their latency and resource use",
            "Monitoring for data drift and degraded predictions, and responding to it",
        ],
        certifications=[
            "AWS Certified Machine Learning Engineer - Associate",
            "Google Cloud Professional Machine Learning Engineer (longer-term goal)",
            "Databricks Certified Machine Learning Associate",
        ],
        interview_prep=[
            "Accuracy on live traffic has dropped over three weeks, but the serving service shows no errors. What do you look at, and in what order",
            "A data scientist says they cannot reproduce last month's model. What should have been recorded, and how do you make that routine",
            "What is the difference between data drift, concept drift and a broken upstream feature",
            "How would you decide whether a retrained model is allowed to replace the one in production",
            "Explain training-serving skew and how shared code or a feature store reduces it",
            "A retraining job that ran fine for months fails at 2am and the on-call engineer does not know ML. What should your pipeline and runbook have given them",
        ],
        learning_resources=[
            {"label": "MLflow official documentation", "note": "Free, official guides for experiment tracking, the model registry and model packaging."},
            {"label": "DVC documentation", "note": "Free, official guides to versioning data and building reproducible pipelines alongside Git."},
            {"label": "Made With ML by Goku Mohandas", "note": "Free course that takes a machine learning project through testing, tracking, orchestration and serving."},
        ],
        roadmap_outline={
            "beginner": [
                "Get comfortable with Python packaging, virtual environments, the Linux command line and Git before touching ML tooling",
                "Train one scikit-learn model yourself so a training run, a metric and a model artifact mean something concrete",
                "Learn Docker properly: write a Dockerfile, build an image, run a container with ports and volumes",
                "Version a dataset and a training pipeline with DVC and log runs with MLflow tracking",
            ],
            "intermediate": [
                "Write a GitHub Actions workflow that tests ML code and runs a small training smoke test on every pull request",
                "Orchestrate a retraining flow with Prefect or Airflow, including data validation, retries and failure alerts",
                "Use the MLflow model registry with aliases and a promotion rule based on comparing metrics",
                "Serve a registered model from a container with BentoML or FastAPI and test it with real requests",
            ],
            "advanced": [
                "Add monitoring: log predictions, compare live data with a reference set in Evidently and set alert thresholds",
                "Run a model on a local Kubernetes cluster (kind or minikube) and learn what KServe adds on top",
                "Measure cost: image size, memory, request latency, and when a GPU is worth paying for",
                "Practise rollback, shadow and canary rollout of a new model version",
                "Write a runbook for a drifted model and document the whole pipeline for your portfolio",
            ],
        },
    ),
    dict(
        slug="analytics-engineering", name="Analytics Engineering",
        summary="Own the SQL transformation layer in the warehouse: turn raw loaded tables into tested, documented, version-controlled models and metrics that analysts and dashboards can rely on.",
        beginner_summary="You'll learn to write SQL like software: in a Git repository, with tests, documentation and a clear structure, so everyone reports from the same clean tables.",
        difficulty=3, avg_timeline_weeks=26,
        entry_roles=["Junior Analytics Engineer", "Associate Analytics Engineer", "BI Developer", "Data Modeller (junior)"],
        tools=["dbt", "SQL", "DuckDB", "PostgreSQL", "Git/GitHub", "GitHub Actions", "Jinja", "SQLFluff"],
        remote_potential=85,
        earning_notes="The role grew up inside companies with a cloud warehouse and a small data team, so postings are concentrated there and the title is less common in older or smaller organisations. Many people move in from data analysis or BI development after taking ownership of the SQL behind their reports. Pay moves with how much of the modelling layer and the metric definitions you own, and the dbt Analytics Engineering Certification helps show you know the tool, but a public dbt project helps more.",
        icon="layers",
        skills_required=[
            "Advanced SQL: CTEs, window functions, deduplication and readable modular queries",
            "Layered data modelling: staging, intermediate and mart models",
            "Testing and documenting data models, and reading failures as bugs",
            "Incremental loading and snapshots for data that arrives late or changes",
            "Defining metrics once in a semantic layer",
            "Git, code review and CI applied to analytics code",
        ],
        certifications=["dbt Analytics Engineering Certification"],
        interview_prep=[
            "A dashboard number changed overnight and nobody touched the dashboard. How do you trace it back through the models",
            "Your incremental model has duplicate rows after a late arriving update. What went wrong and how do you fix it",
            "What is the difference between view, table, incremental and ephemeral materialisations, and how do you choose",
            "Where does business logic belong: staging, intermediate or marts, and why",
            "How do dbt tests actually run, and what can they not catch",
            "Explain what a snapshot does and when you would use one instead of an incremental model",
        ],
        learning_resources=[
            {"label": "dbt Learn: dbt Fundamentals", "note": "Free, official course that takes you from sources and models to tests, docs and deployment."},
            {"label": "dbt Developer Hub: How we structure our dbt projects", "note": "Free, official guide to staging, intermediate and mart layers and naming conventions."},
            {"label": "DuckDB documentation", "note": "Free, official docs for the in-process analytical database used to practise warehouse SQL on a laptop."},
        ],
        roadmap_outline={
            "beginner": [
                "Get strong at SQL: joins, CTEs, window functions and reading a query plan",
                "Learn Git properly: branches, pull requests, resolving conflicts and reviewing someone else's SQL",
                "Understand ELT: why raw data is loaded first and transformed inside the warehouse, and how a columnar warehouse differs from an application database",
                "Install dbt Core with DuckDB and build your first source, staging model and mart",
            ],
            "intermediate": [
                "Adopt a layered project structure: staging, intermediate and mart models with consistent naming",
                "Add generic and singular tests, and treat each failure as a bug in the data or the model",
                "Write descriptions, generate the docs site and read the lineage graph",
                "Build incremental models and snapshots, and learn what each costs and where each breaks",
                "Use Jinja macros and packages such as dbt_utils to remove repeated SQL",
            ],
            "advanced": [
                "Define metrics in the dbt semantic layer (MetricFlow) so revenue means one thing everywhere",
                "Add model contracts, source freshness checks and a CI job that builds every pull request",
                "Practise modelling decisions: grain, surrogate keys, slowly changing data and conformed dimensions",
                "Learn the basics of warehouse cost and performance: materialisation choices, partitioning and clustering",
                "Prepare for the dbt Analytics Engineering Certification using dbt's own study guide and practice questions",
            ],
        },
    ),
]


META = {
    "business-intelligence-engineering": dict(
        keywords=[
            "business intelligence", "bi developer", "bi engineer", "power bi", "power bi developer", "tableau", "tableau developer",
            "dax", "power query", "semantic model", "star schema", "dimensional modelling", "dimensional modeling", "kpi",
            "row level security", "rls", "incremental refresh", "data model", "reporting", "dashboards", "pl-300", "ssas",
        ],
        who_its_for="People who like order, clear definitions and being the person whose numbers are trusted. You will spend as much time on data models and on agreeing what 'revenue' means as on charts. The catch is that much of the work is platform specific, usually Power BI in Microsoft-heavy organisations, and it is less visual than the job title suggests.",
        portfolio_expectations=[
            "A star schema in a real database with a documented grain, a date dimension and a Type 2 dimension",
            "A Power BI or Tableau semantic model with DAX or calculated measures and a written KPI definition for each",
            "Row level security roles with a short test log showing what each role can and cannot see",
            "A model run in service conditions: incremental refresh, data quality checks and a performance before and after",
        ],
        career_progression=["Junior BI Developer", "BI Developer", "Senior BI Developer or BI Engineer", "BI Lead, Analytics Platform Lead or Data Architect"],
    ),
    "machine-learning-engineering": dict(
        keywords=[
            "machine learning engineer", "ml engineer", "mle", "applied machine learning", "applied ml", "scikit-learn", "sklearn",
            "xgboost", "lightgbm", "gradient boosting", "pytorch", "deep learning", "feature engineering", "model training",
            "model deployment", "model serving", "fastapi", "supervised learning", "kaggle", "data leakage",
        ],
        who_its_for="People who are comfortable with code and with maths, and who enjoy the slow work of working out why a model fails. The maths and the competition are real: most entry-level openings attract many applicants, and a software engineering or strong statistics background helps a great deal.",
        portfolio_expectations=[
            "A tabular project with a dummy baseline, leakage-safe validation and a written error analysis",
            "A gradient boosting model with tuning notes and a threshold chosen from stated error costs",
            "A PyTorch model compared honestly against a simpler model on the same data",
            "A FastAPI service with tests, a batch scoring script and a short model card",
        ],
        career_progression=["Junior Machine Learning Engineer", "Machine Learning Engineer", "Senior Machine Learning Engineer", "Staff ML Engineer, Applied Scientist or ML Team Lead"],
    ),
    "mlops-engineering": dict(
        keywords=[
            "mlops", "mlops engineer", "machine learning operations", "ml platform", "ml platform engineer", "mlflow", "dvc",
            "model registry", "experiment tracking", "model monitoring", "drift detection", "data drift", "bentoml", "kserve",
            "kubeflow", "evidently", "ml pipelines", "ci/cd for ml", "model deployment",
        ],
        who_its_for="Engineers who like making things repeatable, observable and boring, and who can work beside the people who build the models. It is usually a step after DevOps, backend, data engineering or ML engineering experience rather than a first role. The catch is that you must be competent in two fields, and the tooling changes quickly.",
        portfolio_expectations=[
            "A repository where code, data and parameters are versioned so a past model can be rebuilt exactly",
            "A scheduled retraining pipeline with validation, a metric gate and a model registry promotion rule",
            "A containerised model service with measured latency, image size and resource limits",
            "A drift monitoring report and a runbook that says what to do when it fires",
        ],
        career_progression=["Junior DevOps, Data or ML Engineer", "MLOps Engineer", "Senior MLOps or ML Platform Engineer", "Staff ML Platform Engineer or Head of ML Infrastructure"],
    ),
    "analytics-engineering": dict(
        keywords=[
            "analytics engineer", "analytics engineering", "dbt", "dbt core", "dbt cloud", "elt", "data transformation",
            "data modelling", "data modeling", "data marts", "semantic layer", "metrics layer", "metricflow", "duckdb",
            "snapshots", "data contracts", "data warehouse", "sql", "jinja",
        ],
        who_its_for="People who enjoy SQL and want to treat it like software: reviewed, tested and documented. Often a natural next step for analysts and BI developers who find themselves fixing the same messy tables again and again. The catch is that the role sits between data engineers and analysts, so you need patience for both sides.",
        portfolio_expectations=[
            "A public dbt project with staging, intermediate and mart layers, tests and a generated docs site",
            "An incremental model and a snapshot with a written explanation of how late arriving data is handled",
            "A metrics layer defining three business metrics, with a query proving they match the marts",
            "A pull request history showing CI running dbt build and a reviewed change",
        ],
        career_progression=["Junior Analytics Engineer", "Analytics Engineer", "Senior Analytics Engineer", "Staff Analytics Engineer, Analytics Engineering Lead or Head of Data"],
    ),
}


PROJECTS = {
    # ------------------------------------------------------------------ BI
    "business-intelligence-engineering": {
        "skills": [
            {"key": "sql_for_reporting", "label": "SQL for Reporting", "category": "foundation"},
            {"key": "dimensional_modelling", "label": "Dimensional Modelling", "category": "foundation"},
            {"key": "semantic_modelling_dax", "label": "Semantic Modelling and DAX", "category": "core"},
            {"key": "kpi_governance_security", "label": "KPI Governance and Row Level Security", "category": "core"},
            {"key": "refresh_performance_monitoring", "label": "Refresh, Performance and Monitoring", "category": "advanced"},
        ],
        "skill_edges": [
            ("sql_for_reporting", "dimensional_modelling"),
            ("dimensional_modelling", "semantic_modelling_dax"),
            ("semantic_modelling_dax", "kpi_governance_security"),
            ("kpi_governance_security", "refresh_performance_monitoring"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to turn a normalised transactional database into a star schema with a stated grain, a date dimension and a Type 2 dimension, and to prove the numbers reconcile with the source.",
                "skill_key": "dimensional_modelling",
                "projects": [
                    {
                        "title": "Design a DVD rental star schema in PostgreSQL with a date dimension and a Type 2 customer dimension",
                        "teaches": "choosing a fact table grain, building dimensions with surrogate keys, tracking history with a Type 2 slowly changing dimension, and reconciling a model to its source",
                        "prerequisites": ["SQL joins and GROUP BY", "PostgreSQL installed locally (or Docker)", "A SQL client such as psql, DBeaver or pgAdmin"],
                        "expected_output": "A PostgreSQL schema with fact_rental, dim_date, dim_film, dim_store and a Type 2 dim_customer, built by a re-runnable SQL script, plus a short reconciliation report showing that revenue and row counts match the source tables.",
                        "steps": [
                            "Install PostgreSQL and load the Pagila sample database (the PostgreSQL port of Sakila) by running its schema and data SQL files with psql.",
                            "Write down the grain of the fact table in one sentence, for example 'one row per rental', and list the questions the model must answer (revenue by film category by month, rentals by store).",
                            "Create a star schema in a new schema called dw. Build dim_date with generate_series covering the full range of rental dates, with year, month, quarter, weekday and a weekend flag.",
                            "Build dim_film and dim_store by joining the normalised source tables (film, category, language, store, address, city), keeping a surrogate key and the source id on each.",
                            "Build dim_customer as Type 2: add valid_from, valid_to and is_current columns, and a surrogate key separate from the source customer_id.",
                            "Simulate a change: UPDATE a customer in the source so they move to another store, then write the SQL that closes the old dim_customer row and inserts a new current row.",
                            "Load fact_rental by looking up the surrogate key of each dimension, matching the customer row whose valid_from and valid_to bracket the rental date. Take the amount from the payment table.",
                            "Write reconciliation queries: fact row count against source rental count, SUM of amount against SUM of payment.amount, and a check for fact rows with no matching dimension row.",
                            "Save everything as numbered .sql files in a Git repository with a README describing the grain and each table.",
                        ],
                        "hints": [
                            "Some rentals have no payment, so decide deliberately whether the amount is zero or null and write the decision down.",
                            "Use a left join from the fact source to each dimension, then count nulls in the keys: any null key means a lookup failed.",
                            "Give the current row of a Type 2 dimension a valid_to far in the future (such as 9999-12-31) so date range joins stay simple.",
                        ],
                        "common_mistakes": [
                            "Starting to build tables before deciding the grain, which leads to a fact table that mixes rentals and payments.",
                            "Using the source customer_id as the dimension key, which makes a Type 2 history impossible.",
                            "Joining the fact to the current customer row only, so historic rentals are attributed to where the customer lives today.",
                            "Never reconciling to the source, so a dropped join quietly removes rows and nobody notices.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Put a Power BI semantic model on the star schema, write DAX measures with documented KPI definitions, and add row level security that you have tested for each role.",
                "skill_key": "semantic_modelling_dax",
                "projects": [
                    {
                        "title": "Build a governed Power BI semantic model with DAX KPIs and row level security",
                        "teaches": "relationships and filter direction, DAX measures and time intelligence, writing KPI definitions, and static and dynamic row level security",
                        "prerequisites": ["The star schema from the Foundations project", "Power BI Desktop (free, Windows only)", "Basic DAX syntax"],
                        "expected_output": "A Power BI model saved as a Power BI Project in Git, with a measures table, five documented KPIs, a marked date table and two security roles, plus a KPI definition file and a test log of what each role sees.",
                        "steps": [
                            "In Power BI Desktop, import dim_date, dim_film, dim_store, dim_customer and fact_rental from PostgreSQL (or from CSV exports of the same tables if the connector gives trouble).",
                            "Check the relationships in Model view: one to many from each dimension to the fact table, single direction, and no bi-directional filters.",
                            "Mark dim_date as the date table and hide surrogate keys and raw columns from report view so report authors only see sensible fields.",
                            "Create a dedicated _Measures table and write Total Revenue, Rental Count, Revenue per Rental, Active Customers (DISTINCTCOUNT) and Revenue Last Year (SAMEPERIODLASTYEAR) as DAX measures.",
                            "Write kpi_definitions.md: for each measure give the business name, formula in words, grain, owner, data source and known exceptions.",
                            "Build a one page report with a card row, a trend by month and a matrix by film category, and check each number against a direct SQL query.",
                            "Under Modeling, manage roles: create a role named Store 1 with a DAX filter on dim_store (for example [store_id] = 1) and a second role for Store 2.",
                            "Use View as with each role and with none, and record in a test log what totals each role sees and that the roles cannot see each other's rows.",
                            "Save the work as a Power BI Project (.pbip) so the model is stored as text files, and commit it to Git.",
                        ],
                        "hints": [
                            "Write measures, not calculated columns, for anything that must respond to filters; calculated columns grow the model and are fixed at refresh time.",
                            "Time intelligence only works when the date table is continuous and marked as a date table, so check the range of your data first.",
                            "Dynamic row level security uses a security table and USERPRINCIPALNAME(); try the static roles first and then move to dynamic.",
                            "The .pbip format may need to be switched on under File, Options, Preview features depending on your Desktop version.",
                        ],
                        "common_mistakes": [
                            "Leaving surrogate keys visible, so report authors drag them into visuals and sum them.",
                            "Using bi-directional relationships to get a slicer to work, which creates ambiguous filter paths and slow reports.",
                            "Testing security only as the report owner, who is not restricted by roles, instead of using View as.",
                            "Writing KPI definitions after the report is built, so the document describes what the DAX happens to do rather than what the business meant.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Run the model like a service: incremental refresh on a large fact table, data quality gates before each refresh, measured performance fixes, usage monitoring and a recovery runbook.",
                "skill_key": "refresh_performance_monitoring",
                "projects": [
                    {
                        "title": "Run a semantic model in production: incremental refresh, data quality gates, performance tuning and usage monitoring",
                        "teaches": "configuring incremental refresh, building data quality checks that run before refresh, finding and fixing slow visuals with measured evidence, and monitoring report usage",
                        "prerequisites": ["The governed Power BI model from the previous project", "A free cloud PostgreSQL database (for example Neon or Supabase)", "A Power BI Service account (a free trial of Microsoft Fabric or Power BI Pro may be needed to publish and schedule refresh)"],
                        "expected_output": "A published model with an incremental refresh policy and a scheduled refresh, a SQL data quality script with logged results, a before and after performance record for the slowest visual, and a runbook for a failed refresh.",
                        "steps": [
                            "Move the PostgreSQL star schema to a free cloud database so the Power BI Service can reach it without a gateway, and use generate_series to expand fact_rental to a few million synthetic rows with realistic dates.",
                            "In Power Query create two Date/Time parameters named RangeStart and RangeEnd, and filter the fact table's date column using them (greater than or equal to RangeStart, less than RangeEnd).",
                            "Right-click the fact table and choose Incremental refresh: archive three years, refresh the last seven days, and read the note about query folding so you know the filter reaches the database.",
                            "Publish to a workspace, set a scheduled refresh, run it twice, and confirm the second run is much faster than the first.",
                            "Write dq_checks.sql: row count against yesterday, null foreign keys, orphan dimension keys, duplicate fact keys and the maximum rental date compared with today. Write every result into a dq_results table with a timestamp, and run it before each refresh.",
                            "Break something on purpose, such as nulling a dimension key, and show that the data quality script flags it before users see wrong totals.",
                            "Open Performance Analyzer in Desktop, record the slowest visual, then capture its DAX query and study server timings in DAX Studio (free).",
                            "Fix the cause (for example remove a calculated column, reduce column cardinality, or rewrite a measure), re-measure, and run Tabular Editor 2's Best Practice Analyzer for further model advice.",
                            "Open the workspace usage metrics report if your licence allows it, otherwise write down which usage and refresh-history signals you would watch, and finish with a one page runbook for a failed refresh.",
                        ],
                        "hints": [
                            "Incremental refresh only helps if the date filter folds back to the database, so right-click the last step in Power Query and check that View Native Query is not greyed out.",
                            "Capture timings before you change anything, otherwise you cannot show the fix worked.",
                            "A DISTINCTCOUNT over a high-cardinality column is a common cause of slow visuals; check the cardinality of your columns in DAX Studio's VertiPaq Analyzer view.",
                        ],
                        "common_mistakes": [
                            "Setting up RangeStart and RangeEnd but filtering on a text or integer date column, so refresh partitions never apply.",
                            "Running data quality checks after refresh, when users may already have looked at the wrong numbers.",
                            "Tuning by guessing instead of measuring, so a change that feels faster adds nothing.",
                            "Granting broad workspace access during testing and never tightening it, which undoes the row level security you built.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    # ----------------------------------------------------------------- MLE
    "machine-learning-engineering": {
        "skills": [
            {"key": "ml_python_foundations", "label": "Python and Math for ML", "category": "foundation"},
            {"key": "validation_and_leakage", "label": "Validation, Baselines and Leakage", "category": "foundation"},
            {"key": "gradient_boosting_tabular", "label": "Gradient Boosting and Error Analysis", "category": "core"},
            {"key": "pytorch_deep_learning", "label": "Deep Learning with PyTorch", "category": "core"},
            {"key": "model_serving_inference", "label": "Model Packaging and Serving", "category": "advanced"},
        ],
        "skill_edges": [
            ("ml_python_foundations", "validation_and_leakage"),
            ("validation_and_leakage", "gradient_boosting_tabular"),
            ("gradient_boosting_tabular", "pytorch_deep_learning"),
            ("pytorch_deep_learning", "model_serving_inference"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn the habits that keep a model honest: beat a dummy baseline, split data in the way the model will really be used, keep preprocessing inside a pipeline, and see leakage inflate a score.",
                "skill_key": "validation_and_leakage",
                "projects": [
                    {
                        "title": "Beat a dummy baseline on bike rental demand with a leakage-safe scikit-learn pipeline",
                        "teaches": "baselines, scikit-learn pipelines, time-ordered validation and how leakage makes a model look better than it is",
                        "prerequisites": ["Python and pandas basics", "A virtual environment with scikit-learn, pandas and JupyterLab installed"],
                        "expected_output": "A Jupyter notebook that compares a dummy baseline, a Ridge pipeline and a gradient boosting model with time-ordered validation, demonstrates a leaking feature and its fix, and ends with one final test score and a half page of notes.",
                        "steps": [
                            "Load the data with sklearn.datasets.fetch_openml('Bike_Sharing_Demand', version=2, as_frame=True) and look at the columns, types and the target (count).",
                            "Note that rows are in time order, so hold out the last 20 percent of rows as a test set by position and do not look at it again until the end.",
                            "Fit a DummyRegressor that predicts the training mean and record its mean absolute error with TimeSeriesSplit on the training portion. Every later model must beat this number.",
                            "Build a ColumnTransformer with OneHotEncoder for the categorical columns and StandardScaler for the numeric ones, put it in a Pipeline with Ridge, and score it with TimeSeriesSplit.",
                            "Replace Ridge with HistGradientBoostingRegressor (using its native categorical support) and compare the scores in a small table.",
                            "Create a leak on purpose: add a feature holding the average demand for each hour computed over the whole dataset including the test rows, and show that validation error falls sharply.",
                            "Fix it by computing that average only inside each training fold, or remove the feature, and show the score returning to a realistic level.",
                            "Score the best pipeline on the held-out test set once, plot predicted against actual demand for one week, and note where it is worst.",
                            "Write a half page in the notebook: the baseline, the best model, what leaked and how you found it.",
                        ],
                        "hints": [
                            "A Pipeline refits every step on each training fold, which is exactly what stops preprocessing statistics leaking from validation data.",
                            "Report mean absolute error in the same units as the target (bikes per hour) so the number means something to a reader.",
                            "If a score looks too good, ask which feature could not have been known at prediction time.",
                        ],
                        "common_mistakes": [
                            "Using shuffled KFold on time ordered data, so the model trains on the future and is tested on the past.",
                            "Fitting a scaler or encoder on the whole dataset before splitting.",
                            "Tuning against the test set until it looks good, which turns it into a second validation set.",
                            "Reporting a model score without a baseline, so nobody knows whether it is any good.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Work on a heavily imbalanced problem with gradient boosting: pick a metric that fits, tune with early stopping, choose a threshold from stated costs, and study the cases the model misses.",
                "skill_key": "gradient_boosting_tabular",
                "projects": [
                    {
                        "title": "Train LightGBM and XGBoost on imbalanced credit card fraud data and choose a threshold from a cost table",
                        "teaches": "metrics for imbalanced classes, gradient boosting with early stopping, threshold selection from error costs, and structured error analysis",
                        "prerequisites": ["scikit-learn pipelines and validation", "pandas", "lightgbm and xgboost installed with pip"],
                        "expected_output": "A notebook and short report comparing logistic regression, LightGBM and XGBoost by PR-AUC on a time-ordered validation set, with a cost-based decision threshold, a calibration check and an error analysis of missed fraud cases.",
                        "steps": [
                            "Load the credit card fraud dataset from OpenML (data id 1597, named creditcard) or the Kaggle copy from ULB, and check the class balance. Fraud is roughly 0.17 percent of rows.",
                            "Sort by the Time column and split by position: the first 70 percent for training, the next 15 percent for validation and the last 15 percent for test.",
                            "Fit a LogisticRegression with class_weight='balanced' as your baseline and report average_precision and the precision recall curve, not accuracy.",
                            "Train an LGBMClassifier using the validation set for early stopping (lightgbm's early_stopping callback), and try scale_pos_weight to see whether it helps.",
                            "Train an XGBClassifier with eval_metric='aucpr' and early_stopping_rounds on the same validation set, and compare both boosted models with the baseline on one precision recall plot.",
                            "Tune a small set of parameters (learning_rate, num_leaves or max_depth, min_child_samples or min_child_weight) over about twenty combinations, always judged on validation only.",
                            "Write a cost table with explicit assumptions (for example a missed fraud costs the transaction Amount and a false alarm costs a fixed review cost), compute expected cost for thresholds from 0.01 to 0.99 on validation, and choose the cheapest.",
                            "Do error analysis on validation: list the missed frauds, slice recall by Amount band, and read the feature importances by gain to see what the model relies on.",
                            "Check calibration with CalibrationDisplay, then score the test set once at your chosen threshold and report precision, recall and cost.",
                        ],
                        "hints": [
                            "PR-AUC is far more informative than ROC-AUC when positives are this rare, because ROC-AUC can look excellent while precision is poor.",
                            "Early stopping must use a validation set that is not your test set, otherwise the test score is optimistic.",
                            "Class weights change the predicted probabilities, so a threshold chosen on a weighted model will not mean what you expect; recheck calibration.",
                        ],
                        "common_mistakes": [
                            "Reporting accuracy, which is 99.8 percent for a model that never flags anything.",
                            "Choosing the threshold on the test set, or leaving it at the default 0.5 without checking costs.",
                            "Using a random split on transactions that have a time order, so near-duplicate patterns appear on both sides.",
                            "Tuning for many rounds against a single validation set and then trusting its score as if it were new data.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Test whether a neural network really beats boosted trees on tabular data, then package the winner and serve it both online and in batch with latency numbers and a model card.",
                "skill_key": "model_serving_inference",
                "projects": [
                    {
                        "title": "Pit a PyTorch network against LightGBM on forest cover data, then serve the winner online and in batch",
                        "teaches": "writing a PyTorch training loop, comparing models fairly, packaging a model with its preprocessing, and the trade-offs between online and batch inference",
                        "prerequisites": ["Gradient boosting and validation from the previous project", "Basic PyTorch tensors", "A little FastAPI or Flask experience helps"],
                        "expected_output": "A repository with a comparison notebook, a model directory holding the winning model and its preprocessing, a FastAPI service with tests, a batch scoring script, a latency table and a MODEL_CARD.md.",
                        "steps": [
                            "Load the Forest Covertype data with sklearn.datasets.fetch_covtype (about 581,000 rows, 54 features, 7 classes), create a stratified train, validation and test split, and fix the random seed.",
                            "Train a LightGBM classifier as the reference and record accuracy, macro F1, training time and prediction time for 1,000 rows.",
                            "Build a PyTorch MLP: standardise the 10 numeric columns, pass the binary columns through unchanged, wrap the data in a Dataset and DataLoader (batch size around 1024), and train with AdamW and cross-entropy.",
                            "Evaluate on the validation set every epoch, stop early when it stops improving, and plot training and validation loss.",
                            "Compare the two models honestly on the same split: accuracy, macro F1, a confusion matrix, training time and prediction time. Write down which wins and a reason why.",
                            "Package the winner in a model/ folder with the weights, the scaler parameters or fitted preprocessing, and a version file.",
                            "Write a FastAPI app with a /predict endpoint using a Pydantic request model, a /health endpoint, and the model loaded once at startup. Add pytest tests with FastAPI's TestClient.",
                            "Write score_batch.py that reads a CSV in chunks and writes predictions, and compare its throughput on 100,000 rows with calling the API row by row.",
                            "Load test the API with Locust, record p50 and p95 latency for one-row and 32-row requests, and write MODEL_CARD.md covering data, metrics, limits and when to use batch rather than online.",
                        ],
                        "hints": [
                            "Gradient boosted trees often win on tabular data like this, so a neural network losing is a valid, useful result; report it plainly.",
                            "Call model.eval() and wrap prediction in torch.no_grad() when serving, and put the training and serving preprocessing in one shared function.",
                            "Accept a list of rows in /predict so one request can score many rows, which usually cuts per-row latency a lot.",
                            "A free Colab GPU is optional here; the MLP trains acceptably on a laptop CPU if you keep it small.",
                        ],
                        "common_mistakes": [
                            "Giving the network a stronger setup than the baseline, or the reverse, so the comparison measures effort rather than model type.",
                            "Forgetting model.eval(), so dropout or batch norm behaves differently at serving time and results vary between calls.",
                            "Writing preprocessing twice, once for training and once for the API, and letting the two drift apart.",
                            "Measuring latency with one warm request on your own laptop and calling it the service's speed.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    # -------------------------------------------------------------- MLOps
    "mlops-engineering": {
        "skills": [
            {"key": "ops_python_docker", "label": "Python Packaging, Git and Docker", "category": "foundation"},
            {"key": "experiment_data_versioning", "label": "Data Versioning and Experiment Tracking", "category": "foundation"},
            {"key": "pipeline_orchestration_ci", "label": "Pipelines, Orchestration and CI for ML", "category": "core"},
            {"key": "registry_and_serving", "label": "Model Registry and Containerised Serving", "category": "core"},
            {"key": "monitoring_drift_cost", "label": "Monitoring, Drift and Cost", "category": "advanced"},
        ],
        "skill_edges": [
            ("ops_python_docker", "experiment_data_versioning"),
            ("experiment_data_versioning", "pipeline_orchestration_ci"),
            ("pipeline_orchestration_ci", "registry_and_serving"),
            ("registry_and_serving", "monitoring_drift_cost"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Make a single training run reproducible: data tracked with DVC, parameters in a file, metrics logged to MLflow, and the ability to rebuild an old model from a Git commit.",
                "skill_key": "experiment_data_versioning",
                "projects": [
                    {
                        "title": "Make a model training run reproducible with Git, DVC and MLflow tracking",
                        "teaches": "versioning data alongside code with DVC, declaring a pipeline with parameters, and logging and comparing runs in MLflow",
                        "prerequisites": ["Python and a virtual environment", "Git basics", "A scikit-learn model trained at least once"],
                        "expected_output": "A Git repository with a DVC-tracked dataset, a dvc.yaml pipeline with prepare and train stages, a params.yaml file, at least four MLflow runs that can be compared, and a demonstrated rebuild of an older model from a past commit.",
                        "steps": [
                            "Create a repository, run git init and dvc init, then download the Adult income dataset with sklearn.datasets.fetch_openml('adult', version=2) and save it to data/raw/adult.csv.",
                            "Track the data with dvc add data/raw/adult.csv, commit the resulting .dvc file, and set a local DVC remote with dvc remote add -d storage ../dvc-store followed by dvc push.",
                            "Write prepare.py (clean and split into train and test CSVs) and train.py (fit a RandomForestClassifier or LogisticRegression, read hyperparameters from params.yaml, write metrics.json).",
                            "Describe both scripts as stages in dvc.yaml with deps, params, outs and metrics, then run dvc repro and confirm a second run skips unchanged stages.",
                            "Add MLflow tracking to train.py: mlflow.log_params, mlflow.log_metric and mlflow.sklearn.log_model, then start the interface with mlflow ui.",
                            "Change a parameter in params.yaml, run dvc repro again, and use dvc params diff and dvc metrics diff to see exactly what changed; do this for at least four settings.",
                            "Compare the runs side by side in the MLflow UI and pick the best one, noting the run id in your README.",
                            "Prove reproducibility: delete the data and outputs, check out an older Git commit, run dvc pull and dvc repro, and show you get the same metrics as that run recorded.",
                        ],
                        "hints": [
                            "Git tracks the small .dvc and dvc.yaml files while DVC stores the large files in the remote, so always commit and push both.",
                            "Set random seeds in the split and the model, otherwise two runs with the same parameters will not match.",
                            "Keep every tunable value in params.yaml, never hard coded in train.py, or DVC cannot see that it changed.",
                        ],
                        "common_mistakes": [
                            "Committing the dataset directly to Git and bloating the repository.",
                            "Forgetting dvc push, so the data exists only on your laptop and the project cannot be rebuilt elsewhere.",
                            "Logging metrics to MLflow without logging the parameters and the Git commit, so a run cannot be traced back to code.",
                            "Letting MLflow write into a different folder each time you start it, so runs seem to disappear.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Turn training into a scheduled, validated pipeline with a metric gate: orchestrate with Prefect, register models in MLflow with aliases, and run a CI check on every pull request.",
                "skill_key": "pipeline_orchestration_ci",
                "projects": [
                    {
                        "title": "Build a Prefect retraining pipeline with a metric gate, an MLflow registry alias and a GitHub Actions check",
                        "teaches": "orchestrating ingest, validate, train, evaluate and register steps, promoting a model only when it beats the current one, and gating pull requests with CI",
                        "prerequisites": ["The reproducible training repository from the Foundations project", "Basic GitHub Actions syntax", "pip install prefect mlflow pytest"],
                        "expected_output": "A Prefect flow with validation, retries and a failure hook that registers a new model version in MLflow and moves a 'champion' alias only when the metric improves, with pytest tests and a GitHub Actions workflow that fails on a degraded model.",
                        "steps": [
                            "Start MLflow with a registry-capable backend: mlflow server --backend-store-uri sqlite:///mlflow.db --default-artifact-root ./mlartifacts.",
                            "Create pipeline.py with a Prefect @flow and @task functions for ingest, validate, train, evaluate and register, reusing code from the previous project.",
                            "Write the validate task so it fails the flow when columns are missing, the row count drops sharply or a null rate jumps, and prove it works by corrupting a copy of the data.",
                            "Log the trained model with mlflow.sklearn.log_model(registered_model_name='income-model') so each run creates a new model version.",
                            "Implement the promotion rule: use MlflowClient to read the version that has the 'champion' alias, compare its recorded metric with the new one, and call set_registered_model_alias only if the new model is better by a stated margin.",
                            "Add retries to the training task, and an on_failure state hook that writes an alert to a file or posts to a webhook you control.",
                            "Serve the flow with flow.serve(name='nightly-retrain', cron='0 3 * * *') and trigger a manual run from the Prefect UI to watch the task graph.",
                            "Write pytest tests for the validate task and the promotion rule using a tiny fixture dataset.",
                            "Add .github/workflows/ml-ci.yml to run pytest and a smoke run of the flow on 500 rows for every pull request, failing if the metric falls below a floor. Then open a pull request that degrades the model and show the red check.",
                        ],
                        "hints": [
                            "Model registry aliases are the current way to mark a version as live; the older stage names are deprecated in recent MLflow versions.",
                            "Keep the smoke test tiny and seeded so CI runs in a minute or two and is not flaky.",
                            "Write the promotion rule as a plain function that takes two numbers, so it is trivially testable without MLflow running.",
                        ],
                        "common_mistakes": [
                            "Promoting a model every run regardless of its metric, so the live model can silently get worse.",
                            "Comparing metrics from different test sets, which makes the gate meaningless.",
                            "Running full training in CI, which is slow and expensive and gets switched off by the team.",
                            "Writing a pipeline that has no failure path, so a bad input produces a registered model instead of an alert.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Ship the registered model as a container with measured resource use, log its live predictions, detect drift against a reference set, and write the runbook an on-call engineer would need.",
                "skill_key": "monitoring_drift_cost",
                "projects": [
                    {
                        "title": "Containerise a registry model with BentoML and detect drift in its live traffic with Evidently",
                        "teaches": "packaging a registered model as a container image, measuring serving cost and latency, logging predictions, and detecting drift with a scheduled check",
                        "prerequisites": ["The MLflow registry and champion alias from the previous project", "Docker installed", "Basic HTTP testing with curl"],
                        "expected_output": "A built container image serving the champion model, a table of image size, latency and resource limits, a prediction log, an Evidently drift report on shifted data, a drift check script with an exit code, and a written runbook with a rollback step.",
                        "steps": [
                            "Load the model behind the champion alias (models:/income-model@champion) and save it with BentoML, then write a service with one predict endpoint; follow the BentoML quickstart for your installed version because the service API changed in 1.2.",
                            "Run bentoml serve locally and test it with curl, including a malformed request to check that validation errors are clear.",
                            "Build with bentoml build, then bentoml containerize, and start the image with docker run, limiting it using --cpus=1 and --memory=512m.",
                            "Record the image size from docker images and p50 and p95 latency at 10 and 50 concurrent users with a load tool such as hey or Locust. Write a short cost note estimating how many replicas a given request rate needs, and say why this model does not need a GPU.",
                            "Make the service append every request's features and prediction, with a timestamp, to a JSON lines file.",
                            "Create a reference set from the training data and a 'production' set from held-out rows, then shift one feature (for example add 15 to age) to simulate drift.",
                            "Generate an Evidently data drift report comparing production with reference and save it as HTML; check the Evidently docs for your version because its API changed between 0.4 and 0.7.",
                            "Write drift_check.py that reads the prediction log, runs the report and exits with code 1 if the share of drifted columns is above 0.3, then schedule it with a GitHub Actions cron workflow or your Prefect deployment.",
                            "Write RUNBOOK.md: how to read the alert, how to tell drift from an upstream data fault, how to roll back by moving the champion alias to the previous version and redeploying, and when to trigger retraining.",
                        ],
                        "hints": [
                            "Drift is a warning that inputs have changed, not proof that predictions are wrong; true accuracy needs labels, which often arrive weeks later.",
                            "Pin library versions in the image; a model pickled with one scikit-learn version can fail to load in another.",
                            "A slim Python base image keeps the container small and the build fast, so measure size before and after you switch.",
                        ],
                        "common_mistakes": [
                            "Building the image on a laptop with different library versions from those the model was trained with.",
                            "Setting the drift threshold so low that the alert fires constantly and everyone ignores it.",
                            "Logging predictions without a timestamp or model version, so the data cannot be tied back to a deployment.",
                            "Writing a rollback step that was never actually tried.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    # ------------------------------------------------- Analytics Engineering
    "analytics-engineering": {
        "skills": [
            {"key": "sql_git_foundations", "label": "SQL and Git for Analytics Code", "category": "foundation"},
            {"key": "dbt_modelling_layers", "label": "dbt Modelling Layers", "category": "foundation"},
            {"key": "testing_and_documentation", "label": "Testing and Documentation", "category": "core"},
            {"key": "incremental_and_snapshots", "label": "Incremental Models and Snapshots", "category": "core"},
            {"key": "metrics_contracts_ci", "label": "Metrics Layer, Contracts and CI", "category": "advanced"},
        ],
        "skill_edges": [
            ("sql_git_foundations", "dbt_modelling_layers"),
            ("dbt_modelling_layers", "testing_and_documentation"),
            ("testing_and_documentation", "incremental_and_snapshots"),
            ("incremental_and_snapshots", "metrics_contracts_ci"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Build your first dbt project on DuckDB: declare raw sources, clean them in staging models, join them into marts, and cover the keys with tests and generated documentation.",
                "skill_key": "dbt_modelling_layers",
                "projects": [
                    {
                        "title": "Build a tested staging and mart layer in dbt on DuckDB from the raw TPC-H tables",
                        "teaches": "declaring sources, writing staging and mart models, adding tests and generating documentation and lineage with dbt Core",
                        "prerequisites": ["SQL joins, CTEs and aggregation", "Python 3 with pip", "Git basics"],
                        "expected_output": "A Git repository with a dbt project containing sources, staging models, a fct_orders and a dim_customers mart, unique, not null, relationships and accepted values tests, and a generated docs site showing the lineage graph.",
                        "steps": [
                            "Create a virtual environment and run pip install dbt-duckdb, then dbt init to scaffold a project and configure profiles.yml with type duckdb and a path such as tpch.duckdb. Check it with dbt debug.",
                            "In DuckDB, run INSTALL tpch; LOAD tpch; CALL dbgen(sf=0.1); then CREATE SCHEMA raw and copy customer, orders, lineitem and nation into it with CREATE TABLE raw.customer AS SELECT * FROM customer, and so on.",
                            "Declare the four tables in models/staging/_sources.yml, pointing at the raw schema.",
                            "Write one staging model per table (stg_customers, stg_orders, stg_lineitems, stg_nations) that renames cryptic columns like c_custkey to customer_id, casts types and does nothing else. Materialise them as views.",
                            "Write int_order_revenue that calculates line revenue as l_extendedprice * (1 - l_discount) and sums it per order.",
                            "Write marts fct_orders (one row per order with revenue, status and date) and dim_customers (with nation name and market segment), materialised as tables.",
                            "Add tests in YAML: unique and not_null on each primary key, relationships from orders to customers, and accepted_values on order status. Run dbt build and read any failures.",
                            "Add descriptions to the mart columns, run dbt docs generate and dbt docs serve, and screenshot the lineage graph from raw sources to marts.",
                            "Commit to Git with a .gitignore that excludes target/, logs/ and the .duckdb file, and write a README explaining the layers.",
                        ],
                        "hints": [
                            "Keep staging models boring: rename, cast and filter only. Joins and business logic belong in the layers above.",
                            "Use {{ source() }} and {{ ref() }} instead of hard coded table names, because dbt builds the dependency graph from them.",
                            "Use dbt build instead of separate run and test commands, so a failing test stops downstream models.",
                        ],
                        "common_mistakes": [
                            "Putting joins and calculations into staging models, which makes them impossible to reuse.",
                            "Hard coding schema and table names in SQL so dbt cannot see the dependencies.",
                            "Only testing primary keys on the marts and never on the staging models where bad data first shows up.",
                            "Committing the DuckDB file and target folder to Git.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Handle data that arrives late and changes over time: build an incremental fact model that picks up updated rows and a snapshot that keeps customer history, then test that both behave.",
                "skill_key": "incremental_and_snapshots",
                "projects": [
                    {
                        "title": "Handle late arriving orders and changing customer segments with an incremental model and a snapshot in dbt",
                        "teaches": "incremental materialisation with a unique key, detecting late updates, tracking history with snapshots, and testing that incremental logic does not duplicate rows",
                        "prerequisites": ["The dbt project from the Foundations project", "Understanding of how dbt materialisations differ"],
                        "expected_output": "An incremental fct_orders model that gains new and updated rows without duplicates, a customer snapshot that records segment changes with valid_from and valid_to dates, a loader script that simulates daily arrivals, and tests proving both work.",
                        "steps": [
                            "Split the raw orders: keep orders before 1997-01-01 in raw.orders with an added _loaded_at timestamp column, and move the rest to raw.orders_pending.",
                            "Write load_next_month.sql that moves one month of rows from orders_pending into orders with _loaded_at set to now, and also changes o_orderstatus on a few older orders and refreshes their _loaded_at, to simulate late updates.",
                            "Convert the orders mart to materialized='incremental' with unique_key='order_id' and incremental_strategy='delete+insert', using {% if is_incremental() %} to filter on _loaded_at greater than the maximum already in {{ this }}.",
                            "Run dbt build, run load_next_month.sql, run dbt build again, and check that the row count rose by the new month only and that the changed orders show their new status.",
                            "Add a singular test in tests/ that fails when any order_id appears more than once, and run dbt build --full-refresh to confirm a full rebuild gives identical results.",
                            "Add a snapshot of raw.customer with unique_key c_custkey and the check strategy on c_mktsegment and c_acctbal (dbt 1.9 and later define snapshots in YAML; earlier versions use a {% snapshot %} block). Run dbt snapshot.",
                            "Write change_segments.sql to alter the market segment of 20 customers, run dbt snapshot again, and query the snapshot table to see the old rows closed with dbt_valid_to and the new rows open.",
                            "Build dim_customers_history from the snapshot and write a query that attributes each order to the segment the customer had on the order date.",
                            "Write a short note on when you would use an incremental model, a snapshot or a plain table, and the cost of each.",
                        ],
                        "hints": [
                            "An incremental filter that only looks at new timestamps will miss updates to old rows, so make sure your loader refreshes _loaded_at on changed rows.",
                            "Run dbt build --full-refresh when you change the logic of an incremental model; otherwise old rows keep the old logic.",
                            "Snapshot from the raw source, not from a transformed model, so you capture history before any cleaning changes it.",
                        ],
                        "common_mistakes": [
                            "Filtering on the order date instead of a load timestamp, which drops late arriving rows.",
                            "Forgetting unique_key, so each update is appended as a duplicate row.",
                            "Snapshotting a model that is itself rebuilt on every run, which loses the history you wanted.",
                            "Treating the snapshot as a source of truth without first running it on a schedule, so changes between runs are missed.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Make the project trustworthy for a team: define metrics once with MetricFlow, enforce contracts on the marts, check source freshness, and run dbt build in CI on every pull request.",
                "skill_key": "metrics_contracts_ci",
                "projects": [
                    {
                        "title": "Add a MetricFlow metrics layer, model contracts, freshness checks and CI to the dbt project",
                        "teaches": "defining semantic models and metrics once, enforcing column contracts, monitoring source freshness and automating review with continuous integration",
                        "prerequisites": ["The incremental and snapshot dbt project from the previous project", "A GitHub account and basic GitHub Actions knowledge"],
                        "expected_output": "A dbt project with semantic models and three metrics (revenue, order count, average order value) queried through MetricFlow, enforced contracts on the marts, a source freshness check, SQLFluff linting, and a GitHub Actions workflow that runs dbt build on every pull request.",
                        "steps": [
                            "Install dbt-metricflow alongside dbt-duckdb (check the MetricFlow docs for adapter support in your version) and add a time spine model as the docs describe for your dbt version.",
                            "Add a semantic model over fct_orders in YAML, with entities (order and customer), the order date as a time dimension, and revenue as a sum measure.",
                            "Define three metrics: revenue (simple), order_count (simple) and average_order_value (ratio of revenue to order_count).",
                            "Run dbt parse and mf validate-configs, then query with mf query --metrics revenue --group-by metric_time__month, and prove the result matches a direct SQL query on fct_orders.",
                            "Enable contract: {enforced: true} on fct_orders and dim_customers with data_type declared for every column, then rename a column on purpose to see the build fail.",
                            "Add loaded_at_field: _loaded_at and warn_after and error_after thresholds to the orders source, then run dbt source freshness, let the data go stale and see it flag.",
                            "Add a unit test (dbt 1.8 and later) for a piece of revenue logic using small mocked inputs.",
                            "Add SQLFluff with a .sqlfluff config for DuckDB or ANSI SQL, and fix the lint errors it reports.",
                            "Write .github/workflows/dbt-ci.yml that installs dependencies, generates the TPC-H data with a script, runs sqlfluff lint and dbt build, then open a pull request that breaks a test and show the failing check.",
                        ],
                        "hints": [
                            "Metric names are an interface that dashboards will depend on, so choose clear names and write a description for each.",
                            "Contracts catch accidental changes to column names and types before anyone downstream sees them, so apply them to the models other people query.",
                            "In CI, generate the data deterministically so builds are repeatable and need no secrets.",
                            "MetricFlow configuration has changed across dbt versions, so follow the docs for the exact version you install.",
                        ],
                        "common_mistakes": [
                            "Defining the same metric in several places, which is exactly what a metrics layer is meant to prevent.",
                            "Declaring contracts without data types, so enforcement does nothing.",
                            "Running CI against a persistent database, so builds depend on leftover state from earlier runs.",
                            "Never checking that a metric matches the SQL answer, and trusting the semantic layer blindly.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
}
