import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { FontPreload } from './font-preload';

export const metadata: Metadata = {
  title: '甜橙爸双面尼 - 选品后台管理系统',
  description: '精选联盟供应链，双面尼女装大衣选品管理系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Providers>
          <FontPreload />
          {children}
        </Providers>
      </body>
    </html>
  );
}
