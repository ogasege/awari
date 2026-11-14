/**
 * The lead rules (26-final-review D-17 to D-22), on the text the design
 * review quoted. Every expectation is a sentence the reviewer read on
 * screen, so a rule that stops working shows up as the defect itself.
 */
import { describe, expect, it } from 'vitest';
import { cleanLeadSection, isHatnote, isNameNoise, stripLeadArtifacts } from './leads.ts';
import { summarise, wordCount } from './sections.ts';

describe('stripLeadArtifacts', () => {
  it('D-17: drops the brackets a stripped audio or IPA template left behind', () => {
    expect(
      stripLeadArtifacts(
        'Cape Verde ( ()) or Cabo Verde ( (), ) (Portuguese: Cabo Verde, pronounced: [ˈkabu ˈveɾdɨ]), ' +
          'officially the Republic of Cabo Verde, is an island country in Africa.',
      ),
    ).toBe(
      'Cape Verde or Cabo Verde, officially the Republic of Cabo Verde, is an island country in Africa.',
    );
    expect(stripLeadArtifacts('Andorra ( ()), officially the Principality of Andorra, is landlocked.')).toBe(
      'Andorra, officially the Principality of Andorra, is landlocked.',
    );
    expect(stripLeadArtifacts('Bolivia (), officially the Plurinational State of Bolivia, is in South America.')).toBe(
      'Bolivia, officially the Plurinational State of Bolivia, is in South America.',
    );
    expect(stripLeadArtifacts('Belize ( ()) is a country in Central America.')).toBe(
      'Belize is a country in Central America.',
    );
  });

  it('D-22: takes the native name and the pronunciation out of the first sentence', () => {
    expect(
      stripLeadArtifacts('Hungary (Hungarian: Magyarország [ˈmɒɟɒrorsaːɡ] ()) is a landlocked country in Europe.'),
    ).toBe('Hungary is a landlocked country in Europe.');
    expect(stripLeadArtifacts('Italy (Italian: Italia [iˈtaːlja]) is a country in Southern Europe.')).toBe(
      'Italy is a country in Southern Europe.',
    );
    expect(stripLeadArtifacts('The Nile (النيل an-nīl) is a river in Africa.')).toBe('The Nile is a river in Africa.');
    expect(stripLeadArtifacts('Croatia ( () kroh-AY-shə) is a republic in Central Europe.')).toBe(
      'Croatia is a republic in Central Europe.',
    );
    expect(
      stripLeadArtifacts('A telescope (from the Ancient Greek τῆλε, tele "far" and σκοπεῖν, skopein "to look") makes things look closer.'),
    ).toBe('A telescope makes things look closer.');
  });

  it('keeps what the bracket says besides the name', () => {
    expect(stripLeadArtifacts('Chad (French: Tchad; Arabic: تشاد, officially called the Republic of Chad), is landlocked.')).toBe(
      'Chad (officially called the Republic of Chad) is landlocked.',
    );
    expect(
      stripLeadArtifacts('A sphinx (Boeotian: φίξ [pʰíːks], plural sphinxes or sphinges) is a mythical creature.'),
    ).toBe('A sphinx (plural sphinxes or sphinges) is a mythical creature.');
    expect(
      stripLeadArtifacts('The Republic of China (ROC; Chinese: 中華民國; pinyin: Zhōnghuá Mínguó), known as Taiwan, is in East Asia.'),
    ).toBe('The Republic of China (ROC), known as Taiwan, is in East Asia.');
  });

  it('leaves dates, numbers and binomials alone', () => {
    expect(stripLeadArtifacts('Ibn Battuta (1304 – 1368 or 1369) was a Moroccan explorer.')).toBe(
      'Ibn Battuta (1304 – 1368 or 1369) was a Moroccan explorer.',
    );
    expect(stripLeadArtifacts('Barack Hussein Obama II ( (); born August 4, 1961) is an American politician.')).toBe(
      'Barack Hussein Obama II (born August 4, 1961) is an American politician.',
    );
    expect(
      stripLeadArtifacts('Haile Selassie I (Ge\'ez: ቀዳማዊ ኀይለ ሥላሴ; July 23, 1892 - August 27, 1975) was Emperor of Ethiopia.'),
    ).toBe('Haile Selassie I (July 23, 1892 - August 27, 1975) was Emperor of Ethiopia.');
    expect(stripLeadArtifacts('The islands cover slightly over 4,000 km2 (1,500 sq mi).')).toBe(
      'The islands cover slightly over 4,000 km2 (1,500 sq mi).',
    );
    expect(stripLeadArtifacts('A cheetah (Acinonyx jubatus) is a medium large cat.')).toBe(
      'A cheetah (Acinonyx jubatus) is a medium large cat.',
    );
  });

  it('repairs a bracket the extract never closed', () => {
    expect(
      stripLeadArtifacts('Ukraine (Ukrainian: Україна, romanized: Ukraïna, pronounced [ʊkrɐˈjinɐ] () is a country in Eastern Europe.'),
    ).toBe('Ukraine is a country in Eastern Europe.');
    expect(
      stripLeadArtifacts('Luxembourg (officially called the Grand Duchy of Luxembourg (Luxembourgish: Groussherzogtum Lëtzebuerg, French: Grand-Duché) is landlocked.'),
    ).toBe('Luxembourg officially called the Grand Duchy of Luxembourg is landlocked.');
  });

  it('D-19: cuts the citation marker the extract left in', () => {
    expect(stripLeadArtifacts("Laos, officially the Lao People's Democratic Republic (LPDR), is a country in Southeast Asia.[4]")).toBe(
      "Laos, officially the Lao People's Democratic Republic (LPDR), is a country in Southeast Asia.",
    );
  });

  it('changes nothing in a lead that was already clean', () => {
    const clean = 'Nigeria is a country in West Africa. Its capital is Abuja.';
    expect(stripLeadArtifacts(clean)).toBe(clean);
    // An article's own missing comma is not this function's business.
    const own = 'Colombia officially the Republic of Colombia, is a tropical country.';
    expect(stripLeadArtifacts(own)).toBe(own);
  });
});

