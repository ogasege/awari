/**
 * The bar across the top of an article opened from a tour (20-tours
 * Req 5): which stop this is, with links to the previous and next stops
 * and back to the tour. It shows only when the address names a tour and
 * the article is that stop's.
 */
import { Link, usePath } from '../../app/navigation.tsx';
import { stopFromPath, stopHref, tourById } from './tours.ts';
import './tours.css';

export function TourBar({ article }: { article: string }) {
  const path = usePath();
  const query = new URLSearchParams(path.split('?')[1] ?? '');
  const tour = tourById(query.get('tour') ?? '');
  if (!tour) return null;
  const index = stopFromPath(path, tour.stops.length);
  if (tour.stops[index]?.article !== article) return null;
  const last = index === tour.stops.length - 1;
  return (
    <nav className="tourbar" aria-label="Tour">
      <span>
        {tour.title}: stop {index + 1} of {tour.stops.length}
      </span>
      {index > 0 ? <Link to={stopHref(tour, index - 1)}>Previous stop</Link> : null}
      {last ? (
        <Link to="/tours">Finish the tour</Link>
      ) : (
        <Link to={stopHref(tour, index + 1)}>Next stop</Link>
      )}
      <Link to={`/tours/${tour.id}?stop=${index + 1}`}>Back to the tour</Link>
    </nav>
  );
}
