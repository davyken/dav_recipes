-- Create missing tables for user recipes, addresses, and other features

-- User created recipes table
CREATE TABLE IF NOT EXISTS "user_recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image" text,
	"cook_time" text,
	"servings" integer,
	"category" text,
	"area" text,
	"ingredients" text NOT NULL,
	"instructions" text NOT NULL,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- User delivery addresses table
CREATE TABLE IF NOT EXISTS "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text,
	"address" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cuisine" text,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"rating" double precision,
	"price_level" text,
	"image" text,
	"is_open" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

-- Restaurant menu items
CREATE TABLE IF NOT EXISTS "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" double precision NOT NULL,
	"image" text,
	"available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"restaurant_id" integer NOT NULL,
	"total_amount" double precision NOT NULL,
	"status" text DEFAULT 'pending',
	"delivery_address" text,
	"delivery_phone" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"menu_item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" double precision NOT NULL,
	"created_at" timestamp DEFAULT now()
);
