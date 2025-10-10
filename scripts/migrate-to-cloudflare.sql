-- Migration script for Cloudflare D1
-- Based on Prisma schema

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create farms table
CREATE TABLE IF NOT EXISTS "farms" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "image" TEXT,
    "video" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "farmId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create informations table
CREATE TABLE IF NOT EXISTS "informations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO "users" ("id", "email", "password", "name", "role") VALUES 
('admin-1', 'admin@cbdshop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'ADMIN');

INSERT INTO "farms" ("id", "name", "description", "location", "isActive") VALUES 
('farm-1', 'Ferme Bio du Sud', 'Ferme familiale spécialisée dans la culture biologique de chanvre CBD', 'Provence, France', 1),
('farm-2', 'Green Valley Farm', 'Ferme moderne utilisant les dernières technologies pour la culture du CBD', 'Normandie, France', 1);

INSERT INTO "categories" ("id", "name", "description", "isActive") VALUES 
('cat-1', 'Huiles CBD', 'Huiles de CBD de différentes concentrations', 1),
('cat-2', 'Fleurs CBD', 'Fleurs de chanvre CBD séchées', 1),
('cat-3', 'Résines CBD', 'Résines et haschisch CBD', 1);

INSERT INTO "products" ("id", "name", "description", "price", "stock", "farmId", "categoryId", "isActive") VALUES 
('prod-1', 'Huile CBD 5%', 'Huile de CBD à 5% de concentration, parfaite pour débuter', 29.90, 50, 'farm-1', 'cat-1', 1),
('prod-2', 'Huile CBD 10%', 'Huile de CBD à 10% de concentration, pour un usage régulier', 49.90, 30, 'farm-1', 'cat-1', 1),
('prod-3', 'Fleurs CBD Amnesia', 'Fleurs de chanvre CBD Amnesia, arôme citronné', 39.90, 25, 'farm-2', 'cat-2', 1);

INSERT INTO "informations" ("id", "title", "content", "type", "isActive") VALUES 
('info-1', 'Mentions Légales', 'Contenu des mentions légales...', 'mentions', 1),
('info-2', 'Conditions Générales de Vente', 'Contenu des CGV...', 'cgv', 1),
('info-3', 'À Propos', 'Présentation de notre boutique CBD...', 'about', 1);