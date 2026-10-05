/**
 * Shared catalogue search. One implementation behind the homepage search and
 * the /careers directory so "what matches" never differs between them.
 *
 * It searches a career's name, category, keywords, entry roles, tools and
 * skills (and, with lower weight, its summary), so "AWS" finds the cloud and
 * infrastructure careers, "Python" finds every career that uses it and
 * "Figma" finds the design careers. Every word you type must match somewhere
 * on the career; results are ranked by where the match was, name first.
 */
export interface SearchableCareer {
  slug: string;
  name: string;
  category_label: string;
  summary?: string;
  keywords?: string[];
  entry_roles?: string[];
  tools?: string[];
  skills_required?: string[];
}

export interface CareerSearchResult<T extends SearchableCareer> {
  career: T;
  score: number;
  /** Short hint about why a career matched, e.g. "Tool: AWS". Null when the name matched. */
  matchedOn: string | null;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Short words ("ml", "ui", "pm") match whole words only, so "ml" does not match "html". */
function containsTerm(haystack: string, term: string): boolean {
  const h = haystack.toLowerCase();
  if (term.length > 3) return h.includes(term);
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`).test(h);
}

function firstMatch(values: string[] | undefined, term: string): string | null {
  if (!values) return null;
  return values.find((v) => containsTerm(v, term)) ?? null;
}

interface TermMatch {
  score: number;
  hint: string | null;
}

function matchTerm(career: SearchableCareer, term: string): TermMatch | null {
  const name = career.name.toLowerCase();
  if (name === term) return { score: 120, hint: null };
  if (name.startsWith(term)) return { score: 100, hint: null };
  if (containsTerm(name, term)) return { score: 80, hint: null };

  const tool = firstMatch(career.tools, term);
  if (tool) return { score: 60, hint: `Tool: ${tool}` };
  const keyword = firstMatch(career.keywords, term);
  if (keyword) return { score: 55, hint: `Keyword: ${keyword}` };
  const role = firstMatch(career.entry_roles, term);
  if (role) return { score: 50, hint: `Role: ${role}` };
  const skill = firstMatch(career.skills_required, term);
  if (skill) return { score: 40, hint: `Skill: ${skill}` };
  if (containsTerm(career.category_label, term)) return { score: 25, hint: `Category: ${career.category_label}` };
  if (career.summary && containsTerm(career.summary, term)) return { score: 10, hint: null };
  return null;
}

export function searchCareers<T extends SearchableCareer>(careers: T[], query: string): CareerSearchResult<T>[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (terms.length === 0) return careers.map((career) => ({ career, score: 0, matchedOn: null }));

  const results: CareerSearchResult<T>[] = [];
  careers.forEach((career, order) => {
    let total = 0;
    let hint: string | null = null;
    let bestTermScore = -1;
    for (const term of terms) {
      const match = matchTerm(career, term);
      if (!match) return;
      total += match.score;
      if (match.score > bestTermScore) {
        bestTermScore = match.score;
        hint = match.hint;
      }
    }
    // Tiny order bias keeps ties in catalogue order instead of arbitrary.
    results.push({ career, score: total - order * 0.001, matchedOn: hint });
  });
  return results.sort((a, b) => b.score - a.score);
}
