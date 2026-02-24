import { pgTable, serial, text, timestamp, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  title: text("title").notNull(),
  image: text("image"),
  cookTime: text("cook_time"),
  servings: text("servings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Restaurants table
export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  rating: doublePrecision("rating"),
  priceLevel: text("price_level"),
  image: text("image"),
  isOpen: boolean("is_open").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Restaurant menu items
export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  image: text("image"),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders/Delivery table
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").default("pending"), // pending, confirmed, preparing, delivering, delivered, cancelled
  deliveryAddress: text("delivery_address"),
  deliveryPhone: text("delivery_phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order items
export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(), // price at time of order
  createdAt: timestamp("created_at").defaultNow(),
});
