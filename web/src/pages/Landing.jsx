import { Link, Navigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { MealAPI } from "../services/mealAPI";
import { useState, useEffect } from "react";

const landingStyles = {
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
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  authButtons: {
    display: "flex",
    gap: "12px",
  },
  signInButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.white}`,
    backgroundColor: "transparent",
    color: COLORS.white,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
  signUpButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
  heroSection: {
    backgroundColor: COLORS.primary,
    padding: "60px 20px",
    textAlign: "center",
    borderBottomLeftRadius: "50px",
    borderBottomRightRadius: "50px",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: "20px",
  },
  heroSubtitle: {
    fontSize: "20px",
    color: COLORS.white,
    opacity: 0.9,
    maxWidth: "600px",
    margin: "0 auto 30px",
  },
  ctaButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
  ctaPrimary: {
    padding: "16px 40px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
  ctaSecondary: {
    padding: "16px 40px",
    borderRadius: "12px",
    border: `2px solid ${COLORS.white}`,
    backgroundColor: "transparent",
    color: COLORS.white,
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
  featuresSection: {
    padding: "60px 20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: "40px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  featureIcon: {
    fontSize: "48px",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "10px",
  },
  featureText: {
    fontSize: "14px",
    color: COLORS.textLight,
  },
  recipesSection: {
    padding: "60px 20px",
    backgroundColor: COLORS.white,
  },
  recipesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  recipeCard: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  recipeImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  recipeContent: {
    padding: "15px",
  },
  recipeTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: COLORS.text,
  },
  recipeCategory: {
    fontSize: "12px",
    color: COLORS.textLight,
    marginTop: "5px",
  },
  footer: {
    backgroundColor: COLORS.primary,
    padding: "40px 20px",
    textAlign: "center",
    color: COLORS.white,
  },
};

const LandingPage = () => {
  const { isSignedIn } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const meals = await MealAPI.getRandomMeals(8);
      const transformed = meals.map((meal) => MealAPI.transformMealData(meal)).filter((r) => r !== null);
      setRecipes(transformed);
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId) => {
    window.location.href = `/recipe/${recipeId}`;
  };

  // Redirect if already signed in
  if (isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div style={landingStyles.container}>
      {/* Header */}
      <header style={landingStyles.header}>
        <div style={landingStyles.logo}>🍳 Recipe App</div>
        <div style={landingStyles.authButtons}>
          <Link to="/sign-in" style={landingStyles.signInButton}>Sign In</Link>
          <Link to="/sign-up" style={landingStyles.signUpButton}>Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={landingStyles.heroSection}>
        <h1 style={landingStyles.heroTitle}>Discover Delicious Recipes</h1>
        <p style={landingStyles.heroSubtitle}>
          Explore thousands of recipes from around the world. Create your own recipes and share them with the community.
        </p>
        <div style={landingStyles.ctaButtons}>
          <Link to="/sign-up" style={landingStyles.ctaPrimary}>Get Started</Link>
          <Link to="/sign-in" style={landingStyles.ctaSecondary}>Sign In</Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={landingStyles.featuresSection}>
        <h2 style={landingStyles.sectionTitle}>Why Use Recipe App?</h2>
        <div style={landingStyles.featuresGrid}>
          <div style={landingStyles.featureCard}>
            <div style={landingStyles.featureIcon}>📖</div>
            <h3 style={landingStyles.featureTitle}>Thousands of Recipes</h3>
            <p style={landingStyles.featureText}>
              Access recipes from TheMealDB and community-created content
            </p>
          </div>
          <div style={landingStyles.featureCard}>
            <div style={landingStyles.featureIcon}>✍️</div>
            <h3 style={landingStyles.featureTitle}>Create Your Own</h3>
            <p style={landingStyles.featureText}>
              Share your favorite recipes with the world
            </p>
          </div>
          <div style={landingStyles.featureCard}>
            <div style={landingStyles.featureIcon}>❤️</div>
            <h3 style={landingStyles.featureTitle}>Save Favorites</h3>
            <p style={landingStyles.featureText}>
              Save your favorite recipes for quick access
            </p>
          </div>
        </div>
      </section>

      {/* Sample Recipes Section */}
      <section style={landingStyles.recipesSection}>
        <h2 style={{ ...landingStyles.sectionTitle, marginBottom: "30px" }}>Popular Recipes</h2>
        {loading ? (
          <p style={{ textAlign: "center", color: COLORS.textLight }}>Loading recipes...</p>
        ) : (
          <div style={landingStyles.recipesGrid}>
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                style={landingStyles.recipeCard}
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={landingStyles.recipeImage}
                />
                <div style={landingStyles.recipeContent}>
                  <h3 style={landingStyles.recipeTitle}>{recipe.title}</h3>
                  <p style={landingStyles.recipeCategory}>{recipe.category} • {recipe.area}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={landingStyles.footer}>
        <p>© 2024 Recipe App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
