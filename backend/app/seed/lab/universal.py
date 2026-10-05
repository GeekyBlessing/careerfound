"""Project Lab content that is the same for every code-based project, in every
career: how to publish to GitHub, the repository and secrets checklists, the
README structure, and the interview questions that apply to any project.

Per-career, per-project content (what to build, the milestones, the technical
interview questions) lives in the career modules next to this file. Keeping
the shared workflow here means it is taught once, consistently, and a new
career only has to author what is genuinely specific to its work.
"""

LEVELS = ["beginner", "intermediate", "advanced", "job_ready"]
LEVEL_LABELS = {
    "beginner": "Beginner",
    "intermediate": "Intermediate",
    "advanced": "Advanced",
    "job_ready": "Job Ready",
}
# The 1 to 5 difficulty the rest of the product already uses.
LEVEL_DIFFICULTY = {"beginner": 2, "intermediate": 3, "advanced": 4, "job_ready": 5}

# The six stages a project can reach, in order. Each is derived from evidence
# (see app/services/lab_service.py), never from a button that claims it.
STAGES = [
    ("started", "Started", "You opened the project and began."),
    ("in_progress", "In progress", "You have completed at least one milestone."),
    ("completed", "Completed", "Build, test and documentation milestones are done and you confirmed the completion criteria."),
    ("published", "Published", "Your public GitHub repository exists, has a README and a real commit history."),
    ("portfolio_ready", "Portfolio ready", "The project is in your CareerFound portfolio and published there."),
    ("interview_ready", "Interview ready", "You wrote your own answers to the interview questions for this project."),
]

# Only milestones in these stages are ticked by hand. The publish, portfolio
# and interview steps are derived from evidence.
MANUAL_STAGES = ["build", "test", "document"]

INTERVIEW_MIN_CHARS = 40
INTERVIEW_MIN_UNIVERSAL = 3

