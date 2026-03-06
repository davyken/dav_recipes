import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { COLORS } from "../constants/colors";
import { MealAPI } from "../services/mealAPI";
import { homeStyles } from "../styles/home.styles";

// African countries for filtering
const AFRICAN_COUNTRIES = [
  { name: "All", code: "" },
  { name: "Cameroon", code: "Cameroonian" },
  { name: "Nigeria", code: "Nigerian" },
  { name: "Ghana", code: "Ghanaian" },
  { name: "Kenya", code: "Kenyan" },
  { name: "Ethiopia", code: "Ethiopian" },
  { name: "Egypt", code: "Egyptian" },
  { name: "Morocco", code: "Moroccan" },
  { name: "South Africa", code: "South African" },
];

const searchStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: "20px",
    paddingTop: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    color: COLORS.white,
    textDecoration: "none",
    fontSize: "16px",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  searchContainer: {
    padding: "20px",
    backgroundColor: COLORS.primary,
    paddingBottom: "30px",
  },
  searchInput: {
    width: "100%",
    padding: "16px 20px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    boxSizing: "border-box",
  },
  filterContainer: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    paddingBottom: "10px",
    padding: "0 20px 15px 20px",
    backgroundColor: COLORS.primary,
  },
  filterChip: {
    padding: "8px 16px",
    borderRadius: "20px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    fontSize: "14px",
    color: COLORS.text,
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.white,
  },
  content: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  resultsInfo: {
    marginBottom: "20px",
    fontSize: "16px",
    color: COLORS.text,
  },
  noResults: {
    textAlign: "center",
    padding: "60px 20px",
  },
  noResultsIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  noResultsTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "8px",
  },
  noResultsText: {
    fontSize: "14px",
    color: COLORS.textLight,
  },
};

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  const performSearch = async (query, country = selectedCountry) => {
    // if no search query, get random meals
    if (!query.trim()) {
      const randomMeals = await MealAPI.getRandomMeals(12);
      return randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
    }

    // search by name first
    const nameResults = await MealAPI.searchMealsByName(query);
    let results = nameResults;

    // if no results, search by ingredient
    if (results.length === 0) {
      const ingredientResults = await MealAPI.filterByIngredient(query);
      results = ingredientResults;
    }

    // If African country filter is selected
    if (selectedCountry) {
      const countryResults = await MealAPI.searchByAfricanCountry(selectedCountry);
      results = [...results, ...countryResults];
      // Deduplicate by ID
      const seen = new Set();
      results = results.filter(meal => {
        if (seen.has(meal.idMeal)) return false;
        seen.add(meal.idMeal);
        return true;
      });
    }

    return results
      .slice(0, 12)
      .map((meal) => MealAPI.transformMealData(meal))
      .filter((meal) => meal !== null);
  };

  const loadInitialData = async () => {
    try {
      const results = await performSearch("");
      setRecipes(results);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length > 2 || searchQuery.length === 0) {
        searchRecipes(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCountry]);

  const searchRecipes = async (query) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await performSearch(query, selectedCountry);
      setRecipes(results);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryFilter = (countryCode) => {
    setSelectedCountry(countryCode);
    searchRecipes(searchQuery);
  };

  const handleRecipeClick = (recipeId) => {
    window.location.href = `/recipe/${recipeId}`;
  };

  return (
    <div style={searchStyles.container}>
      {/* Header */}
      <header style={searchStyles.header}>
        <Link to="/" style={searchStyles.backButton}>← Back</Link>
        <h1 style={searchStyles.headerTitle}>Search Recipes</h1>
        <div style={{ width: "60px" }}></div>
      </header>

      {/* Search Input */}
      <div style={searchStyles.searchContainer}>
        <input
          type="text"
          style={searchStyles.searchInput}
          placeholder="Search for recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* African Country Filter */}
      <div style={searchStyles.filterContainer}>
        {AFRICAN_COUNTRIES.map((country) => (
          <button
            key={country.name}
            style={{
              ...searchStyles.filterChip,
              ...(selectedCountry === country.code ? searchStyles.filterChipActive : {}),
            }}
            onClick={() => handleCountryFilter(country.code)}
          >
            {country.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={searchStyles.content}>
        {loading ? (
          <div style={searchStyles.noResults}>
            <p>Searching...</p>
          </div>
        ) : hasSearched ? (
          recipes.length > 0 ? (
            <>
              <p style={searchStyles.resultsInfo}>
                Found {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
              </p>
              <div style={homeStyles.recipesGrid}>
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    style={homeStyles.recipeCard}
                    onClick={() => handleRecipeClick(recipe.id)}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      style={homeStyles.recipeImage}
                    />
                    <div style={homeStyles.recipeContent}>
                      <h3 style={homeStyles.recipeTitle}>{recipe.title}</h3>
                      <p style={homeStyles.recipeDescription}>{recipe.description}</p>
                      <div style={homeStyles.recipeMeta}>
                        <span>⏱️ {recipe.cookTime}</span>
                        <span>👥 {recipe.servings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={searchStyles.noResults}>
              <div style={searchStyles.noResultsIcon}>🔍</div>
              <h3 style={searchStyles.noResultsTitle}>No Results Found</h3>
              <p style={searchStyles.noResultsText}>
                Try searching with different keywords
              </p>
            </div>
          )
        ) : (
          <div style={searchStyles.noResults}>
            <div style={searchStyles.noResultsIcon}>🍳</div>
            <h3 style={searchStyles.noResultsTitle}>Search for Recipes</h3>
            <p style={searchStyles.noResultsText}>
              Enter a recipe name to start searching
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
