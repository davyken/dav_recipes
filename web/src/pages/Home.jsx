import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { MealAPI } from "../services/mealAPI";
import { RecipeAPI } from "../services/api";

const homeStyles = {
  container: {
    padding: "0",
  },
  welcomeSection: {
    textAlign: "center",
    padding: "30px 20px",
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    marginBottom: "20px",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "10px",
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: COLORS.textLight,
  },
  featuredSection: {
    marginBottom: "20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.text,
  },
  seeAllLink: {
    color: COLORS.primary,
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
  },
  featuredCard: {
    backgroundColor: COLORS.card,
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    cursor: "pointer",
  },
  featuredImageContainer: {
    position: "relative",
    height: "200px",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "15px",
  },
  featuredBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "10px",
    paddingVertical: "4px",
    borderRadius: "12px",
    display: "inline-block",
    marginBottom: "8px",
  },
  featuredBadgeText: {
    color: COLORS.white,
    fontSize: "11px",
    fontWeight: "600",
  },
  featuredTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: "5px",
  },
  featuredMeta: {
    display: "flex",
    gap: "12px",
    fontSize: "12px",
    color: COLORS.white,
  },
  categoriesSection: {
    marginBottom: "20px",
  },
  categoryContainer: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    paddingBottom: "10px",
  },
  categoryButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    border: `1px solid ${COLORS.border}`,
    minWidth: "80px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryImage: {
    width: "36px",
    height: "36px",
    borderRadius: "18px",
    marginBottom: "6px",
    objectFit: "cover",
  },
  categoryText: {
    fontSize: "11px",
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  recipesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "15px",
  },
  recipeCard: {
    backgroundColor: COLORS.card,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  recipeImage: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
  },
  recipeContent: {
    padding: "10px",
  },
  recipeTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: "4px",
    lineHeight: "1.3",
  },
  recipeMeta: {
    fontSize: "11px",
    color: COLORS.textLight,
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    textDecoration: "none",
    display: "block",
  },
  actionIcon: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  actionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: COLORS.text,
  },
};

const HomePage = () => {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch both MealDB and user public recipes in parallel
      const [apiCategories, randomMeals, featuredMeal, publicUserRecipes] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(8),
        MealAPI.getRandomMeal(),
        RecipeAPI.getPublicRecipes().catch(() => []),
      ]);

      const transformedCategories = apiCategories.map((cat, index) => ({
        id: index + 1,
        name: cat.strCategory,
        image: cat.strCategoryThumb,
      }));

      setCategories(transformedCategories);

      if (!selectedCategory) setSelectedCategory(transformedCategories[0]?.name);

      const transformedMeals = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);

      setRecipes(transformedMeals);

      // Transform user recipes
      const transformedUserRecipes = publicUserRecipes.map(recipe => ({
        id: `user_${recipe.id}`,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        category: recipe.category,
        area: recipe.area,
        isUserRecipe: true,
      }));
      
      setUserRecipes(transformedUserRecipes);

      const transformedFeatured = MealAPI.transformMealData(featuredMeal);
      setFeaturedRecipe(transformedFeatured);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category) => {
    try {
      setSelectedCategory(category);
      const meals = await MealAPI.filterByCategory(category);
      const transformedMeals = meals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
      setRecipes(transformedMeals.slice(0, 8)); // Limit to 8
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    }
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (loading) {
    return (
      <div style={homeStyles.container}>
        <div style={homeStyles.welcomeSection}>
          <p>Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={homeStyles.container}>
      {/* Welcome Section */}
      <div style={homeStyles.welcomeSection}>
        <h1 style={homeStyles.welcomeTitle}>
          Welcome{user?.username ? `, ${user.username}` : ""}! 👋
        </h1>
        <p style={homeStyles.welcomeSubtitle}>
          Discover and share amazing recipes
        </p>
      </div>

      {/* Quick Actions */}
      <div style={homeStyles.quickActions}>
        <Link to="/my-recipes" style={homeStyles.actionCard}>
          <div style={homeStyles.actionIcon}>➕</div>
          <div style={homeStyles.actionTitle}>Add Recipe</div>
        </Link>
        <Link to="/search" style={homeStyles.actionCard}>
          <div style={homeStyles.actionIcon}>🔍</div>
          <div style={homeStyles.actionTitle}>Search</div>
        </Link>
      </div>

      {/* Featured Recipe */}
      {featuredRecipe && (
        <section style={homeStyles.featuredSection}>
          <div style={homeStyles.sectionHeader}>
            <h2 style={homeStyles.sectionTitle}>Featured Recipe</h2>
          </div>
          <div 
            style={homeStyles.featuredCard}
            onClick={() => handleRecipeClick(featuredRecipe.id)}
          >
            <div style={homeStyles.featuredImageContainer}>
              <img 
                src={featuredRecipe.image} 
                alt={featuredRecipe.title}
                style={homeStyles.featuredImage}
              />
              <div style={homeStyles.featuredOverlay}>
                <span style={homeStyles.featuredBadge}>
                  <span style={homeStyles.featuredBadgeText}>Featured</span>
                </span>
                <h3 style={homeStyles.featuredTitle}>{featuredRecipe.title}</h3>
                <div style={homeStyles.featuredMeta}>
                  <span>⏱️ {featuredRecipe.cookTime}</span>
                  <span>👥 {featuredRecipe.servings} servings</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section style={homeStyles.categoriesSection}>
        <div style={homeStyles.sectionHeader}>
          <h2 style={homeStyles.sectionTitle}>Categories</h2>
        </div>
        <div style={homeStyles.categoryContainer}>
          {categories.map((category) => (
            <button
              key={category.id}
              style={{
                ...homeStyles.categoryButton,
                ...(selectedCategory === category.name ? homeStyles.categoryButtonActive : {}),
              }}
              onClick={() => loadCategoryData(category.name)}
            >
              <img
                src={category.image}
                alt={category.name}
                style={homeStyles.categoryImage}
              />
              <span style={{
                ...homeStyles.categoryText,
                ...(selectedCategory === category.name ? homeStyles.categoryTextActive : {}),
              }}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* User Recipes (Community) */}
      {userRecipes.length > 0 && (
        <section style={homeStyles.featuredSection}>
          <div style={homeStyles.sectionHeader}>
            <h2 style={homeStyles.sectionTitle}>Community Recipes</h2>
            <Link to="/search" style={homeStyles.seeAllLink}>See All</Link>
          </div>
          <div style={homeStyles.recipesGrid}>
            {userRecipes.slice(0, 4).map((recipe) => (
              <div
                key={recipe.id}
                style={homeStyles.recipeCard}
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <img
                  src={recipe.image || "https://via.placeholder.com/200x150"}
                  alt={recipe.title}
                  style={homeStyles.recipeImage}
                />
                <div style={homeStyles.recipeContent}>
                  <h3 style={homeStyles.recipeTitle}>{recipe.title}</h3>
                  <p style={homeStyles.recipeMeta}>{recipe.cookTime || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Recipes */}
      <section style={homeStyles.featuredSection}>
        <div style={homeStyles.sectionHeader}>
          <h2 style={homeStyles.sectionTitle}>{selectedCategory}</h2>
          <Link to="/search" style={homeStyles.seeAllLink}>See All</Link>
        </div>
        
        {recipes.length > 0 ? (
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
                  <p style={homeStyles.recipeMeta}>{recipe.cookTime}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={homeStyles.emptyState}>
            <p>No recipes found in this category</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
