import type { Metadata, Viewport } from 'next';
import Billboard from '@/components/study/Billboard';
import PhotoViewport from '@/components/study/PhotoViewport';

export const metadata: Metadata = {
  title: { absolute: 'i crave imperfection — light' },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#050807', colorScheme: 'dark' };

export default function LightStudy() {
  return (
    <PhotoViewport>
      <h1 className="sr">i crave imperfection</h1>
      <Billboard lighting />
    </PhotoViewport>
  );
}
