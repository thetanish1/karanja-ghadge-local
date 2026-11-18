const API_BASE = '/api/v1';

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('kgl_access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Attempt token refresh on 401
  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    const refreshToken = localStorage.getItem('kgl_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('kgl_access_token', data.accessToken);
          localStorage.setItem('kgl_refresh_token', data.refreshToken);
          // Retry original request with new token
          return request<T>(endpoint, options);
        }
      } catch (e) {
        // Refresh failed, clear session
        localStorage.removeItem('kgl_access_token');
        localStorage.removeItem('kgl_refresh_token');
      }
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed', response.status, data.code, data.details);
  }

  return data as T;
}

export const api = {
  // Auth
  requestOtp: (phone: string, name?: string) =>
    request<{ success: boolean; devOtp?: string; message: string }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone, name }),
    }),

  verifyOtp: (phone: string, otp: string, name?: string) =>
    request<{ success: boolean; accessToken: string; refreshToken: string; user: any }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name }),
    }),

  loginAsRole: (role: string) =>
    request<{ success: boolean; accessToken: string; refreshToken: string; user: any }>('/auth/role-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Catalog
  getCategories: () => request<{ success: boolean; categories: any[] }>('/catalog/categories'),

  getShops: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; shops: any[] }>(`/shops${query ? `?${query}` : ''}`);
  },

  getShopDetail: (id: string) => request<{ success: boolean; shop: any }>(`/shops/${id}`),

  getProducts: (params?: { shopId?: string; categoryId?: string; search?: string; inStockOnly?: boolean }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; products: any[] }>(`/products${query ? `?${query}` : ''}`);
  },

  getServiceability: (lat?: number, lng?: number) => {
    const query = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
    return request<{ success: boolean; serviceable: boolean; message: string; center: any }>(`/catalog/serviceability${query}`);
  },

  // Cart
  getCart: () => request<{ success: boolean; cart: any }>('/cart'),

  updateCart: (productId: string, qty: number) =>
    request<{ success: boolean; cart: any }>('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, qty }),
    }),

  clearCart: () => request<{ success: boolean; cart: any }>('/cart', { method: 'DELETE' }),

  // Orders
  createOrder: (payload: {
    fulfilmentType: 'delivery' | 'pickup';
    paymentMethod: 'cod' | 'pay_direct_to_shop';
    deliveryAddress?: { line: string; landmark?: string; pincode: string; coordinates?: [number, number] };
    notes?: string;
    idempotencyKey: string;
  }) =>
    request<{ success: boolean; order: any; items: any[] }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyOrders: () => request<{ success: boolean; orders: any[] }>('/orders'),

  getOrderById: (id: string) => request<{ success: boolean; order: any; items: any[]; events: any[] }>(`/orders/${id}`),

  cancelOrder: (id: string, reason?: string) =>
    request<{ success: boolean; orderStatus: string }>(`/orders/${id}/cancel-request`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Shopkeeper Portal
  getShopQueue: (shopId?: string, status?: string) => {
    const params: any = {};
    if (shopId) params.shopId = shopId;
    if (status) params.status = status;
    const q = new URLSearchParams(params).toString();
    return request<{ success: boolean; orders: any[] }>(`/orders/shop/queue${q ? `?${q}` : ''}`);
  },

  transitionShopOrder: (orderId: string, targetState: string, reason?: string) =>
    request<{ success: boolean; orderStatus: string }>(`/orders/shop/orders/${orderId}/transition`, {
      method: 'POST',
      body: JSON.stringify({ targetState, reason }),
    }),

  getMyShops: () => request<{ success: boolean; shops: any[] }>('/shops/my-shops'),

  applyShop: (data: any) =>
    request<{ success: boolean; shop: any; emailNotification?: any }>('/shops/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkShopApplicationStatus: (id: string) =>
    request<{ success: boolean; shop: any }>(`/shops/application-status/${id}`),

  updateShopAvailability: (shopId: string, data: { isPaused?: boolean; hours?: any }) =>
    request<{ success: boolean; isPaused: boolean; hours: any }>(`/shops/${shopId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  createProduct: (shopId: string, data: any) =>
    request<{ success: boolean; product: any }>(`/products/shop/${shopId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (shopId: string, id: string, data: any) =>
    request<{ success: boolean; product: any }>(`/products/shop/${shopId}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (shopId: string, id: string) =>
    request<{ success: boolean }>(`/products/shop/${shopId}/${id}`, { method: 'DELETE' }),

  // Delivery Portal
  getDeliveryTasks: () => request<{ success: boolean; tasks: any[] }>('/delivery/tasks'),

  transitionDeliveryTask: (orderId: string, targetState: string, reason?: string) =>
    request<{ success: boolean; orderStatus: string }>(`/delivery/tasks/${orderId}/transition`, {
      method: 'POST',
      body: JSON.stringify({ targetState, reason }),
    }),

  verifyDeliveryOtp: (orderId: string, otp: string, cashCollectedPaise?: number) =>
    request<{ success: boolean; orderStatus: string }>(`/delivery/tasks/${orderId}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp, cashCollectedPaise }),
    }),

  // Admin Portal
  getAdminOverview: () => request<{ success: boolean; stats: any }>('/admin/overview'),

  getAdminShops: (status?: string) =>
    request<{ success: boolean; shops: any[] }>(`/admin/shops${status ? `?status=${status}` : ''}`),

  updateShopStatus: (id: string, status: string, reason?: string) =>
    request<{ success: boolean; shop: any }>(`/admin/shops/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  getAdminOrders: (params?: { status?: string; shopId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; orders: any[] }>(`/admin/orders${q ? `?${q}` : ''}`);
  },

  assignDeliveryPartner: (orderId: string, data: { partnerId: string; handlerName: string; handlerPhone?: string }) =>
    request<{ success: boolean; order: any }>(`/admin/orders/${orderId}/assign-delivery`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDeliveryPartners: () => request<{ success: boolean; partners: any[] }>('/admin/delivery-partners'),

  getSettings: () => request<{ success: boolean; settings: Record<string, any> }>('/settings'),

  updateSetting: (key: string, value: any, description?: string) =>
    request<{ success: boolean; setting: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value, description }),
    }),

  getAuditLogs: () => request<{ success: boolean; logs: any[] }>('/admin/audit-logs'),
};
