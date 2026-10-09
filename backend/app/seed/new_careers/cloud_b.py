"""New careers, Cloud, Infrastructure & DevOps (batch B): Network Engineering and Database Administration."""

CAREERS = [
    dict(
        slug="network-engineering", name="Network Engineering",
        summary="Design, configure and troubleshoot the switches, routers, firewalls and links that connect offices, data centres and users, and automate the repetitive changes.",
        beginner_summary="You'll learn how data finds its way across a network: IP addressing, VLANs, routing, firewalls and VPNs, practised in free simulators before you touch real equipment.",
        difficulty=3, avg_timeline_weeks=30,
        entry_roles=["Junior Network Engineer", "Network Support Engineer", "NOC Technician", "Network Administrator (junior)"],
        tools=["Cisco Packet Tracer", "GNS3", "EVE-NG", "Wireshark", "Netmiko", "NAPALM", "Ansible", "Python"],
        remote_potential=45,
        earning_notes="Most people get in through a NOC, help desk or field support role and move up as they prove they can troubleshoot a live outage calmly. Pay tends to rise with CCNA-level knowledge, hands-on routing and firewall experience, and the ability to automate changes rather than type them on every device. Work on cabling, racks and site visits keeps remote potential lower than in pure software roles.",
        icon="network",
        skills_required=[
            "IP addressing and subnetting, including VLSM",
            "Switching: VLANs, trunking and spanning tree",
            "Routing with static routes, OSPF and the basics of BGP",
            "Securing a network with ACLs, NAT, firewalls and VPNs",
            "Troubleshooting layer by layer with CLI tools and packet captures",
            "Scripting repetitive device changes with Python or Ansible",
        ],
        certifications=["Cisco Certified Network Associate (CCNA)", "CompTIA Network+"],
        interview_prep=[
            "How many usable hosts are in a /27, and how would you split a /24 into subnets of different sizes for three departments",
            "Explain the difference between an access port and a trunk port, and what the native VLAN is for",
            "What does spanning tree protect against, and what happens on a switched network if it is missing",
            "Users at a branch can reach websites by IP address but not by name. Walk me through how you would find the cause",
            "A switch uplink keeps flapping and a whole floor reports a slow network. What do you check and in what order",
            "You need to change an ACL on a remote production router. How do you avoid locking yourself out",
        ],
        learning_resources=[
            {"label": "Jeremy's IT Lab CCNA course (YouTube)", "note": "A free, complete CCNA video course with labs you can follow in Packet Tracer."},
            {"label": "Professor Messer's CompTIA Network+ course", "note": "Free video lessons that map to the Network+ exam objectives."},
            {"label": "Wireshark documentation and sample captures wiki", "note": "The official user guide plus a library of downloadable captures to practise reading protocols."},
        ],
        roadmap_outline={
            "beginner": [
                "Learn how the layers fit together: Ethernet frames, IP packets, TCP and UDP, and what ARP, DNS and DHCP each do",
                "Practise binary conversion and subnetting until you can size a subnet in your head",
                "Install Cisco Packet Tracer and build a switched LAN with two VLANs",
                "Learn the router and switch command line: show commands, saving config and basic security",
                "Start CompTIA Network+ or CCNA study notes and keep a command cheat sheet",
            ],
            "intermediate": [
                "Configure inter-VLAN routing, trunks and EtherChannel, and read spanning tree output",
                "Configure static routing and single-area OSPF, and read the routing table",
                "Add DHCP, NAT overload and extended ACLs to a multi-router lab",
                "Capture traffic in Wireshark and follow a DNS lookup, a DHCP exchange and a TCP handshake",
                "Sit the CompTIA Network+ or CCNA exam once your labs feel routine",
            ],
            "advanced": [
                "Build a larger lab in GNS3 or EVE-NG with redundant links and watch the network reconverge when one fails",
                "Learn the basics of BGP: autonomous systems, neighbours and advertising a prefix",
                "Configure a site-to-site IPsec VPN and a wireless network with separate guest and staff SSIDs",
                "Learn Python with Netmiko to back up and audit device configs",
                "Use Ansible or NAPALM to push a change across several devices, with a dry run first",
            ],
        },
    ),
    dict(
        slug="database-administration", name="Database Administration",
        summary="Keep production databases fast, secure and recoverable: install and configure them, manage access, back up and restore, tune slow queries and plan upgrades.",
        beginner_summary="You'll learn to run a PostgreSQL database yourself: set it up, control who can do what, back it up, prove you can restore it and find out why a query is slow.",
        difficulty=3, avg_timeline_weeks=36,
        entry_roles=["Junior Database Administrator", "Database Support Analyst", "SQL Developer (junior)", "Data Support Engineer"],
        tools=["PostgreSQL", "MySQL", "Microsoft SQL Server", "pgAdmin", "pgBackRest", "pg_stat_statements", "Patroni", "Docker"],
        remote_potential=75,
        earning_notes="A DBA post is rarely a first job. Most people arrive from IT support, systems administration or SQL development, or start as a database support analyst and take on more responsibility as they earn trust with production data. Pay grows with proven backup and recovery skill, performance tuning results and breadth across more than one engine. Many companies now use managed databases, so the work shifts toward tuning, access control and recovery planning rather than patching servers.",
        icon="database",
        skills_required=[
            "Writing and reading SQL well enough to understand what an application is asking of the database",
            "Managing roles, privileges and authentication so each user has only the access they need",
            "Backing up, restoring and recovering to a point in time, and proving the restore works",
            "Reading query plans and choosing indexes that help without slowing writes",
            "Monitoring, routine maintenance and capacity planning (vacuum, statistics, disk, connections)",
            "Planning replication, failover and version upgrades with a rollback plan",
        ],
        certifications=["Microsoft Certified: Azure Database Administrator Associate (DP-300)", "Microsoft Certified: Azure Data Fundamentals (DP-900)"],
        interview_prep=[
            "Explain the difference between a logical backup with pg_dump and a physical backup with WAL archiving, and when you would use each",
            "What does MVCC do in PostgreSQL, and why does the database need vacuum",
            "A query does a sequential scan on a ten million row table and returns twelve rows. What do you check before you add an index",
            "A developer tells you at 14:40 that a table was dropped at 14:05. Walk me through the recovery",
            "The database disk is 95 percent full and growing. What do you look at, in order",
            "The application is timing out and pg_stat_activity shows many sessions waiting on locks or idle in transaction. What do you do",
        ],
        learning_resources=[
            {"label": "PostgreSQL official documentation", "note": "The server administration, backup and restore, and performance tips chapters are the core reading for this job."},
            {"label": "Use The Index, Luke", "note": "A free web book by Markus Winand explaining how SQL indexes work, with examples for several database engines."},
            {"label": "Microsoft Learn DP-300 study guide and learning paths", "note": "Free official material covering SQL Server and Azure SQL administration, useful as a comparison with PostgreSQL."},
        ],
        roadmap_outline={
            "beginner": [
                "Get solid with SQL: joins, grouping, subqueries and window functions on a sample database",
                "Learn relational design: keys, constraints, normalisation and why they protect data",
                "Learn transactions, ACID and isolation levels, and try two sessions interfering with each other",
                "Install PostgreSQL on Linux, learn psql and find the config files and data directory",
                "Create roles and grant only the privileges each role needs",
            ],
            "intermediate": [
                "Take a pg_dump backup and restore it into a fresh database, then check row counts",
                "Read EXPLAIN ANALYZE output and fix a slow query with a B-tree index",
                "Learn how autovacuum, dead rows and table statistics affect performance",
                "Turn on pg_stat_statements and rank queries by total time",
                "Install MySQL and SQL Server Express and compare how each handles users, backups and indexes",
            ],
            "advanced": [
                "Set up WAL archiving and recover a database to a chosen point in time",
                "Build a streaming replica, then fail over to it and rebuild the old primary",
                "Rehearse a major version upgrade with pg_upgrade or dump and restore, with a rollback plan",
                "Monitor connections, replication lag and disk with Prometheus and Grafana, and set alerts",
                "Use a managed database such as Amazon RDS or Azure SQL and note what the provider handles for you",
            ],
        },
    ),
]


