"""Real-world simulation scenarios — the 'make learning feel like actual
work' feature from the product spec. Each is keyed to a career path slug.
"""

SIMULATIONS = {
    "cybersecurity": [
        {
            "title": "SOC Triage: Which alert do you investigate first?",
            "scenario_md": (
                "You're a Tier 1 SOC analyst. Your SIEM has generated three alerts in the last 10 minutes:\n\n"
                "**A)** A single failed login for an admin account, from the admin's usual office IP.\n\n"
                "**B)** 400 failed login attempts against a single user account in 2 minutes, from an IP address "
                "in a country the company has no employees in.\n\n"
                "**C)** A file was renamed on a marketing team laptop at 2:15pm on a weekday."
            ),
            "options": [
                {"key": "a", "label": "Investigate Alert A first"},
                {"key": "b", "label": "Investigate Alert B first"},
                {"key": "c", "label": "Investigate Alert C first"},
            ],
            "correct_option": "b",
            "explanation_md": (
                "**Alert B** is the clear priority: a high-volume brute-force pattern from an unexpected "
                "geography is a strong signal of an active attack in progress. Alert A is routine (single "
                "failed login from the expected location — likely a typo). Alert C is mundane background "
                "activity with no inherent risk signal. Prioritizing by volume, anomaly, and business impact "
                "is the core SOC triage skill."
            ),
            "difficulty": 2,
        },
    ],
    "software-engineering": [
        {
            "title": "Debug: An API endpoint is returning 500 errors",
            "scenario_md": (
                "Your team's `/api/orders` endpoint started returning `500 Internal Server Error` for some "
                "requests after a deploy this morning. It works fine for most users but fails for anyone with "
                "an empty shopping cart. What's the most likely first step?"
            ),
            "options": [
                {"key": "a", "label": "Immediately roll back the deploy without investigating"},
                {"key": "b", "label": "Check the server logs for the stack trace around the failing requests"},
                {"key": "c", "label": "Tell affected users to clear their browser cache"},
            ],
            "correct_option": "b",
            "explanation_md": (
                "Checking the server-side logs/stack trace is the fastest way to find the actual failure point "
                "— in this case it's very likely the new code doesn't handle an empty cart (e.g. dividing by "
                "the number of items, or accessing index 0 of an empty list) and throws an unhandled exception. "
                "A rollback might be the right *next* step once you understand the cause, but investigating "
                "first prevents you from missing a quick, targeted fix. Clearing cache wouldn't affect a "
                "server-side error at all."
            ),
            "difficulty": 2,
        },
    ],
}
