'use client';

import dynamic from 'next/dynamic';

export const LazyHero3D = dynamic(
  () => import('./index').then((mod) => mod.Hero3D),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 -z-10 bg-muted/5 animate-pulse" />,
  }
);
