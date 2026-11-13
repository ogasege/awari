/**
 * Grammatical "ever wondered" prompts for Home's margin notes
 * (21-review-2 Req 8). A bare title reads badly ("about Violin?"), so:
 * a name that needs "the" gets it, a thing gets a lower-case article
 * phrase, and a process becomes "how X works".
 */

/** Names that always take "the" and keep their capitals. */
const THE_NAMES = new Set([
  'Sahara', 'Himalayas', 'Alps', 'Andes', 'Amazon', 'Nile', 'Danube', 'Congo', 'Niger', 'Mississippi', 'Amazon rainforest',
  'Sun', 'Moon', 'Milky Way', 'Big Bang', 'Internet', 'Renaissance', 'Titanic', 'Colosseum', 'Parthenon',
  'Arctic', 'Antarctic', 'Atlantic', 'Pacific', 'Rosetta Stone', 'Silk Road', 'Great Wall of China', 'Industrial Revolution',
  'Wonders of the World', 'Lighthouse of Alexandria', 'Hanging Gardens of Babylon', 'Colossus of Rhodes', 'Great Pyramid of Giza',
  'Space Shuttle', 'Roman Empire', 'Ring of Fire', 'Stone Age', 'Bronze Age', 'Iron Age',
]);

const THE_LAST_WORDS = /\b(River|Ocean|Sea|Revolution|Empire|Canal|Desert|Mountains|Islands|Strait|Falls|Wall|Road|Pyramids|Gardens|Temple|Tower)$/;
const PROCESS = /(tion|sion|ity|ism|ics|ness|osis|esis|ysis)$/i;

/** 'common' = a countable thing (the violin); 'mass' = a material or idea (hydrogen); 'name' = a person or place. */
export type QuestionKind = 'common' | 'mass' | 'name';

/** "the Nile", "the violin", "the Komodo dragon", or the title unchanged. */
export function withArticle(title: string, kind: QuestionKind): string {
  if (THE_NAMES.has(title) || THE_LAST_WORDS.test(title)) return `the ${title}`;
  if (kind === 'name' || /^\d/.test(title)) return title;
  const words = title.split(' ');
  if (words.length >= 2 && words.every((w) => /^[A-Z][a-z]/.test(w))) return title; // a person: "Lionel Messi"
  const lowerFirst = title.charAt(0).toLowerCase() + title.slice(1);
  if (/s$/.test(title) && !/(ss|us|is)$/.test(title)) return lowerFirst; // plural: no article
  const rest = title.split(' ').slice(1).join(' ');
  const properFirst = /^(African|Asian|European|American|Indian|Arctic|Antarctic|Siberian|Bengal|Komodo|Tasmanian|Roman|Greek|Egyptian|Chinese|Japanese|Galápagos|Newton|Einstein)\b/.test(title);
  if (kind === 'mass') return properFirst || (rest && /[A-Z]/.test(rest)) ? title : lowerFirst;
  return `the ${properFirst || (rest && /[A-Z]/.test(rest)) ? title : lowerFirst}`;
}

/** True when a title names a process or an idea ("Digestion", "Gravity"). */
export function isProcess(title: string): boolean {
  return !title.includes(' ') && PROCESS.test(title);
}

const TEMPLATES = [
  (t: string) => `Ever wondered about ${t}?`,
  (t: string) => `What is ${t} really like?`,
  (t: string) => `How much do you know about ${t}?`,
];

/**
 * The prompt for an article. `kind` is 'common' for things (animals,
 * instruments, organs) and 'name' for people and places, which take no
 * article; `pick` chooses a template deterministically.
 */
export function questionFor(title: string, kind: QuestionKind, pick: number): string {
  if (isProcess(title)) return `Ever wondered how ${title.toLowerCase()} works?`;
  const make = TEMPLATES[((pick % TEMPLATES.length) + TEMPLATES.length) % TEMPLATES.length] as (t: string) => string;
  return make(withArticle(title, kind));
}
