/**
 * The reviewed list of Wikidata items behind the timeline
 * (07-timeline, 18-world-timeline). SPARQL over all of Wikidata timed
 * out and returned unreviewed items, so every entry was chosen by hand
 * for students aged 9 to 14: births, foundings, openings, launches,
 * publications and independence days. No wars, attacks or disasters, and
 * no deaths.
 *
 * The date and label of each item are read from Wikidata at build time;
 * nothing here is a date, except `expect`, which a curator adds as a
 * cross-check: when Wikidata gives another day, the event is dropped.
 * An item whose property is missing, coarse or ambiguous is dropped by
 * `buildEvents` and reported by the build.
 *
 * Events for the articles of the subject packs come from the `event`
 * marker in `subject-topics.ts`; events for countries come from
 * `COUNTRY_DAYS` below. This file holds everything else.
 */
import type { TimelineSubject } from '../../src/lib/packs/types.ts';
import { EXTRA_ITEMS } from './timeline-extras.ts';
import type { EventKind, TimelineItem } from './timeline.ts';

type Row = readonly [qid: string, name: string];

const make =
  (subject: TimelineSubject, kind: EventKind) =>
  (...rows: Row[]): TimelineItem[] =>
    rows.map(([qid]) => ({ qid, subject, kind }));

/** African countries whose inception day was checked by hand in 07-timeline. */
export const INDEPENDENT_AFRICA = make('countries', 'independence')(
  ['Q79', 'Egypt'], ['Q962', 'Benin'], ['Q963', 'Botswana'], ['Q967', 'Burundi'], ['Q657', 'Chad'],
  ['Q974', 'Democratic Republic of the Congo'], ['Q977', 'Djibouti'], ['Q983', 'Equatorial Guinea'],
  ['Q986', 'Eritrea'], ['Q1050', 'Eswatini'], ['Q1006', 'Guinea'], ['Q1020', 'Malawi'], ['Q912', 'Mali'],
  ['Q1025', 'Mauritania'], ['Q1027', 'Mauritius'], ['Q1029', 'Mozambique'], ['Q1039', 'São Tomé and Príncipe'],
  ['Q1042', 'Seychelles'], ['Q958', 'South Sudan'], ['Q948', 'Tunisia'], ['Q945', 'Togo'], ['Q953', 'Zambia'],
  ['Q954', 'Zimbabwe'],
);

/**
 * Independence days checked two ways: the curator's expected day must
 * equal the day Wikidata gives for the country's inception. A guess that
 * is wrong simply drops out of the build with a report. Keys are the
 * country article ids.
 */
