import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import { about } from '@/lib/content';
import { site } from '@content/site';
import styles from './about.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const a = await about();
  return { title: a.title, description: a.summary };
}

/*
  His line, his words, and the label. The label is the contact; there is no
  contact page. His personal handle appears here once.
*/
export default async function AboutPage() {
  const a = await about();
  return (
    <Shell current="about">
      <h1 className="sr">about</h1>
      <div className={`${styles.body} prose`} dangerouslySetInnerHTML={{ __html: a.html }} />
      <p className={`${styles.by} print`}>
        <a className={`${styles.link} tap`} href={site.personalUrl} rel="me noopener">
          @{site.personalHandle}
        </a>
      </p>
    </Shell>
  );
}
