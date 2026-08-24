'use client';

import { Product, ProductFormData, DashboardStats, StyleType, User } from './types';

const PRODUCTS_KEY = 'tcbbm_products';
const AUTH_KEY = 'tcbbm_auth';
const COUNTER_KEY = 'tcbbm_counter';

// ============ Auth ============
const DEFAULT_USER: User = {
  phone: '18583176025',
  name: '甜橙爸',
};

const DEFAULT_PASSWORD = 'tiancheng666';

export function login(phone: string, password: string): { success: boolean; user?: User; error?: string } {
  if (phone === DEFAULT_USER.phone && password === DEFAULT_PASSWORD) {
    const auth = { isAuthenticated: true, user: DEFAULT_USER };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    return { success: true, user: DEFAULT_USER };
  }
  return { success: false, error: '手机号或密码错误' };
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
  } catch {
    // ignore
  }
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
    if (raw) {
      return JSON.parse(raw) as Product[];
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveAllProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function createProduct(formData: ProductFormData, images: Product['images'], video?: Product['video']): Product {
  const now = Date.now();
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
    status: formData.status,
    remark: formData.remark,
    sortOrder: formData.sortOrder,
    createdAt: now,
    updatedAt: now,
  };
  const products = getAllProducts();
  products.push(product);
  saveAllProducts(products);
  return product;
}

export function updateProduct(id: string, formData: Partial<ProductFormData>, images?: Product['images'], video?: Product['video'] | null): Product | null {
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

// ============ Stats ============
export function getDashboardStats(): DashboardStats {
  const products = getAllProducts();
  const stats: DashboardStats = {
    totalProducts: products.length,
    onSaleCount: products.filter((p) => p.status === '在售').length,
    soldOutCount: products.filter((p) => p.status === '售罄').length,
    regularPriceCount: products.filter((p) => p.priceZone === '正价').length,
    salePriceCount: products.filter((p) => p.priceZone === '特价').length,
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

// ============ Export / Import ============
export function exportToJSON(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: getAllProducts(),
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
    if (data.counter) {
      localStorage.setItem(COUNTER_KEY, data.counter);
    }
    return { success: true, count: data.products.length };
  } catch {
    return { success: false, count: 0, error: 'JSON 解析失败' };
  }
}

// ============ Sorted Products ============
export function getSortedProducts(): Product[] {
  return getAllProducts().sort((a, b) => {
    if (b.sortOrder !== a.sortOrder) return b.sortOrder - a.sortOrder;
    return b.createdAt - a.createdAt;
  });
}
