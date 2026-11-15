/**
 * Topics unsuitable for Awari's readers, aged about 8 to 14 (26-final-review N-2): abortion, sexual content, graphic
 * violence, drugs, alcohol and suicide. A quiz question or a picture caption that touches one is dropped. Articles may
 * still mention history (a war, a battle) in their own text; what is filtered is what Awari puts in front of a child as
 * a question to answer or a caption under a picture.
 */
const PATTERNS: ReadonlyArray<readonly [topic: string, re: RegExp]> = [
  ['abortion', /\babort(ion|ions|ed)\b/i],
  ['sexual content', /\b(sex|sexual|sexually|sexuality|rape|raped|raping|prostitut\w*|porn\w*|erotic\w*|nude|nudity|naked|brothel)\b/i],
  ['graphic violence', /\b(behead\w*|decapitat\w*|tortur\w*|mutilat\w*|massacr\w*|lynch\w*|genocide|corpses?|dismember\w*|disembowel\w*|gore|gory|slaughter(ed|ing)?|executed by|hanged|kill (her|his|their|you|me) child\w*|kill(ed|ing)? (her|his|their) (child|children|baby|babies))\b/i],
  ['drugs', /\b(cocaine|heroin|marijuana|cannabis|opium|meth(amphetamine)?|narcotics?|overdos\w*|drug (addict\w*|abuse|deal\w*))\b/i],
  ['alcohol', /\b(beer|beers|wine|wines|vodka|whisk(e)?y|liquor|alcohol\w*|drunk\w*|brewer(y|ies)|pub crawl|cocktails?|hotel bar)\b/i],
  ['suicide', /\b(suicid\w*|killed (him|her|them)sel(f|ves)|took (his|her|their) own li(fe|ves))\b/i],
];

/**
 * Phrases that contain a listed word but are not the topic: a museum's ritual bronze "wine vessel" (an artefact) and the
 * biology term "sex hormones". They are removed before the check, and nothing else is exempt.
 */
const NOT_THE_TOPIC = /\b(wine vessels?|sex hormones?|naked eye)\b/gi;

/** The unsuitable topic a text touches, or null. */
export function unsuitableTopic(text: string): string | null {
  const t = text.replace(NOT_THE_TOPIC, ' ');
  for (const [topic, re] of PATTERNS) if (re.test(t)) return topic;
  return null;
}

/**
 * Article text is held to a narrower rule than questions and captions (26-final-review R-6): history, war and biology
 * stay, because they are what an encyclopedia is for at this level, but abortion and sexual violence or exploitation do
 * not. The general rule above would also catch "the naked eye", same-sex marriage and book titles.
 */
export const ARTICLE_UNSUITABLE = /\b(abortion|rape|raped|raping|prostitut\w*|sexual (favou?rs|violence|abuse|slavery)|sex scandal|kill her child)\b/i;
