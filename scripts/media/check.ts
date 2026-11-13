/**
 * Compares what Awari shows for an image with what the Commons API says (23-media-library Req 1, 2).
 * Pure: the API answer is passed in.
 */
import { parseLicence, plainText, sameAuthor, sameLicence } from './allow.ts';

/** What Awari shows for one bundled image. */
export interface ShownRecord {
  /** The bundled path, such as `photos/earth.jpg` or `packs/img/nigeria.jpg`. */
  path: string;
  /** The Commons file title, such as `File:Lagos skyline with marina.jpg`. */
  title: string;
  author: string;
  licence: string;
}

/** The parts of a Commons imageinfo answer the check needs. */
export interface CommonsAnswer {
  missing?: boolean;
  imagerepository?: string;
  imageinfo?: Array<{
    width?: number;
    height?: number;
    sha1?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string } | undefined>;
  }>;
}

export type Problem =
  | 'missing-on-commons'
  | 'not-shared-repository'
  | 'licence-unreadable'
  | 'licence-off-list'
  | 'licence-differs'
  | 'restrictions'
  | 'author-differs';

/** What the check found out about one image. */
export interface Verified {
  path: string;
  title: string;
  ok: boolean;
  problems: Problem[];
  commonsAuthor: string;
  commonsLicence: string;
  commonsLicenceUrl: string;
  restrictions: string;
  sha1: string;
  width: number;
  height: number;
  page: string;
}

/** Checks one image against the answer for its title (undefined when the API returned nothing for it). */
export function checkRecord(shown: ShownRecord, answer: CommonsAnswer | undefined): Verified {
  const info = answer?.imageinfo?.[0];
  const meta = info?.extmetadata ?? {};
  const commonsLicence = plainText(meta['LicenseShortName']?.value);
  const commonsAuthor = plainText(meta['Artist']?.value);
  const restrictions = plainText(meta['Restrictions']?.value);
  const problems: Problem[] = [];
  if (!answer || answer.missing || !info) {
    problems.push('missing-on-commons');
  } else {
    // Asked on Commons itself a Commons file is `local`; asked through a wiki it is `shared`. Anything else is not Commons.
    if (answer.imagerepository !== 'shared' && answer.imagerepository !== 'local') problems.push('not-shared-repository');
    const theirs = parseLicence(commonsLicence);
    const ours = parseLicence(shown.licence);
    if (!theirs) {
      problems.push(commonsLicence === '' ? 'licence-unreadable' : 'licence-off-list');
    } else if (!ours || !sameLicence(ours, theirs)) {
      problems.push('licence-differs');
    }
    if (restrictions !== '') problems.push('restrictions');
    // Public-domain files often have no author worth comparing; a named author must match.
    const needsAuthor = !(parseLicence(commonsLicence)?.family === 'pd' && (commonsAuthor === '' || /unknown/i.test(commonsAuthor)));
    if (needsAuthor && !sameAuthor(shown.author, commonsAuthor)) problems.push('author-differs');
  }
  return {
    path: shown.path,
    title: shown.title,
    ok: problems.length === 0,
    problems,
    commonsAuthor,
    commonsLicence,
    commonsLicenceUrl: plainText(meta['LicenseUrl']?.value),
    restrictions,
    sha1: info?.sha1 ?? '',
    width: info?.width ?? 0,
    height: info?.height ?? 0,
    page: info?.descriptionurl ?? '',
  };
}

/** The exit code of `npm run licences`: non-zero when any image has a problem. */
export function exitCode(results: readonly Verified[]): number {
  return results.every((r) => r.ok) ? 0 : 1;
}
