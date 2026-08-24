'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    const result = login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.error || '登录失败');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#F8F4EC' }}
    >
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #B9975B, #D4AF6E)' }}
          >
            <span className="text-white text-2xl font-bold" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              甜
            </span>
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}
          >
            甜橙爸双面尼
          </h1>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            选品后台管理系统
          </p>
        </div>

        {/* Login Form */}
        <div
          className="rounded-xl p-6 shadow-sm"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D4' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#101010' }}>
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{
                  border: '1px solid #E8E0D4',
                  backgroundColor: '#FAFAFA',
                  color: '#101010',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#101010' }}>
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{
                  border: '1px solid #E8E0D4',
                  backgroundColor: '#FAFAFA',
                  color: '#101010',
                }}
              />
            </div>

            {error && (
              <div
                className="text-xs px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#FFF3F3', color: '#C62828' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium gold-btn disabled:opacity-50"
            >
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: '#6B6B6B' }}>
              联系：甜橙爸 18583176025（微信同步）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
