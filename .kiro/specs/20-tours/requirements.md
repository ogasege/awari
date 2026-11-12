# Requirements: Guided tours

## Requirements

1. THE app SHALL offer three tours at `/tours`: Great rivers of the world,
   Wonders of the ancient world, Volcanoes of the Ring of Fire.
2. EACH tour SHALL have six to eight stops; each stop has a title, a
   latitude and longitude, a one-line note and a bundled article.
3. THE route `/tours/:id` SHALL show the globe turned to the current stop
   with the stop marked, the stop's article summary, and buttons for
   previous stop, next stop and "Open the article".
4. WHEN the student moves between stops, THE globe SHALL turn so the stop
   is at its centre, with no animation other than the straightening and
   lift of objects on hover (design rule 8).
5. "Open the article" SHALL open the stop's article page, which SHALL show
   a tour bar ("Stop 3 of 7") with links to the next and previous stop
   and back to the tour.
6. EVERY stop's article SHALL exist in the packs; the tour SHALL work
   offline and by keyboard.
