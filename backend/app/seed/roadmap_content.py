"""
Fully authored roadmap content for the two launch paths: Cybersecurity and
Software Engineering. Every lesson, exercise, project, and quiz here is real,
specific content — not lorem ipsum — matching the phase structure specified
in the product brief.
"""

CYBERSECURITY = {
    "skills": [
        {"key": "computer_fundamentals", "label": "Computer Fundamentals", "category": "foundation"},
        {"key": "networking", "label": "Networking", "category": "foundation"},
        {"key": "linux", "label": "Linux", "category": "foundation"},
        {"key": "python", "label": "Python", "category": "foundation"},
        {"key": "security_fundamentals", "label": "Security Fundamentals", "category": "core"},
        {"key": "soc_fundamentals", "label": "SOC Fundamentals", "category": "core"},
        {"key": "siem", "label": "SIEM", "category": "core"},
        {"key": "cloud_security", "label": "Cloud Security", "category": "advanced"},
        {"key": "detection_engineering", "label": "Detection Engineering", "category": "advanced"},
        {"key": "portfolio", "label": "Portfolio", "category": "career"},
        {"key": "job_prep", "label": "Job Preparation", "category": "career"},
    ],
    "skill_edges": [
        ("computer_fundamentals", "networking"),
        ("networking", "linux"),
        ("linux", "python"),
        ("python", "security_fundamentals"),
        ("security_fundamentals", "soc_fundamentals"),
        ("soc_fundamentals", "siem"),
        ("siem", "cloud_security"),
        ("cloud_security", "detection_engineering"),
        ("detection_engineering", "portfolio"),
        ("portfolio", "job_prep"),
    ],
    "phases": [
        {
            "title": "Phase 1 — Computer Fundamentals",
            "summary": "The absolute basics of how a computer stores and processes information, so nothing later feels like magic.",
            "skill_key": "computer_fundamentals",
            "lessons": [
                {
                    "title": "How computers store information",
                    "concept_summary": "Everything on a computer — text, images, this lesson — is stored as combinations of 1s and 0s (binary).",
                    "beginner_explainer": "Think of a light switch: on or off. A computer has billions of tiny switches. Every letter, photo, and program is just a very long pattern of those switches being on or off.",
                    "content_md": "## Binary basics\nComputers use **binary** (base 2) because transistors are easiest to build as two-state (on/off) switches.\n\n- 1 bit = one switch (0 or 1)\n- 1 byte = 8 bits, enough to represent one character (e.g. 'A' = 01000001)\n\nYou don't need to do binary math by hand day-to-day, but understanding this makes concepts like IP addresses, file sizes, and encoding click much faster later.",
                    "est_minutes": 15,
                },
                {
                    "title": "Operating systems, processes, and files",
                    "concept_summary": "The operating system (Windows, macOS, Linux) manages hardware and runs everything else as 'processes'.",
                    "beginner_explainer": "The OS is like a hotel manager: it decides which guest (program) gets which room (memory) and for how long, and keeps guests from wrecking each other's rooms.",
                    "content_md": "## Key concepts\n- **Process**: a running program\n- **File system**: how the OS organizes files into folders/directories\n- **Permissions**: rules about who can read/write/execute a file — the foundation of most security later in this path",
                    "est_minutes": 15,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "How many bits are in one byte?",
                    "type": "mcq",
                    "options": ["4", "8", "16", "1024"],
                    "answer_key": {"value": "8"},
                    "est_minutes": 5,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Computer Fundamentals",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What does the operating system primarily manage?", "options": ["Hardware and running programs", "Only the internet connection", "Only file downloads"], "correct_option": "Hardware and running programs"},
                    {"id": "q2", "prompt": "File permissions control...", "options": ["Who can read/write/execute a file", "The color of the file icon", "The file's download speed"], "correct_option": "Who can read/write/execute a file"},
                ],
            },
        },
        {
            "title": "Phase 2 — Networking",
            "summary": "How computers find and talk to each other — the foundation for everything in security.",
            "skill_key": "networking",
            "lessons": [
                {
                    "title": "What is an IP address?",
                    "concept_summary": "An IP address is a unique numeric address that lets devices find each other on a network.",
                    "beginner_explainer": "Think of an IP address like a street address for a computer — it's how data knows exactly where to be delivered among millions of other devices.",
                    "content_md": "## IPv4 basics\nAn IPv4 address looks like `192.168.1.10` — four numbers (0-255) separated by dots.\n\n- **Public IP**: visible on the internet\n- **Private IP**: only visible on your local network (e.g. your home Wi-Fi)\n\nEvery device you own gets a private IP from your router; your router itself has one public IP shared by your whole household.",
                    "est_minutes": 15,
                },
                {
                    "title": "TCP/IP and how data actually travels",
                    "concept_summary": "TCP/IP is the pair of rules that address and reliably deliver data across networks.",
                    "beginner_explainer": "Think of TCP/IP like the postal service's rules: IP is the address on the envelope, and TCP is the promise that every page of your letter arrives, in order, with nothing missing.",
                    "content_md": "## Ports\nA port is like an apartment number at that street address — it tells the computer *which* application should receive the data (e.g. port 443 for HTTPS, port 22 for SSH).",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "Which of these is a valid private IP address range?",
                    "type": "mcq",
                    "options": ["192.168.0.0/16", "8.8.8.0/24", "1.1.1.0/24"],
                    "answer_key": {"value": "192.168.0.0/16"},
                    "est_minutes": 10,
                }
            ],
            "projects": [
                {
                    "title": "Build a Python port scanner",
                    "teaches": "how services on a network expose themselves through open ports, and how attackers (and defenders) discover them",
                    "prerequisites": ["Python basics", "Networking fundamentals"],
                    "expected_output": "A command-line script that takes a target host and port range, and reports which ports are open.",
                    "steps": [
                        "Set up a Python script that accepts a hostname and port range as input.",
                        "Use the `socket` module to attempt a connection to each port.",
                        "Record and print which ports responded (open) vs. timed out (closed/filtered).",
                        "Add basic multithreading so the scan doesn't take minutes for a full range.",
                        "Only ever scan hosts you own or have explicit permission to scan.",
                    ],
                    "hints": [
                        "socket.settimeout() prevents your scanner from hanging forever on filtered ports.",
                        "Start with a small port range (1-1024) before trying the full 65535.",
                    ],
                    "common_mistakes": [
                        "Forgetting a timeout, causing the scan to hang indefinitely on filtered ports.",
                        "Scanning a host without permission — always scan localhost or an intentionally vulnerable practice target.",
                    ],
                    "difficulty": 2,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Networking",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What does a port number identify?", "options": ["Which application should receive the data", "The physical location of the server", "The speed of the connection"], "correct_option": "Which application should receive the data"},
                    {"id": "q2", "prompt": "192.168.x.x addresses are typically...", "options": ["Private/local network addresses", "Always public internet addresses", "Reserved for government use"], "correct_option": "Private/local network addresses"},
                ],
            },
        },
        {
            "title": "Phase 3 — Linux",
            "summary": "Most security tools and servers run on Linux — comfort with the command line is non-negotiable.",
            "skill_key": "linux",
            "lessons": [
                {
                    "title": "The Linux command line, from zero",
                    "concept_summary": "A small set of commands (ls, cd, cat, grep, chmod) covers the vast majority of daily work.",
                    "beginner_explainer": "The command line is just a different way of talking to your computer — instead of clicking icons, you type short instructions. It feels slower at first and becomes much faster once it clicks.",
                    "content_md": "## Core commands\n- `ls` — list files\n- `cd` — change directory\n- `cat` — print a file's contents\n- `grep` — search text\n- `chmod` — change file permissions\n\nTry these in any Linux terminal, a WSL install on Windows, or an online sandbox — you don't need a dedicated machine to start.",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "Which command searches for a text pattern inside a file?",
                    "type": "mcq",
                    "options": ["grep", "ls", "cd"],
                    "answer_key": {"value": "grep"},
                    "est_minutes": 10,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Linux",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "Which command changes a file's permissions?", "options": ["chmod", "cat", "grep"], "correct_option": "chmod"},
                ],
            },
        },
        {
            "title": "Phase 4 — Python",
            "summary": "Python is the most common scripting language in security work — automation is a huge part of the job.",
            "skill_key": "python",
            "lessons": [
                {
                    "title": "Python fundamentals for security work",
                    "concept_summary": "Variables, loops, conditionals, and functions — the small toolkit behind almost every security script you'll write.",
                    "beginner_explainer": "Python reads almost like English. A loop just means 'do this again for each item', and a conditional means 'only do this if something is true'.",
                    "content_md": "## Example\n```python\nfor attempt in range(3):\n    password = input('Enter password: ')\n    if password == 'correct-horse':\n        print('Access granted')\n        break\nelse:\n    print('Access denied')\n```",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "What keyword starts a loop that repeats for each item in a list?",
                    "type": "mcq",
                    "options": ["for", "if", "def"],
                    "answer_key": {"value": "for"},
                    "est_minutes": 10,
                }
            ],
            "projects": [
                {
                    "title": "Build a password-strength checker",
                    "teaches": "basic scripting, string manipulation, and the practical rules behind password security",
                    "prerequisites": ["Python fundamentals"],
                    "expected_output": "A script that takes a password as input and reports a strength score plus specific reasons (length, character variety, common patterns).",
                    "steps": [
                        "Write a function that checks password length.",
                        "Add checks for uppercase, lowercase, digits, and symbols.",
                        "Check the password against a small list of common weak passwords.",
                        "Combine the checks into a score (e.g. 0-100) with specific feedback.",
                        "Add a simple command-line loop so a user can test multiple passwords.",
                    ],
                    "hints": [
                        "Python's `string` module has helpful character-set constants.",
                        "Keep the common-password list small (20-30 entries) — the goal is the logic, not the dataset.",
                    ],
                    "common_mistakes": [
                        "Scoring only on length and ignoring character variety.",
                        "Printing the entered password back in logs — never log real passwords, even in a practice project.",
                    ],
                    "difficulty": 1,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Python",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What does `for` do in Python?", "options": ["Repeats code for each item in a sequence", "Defines a function", "Imports a module"], "correct_option": "Repeats code for each item in a sequence"},
                ],
            },
        },
        {
            "title": "Phase 5 — Security Fundamentals",
            "summary": "The core concepts — CIA triad, threats, vulnerabilities, and risk — that every other security specialty builds on.",
            "skill_key": "security_fundamentals",
            "lessons": [
                {
                    "title": "The CIA triad: Confidentiality, Integrity, Availability",
                    "concept_summary": "Nearly every security decision trades off between keeping data secret, accurate, and accessible.",
                    "beginner_explainer": "Confidentiality = only the right people can see it. Integrity = the data hasn't been tampered with. Availability = it's there when you need it. Security is mostly about balancing these three.",
                    "content_md": "## Threats vs. vulnerabilities vs. risk\n- **Vulnerability**: a weakness (e.g. outdated software)\n- **Threat**: someone/something that could exploit it (e.g. an attacker)\n- **Risk**: the likelihood and impact if a threat exploits a vulnerability",
                    "est_minutes": 15,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "A website going down during a traffic spike is primarily a failure of...",
                    "type": "mcq",
                    "options": ["Availability", "Confidentiality", "Integrity"],
                    "answer_key": {"value": "Availability"},
                    "est_minutes": 10,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Security Fundamentals",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What does the 'I' in CIA triad stand for?", "options": ["Integrity", "Internet", "Identity"], "correct_option": "Integrity"},
                ],
            },
        },
        {
            "title": "Phase 6 — SOC Fundamentals",
            "summary": "What a Security Operations Center actually does day to day, and how alerts turn into action.",
            "skill_key": "soc_fundamentals",
            "lessons": [
                {
                    "title": "A day in the life of a SOC analyst",
                    "concept_summary": "SOC analysts triage alerts, investigate suspicious activity, and escalate real incidents.",
                    "beginner_explainer": "Imagine a security guard watching dozens of camera feeds — most movement is nothing, but they need a process to quickly tell normal from suspicious.",
                    "content_md": "## The triage mindset\n1. **Alert fires** — something matched a detection rule\n2. **Triage** — is this likely a false positive or worth investigating?\n3. **Investigate** — gather context (who, what, when, from where)\n4. **Escalate or close** — hand off to Tier 2, or close with notes",
                    "est_minutes": 15,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "What is the first thing a SOC analyst does with a new alert?",
                    "type": "mcq",
                    "options": ["Triage it", "Immediately escalate to law enforcement", "Delete it"],
                    "answer_key": {"value": "Triage it"},
                    "est_minutes": 10,
                }
            ],
            "projects": [
                {
                    "title": "Analyze network traffic",
                    "teaches": "reading packet captures to spot suspicious patterns, a core SOC analyst skill",
                    "prerequisites": ["Networking fundamentals", "Security fundamentals"],
                    "expected_output": "A short written analysis of a sample .pcap file identifying at least one suspicious pattern and explaining why it's suspicious.",
                    "steps": [
                        "Open a sample packet capture in Wireshark (practice captures are widely available for training).",
                        "Filter traffic by protocol to get oriented (http, dns, tcp.port==22, etc).",
                        "Look for unusual patterns: repeated failed connections, traffic to unfamiliar IPs, plaintext credentials.",
                        "Write a short report: what you found, why it's suspicious, and what you'd do next.",
                    ],
                    "hints": [
                        "Start with the 'Statistics > Protocol Hierarchy' view to see what's in the capture before diving into individual packets.",
                        "Repeated SYN packets with no completed handshake can indicate scanning activity.",
                    ],
                    "common_mistakes": [
                        "Trying to read every single packet instead of filtering first.",
                        "Flagging normal background chatter (DNS, ARP) as suspicious without understanding baseline traffic.",
                    ],
                    "difficulty": 2,
                }
            ],
            "quiz": {
                "title": "Checkpoint: SOC Fundamentals",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What is a 'false positive'?", "options": ["An alert that looks malicious but isn't", "A confirmed attack", "A tool malfunction"], "correct_option": "An alert that looks malicious but isn't"},
                ],
            },
        },
        {
            "title": "Phase 7 — SIEM",
            "summary": "How Security Information and Event Management tools aggregate logs so analysts can search and detect threats at scale.",
            "skill_key": "siem",
            "lessons": [
                {
                    "title": "What a SIEM actually does",
                    "concept_summary": "A SIEM collects logs from many systems into one searchable place and raises alerts based on rules.",
                    "beginner_explainer": "Imagine every door, camera, and alarm in a building reporting to one control room instead of being checked separately — that's what a SIEM does for a company's computers.",
                    "content_md": "## Core SIEM workflow\n1. Logs are collected from servers, firewalls, endpoints\n2. Logs are normalized into a common format\n3. Detection rules run against incoming logs\n4. Matches generate alerts an analyst reviews",
                    "est_minutes": 15,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "What is the main benefit of centralizing logs in a SIEM?",
                    "type": "mcq",
                    "options": ["You can search and correlate across systems in one place", "It makes logs disappear faster", "It replaces the need for any analysts"],
                    "answer_key": {"value": "You can search and correlate across systems in one place"},
                    "est_minutes": 10,
                }
            ],
            "projects": [
                {
                    "title": "Build a basic log analyzer",
                    "teaches": "parsing raw logs and extracting security-relevant patterns, the foundation of what a SIEM automates at scale",
                    "prerequisites": ["Python fundamentals", "SOC fundamentals"],
                    "expected_output": "A Python script that reads a sample web server or auth log file and flags suspicious patterns (e.g. repeated failed logins from one IP).",
                    "steps": [
                        "Find or generate a sample log file (e.g. Linux auth.log format, or a synthetic one you create).",
                        "Write a parser that extracts timestamp, source IP, and event type from each line.",
                        "Count failed login attempts grouped by source IP.",
                        "Flag any IP with more than N failed attempts in a short window as suspicious.",
                        "Print a clean summary report.",
                    ],
                    "hints": [
                        "Regular expressions (the `re` module) are the standard tool for parsing log lines.",
                        "Use a dictionary keyed by IP address to count attempts efficiently.",
                    ],
                    "common_mistakes": [
                        "Hardcoding a log format that breaks the moment the input varies slightly.",
                        "Not accounting for legitimate retries (e.g. a user who mistypes their password twice).",
                    ],
                    "difficulty": 3,
                }
            ],
            "quiz": {
                "title": "Checkpoint: SIEM",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "A SIEM primarily helps analysts by...", "options": ["Centralizing and correlating logs", "Writing code automatically", "Replacing firewalls"], "correct_option": "Centralizing and correlating logs"},
                ],
            },
        },
        {
            "title": "Phase 8 — Cloud Security",
            "summary": "How security changes (and doesn't) when systems move from physical servers to the cloud.",
            "skill_key": "cloud_security",
            "lessons": [
                {
                    "title": "The shared responsibility model",
                    "concept_summary": "Cloud providers secure the infrastructure; you're responsible for securing what you build on top of it.",
                    "beginner_explainer": "Renting an apartment: the landlord secures the building's locks and structure, but you're still responsible for locking your own door and not leaving your windows open.",
                    "content_md": "## Common cloud misconfigurations\n- Publicly exposed storage buckets\n- Overly permissive access roles ('anyone can do anything')\n- Unencrypted data at rest",
                    "est_minutes": 15,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "Under the shared responsibility model, who secures the applications you build on the cloud?",
                    "type": "mcq",
                    "options": ["You (the customer)", "Entirely the cloud provider", "No one — it's automatic"],
                    "answer_key": {"value": "You (the customer)"},
                    "est_minutes": 10,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Cloud Security",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "A publicly exposed storage bucket is an example of...", "options": ["A misconfiguration", "A hardware failure", "Normal, safe behavior"], "correct_option": "A misconfiguration"},
                ],
            },
        },
        {
            "title": "Phase 9 — Detection Engineering",
            "summary": "How to write the rules that turn raw activity into meaningful alerts, and reduce noisy false positives.",
            "skill_key": "detection_engineering",
            "lessons": [
                {
                    "title": "Writing your first detection rule",
                    "concept_summary": "A detection rule matches a specific pattern of activity likely to indicate malicious behavior.",
                    "beginner_explainer": "A detection rule is like setting a specific tripwire: 'alert me if this exact kind of thing happens', instead of just watching everything and hoping to notice.",
                    "content_md": "## Reducing false positives\nGood detections are specific enough to catch real threats without drowning analysts in noise from normal behavior — this balance is the core skill of detection engineering.",
                    "est_minutes": 15,
                },
            ],
            "exercises": [
                {
                    "lesson_index": 0,
                    "prompt": "A detection rule that fires constantly on normal activity has a problem with...",
                    "type": "mcq",
                    "options": ["False positives", "Encryption", "Bandwidth"],
                    "answer_key": {"value": "False positives"},
                    "est_minutes": 10,
                }
            ],
            "projects": [
                {
                    "title": "Create a mini SOC dashboard",
                    "teaches": "pulling together logs, alerts, and summary metrics into one view — the core idea behind SOC tooling",
                    "prerequisites": ["Python fundamentals", "SIEM basics", "Log analysis project"],
                    "expected_output": "A simple local web dashboard (Flask or Streamlit) showing recent flagged events from your log analyzer project, with counts and a basic severity indicator.",
                    "steps": [
                        "Reuse your log analyzer from Phase 7 as the data source.",
                        "Set up a minimal Flask or Streamlit app.",
                        "Display a table of flagged events with timestamp, source IP, and reason flagged.",
                        "Add summary counters at the top (total alerts today, top offending IPs).",
                        "Add a simple severity color-coding (low/medium/high).",
                    ],
                    "hints": [
                        "Streamlit is the fastest way to get a working dashboard with minimal frontend code.",
                        "Keep the data source as a simple in-memory list or SQLite table — no need for a full database yet.",
                    ],
                    "common_mistakes": [
                        "Over-engineering the frontend before the underlying detection logic actually works.",
                        "Not handling the 'no alerts yet' empty state.",
                    ],
                    "difficulty": 3,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Detection Engineering",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "The main tradeoff in detection engineering is between...", "options": ["Catching real threats and minimizing false positives", "Cost and color scheme", "Speed and font size"], "correct_option": "Catching real threats and minimizing false positives"},
                ],
            },
        },
        {
            "title": "Phase 10 — Portfolio",
            "summary": "Turn your completed projects into a portfolio that gets you interviews.",
            "skill_key": "portfolio",
            "lessons": [
                {
                    "title": "What makes a security portfolio stand out",
                    "concept_summary": "Hiring managers want to see how you think, not just a list of tools.",
                    "beginner_explainer": "A portfolio project is basically proof you can do the job — write it up so a busy hiring manager understands what you built and why in under a minute.",
                    "content_md": "## Structure that works\n1. The problem\n2. What you built\n3. What you learned / would improve\n\nUse the Portfolio Builder to auto-generate a first draft of each of your completed projects, then personalize it.",
                    "est_minutes": 15,
                },
            ],
            "projects": [
                {
                    "title": "Build an automated security alert system",
                    "teaches": "tying detection logic to real notifications — the last mile that makes a detection system actually useful",
                    "prerequisites": ["Log analyzer project", "Mini SOC dashboard project"],
                    "expected_output": "A script or small service that monitors your log analyzer's output and sends a notification (console, email, or webhook) when a high-severity event is detected.",
                    "steps": [
                        "Define what counts as 'high severity' based on your earlier log analyzer logic.",
                        "Add a notification step — start simple with a formatted console/log message, then optionally add email or a webhook (e.g. a Discord/Slack webhook).",
                        "Add basic rate-limiting so one burst of events doesn't spam 50 notifications.",
                        "Document the end-to-end flow: log → detection → alert.",
                    ],
                    "hints": [
                        "Webhooks are the easiest 'real' notification channel to wire up without managing email infrastructure.",
                        "Test with synthetic log data you control before pointing this at anything live.",
                    ],
                    "common_mistakes": [
                        "No rate limiting, resulting in notification spam during a real burst of events.",
                        "Hardcoding secrets (webhook URLs, credentials) directly in the script instead of environment variables.",
                    ],
                    "difficulty": 3,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Portfolio",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "A strong portfolio write-up should explain...", "options": ["The problem, what you built, and what you learned", "Only the tools you used", "Only the final screenshot"], "correct_option": "The problem, what you built, and what you learned"},
                ],
            },
        },
        {
            "title": "Phase 11 — Job Preparation",
            "summary": "Mock interviews, resume polish, and real-world simulations to get you ready to apply with confidence.",
            "skill_key": "job_prep",
            "lessons": [
                {
                    "title": "How entry-level security interviews actually go",
                    "concept_summary": "Expect a mix of fundamentals questions, a scenario/triage exercise, and behavioral questions.",
                    "beginner_explainer": "Interviewers aren't trying to trick you — they mostly want to see how you think through a problem out loud, even if you don't know the exact answer immediately.",
                    "content_md": "## Practice with your AI Mentor\nUse the AI Mentor's mock interview mode to rehearse SOC triage scenarios and fundamentals questions before your real interviews.",
                    "est_minutes": 15,
                },
            ],
            "quiz": {
                "title": "Checkpoint: Job Preparation",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "A good way to prepare for scenario-based interview questions is to...", "options": ["Practice mock triage scenarios out loud", "Memorize every CVE ever published", "Skip preparation and wing it"], "correct_option": "Practice mock triage scenarios out loud"},
                ],
            },
        },
    ],
}

