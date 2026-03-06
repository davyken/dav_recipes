import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { MealAPI } from "../services/mealAPI";
import { RecipeAPI, FavoritesAPI } from "../services/api";

const recipeDetailStyles = {
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
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  heroImage: {
    width: "100%",
    height: "300px",
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "20px",
  },
  heroTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: "10px",
  },
  heroMeta: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: COLORS.white,
    fontSize: "14px",
  },
  content: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  ingredientsList: {
    listStyle: "none",
    padding: 0,
  },
  ingredientItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    backgroundColor: COLORS.white,
    borderRadius: "8px",
    marginBottom: "8px",
    border: `1px solid ${COLORS.border}`,
  },
  ingredientBullet: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: COLORS.primary,
    marginRight: "12px",
  },
  ingredientText: {
    fontSize: "16px",
    color: COLORS.text,
  },
  instructionsList: {
    listStyle: "none",
    padding: 0,
  },
  instructionItem: {
    display: "flex",
    padding: "16px",
    backgroundColor: COLORS.white,
    borderRadius: "8px",
    marginBottom: "12px",
    border: `1px solid ${COLORS.border}`,
  },
  instructionNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    marginRight: "16px",
    flexShrink: 0,
  },
  instructionText: {
    fontSize: "16px",
    color: COLORS.text,
    lineHeight: "1.6",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  actionButton: {
    flex: 1,
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  shareButton: {
    backgroundColor: COLORS.white,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: "18px",
    color: COLORS.textLight,
  },
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    flexDirection: "column",
    gap: "20px",
  },
  errorText: {
    fontSize: "18px",
    color: COLORS.danger,
  },
  videoContainer: {
    marginTop: "20px",
    borderRadius: "12px",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "300px",
  },
};

