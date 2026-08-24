'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { getPendingReviewProducts, approveProduct, rejectProduct, getAllProducts } from '@/lib/store';
import { Product } from '@/lib/types';
import { Check, X, Eye, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const refresh = useCallback(() => {
    if (filter === 'pending') {
      setProducts(getPendingReviewProducts());
    } else if (filter === 'all') {
      setProducts(getAllProducts());
    } else {
      const statusMap = { approved: '已通过', rejected: '已打回' } as const;
      setProducts(getAllProducts().filter((p) => p.reviewStatus === statusMap[filter]));
    }
  }, [filter]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (!isAdmin) { router.replace('/dashboard'); return; }
    refresh();
  }, [isAuthenticated, isLoading, isAdmin, router, refresh]);

  const handleApprove = (id: string) => {
    if (!isAdmin) return;
    approveProduct(id, isAdmin ? 'admin' : '');
    refresh();
  };

  const handleReject = (id: string) => {
    if (!isAdmin) return;
    rejectProduct(id, isAdmin ? 'admin' : '', rejectReason || undefined);
    setRejectingId(null);
    setRejectReason('');
    refresh();
  };

  const pendingCount = getPendingReviewProducts().length;

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B6B6B' }}>加载中...</p>
        </div>
      </AppLayout>
    );
  }

  const filterTabs = [
    { key: 'pending' as const, label: '待审核', count: pendingCount },
    { key: 'approved' as const, label: '已通过' },
    { key: 'rejected' as const, label: '已打回' },
    { key: 'all' as const, label: '全部' },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}>
          产品审核
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
          {pendingCount > 0 ? `${pendingCount} 件产品等待审核` : '暂无待审核产品'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            style={{
              backgroundColor: filter === tab.key ? '#B9975B' : '#FFFFFF',
              color: filter === tab.key ? '#FFFFFF' : '#101010',
              border: `1px solid ${filter === tab.key ? '#B9975B' : '#E8E0D4'}`,
            }}
          >
            {tab.label}
            {'count' in tab && tab.count ? (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: filter === tab.key ? 'rgba(255,255,255,0.3)' : '#C6282820',
                  color: filter === tab.key ? '#FFFFFF' : '#C62828',
                }}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <Clock size={48} className="mx-auto mb-3" style={{ color: '#E8E0D4' }} />
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            {filter === 'pending' ? '暂无待审核产品' : '没有匹配的产品'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl p-4 card-hover"
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${
                  product.reviewStatus === '待审核' ? '#D8431530' :
                  product.reviewStatus === '已打回' ? '#C6282830' : '#E8E0D4'
                }`,
              }}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <Link href={`/products/${product.id}/edit`}>
                  <div
                    className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: '#F8F4EC' }}
                  >
                    {product.images[0]?.data ? (
                      <img src={product.images[0].data} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs" style={{ color: '#6B6B6B' }}>暂无图片</span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium" style={{ color: '#6B6B6B' }}>{product.code}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: product.reviewStatus === '待审核' ? '#D8431515' : product.reviewStatus === '已打回' ? '#C6282815' : '#2E7D3215',
                        color: product.reviewStatus === '待审核' ? '#D84315' : product.reviewStatus === '已打回' ? '#C62828' : '#2E7D32',
                      }}
                    >
                      {product.reviewStatus}
                    </span>
                    {product.isFeatured && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#B9975B15', color: '#B9975B' }}>
                        优推{product.featuredOrder}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-0.5 truncate" style={{ color: '#101010' }}>{product.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>
                    {product.style} · {product.color} · ¥{product.price} · 佣金{product.commission}%
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#6B6B6B' }}>
                    上传者：{product.createdBy} · {new Date(product.createdAt).toLocaleString('zh-CN')}
                  </p>
                  {product.rejectReason && (
                    <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: '#C62828' }}>
                      <AlertCircle size={10} />
                      打回原因：{product.rejectReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="p-2 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                    title="查看详情"
                  >
                    <Eye size={14} style={{ color: '#6B6B6B' }} />
                  </Link>
                  {product.reviewStatus === '待审核' && (
                    <>
                      <button
                        onClick={() => handleApprove(product.id)}
                        className="p-2 rounded-lg hover:bg-green-50 flex items-center justify-center"
                        title="通过审核"
                      >
                        <Check size={14} style={{ color: '#2E7D32' }} />
                      </button>
                      <button
                        onClick={() => { setRejectingId(product.id); setRejectReason(''); }}
                        className="p-2 rounded-lg hover:bg-red-50 flex items-center justify-center"
                        title="打回"
                      >
                        <X size={14} style={{ color: '#C62828' }} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Reject Reason Input */}
              {rejectingId === product.id && (
                <div className="mt-3 pt-3 border-t flex gap-2 items-end" style={{ borderColor: '#E8E0D4' }}>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="打回原因（选填）"
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleReject(product.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: '#C62828', color: '#FFFFFF' }}
                  >
                    确认打回
                  </button>
                  <button
                    onClick={() => setRejectingId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ color: '#6B6B6B' }}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
