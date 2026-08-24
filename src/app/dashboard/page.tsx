'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { getDashboardStats } from '@/lib/store';
import { DashboardStats } from '@/lib/types';
import {
  Package,
  TrendingUp,
  XCircle,
  Tag,
  Percent,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
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

  const statCards = [
    { label: '总产品数', value: stats.totalProducts, icon: Package, color: '#B9975B' },
    { label: '在售', value: stats.onSaleCount, icon: TrendingUp, color: '#2E7D32' },
    { label: '售罄', value: stats.soldOutCount, icon: XCircle, color: '#C62828' },
    { label: '正价', value: stats.regularPriceCount, icon: Tag, color: '#5C6BC0' },
    { label: '特价', value: stats.salePriceCount, icon: Percent, color: '#D84315' },
  ];

  const styleEntries = Object.entries(stats.styleCounts) as [string, number][];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-xl md:text-2xl font-bold"
          style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}
        >
          工作台
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
          欢迎回来，数据一览
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4 card-hover"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: card.color + '15' }}
              >
                <card.icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#101010' }}>
              {card.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Style Distribution */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#101010' }}>
            风格分布
          </h2>
          <div className="space-y-3">
            {styleEntries.map(([style, count]) => {
              const pct = stats.totalProducts > 0 ? (count / stats.totalProducts) * 100 : 0;
              return (
                <div key={style}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#101010' }}>{style}</span>
                    <span style={{ color: '#6B6B6B' }}>{count} 件</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#F0EBE1' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: '#B9975B',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#101010' }}>
            快捷操作
          </h2>
          <div className="space-y-2">
            <Link
              href="/products/new"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #E8E0D4' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#B9975B15' }}
                >
                  <Package size={16} style={{ color: '#B9975B' }} />
                </div>
                <span className="text-sm" style={{ color: '#101010' }}>新增产品</span>
              </div>
              <ArrowRight size={14} style={{ color: '#6B6B6B' }} />
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #E8E0D4' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#5C6BC015' }}
                >
                  <Tag size={16} style={{ color: '#5C6BC0' }} />
                </div>
                <span className="text-sm" style={{ color: '#101010' }}>管理产品</span>
              </div>
              <ArrowRight size={14} style={{ color: '#6B6B6B' }} />
            </Link>
            <Link
              href="/stats"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #E8E0D4' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#2E7D3215' }}
                >
                  <TrendingUp size={16} style={{ color: '#2E7D32' }} />
                </div>
                <span className="text-sm" style={{ color: '#101010' }}>查看统计</span>
              </div>
              <ArrowRight size={14} style={{ color: '#6B6B6B' }} />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
