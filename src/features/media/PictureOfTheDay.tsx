/**
 * Picture of the day on Home (23-media-library Req 19): one library picture for each day of the year, taken from
 * `/media/daily.json` (366 entries, one for 29 February too). It links to the Pictures screen and names its author
 * and licence under the print.
 */
import { Link } from '../../app/navigation.tsx';
import { Print } from '../../design/paper.tsx';
import { thumbUrl, useMedia } from '../../lib/media/media.ts';
import { daysAhead, monthDay } from '../home/today.ts';
import './media.css';

export interface DailyPicture {
  id: string;
  article: string;
  articleTitle: string;
  caption: string;
  tw: number;
  th: number;
  author: string;
  licence: string;
  licenceUrl: string;
  page: string;
}

/** The entry for a date: its place among the 366 days of a leap year (1 January is 0). */
export function pictureForDay(days: readonly DailyPicture[], date: Date): DailyPicture | undefined {
  if (days.length === 0) return undefined;
  return days[daysAhead('01-01', monthDay(date)) % days.length];
}

export function PictureOfTheDay({ today = new Date() }: { today?: Date }) {
  const file = useMedia<{ days: DailyPicture[] }>('daily.json');
  const pic = file.status === 'ready' ? pictureForDay(file.data.days, today) : undefined;
  if (!pic) return null;
  return (
    <section className="potd" aria-labelledby="potd-title">
      <Print
        className="potd__print"
        to={`/media?pic=${pic.id}`}
        src={thumbUrl(`img/${pic.id}.webp`)}
        alt={pic.caption}
        caption={pic.articleTitle}
        captionSize={24}
        width={300}
        aspect={`${pic.tw} / ${pic.th}`}
        tilt={-2.5}
        tape={[{ left: '38%', width: 100, tilt: 5, tone: 'yellow' }]}
      />
      <div className="potd__text">
        <h2 id="potd-title">Picture of the day</h2>
        <p className="potd__caption">{pic.caption}</p>
        <p className="potd__credit">
          By {pic.author || 'an unknown author'} ·{' '}
          <a href={pic.licenceUrl || pic.page} rel="noreferrer">
            {pic.licence}
          </a>{' '}
          ·{' '}
          <a href={pic.page} rel="noreferrer">
            Commons page
          </a>
        </p>
        <p>
          <Link to={`/article/${pic.article}`}>Read about {pic.articleTitle}</Link> · <Link to="/media">More pictures</Link>
        </p>
      </div>
    </section>
  );
}
