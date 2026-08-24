'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { exportToJSON, importFromJSON, getAllProducts } from '@/lib/store';
import { Download, Upload, FileJson, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  const handleExport = () => {
    setExporting(true);
    try {
      const json = exportToJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `甜橙爸双面尼_产品备份_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setImportStatus({ type: 'success', message: '导出成功' });
    } catch {
      setImportStatus({ type: 'error', message: '导出失败' });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const products = getAllProducts();
      if (products.length === 0) {
        setImportStatus({ type: 'error', message: '暂无产品数据可导出' });
        return;
      }

      // Build CSV with BOM for Excel compatibility
      const BOM = '\uFEFF';
      const headers = ['编号', '品名', '颜色', '风格', '尺码', '面料', '货号/标签', '价格(元)', '佣金(%)', '价格专区', '状态', '备注', '排序权重', '创建时间'];
      const rows = products.map((p) => [
        p.code,
        p.name,
        p.color,
        p.style,
        p.size,
        p.fabric,
        p.label,
        p.price.toFixed(2),
        p.commission.toFixed(1),
        p.priceZone,
        p.status,
        p.remark,
        p.sortOrder,
        new Date(p.createdAt).toLocaleString('zh-CN'),
      ]);

      const csv = BOM + [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `甜橙爸双面尼_产品列表_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setImportStatus({ type: 'success', message: `成功导出 ${products.length} 件产品` });
    } catch {
      setImportStatus({ type: 'error', message: '导出失败' });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importFromJSON(reader.result as string);
      if (result.success) {
        setImportStatus({ type: 'success', message: `成功导入 ${result.count} 件产品` });
      } else {
        setImportStatus({ type: 'error', message: result.error || '导入失败' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    if (!confirm('确定要清除所有产品数据？此操作不可恢复！')) return;
    if (!confirm('再次确认：这将删除所有产品数据，确定继续？')) return;
    localStorage.removeItem('tcbbm_products');
    localStorage.removeItem('tcbbm_counter');
    setImportStatus({ type: 'success', message: '数据已清除' });
  };

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
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}>
          系统设置
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>数据管理与备份</p>
      </div>

      {/* Status Message */}
      {importStatus && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2 fade-in"
          style={{
            backgroundColor: importStatus.type === 'success' ? '#2E7D3210' : '#C6282810',
            border: `1px solid ${importStatus.type === 'success' ? '#2E7D3230' : '#C6282830'}`,
          }}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle size={16} style={{ color: '#2E7D32' }} />
          ) : (
            <AlertTriangle size={16} style={{ color: '#C62828' }} />
          )}
          <span className="text-sm" style={{ color: importStatus.type === 'success' ? '#2E7D32' : '#C62828' }}>
            {importStatus.message}
          </span>
          <button onClick={() => setImportStatus(null)} className="ml-auto">
            <span style={{ color: '#6B6B6B' }}>&times;</span>
          </button>
        </div>
      )}

      <div className="space-y-4 max-w-2xl">
        {/* Export */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#101010' }}>
            <Download size={16} style={{ color: '#B9975B' }} />
            数据导出
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              style={{ border: '1px solid #E8E0D4' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2E7D3215' }}>
                <FileJson size={20} style={{ color: '#2E7D32' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#101010' }}>导出 Excel (CSV)</p>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>导出产品列表为 CSV 文件，可用 Excel 打开</p>
              </div>
            </button>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              style={{ border: '1px solid #E8E0D4' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#B9975B15' }}>
                <Download size={20} style={{ color: '#B9975B' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#101010' }}>JSON 备份</p>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>完整备份所有数据（含图片），可用于恢复</p>
              </div>
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#101010' }}>
            <Upload size={16} style={{ color: '#B9975B' }} />
            数据恢复
          </h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            style={{ border: '1px solid #E8E0D4' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5C6BC015' }}>
              <Upload size={20} style={{ color: '#5C6BC0' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#101010' }}>从 JSON 备份恢复</p>
              <p className="text-xs" style={{ color: '#6B6B6B' }}>选择之前导出的 JSON 文件进行恢复</p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <p className="text-xs mt-2 px-1" style={{ color: '#D84315' }}>
            注意：恢复操作将覆盖当前所有产品数据
          </p>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #C6282830' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#C62828' }}>
            <AlertTriangle size={16} />
            危险区域
          </h2>
          <button
            onClick={handleClearData}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#C6282815', color: '#C62828', border: '1px solid #C6282830' }}
          >
            清除所有数据
          </button>
          <p className="text-xs mt-2" style={{ color: '#6B6B6B' }}>
            此操作不可恢复，建议先导出备份
          </p>
        </div>

        {/* About */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#101010' }}>关于</h2>
          <div className="space-y-2 text-sm" style={{ color: '#6B6B6B' }}>
            <p><span style={{ color: '#101010' }}>品牌：</span>甜橙爸双面尼</p>
            <p><span style={{ color: '#101010' }}>业务：</span>精选联盟供应链 · 双面尼女装大衣</p>
            <p><span style={{ color: '#101010' }}>联系人：</span>甜橙爸 18583176025（微信同步）</p>
            <p><span style={{ color: '#101010' }}>版本：</span>v1.0.0</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
