import { Link, Navigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { MealAPI } from "../services/mealAPI";
import { useState, useEffect } from "react";

const landingStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: "20px 40px",
    paddingTop: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 20px rgba(106, 27, 154, 0.2)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoImage: {
    width: "48px",
    height: "48px",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: "1px",
  },
  authButtons: {
    display: "flex",
    gap: "16px",
  },
  signInButton: {
    padding: "12px 28px",
    borderRadius: "8px",
    border: `2px solid ${COLORS.white}`,
    backgroundColor: "transparent",
    color: COLORS.white,
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.3s ease",
  },
  signUpButton: {
    padding: "12px 28px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  heroSection: {
    backgroundColor: COLORS.primary,
    padding: "80px 20px 120px",
    textAlign: "center",
    borderBottomLeftRadius: "80px",
    borderBottomRightRadius: "80px",
    position: "relative",
    overflow: "hidden",
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
  },
  heroTitle: {
    fontSize: "56px",
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: "24px",
    letterSpacing: "-1px",
    position: "relative",
  },
  heroSubtitle: {
    fontSize: "22px",
    color: COLORS.white,
    opacity: 0.95,
    maxWidth: "700px",
    margin: "0 auto 40px",
    lineHeight: "1.6",
    position: "relative",
  },
  ctaButtons: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    position: "relative",
  },
  ctaPrimary: {
    padding: "18px 48px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  },
  ctaSecondary: {
    padding: "18px 48px",
    borderRadius: "14px",
    border: `3px solid ${COLORS.white}`,
    backgroundColor: "transparent",
    color: COLORS.white,
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.3s ease",
  },
  featuresSection: {
    padding: "80px 20px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: "50px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "40px",
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: "20px",
    padding: "40px 30px",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    border: "1px solid rgba(106, 27, 154, 0.1)",
  },
  featureIcon: {
    fontSize: "56px",
    marginBottom: "24px",
    display: "block",
  },
  featureTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: "14px",
  },
  featureText: {
    fontSize: "15px",
    color: COLORS.textLight,
    lineHeight: "1.7",
  },
  recipesSection: {
    padding: "80px 20px",
    backgroundColor: COLORS.white,
  },
  recipesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "30px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  recipeCard: {
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: COLORS.white,
  },
  recipeImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },
  recipeContent: {
    padding: "20px",
  },
  recipeTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: "8px",
  },
  recipeCategory: {
    fontSize: "13px",
    color: COLORS.textLight,
    fontWeight: "500",
  },
  footer: {
    backgroundColor: COLORS.primary,
    padding: "50px 20px",
    textAlign: "center",
    color: COLORS.white,
  },
  footerText: {
    fontSize: "15px",
    opacity: 0.9,
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
        <div style={landingStyles.logoContainer}>
          <img 
            src="/logo.svg" 
            alt="Recipe App Logo" 
            style={landingStyles.logoImage}
          />
          <span style={landingStyles.logoText}>RECIPE</span>
        </div>
        <div style={landingStyles.authButtons}>
          <Link to="/sign-in" style={landingStyles.signInButton}>Sign In</Link>
          <Link to="/sign-up" style={landingStyles.signUpButton}>Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={landingStyles.heroSection}>
        <div style={landingStyles.heroPattern}></div>
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
        <p style={landingStyles.footerText}>© 2026 Recipe App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