describe('isNameNoise', () => {
  it('is true for what a stripped template leaves and for names and transcriptions', () => {
    for (const noise of ['', ' ', ';', '()', ' , ', 'Hungarian: Magyarország', 'romanized: Hayastān', 'pronounced [ˈpraha]', '日本', 'al-BAY-nee-ə', ' or ', ' listen']) {
      expect(isNameNoise(noise), noise).toBe(true);
    }
  });

  it('is false for a clause, a date and a fact', () => {
    for (const keep of ['officially called the Republic of Chad', 'plural sphinxes or sphinges', 'born August 4, 1961', '1,500 sq mi', 'ROC', 'a country entirely surrounded by land']) {
      expect(isNameNoise(keep), keep).toBe(false);
    }
  });
});

describe('isHatnote', () => {
  it('D-18: knows the note that says what the article is not about', () => {
    expect(isHatnote('Not to be mistaken for the Muhammad Ali who became Muhammad Ali Pasha')).toBe(true);
    expect(isHatnote('This article is about iron the metal. For the tool called iron, see ironing.')).toBe(true);
    expect(isHatnote('Iron is a chemical element and a metal.')).toBe(false);
  });
});

describe('cleanLeadSection', () => {
  it('D-18: drops a hatnote so the lead starts with the definition', () => {
    expect(
      cleanLeadSection([
        'Not to be mistaken for the Muhammad Ali who became Muhammad Ali Pasha, Wali of Egypt and Sudan',
        'Muhammad Ali was an American boxer. He won three world titles.',
      ])[0],
    ).toBe('Muhammad Ali was an American boxer. He won three world titles.');
  });

  it('D-20: drops a disambiguation stub that ends in a colon', () => {
    expect(
      cleanLeadSection(['Energy can mean various things:', 'In physics, energy is a property of matter and space.'])[0],
    ).toBe('In physics, energy is a property of matter and space.');
  });

  it('D-20: drops a trailing sentence that introduces a list the extract lost', () => {
    expect(
      cleanLeadSection(['An electric current is a flow of electric charge through a conductor. The equation of current is:', 'I'])[0],
    ).toBe('An electric current is a flow of electric charge through a conductor.');
  });

  it('D-19: joins a sentence the extract split in two paragraphs', () => {
    expect(
      cleanLeadSection(['Mount Fuji (富士山, Fuji-san) is the tallest mountain in Japan, at', '3,776 metres (12,388 ft) high. It is also a volcano.'])[0],
    ).toBe('Mount Fuji (Fuji-san) is the tallest mountain in Japan, at 3,776 metres (12,388 ft) high. It is also a volcano.');
    expect(
      cleanLeadSection(['A helicopter (also often used: chopper or heli) is a kind of aircraft. A helicopter lifts up off', 'of the ground because of its rotors.'])[0],
    ).toBe('A helicopter is a kind of aircraft. A helicopter lifts up off of the ground because of its rotors.');
  });

  it('D-19: gives back a full stop the extract lost, but drops a fragment that stops on a function word', () => {
    expect(cleanLeadSection(['Brazil has won the tournament five times'])[0]).toBe(
      'Brazil has won the tournament five times.',
    );
    expect(cleanLeadSection(['A clock is a device that tells the time. It can also show the date as well as'])[0]).toBe(
      'A clock is a device that tells the time.',
    );
  });

  it('never empties the lead', () => {
    expect(cleanLeadSection(['Not to be mistaken for the other one'])).toEqual(['Not to be mistaken for the other one']);
    expect(cleanLeadSection([])).toEqual([]);
  });
});

describe('summarise', () => {
  it('D-21: keeps the lead inside the word budget', () => {
    const long = `Basketball ${'is a team sport played by two teams of five players on a rectangular court '.repeat(3)}. It is popular.`;
    expect(wordCount(summarise([{ heading: '', paragraphs: [long] }]))).toBeLessThanOrEqual(45);
  });

  it('falls back to a later sentence of the article when the first is too long', () => {
    const first = `A ${'very '.repeat(50)}long first sentence.`;
    const summary = summarise([{ heading: '', paragraphs: [`${first} It is short.`] }]);
    expect(summary).toBe('It is short.');
  });

  it('still gives the first two sentences when they fit', () => {
    expect(summarise([{ heading: '', paragraphs: ['Nigeria is in Africa. Its capital is Abuja. More text.'] }])).toBe(
      'Nigeria is in Africa. Its capital is Abuja.',
    );
  });
});
