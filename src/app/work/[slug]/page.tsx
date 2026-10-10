import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import Photo from '@/components/Photo';
import { neighbours, piece, pieces } from '@/lib/content';
import styles from './piece.module.css';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await pieces()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const p = await piece(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary, type: 'article' },
  };
}

/*
  One piece: its number and title, the spec, his words, the photographs in
  order, and the pieces either side of it. The photographs are untreated.
*/
export default async function PiecePage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const p = await piece(slug);
  if (!p) notFound();
  const { previous, next } = await neighbours(slug);

  const spec: Array<[string, string | undefined]> = [
    ['kind', p.kind],
    ['materials', p.materials.length ? p.materials.join(', ') : undefined],
    ['tools', p.tools.length ? p.tools.join(', ') : undefined],
    ['year', p.year ? String(p.year) : undefined],
    ['owner', p.owner],
    ['hours', p.hours ? String(p.hours) : undefined],
    ['camera', p.camera === 'broken' ? 'broken' : undefined],
  ];
  const rows = spec.filter((r): r is [string, string] => r[1] !== undefined);

  return (
    <Shell current="work" className={styles.page}>
      <article className={styles.piece}>
        <h1 className={styles.head}>
          <span className="print print--ink">{p.number}</span>
          <em className={styles.title}>{p.title}</em>
        </h1>

        <div className="seam" aria-hidden="true" />

        {rows.length > 0 && (
          <dl className={styles.spec}>
            {rows.map(([key, value]) => (
              <div key={key} className={styles.specRow}>
                <dt className="print">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {p.html && <div className={`${styles.body} prose`} dangerouslySetInnerHTML={{ __html: p.html }} />}

        <div className={styles.photos}>
          {p.photos.map((photo, i) => (
            <Photo key={photo.file} photo={photo} sizes="(max-width: 48rem) 100vw, 48rem" priority={i === 0} />
          ))}
        </div>

        <div className="seam" aria-hidden="true" />

        <nav className={styles.next} aria-label="other pieces">
          {previous && (
            <Link href={`/work/${previous.slug}`} className={`${styles.nextLink} print`}>
              <span className={styles.nextKey}>previous</span>
              <span className={styles.nextTitle}>
                {previous.number} {previous.title}
              </span>
            </Link>
          )}
          {next && (
            <Link href={`/work/${next.slug}`} className={`${styles.nextLink} print`}>
              <span className={styles.nextKey}>next</span>
              <span className={styles.nextTitle}>
                {next.number} {next.title}
              </span>
            </Link>
          )}
        </nav>
      </article>
    </Shell>
  );
}