export const COUNTRY_DAYS: Readonly<Record<string, string>> = {
  // Africa (Wikidata gives only a year for several, so they drop out)
  nigeria: '1960-10-01', ghana: '1957-03-06', kenya: '1963-12-12', senegal: '1960-04-04', uganda: '1962-10-09',
  sudan: '1956-01-01', morocco: '1956-03-02', libya: '1951-12-24', 'sierra-leone': '1961-04-27',
  'the-gambia': '1965-02-18', cameroon: '1960-01-01', madagascar: '1960-06-26', somalia: '1960-07-01',
  rwanda: '1962-07-01', 'burkina-faso': '1960-08-05', niger: '1960-08-03', 'ivory-coast': '1960-08-07',
  gabon: '1960-08-17', 'republic-of-the-congo': '1960-08-15', 'central-african-republic': '1960-08-13',
  lesotho: '1966-10-04', namibia: '1990-03-21', angola: '1975-11-11', 'guinea-bissau': '1973-09-24',
  'cape-verde': '1975-07-05', comoros: '1975-07-06', algeria: '1962-07-05', liberia: '1847-07-26',
  // Asia
  india: '1947-08-15', pakistan: '1947-08-14', indonesia: '1945-08-17', vietnam: '1945-09-02',
  israel: '1948-05-14', singapore: '1965-08-09', 'sri-lanka': '1948-02-04', myanmar: '1948-01-04',
  bangladesh: '1971-03-26', cambodia: '1953-11-09', laos: '1953-10-22', jordan: '1946-05-25',
  lebanon: '1943-11-22', syria: '1946-04-17', kuwait: '1961-06-19', qatar: '1971-09-03', bahrain: '1971-08-15',
  'united-arab-emirates': '1971-12-02', maldives: '1965-07-26', kazakhstan: '1991-12-16', uzbekistan: '1991-09-01',
  georgia: '1991-04-09', armenia: '1991-09-21', azerbaijan: '1991-10-18', turkmenistan: '1991-10-27',
  tajikistan: '1991-09-09', kyrgyzstan: '1991-08-31', 'east-timor': '2002-05-20', brunei: '1984-01-01',
  iraq: '1932-10-03', philippines: '1946-07-04', 'south-korea': '1948-08-15', malaysia: '1957-08-31',
  // Europe
  iceland: '1944-06-17', norway: '1905-06-07', finland: '1917-12-06', estonia: '1918-02-24',
  latvia: '1918-11-18', lithuania: '1918-02-16', poland: '1918-11-11', slovenia: '1991-06-25',
  croatia: '1991-06-25', 'north-macedonia': '1991-09-08', belarus: '1991-07-27', moldova: '1991-08-27',
  ukraine: '1991-08-24', cyprus: '1960-08-16', malta: '1964-09-21', albania: '1912-11-28', bulgaria: '1908-09-22',
  montenegro: '2006-06-03', serbia: '2006-06-05', ireland: '1922-12-06', slovakia: '1993-01-01',
  // North America
  'united-states': '1776-07-04', canada: '1867-07-01', mexico: '1810-09-16', cuba: '1902-05-20',
  jamaica: '1962-08-06', 'trinidad-and-tobago': '1962-08-31', barbados: '1966-11-30', 'the-bahamas': '1973-07-10',
  belize: '1981-09-21', haiti: '1804-01-01', 'dominican-republic': '1844-02-27', 'costa-rica': '1821-09-15',
  guatemala: '1821-09-15', honduras: '1821-09-15', 'el-salvador': '1821-09-15', nicaragua: '1821-09-15',
  panama: '1903-11-03', grenada: '1974-02-07', 'saint-lucia': '1979-02-22', dominica: '1978-11-03',
  // South America
  brazil: '1822-09-07', argentina: '1816-07-09', chile: '1818-02-12', peru: '1821-07-28', colombia: '1810-07-20',
  venezuela: '1811-07-05', bolivia: '1825-08-06', paraguay: '1811-05-14', uruguay: '1825-08-25',
  guyana: '1966-05-26', suriname: '1975-11-25',
  // Oceania
  australia: '1901-01-01', 'new-zealand': '1907-09-26', 'papua-new-guinea': '1975-09-16', fiji: '1970-10-10',
  samoa: '1962-01-01', tonga: '1970-06-04', vanuatu: '1980-07-30', 'solomon-islands': '1978-07-07',
  kiribati: '1979-07-12', tuvalu: '1978-10-01', nauru: '1968-01-31', palau: '1994-10-01',
  'marshall-islands': '1986-10-21', 'federated-states-of-micronesia': '1986-11-03',
};

/** Space missions, launched (P619). */
const launched = make('space', 'launched')(
  ['Q80811', 'Sputnik 1'], ['Q49901', 'Explorer 1'], ['Q1159927', 'Luna 2'], ['Q182524', 'Vostok 1'],
  ['Q211761', 'Salyut 1'], ['Q43653', 'Apollo 11'], ['Q190776', 'Skylab'], ['Q48475', 'Voyager 2'],
  ['Q48469', 'Voyager 1'], ['Q2513', 'Hubble Space Telescope'], ['Q201771', 'Mars Pathfinder'],
  ['Q165585', 'Cassini–Huygens'], ['Q48485', 'Curiosity'], ['Q186447', 'James Webb Space Telescope'],
);

/** Scientists whose article names them, so the timeline can link to it. */
const physicists: TimelineItem[] = [
  { qid: 'Q680', subject: 'physics', kind: 'born', link: 'physics/battery' }, // Alessandro Volta
  { qid: 'Q1585', subject: 'physics', kind: 'born', link: 'physics/ohms-law' }, // Georg Ohm
  { qid: 'Q8750', subject: 'physics', kind: 'born', link: 'physics/electricity' }, // Michael Faraday
  { qid: 'Q34969', subject: 'physics', kind: 'born', link: 'physics/lightning' }, // Benjamin Franklin
];