const RecipeDetailPage = () => {
  const { id: recipeId } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, userId } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRecipeDetail();
    checkIfSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId, isSignedIn, userId]);

  const checkIfSaved = async () => {
    if (!isSignedIn || !userId) return;
    try {
      const favorites = await FavoritesAPI.getFavorites(userId);
      const isRecipeSaved = favorites.some(f => f.recipeId === recipeId);
      setIsSaved(isRecipeSaved);
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const loadRecipeDetail = async () => {
    setLoading(true);
    try {
      // Check if it's a user recipe (starts with "user_")
      if (recipeId.startsWith("user_")) {
        const userRecipeId = recipeId.replace("user_", "");
        const userRecipe = await RecipeAPI.getRecipe(userRecipeId);
        setRecipe({
          ...userRecipe,
          isUserRecipe: true,
        });
      } else {
        // It's a MealDB recipe
        const mealData = await MealAPI.getMealById(recipeId);
        if (mealData) {
          const transformedRecipe = MealAPI.transformMealData(mealData);
          const recipeWithVideo = {
            ...transformedRecipe,
            youtubeUrl: mealData.strYoutube || null,
          };
          setRecipe(recipeWithVideo);
        }
      }
    } catch (error) {
      console.error("Error loading recipe detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        // Remove from favorites
        await FavoritesAPI.removeFavorite(userId, recipeId);
        setIsSaved(false);
      } else {
        // Add to favorites
        await FavoritesAPI.addFavorite({
          userId,
          recipeId,
          title: recipe.title,
          image: recipe.image,
          category: recipe.category,
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
    return (
      <div style={recipeDetailStyles.container}>
        <header style={recipeDetailStyles.header}>
          <Link to="/" style={recipeDetailStyles.backButton}>
            ← Back
          </Link>
        </header>
        <div style={recipeDetailStyles.loadingContainer}>
          <p style={recipeDetailStyles.loadingText}>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={recipeDetailStyles.container}>
        <header style={recipeDetailStyles.header}>
          <Link to="/" style={recipeDetailStyles.backButton}>
            ← Back
          </Link>
        </header>
        <div style={recipeDetailStyles.errorContainer}>
          <p style={recipeDetailStyles.errorText}>Recipe not found</p>
          <Link to="/" style={{ color: COLORS.primary }}>Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={recipeDetailStyles.container}>
      {/* Header */}
      <header style={recipeDetailStyles.header}>
        <Link to="/" style={recipeDetailStyles.backButton}>
          ← Back
        </Link>
        <h1 style={recipeDetailStyles.headerTitle}>Recipe Details</h1>
        <div style={{ width: "60px" }}></div>
      </header>

      {/* Hero Image */}
      <div style={{ position: "relative", height: "300px" }}>
        <img
          src={recipe.image || "https://via.placeholder.com/800x400"}
          alt={recipe.title}
          style={recipeDetailStyles.heroImage}
        />
        <div style={recipeDetailStyles.heroOverlay}>
          <h2 style={recipeDetailStyles.heroTitle}>{recipe.title}</h2>
          <div style={recipeDetailStyles.heroMeta}>
            <span style={recipeDetailStyles.metaItem}>
              ⏱️ {recipe.cookTime || "N/A"}
            </span>
            <span style={recipeDetailStyles.metaItem}>
              👥 {recipe.servings || "N/A"} servings
            </span>
            {recipe.category && (
              <span style={recipeDetailStyles.metaItem}>
                🏷️ {recipe.category}
              </span>
            )}
            {recipe.area && (
              <span style={recipeDetailStyles.metaItem}>
                📍 {recipe.area}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={recipeDetailStyles.content}>
        {/* Action Buttons */}
        <div style={recipeDetailStyles.actionButtons}>
          <button
            style={{
              ...recipeDetailStyles.actionButton,
              ...recipeDetailStyles.saveButton,
            }}
            onClick={handleToggleSave}
            disabled={isSaving}
          >
            {isSaved ? "❤️ Saved" : "🤍 Save Recipe"}
          </button>
        </div>

        {/* Ingredients */}
        <section style={recipeDetailStyles.section}>
          <h3 style={recipeDetailStyles.sectionTitle}>
            🥗 Ingredients
          </h3>
          <ul style={recipeDetailStyles.ingredientsList}>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => (
                <li key={index} style={recipeDetailStyles.ingredientItem}>
                  <span style={recipeDetailStyles.ingredientBullet}></span>
                  <span style={recipeDetailStyles.ingredientText}>{ingredient}</span>
                </li>
              ))
            ) : (
              <li style={recipeDetailStyles.ingredientItem}>
                <span style={recipeDetailStyles.ingredientText}>No ingredients listed</span>
              </li>
            )}
          </ul>
        </section>

        {/* Instructions */}
        <section style={recipeDetailStyles.section}>
          <h3 style={recipeDetailStyles.sectionTitle}>
            👨‍🍳 Instructions
          </h3>
          <ol style={recipeDetailStyles.instructionsList}>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              recipe.instructions.map((instruction, index) => (
                <li key={index} style={recipeDetailStyles.instructionItem}>
                  <span style={recipeDetailStyles.instructionNumber}>{index + 1}</span>
                  <span style={recipeDetailStyles.instructionText}>{instruction}</span>
                </li>
              ))
            ) : (
              <li style={recipeDetailStyles.instructionItem}>
                <span style={recipeDetailStyles.instructionText}>No instructions available</span>
              </li>
            )}
          </ol>
        </section>

        {/* YouTube Video */}
        {recipe.youtubeUrl && (
          <section style={recipeDetailStyles.section}>
            <h3 style={recipeDetailStyles.sectionTitle}>
              🎥 Video Tutorial
            </h3>
            <div style={recipeDetailStyles.videoContainer}>
              <iframe
                style={recipeDetailStyles.video}
                src={getYouTubeEmbedUrl(recipe.youtubeUrl)}
                title={recipe.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        backgroundColor: COLORS.primary,
        color: COLORS.white,
      }}>
        <p>© 2024 Recipe App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RecipeDetailPage;
