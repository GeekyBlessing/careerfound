/**
 * README Builder: turns the sections a learner fills in into a README.md.
 *
 * The builder only writes what the learner provided. An empty section is left
 * out of the output rather than padded with filler, and the completeness
 * helper tells them which sections they still owe, so the finished README
 * describes real work.
 */

export interface ReadmeSection {
  key: string;
  title: string;
}

const COMMAND_SECTIONS = new Set(["installation", "usage"]);
const SOURCE_NOTE = "Replace YOUR_REPOSITORY_URL with the address of your own repository.";

function looksLikeCommands(text: string): boolean {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return false;
  const starters = /^(git|python3?|pip3?|npm|npx|node|cd|mkdir|source|export|docker|terraform|uvicorn|pytest|cp|curl|make|brew|sudo|code|aws)\b/;
  return lines.filter((l) => starters.test(l)).length >= Math.ceil(lines.length / 2);
}

function isFenced(text: string): boolean {
  return text.trim().startsWith("```");
}

export function renderSection(key: string, text: string): string {
  const body = text.trim();
  if (!body) return "";
  if (COMMAND_SECTIONS.has(key) && !isFenced(body) && looksLikeCommands(body)) {
    return "```bash\n" + body + "\n```";
  }
  return body;
}

export function buildReadme(title: string, sections: ReadmeSection[], values: Record<string, string>): string {
  const parts: string[] = [`# ${title.trim() || "Project title"}`];
  const overview = (values["overview"] ?? "").trim();
  if (overview) parts.push(overview);
  for (const section of sections) {
    if (section.key === "overview") continue;
    const rendered = renderSection(section.key, values[section.key] ?? "");
    if (!rendered) continue;
    parts.push(`## ${section.title}\n\n${rendered}`);
  }
  return parts.join("\n\n") + "\n";
}

export interface ReadmeCompleteness {
  filled: number;
  total: number;
  missing: string[];
  placeholdersLeft: boolean;
}

/** Which sections are still empty, and whether a placeholder such as YOUR_REPOSITORY_URL was left in. */
export function readmeCompleteness(sections: ReadmeSection[], values: Record<string, string>): ReadmeCompleteness {
  const missing = sections.filter((s) => !(values[s.key] ?? "").trim()).map((s) => s.title);
  const joined = Object.values(values).join("\n");
  return {
    filled: sections.length - missing.length,
    total: sections.length,
    missing,
    placeholdersLeft: /YOUR_[A-Z_]+/.test(joined),
  };
}

export const PLACEHOLDER_HELP = SOURCE_NOTE;
