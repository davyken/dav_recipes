import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, restaurantsTable, menuItemsTable, ordersTable, orderItemsTable, userRecipesTable, addressesTable, usersTable } from "./db/schema.js";
import { and, eq, asc, like, or } from "drizzle-orm";
import job from "./config/cron.js";
import crypto from "crypto";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(cors());
app.use(express.json());

// Google Places API base URL
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

// ============ AUTHENTICATION API ============

// Simple hash function for passwords (in production, use bcrypt)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Generate verification code
function generateVerificationCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

// Generate user ID
function generateUserId() {
  return crypto.randomUUID();
}

// Register new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create new user
    const newUser = await db
      .insert(usersTable)
      .values({
        userId: generateUserId(),
        email,
        username: username || email.split("@")[0],
        password: hashPassword(password),
        verificationCode,
        verificationCodeExpiry,
        emailVerified: false,
      })
      .returning();

    // In production, send email with verification code
    // For now, return the code in the response (development only)
    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: newUser[0].userId,
      email: newUser[0].email,
      verificationCode: verificationCode, // Remove in production
    });
  } catch (error) {
    console.log("Error registering user", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Verify email
app.post("/api/auth/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user[0].emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    if (user[0].verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (new Date() > new Date(user[0].verificationCodeExpiry)) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    // Update user as verified
    await db
      .update(usersTable)
      .set({
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      })
      .where(eq(usersTable.email, email));

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying email", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user[0].emailVerified) {
      return res.status(401).json({ error: "Please verify your email first" });
    }

    if (user[0].password !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Return user info (in production, return JWT token)
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user[0].id,
        userId: user[0].userId,
        email: user[0].email,
        username: user[0].username,
      },
    });
  } catch (error) {
    console.log("Error logging in", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Resend verification code
app.post("/api/auth/resend-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user[0].emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db
      .update(usersTable)
      .set({
        verificationCode,
        verificationCodeExpiry,
      })
      .where(eq(usersTable.email, email));

    // In production, send email with verification code
    res.status(200).json({
      message: "Verification code sent",
      verificationCode: verificationCode, // Remove in production
    });
  } catch (error) {
    console.log("Error resending code", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ============ GOOGLE PLACES API ============

// Search restaurants using Google Places API
app.get("/api/google/restaurants", async (req, res) => {
  try {
    const { lat, lng, radius = 5000, keyword } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    // Search for restaurants nearby
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&keyword=${encodeURIComponent(keyword || '')}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const restaurants = data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        priceLevel: place.price_level ? "$".repeat(place.price_level) : "$",
        image: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null,
        openNow: place.opening_hours?.open_now,
        placeId: place.place_id,
      }));
      res.status(200).json(restaurants);
    } else if (data.status === "ZERO_RESULTS") {
      res.status(200).json([]);
    } else {
      res.status(500).json({ error: "Google Places API error", details: data });
    }
  } catch (error) {
    console.log("Error fetching Google restaurants", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get restaurant details including phone number and menu
app.get("/api/google/restaurant/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    
    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,opening_hours,website,reviews,photos&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const place = data.result;
      
      // Calculate distance from reference point (would need user location in request)
      // For now return the data we have
      
      res.status(200).json({
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        openingHours: place.opening_hours?.weekday_text || [],
        openNow: place.opening_hours?.open_now,
        image: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null,
        // Note: Google Places API doesn't provide menu data
        // Menu would need to be scraped separately or entered manually
        hasMenu: false,
        menu: [],
      });
    } else {
      res.status(500).json({ error: "Place not found" });
    }
  } catch (error) {
    console.log("Error fetching restaurant details", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Search restaurants with text query
app.get("/api/google/search", async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;
    
    if (lat && lng) {
      url += `&location=${lat},${lng}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const restaurants = data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        priceLevel: place.price_level ? "$".repeat(place.price_level) : "$",
        image: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null,
        openNow: place.opening_hours?.open_now,
        placeId: place.place_id,
      }));
      res.status(200).json(restaurants);
    } else if (data.status === "ZERO_RESULTS") {
      res.status(200).json([]);
    } else {
      res.status(500).json({ error: "Google Places API error", details: data });
    }
  } catch (error) {
    console.log("Error searching restaurants", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ============ USER RECIPES API ============

// Create a new recipe
app.post("/api/recipes", async (req, res) => {
  try {
    const { userId, title, description, image, cookTime, servings, category, area, ingredients, instructions, isPublic } = req.body;

    if (!userId || !title || !ingredients || !instructions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRecipe = await db
      .insert(userRecipesTable)
      .values({
        userId,
        title,
        description,
        image,
        cookTime,
        servings,
        category,
        area,
        ingredients: JSON.stringify(ingredients),
        instructions: JSON.stringify(instructions),
        isPublic: isPublic !== false,
      })
      .returning();

    res.status(201).json({
      ...newRecipe[0],
      ingredients: JSON.parse(newRecipe[0].ingredients),
      instructions: JSON.parse(newRecipe[0].instructions),
    });
  } catch (error) {
    console.log("Error creating recipe", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get all recipes for a user
app.get("/api/recipes/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const recipes = await db
      .select()
      .from(userRecipesTable)
      .where(eq(userRecipesTable.userId, userId))
      .orderBy(asc(userRecipesTable.createdAt));

    const formattedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
    }));

    res.status(200).json(formattedRecipes);
  } catch (error) {
    console.log("Error fetching user recipes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get public recipes
app.get("/api/recipes/public", async (req, res) => {
  try {
    const { category, area, search } = req.query;

    let query = db.select().from(userRecipesTable).where(eq(userRecipesTable.isPublic, true));
    
    const recipes = await query.orderBy(asc(userRecipesTable.createdAt));

    let filteredRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
    }));

    // Filter by category if provided
    if (category) {
      filteredRecipes = filteredRecipes.filter(r => r.category === category);
    }

    // Filter by area/cuisine if provided
    if (area) {
      filteredRecipes = filteredRecipes.filter(r => r.area === area);
    }

    // Search by title
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json(filteredRecipes);
  } catch (error) {
    console.log("Error fetching public recipes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get single recipe by ID
app.get("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await db
      .select()
      .from(userRecipesTable)
      .where(eq(userRecipesTable.id, parseInt(id)));

    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json({
      ...recipe[0],
      ingredients: JSON.parse(recipe[0].ingredients),
      instructions: JSON.parse(recipe[0].instructions),
    });
  } catch (error) {
    console.log("Error fetching recipe", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update a recipe
app.put("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, title, description, image, cookTime, servings, category, area, ingredients, instructions, isPublic } = req.body;

    // First check if recipe exists and belongs to the user
    const existingRecipe = await db
      .select()
      .from(userRecipesTable)
      .where(eq(userRecipesTable.id, parseInt(id)));

    if (existingRecipe.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Verify ownership
    if (existingRecipe[0].userId !== userId) {
      return res.status(403).json({ error: "You can only update your own recipes" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (cookTime !== undefined) updateData.cookTime = cookTime;
    if (servings !== undefined) updateData.servings = servings;
    if (category !== undefined) updateData.category = category;
    if (area !== undefined) updateData.area = area;
    if (ingredients) updateData.ingredients = JSON.stringify(ingredients);
    if (instructions) updateData.instructions = JSON.stringify(instructions);
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(userRecipesTable)
      .set(updateData)
      .where(eq(userRecipesTable.id, parseInt(id)))
      .returning();

    res.status(200).json({
      ...updated[0],
      ingredients: JSON.parse(updated[0].ingredients),
      instructions: JSON.parse(updated[0].instructions),
    });
  } catch (error) {
    console.log("Error updating recipe", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete a recipe
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Require userId for ownership check

    // First check if recipe exists and belongs to the user
    const existingRecipe = await db
      .select()
      .from(userRecipesTable)
      .where(eq(userRecipesTable.id, parseInt(id)));

    if (existingRecipe.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Verify ownership
    if (existingRecipe[0].userId !== userId) {
      return res.status(403).json({ error: "You can only delete your own recipes" });
    }

    await db
      .delete(userRecipesTable)
      .where(eq(userRecipesTable.id, parseInt(id)));

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.log("Error deleting recipe", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ============ USER ADDRESSES API ============

// Add delivery address
app.post("/api/addresses", async (req, res) => {
  try {
    const { userId, label, address, latitude, longitude, isDefault } = req.body;

    if (!userId || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.userId, userId));
    }

    const newAddress = await db
      .insert(addressesTable)
      .values({
        userId,
        label,
        address,
        latitude,
        longitude,
        isDefault: isDefault || false,
      })
      .returning();

    res.status(201).json(newAddress[0]);
  } catch (error) {
    console.log("Error adding address", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get user's addresses
app.get("/api/addresses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.userId, userId))
      .orderBy(asc(addressesTable.isDefault));

    res.status(200).json(addresses);
  } catch (error) {
    console.log("Error fetching addresses", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete an address
app.delete("/api/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .delete(addressesTable)
      .where(eq(addressesTable.id, parseInt(id)));

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.log("Error deleting address", error);
    res.status(500).json({ error: "Something went wrong" });
  }
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
