const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const MealAPI = {
  // search meal by name
  searchMealsByName: async (query) => {
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error searching meals by name:", error);
      return [];
    }
  },

  // lookup full meal details by id
  getMealById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting meal by id:", error);
      return null;
    }
  },

  // lookup a single random meal
  getRandomMeal: async () => {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting random meal:", error);
      return null;
    }
  },

  // get multiple random meals
  getRandomMeals: async (count = 6) => {
    try {
      const promises = Array(count)
        .fill()
        .map(() => MealAPI.getRandomMeal());
      const meals = await Promise.all(promises);
      return meals.filter((meal) => meal !== null);
    } catch (error) {
      console.error("Error getting random meals:", error);
      return [];
    }
  },

  // list all meal categories
  getCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories.php`);
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  },

  // filter by main ingredient
  filterByIngredient: async (ingredient) => {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error filtering by ingredient:", error);
      return [];
    }
  },

  // filter by category
  filterByCategory: async (category) => {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error filtering by category:", error);
      return [];
    }
  },

  // transform TheMealDB meal data to our app format
  transformMealData: (meal) => {
    if (!meal) return null;

    // extract ingredients from the meal object
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        const measureText = measure && measure.trim() ? `${measure.trim()} ` : "";
        ingredients.push(`${measureText}${ingredient.trim()}`);
      }
    }

    // extract instructions
    const instructions = meal.strInstructions
      ? meal.strInstructions.split(/\r?\n/).filter((step) => step.trim())
      : [];

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      description: meal.strInstructions
        ? meal.strInstructions.substring(0, 120) + "..."
        : "Delicious meal from TheMealDB",
      image: meal.strMealThumb,
      cookTime: "30 minutes",
      servings: 4,
      category: meal.strCategory || "Main Course",
      area: meal.strArea,
      ingredients,
      instructions,
      originalData: meal,
    };
  },

  // Get meals by African country (Cameroon, Nigeria, Ghana, etc.)
  searchByAfricanCountry: async (country) => {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(country)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error(`Error searching meals for ${country}:`, error);
      return [];
    }
  },

  // Get all available African countries
  getAfricanCountries: async () => {
    return [
      { name: "Cameroon", code: "Cameroonian" },
      { name: "Nigeria", code: "Nigerian" },
      { name: "Ghana", code: "Ghanaian" },
      { name: "Kenya", code: "Kenyan" },
      { name: "Ethiopia", code: "Ethiopian" },
      { name: "Egypt", code: "Egyptian" },
      { name: "Morocco", code: "Moroccan" },
      { name: "Tunisia", code: "Tunisian" },
      { name: "South Africa", code: "South African" },
      { name: "Ivory Coast", code: "Ivory Coast" },
      { name: "Senegal", code: "Senegalese" },
      { name: "DRC", code: "Congolese" },
    ];
  },

  // Search Cameroon recipes specifically
  searchCameroonRecipes: async () => {
    try {
      // TheMealDB uses "Canadian" but for Cameroon we need to use area search
      const countries = ["African", "Cameroonian", "Nigerian", "Ghanaian"];
      const promises = countries.map(country => 
        fetch(`${BASE_URL}/filter.php?a=${country}`).then(res => res.json())
      );
      const results = await Promise.all(promises);
      
      // Combine and deduplicate results
      const allMeals = [];
      const seen = new Set();
      results.forEach(data => {
        if (data.meals) {
          data.meals.forEach(meal => {
            if (!seen.has(meal.idMeal)) {
              seen.add(meal.idMeal);
              allMeals.push(meal);
            }
          });
        }
      });
      return allMeals;
    } catch (error) {
      console.error("Error searching Cameroon recipes:", error);
      return [];
    }
  },

  // Get full meal details by ID (used with filtered results)
  getMealDetails: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting meal details:", error);
      return null;
    }
  },
};