SOFTWARE_ENGINEERING = {
    "skills": [
        {"key": "programming_fundamentals", "label": "Programming Fundamentals", "category": "foundation"},
        {"key": "git", "label": "Git & Version Control", "category": "foundation"},
        {"key": "web_fundamentals", "label": "Web Fundamentals", "category": "foundation"},
        {"key": "backend_apis", "label": "Backend & APIs", "category": "core"},
        {"key": "databases", "label": "Databases & SQL", "category": "core"},
        {"key": "testing_debugging", "label": "Testing & Debugging", "category": "core"},
        {"key": "portfolio_se", "label": "Portfolio", "category": "career"},
        {"key": "job_prep_se", "label": "Job Preparation", "category": "career"},
    ],
    "skill_edges": [
        ("programming_fundamentals", "git"),
        ("git", "web_fundamentals"),
        ("web_fundamentals", "backend_apis"),
        ("backend_apis", "databases"),
        ("databases", "testing_debugging"),
        ("testing_debugging", "portfolio_se"),
        ("portfolio_se", "job_prep_se"),
    ],
    "phases": [
        {
            "title": "Phase 1 — Programming Fundamentals",
            "summary": "Variables, control flow, functions, and data structures — the building blocks of every program you'll ever write.",
            "skill_key": "programming_fundamentals",
            "lessons": [
                {
                    "title": "Variables, types, and control flow",
                    "concept_summary": "Programs store data in variables and make decisions using conditionals and loops.",
                    "beginner_explainer": "A variable is just a labeled box you can put a value in and change later. A conditional is a fork in the road: 'if this is true, go left; otherwise, go right.'",
                    "content_md": "## Example\n```python\nage = 17\nif age >= 18:\n    print('You can vote')\nelse:\n    print('Not yet')\n```",
                    "est_minutes": 20,
                },
                {
                    "title": "Functions and reusable code",
                    "concept_summary": "Functions let you package up logic so you can reuse it instead of repeating yourself.",
                    "beginner_explainer": "A function is like a recipe: you give it ingredients (inputs), it follows steps, and hands you back a result (output) — and you can reuse that recipe as many times as you want.",
                    "content_md": "## Example\n```python\ndef greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('Amina'))\n```",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {"lesson_index": 0, "prompt": "What does a conditional (`if`) statement let a program do?", "type": "mcq", "options": ["Make decisions based on a condition", "Store a value", "Import a library"], "answer_key": {"value": "Make decisions based on a condition"}, "est_minutes": 10},
                {"lesson_index": 1, "prompt": "What is the main benefit of writing a function?", "type": "mcq", "options": ["Reusing logic without repeating code", "Making the program run on a different computer", "Automatically fixing bugs"], "answer_key": {"value": "Reusing logic without repeating code"}, "est_minutes": 10},
            ],
            "projects": [
                {
                    "title": "Build a command-line calculator",
                    "teaches": "core programming fundamentals: functions, conditionals, and handling user input safely",
                    "prerequisites": ["Variables and control flow", "Functions"],
                    "expected_output": "A CLI tool that takes two numbers and an operator from the user and prints the result, handling invalid input gracefully.",
                    "steps": [
                        "Write functions for add, subtract, multiply, and divide.",
                        "Prompt the user for two numbers and an operator.",
                        "Call the right function based on the operator.",
                        "Handle invalid input (non-numeric values, division by zero) without crashing.",
                        "Add a loop so the user can do multiple calculations without restarting.",
                    ],
                    "hints": [
                        "Wrap the numeric conversion in a try/except to handle bad input cleanly.",
                        "A dictionary mapping operator strings to functions avoids a long if/elif chain.",
                    ],
                    "common_mistakes": [
                        "Not handling division by zero.",
                        "Crashing on non-numeric input instead of asking again.",
                    ],
                    "difficulty": 1,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Programming Fundamentals",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What will `def greet(name): return f'Hi {name}'` do when called with 'Sam'?", "options": ["Return 'Hi Sam'", "Print nothing", "Cause an error"], "correct_option": "Return 'Hi Sam'"},
                ],
            },
        },
        {
            "title": "Phase 2 — Git & Version Control",
            "summary": "How professional developers track changes, collaborate, and never lose work.",
            "skill_key": "git",
            "lessons": [
                {
                    "title": "Git basics: commits, branches, and GitHub",
                    "concept_summary": "Git tracks every change to your code over time; GitHub hosts that history so others (and employers) can see it.",
                    "beginner_explainer": "Think of Git like an infinite 'undo' history with save points (commits) you create on purpose, plus the ability to try new ideas in a separate copy (a branch) without breaking your main version.",
                    "content_md": "## Core workflow\n```\ngit init\ngit add .\ngit commit -m \"describe what changed\"\ngit push\n```\nA clean, readable commit history is itself something employers look at.",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {"lesson_index": 0, "prompt": "What command saves a snapshot of your staged changes?", "type": "mcq", "options": ["git commit", "git branch", "git clone"], "answer_key": {"value": "git commit"}, "est_minutes": 10},
            ],
            "quiz": {
                "title": "Checkpoint: Git & Version Control",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What is a 'branch' in Git?", "options": ["A separate line of development you can experiment on", "A type of error", "A cloud backup service"], "correct_option": "A separate line of development you can experiment on"},
                ],
            },
        },
        {
            "title": "Phase 3 — Web Fundamentals",
            "summary": "HTML, CSS, and JavaScript — how a web page is structured, styled, and made interactive.",
            "skill_key": "web_fundamentals",
            "lessons": [
                {
                    "title": "HTML & CSS: structure and style",
                    "concept_summary": "HTML defines a page's content and structure; CSS controls how it looks.",
                    "beginner_explainer": "HTML is like the skeleton and labeled boxes of a page (this is a heading, this is a paragraph). CSS is the paint, layout, and styling on top of that skeleton.",
                    "content_md": "## Example\n```html\n<h1>Welcome</h1>\n<p style=\"color: gray;\">A short paragraph.</p>\n```",
                    "est_minutes": 20,
                },
                {
                    "title": "JavaScript: making pages interactive",
                    "concept_summary": "JavaScript runs in the browser and responds to what users do — clicks, typing, and more.",
                    "beginner_explainer": "If HTML is the skeleton and CSS is the paint, JavaScript is the muscles — it's what makes things actually move and respond when you interact with a page.",
                    "content_md": "## Example\n```javascript\ndocument.querySelector('button').addEventListener('click', () => {\n  alert('Clicked!');\n});\n```",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {"lesson_index": 1, "prompt": "What does `addEventListener('click', ...)` do?", "type": "mcq", "options": ["Runs code when the element is clicked", "Deletes the element", "Changes the page's URL"], "answer_key": {"value": "Runs code when the element is clicked"}, "est_minutes": 10},
            ],
            "projects": [
                {
                    "title": "Build a to-do list web app",
                    "teaches": "DOM manipulation, event handling, and basic state management in the browser",
                    "prerequisites": ["HTML & CSS", "JavaScript basics"],
                    "expected_output": "A single-page app where a user can add, complete, and delete to-do items, with the list persisting in memory during the session.",
                    "steps": [
                        "Build the HTML structure: an input, an 'add' button, and a list container.",
                        "Write JavaScript to add a new list item when the button is clicked.",
                        "Add a way to mark an item complete (e.g. strike-through styling).",
                        "Add a delete button per item.",
                        "Style it so it looks clean, not just functional.",
                    ],
                    "hints": [
                        "Use event delegation on the list container instead of adding a listener to every single item.",
                        "Do not use localStorage for this exercise — keep state in a JavaScript array in memory.",
                    ],
                    "common_mistakes": [
                        "Forgetting to clear the input field after adding an item.",
                        "Losing track of which item a delete/complete button belongs to.",
                    ],
                    "difficulty": 2,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Web Fundamentals",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "Which language controls a webpage's visual styling?", "options": ["CSS", "HTML", "SQL"], "correct_option": "CSS"},
                ],
            },
        },
        {
            "title": "Phase 4 — Backend & APIs",
            "summary": "How servers respond to requests and expose data through APIs.",
            "skill_key": "backend_apis",
            "lessons": [
                {
                    "title": "What is an API?",
                    "concept_summary": "An API is a defined way for two pieces of software to talk to each other.",
                    "beginner_explainer": "An API is like a restaurant menu: you don't need to know how the kitchen works, you just order from the menu (the API) and the kitchen (the server) hands back what you asked for.",
                    "content_md": "## REST basics\n- `GET` — fetch data\n- `POST` — create data\n- `PUT/PATCH` — update data\n- `DELETE` — remove data\n\nEach endpoint (URL) represents a resource, e.g. `/users/42`.",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {"lesson_index": 0, "prompt": "Which HTTP method is used to create a new resource?", "type": "mcq", "options": ["POST", "GET", "DELETE"], "answer_key": {"value": "POST"}, "est_minutes": 10},
            ],
            "projects": [
                {
                    "title": "Build a weather lookup app using a public API",
                    "teaches": "calling a real external API, handling responses, and displaying results to a user",
                    "prerequisites": ["JavaScript basics", "What is an API"],
                    "expected_output": "A small app where a user types a city name and sees current weather, fetched from a public weather API.",
                    "steps": [
                        "Sign up for a free API key from a public weather API.",
                        "Write a function that fetches weather data for a given city.",
                        "Handle the loading state while the request is in flight.",
                        "Handle errors (city not found, network failure) gracefully.",
                        "Display the result in a clean card layout.",
                    ],
                    "hints": [
                        "Never commit your API key to a public GitHub repo — use an environment variable.",
                        "Always handle the 'city not found' case explicitly instead of showing a blank screen.",
                    ],
                    "common_mistakes": [
                        "No error handling, so a bad request just breaks the page silently.",
                        "Hardcoding the API key directly in the frontend code and pushing it to GitHub.",
                    ],
                    "difficulty": 2,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Backend & APIs",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "An API endpoint typically represents...", "options": ["A resource you can act on", "A CSS file", "A font"], "correct_option": "A resource you can act on"},
                ],
            },
        },
        {
            "title": "Phase 5 — Databases & SQL",
            "summary": "How applications persist data, and how to query it with SQL.",
            "skill_key": "databases",
            "lessons": [
                {
                    "title": "SQL fundamentals: SELECT, WHERE, JOIN",
                    "concept_summary": "SQL is the standard language for querying relational databases.",
                    "beginner_explainer": "A database is like a set of very organized spreadsheets. SQL is the language you use to ask questions of those spreadsheets, like 'show me every customer who ordered last month.'",
                    "content_md": "## Example\n```sql\nSELECT name, email FROM users WHERE plan = 'pro';\n```",
                    "est_minutes": 20,
                },
            ],
            "exercises": [
                {"lesson_index": 0, "prompt": "Which SQL clause filters rows based on a condition?", "type": "mcq", "options": ["WHERE", "SELECT", "FROM"], "answer_key": {"value": "WHERE"}, "est_minutes": 10},
            ],
            "projects": [
                {
                    "title": "Build a REST API for a simple blog",
                    "teaches": "connecting a backend API to a real database with full CRUD operations",
                    "prerequisites": ["Backend & APIs", "SQL fundamentals"],
                    "expected_output": "A REST API with endpoints to create, read, update, and delete blog posts, backed by a real database (SQLite is fine).",
                    "steps": [
                        "Design a simple `posts` table (id, title, body, created_at).",
                        "Build GET /posts and GET /posts/:id endpoints.",
                        "Build POST /posts to create a new post.",
                        "Build PUT /posts/:id and DELETE /posts/:id.",
                        "Add basic input validation (e.g. title can't be empty).",
                    ],
                    "hints": [
                        "Start with SQLite — no server setup required, and it's a real, production-grade database.",
                        "Test every endpoint with a tool like curl or Postman before considering it done.",
                    ],
                    "common_mistakes": [
                        "No input validation, allowing empty or malformed posts.",
                        "Returning raw database errors to the client instead of clean error messages.",
                    ],
                    "difficulty": 3,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Databases & SQL",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What does CRUD stand for?", "options": ["Create, Read, Update, Delete", "Copy, Run, Undo, Debug", "Connect, Retrieve, Upload, Download"], "correct_option": "Create, Read, Update, Delete"},
                ],
            },
        },
        {
            "title": "Phase 6 — Testing & Debugging",
            "summary": "How to systematically find bugs and prove your code works.",
            "skill_key": "testing_debugging",
            "lessons": [
                {
                    "title": "Debugging like an engineer, not by guessing",
                    "concept_summary": "Systematic debugging beats randomly changing code and hoping.",
                    "beginner_explainer": "Debugging is detective work: form a hypothesis about what's wrong, test it with evidence (print statements, a debugger), and narrow down the actual cause instead of guessing.",
                    "content_md": "## A simple process\n1. Reproduce the bug reliably\n2. Isolate the smallest case that shows it\n3. Form a hypothesis\n4. Test the hypothesis\n5. Fix, then verify the fix didn't break anything else",
                    "est_minutes": 15,
                },
            ],
            "exercises": [
                {"lesson_index": 0, "prompt": "What's the first step in systematic debugging?", "type": "mcq", "options": ["Reproduce the bug reliably", "Rewrite the whole file", "Ask a coworker to fix it"], "answer_key": {"value": "Reproduce the bug reliably"}, "est_minutes": 10},
            ],
            "quiz": {
                "title": "Checkpoint: Testing & Debugging",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "Why write automated tests?", "options": ["To catch regressions automatically as code changes", "To make the code run faster", "Tests are optional and rarely useful"], "correct_option": "To catch regressions automatically as code changes"},
                ],
            },
        },
        {
            "title": "Phase 7 — Portfolio",
            "summary": "Package your projects into a portfolio that demonstrates real, job-ready skill.",
            "skill_key": "portfolio_se",
            "lessons": [
                {
                    "title": "What makes a developer portfolio project stand out",
                    "concept_summary": "Depth and clear write-ups beat quantity — one well-documented full project beats five half-finished ones.",
                    "beginner_explainer": "Reviewers spend seconds per project. A clear README explaining the problem, your approach, and what you'd improve does more work than the code itself.",
                    "content_md": "Use the Portfolio Builder to generate a first draft of your README, CV bullet, and LinkedIn post for each completed project, then personalize it with specifics.",
                    "est_minutes": 15,
                },
            ],
            "projects": [
                {
                    "title": "Build a full-stack task manager (capstone)",
                    "teaches": "tying frontend, backend, and database together into one complete, deployable application",
                    "prerequisites": ["Web Fundamentals", "Backend & APIs", "Databases & SQL"],
                    "expected_output": "A deployed, full-stack task manager where a user can create, complete, and delete tasks, with data persisted in a real database.",
                    "steps": [
                        "Design your data model (tasks table) and API endpoints.",
                        "Build the backend CRUD API.",
                        "Build a frontend that consumes the API (not just local state this time).",
                        "Add basic error handling and loading states throughout.",
                        "Deploy it somewhere reachable by a URL (a free-tier host is fine) and write a full README.",
                    ],
                    "hints": [
                        "Build and test the backend API fully before starting the frontend — it's much easier to debug one layer at a time.",
                        "A free-tier deployment (e.g. Render, Railway, Vercel) is enough — polish matters more than infrastructure here.",
                    ],
                    "common_mistakes": [
                        "Skipping deployment and only running it locally — a live link matters a lot to reviewers.",
                        "No error handling for failed API calls in the frontend.",
                    ],
                    "difficulty": 4,
                }
            ],
            "quiz": {
                "title": "Checkpoint: Portfolio",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "What matters most in a strong portfolio project?", "options": ["Depth and a clear write-up", "The number of projects", "Using the newest framework"], "correct_option": "Depth and a clear write-up"},
                ],
            },
        },
        {
            "title": "Phase 8 — Job Preparation",
            "summary": "Mock interviews, resume polish, and coding practice to get you ready to apply with confidence.",
            "skill_key": "job_prep_se",
            "lessons": [
                {
                    "title": "How entry-level engineering interviews actually go",
                    "concept_summary": "Expect a mix of fundamentals questions, a small coding exercise, and questions about your projects.",
                    "beginner_explainer": "Interviewers are mostly checking that you can reason clearly and communicate your thinking, not that you've memorized every algorithm.",
                    "content_md": "## Practice with your AI Mentor\nUse the AI Mentor's mock interview mode to rehearse common fundamentals questions and walk through your capstone project out loud.",
                    "est_minutes": 15,
                },
            ],
            "quiz": {
                "title": "Checkpoint: Job Preparation",
                "passing_score": 70,
                "questions": [
                    {"id": "q1", "prompt": "Interviewers mainly want to see...", "options": ["How you reason through a problem", "That you've memorized every algorithm", "Your exact GPA"], "correct_option": "How you reason through a problem"},
                ],
            },
        },
    ],
}
