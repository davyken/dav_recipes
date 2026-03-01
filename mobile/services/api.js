import { API_URL } from "../constants/api";

// Helper function to handle API calls
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============ RECIPES API ============

export const RecipeAPI = {
  // Create a new recipe
  createRecipe: async (recipeData) => {
    return fetchAPI("/recipes", {
      method: "POST",
      body: JSON.stringify(recipeData),
    });
  },

  // Get all recipes for a user
  getUserRecipes: async (userId) => {
    return fetchAPI(`/recipes/user/${userId}`);
  },

  // Get public recipes
  getPublicRecipes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/recipes/public${query ? `?${query}` : ""}`);
  },

  // Get single recipe
  getRecipe: async (id) => {
    return fetchAPI(`/recipes/${id}`);
  },

  // Update a recipe
  updateRecipe: async (id, recipeData, userId) => {
    return fetchAPI(`/recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...recipeData, userId }),
    });
  },

  // Delete a recipe
  deleteRecipe: async (id, userId) => {
    return fetchAPI(`/recipes/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  },
};

// ============ ADDRESSES API ============

export const AddressAPI = {
  // Add a new address
  addAddress: async (addressData) => {
    return fetchAPI("/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    });
  },

  // Get user's addresses
  getAddresses: async (userId) => {
    return fetchAPI(`/addresses/${userId}`);
  },

  // Delete an address
  deleteAddress: async (id) => {
    return fetchAPI(`/addresses/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ ORDERS API ============

export const OrderAPI = {
  // Create an order
  createOrder: async (orderData) => {
    return fetchAPI("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  // Get user's orders
  getUserOrders: async (userId) => {
    return fetchAPI(`/orders/${userId}`);
  },
};

// ============ GOOGLE PLACES API ============

export const GooglePlacesAPI = {
  // Get nearby restaurants
  getNearbyRestaurants: async (lat, lng, radius = 5000, keyword = "") => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });
    if (keyword) params.append("keyword", keyword);
    return fetchAPI(`/google/restaurants?${params}`);
  },

  // Get restaurant details
  getRestaurantDetails: async (placeId) => {
    return fetchAPI(`/google/restaurant/${placeId}`);
  },

  // Search restaurants
  searchRestaurants: async (query, lat = null, lng = null) => {
    const params = new URLSearchParams({ query });
    if (lat && lng) {
      params.append("lat", lat.toString());
      params.append("lng", lng.toString());
    }
    return fetchAPI(`/google/search?${params}`);
  },
};
