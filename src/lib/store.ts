'use client';

import { Product, ProductFormData, DashboardStats, StyleType, User, UserAccount, UserRole, ReviewStatus } from './types';

const PRODUCTS_KEY = 'tcbbm_products';
const AUTH_KEY = 'tcbbm_auth';
const COUNTER_KEY = 'tcbbm_counter';
const ACCOUNTS_KEY = 'tcbbm_accounts';

// ============ Accounts ============
const DEFAULT_ADMIN: UserAccount = {
  id: 'admin-default',
  username: '18583176025',
  displayName: '甜橙爸',
  password: 'tiancheng666',
  role: 'admin',
  phone: '18583176025',
  enabled: true,
  createdAt: Date.now(),
};

function getAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw) as UserAccount[];
  } catch { /* ignore */ }
  // First time: initialize with default admin
  const defaults = [DEFAULT_ADMIN];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getAllAccounts(): UserAccount[] {
  return getAccounts();
}

export function createAccount(data: { username: string; displayName: string; password: string; role: UserRole; phone?: string }): { success: boolean; error?: string } {
  const accounts = getAccounts();
  if (accounts.some((a) => a.username === data.username)) {
    return { success: false, error: '用户名已存在' };
  }
  accounts.push({
    id: crypto.randomUUID(),
    username: data.username,
    displayName: data.displayName,
    password: data.password,
    role: data.role,
    phone: data.phone,
    enabled: true,
    createdAt: Date.now(),
  });
  saveAccounts(accounts);
  return { success: true };
}

export function updateAccount(id: string, data: Partial<Pick<UserAccount, 'displayName' | 'password' | 'role' | 'phone' | 'enabled'>>): boolean {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  if (data.displayName !== undefined) accounts[idx].displayName = data.displayName;
  if (data.password !== undefined) accounts[idx].password = data.password;
  if (data.role !== undefined) accounts[idx].role = data.role;
  if (data.phone !== undefined) accounts[idx].phone = data.phone;
  if (data.enabled !== undefined) accounts[idx].enabled = data.enabled;
  saveAccounts(accounts);
  return true;
}

export function deleteAccount(id: string): boolean {
  const accounts = getAccounts();
  if (id === 'admin-default') return false; // Cannot delete default admin
  const filtered = accounts.filter((a) => a.id !== id);
  if (filtered.length === accounts.length) return false;
  saveAccounts(filtered);
  return true;
}

// ============ Auth ============
export function login(username: string, password: string): { success: boolean; user?: User; error?: string } {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.username === username && a.password === password);
  if (!account) return { success: false, error: '用户名或密码错误' };
  if (!account.enabled) return { success: false, error: '账号已被禁用' };
  const user: User = {
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    role: account.role,
    phone: account.phone,
  };
  const auth = { isAuthenticated: true, user };
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  return { success: true, user };
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuth(): { isAuthenticated: boolean; user: User | null } {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch { /* ignore */ }
  return { isAuthenticated: false, user: null };
}

// ============ Product Counter ============
function getNextCounter(): number {
  const current = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10);
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

function generateCode(): string {
  const num = getNextCounter();
  return `No${String(num).padStart(2, '0')}`;
}

// ============ Products CRUD ============
export function getAllProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ignore */ }
  return [];
}

export function saveAllProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function createProduct(
  formData: ProductFormData,
  images: Product['images'],
  video: Product['video'],
  createdBy: string,
  isOperator: boolean,
): Product {
  const now = Date.now();
  // Operators' products default to pending review
  const reviewStatus: ReviewStatus = isOperator ? '待审核' : '已通过';
  const status: Product['status'] = isOperator ? '售罄' : formData.status; // Operator products start as not on sale

  const product: Product = {
    id: crypto.randomUUID(),
    code: generateCode(),
    images,
    video: video || null,
    name: formData.name,
    color: formData.color,
    style: formData.style,
    size: formData.size,
    fabric: formData.fabric,
    label: formData.label,
    price: formData.price,
    commission: formData.commission,
    priceZone: formData.priceZone,
    status,
    remark: formData.remark,
    sortOrder: formData.sortOrder,
    reviewStatus,
    createdBy,
    isFeatured: false,
    featuredOrder: 0,
    createdAt: now,
    updatedAt: now,
  };
  const products = getAllProducts();
  products.push(product);
  saveAllProducts(products);
  return product;
}

export function updateProduct(
  id: string,
  formData: Partial<ProductFormData>,
  images?: Product['images'],
  video?: Product['video'] | null,
): Product | null {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const product = products[idx];
  if (formData.name !== undefined) product.name = formData.name;
  if (formData.color !== undefined) product.color = formData.color;
  if (formData.style !== undefined) product.style = formData.style;
  if (formData.size !== undefined) product.size = formData.size;
  if (formData.fabric !== undefined) product.fabric = formData.fabric;
  if (formData.label !== undefined) product.label = formData.label;
  if (formData.price !== undefined) product.price = formData.price;
  if (formData.commission !== undefined) product.commission = formData.commission;
  if (formData.priceZone !== undefined) product.priceZone = formData.priceZone;
  if (formData.status !== undefined) product.status = formData.status;
  if (formData.remark !== undefined) product.remark = formData.remark;
  if (formData.sortOrder !== undefined) product.sortOrder = formData.sortOrder;
  if (images !== undefined) product.images = images;
  if (video !== undefined) product.video = video;
  product.updatedAt = Date.now();

  products[idx] = product;
  saveAllProducts(products);
  return product;
}

