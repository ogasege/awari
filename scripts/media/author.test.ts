/** 24-review-4 Req 2: credits show a name, not a link. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { authorName, sameAuthor } from './allow.ts';

describe('authorName', () => {
  it('turns an account link into the account name', () => {
    expect(authorName('https://www.flickr.com/people/anoldent/')).toBe('anoldent on Flickr');
    expect(authorName('https://www.flickr.com/photos/lynnsta/')).toBe('lynnsta on Flickr');
    expect(authorName('https://pixabay.com/it/users/Pezibear-526143/')).toBe('Pezibear on Pixabay');
    expect(authorName('http://picasaweb.com/kroome111')).toBe('kroome111 on Picasa');
    expect(authorName('https://commons.wikimedia.org/wiki/User:Rachel_Sanchez_Thwing')).toBe('Rachel Sanchez Thwing on Wikimedia Commons');
    expect(authorName('http://oc.wikipedia.org/wiki/Utilizaire:Annabelle_deFC')).toBe('Annabelle deFC on Wikipedia');
    expect(authorName('www.scientificanimations.com')).toBe('scientificanimations.com');
  });

  it('cuts an address, a link or an e-mail off a name', () => {
    expect(authorName('Photograph by Mike Peel ( www.mikepeel.net ).')).toBe('Photograph by Mike Peel');
    expect(authorName('MONNIER Franck (monnierfranck@hotmail.com)')).toBe('MONNIER Franck');
    expect(authorName('Ross Elliott https://www.flickr.com/people/ross_elliott/')).toBe('Ross Elliott');
    expect(authorName('Helge Fahrnberger / www.helge.at')).toBe('Helge Fahrnberger');
    expect(authorName('Richard Ling <wikipedia@rling.com>')).toBe('Richard Ling');
    expect(authorName('Pedro Szekely at https://www.flickr.com/photos/pedrosz/')).toBe('Pedro Szekely');
  });

  it('reads the name out of licence boilerplate', () => {
    expect(authorName('No machine-readable author provided. Marcus Cyron assumed (based on copyright claims).')).toBe('Marcus Cyron');
    expect(authorName(`This Photo was taken by Timothy A. Gonsalves . Feel free to use my photos, but please mention me as the author. ${'x '.repeat(40)}`)).toBe('Timothy A. Gonsalves');
  });

  it('leaves an ordinary name alone, and is the same author as Commons', () => {
    expect(authorName('Diliff')).toBe('Diliff');
    expect(authorName('Jane Smith')).toBe('Jane Smith');
    expect(sameAuthor('anoldent on Flickr', 'https://www.flickr.com/people/anoldent/')).toBe(true);
    expect(sameAuthor('Jane Smith', 'Someone Else')).toBe(false);
  });

  it('never shows a link, and never grows (property)', () => {
    const word = fc.stringMatching(/^[A-Za-z]{2,9}$/);
    fc.assert(
      fc.property(fc.array(word, { minLength: 1, maxLength: 4 }), word, (name, user) => {
        const text = `${name.join(' ')} https://www.flickr.com/people/${user}/`;
        const out = authorName(text);
        expect(out).not.toMatch(/https?:|www\./);
        expect(out.length).toBeLessThanOrEqual(text.length);
        expect(authorName(`https://www.flickr.com/people/${user}/`)).toBe(`${user} on Flickr`);
      }),
      { numRuns: 200 },
    );
  });
});

describe('authorName fallbacks', () => {
  it('an uploader alone is the name', () => {
    expect(authorName('Original uploader was Cormullion at en.wikipedia')).toBe('Cormullion');
  });
});

describe('authorName from an e-mail address alone', () => {
  it('uses the part before the @ as a name', () => {
    expect(authorName('Lorenz.King@geogr.uni-giessen.de')).toBe('Lorenz King');
  });
});
