'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getPendingReviewProducts } from '@/lib/store';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardCheck,
  Star,
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isAdmin) {
      setPendingCount(getPendingReviewProducts().length);
    }
  }, [isAdmin, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Role-based nav items
  type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; badge?: number };

  const adminNavItems: NavItem[] = [
    { href: '/dashboard', label: '工作台', icon: LayoutDashboard },
    { href: '/products', label: '产品管理', icon: Package },
    { href: '/products/new', label: '新增产品', icon: PlusCircle },
    { href: '/review', label: '产品审核', icon: ClipboardCheck, badge: pendingCount },
    { href: '/featured', label: '优推管理', icon: Star },
    { href: '/accounts', label: '账号管理', icon: Users },
    { href: '/stats', label: '数据统计', icon: BarChart3 },
    { href: '/settings', label: '系统设置', icon: Settings },
  ];

  const operatorNavItems: NavItem[] = [
    { href: '/dashboard', label: '工作台', icon: LayoutDashboard },
    { href: '/products', label: '我的产品', icon: Package },
    { href: '/products/new', label: '上传产品', icon: PlusCircle },
    { href: '/stats', label: '数据统计', icon: BarChart3 },
  ];

  const navItems = isAdmin ? adminNavItems : operatorNavItems;
  // Mobile shows first 4 + menu button
  const mobileNavItems = navItems.slice(0, 4);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F4EC' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-white border-r flex-col z-30" style={{ borderColor: '#E8E0D4' }}>
        <div className="p-5 border-b" style={{ borderColor: '#E8E0D4' }}>
          <h1 className="text-lg font-bold" style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}>
            甜橙爸双面尼
          </h1>
          <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>选品后台管理系统</p>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all relative ${
                  isActive ? 'text-white shadow-sm' : 'hover:bg-gray-50'
                }`}
                style={isActive ? { backgroundColor: '#B9975B' } : { color: '#101010' }}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 ? (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#C6282820',
                      color: isActive ? '#FFFFFF' : '#C62828',
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: '#E8E0D4' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#101010' }}>
                {user?.displayName || '用户'}
              </p>
              <p className="text-xs" style={{ color: isAdmin ? '#B9975B' : '#6B6B6B' }}>
                {isAdmin ? '管理员' : '操作员'}
              </p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="退出登录">
              <LogOut size={16} style={{ color: '#6B6B6B' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-30" style={{ borderColor: '#E8E0D4' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-base font-bold" style={{ color: '#101010', fontFamily: "'Noto Serif SC', serif" }}>
            甜橙爸双面尼
          </h1>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: isAdmin ? '#B9975B15' : '#5C6BC015',
                color: isAdmin ? '#B9975B' : '#5C6BC0',
              }}
            >
              {isAdmin ? '管理员' : '操作员'}
            </span>
            <span className="text-xs" style={{ color: '#6B6B6B' }}>{user?.displayName}</span>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-gray-100">
              <LogOut size={16} style={{ color: '#6B6B6B' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30 safe-bottom">
        <div className="flex items-center justify-around h-14">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-2 py-1 relative"
                style={{ color: isActive ? '#B9975B' : '#6B6B6B' }}
              >
                <item.icon size={20} />
                <span className="text-[10px]">{item.label}</span>
                {'badge' in item && item.badge && item.badge > 0 ? (
                  <span className="absolute -top-0.5 right-0 text-[9px] w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C62828', color: '#fff' }}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1"
            style={{ color: '#6B6B6B' }}
          >
            <Menu size={20} />
            <span className="text-[10px]">更多</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold" style={{ color: '#101010' }}>菜单</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1"><X size={20} /></button>
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm ${isActive ? 'text-white' : ''}`}
                  style={isActive ? { backgroundColor: '#B9975B' } : { color: '#101010' }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {'badge' in item && item.badge && item.badge > 0 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#C6282820', color: '#C62828' }}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-60 pt-14 pb-16 md:pt-0 md:pb-0 min-h-screen">
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