export function deleteProduct(id: string): boolean {
  const products = getAllProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveAllProducts(filtered);
  return true;
}

export function batchDeleteProducts(ids: string[]): number {
  const products = getAllProducts();
  const idSet = new Set(ids);
  const filtered = products.filter((p) => !idSet.has(p.id));
  const deleted = products.length - filtered.length;
  saveAllProducts(filtered);
  return deleted;
}

export function batchUpdateStatus(ids: string[], status: Product['status']): number {
  const products = getAllProducts();
  const idSet = new Set(ids);
  let count = 0;
  for (const p of products) {
    if (idSet.has(p.id)) {
      p.status = status;
      p.updatedAt = Date.now();
      count++;
    }
  }
  saveAllProducts(products);
  return count;
}

// ============ Review ============
export function approveProduct(id: string, reviewer: string): boolean {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products[idx].reviewStatus = '已通过';
  products[idx].status = '在售';
  products[idx].reviewedBy = reviewer;
  products[idx].reviewedAt = Date.now();
  products[idx].rejectReason = undefined;
  products[idx].updatedAt = Date.now();
  saveAllProducts(products);
  return true;
}

export function rejectProduct(id: string, reviewer: string, reason?: string): boolean {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products[idx].reviewStatus = '已打回';
  products[idx].status = '售罄';
  products[idx].reviewedBy = reviewer;
  products[idx].reviewedAt = Date.now();
  products[idx].rejectReason = reason;
  products[idx].updatedAt = Date.now();
  saveAllProducts(products);
  return true;
}

export function getPendingReviewProducts(): Product[] {
  return getAllProducts().filter((p) => p.reviewStatus === '待审核');
}

// ============ Featured ============
export function setFeatured(id: string, featured: boolean, order?: number): boolean {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products[idx].isFeatured = featured;
  if (order !== undefined) products[idx].featuredOrder = order;
  else if (featured) {
    // Auto assign next order
    const maxOrder = Math.max(0, ...products.filter((p) => p.isFeatured).map((p) => p.featuredOrder));
    products[idx].featuredOrder = maxOrder + 1;
  } else {
    products[idx].featuredOrder = 0;
  }
  products[idx].updatedAt = Date.now();
  saveAllProducts(products);
  return true;
}

export function getFeaturedProducts(): Product[] {
  return getAllProducts()
    .filter((p) => p.isFeatured && p.status === '在售' && p.reviewStatus === '已通过')
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}

export function updateFeaturedOrder(ids: string[]): void {
  const products = getAllProducts();
  ids.forEach((id, index) => {
    const p = products.find((prod) => prod.id === id);
    if (p) p.featuredOrder = index + 1;
  });
  saveAllProducts(products);
}

// ============ Stats ============
export function getDashboardStats(): DashboardStats {
  const products = getAllProducts();
  const stats: DashboardStats = {
    totalProducts: products.length,
    onSaleCount: products.filter((p) => p.status === '在售').length,
    soldOutCount: products.filter((p) => p.status === '售罄').length,
    regularPriceCount: products.filter((p) => p.priceZone === '正价').length,
    salePriceCount: products.filter((p) => p.priceZone === '特价').length,
    pendingReviewCount: products.filter((p) => p.reviewStatus === '待审核').length,
    featuredCount: products.filter((p) => p.isFeatured).length,
    styleCounts: {
      '大牌老钱': 0,
      '韩系风': 0,
      '极简': 0,
      '千金风': 0,
      '重工系': 0,
    },
  };
  for (const p of products) {
    stats.styleCounts[p.style as StyleType]++;
  }
  return stats;
}

// ============ Sorted Products ============
export function getSortedProducts(): Product[] {
  return getAllProducts().sort((a, b) => {
    // Featured products first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.isFeatured && b.isFeatured && a.featuredOrder !== b.featuredOrder) {
      return a.featuredOrder - b.featuredOrder;
    }
    if (b.sortOrder !== a.sortOrder) return b.sortOrder - a.sortOrder;
    return b.createdAt - a.createdAt;
  });
}

// ============ Export / Import ============
export function exportToJSON(): string {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    products: getAllProducts(),
    accounts: getAccounts(),
    counter: localStorage.getItem(COUNTER_KEY) || '0',
  };
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.products || !Array.isArray(data.products)) {
      return { success: false, count: 0, error: '无效的数据格式' };
    }
    saveAllProducts(data.products);
    if (data.accounts && Array.isArray(data.accounts)) {
      saveAccounts(data.accounts);
    }
    if (data.counter) {
      localStorage.setItem(COUNTER_KEY, data.counter);
    }
    return { success: true, count: data.products.length };
  } catch {
    return { success: false, count: 0, error: 'JSON 解析失败' };
  }
}
