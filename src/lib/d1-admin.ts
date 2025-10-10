// Fonctions D1 pour le panel admin - CRUD complet
import { executeD1Query } from './d1-simple';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  prices?: string; // JSON string pour les prix multiples
  category_id?: number;
  farm_id?: number;
  image_url?: string;
  video_url?: string;
  images?: string; // JSON array des URLs d'images
  stock: number;
  is_available: boolean;
  features?: string; // JSON array des caractéristiques
  tags?: string; // JSON array des tags
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface Farm {
  id?: number;
  name: string;
  description: string;
  location: string;
  contact: string;
  created_at?: string;
  updated_at?: string;
}

export interface Setting {
  id?: number;
  shop_name: string;
  admin_password: string;
  background_image: string;
  background_opacity: number;
  background_blur: number;
  theme_color: string;
  contact_info: string;
  shop_description: string;
  loading_enabled: boolean;
  loading_duration: number;
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id?: number;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SocialLink {
  id?: number;
  name: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  items: string; // JSON des produits commandés
  total_amount: number;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ===== PRODUITS =====
export const d1Admin = {
  // Produits
  async getProducts(): Promise<Product[]> {
    const result = await executeD1Query(`
      SELECT 
        p.*,
        c.name as category_name,
        f.name as farm_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN farms f ON p.farm_id = f.id
      ORDER BY p.created_at DESC
    `);
    return result.result?.[0]?.results || [];
  },

  async getProduct(id: number): Promise<Product | null> {
    const result = await executeD1Query('SELECT * FROM products WHERE id = ?', [id]);
    return result.result?.[0]?.results?.[0] || null;
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await executeD1Query(`
      INSERT INTO products (name, description, price, prices, category_id, farm_id, image_url, video_url, images, stock, is_available, features, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      product.name,
      product.description,
      product.price,
      product.prices || '[]',
      product.category_id || null,
      product.farm_id || null,
      product.image_url || '',
      product.video_url || '',
      product.images || '[]',
      product.stock,
      product.is_available ? 1 : 0,
      product.features || '[]',
      product.tags || '[]'
    ]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<number> {
    const fields = [];
    const values = [];
    
    if (product.name !== undefined) { fields.push('name = ?'); values.push(product.name); }
    if (product.description !== undefined) { fields.push('description = ?'); values.push(product.description); }
    if (product.price !== undefined) { fields.push('price = ?'); values.push(product.price); }
    if (product.prices !== undefined) { fields.push('prices = ?'); values.push(product.prices); }
    if (product.category_id !== undefined) { fields.push('category_id = ?'); values.push(product.category_id); }
    if (product.farm_id !== undefined) { fields.push('farm_id = ?'); values.push(product.farm_id); }
    if (product.image_url !== undefined) { fields.push('image_url = ?'); values.push(product.image_url); }
    if (product.video_url !== undefined) { fields.push('video_url = ?'); values.push(product.video_url); }
    if (product.images !== undefined) { fields.push('images = ?'); values.push(product.images); }
    if (product.stock !== undefined) { fields.push('stock = ?'); values.push(product.stock); }
    if (product.is_available !== undefined) { fields.push('is_available = ?'); values.push(product.is_available ? 1 : 0); }
    if (product.features !== undefined) { fields.push('features = ?'); values.push(product.features); }
    if (product.tags !== undefined) { fields.push('tags = ?'); values.push(product.tags); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await executeD1Query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.result?.[0]?.meta?.changes || 0;
  },

  async deleteProduct(id: number): Promise<number> {
    const result = await executeD1Query('DELETE FROM products WHERE id = ?', [id]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  // ===== CATÉGORIES =====
  async getCategories(): Promise<Category[]> {
    const result = await executeD1Query('SELECT * FROM categories ORDER BY name ASC');
    return result.result?.[0]?.results || [];
  },

  async getCategory(id: number): Promise<Category | null> {
    const result = await executeD1Query('SELECT * FROM categories WHERE id = ?', [id]);
    return result.result?.[0]?.results?.[0] || null;
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await executeD1Query(`
      INSERT INTO categories (name, description, icon, color)
      VALUES (?, ?, ?, ?)
    `, [category.name, category.description, category.icon, category.color]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  async updateCategory(id: number, category: Partial<Category>): Promise<number> {
    const fields = [];
    const values = [];
    
    if (category.name !== undefined) { fields.push('name = ?'); values.push(category.name); }
    if (category.description !== undefined) { fields.push('description = ?'); values.push(category.description); }
    if (category.icon !== undefined) { fields.push('icon = ?'); values.push(category.icon); }
    if (category.color !== undefined) { fields.push('color = ?'); values.push(category.color); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await executeD1Query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.result?.[0]?.meta?.changes || 0;
  },

  async deleteCategory(id: number): Promise<number> {
    const result = await executeD1Query('DELETE FROM categories WHERE id = ?', [id]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  // ===== FERMES =====
  async getFarms(): Promise<Farm[]> {
    const result = await executeD1Query('SELECT * FROM farms ORDER BY name ASC');
    return result.result?.[0]?.results || [];
  },

  async getFarm(id: number): Promise<Farm | null> {
    const result = await executeD1Query('SELECT * FROM farms WHERE id = ?', [id]);
    return result.result?.[0]?.results?.[0] || null;
  },

  async createFarm(farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await executeD1Query(`
      INSERT INTO farms (name, description, location, contact)
      VALUES (?, ?, ?, ?)
    `, [farm.name, farm.description, farm.location, farm.contact]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  async updateFarm(id: number, farm: Partial<Farm>): Promise<number> {
    const fields = [];
    const values = [];
    
    if (farm.name !== undefined) { fields.push('name = ?'); values.push(farm.name); }
    if (farm.description !== undefined) { fields.push('description = ?'); values.push(farm.description); }
    if (farm.location !== undefined) { fields.push('location = ?'); values.push(farm.location); }
    if (farm.contact !== undefined) { fields.push('contact = ?'); values.push(farm.contact); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await executeD1Query(
      `UPDATE farms SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.result?.[0]?.meta?.changes || 0;
  },

  async deleteFarm(id: number): Promise<number> {
    const result = await executeD1Query('DELETE FROM farms WHERE id = ?', [id]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  // ===== PARAMÈTRES =====
  async getSettings(): Promise<Setting | null> {
    const result = await executeD1Query('SELECT * FROM settings WHERE id = 1 LIMIT 1');
    return result.result?.[0]?.results?.[0] || null;
  },

  async updateSettings(settings: Partial<Setting>): Promise<number> {
    const fields = [];
    const values = [];
    
    if (settings.shop_name !== undefined) { fields.push('shop_name = ?'); values.push(settings.shop_name); }
    if (settings.admin_password !== undefined) { fields.push('admin_password = ?'); values.push(settings.admin_password); }
    if (settings.background_image !== undefined) { fields.push('background_image = ?'); values.push(settings.background_image); }
    if (settings.background_opacity !== undefined) { fields.push('background_opacity = ?'); values.push(settings.background_opacity); }
    if (settings.background_blur !== undefined) { fields.push('background_blur = ?'); values.push(settings.background_blur); }
    if (settings.theme_color !== undefined) { fields.push('theme_color = ?'); values.push(settings.theme_color); }
    if (settings.contact_info !== undefined) { fields.push('contact_info = ?'); values.push(settings.contact_info); }
    if (settings.shop_description !== undefined) { fields.push('shop_description = ?'); values.push(settings.shop_description); }
    if (settings.loading_enabled !== undefined) { fields.push('loading_enabled = ?'); values.push(settings.loading_enabled ? 1 : 0); }
    if (settings.loading_duration !== undefined) { fields.push('loading_duration = ?'); values.push(settings.loading_duration); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(1);

    const result = await executeD1Query(
      `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.result?.[0]?.meta?.changes || 0;
  },

  // ===== PAGES =====
  async getPages(): Promise<Page[]> {
    const result = await executeD1Query('SELECT * FROM pages ORDER BY created_at DESC');
    return result.result?.[0]?.results || [];
  },

  async getPage(id: number): Promise<Page | null> {
    const result = await executeD1Query('SELECT * FROM pages WHERE id = ?', [id]);
    return result.result?.[0]?.results?.[0] || null;
  },

  async createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await executeD1Query(`
      INSERT INTO pages (slug, title, content, is_active)
      VALUES (?, ?, ?, ?)
    `, [page.slug, page.title, page.content, page.is_active ? 1 : 0]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  async updatePage(id: number, page: Partial<Page>): Promise<number> {
    const fields = [];
    const values = [];
    
    if (page.slug !== undefined) { fields.push('slug = ?'); values.push(page.slug); }
    if (page.title !== undefined) { fields.push('title = ?'); values.push(page.title); }
    if (page.content !== undefined) { fields.push('content = ?'); values.push(page.content); }
    if (page.is_active !== undefined) { fields.push('is_active = ?'); values.push(page.is_active ? 1 : 0); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await executeD1Query(
      `UPDATE pages SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.result?.[0]?.meta?.changes || 0;
  },

  async deletePage(id: number): Promise<number> {
    const result = await executeD1Query('DELETE FROM pages WHERE id = ?', [id]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  // ===== RÉSEAUX SOCIAUX =====
  async getSocialLinks(): Promise<SocialLink[]> {
    const result = await executeD1Query('SELECT * FROM social_links ORDER BY sort_order ASC, created_at ASC');
    return result.result?.[0]?.results || [];
  },

  async getSocialLink(id: number): Promise<SocialLink | null> {
    const result = await executeD1Query('SELECT * FROM social_links WHERE id = ?', [id]);
    return result.result?.[0]?.results?.[0] || null;
  },

  async createSocialLink(socialLink: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await executeD1Query(`
      INSERT INTO social_links (name, url, icon, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `, [socialLink.name, socialLink.url, socialLink.icon, socialLink.is_active ? 1 : 0, socialLink.sort_order]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  async updateSocialLink(id: number, socialLink: Partial<SocialLink>): Promise<number> {
    const fields = [];
    const values = [];
    
    if (socialLink.name !== undefined) { fields.push('name = ?'); values.push(socialLink.name); }
    if (socialLink.url !== undefined) { fields.push('url = ?'); values.push(socialLink.url); }
    if (socialLink.icon !== undefined) { fields.push('icon = ?'); values.push(socialLink.icon); }
    if (socialLink.is_active !== undefined) { fields.push('is_active = ?'); values.push(socialLink.is_active ? 1 : 0); }
    if (socialLink.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(socialLink.sort_order); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await executeD1Query(
      `UPDATE social_links SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.result?.[0]?.meta?.changes || 0;
  },

  async deleteSocialLink(id: number): Promise<number> {
    const result = await executeD1Query('DELETE FROM social_links WHERE id = ?', [id]);
    return result.result?.[0]?.meta?.changes || 0;
  },

  // ===== COMMANDES =====
  async getOrders(): Promise<Order[]> {
    const result = await executeD1Query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.result?.[0]?.results || [];
  },

  async getOrder(id: number): Promise<Order | null> {
    const result = await executeD1Query('SELECT * FROM orders WHERE id = ?', [id]);
    return result.result?.[0]?.results?.[0] || null;
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await executeD1Query(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, items, total_amount, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [order.customer_name, order.customer_email || '', order.customer_phone || '', order.items, order.total_amount, order.status, order.notes || '']);
    return result.result?.[0]?.meta?.changes || 0;
  },

  async updateOrder(id: number, order: Partial<Order>): Promise<number> {
    const fields = [];
    const values = [];
    
    if (order.customer_name !== undefined) { fields.push('customer_name = ?'); values.push(order.customer_name); }
    if (order.customer_email !== undefined) { fields.push('customer_email = ?'); values.push(order.customer_email); }
    if (order.customer_phone !== undefined) { fields.push('customer_phone = ?'); values.push(order.customer_phone); }
    if (order.items !== undefined) { fields.push('items = ?'); values.push(order.items); }
    if (order.total_amount !== undefined) { fields.push('total_amount = ?'); values.push(order.total_amount); }
    if (order.status !== undefined) { fields.push('status = ?'); values.push(order.status); }
    if (order.notes !== undefined) { fields.push('notes = ?'); values.push(order.notes); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await executeD1Query(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.result?.[0]?.meta?.changes || 0;
  },

  async deleteOrder(id: number): Promise<number> {
    const result = await executeD1Query('DELETE FROM orders WHERE id = ?', [id]);
    return result.result?.[0]?.meta?.changes || 0;
  }
};

export default d1Admin;