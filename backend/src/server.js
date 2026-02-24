import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, restaurantsTable, menuItemsTable, ordersTable, orderItemsTable } from "./db/schema.js";
import { and, eq, asc } from "drizzle-orm";
import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ============ RESTAURANT APIs ============

// Get all restaurants with optional location filter
app.get("/api/restaurants", async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km
    
    let restaurants;
    
    if (lat && lng) {
      // Calculate distance and filter by radius (simple approximation)
      // For production, use PostGIS or more sophisticated distance calculation
      restaurants = await db.select().from(restaurantsTable);
      
      // Filter by approximate distance
      restaurants = restaurants.filter(r => {
        if (!r.latitude || !r.longitude) return false;
        const distance = Math.sqrt(
          Math.pow((r.latitude - parseFloat(lat)) * 111, 2) +
          Math.pow((r.longitude - parseFloat(lng)) * 111 * Math.cos(r.latitude * Math.PI / 180), 2)
        );
        return distance <= parseFloat(radius);
      });
    } else {
      restaurants = await db.select().from(restaurantsTable);
    }

    res.status(200).json(restaurants);
  } catch (error) {
    console.log("Error fetching restaurants", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get restaurant by ID with menu
app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.id, parseInt(id)));

    if (restaurant.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const menu = await db
      .select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.restaurantId, parseInt(id)));

    res.status(200).json({ ...restaurant[0], menu });
  } catch (error) {
    console.log("Error fetching restaurant", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Create an order
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, restaurantId, items, deliveryAddress, deliveryPhone, notes } = req.body;

    if (!userId || !restaurantId || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const newOrder = await db
      .insert(ordersTable)
      .values({
        userId,
        restaurantId,
        totalAmount,
        deliveryAddress,
        deliveryPhone,
        notes,
        status: "pending",
      })
      .returning();

    const orderId = newOrder[0].id;

    // Create order items
    for (const item of items) {
      await db.insert(orderItemsTable).values({
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    res.status(201).json({ ...newOrder[0], items });
  } catch (error) {
    console.log("Error creating order", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get user's orders
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(asc(ordersTable.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));
        return { ...order, items };
      })
    );

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.log("Error fetching orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update order status (for restaurant/admin)
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, parseInt(id)));

    res.status(200).json({ message: "Order status updated" });
  } catch (error) {
    console.log("Error updating order status", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Seed sample restaurants (for testing)
app.post("/api/seed/restaurants", async (req, res) => {
  try {
    const sampleRestaurants = [
      {
        name: "Le Grand Hôtel Restaurant",
        cuisine: "French, African",
        address: "Rue de la Paix, Douala",
        phone: "+237 6XX XXX XXX",
        latitude: 4.0511,
        longitude: 9.7679,
        rating: 4.5,
        priceLevel: "$$",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        isOpen: true,
      },
      {
        name: "Makossa Restaurant",
        cuisine: "African, Cameroon",
        address: "Bonanjo, Douala",
        phone: "+237 6XX XXX XXX",
        latitude: 4.0611,
        longitude: 9.7719,
        rating: 4.2,
        priceLevel: "$",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
        isOpen: true,
      },
      {
        name: "Pizza Roma",
        cuisine: "Italian, Pizza",
        address: "Akwa, Douala",
        phone: "+237 6XX XXX XXX",
        latitude: 4.0551,
        longitude: 9.7649,
        rating: 4.7,
        priceLevel: "$",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
        isOpen: true,
      },
    ];

    for (const restaurant of sampleRestaurants) {
      const [created] = await db.insert(restaurantsTable).values(restaurant).returning();
      
      // Add menu items
      const menuItems = [
        { name: "Poulet DG", description: "Chicken with fried plantains", price: 3500 },
        { name: "Ndolé", description: "Bitter leaf stew with palm oil", price: 2800 },
        { name: "Eru with Fish", description: "Eru soup with fresh fish", price: 3200 },
      ];

      for (const item of menuItems) {
        await db.insert(menuItemsTable).values({
          restaurantId: created.id,
          ...item,
        });
      }
    }

    res.status(201).json({ message: "Restaurants seeded successfully" });
  } catch (error) {
    console.log("Error seeding restaurants", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});
