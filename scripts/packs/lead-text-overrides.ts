/**
 * The two leads no rule in `src/lib/text/leads.ts` can repair
 * (26-final-review D-21, and the Indonesia name list the extract broke).
 *
 * Both replacements are built only from the words of the article they
 * belong to: a broken junction between two of its own sentences is
 * joined up, and a fragment the extract left behind is dropped. No fact
 * and no wording comes from anywhere else, so the text stays the Simple
 * English Wikipedia text under CC BY-SA 4.0.
 *
 * `scripts/packs/leads-quality.test.ts` fails if a `find` string is no
 * longer in the cleaned lead, so an override cannot rot in silence.
 */

/** One hand-written repair inside a cleaned lead paragraph. */
export interface LeadTextOverride {
  /** Exact text in the cleaned lead paragraph to replace. */
  find: string;
  /** What it becomes, in the article's own words. */
  replace: string;
  /** Why no rule can do it. */
  why: string;
}

export const LEAD_TEXT_OVERRIDES: ReadonlyMap<string, LeadTextOverride> = new Map([
  [
    'arts/basketball',
    {
      find:
        'Basketball is a team sport where two teams (usually consisting of five players) + Bench players making up the rest of the roster. ' +
        'They play against each other on a basketball court it a rectangular playing surface consisting of four straight boundaries arranged into two pairs of parallel lines.',
      replace:
        'Basketball is a team sport where two teams, usually of five players, play against each other on a basketball court, ' +
        'a rectangular playing surface consisting of four straight boundaries arranged into two pairs of parallel lines.',
      why:
        'Two sentences of the article run into each other through a stray "+" and a missing verb ' +
        '("on a basketball court it a rectangular playing surface"). The repair joins them with the words they already use ' +
        'and drops the fragment "Bench players making up the rest of the roster".',
    },
  ],
  [
    'countries/indonesia',
    {
      find: 'Indonesia, officially the Republic of Indonesia; Nusantara, is a nation in Southeast Asia and Oceania.',
      replace: 'Indonesia, officially the Republic of Indonesia, is a nation in Southeast Asia and Oceania.',
      why:
        'The extract lost the opening bracket of the name list, leaving "Indonesia, () officially the Republic of ' +
        'Indonesia; Nusantara) is a nation". Nothing tells the rules where the list began; the article itself says later that ' +
        'Nusantara is the planned capital, not another name for the country.',
    },
  ],
]);

/** The cleaned lead paragraph with its hand-written repair applied. */
export function applyLeadTextOverride(key: string, lead: string): string {
  const override = LEAD_TEXT_OVERRIDES.get(key);
  if (!override || !lead.includes(override.find)) {
    return lead;
  }
  return lead.replace(override.find, override.replace);
}