META = {
    "network-engineering": dict(
        keywords=[
            "network engineer", "network administrator", "network support", "noc technician", "noc engineer", "junior network engineer",
            "ccna", "comptia network+", "network+", "cisco", "routing and switching", "ospf", "bgp", "vlan", "subnetting",
            "packet tracer", "gns3", "eve-ng", "wireshark", "network automation", "netmiko", "tcp/ip", "firewall", "vpn", "wifi", "lan wan",
        ],
        who_its_for="People who like working out why something is not reachable and enjoy methodical, layer by layer troubleshooting. It suits IT support staff who want to specialise and career changers happy to study for exams. The catch is that outages happen when the business is least able to afford them, so expect on-call duty and calm decision making under pressure.",
        portfolio_expectations=[
            "A network diagram with a full IP addressing plan and VLAN table for a small multi-site company",
            "A Packet Tracer or GNS3 lab file with working OSPF, NAT and ACLs, plus the configs and verification output",
            "A fault log of at least five deliberate network faults, each with symptoms, commands used, cause and fix",
            "A Python or Ansible repository that backs up and audits device configs in a virtual lab",
        ],
        career_progression=["NOC Technician or Network Support Engineer", "Network Engineer", "Senior Network Engineer or Network Automation Engineer", "Network Architect or Infrastructure Lead"],
    ),
    "database-administration": dict(
        keywords=[
            "dba", "database administrator", "database administration", "postgresql dba", "postgres", "postgresql", "mysql dba", "sql server dba",
            "database support", "junior dba", "sql developer", "query tuning", "database performance", "backup and recovery", "point in time recovery",
            "replication", "failover", "explain analyze", "indexing", "dp-300", "pgadmin", "database security", "database upgrades",
        ],
        who_its_for="Careful, methodical people who would rather prevent a data loss than be praised for a clever fix, and who enjoy diagnosing why something is slow. It suits support analysts, sysadmins and SQL developers who want to own the data layer. The catch is that you hold the company's most important asset, so mistakes are costly, and it is rarely an entry level job.",
        portfolio_expectations=[
            "A runbook showing a PostgreSQL backup, a destructive mistake and a tested point in time restore with measured recovery time",
            "A tuning report with EXPLAIN ANALYZE plans before and after each index or rewrite on a multi-million row table",
            "A documented primary and replica setup with a failover drill and notes on what went wrong",
            "A role and privilege design for a sample application, with tests proving what each role can and cannot do",
        ],
        career_progression=["Database Support Analyst or Junior DBA", "Database Administrator", "Senior DBA or Database Reliability Engineer", "Principal DBA, Data Platform Lead or Database Architect"],
    ),
}


