"""Prepared guidance for the AI Mentor's limited mode (no live model).

Everything here is general, technically accurate teaching content. It is
used only when no live AI model is switched on, and the mentor says so.
It never contains information about a particular learner: progress, projects
and skills come from the database at request time, not from this file.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Topic:
    key: str
    title: str
    pattern: str  # regex, matched against the lowercased message
    analogy: str  # beginner framing
    technical: str  # precise framing
    example: str  # a concrete example, command or snippet
    mistake: str  # the most common misunderstanding or error
    practice: str  # a small exercise the learner can do now
    interview_q: str
    follow_ups: tuple[str, ...] = field(default_factory=tuple)

    def matches(self, text: str) -> bool:
        return re.search(self.pattern, text) is not None


TOPICS: tuple[Topic, ...] = (
    Topic(
        "dns", "DNS", r"\bdns\b|domain name system|nameserver|name server",
        "DNS is the internet's phonebook. You know a name like example.com, and DNS looks up the numeric address your computer needs to reach it.",
        "DNS resolves names to records. An A record maps a name to an IPv4 address, AAAA to IPv6, CNAME aliases one name to another, MX says where mail goes, TXT holds text such as SPF. Resolvers cache answers for the record's TTL.",
        "Try `nslookup example.com` or `dig example.com A` and read the ANSWER section. Then run `dig example.com MX` and notice it returns different records for the same name.",
        "Assuming a DNS change is instant. Old answers stay cached until the TTL runs out, so a fix can look broken for minutes or hours.",
        "Look up the A and MX records for a domain you use and write down what each one is for.",
        "A user says a site works on mobile data but not on office wifi. How would you use DNS tools to narrow it down?",
        ("How does caching and TTL change when a DNS fix shows up?", "What is the difference between an A record and a CNAME?"),
    ),
    Topic(
        "http", "HTTP and HTTPS", r"\bhttps?\b|status code|\b404\b|\b500\b|request and response|get vs post|get and post",
        "HTTP is the conversation a browser has with a server: the browser asks for something (a request) and the server answers (a response). HTTPS is the same conversation inside a locked, private tunnel.",
        "HTTP is a stateless request and response protocol. A request has a method (GET reads, POST creates, PUT or PATCH changes, DELETE removes), headers and sometimes a body. Responses carry a status code: 2xx success, 3xx redirect, 4xx the client's mistake, 5xx the server's failure. HTTPS wraps it in TLS.",
        "Run `curl -i https://example.com` to see the status line and headers, then `curl -i https://example.com/missing` to see a 404.",
        "Treating a 4xx and a 5xx the same. A 404 or 401 means fix the request. A 500 means look at the server logs.",
        "Use curl or your browser's Network tab to find the status code and one response header for a page you visit daily.",
        "What is the difference between GET and POST, and why does it matter for security?",
        ("What do the 2xx, 4xx and 5xx ranges tell you?", "What does TLS add on top of HTTP?"),
    ),
    Topic(
        "api", "APIs and REST", r"\bapis?\b|\brest\b|restful|endpoint|\bjson\b",
        "An API is a menu a program offers to other programs. You ask for item 12 in the agreed format, and you get back exactly what the menu promised.",
        "A REST API exposes resources at URLs and uses HTTP methods on them: GET /users/12 reads, POST /users creates. Data usually travels as JSON. Good APIs are consistent about status codes, errors, pagination and authentication.",
        "```\ncurl -s https://api.github.com/users/octocat\n```\nThe JSON that comes back is the response. Change the username and see the same shape with different data.",
        "Returning 200 for everything, including errors, so clients can't tell what went wrong.",
        "Call a public API with curl, then write a Python script with the requests library that prints one field from the JSON.",
        "How would you design the endpoints for a to-do list app, and what status codes would each return?",
        ("How would I add authentication to an API?", "What is pagination and why do APIs need it?"),
    ),
    Topic(
        "ip", "IP addresses and subnets", r"\bip address|\bsubnet|cidr|\bipv4\b|\bipv6\b|netmask|/24\b|private ip",
        "An IP address is a street address for a device on a network. A subnet is a neighbourhood: devices in the same one can talk directly.",
        "IPv4 addresses are 32 bits. CIDR notation such as 192.168.1.0/24 means the first 24 bits identify the network, leaving 8 bits (254 usable hosts) for devices. 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 are private ranges that are not routed on the public internet.",
        "192.168.1.0/24 covers 192.168.1.1 to 192.168.1.254. A /25 would split that in half: 126 usable hosts each.",
        "Forgetting that the first address (network) and last (broadcast) in a subnet are not usable for hosts.",
        "Work out how many usable hosts a /26 has, then check with `python3 -c \"import ipaddress as i; print(i.ip_network('10.0.0.0/26').num_addresses)\"`.",
        "How many usable hosts are in a /27, and how did you get there?",
        ("How does NAT let many devices share one public IP?", "What is the difference between a public and private IP?"),
    ),
    Topic(
        "tcp", "TCP and UDP", r"\btcp\b|\budp\b|handshake|three.way|osi model|tcp/ip",
        "TCP is registered post: it confirms every page arrived, in order. UDP is a postcard: fast, no confirmation, fine for things like live video where a late packet is useless anyway.",
        "TCP is connection oriented: a three way handshake (SYN, SYN-ACK, ACK), sequence numbers, retransmission and flow control. UDP is connectionless with no delivery guarantee. DNS queries and streaming commonly use UDP, web and email use TCP.",
        "Run `nc -vz example.com 443` to open a TCP connection to port 443 and see whether it succeeds.",
        "Thinking UDP is 'bad'. It is a deliberate trade of reliability for speed and low overhead.",
        "Capture a page load in Wireshark and find the SYN, SYN-ACK and ACK at the start.",
        "Why does DNS usually use UDP, and when does it fall back to TCP?",
        ("What happens if a TCP packet is lost?", "Which port numbers should I know first?"),
    ),
    Topic(
        "firewall", "Firewalls", r"firewall|security group|\bacl\b|allow list|allowlist|iptables|ufw",
        "A firewall is a doorman with a list. Traffic that matches the list gets in or out, everything else is turned away.",
        "A firewall filters traffic by rules on source, destination, port and protocol, and may track connection state. Good practice is default deny: block everything, then allow only what is needed. Cloud security groups work the same way and are stateful.",
        "```\nsudo ufw default deny incoming\nsudo ufw allow 22/tcp\nsudo ufw enable\n```\nThis blocks everything inbound except SSH.",
        "Opening a port to 0.0.0.0/0 'just to test' and never closing it again.",
        "Write the rules for a web server that should accept HTTPS from anywhere but SSH only from your office address.",
        "How would you decide whether a firewall rule is too permissive?",
        ("What is the difference between stateful and stateless filtering?", "How does a security group differ from a network ACL?"),
    ),
    Topic(
        "crypto", "Hashing, encryption and passwords", r"\bhash(ing|es)?\b|encrypt|decrypt|bcrypt|salt|password storage|symmetric|asymmetric|public key",
        "Encryption is a locked box you can open again with a key. Hashing is a blender: you can't turn the smoothie back into fruit, but the same fruit always gives the same smoothie, so you can check a match.",
        "Hashing is one way and is what you use for passwords, with a slow salted algorithm such as bcrypt, scrypt or Argon2. Encryption is two way: symmetric (AES, one shared key) is fast, asymmetric (RSA, elliptic curves) uses a public and a private key and is used to exchange keys and sign data.",
        "```python\nimport bcrypt\nh = bcrypt.hashpw(b'secret', bcrypt.gensalt())\nbcrypt.checkpw(b'secret', h)  # True\n```",
        "Storing passwords with a fast hash like plain SHA-256, or 'encrypting' them so they can be decrypted. Passwords should be hashed with a slow, salted algorithm.",
        "Hash the same password twice with bcrypt and compare the two outputs. Explain why they differ and still both verify.",
        "Explain the difference between symmetric and asymmetric encryption and give one use of each.",
        ("Why is a salt needed?", "How does HTTPS combine symmetric and asymmetric encryption?"),
    ),
    Topic(
        "auth", "Authentication and authorization", r"authenticat|authoriz|\bjwt\b|oauth|\bsso\b|\bsession\b|\btoken\b|\blogin\b.*(work|flow)|\bmfa\b|2fa",
        "Authentication is showing your ID at the door: proving who you are. Authorization is the guest list: what you are allowed to do once inside.",
        "Authentication verifies identity (password, MFA, SSO). Authorization decides permissions (roles, scopes). A JWT is a signed token carrying claims, so a server can trust it without a database lookup. OAuth 2.0 delegates authorization so an app can act on your behalf without your password.",
        "Decode a JWT at jwt.io and read the header, payload and signature. The payload is only encoded, not encrypted, so never put secrets in it.",
        "Checking permissions only in the frontend. The server must enforce authorization on every request.",
        "Sketch the login flow for a small app: where is the password checked, what is issued, and how is it checked on the next request?",
        "What is the difference between authentication and authorization? Give an example where one passes and the other fails.",
        ("How is a session cookie different from a JWT?", "What does MFA protect against?"),
    ),
    Topic(
        "xss", "XSS and CSRF", r"\bxss\b|cross.site scripting|\bcsrf\b|cross.site request",
        "XSS is someone slipping their own script into a page you trust, so it runs as if the site wrote it. CSRF tricks your logged-in browser into sending a request you never meant to make.",
        "XSS happens when untrusted input is rendered as HTML or script. Defend by output encoding, using framework escaping, a Content Security Policy and HttpOnly cookies. CSRF abuses automatically attached cookies. Defend with SameSite cookies and anti-CSRF tokens.",
        "A comment box that prints `<script>alert(1)</script>` as real HTML is the classic XSS test. Safe frameworks print it as text.",
        "Believing input validation alone stops XSS. Encoding at output is the primary defense.",
        "In a safe test app (such as OWASP Juice Shop), find where input is reflected and observe whether it is encoded.",
        "How would you explain the difference between stored and reflected XSS to a developer?",
        ("What does a Content Security Policy do?", "Why does SameSite on a cookie reduce CSRF?"),
    ),
    Topic(
        "sqli", "SQL injection", r"sql injection|sqli|parameteri[sz]ed|prepared statement",
        "SQL injection is when a form field is sneaky enough to be read as an instruction instead of as plain text.",
        "It happens when user input is concatenated into a query string. The fix is parameterized queries, where the database receives the SQL and the values separately, so input can never change the query's structure. Least privilege database accounts limit the damage.",
        "Unsafe: `\"SELECT * FROM users WHERE name = '\" + name + \"'\"`\nSafe: `cursor.execute(\"SELECT * FROM users WHERE name = %s\", (name,))`",
        "Trying to fix it by blocking certain characters. Parameterization is the reliable fix, filtering is not.",
        "Rewrite a query that builds its string with + into a parameterized one in a language you know.",
        "A login form builds its query with string concatenation. What can go wrong, and how do you fix it?",
        ("What is a blind SQL injection?", "Why does least privilege help even with parameterized queries?"),
    ),
    Topic(
        "sql", "SQL and databases", r"\bsql\b|\bjoins?\b|inner join|left join|group by|primary key|foreign key|database|postgres|mysql|\bindex(es)?\b",
        "A database table is a spreadsheet with strict rules. SQL is how you ask it questions: which rows, which columns, combined with which other table.",
        "SQL is declarative: you describe the result, the engine plans how to get it. An INNER JOIN keeps only matching rows from both tables, a LEFT JOIN keeps every row from the left table and fills gaps with NULL. GROUP BY aggregates rows, indexes speed up lookups at the cost of slower writes.",
        "```sql\nSELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.name;\n```\nCustomers with no orders still appear, with a count of 0.",
        "Using an INNER JOIN and then wondering why some rows vanished. Use a LEFT JOIN when you need to keep unmatched rows.",
        "Create two small tables in SQLite and write one INNER JOIN and one LEFT JOIN. Compare the row counts.",
        "Explain the difference between INNER JOIN and LEFT JOIN with an example.",
        ("When should I add an index?", "What does a foreign key enforce?"),
    ),
    Topic(
        "git", "Git", r"\bgit\b|\bgithub\b|\bcommit\b|\bbranch(es)?\b|\bmerge\b|rebase|pull request",
        "Git is a save system for your project that remembers every save, lets you try risky ideas on a separate copy, and lets teammates combine their work.",
        "Git stores snapshots as commits in a graph. A branch is a movable pointer to a commit. `merge` joins histories with a merge commit, `rebase` replays your commits on top of another branch for a linear history. Never rebase commits others have already pulled.",
        "```\ngit switch -c fix-login\ngit add -p\ngit commit -m \"Fix login redirect\"\ngit push -u origin fix-login\n```\nThen open a pull request on GitHub.",
        "Committing secrets or large files. Once pushed they live in history, so rotate the secret, don't just delete the file.",
        "Create a repo, make a branch, commit twice, and merge it back. Use `git log --oneline --graph` to see the shape.",
        "When would you choose rebase over merge, and what is the danger?",
        ("How do I undo my last commit?", "How do I resolve a merge conflict?"),
    ),
    Topic(
        "python", "Python basics", r"\bpython\b|\blist comprehension|\bdictionar(y|ies)\b|\bfor loop|\bwhile loop|\bdef \b|virtualenv|\bvenv\b|\bpip\b",
        "Python reads close to plain English: you store values in names, group them in lists and dictionaries, and repeat or decide with loops and ifs.",
        "Lists are ordered and mutable, dictionaries map keys to values with O(1) average lookup, tuples are immutable. Functions take arguments and return values. Use a virtual environment per project so dependencies don't collide.",
        "```python\nscores = {\"ana\": 82, \"ben\": 67}\npassed = [n for n, s in scores.items() if s >= 70]\nprint(passed)  # ['ana']\n```",
        "Mutating a list while looping over it, or using a mutable default argument like `def f(x=[])`.",
        "Write a function that takes a list of numbers and returns the ones above the average.",
        "Explain the difference between a list and a tuple, and when you'd use each.",
        ("What is a virtual environment for?", "How do I read a file line by line?"),
    ),
    Topic(
        "javascript", "JavaScript and async code", r"javascript|\bjs\b|promise|async|await|callback|event loop|\bnode\b",
        "JavaScript can start a slow job, like fetching data, and carry on with other work. A promise is the receipt that says 'your result will be ready later'.",
        "JavaScript is single threaded with an event loop. Async operations return promises. `await` pauses only the current async function until the promise settles, and `try/catch` handles rejections. `Promise.all` runs independent promises in parallel.",
        "```js\nasync function load() {\n  try {\n    const r = await fetch('/api/items');\n    if (!r.ok) throw new Error(r.status);\n    return await r.json();\n  } catch (e) { console.error(e); }\n}\n```",
        "Forgetting `await`, so you work with a pending promise instead of the data. Also forgetting that fetch does not reject on a 404.",
        "Fetch two URLs, first one after the other with await, then together with Promise.all, and compare the time taken.",
        "What does await actually do, and how does it differ from blocking the thread?",
        ("What is the event loop?", "How do I handle errors from fetch properly?"),
    ),
    Topic(
        "linux", "Linux and the command line", r"\blinux\b|\bbash\b|command line|terminal|chmod|chown|permissions|\bgrep\b|\bsudo\b|\bssh\b",
        "The terminal is a text conversation with your computer. Instead of clicking, you type short commands and read the answer.",
        "Everything is a file with an owner, a group and permission bits for read, write and execute. `chmod 640 file` gives the owner read and write, the group read, others nothing. Pipes (`|`) send one command's output to the next, so small tools combine.",
        "```\nls -l\ngrep -i error app.log | sort | uniq -c | sort -nr | head\n```\nThat counts the most frequent error lines in a log.",
        "Running `chmod 777` to make a problem go away. It makes the file writable by everyone, so find the real owner or permission problem instead.",
        "Take a log file and find the five most common lines using only grep, sort and uniq.",
        "A script fails with 'Permission denied'. List the things you would check.",
        ("What do the numbers in chmod mean?", "How does SSH key authentication work?"),
    ),
    Topic(
        "docker", "Docker and containers", r"docker|container|dockerfile|image|kubernetes|\bk8s\b|compose",
        "A container is a lunchbox for your app: the app and everything it needs packed together, so it runs the same on any machine.",
        "A container is an isolated process sharing the host kernel, built from an image made of layers. A Dockerfile describes how to build it. Containers are ephemeral: data you want to keep goes in a volume. Compose runs several containers together, Kubernetes schedules them across machines.",
        "```\nFROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"python\", \"app.py\"]\n```",
        "Putting secrets in the image or running as root. Pass secrets at runtime and use a non-root user.",
        "Containerize a tiny script, run it, then change the code and notice which layers rebuild.",
        "What is the difference between a container and a virtual machine?",
        ("Why does the order of lines in a Dockerfile matter?", "How do containers keep data?"),
    ),
    Topic(
        "cloud", "Cloud and IAM", r"\baws\b|\bazure\b|\bgcp\b|\bcloud\b|\biam\b|least privilege|s3 bucket|\bvpc\b|\bec2\b",
        "The cloud is renting computers, storage and networks by the hour instead of buying them. IAM is the keycard system that decides who can open which door.",
        "Cloud providers expose compute, storage, networking and identity as services. IAM grants identities (users, roles) permissions through policies. Least privilege means giving only the actions and resources a job needs. Under the shared responsibility model the provider secures the platform and you secure your configuration and data.",
        "An IAM policy that allows `s3:GetObject` on one bucket is better than `s3:*` on `*`. The first limits what a leaked key can do.",
        "Making a storage bucket public for convenience. Misconfigured public buckets are one of the most common causes of data leaks.",
        "In a free tier account, create a role that can only read one bucket, and test that it cannot write.",
        "What is the shared responsibility model, and where does it commonly go wrong?",
        ("What is the difference between a user and a role?", "How would I audit who has access to a bucket?"),
    ),
    Topic(
        "cicd", "CI/CD", r"ci/cd|\bci\b|continuous integration|continuous delivery|continuous deployment|github actions|pipeline|jenkins",
        "CI/CD is an assembly line for code: each change is automatically built, tested and, when it passes, shipped, instead of someone doing it by hand.",
        "Continuous integration runs build and tests on every change so breakage shows up within minutes. Continuous delivery keeps the main branch always releasable, continuous deployment releases automatically. Keep pipelines fast, deterministic and keep secrets in the platform's secret store.",
        "```yaml\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: pip install -r requirements.txt && pytest\n```",
        "Letting the pipeline become slow and flaky until people ignore red builds.",
        "Add a GitHub Actions workflow to a repo that runs your tests on every push.",
        "What makes a CI pipeline trustworthy, and what makes people stop trusting it?",
        ("What is the difference between delivery and deployment?", "How do I keep secrets out of the pipeline logs?"),
    ),
    Topic(
        "react", "React and state", r"\breact\b|usestate|useeffect|\bhooks?\b|\bprops?\b|component|\bjsx\b|next\.?js",
        "A React component is a reusable piece of screen. State is the component's memory: when it changes, React redraws the piece that depends on it.",
        "Components are functions of props and state. `useState` holds local state, updates are asynchronous and must not mutate the old value. `useEffect` runs side effects after render and re-runs when its dependency array changes. Lift state up to the nearest common parent when siblings need it.",
        "```jsx\nfunction Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>{n}</button>;\n}\n```",
        "Mutating state directly (`items.push(x)`) or leaving out useEffect dependencies, which gives stale data or infinite loops.",
        "Build a to-do list where adding and removing items updates the screen, with the list held in one useState.",
        "Why can a useEffect with a missing dependency show stale data?",
        ("When should I use useEffect and when not?", "How do I share state between two components?"),
    ),
    Topic(
        "css", "CSS layout", r"\bcss\b|flexbox|\bflex\b|\bgrid\b|responsive|media quer|tailwind|center a div",
        "CSS is the styling layer: it says where things sit, how big they are and what they look like. Flexbox lines items up in a row or a column. Grid builds rows and columns together.",
        "Flexbox is one dimensional, with `justify-content` along the main axis and `align-items` across it. Grid is two dimensional. Design mobile first and add `@media (min-width: ...)` rules as the screen grows.",
        "```css\n.card-row { display: flex; gap: 1rem; flex-wrap: wrap; }\n.card { flex: 1 1 240px; }\n```\nThe cards sit in a row and wrap on small screens.",
        "Fixing widths in pixels, which breaks on phones. Prefer flexible units and max-width.",
        "Build a three card row that becomes a single column under 600px.",
        "How do you make a layout work on both a phone and a desktop?",
        ("When should I use grid instead of flexbox?", "What does mobile first mean?"),
    ),
    Topic(
        "data", "Data analysis and cleaning", r"pandas|dataframe|data clean|missing values|\bnull\b values|\bexcel\b|pivot|data analysis|power bi|tableau|\bcsv\b",
        "Data analysis is asking questions of messy tables. Most of the work is cleaning: fixing blanks, duplicates and inconsistent labels so the answer can be trusted.",
        "Typical flow: load, inspect (shape, dtypes, nulls), clean (drop or impute, fix types, deduplicate), transform (group, join, pivot), then visualize and state a conclusion with its caveats. Always check how many rows each step removes.",
        "```python\nimport pandas as pd\ndf = pd.read_csv('sales.csv')\nprint(df.isna().sum())\ndf = df.drop_duplicates()\nprint(df.groupby('region')['revenue'].sum().sort_values(ascending=False))\n```",
        "Dropping rows with missing values without asking why they are missing, which can bias the result.",
        "Take a public CSV, list the columns with missing values, and decide for each whether to drop, fill or leave it, with a reason.",
        "You find 12% of a column is missing. How do you decide what to do?",
        ("What is the difference between a join and a concat?", "How do I pick a chart for my result?"),
    ),
    Topic(
        "ml", "Machine learning basics", r"machine learning|\bml\b|overfit|underfit|train(ing)? set|test set|neural network|\bmodel\b.*(train|accuracy)|classification|regression",
        "A machine learning model learns patterns from examples instead of following hand written rules. The danger is memorizing the examples instead of learning the pattern.",
        "You split data into train, validation and test sets. Overfitting is high training performance with poor performance on unseen data. Counter it with more data, simpler models, regularization and cross validation. Pick metrics that fit the problem: accuracy misleads on imbalanced classes, so use precision, recall or F1.",
        "A model that is 99% accurate on a dataset where 99% of rows are one class may be doing nothing useful. Check the confusion matrix.",
        "Evaluating on the same data you trained on, or letting test data leak into feature building.",
        "Train a simple model on a small dataset, then compare training and test scores to see overfitting for yourself.",
        "How do you know a model is overfitting, and what would you do about it?",
        ("What is the difference between precision and recall?", "What is data leakage?"),
    ),
    Topic(
        "ux", "UX research and design", r"\bux\b|\bui\b|user research|usability|wireframe|figma|prototype|design system|persona|user interview",
        "UX design is making something easy and pleasant for the real person using it. You find out what they need by watching and asking, not by guessing.",
        "A common loop is research (interviews, observation), define (the problem and who has it), ideate and prototype, then test with users and iterate. Usability testing with five users finds most major problems. Interviews should ask about past behaviour, not hypothetical opinions.",
        "Instead of 'Would you use a budgeting app?', ask 'Tell me about the last time you tracked your spending.' The second gives facts.",
        "Designing for yourself and asking leading questions that confirm what you already believe.",
        "Interview two people about how they do something you want to improve, and write down three observations before any solution.",
        "How would you test whether a checkout flow is confusing?",
        ("How do I write good interview questions?", "What belongs in a case study?"),
    ),
)


# --------------------------------------------------------------------------
# Common errors: causes and what to check, so troubleshooting answers can be
# specific. Matched against the learner's pasted error text.
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class ErrorPattern:
    key: str
    pattern: str
    meaning: str
    causes: tuple[str, ...]
    checks: tuple[str, ...]


ERRORS: tuple[ErrorPattern, ...] = (
    ErrorPattern("module", r"modulenotfounderror|no module named|cannot find module|importerror",
        "Python or Node cannot find a package you imported.",
        ("The package is not installed in the environment you are running.", "You installed it in one Python and run another (system versus a virtual environment).", "The import name differs from the install name (for example `pip install pillow` but `import PIL`)."),
        ("`which python` and `python -m pip list` to see which environment is active.", "Install with `python -m pip install <name>` so pip matches the interpreter.", "In Node, check `node_modules` and that the name is in package.json.")),
    ErrorPattern("permission", r"permission denied|eacces|operation not permitted|publickey",
        "The system refused the action for the current user.",
        ("The file or folder is owned by another user or lacks the needed permission bit.", "A script is missing the execute bit.", "For SSH, the wrong key or a key file with permissions that are too open."),
        ("`ls -l <path>` to see owner and permissions.", "`chmod +x script.sh` for scripts. For SSH keys use `chmod 600 ~/.ssh/id_ed25519`.", "`ssh -v host` prints which keys are tried.")),
    ErrorPattern("notfound_cmd", r"command not found",
        "The shell cannot find a program by that name.",
        ("The program isn't installed.", "It is installed but not on your PATH.", "A typo in the name."),
        ("`which <name>` or `type <name>`.", "`echo $PATH` and check the install directory is listed.", "Reopen the terminal after installing so PATH reloads.")),
    ErrorPattern("cors", r"\bcors\b|access-control-allow-origin|cross-origin",
        "The browser blocked a request to a different origin because the server did not say it was allowed.",
        ("The API does not send an `Access-Control-Allow-Origin` header for your site's origin.", "A preflight (OPTIONS) request is rejected.", "The API origin and the page use different schemes, hosts or ports."),
        ("Open the Network tab and check the response headers of the failed request and its OPTIONS preflight.", "Allow your exact frontend origin on the server, not `*` when you use cookies.", "Remember CORS is enforced by the browser, so curl will succeed even when the browser fails.")),
    ErrorPattern("refused", r"connection refused|econnrefused|connect: connection|failed to connect",
        "Nothing is accepting connections at that address and port.",
        ("The server process isn't running.", "It listens on a different port or only on localhost.", "Inside Docker, `localhost` means the container itself, not your machine."),
        ("`lsof -i :<port>` or `ss -ltnp` to see what is listening.", "Check the URL host and port in your config.", "Start the service and read its startup log for the bound address.")),
    ErrorPattern("port_in_use", r"address already in use|eaddrinuse|port .* (already )?in use",
        "Another process already holds that port.",
        ("A previous run of your server is still alive.", "Another application uses the same port."),
        ("`lsof -i :<port>` to find the process id, then stop it, or choose another port.",)),
    ErrorPattern("auth_http", r"\b401\b|\b403\b|unauthori[sz]ed|forbidden|invalid token|jwt expired",
        "The server rejected the request: 401 means it doesn't know who you are, 403 means it knows but you aren't allowed.",
        ("The token or key is missing, expired or sent in the wrong header.", "The account lacks the needed role or scope.", "You are hitting a different environment than the one the token belongs to."),
        ("Print the exact request headers you send.", "Check expiry of the token and the `Authorization: Bearer <token>` format.", "Compare with a request that works, for example from curl.")),
    ErrorPattern("http404", r"\b404\b|not found",
        "The server has no route or resource at that URL.",
        ("A typo or wrong base path.", "The route exists only for a different method.", "The resource was never created or was deleted."),
        ("Compare the URL character by character with the route definition.", "Check the HTTP method.", "List the routes the framework registered.")),
    ErrorPattern("http500", r"\b500\b|internal server error|\b502\b|\b503\b",
        "The server failed while handling a valid-looking request.",
        ("An unhandled exception in the server code.", "A dependency such as the database is unreachable.", "Bad configuration in this environment."),
        ("Read the server logs at the time of the request, the stack trace names the line.", "Reproduce with the same input locally.", "Check that environment variables and the database connection are set.")),
    ErrorPattern("js_undefined", r"cannot read propert|is not a function|undefined is not|of undefined|of null|typeerror",
        "Your code used a value that was undefined or null, or the wrong type.",
        ("Data hasn't loaded yet when the code runs.", "A property name is misspelled or nested differently.", "A function was called on the wrong kind of value."),
        ("`console.log` the object just before the failing line.", "Use optional chaining (`user?.name`) for data that may be missing.", "Check that async data has resolved before you use it.")),
    ErrorPattern("py_key", r"keyerror|indexerror|nameerror|attributeerror|valueerror|zerodivision",
        "Python raised an exception because a key, index, name or value was not what the code expected.",
        ("A dictionary key or list index doesn't exist.", "A variable is used before assignment or misspelled.", "A function got a value of the right type but wrong content."),
        ("Read the last line of the traceback and the line number above it.", "Print the variable and its type just before that line.", "Use `dict.get(key)` or check `len(list)` where missing values are normal.")),
    ErrorPattern("syntax", r"syntaxerror|unexpected token|unexpected eof|parse error|indentationerror",
        "The language couldn't parse your code, so it never ran.",
        ("A missing bracket, quote, colon or comma.", "Mixed tabs and spaces in Python.", "Code copied with smart quotes or stray characters."),
        ("Look at the line before the one reported, the real mistake is often just above it.", "Let your editor's linter highlight unmatched brackets.", "In Python, use four spaces consistently.")),
    ErrorPattern("git_push", r"non-fast-forward|failed to push|updates were rejected|rejected\b.*(push|main|master)",
        "The remote branch has commits that you don't have, so Git refuses to overwrite them.",
        ("A teammate or another machine pushed first.", "You rewrote local history after pushing."),
        ("`git fetch` then `git status` to see how far you diverged.", "`git pull --rebase` to put your commits on top, then push.", "Never force push to a shared branch unless the team agrees.")),
    ErrorPattern("git_conflict", r"merge conflict|conflict \(content\)|<<<<<<<|automatic merge failed",
        "Two branches changed the same lines and Git can't choose.",
        ("Both sides edited the same part of the file.",),
        ("Open the file and find the `<<<<<<<`, `=======`, `>>>>>>>` markers.", "Keep the right combination, remove the markers, `git add` the file.", "Finish with `git commit` (merge) or `git rebase --continue`.")),
    ErrorPattern("timeout", r"timed out|timeout|etimedout|name or service not known|could not resolve|getaddrinfo",
        "A request didn't get an answer in time, or the name could not be resolved.",
        ("A firewall or security group blocks the port.", "DNS isn't resolving the host.", "The server is overloaded or down."),
        ("`nslookup <host>` to rule out DNS.", "`curl -v <url>` to see where it stalls.", "Check security group or firewall rules for the port.")),
)
