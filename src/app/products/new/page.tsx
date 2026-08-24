'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { createProduct } from '@/lib/store';
import {
  ProductImage,
  ProductVideo,
  ProductFormData,
  StyleType,
  STYLE_OPTIONS,
  PRICE_ZONE_OPTIONS,
} from '@/lib/types';
import {
  ArrowLeft,
  ImagePlus,
  Video,
  X,
  Save,
  GripVertical,
} from 'lucide-react';

const DEFAULT_FORM: ProductFormData = {
  name: '',
  color: '',
  style: '大牌老钱',
  size: '',
  fabric: '',
  label: '',
  price: 0,
  commission: 20,
  priceZone: '正价',
  status: '在售',
  remark: '',
  sortOrder: 0,
};

export default function NewProductPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(DEFAULT_FORM);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [video, setVideo] = useState<ProductVideo | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, {
          id: crypto.randomUUID(),
          data: reader.result as string,
          name: file.name,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setVideo({ id: crypto.randomUUID(), data: reader.result as string, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim()) { setError('请填写品名'); return; }
    if (form.price <= 0) { setError('请填写有效价格'); return; }
    setError('');
    setSaving(true);
    try {
      createProduct(form, images, video);
      router.push('/products');
    } catch {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [form, images, video, router]);

  // Drag & Drop
  const dragItem = useRef<number | null>(null);
  const moveImage = useCallback((fromIdx: number, toIdx: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, []);

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
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/80">
          <ArrowLeft size={20} style={{ color: '#101010' }} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}>
          新增产品
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Left: Media */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#101010' }}>产品图片 ({images.length})</h3>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-grab"
                  draggable
                  onDragStart={() => { dragItem.current = idx; }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragItem.current !== null && dragItem.current !== idx) {
                      moveImage(dragItem.current, idx);
                      dragItem.current = idx;
                    }
                  }}
                  onDragEnd={() => { dragItem.current = null; }}
                >
                  <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <button onClick={() => removeImage(img.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-white/90">
                      <X size={12} style={{ color: '#C62828' }} />
                    </button>
                  </div>
                  <div className="absolute top-0.5 left-0.5 opacity-50"><GripVertical size={12} className="text-white" /></div>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] py-0.5" style={{ backgroundColor: '#B9975B', color: '#FFFFFF' }}>封面</span>
                  )}
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer" style={{ borderColor: '#E8E0D4' }}>
                <ImagePlus size={20} style={{ color: '#B9975B' }} />
                <span className="text-[10px] mt-1" style={{ color: '#6B6B6B' }}>添加图片</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-[10px] mt-2" style={{ color: '#6B6B6B' }}>支持拖拽排序，第一张为封面图</p>
          </div>

          <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#101010' }}>产品视频</h3>
            {video ? (
              <div className="relative">
                <video src={video.data} controls className="w-full rounded-lg" style={{ maxHeight: '200px' }} />
                <button onClick={() => setVideo(null)} className="absolute top-2 right-2 p-1 rounded-full bg-white/90 shadow">
                  <X size={14} style={{ color: '#C62828' }} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center cursor-pointer" style={{ borderColor: '#E8E0D4' }}>
                <Video size={24} style={{ color: '#B9975B' }} />
                <span className="text-xs mt-2" style={{ color: '#6B6B6B' }}>点击上传视频</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-2">
          <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>品名 <span style={{ color: '#C62828' }}>*</span></label>
                <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="请输入产品名称" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>颜色</label>
                <input type="text" value={form.color} onChange={(e) => updateField('color', e.target.value)} placeholder="如：驼色" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>风格</label>
                <select value={form.style} onChange={(e) => updateField('style', e.target.value as StyleType)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }}>
                  {STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>尺码</label>
                <input type="text" value={form.size} onChange={(e) => updateField('size', e.target.value)} placeholder="如：S/M/L" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>面料</label>
                <input type="text" value={form.fabric} onChange={(e) => updateField('fabric', e.target.value)} placeholder="如：100%双面羊绒" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>货号/标签</label>
                <input type="text" value={form.label} onChange={(e) => updateField('label', e.target.value)} placeholder="请输入货号" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>价格（元）<span style={{ color: '#C62828' }}>*</span></label>
                <input type="number" value={form.price || ''} onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)} placeholder="0.00" min="0" step="0.01" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>佣金（%）</label>
                <input type="number" value={form.commission || ''} onChange={(e) => updateField('commission', parseFloat(e.target.value) || 0)} placeholder="20" min="0" max="100" step="0.1" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>价格专区</label>
                <div className="flex gap-2">
                  {PRICE_ZONE_OPTIONS.map((zone) => (
                    <button key={zone} type="button" onClick={() => updateField('priceZone', zone)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: form.priceZone === zone ? '#B9975B' : '#FAFAFA', color: form.priceZone === zone ? '#FFFFFF' : '#101010', border: `1px solid ${form.priceZone === zone ? '#B9975B' : '#E8E0D4'}` }}>
                      {zone}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>状态</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateField('status', '在售')} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: form.status === '在售' ? '#2E7D32' : '#FAFAFA', color: form.status === '在售' ? '#FFFFFF' : '#101010', border: `1px solid ${form.status === '在售' ? '#2E7D32' : '#E8E0D4'}` }}>在售</button>
                  <button type="button" onClick={() => updateField('status', '售罄')} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: form.status === '售罄' ? '#C62828' : '#FAFAFA', color: form.status === '售罄' ? '#FFFFFF' : '#101010', border: `1px solid ${form.status === '售罄' ? '#C62828' : '#E8E0D4'}` }}>售罄</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>排序权重</label>
                <input type="number" value={form.sortOrder || ''} onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)} placeholder="数字越大越靠前" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>备注</label>
                <textarea value={form.remark} onChange={(e) => updateField('remark', e.target.value)} placeholder="备注信息..." rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }} />
              </div>
            </div>

            {error && (
              <div className="mt-4 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFF3F3', color: '#C62828' }}>{error}</div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving} className="gold-btn px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                <Save size={16} />
                {saving ? '保存中...' : '保存'}
              </button>
              <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm" style={{ border: '1px solid #E8E0D4', color: '#6B6B6B' }}>取消</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
