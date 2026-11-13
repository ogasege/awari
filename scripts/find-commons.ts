/**
 * Looks up candidate Commons files for lead-photo overrides: for each search
 * phrase prints the top files with licence, author and width, so a human
 * can pick the recognisable landmark. Throttled; every request has a timeout.
 *
 *   npx tsx scripts/find-commons.ts "Taj Mahal" "Great Wall of China"
 */
const API = 'https://commons.wikimedia.org/w/api.php';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const strip = (s: string | undefined) => (s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

interface Page {
  title: string;
  imageinfo?: Array<{ width: number; extmetadata?: Record<string, { value?: string }> }>;
}

for (const phrase of process.argv.slice(2)) {
  await sleep(2500);
  const q = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${phrase} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '6',
    prop: 'imageinfo',
    iiprop: 'size|extmetadata',
    format: 'json',
    origin: '*',
  });
  try {
    const res = await fetch(`${API}?${q}`, {
      headers: { 'User-Agent': 'Awari/0.1 (hackathon; lead photo review)' },
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    const json = JSON.parse(text) as { query?: { pages: Record<string, Page> } };
    console.log(`## ${phrase}`);
    for (const p of Object.values(json.query?.pages ?? {})) {
      const info = p.imageinfo?.[0];
      const ext = info?.extmetadata ?? {};
      console.log(`  ${p.title.replace(/^File:/, '')} | ${strip(ext.LicenseShortName?.value)} | ${strip(ext.Artist?.value).slice(0, 30)} | ${info?.width}px`);
    }
  } catch (e) {
    console.log(`## ${phrase}\n  skipped: ${(e as Error).message}`);
  }
}
