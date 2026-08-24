'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { getDashboardStats, getAllProducts } from '@/lib/store';
import { DashboardStats, STYLE_OPTIONS, StyleType } from '@/lib/types';
import { Package, TrendingUp, Tag, Percent, BarChart3 } from 'lucide-react';

export default function StatsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    setStats(getDashboardStats());
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !stats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B6B6B' }}>加载中...</p>
        </div>
      </AppLayout>
    );
  }

  const products = getAllProducts();
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const avgPrice = products.length > 0 ? totalValue / products.length : 0;
  const avgCommission = products.length > 0
    ? products.reduce((sum, p) => sum + p.commission, 0) / products.length
    : 0;

  const styleColors: Record<string, string> = {
    '大牌老钱': '#B9975B',
    '韩系风': '#5C6BC0',
    '极简': '#2E7D32',
    '千金风': '#AB47BC',
    '重工系': '#D84315',
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}>
          数据统计
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>产品数据概览</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#B9975B15' }}>
              <Package size={16} style={{ color: '#B9975B' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#101010' }}>{stats.totalProducts}</p>
          <p className="text-xs" style={{ color: '#6B6B6B' }}>总产品数</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2E7D3215' }}>
              <TrendingUp size={16} style={{ color: '#2E7D32' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#101010' }}>{stats.onSaleCount}</p>
          <p className="text-xs" style={{ color: '#6B6B6B' }}>在售产品</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5C6BC015' }}>
              <Tag size={16} style={{ color: '#5C6BC0' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#101010' }}>¥{avgPrice.toFixed(0)}</p>
          <p className="text-xs" style={{ color: '#6B6B6B' }}>平均价格</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D8431515' }}>
              <Percent size={16} style={{ color: '#D84315' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#101010' }}>{avgCommission.toFixed(1)}%</p>
          <p className="text-xs" style={{ color: '#6B6B6B' }}>平均佣金</p>
        </div>
      </div>

      {/* Style Distribution Chart */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#101010' }}>
            <BarChart3 size={16} style={{ color: '#B9975B' }} />
            风格分布
          </h2>
          <div className="space-y-3">
            {STYLE_OPTIONS.map((style) => {
              const count = stats.styleCounts[style as StyleType] || 0;
              const pct = stats.totalProducts > 0 ? (count / stats.totalProducts) * 100 : 0;
              const color = styleColors[style] || '#B9975B';
              return (
                <div key={style}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {style}
                    </span>
                    <span style={{ color: '#6B6B6B' }}>{count} 件 ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 rounded-full" style={{ backgroundColor: '#F0EBE1' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status & Zone */}
        <div className="space-y-4">
          <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#101010' }}>状态分布</h2>
            <div className="flex gap-4">
              <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#2E7D3210' }}>
                <p className="text-xl font-bold" style={{ color: '#2E7D32' }}>{stats.onSaleCount}</p>
                <p className="text-xs" style={{ color: '#2E7D32' }}>在售</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#C6282810' }}>
                <p className="text-xl font-bold" style={{ color: '#C62828' }}>{stats.soldOutCount}</p>
                <p className="text-xs" style={{ color: '#C62828' }}>售罄</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#101010' }}>价格专区</h2>
            <div className="flex gap-4">
              <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#5C6BC010' }}>
                <p className="text-xl font-bold" style={{ color: '#5C6BC0' }}>{stats.regularPriceCount}</p>
                <p className="text-xs" style={{ color: '#5C6BC0' }}>正价</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#D8431510' }}>
                <p className="text-xl font-bold" style={{ color: '#D84315' }}>{stats.salePriceCount}</p>
                <p className="text-xs" style={{ color: '#D84315' }}>特价</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Range Distribution */}
      <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#101010' }}>价格区间分布</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: '0-500', min: 0, max: 500 },
            { label: '500-1000', min: 500, max: 1000 },
            { label: '1000-2000', min: 1000, max: 2000 },
            { label: '2000-3000', min: 2000, max: 3000 },
            { label: '3000-5000', min: 3000, max: 5000 },
            { label: '5000+', min: 5000, max: Infinity },
          ].map((range) => {
            const count = products.filter((p) => p.price >= range.min && p.price < range.max).length;
            return (
              <div key={range.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F8F4EC' }}>
                <p className="text-lg font-bold" style={{ color: '#B9975B' }}>{count}</p>
                <p className="text-[10px]" style={{ color: '#6B6B6B' }}>¥{range.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