PROJECTS = {
    "network-engineering": {
        "skills": [
            {"key": "ip_addressing_vlans", "label": "IP Addressing, Subnetting and VLANs", "category": "foundation"},
            {"key": "switching_and_stp", "label": "Switching, Trunking and Spanning Tree", "category": "foundation"},
            {"key": "routing_nat_acls", "label": "Routing with OSPF, NAT and ACLs", "category": "core"},
            {"key": "packet_capture_troubleshooting", "label": "Troubleshooting and Packet Captures", "category": "core"},
            {"key": "network_automation", "label": "Network Automation with Python and Ansible", "category": "advanced"},
        ],
        "skill_edges": [
            ("ip_addressing_vlans", "switching_and_stp"),
            ("switching_and_stp", "routing_nat_acls"),
            ("routing_nat_acls", "packet_capture_troubleshooting"),
            ("packet_capture_troubleshooting", "network_automation"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Learn to carve an address block into correctly sized subnets and build a VLAN-segmented office LAN, the skill every other network task depends on.",
                "skill_key": "ip_addressing_vlans",
                "projects": [
                    {
                        "title": "Subnet a Three-Department Office and Build It with VLANs in Packet Tracer",
                        "teaches": "variable length subnet masking, VLAN creation, trunking and router-on-a-stick inter-VLAN routing with a DHCP server",
                        "prerequisites": ["Cisco Packet Tracer installed (free with a Cisco Networking Academy account)", "Comfort converting between binary and decimal", "Knowing what a default gateway is"],
                        "expected_output": "An addressing plan table and a working Packet Tracer file where PCs in three VLANs get DHCP leases and can ping each other through the router.",
                        "steps": [
                            "Start from 192.168.50.0/24 and write the requirement: Sales needs 50 hosts, Engineering 25, Guest 10 and Management 5.",
                            "Allocate largest first with VLSM: Sales 192.168.50.0/26, Engineering 192.168.50.64/27, Guest 192.168.50.96/28, Management 192.168.50.112/29. Record network, mask, first and last usable address and broadcast for each, then check them with Python's ipaddress module.",
                            "In Packet Tracer, place one router, one 2960 switch and a PC per VLAN. On the switch run `vlan 10`, `name SALES` and repeat for VLANs 20, 30 and 99.",
                            "Assign access ports with `switchport mode access` and `switchport access vlan 10` (and the matching VLAN on each other port). Make the switch-to-router port a trunk with `switchport mode trunk`.",
                            "On the router, bring up the physical interface with `no shutdown`, then create subinterfaces such as `interface g0/0.10`, `encapsulation dot1Q 10` and `ip address 192.168.50.1 255.255.255.192`. Repeat for each VLAN.",
                            "Configure DHCP on the router: `ip dhcp excluded-address 192.168.50.1 192.168.50.5`, then `ip dhcp pool SALES` with `network`, `default-router` and `dns-server` lines for each VLAN.",
                            "Set each PC to DHCP and confirm leases. Verify with `show vlan brief`, `show interfaces trunk`, `show ip interface brief` and `show ip dhcp binding`, then ping between PCs in different VLANs.",
                            "Save with `copy running-config startup-config` and write a one page note with the addressing table, VLAN table, topology screenshot and the commands that proved it works.",
                        ],
                        "hints": [
                            "The block size of a subnet is 256 minus the interesting octet of the mask, so a /27 (mask 224) has blocks of 32 addresses.",
                            "The number after `encapsulation dot1Q` must match the VLAN ID on the switch or traffic is dropped silently.",
                            "If a PC gets 169.254.x.x, DHCP is not reaching it: check the VLAN of the access port and the subinterface gateway first.",
                            "Use `show running-config | section interface` to read just the interface blocks instead of scrolling the whole config.",
                        ],
                        "common_mistakes": [
                            "Allocating the small subnets first and running out of clean address space for the large one.",
                            "Forgetting `no shutdown` on the parent router interface, so none of the subinterfaces come up.",
                            "Putting the PC in the right VLAN but leaving the switch port in dynamic mode instead of access mode.",
                            "Using the network or broadcast address as a host or gateway address.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Connect three sites with dynamic routing, give them internet access through NAT, restrict traffic with ACLs, then break the network on purpose and fix it from the evidence.",
                "skill_key": "routing_nat_acls",
                "projects": [
                    {
                        "title": "Connect Three Sites with OSPF, NAT and ACLs, then Break and Fix the Network",
                        "teaches": "single-area OSPF, default route origination, NAT overload, DHCP relay, extended ACLs and a disciplined break-and-fix troubleshooting method",
                        "prerequisites": ["The subnetting and VLAN project", "Comfort with the router command line", "Packet Tracer, using Simulation mode to trace packets"],
                        "expected_output": "A Packet Tracer lab with an HQ and two branch routers, an ISP router and a web server, plus a fault log documenting three deliberate faults you diagnosed and repaired.",
                        "steps": [
                            "Build a triangle of three routers (HQ, Branch-A, Branch-B) joined by /30 links in 10.0.12.0, 10.0.13.0 and 10.0.23.0, each with a LAN (192.168.10.0/24, 192.168.20.0/24, 192.168.30.0/24). Add an ISP router with a web server at 203.0.113.10 behind HQ.",
                            "Enable OSPF on each router: `router ospf 1`, `router-id 1.1.1.1`, `network 10.0.12.0 0.0.0.3 area 0` for each link and LAN, and `passive-interface` on LAN-facing interfaces. Confirm with `show ip ospf neighbor` and `show ip route ospf`.",
                            "Add a default route on HQ toward the ISP with `ip route 0.0.0.0 0.0.0.0 203.0.113.2` and share it using `default-information originate` under OSPF. Check that the branches learn it.",
                            "Configure NAT overload on HQ: mark inside and outside interfaces with `ip nat inside` and `ip nat outside`, write `access-list 1 permit 192.168.0.0 0.0.255.255` and use `ip nat inside source list 1 interface g0/2 overload`. Verify with `show ip nat translations`.",
                            "Run the DHCP pools on HQ for the branch LANs and add `ip helper-address` on each branch LAN interface so requests reach it. Confirm the branch PCs get leases.",
                            "Write an extended named ACL on Branch-B that lets the guest LAN reach only the web server on port 80, for example `permit tcp 192.168.30.0 0.0.0.255 host 203.0.113.10 eq 80` then `deny ip 192.168.30.0 0.0.0.255 192.168.0.0 0.0.255.255` then `permit ip any any`. Apply it inbound and check hit counts with `show access-lists`.",
                            "Test redundancy: shut the HQ to Branch-A link and watch traffic reroute through Branch-B with `show ip route` and a continuous ping. Bring the link back.",
                            "Inject three faults (for example a mismatched OSPF hello timer, a wrong wildcard mask in a network statement, and an ACL applied in the wrong direction). Wait a day or hand the file to a friend, then diagnose each using `show ip ospf interface`, `show ip protocols`, `show access-lists` and Simulation mode.",
                            "Write the fault log: for each fault, the symptom, the commands you ran in order, the root cause, the fix and the command that proved it was fixed.",
                        ],
                        "hints": [
                            "OSPF neighbours stuck in INIT or EXSTART usually mean a mismatch: check hello and dead timers, area ID, subnet mask and MTU.",
                            "OSPF uses wildcard masks, which are the inverse of subnet masks: a /30 is 0.0.0.3.",
                            "Remember the implicit deny at the end of every ACL, and that rules are matched top to bottom.",
                            "Simulation mode in Packet Tracer shows each hop and the device that dropped a packet, which narrows the problem quickly.",
                        ],
                        "common_mistakes": [
                            "Advertising LAN networks into OSPF without making the LAN interface passive, so hellos leak to user ports.",
                            "Forgetting to mark inside and outside interfaces for NAT, then wondering why there are no translations.",
                            "Applying an ACL to the right interface in the wrong direction, so it never matches the traffic.",
                            "Changing several things at once when troubleshooting, so you cannot tell which change fixed it.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Build a virtual router lab outside the simulators, automate backups and compliance checks on it with Python and Ansible, and confirm a BGP session by reading the packets.",
                "skill_key": "network_automation",
                "projects": [
                    {
                        "title": "Automate Config Backups and Audits on a Virtual Router Lab and Capture a BGP Session",
                        "teaches": "running a virtual network lab, scripting device access with Netmiko, pushing changes safely with Ansible, and verifying BGP and OSPF behaviour with a packet capture",
                        "prerequisites": ["The OSPF, NAT and ACL project", "Python basics including virtual environments", "A Linux machine or VM with Docker installed", "A free Arista account to download the cEOS-lab image"],
                        "expected_output": "A GitHub repository with a Containerlab topology file, a Netmiko backup and audit script, an Ansible playbook with a dry run, a saved .pcap of a BGP session and a README explaining how to run it all.",
                        "steps": [
                            "Install Containerlab with its install script from containerlab.dev. Download the free Arista cEOS-lab image after registering with Arista and load it with `docker import` so it is tagged for Containerlab.",
                            "Write a `lab.clab.yml` topology of three nodes of kind `arista_ceos` (r1, r2, r3) joined in a line, then start it with `sudo containerlab deploy -t lab.clab.yml` and log in over SSH to check each node is up.",
                            "Configure addresses and OSPF between r1 and r2 by hand, and an eBGP session between r2 (AS 65002) and r3 (AS 65003) using `router bgp 65002`, `neighbor 10.0.23.2 remote-as 65003` and `network 192.168.3.0/24`. Verify with `show ip ospf neighbor` and `show ip bgp summary`.",
                            "Create a Python virtual environment, run `pip install netmiko`, and write a script that connects with `ConnectHandler(device_type=\"arista_eos\", ...)`, runs `show running-config` on each node and saves it to a timestamped file in a `backups` folder.",
                            "Extend the script into an audit: a dictionary of lines each config must contain (a hostname, an NTP server, a logging host) and lines it must not contain. Print a pass or fail table per device.",
                            "Fix one failing device by sending the missing lines with `send_config_set`, save with `save_config()`, take a second backup and show the change with Python's `difflib.unified_diff`.",
                            "Install the collection with `ansible-galaxy collection install arista.eos`, write an inventory using `ansible_network_os=arista.eos.eos` and `ansible_connection=ansible.netcommon.network_cli`, and a playbook using `arista.eos.eos_config` to set the NTP server. Run it with `--check --diff` first, then for real.",
                            "Capture the BGP session: run `sudo ip netns exec clab-<labname>-r2 tcpdump -i eth2 -w bgp.pcap`, then bounce the neighbour with `neighbor 10.0.23.2 shutdown` and `no neighbor 10.0.23.2 shutdown`. Open the file in Wireshark, filter on `bgp` and label the OPEN, KEEPALIVE, UPDATE and NOTIFICATION messages.",
                            "Write the README: the topology diagram, how to deploy the lab, how to run the backup, audit and playbook, sample output and a screenshot of the labelled capture.",
                        ],
                        "hints": [
                            "Keep credentials out of the script: read them from environment variables or Ansible Vault, never commit them.",
                            "The Wireshark display filter `tcp.port == 179` shows BGP traffic even when the BGP decoder is not applied.",
                            "If your lab uses Cisco or other images you are licensed to use, swap the Netmiko device_type (for example `cisco_ios`) and the Ansible collection to match.",
                            "Use `--check --diff` on every Ansible run against a device until you trust the playbook.",
                        ],
                        "common_mistakes": [
                            "Writing a script that pushes changes with no backup taken first, leaving no way to roll back.",
                            "Hard coding passwords in the script and committing them to GitHub.",
                            "Capturing on the wrong interface, so the BGP session never appears in the file.",
                            "Letting the audit script report success when a command silently failed, instead of checking the output.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
    "database-administration": {
        "skills": [
            {"key": "postgres_setup_security", "label": "PostgreSQL Setup, Roles and Access Control", "category": "foundation"},
            {"key": "query_plans_indexing", "label": "Query Plans and Indexing", "category": "core"},
            {"key": "maintenance_monitoring", "label": "Maintenance, Vacuum and Monitoring", "category": "core"},
            {"key": "backup_recovery", "label": "Backup and Point in Time Recovery", "category": "advanced"},
            {"key": "replication_failover", "label": "Replication and Failover", "category": "advanced"},
        ],
        "skill_edges": [
            ("postgres_setup_security", "query_plans_indexing"),
            ("query_plans_indexing", "maintenance_monitoring"),
            ("maintenance_monitoring", "backup_recovery"),
            ("backup_recovery", "replication_failover"),
        ],
        "phases": [
            {
                "title": "Foundations",
                "summary": "Install PostgreSQL on Linux, restrict who can connect and what they can do, and prove you can restore a backup, the habits every DBA is judged on.",
                "skill_key": "postgres_setup_security",
                "projects": [
                    {
                        "title": "Install PostgreSQL, Lock Down Access and Prove a pg_dump Restore",
                        "teaches": "installing PostgreSQL, finding its config files, designing roles with least privilege, setting pg_hba.conf rules and testing a logical backup by restoring it",
                        "prerequisites": ["An Ubuntu VM (VirtualBox) or WSL2", "Basic SQL (SELECT, INSERT, joins)", "Comfort editing files with nano or vim"],
                        "expected_output": "A running PostgreSQL server with the Pagila sample database, a reporting role and an application role that are provably limited, and a one page runbook showing a restore of a pg_dump backup with matching row counts.",
                        "steps": [
                            "Install with `sudo apt install postgresql` and run `pg_lsclusters` to see the cluster version, port and data directory. Open a superuser session with `sudo -u postgres psql`.",
                            "Record where things live by running `SHOW data_directory;`, `SHOW config_file;` and `SHOW hba_file;`, and list the databases with `\\l`.",
                            "Download the Pagila sample database (a PostgreSQL port of Sakila, on GitHub), then run `createdb pagila` and load `pagila-schema.sql` and `pagila-data.sql` with `psql -d pagila -f`.",
                            "Create roles: `CREATE ROLE reporting NOLOGIN;` with `GRANT USAGE ON SCHEMA public TO reporting;` and `GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting;`. Create `alice` as a login role in `reporting` and `app_user` with SELECT, INSERT, UPDATE and DELETE only. Check with `\\du` and `\\dp`.",
                            "Edit `pg_hba.conf` so only the intended users connect, with lines such as `host pagila alice 127.0.0.1/32 scram-sha-256`. Remove any `trust` lines for network connections, reload with `SELECT pg_reload_conf();` and inspect the result in `pg_hba_file_rules`.",
                            "Connect as `alice` with `psql -h 127.0.0.1 -U alice pagila` and try an INSERT and a DROP TABLE. Both should fail with permission denied. Keep the output as proof.",
                            "Take a logical backup with `pg_dump -Fc -f pagila.dump pagila` and inspect it with `pg_restore --list pagila.dump`.",
                            "Restore into a new database with `createdb pagila_restore` and `pg_restore -d pagila_restore --no-owner pagila.dump`. Compare `SELECT count(*)` on the film, customer and payment tables in both databases and time the restore.",
                            "Write the runbook: file locations, role design, the backup command, the restore command, the row count comparison and how long the restore took.",
                        ],
                        "hints": [
                            "Granting privileges to a group role and then adding people to it is easier to audit than granting to each user.",
                            "Rules in pg_hba.conf are read top to bottom and the first match wins, so order matters.",
                            "`ALTER DEFAULT PRIVILEGES` is needed if future tables should also be readable by the reporting role.",
                            "A restore that you have not tested is only a hope, so always compare row counts or checksums afterwards.",
                        ],
                        "common_mistakes": [
                            "Running the application as the postgres superuser because it is easier.",
                            "Editing pg_hba.conf and forgetting to reload, then assuming the new rule is active.",
                            "Taking a backup and never restoring it, so the first test happens during a real emergency.",
                            "Granting privileges to PUBLIC by accident, which gives access to every role.",
                        ],
                        "difficulty": 1,
                    }
                ],
            },
            {
                "title": "Building Real Skills",
                "summary": "Learn to find slow queries, read the plan PostgreSQL chose, and fix them with the right index while measuring what the index costs in size and write speed.",
                "skill_key": "query_plans_indexing",
                "projects": [
                    {
                        "title": "Find and Fix Slow Queries on a Two Million Row PostgreSQL Table",
                        "teaches": "reading EXPLAIN (ANALYZE, BUFFERS) output, choosing composite, partial and expression indexes, using pg_stat_statements and understanding vacuum and statistics",
                        "prerequisites": ["The PostgreSQL install and security project", "Comfort with joins and ORDER BY", "psql access as a superuser to restart the server"],
                        "expected_output": "A tuning report covering three slow queries, each with the plan before and after, execution time, buffer counts, the index created and its size, plus a note on the write cost of the indexes.",
                        "steps": [
                            "Create `customers` (100000 rows) and `orders` (2000000 rows with customer_id, status, total and created_at) using `INSERT ... SELECT ... FROM generate_series(1, 2000000)` with `random()` values, then run `ANALYZE;`.",
                            "Add `shared_preload_libraries = 'pg_stat_statements'` to postgresql.conf, restart PostgreSQL, run `CREATE EXTENSION pg_stat_statements;` and reset it with `SELECT pg_stat_statements_reset();`.",
                            "Write three slow queries: orders for one customer in a date range, the 20 newest orders overall with `ORDER BY created_at DESC LIMIT 20`, and a join of orders to customers filtered by a customer column. Run each under `EXPLAIN (ANALYZE, BUFFERS)` and note the scan type, time and buffers.",
                            "Add `CREATE INDEX CONCURRENTLY orders_customer_created_idx ON orders (customer_id, created_at DESC);` and rerun the queries. Record which plans switched to an index scan and by how much the time fell.",
                            "Show an index that fails to help: filter on `WHERE date(created_at) = '2025-03-01'`, see the sequential scan, then fix it with a range condition or an expression index. Add a partial index such as `ON orders (created_at) WHERE status = 'pending'` and compare its size to a full index using `pg_size_pretty(pg_relation_size(...))`.",
                            "Update about 30 percent of the orders, then check `n_dead_tup` and `last_autovacuum` in `pg_stat_user_tables` and table size. Run `VACUUM (VERBOSE) orders;` and `ANALYZE orders;` and note what changes.",
                            "Query `pg_stat_statements` ordered by `total_exec_time` to find which statements consumed the most time, and compare the list with your own three queries.",
                            "Check `pg_stat_user_indexes` for any index with `idx_scan = 0`. Time a bulk insert of 200000 rows with and without three extra indexes to measure the write cost.",
                            "Write the report: for each query, plan before and after, timings, buffers, the index definition, the index size and your recommendation.",
                        ],
                        "hints": [
                            "Compare the estimated rows with the actual rows in each plan node: a large gap usually means stale statistics.",
                            "In a composite index put equality columns first and the range or sort column last.",
                            "`CREATE INDEX CONCURRENTLY` avoids blocking writes but cannot run inside a transaction block.",
                            "Run each query twice and compare the second run, so a cold cache does not mislead you.",
                        ],
                        "common_mistakes": [
                            "Adding an index for every slow query without checking whether the planner actually uses it.",
                            "Running EXPLAIN without ANALYZE and trusting estimates that may be far from reality.",
                            "Testing on a tiny table where a sequential scan is genuinely the fastest choice.",
                            "Forgetting that every index slows inserts and updates and takes disk space.",
                        ],
                        "difficulty": 3,
                    }
                ],
            },
            {
                "title": "Advanced Practice",
                "summary": "Run the exercise every DBA must be able to do under pressure: restore to a moment before a mistake, fail over to a replica and write down how long recovery took.",
                "skill_key": "replication_failover",
                "projects": [
                    {
                        "title": "Run a Point in Time Recovery and Streaming Replica Failover Drill",
                        "teaches": "WAL archiving, base backups, point in time recovery, streaming replication, promotion, pg_rewind and measuring recovery time",
                        "prerequisites": ["The slow query tuning project", "Debian or Ubuntu with PostgreSQL 15 or newer and the postgresql-common tools", "Disk space for two extra clusters", "Comfort editing postgresql.conf and pg_hba.conf"],
                        "expected_output": "A recovery runbook with evidence that a dropped table was restored to a point just before the mistake, a working primary and replica pair that survived a simulated primary failure, and measured recovery times for each exercise.",
                        "steps": [
                            "On the primary, create the archive folder and set `wal_level = replica`, `archive_mode = on`, `archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f'`, `max_wal_senders = 5` and `wal_log_hints = on`. Restart and confirm files appear in the archive after `SELECT pg_switch_wal();`.",
                            "Create a replication role with `CREATE ROLE replicator REPLICATION LOGIN PASSWORD '...';` and add a matching `host replication replicator 127.0.0.1/32 scram-sha-256` line to pg_hba.conf, then reload.",
                            "Build the replica on port 5433 by creating an empty cluster with `pg_createcluster`, clearing its data directory and running `pg_basebackup -h 127.0.0.1 -U replicator -D <replica data dir> -R -X stream -C -S replica1`. Start it and confirm with `SELECT * FROM pg_stat_replication;` on the primary and `SELECT pg_is_in_recovery();` on the replica.",
                            "Generate load with `pgbench -i -s 50` and `pgbench -c 8 -T 60`, and watch replay lag using `pg_current_wal_lsn()` on the primary against `pg_last_wal_replay_lsn()` on the replica.",
                            "Take a base backup of the primary with `pg_basebackup -D /var/backups/base1 -Fp -X stream`. Insert a marker row, note the exact time from `SELECT now();`, then simulate the accident with `DROP TABLE pgbench_history;` or a mass DELETE.",
                            "Recover into a separate cluster: copy the base backup into a new data directory, add `restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'`, `recovery_target_time = '<time just before the drop>'` and `recovery_target_action = 'promote'`, create `recovery.signal`, start it and check the table and marker row are back.",
                            "Simulate losing the primary with `pg_ctlcluster <version> main stop -m immediate`, then promote the replica with `SELECT pg_promote();` and check `pg_is_in_recovery()` now returns false. Point a test client at the new primary and write to it.",
                            "Rebuild the old primary as a replica of the new one with `pg_rewind --target-pgdata=<old data dir> --source-server='host=127.0.0.1 port=5433 user=replicator dbname=postgres'`, then add the standby settings and start it.",
                            "Write the runbook: each exercise as numbered commands, what you observed, the time from failure to working service, what went wrong and what you would change before a real incident.",
                        ],
                        "hints": [
                            "Choose a recovery target just before the mistake, not the exact moment, and check the server log for 'recovery stopping before commit'.",
                            "pg_rewind needs `wal_log_hints = on` or data checksums, which is why it is set in the first step.",
                            "Use a replication slot so the primary keeps the WAL the replica still needs, and watch disk use because a stalled replica can fill it.",
                            "Time every exercise with a stopwatch, because recovery time is the number a manager will ask for.",
                        ],
                        "common_mistakes": [
                            "Treating a replica as a backup, when a dropped table replicates to it within seconds.",
                            "Overwriting the original data directory before the recovery has been verified.",
                            "Setting an archive_command that fails silently, so WAL is lost and the point in time restore cannot finish.",
                            "Promoting a replica while the old primary is still accepting writes, causing two diverging copies.",
                        ],
                        "difficulty": 5,
                    }
                ],
            },
        ],
    },
}