PUBLISH_STEPS = [
    {
        "key": "folder",
        "title": "Create a project folder",
        "why": "Everything for the project lives in one folder, and that folder becomes the repository. Use a short, lowercase, descriptive name because it will also be your repository name.",
        "commands": [
            {"cmd": "mkdir network-recon-tool", "explain": "Makes a new folder. Replace the name with your own project name, using hyphens between words."},
            {"cmd": "cd network-recon-tool", "explain": "Moves your terminal into that folder so every later command runs inside the project."},
        ],
    },
    {
        "key": "editor",
        "title": "Open the project in your editor",
        "why": "Work from the project folder, not a single file, so the editor can see the whole project and you can see which files Git will track.",
        "commands": [
            {"cmd": "code .", "explain": "Opens the current folder in Visual Studio Code. The dot means 'this folder'. In another editor, use its Open Folder command."},
        ],
    },
    {
        "key": "init",
        "title": "Initialize Git",
        "why": "Git records the history of your project. Until you initialize it, the folder is just files and nothing is being tracked.",
        "commands": [
            {"cmd": "git init", "explain": "Creates a hidden .git folder that stores your project history. You only do this once per project."},
            {"cmd": "git status", "explain": "Shows what Git can see. Run it often: it tells you which files are new, changed, or staged for the next commit."},
        ],
    },
    {
        "key": "gitignore",
        "title": "Create a .gitignore",
        "why": "A .gitignore lists files Git must never track: secrets, virtual environments, caches and large generated files. Create it before your first commit, because once a secret is committed it is in your history even if you delete the file later.",
        "commands": [
            {"cmd": "touch .gitignore", "explain": "Creates an empty .gitignore file in the project root."},
        ],
        "snippet": ".env\n.env.*\n*.pem\n*.key\n.venv/\nvenv/\n__pycache__/\n*.pyc\n.pytest_cache/\nnode_modules/\n.DS_Store\nresults/\n*.log",
        "note": "Adjust the list for your project. Anything that holds a credential, a private key or personal data belongs in this file.",
    },
    {
        "key": "commits",
        "title": "Make meaningful commits",
        "why": "A commit is a saved checkpoint with a message. Reviewers read your commit history to see how you work, so commit when one logical thing is finished and describe what changed, not 'update' or 'stuff'.",
        "commands": [
            {"cmd": "git add .", "explain": "Stages every change in the folder, which means 'include this in the next commit'. Check git status first so you know what you are staging."},
            {"cmd": "git commit -m \"Initial project setup\"", "explain": "Saves a checkpoint with a message. The first commit is usually the setup. Later commits might read: Add TCP connect scan, Handle DNS failures, Add tests for closed ports."},
            {"cmd": "git log --oneline", "explain": "Lists your commits, newest first, one line each. This is roughly what a reviewer sees."},
        ],
        "note": "Aim for at least three real commits that tell the story of the build: setup, core feature, tests and documentation.",
    },
    {
        "key": "create_repo",
        "title": "Create a GitHub repository",
        "why": "GitHub hosts your repository so other people can see it. The repository on GitHub starts empty and your local project is pushed into it.",
        "commands": [],
        "note": "On github.com choose New repository. Use the same name as your folder, add a one line description, choose Public if you want employers to see it, and do not tick Add a README, because your project already has one. Copy the repository URL that GitHub shows you.",
    },
    {
        "key": "connect",
        "title": "Connect your local project to GitHub",
        "why": "Your local repository does not know GitHub exists until you tell it where to send changes. That address is called a remote, and by convention it is named origin.",
        "commands": [
            {"cmd": "git branch -M main", "explain": "Renames your current branch to main, which is the default branch name GitHub expects."},
            {"cmd": "git remote add origin YOUR_REPOSITORY_URL", "explain": "Registers your GitHub repository as the remote called origin. Replace YOUR_REPOSITORY_URL with the URL you copied."},
            {"cmd": "git remote -v", "explain": "Prints the remotes Git knows about so you can confirm the address is right."},
        ],
    },
    {
        "key": "push",
        "title": "Push the project",
        "why": "Pushing uploads your commits to GitHub. The first push also links your local main branch to the remote one so later pushes are a single short command.",
        "commands": [
            {"cmd": "git push -u origin main", "explain": "Uploads your main branch to origin. The -u flag remembers the link, so from now on git push is enough."},
        ],
        "note": "GitHub will ask you to sign in. Use the browser sign in from GitHub Desktop or the GitHub CLI, or a personal access token with the narrowest permissions that work. Never paste a token into a file in the project.",
    },
    {
        "key": "verify",
        "title": "Verify the repository",
        "why": "Open the repository in a private browser window, as a stranger would. Confirm the files are there, the README renders, and nothing sensitive is visible.",
        "commands": [
            {"cmd": "git status", "explain": "Should say your branch is up to date with origin/main and the working tree is clean."},
        ],
        "note": "Click through the folders. Search the repository for the words key, token, password and secret. If anything real appears, treat it as leaked: rotate it first, then clean the history.",
    },
    {
        "key": "readme",
        "title": "Improve the README",
        "why": "The README is the front door of the project. A recruiter decides in under a minute whether to keep reading, so it must say what the project is, what problem it solves, how to run it and what you learned.",
        "commands": [],
        "note": "Use the README Builder in this project to draft every section from your own project details, then edit it so it sounds like you and describes your real work.",
    },
]

GITHUB_CHECKLIST = [
    ("gh.repo_created", "Repository created"),
    ("gh.clear_name", "Repository has a clear name"),
    ("gh.readme_exists", "README exists"),
    ("gh.description", "Project description added"),
    ("gh.install", "Installation instructions added"),
    ("gh.usage", "Usage instructions added"),
    ("gh.screenshots", "Screenshots or sample output added where appropriate"),
    ("gh.technologies", "Technologies listed"),
    ("gh.structure", "Project structure documented"),
    ("gh.gitignore", ".gitignore configured"),
    ("gh.no_secrets", "No secrets committed"),
    ("gh.commits", "Meaningful commits made"),
    ("gh.public", "Repository is public if appropriate"),
]

SECURITY_CHECKLIST = [
    ("sec.no_keys", "No API keys in the code or the history"),
    ("sec.no_passwords", "No passwords in the code or the history"),
    ("sec.no_tokens", "No access tokens in the code or the history"),
    ("sec.env_excluded", ".env files are excluded by .gitignore"),
    ("sec.secrets_removed", "Secrets are read from environment variables, not written into source"),
    ("sec.gitignore_checked", ".gitignore was checked before the first commit"),
]

