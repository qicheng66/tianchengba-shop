'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { getAllProducts, setFeatured, updateFeaturedOrder } from '@/lib/store';
import { Product } from '@/lib/types';
import { Star, StarOff, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

export default function FeaturedPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const refresh = useCallback(() => {
    const products = getAllProducts();
    setAllProducts(products.filter((p) => p.reviewStatus === '已通过'));
    setFeaturedProducts(
      products
        .filter((p) => p.isFeatured)
        .sort((a, b) => a.featuredOrder - b.featuredOrder)
    );
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (!isAdmin) { router.replace('/dashboard'); return; }
    refresh();
  }, [isAuthenticated, isLoading, isAdmin, router, refresh]);

  const handleToggleFeatured = (id: string, current: boolean) => {
    setFeatured(id, !current);
    refresh();
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const ids = featuredProducts.map((p) => p.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    updateFeaturedOrder(ids);
    refresh();
  };

  const handleMoveDown = (idx: number) => {
    if (idx === featuredProducts.length - 1) return;
    const ids = featuredProducts.map((p) => p.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    updateFeaturedOrder(ids);
    refresh();
  };

  const nonFeaturedProducts = allProducts.filter((p) => !p.isFeatured);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B6B6B' }}>加载中...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}>
            优推管理
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
            管理首页优推商品，共 {featuredProducts.length} 件优推
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="gold-btn px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
        >
          <Star size={16} />
          添加优推
        </button>
      </div>

      {/* Add Featured */}
      {showAdd && nonFeaturedProducts.length > 0 && (
        <div className="rounded-xl p-4 mb-4 fade-in" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#101010' }}>选择产品添加为优推</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {nonFeaturedProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => { handleToggleFeatured(product.id, false); }}
                className="rounded-lg p-2 text-left hover:bg-gray-50 transition-colors"
                style={{ border: '1px solid #E8E0D4' }}
              >
                <div
                  className="aspect-square rounded-md mb-1 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: '#F8F4EC' }}
                >
                  {product.images[0]?.data ? (
                    <img src={product.images[0].data} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px]" style={{ color: '#6B6B6B' }}>无图</span>
                  )}
                </div>
                <p className="text-[11px] truncate" style={{ color: '#101010' }}>{product.name}</p>
                <p className="text-[10px]" style={{ color: '#6B6B6B' }}>{product.code} · ¥{product.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured List */}
      {featuredProducts.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <Star size={48} className="mx-auto mb-3" style={{ color: '#E8E0D4' }} />
          <p className="text-sm" style={{ color: '#6B6B6B' }}>暂无优推商品，点击「添加优推」开始设置</p>
        </div>
      ) : (
        <div className="space-y-2">
          {featuredProducts.map((product, idx) => (
            <div
              key={product.id}
              className="rounded-xl p-3 flex items-center gap-3 card-hover"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #B9975B40' }}
            >
              {/* Order */}
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <button
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="p-0.5 rounded disabled:opacity-30"
                >
                  <ArrowUp size={14} style={{ color: '#B9975B' }} />
                </button>
                <span
                  className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#B9975B', color: '#FFFFFF' }}
                >
                  {idx + 1}
                </span>
                <button
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === featuredProducts.length - 1}
                  className="p-0.5 rounded disabled:opacity-30"
                >
                  <ArrowDown size={14} style={{ color: '#B9975B' }} />
                </button>
              </div>

              {/* Thumbnail */}
              <div
                className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: '#F8F4EC' }}
              >
                {product.images[0]?.data ? (
                  <img src={product.images[0].data} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px]" style={{ color: '#6B6B6B' }}>无图</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Star size={12} style={{ color: '#B9975B' }} fill="#B9975B" />
                  <span className="text-xs" style={{ color: '#B9975B' }}>优推 {idx + 1}</span>
                  <span className="text-xs" style={{ color: '#6B6B6B' }}>{product.code}</span>
                </div>
                <p className="text-sm font-medium truncate" style={{ color: '#101010' }}>{product.name}</p>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>
                  {product.style} · ¥{product.price} · {product.status}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => handleToggleFeatured(product.id, true)}
                className="p-2 rounded-lg hover:bg-red-50 shrink-0"
                title="取消优推"
              >
                <StarOff size={16} style={{ color: '#C62828' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
