/**
 * Guided tours (20-tours): three journeys that turn the globe from stop
 * to stop and open each stop's article. The coordinates are the place
 * each stop names; the sentences students read come from the articles.
 */
import { centreOn, type Rotation } from '../atlas/globeMath.ts';

export interface TourStop {
  /** Bundled article, such as "earth/nile". */
  article: string;
  title: string;
  /** The place the globe turns to, in words. */
  place: string;
  lat: number;
  lon: number;
}

export interface Tour {
  id: string;
  title: string;
  blurb: string;
  stops: readonly TourStop[];
}

export const TOURS: readonly Tour[] = [
  {
    id: 'rivers',
    title: 'Great rivers of the world',
    blurb: 'Follow eight rivers from Egypt to Australia, and see where millions of people live beside them.',
    stops: [
      { article: 'earth/nile', title: 'The Nile', place: 'near Luxor, Egypt', lat: 25.7, lon: 32.64 },
      { article: 'earth/amazon-river', title: 'The Amazon', place: 'near Manaus, Brazil', lat: -3.12, lon: -60.02 },
      { article: 'earth/yangtze-river', title: 'The Yangtze', place: 'near Wuhan, China', lat: 30.59, lon: 114.3 },
      { article: 'earth/mississippi-river', title: 'The Mississippi', place: 'near St. Louis, United States', lat: 38.63, lon: -90.2 },
      { article: 'earth/danube', title: 'The Danube', place: 'in Budapest, Hungary', lat: 47.5, lon: 19.05 },
      { article: 'earth/congo-river', title: 'The Congo', place: 'near Kinshasa, Democratic Republic of the Congo', lat: -4.3, lon: 15.3 },
      { article: 'earth/ganges', title: 'The Ganges', place: 'at Varanasi, India', lat: 25.32, lon: 83.01 },
      { article: 'earth/murray-river', title: 'The Murray', place: 'near Mildura, Australia', lat: -34.2, lon: 142.15 },
    ],
  },
  {
    id: 'wonders',
    title: 'Wonders of the ancient world',
    blurb: 'Visit the wonders the ancient Greeks wrote about, from Egypt to Babylon, and Olympia where the Statue of Zeus stood.',
    stops: [
      { article: 'ancient/great-pyramid-of-giza', title: 'The Great Pyramid of Giza', place: 'Giza, Egypt', lat: 29.98, lon: 31.13 },
      { article: 'ancient/hanging-gardens-of-babylon', title: 'The Hanging Gardens of Babylon', place: 'Babylon, Iraq', lat: 32.54, lon: 44.42 },
      { article: 'ancient/temple-of-artemis', title: 'The Temple of Artemis', place: 'Ephesus, Türkiye', lat: 37.95, lon: 27.36 },
      { article: 'ancient/ancient-olympic-games', title: 'The Ancient Olympic Games', place: 'Olympia, Greece, where the Statue of Zeus stood', lat: 37.64, lon: 21.63 },
      { article: 'ancient/colossus-of-rhodes', title: 'The Colossus of Rhodes', place: 'Rhodes, Greece', lat: 36.45, lon: 28.23 },
      { article: 'ancient/lighthouse-of-alexandria', title: 'The Lighthouse of Alexandria', place: 'Alexandria, Egypt', lat: 31.21, lon: 29.89 },
    ],
  },
  {
    id: 'volcanoes',
    title: 'Volcanoes of the Ring of Fire',
    blurb: 'Follow the Ring of Fire round the Pacific Ocean, from Indonesia to Japan and on to the Americas.',
    stops: [
      { article: 'earth/krakatoa', title: 'Krakatoa', place: 'Sunda Strait, Indonesia', lat: -6.1, lon: 105.42 },
      { article: 'earth/mount-merapi', title: 'Mount Merapi', place: 'Java, Indonesia', lat: -7.54, lon: 110.45 },
      { article: 'earth/mount-tambora', title: 'Mount Tambora', place: 'Sumbawa, Indonesia', lat: -8.25, lon: 118.0 },
      { article: 'earth/mount-aso', title: 'Mount Aso', place: 'Kyushu, Japan', lat: 32.88, lon: 131.1 },
      { article: 'earth/mount-fuji', title: 'Mount Fuji', place: 'Honshu, Japan', lat: 35.36, lon: 138.73 },
      { article: 'earth/mount-rainier', title: 'Mount Rainier', place: 'Washington, United States', lat: 46.85, lon: -121.76 },
      { article: 'earth/popocatepetl', title: 'Popocatépetl', place: 'Mexico', lat: 19.02, lon: -98.62 },
    ],
  },
];

/** The tour with this id, if there is one. */
export function tourById(id: string): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}

/** Moves between stops, staying inside the tour (Req 3, 4). */
export function stepStop(count: number, index: number, delta: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.min(count - 1, Math.max(0, index + delta));
}

/** The globe rotation that puts a stop at the centre. */
export function stopRotation(stop: Pick<TourStop, 'lat' | 'lon'>): Rotation {
  return centreOn(stop.lon, stop.lat);
}

/** The article path of a stop, with a tour bar on the page that opens. */
export function stopHref(tour: Tour, index: number): string {
  const stop = tour.stops[stepStop(tour.stops.length, index, 0)];
  return `/article/${stop?.article ?? ''}?tour=${tour.id}&stop=${index + 1}`;
}

/** The one-based `stop` in an address, as a zero-based index inside the tour. */
export function stopFromPath(path: string, count: number): number {
  const n = Number(new URLSearchParams(path.split('?')[1] ?? '').get('stop'));
  return stepStop(count, Number.isFinite(n) && n >= 1 ? Math.floor(n) - 1 : 0, 0);
}
