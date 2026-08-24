'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import {
  getSortedProducts,
  deleteProduct,
  batchDeleteProducts,
  batchUpdateStatus,
} from '@/lib/store';
import { Product, StyleType, PriceZone, ProductStatus, STYLE_OPTIONS } from '@/lib/types';
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  X,
  CheckSquare,
  Square,
  Package,
} from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';

export default function ProductsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [styleFilter, setStyleFilter] = useState<StyleType | ''>('');
  const [zoneFilter, setZoneFilter] = useState<PriceZone | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setProducts(getSortedProducts());
  }, [refreshKey]);

  const filtered = useMemo(() => {
    let result = products;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.label.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q)
      );
    }
    if (styleFilter) {
      result = result.filter((p) => p.style === styleFilter);
    }
    if (zoneFilter) {
      result = result.filter((p) => p.priceZone === zoneFilter);
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [products, search, styleFilter, zoneFilter, statusFilter]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }, [filtered, selectedIds.size]);

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.size} 个产品？`)) return;
    batchDeleteProducts(Array.from(selectedIds));
    setSelectedIds(new Set());
    setRefreshKey((k) => k + 1);
  }, [selectedIds]);

  const handleBatchStatus = useCallback((status: ProductStatus) => {
    if (selectedIds.size === 0) return;
    batchUpdateStatus(Array.from(selectedIds), status);
    setSelectedIds(new Set());
    setRefreshKey((k) => k + 1);
  }, [selectedIds]);

  const handleDelete = useCallback((id: string) => {
    if (!confirm('确定删除此产品？')) return;
    deleteProduct(id);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleToggleStatus = useCallback((id: string, current: ProductStatus) => {
    const newStatus: ProductStatus = current === '在售' ? '售罄' : '在售';
    batchUpdateStatus([id], newStatus);
    setRefreshKey((k) => k + 1);
  }, []);

  const clearFilters = () => {
    setSearch('');
    setStyleFilter('');
    setZoneFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = search || styleFilter || zoneFilter || statusFilter;

  if (isLoading || !isAuthenticated) {
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-xl md:text-2xl font-bold"
            style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}
          >
            产品管理
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>
            共 {products.length} 件产品{filtered.length !== products.length ? `，筛选显示 ${filtered.length} 件` : ''}
          </p>
        </div>
        <Link
          href="/products/new"
          className="gold-btn px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">新增</span>
        </Link>
      </div>

      {/* Search & Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B6B6B' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索品名、编号、货号、颜色..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E0D4',
              color: '#101010',
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 rounded-lg text-sm flex items-center gap-1.5"
            style={{
              backgroundColor: showFilters ? '#B9975B' : '#FFFFFF',
              color: showFilters ? '#FFFFFF' : '#101010',
              border: '1px solid #E8E0D4',
            }}
          >
            <Filter size={14} />
            筛选
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: viewMode === 'grid' ? '#B9975B' : '#FFFFFF',
              color: viewMode === 'grid' ? '#FFFFFF' : '#6B6B6B',
              border: '1px solid #E8E0D4',
            }}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: viewMode === 'list' ? '#B9975B' : '#FFFFFF',
              color: viewMode === 'list' ? '#FFFFFF' : '#6B6B6B',
              border: '1px solid #E8E0D4',
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div
          className="rounded-xl p-4 mb-3 fade-in"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}
        >
          <div className="flex flex-wrap gap-3">
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value as StyleType | '')}
              className="px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ border: '1px solid #E8E0D4', color: '#101010', backgroundColor: '#FAFAFA' }}
            >
              <option value="">全部风格</option>
              {STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value as PriceZone | '')}
              className="px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ border: '1px solid #E8E0D4', color: '#101010', backgroundColor: '#FAFAFA' }}
            >
              <option value="">全部专区</option>
              <option value="正价">正价</option>
              <option value="特价">特价</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
              className="px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ border: '1px solid #E8E0D4', color: '#101010', backgroundColor: '#FAFAFA' }}
            >
              <option value="">全部状态</option>
              <option value="在售">在售</option>
              <option value="售罄">售罄</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                style={{ color: '#B9975B' }}
              >
                <X size={14} />
                清除
              </button>
            )}
          </div>
        </div>
      )}

      {/* Batch Actions */}
      {selectedIds.size > 0 && (
        <div
          className="rounded-xl p-3 mb-3 flex flex-wrap items-center gap-2 fade-in"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}
        >
          <span className="text-sm" style={{ color: '#101010' }}>
            已选 {selectedIds.size} 件
          </span>
          <button
            onClick={() => handleBatchStatus('在售')}
            className="px-3 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: '#2E7D3215', color: '#2E7D32' }}
          >
            批量上架
          </button>
          <button
            onClick={() => handleBatchStatus('售罄')}
            className="px-3 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: '#D8431515', color: '#D84315' }}
          >
            批量下架
          </button>
          <button
            onClick={handleBatchDelete}
            className="px-3 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: '#C6282815', color: '#C62828' }}
          >
            批量删除
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1 rounded text-xs"
            style={{ color: '#6B6B6B' }}
          >
            取消选择
          </button>
        </div>
      )}

      {/* Product Grid/List */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}
        >
          <Package size={48} className="mx-auto mb-3" style={{ color: '#E8E0D4' }} />
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            {products.length === 0 ? '暂无产品，点击「新增」添加第一件产品' : '没有匹配的产品'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Select All */}
          <button
            onClick={selectAll}
            className="rounded-xl p-3 flex items-center justify-center gap-2 text-sm card-hover"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4', color: '#6B6B6B' }}
          >
            {selectedIds.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare size={16} style={{ color: '#B9975B' }} />
            ) : (
              <Square size={16} />
            )}
            全选
          </button>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={selectedIds.has(product.id)}
              onToggleSelect={() => toggleSelect(product.id)}
              onDelete={() => handleDelete(product.id)}
              onToggleStatus={() => handleToggleStatus(product.id, product.status)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <button
            onClick={selectAll}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-sm"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4', color: '#6B6B6B' }}
          >
            {selectedIds.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare size={16} style={{ color: '#B9975B' }} />
            ) : (
              <Square size={16} />
            )}
            全选 ({filtered.length} 件)
          </button>
          {filtered.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              selected={selectedIds.has(product.id)}
              onToggleSelect={() => toggleSelect(product.id)}
              onDelete={() => handleDelete(product.id)}
              onToggleStatus={() => handleToggleStatus(product.id, product.status)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

// ============ Product Card (Grid) ============
function ProductCard({
  product,
  selected,
  onToggleSelect,
  onDelete,
  onToggleStatus,
}: {
  product: Product;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const thumb = product.images[0]?.data;

  return (
    <div
      className="rounded-xl overflow-hidden card-hover relative"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${selected ? '#B9975B' : '#E8E0D4'}` }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleSelect}
        className="absolute top-2 left-2 z-10 p-1 rounded-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
      >
        {selected ? (
          <CheckSquare size={16} style={{ color: '#B9975B' }} />
        ) : (
          <Square size={16} style={{ color: '#6B6B6B' }} />
        )}
      </button>

      {/* Image */}
      <Link href={`/products/${product.id}/edit`}>
        <div
          className="aspect-square flex items-center justify-center"
          style={{ backgroundColor: '#F8F4EC' }}
        >
          {thumb ? (
            <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs" style={{ color: '#6B6B6B' }}>暂无图片</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#101010' }}>
              {product.name || '未命名'}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#6B6B6B' }}>
              {product.code} · {product.style}
            </p>
          </div>
          <span
            className="text-xs font-bold whitespace-nowrap"
            style={{ color: product.priceZone === '特价' ? '#D84315' : '#101010' }}
          >
            ¥{product.price}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: product.status === '在售' ? '#2E7D3215' : '#C6282815',
              color: product.status === '在售' ? '#2E7D32' : '#C62828',
            }}
          >
            {product.status}
          </span>
          <div className="flex gap-1">
            <button
              onClick={onToggleStatus}
              className="p-1 rounded hover:bg-gray-100"
              title={product.status === '在售' ? '下架' : '上架'}
            >
              {product.status === '在售' ? (
                <EyeOff size={12} style={{ color: '#6B6B6B' }} />
              ) : (
                <Eye size={12} style={{ color: '#6B6B6B' }} />
              )}
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-red-50"
              title="删除"
            >
              <Trash2 size={12} style={{ color: '#C62828' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Product List Item ============
function ProductListItem({
  product,
  selected,
  onToggleSelect,
  onDelete,
  onToggleStatus,
}: {
  product: Product;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const thumb = product.images[0]?.data;

  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3 card-hover"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${selected ? '#B9975B' : '#E8E0D4'}` }}
    >
      <button onClick={onToggleSelect} className="shrink-0">
        {selected ? (
          <CheckSquare size={18} style={{ color: '#B9975B' }} />
        ) : (
          <Square size={18} style={{ color: '#6B6B6B' }} />
        )}
      </button>

      <Link href={`/products/${product.id}/edit`} className="shrink-0">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#F8F4EC' }}
        >
          {thumb ? (
            <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px]" style={{ color: '#6B6B6B' }}>无图</span>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#6B6B6B' }}>{product.code}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: product.priceZone === '特价' ? '#D8431515' : '#5C6BC015',
              color: product.priceZone === '特价' ? '#D84315' : '#5C6BC0',
            }}
          >
            {product.priceZone}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: product.status === '在售' ? '#2E7D3215' : '#C6282815',
              color: product.status === '在售' ? '#2E7D32' : '#C62828',
            }}
          >
            {product.status}
          </span>
        </div>
        <p className="text-sm font-medium truncate mt-0.5" style={{ color: '#101010' }}>
          {product.name || '未命名'}
        </p>
        <p className="text-xs truncate" style={{ color: '#6B6B6B' }}>
          {product.style} · {product.color} · {product.size} · ¥{product.price} · 佣金{product.commission}%
        </p>
      </div>

      <div className="flex gap-1 shrink-0">
        <Link
          href={`/products/${product.id}/edit`}
          className="p-2 rounded-lg hover:bg-gray-50"
        >
          <Edit3 size={14} style={{ color: '#B9975B' }} />
        </Link>
        <button onClick={onToggleStatus} className="p-2 rounded-lg hover:bg-gray-50">
          {product.status === '在售' ? (
            <EyeOff size={14} style={{ color: '#6B6B6B' }} />
          ) : (
            <Eye size={14} style={{ color: '#6B6B6B' }} />
          )}
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50">
          <Trash2 size={14} style={{ color: '#C62828' }} />
        </button>
      </div>
    </div>
  );
}