SECURITY_GUIDANCE = (
    "Never commit API keys, passwords, tokens, private keys, .env files or cloud credentials. "
    "Read them from environment variables at run time, keep a .env.example that lists the variable names with fake values, "
    "and add the real .env to .gitignore before your first commit. If you ever push a secret, assume it is compromised: "
    "revoke or rotate it immediately, because deleting the file does not remove it from Git history."
)

README_SECTIONS = [
    ("overview", "Overview", "Two or three sentences: what this project is and what it does, in plain language."),
    ("problem", "Problem", "The real situation that makes this useful. Who has the problem and what goes wrong without a solution?"),
    ("solution", "Solution", "How your project solves it, in a few sentences. Say what you chose to build and why."),
    ("features", "Features", "A short list of what it can do. Start from the project requirements and keep only what is true."),
    ("technologies", "Technologies", "The languages, libraries and tools you used, each with a few words on why."),
    ("architecture", "Architecture", "How the parts fit together. Add a diagram or a short description of the main components and the flow of data."),
    ("installation", "Installation", "Exact commands to get it running on a clean machine, including the language version and dependencies."),
    ("usage", "Usage", "Example commands or screens that show it working, with real sample output."),
    ("screenshots", "Screenshots", "Images or terminal output that prove it works. Keep them in a docs or images folder."),
    ("testing", "Testing", "How to run the tests and what they cover. Be honest about what is not tested."),
    ("challenges", "Challenges", "The hardest problems you hit and how you solved them. This is the section interviewers ask about."),
    ("learned", "What I Learned", "Specific skills and ideas you now understand that you did not before."),
    ("future", "Future Improvements", "Two or three honest next steps. Reviewers value knowing you can see the limits of your own work."),
    ("author", "Author", "Your name, a link to your CareerFound portfolio or LinkedIn, and how to contact you."),
]

# Questions that apply to any project. The technical questions that matter most
# for interviews are authored per project; these are the shared storytelling set.
UNIVERSAL_INTERVIEW = [
    {"q": "What problem were you solving?", "covers": "The real situation behind the project in one or two sentences, and who would use it."},
    {"q": "Why did you choose this approach?", "covers": "The alternatives you considered and the specific reason you picked this one for this problem."},
    {"q": "What technologies did you use, and why those?", "covers": "Each tool tied to a job it does in the project, not a list of names."},
    {"q": "What was the hardest part?", "covers": "One concrete problem, what you tried first, why it failed, and what finally worked."},
    {"q": "What tradeoffs did you make?", "covers": "Something you chose not to build or optimise, and what that cost you."},
    {"q": "What would you improve?", "covers": "Specific, honest limitations of the current version and the next change you would make."},
    {"q": "How would you scale this or take it to production?", "covers": "What breaks first at larger size, and what you would add: testing, monitoring, deployment, access control."},
    {"q": "What did you learn?", "covers": "A skill or idea you now understand properly, ideally one you could explain to someone else."},
]

CASE_STUDY_PUBLISH_STEPS = [
    {
        "key": "export",
        "title": "Export your case study",
        "why": "A case study is read by people who will not open your design files. Export it as a PDF and keep the editable source.",
        "commands": [],
    },
    {
        "key": "host",
        "title": "Publish it where it can be opened with one link",
        "why": "Choose a portfolio site, a public Notion page, or a public document. The link must open without a login.",
        "commands": [],
    },
    {
        "key": "verify",
        "title": "Open the link in a private window",
        "why": "Confirm it loads, the images render and nothing private is exposed.",
        "commands": [],
    },
]

LEVEL_BLURBS = {
    "beginner": "Small, finished tools that each teach one core skill. You build something that runs, and you learn to publish it properly.",
    "intermediate": "Projects that combine several skills on realistic data and ask you to make design decisions of your own.",
    "advanced": "Engineering projects that integrate earlier work, include automated testing and ask you to defend your choices.",
    "job_ready": "A flagship project you can talk about for most of an interview, built and documented like real work.",
}
