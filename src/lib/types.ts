// 产品数据类型定义

export type StyleType = '大牌老钱' | '韩系风' | '极简' | '千金风' | '重工系';

export type PriceZone = '正价' | '特价';

export type ProductStatus = '在售' | '售罄';

export interface ProductImage {
  id: string;
  data: string; // base64 data URL
  name: string;
}

export interface ProductVideo {
  id: string;
  data: string; // base64 data URL or blob URL
  name: string;
}

export interface Product {
  id: string;
  code: string; // 编号，如 No01
  images: ProductImage[];
  video?: ProductVideo | null;
  name: string; // 品名
  color: string; // 颜色
  style: StyleType; // 风格
  size: string; // 尺码
  fabric: string; // 面料
  label: string; // 货号/标签
  price: number; // 价格（元）
  commission: number; // 佣金（%）
  priceZone: PriceZone; // 价格专区
  status: ProductStatus; // 状态
  remark: string; // 备注
  sortOrder: number; // 排序权重
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
}

export interface ProductFormData {
  name: string;
  color: string;
  style: StyleType;
  size: string;
  fabric: string;
  label: string;
  price: number;
  commission: number;
  priceZone: PriceZone;
  status: ProductStatus;
  remark: string;
  sortOrder: number;
}

export const STYLE_OPTIONS: StyleType[] = ['大牌老钱', '韩系风', '极简', '千金风', '重工系'];

export const PRICE_ZONE_OPTIONS: PriceZone[] = ['正价', '特价'];

export const STATUS_OPTIONS: ProductStatus[] = ['在售', '售罄'];

// 认证相关
export interface User {
  phone: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// 统计数据
export interface DashboardStats {
  totalProducts: number;
  onSaleCount: number;
  soldOutCount: number;
  regularPriceCount: number;
  salePriceCount: number;
  styleCounts: Record<StyleType, number>;
}
