import type { Viewport } from 'next';
import Billboard from '@/components/study/Billboard';
import PhotoViewport from '@/components/study/PhotoViewport';

export const viewport: Viewport = { themeColor: '#050807', colorScheme: 'dark' };

export default function Home() {
  return (
    <PhotoViewport>
      <h1 className="sr">i crave imperfection</h1>
      <Billboard lighting />
    </PhotoViewport>
  );
}
