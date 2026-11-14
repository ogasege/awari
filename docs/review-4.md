# Review 4: after the media library (owner, 14 Nov)

The library works: 3,982 pictures, galleries on articles, the Pictures screen, picture of the day, picture questions. This is what I saw in the retaken screenshots that still needs fixing. New spec `24-review-4`, one task and one commit per item, tests where a test is possible, no stopping to ask. Keep the turn alive while any long job runs. Guardrails unchanged: no push, no deploy, no `terraform apply`, no spending.

## Captions (the biggest problem now)

1. Many captions are still file names or not English. From `media-1440.png` and the article strips: "British Museum.FotoThalerTamas", "Colosseum 1000689", "Colosseum-Entrance LII", "Coliseo medieval", "1402 The Tongue", "Sakyamuni, Lao Tzu, and Confucius - Google Art ProjectFXD", "Glimpse of the Eddington@Sundy event", "Raizal Biocultural Landscape of San Andrés $", "Ackerbau zur Selbstversorgung auf Guadalcanal, Salomonen", "Acceso a Abai", "Cahaya Pertama Menyinari Puncak", "Global hair texture map version translated into Spanish".
   - A caption must be a plain English phrase a ten-year-old can read, taken from the Commons English description. If the only text is a file name, a camera or catalogue number, a photographer's handle, or another language, either use the Commons English description field, or the structured caption (`wbgetentities` labels in `en`) if one exists, or drop the picture. Never show a file name as a caption.
   - Add tests with these exact strings as failing examples, and report how many pictures each rule dropped.
2. Credits must show a name, not a link: the picture of the day says "By https://www.flickr.com/people/anoldent/". Take the author's display name from the Commons metadata; if there is only a URL, show the account name from it ("anoldent on Flickr").

## Relevance

3. The Pictures screen opens on dull or odd pictures ("A pen placed on paper", "Suspended glass disc insulator unit", an angiogram, "Eggs and egg liquids at hot food markets"). Order the default view by quality: Commons Featured, Quality and Valued pictures first, then lead pictures of articles, with one picture per article before any repeats. Nothing clinical or off-putting on the first screen.
4. Lead pictures: the Colosseum article leads with a close-up of one arch while the first gallery picture is the famous view. For every article the lead must be the highest-scored picture that shows the whole subject. Check the judges' path and the 30 biggest countries by eye with the design reviewer.
5. Home "Today's quiz: Leg" shows a beetle. The quiz card's picture must come from the quiz's own article, and a test must fail if it does not.
6. Eighteen articles still have fewer than four pictures. List them in the report; fill them from their Commons category if good pictures exist, otherwise leave them and say so.

## Picture questions

7. "What is this a picture of?" was asked of a diagram comparing star sizes, with Mars, Star, Supernova and Neptune as answers. Picture questions may only use photographs of one clear subject (no diagrams, maps, charts or collages), the answer must be the picture's own article, and the wrong answers must be the same kind of thing (all planets, all animals, all landmarks).
8. The Castle's text question "Fill the gap: This ____ is made deep inside the Sun" offers "gives", "million", "energy", "photosphere". Wrong answers in a fill-the-gap question must be the same part of speech and plausible. Fix the generator, regenerate, and add a property test.

## Credits page

9. `credits-1440.png` is 150,208 px tall. Show the picture credits one subject at a time (or paged, 100 per page) with search, and keep the summary and the non-picture credits on the first view.

## Left over from review 3

10. The continent stamp sheets on the Atlas and the stamp book are still rows of grey squares. Each slot should be a small perforated stamp shape: found ones show the country's stamp picture, unfound ones show a faint "?" with the same outline.
11. The Search result for "Nile Delta" still begins with raw coordinates ("117°E / 30.900; 31.117"). Strip coordinate strings from snippets and from article leads, with that string as a test case.

## Finish

12. Retake the screenshots, run `npm run licences`, `submission-check` and `offline-check`, update the write-up numbers, and reply with what changed, what could not be fixed, and what you need from me.