/** Births of people in each subject (P569). */
const born: TimelineItem[] = [
  ...physicists,
  ...make('space', 'born')(['Q8963', 'Johannes Kepler'], ['Q307', 'Galileo Galilei'], ['Q619', 'Nicolaus Copernicus'], ['Q43027', 'Edwin Hubble'], ['Q410', 'Carl Sagan'], ['Q17714', 'Stephen Hawking'], ['Q11740', 'Katherine Johnson'], ['Q7327', 'Yuri Gagarin'], ['Q1615', 'Neil Armstrong'], ['Q2252', 'Buzz Aldrin'], ['Q44371', 'Valentina Tereshkova'], ['Q49285', 'Sally Ride'], ['Q34091', 'Mae Jemison']),
  ...make('physics', 'born')(['Q9095', 'James Clerk Maxwell'], ['Q675', 'André-Marie Ampère'], ['Q9036', 'Nikola Tesla'], ['Q8743', 'Thomas Edison']),
  ...make('science', 'born')(['Q7186', 'Marie Curie'], ['Q937', 'Albert Einstein']),
  ...make('wildlife', 'born')(['Q1035', 'Charles Darwin'], ['Q37970', 'Gregor Mendel'], ['Q230491', 'Mary Anning'], ['Q184746', 'Jane Goodall']),
  ...make('body', 'born')(['Q529', 'Louis Pasteur'], ['Q7474', 'Rosalind Franklin']),
  ...make('inventions', 'born')(['Q9041', 'James Watt'], ['Q34286', 'Alexander Graham Bell'], ['Q7259', 'Ada Lovelace'], ['Q7251', 'Alan Turing'], ['Q11641', 'Grace Hopper'], ['Q80', 'Tim Berners-Lee'], ['Q494455', 'Orville Wright'], ['Q1396131', 'Wilbur Wright']),
  ...make('arts', 'born')(['Q1339', 'Johann Sebastian Bach'], ['Q254', 'Wolfgang Amadeus Mozart'], ['Q5673', 'Hans Christian Andersen'], ['Q5582', 'Vincent van Gogh'], ['Q52651', 'Jesse Owens'], ['Q1189', 'Usain Bolt'], ['Q146256', 'Miriam Makeba']),
  ...make('people', 'born')(['Q762', 'Leonardo da Vinci'], ['Q93182', 'Louis Braille'], ['Q37103', 'Florence Nightingale'], ['Q38203', 'Helen Keller'], ['Q3355', 'Amelia Earhart'], ['Q1001', 'Mahatma Gandhi'], ['Q8620', 'Kwame Nkrumah'], ['Q8023', 'Nelson Mandela'], ['Q8027', 'Martin Luther King Jr.'], ['Q43033', 'Desmond Tutu'], ['Q155845', 'Chinua Achebe'], ['Q41488', 'Wole Soyinka'], ['Q46795', 'Wangari Maathai'], ['Q1254', 'Kofi Annan'], ['Q43179', 'Ellen Johnson Sirleaf'], ['Q32732', 'Malala Yousafzai']),
];

/** Organisations and places founded or established (P571). */
const founded: TimelineItem[] = [
  ...make('space', 'founded')(['Q42262', 'The European Space Agency']),
  { qid: 'Q23548', subject: 'space', kind: 'founded', label: 'NASA' },
  { qid: 'Q42944', subject: 'science', kind: 'founded', label: 'CERN' },
  ...make('ancient', 'founded')(['Q1065', 'United Nations'], ['Q7809', 'UNESCO'], ['Q740308', 'UNICEF'], ['Q42970', 'Amnesty International'], ['Q7178', 'Red Cross and Red Crescent Movement']),
  ...make('body', 'founded')(['Q7817', 'World Health Organization']),
  ...make('wildlife', 'founded')(['Q117892', 'WWF International']),
  ...make('arts', 'founded')(['Q131626', 'Smithsonian Institution'], ['Q131454', 'Library of Congress'], ['Q19675', 'Louvre Museum'], ['Q40970', 'International Olympic Committee'], ['Q253414', 'FIFA']),
  ...make('inventions', 'founded')(['Q52', 'Wikipedia']),
  { qid: 'Q351', subject: 'earth', kind: 'established' },
];

/** Landmarks and projects, officially opened (P1619). */
const opened: TimelineItem[] = [
  ...make('inventions', 'opened')(['Q899', 'Suez Canal'], ['Q83125', 'Tower Bridge'], ['Q7350', 'Panama Canal'], ['Q44440', 'Golden Gate Bridge'], ['Q10257', 'Channel Tunnel'], ['Q12495', 'Burj Khalifa'], ['Q57965', 'Tokyo Skytree']),
  ...make('arts', 'opened')(['Q45178', 'Sydney Opera House']),
  { qid: 'Q40605', subject: 'science', kind: 'opened', label: 'The Large Hadron Collider' },
];

export const TIMELINE_ITEMS: readonly TimelineItem[] = [
  ...INDEPENDENT_AFRICA,
  ...launched,
  ...born,
  ...founded,
  ...opened,
  ...EXTRA_ITEMS,
];
