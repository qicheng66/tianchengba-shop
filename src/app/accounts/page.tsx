'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { getAllAccounts, createAccount, updateAccount, deleteAccount } from '@/lib/store';
import { UserAccount, UserRole } from '@/lib/types';
import { Plus, Edit3, Trash2, Shield, User as UserIcon, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';

export default function AccountsPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', displayName: '', password: '', role: 'operator' as UserRole, phone: '' });
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setAccounts(getAllAccounts());
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (!isAdmin) { router.replace('/dashboard'); return; }
    refresh();
  }, [isAuthenticated, isLoading, isAdmin, router, refresh]);

  const resetForm = () => {
    setForm({ username: '', displayName: '', password: '', role: 'operator', phone: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleCreate = () => {
    if (!form.username.trim() || !form.password.trim() || !form.displayName.trim()) {
      setError('请填写完整信息');
      return;
    }
    const result = createAccount({
      username: form.username.trim(),
      displayName: form.displayName.trim(),
      password: form.password,
      role: form.role,
      phone: form.phone.trim() || undefined,
    });
    if (result.success) {
      resetForm();
      refresh();
    } else {
      setError(result.error || '创建失败');
    }
  };

  const handleEdit = (account: UserAccount) => {
    setForm({
      username: account.username,
      displayName: account.displayName,
      password: account.password,
      role: account.role,
      phone: account.phone || '',
    });
    setEditingId(account.id);
    setShowForm(true);
    setError('');
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!form.displayName.trim() || !form.password.trim()) {
      setError('请填写完整信息');
      return;
    }
    updateAccount(editingId, {
      displayName: form.displayName.trim(),
      password: form.password,
      role: form.role,
      phone: form.phone.trim() || undefined,
    });
    resetForm();
    refresh();
  };

  const handleToggle = (id: string, enabled: boolean) => {
    if (id === 'admin-default') return;
    updateAccount(id, { enabled: !enabled });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (id === 'admin-default') return;
    if (!confirm('确定删除此账号？')) return;
    deleteAccount(id);
    refresh();
  };

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
            账号管理
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>共 {accounts.length} 个账号</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="gold-btn px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
        >
          <Plus size={16} />
          新增账号
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-xl p-5 mb-4 fade-in" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#101010' }}>
              {editingId ? '编辑账号' : '新增账号'}
            </h3>
            <button onClick={resetForm} className="p-1"><X size={16} style={{ color: '#6B6B6B' }} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>用户名 <span style={{ color: '#C62828' }}>*</span></label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                disabled={!!editingId}
                placeholder="登录用户名"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none disabled:opacity-50"
                style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>显示名称 <span style={{ color: '#C62828' }}>*</span></label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="显示在界面上的名称"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>密码 <span style={{ color: '#C62828' }}>*</span></label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="登录密码"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>手机号</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="选填"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E8E0D4', backgroundColor: '#FAFAFA', color: '#101010' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#101010' }}>角色</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: 'admin' }))}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: form.role === 'admin' ? '#B9975B' : '#FAFAFA',
                    color: form.role === 'admin' ? '#FFFFFF' : '#101010',
                    border: `1px solid ${form.role === 'admin' ? '#B9975B' : '#E8E0D4'}`,
                  }}
                >
                  管理员
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: 'operator' }))}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: form.role === 'operator' ? '#B9975B' : '#FAFAFA',
                    color: form.role === 'operator' ? '#FFFFFF' : '#101010',
                    border: `1px solid ${form.role === 'operator' ? '#B9975B' : '#E8E0D4'}`,
                  }}
                >
                  操作员
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFF3F3', color: '#C62828' }}>{error}</div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              className="gold-btn px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
            >
              <Save size={14} />
              {editingId ? '更新' : '创建'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #E8E0D4', color: '#6B6B6B' }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* Account List */}
      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-xl p-4 flex items-center gap-3 card-hover"
            style={{ backgroundColor: '#FFFFFF', border: `1px solid ${!account.enabled ? '#C6282830' : '#E8E0D4'}` }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: account.role === 'admin' ? '#B9975B15' : '#5C6BC015' }}
            >
              {account.role === 'admin' ? (
                <Shield size={18} style={{ color: '#B9975B' }} />
              ) : (
                <UserIcon size={18} style={{ color: '#5C6BC0' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium" style={{ color: '#101010' }}>{account.displayName}</p>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: account.role === 'admin' ? '#B9975B15' : '#5C6BC015',
                    color: account.role === 'admin' ? '#B9975B' : '#5C6BC0',
                  }}
                >
                  {account.role === 'admin' ? '管理员' : '操作员'}
                </span>
                {!account.enabled && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#C6282815', color: '#C62828' }}>
                    已禁用
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>
                @{account.username} {account.phone ? `· ${account.phone}` : ''} · 创建于 {new Date(account.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              {account.id !== 'admin-default' && (
                <>
                  <button
                    onClick={() => handleToggle(account.id, account.enabled)}
                    className="p-2 rounded-lg hover:bg-gray-50"
                    title={account.enabled ? '禁用' : '启用'}
                  >
                    {account.enabled ? (
                      <ToggleRight size={18} style={{ color: '#2E7D32' }} />
                    ) : (
                      <ToggleLeft size={18} style={{ color: '#6B6B6B' }} />
                    )}
                  </button>
                  <button onClick={() => handleEdit(account)} className="p-2 rounded-lg hover:bg-gray-50">
                    <Edit3 size={14} style={{ color: '#B9975B' }} />
                  </button>
                  <button onClick={() => handleDelete(account.id)} className="p-2 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} style={{ color: '#C62828' }} />
                  </button>
                </>
              )}
              {account.id === 'admin-default' && (
                <span className="text-[10px] px-2 py-1" style={{ color: '#6B6B6B' }}>默认管理员</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
