/**
 * The reviewed list of Wikidata items behind the timeline
 * (07-timeline Req 1.1, 1.5). SPARQL over all of Wikidata timed out and
 * returned unreviewed items, so every entry here was chosen by hand for
 * students aged 9 to 14: births, foundings, openings, launches and
 * independence days. No wars, attacks or disasters, and no deaths.
 *
 * The date and label of each item are read from Wikidata at build time;
 * nothing below is a date. An item whose property is missing, coarse or
 * ambiguous is dropped by `buildEvents` and reported by the build.
 */
import type { TimelineSubject } from '../../src/lib/packs/types.ts';
import type { EventKind, TimelineItem } from './timeline.ts';

const make =
  (subject: TimelineSubject, kind: EventKind) =>
  (...qids: string[]): TimelineItem[] =>
    qids.map((qid) => ({ qid, subject, kind }));

/** African and other countries on the day they became independent (P571). */
const independent = make('countries', 'independence')(
  'Q79', // Egypt
  'Q962', // Benin
  'Q963', // Botswana
  'Q967', // Burundi
  'Q657', // Chad
  'Q974', // Democratic Republic of the Congo
  'Q977', // Djibouti
  'Q983', // Equatorial Guinea
  'Q986', // Eritrea
  'Q1050', // Eswatini
  'Q1006', // Guinea
  'Q1020', // Malawi
  'Q912', // Mali
  'Q1025', // Mauritania
  'Q1027', // Mauritius
  'Q1029', // Mozambique
  'Q1039', // São Tomé and Príncipe
  'Q1042', // Seychelles
  'Q958', // South Sudan
  'Q948', // Tunisia
  'Q945', // Togo
  'Q953', // Zambia
  'Q954', // Zimbabwe
);

/** Space missions, launched (P619). */
const launched = make('science', 'launched')(
  'Q80811', // Sputnik 1
  'Q49901', // Explorer 1
  'Q1159927', // Luna 2
  'Q182524', // Vostok 1
  'Q211761', // Salyut 1
  'Q43653', // Apollo 11
  'Q190776', // Skylab
  'Q48475', // Voyager 2
  'Q48469', // Voyager 1
  'Q2513', // Hubble Space Telescope
  'Q201771', // Mars Pathfinder
  'Q165585', // Cassini–Huygens
  'Q48485', // Curiosity
  'Q186447', // James Webb Space Telescope
);

/** Scientists, inventors and thinkers, born (P569). */
const scientists = make('science', 'born')(
  'Q8963', // Johannes Kepler
  'Q307', // Galileo Galilei
  'Q619', // Nicolaus Copernicus
  'Q9041', // James Watt
  'Q675', // André-Marie Ampère
  'Q9095', // James Clerk Maxwell
  'Q1035', // Charles Darwin
  'Q37970', // Gregor Mendel
  'Q529', // Louis Pasteur
  'Q7259', // Ada Lovelace
  'Q34286', // Alexander Graham Bell
  'Q8743', // Thomas Edison
  'Q9036', // Nikola Tesla
  'Q7186', // Marie Curie
  'Q937', // Albert Einstein
  'Q7251', // Alan Turing
  'Q11641', // Grace Hopper
  'Q43027', // Edwin Hubble
  'Q7474', // Rosalind Franklin
  'Q11740', // Katherine Johnson
  'Q410', // Carl Sagan
  'Q17714', // Stephen Hawking
  'Q80', // Tim Berners-Lee
  'Q230491', // Mary Anning
  'Q184746', // Jane Goodall
);

/** Writers, artists, athletes, leaders and explorers, born (P569). */
const people = make('people', 'born')(
  'Q762', // Leonardo da Vinci
  'Q1339', // Johann Sebastian Bach
  'Q254', // Wolfgang Amadeus Mozart
  'Q5673', // Hans Christian Andersen
  'Q93182', // Louis Braille
  'Q37103', // Florence Nightingale
  'Q5582', // Vincent van Gogh
  'Q494455', // Orville Wright
  'Q1396131', // Wilbur Wright
  'Q38203', // Helen Keller
  'Q3355', // Amelia Earhart
  'Q1001', // Mahatma Gandhi
  'Q8620', // Kwame Nkrumah
  'Q52651', // Jesse Owens
  'Q8023', // Nelson Mandela
  'Q8027', // Martin Luther King Jr.
  'Q146256', // Miriam Makeba
  'Q43033', // Desmond Tutu
  'Q155845', // Chinua Achebe
  'Q41488', // Wole Soyinka
  'Q46795', // Wangari Maathai
  'Q1254', // Kofi Annan
  'Q43179', // Ellen Johnson Sirleaf
  'Q7327', // Yuri Gagarin
  'Q1615', // Neil Armstrong
  'Q2252', // Buzz Aldrin
  'Q44371', // Valentina Tereshkova
  'Q49285', // Sally Ride
  'Q34091', // Mae Jemison
  'Q1189', // Usain Bolt
  'Q32732', // Malala Yousafzai
);

/** Organisations founded or established (P571). */
const founded = make('history', 'founded')(
  'Q131626', // Smithsonian Institution
  'Q7178', // International Red Cross and Red Crescent Movement
  'Q40970', // International Olympic Committee
  'Q253414', // FIFA
  'Q1065', // United Nations
  'Q7809', // UNESCO
  'Q740308', // UNICEF
  'Q7817', // World Health Organization
  'Q42970', // Amnesty International
  'Q117892', // WWF International
  'Q52', // Wikipedia
  'Q131454', // Library of Congress
  'Q19675', // Louvre Museum
);

/** Landmarks and projects, officially opened (P1619). */
const opened = make('history', 'opened')(
  'Q899', // Suez Canal
  'Q83125', // Tower Bridge
  'Q7350', // Panama Canal
  'Q44440', // Golden Gate Bridge
  'Q45178', // Sydney Opera House
  'Q10257', // Channel Tunnel
  'Q12495', // Burj Khalifa
  'Q57965', // Tokyo Skytree
);

/** Scientists whose article names them, so the timeline can link to it. */
const physicists: TimelineItem[] = [
  { qid: 'Q680', subject: 'science', kind: 'born', link: 'physics/battery' }, // Alessandro Volta
  { qid: 'Q1585', subject: 'science', kind: 'born', link: 'physics/ohms-law' }, // Georg Ohm
  { qid: 'Q8750', subject: 'science', kind: 'born', link: 'physics/electricity' }, // Michael Faraday
  { qid: 'Q34969', subject: 'science', kind: 'born', link: 'physics/lightning' }, // Benjamin Franklin
];

/** Space and science organisations (P571) and a science facility (P1619). */
const scienceOrganisations: TimelineItem[] = [
  { qid: 'Q23548', subject: 'science', kind: 'founded', label: 'NASA' },
  { qid: 'Q42944', subject: 'science', kind: 'founded', label: 'CERN' },
  { qid: 'Q42262', subject: 'science', kind: 'founded', label: 'The European Space Agency' },
  { qid: 'Q40605', subject: 'science', kind: 'opened', label: 'The Large Hadron Collider' },
];

/** A national park, established (P571). */
const parks: TimelineItem[] = [
  { qid: 'Q351', subject: 'history', kind: 'established' },
];

export const TIMELINE_ITEMS: readonly TimelineItem[] = [
  ...independent,
  ...launched,
  ...scientists,
  ...physicists,
  ...scienceOrganisations,
  ...people,
  ...founded,
  ...opened,
  ...parks,
];
