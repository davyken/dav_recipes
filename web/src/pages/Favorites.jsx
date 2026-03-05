import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { homeStyles } from "../styles/home.styles";
import { API_URL } from "../constants/api";

const favoritesStyles = {
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
  content: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: COLORS.textLight,
    marginBottom: "24px",
  },
  signInButton: {
    display: "inline-block",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: "14px 28px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    marginBottom: "16px",
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  recipeImage: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
  },
  recipeInfo: {
    flex: 1,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  recipeTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "4px",
  },
  recipeDescription: {
    fontSize: "13px",
    color: COLORS.textLight,
    marginBottom: "8px",
  },
  recipeMeta: {
    display: "flex",
    gap: "12px",
    fontSize: "12px",
    color: COLORS.textLight,
  },
  removeButton: {
    padding: "8px 12px",
    backgroundColor: COLORS.danger,
    color: COLORS.white,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    alignSelf: "flex-start",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
};

const FavoritesPage = () => {
  const { isSignedIn, userId } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, userId]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_URL}/favorites/${userId}`);
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    if (!window.confirm("Remove this recipe from favorites?")) return;
    
    try {
      await fetch(`${API_URL}/favorites/${userId}/${recipeId}`, {
        method: "DELETE",
      });
      setFavorites(favorites.filter((fav) => fav.recipeId !== recipeId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleRecipeClick = (recipeId) => {
    window.location.href = `/recipe/${recipeId}`;
  };

  if (!isSignedIn) {
    return (
      <div style={favoritesStyles.container}>
        <header style={favoritesStyles.header}>
          <Link to="/" style={favoritesStyles.backButton}>← Back</Link>
          <h1 style={favoritesStyles.headerTitle}>Favorites</h1>
          <div style={{ width: "60px" }}></div>
        </header>
        <div style={favoritesStyles.emptyContainer}>
          <div style={favoritesStyles.emptyIcon}>❤️</div>
          <h3 style={favoritesStyles.emptyTitle}>Sign In to View Favorites</h3>
          <p style={favoritesStyles.emptyText}>
            Save your favorite recipes and access them from any device
          </p>
          <Link to="/sign-in" style={favoritesStyles.signInButton}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={favoritesStyles.container}>
        <header style={favoritesStyles.header}>
          <Link to="/" style={favoritesStyles.backButton}>← Back</Link>
          <h1 style={favoritesStyles.headerTitle}>Favorites</h1>
          <div style={{ width: "60px" }}></div>
        </header>
        <div style={favoritesStyles.loadingContainer}>
          <p>Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={favoritesStyles.container}>
      {/* Header */}
      <header style={favoritesStyles.header}>
        <Link to="/" style={favoritesStyles.backButton}>← Back</Link>
        <h1 style={favoritesStyles.headerTitle}>My Favorites</h1>
        <div style={{ width: "60px" }}></div>
      </header>

      {/* Content */}
      <div style={favoritesStyles.content}>
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div
              key={favorite.id}
              style={favoritesStyles.recipeCard}
              onClick={() => handleRecipeClick(favorite.recipeId)}
            >
              <img
                src={favorite.image || "https://via.placeholder.com/120x120"}
                alt={favorite.title}
                style={favoritesStyles.recipeImage}
              />
              <div style={favoritesStyles.recipeInfo}>
                <div>
                  <h3 style={favoritesStyles.recipeTitle}>{favorite.title}</h3>
                  <div style={favoritesStyles.recipeMeta}>
                    <span>⏱️ {favorite.cookTime || "N/A"}</span>
                    <span>👥 {favorite.servings || "N/A"}</span>
                  </div>
                </div>
                <button
                  style={favoritesStyles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.recipeId);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={favoritesStyles.emptyContainer}>
            <div style={favoritesStyles.emptyIcon}>❤️</div>
            <h3 style={favoritesStyles.emptyTitle}>No Favorites Yet</h3>
            <p style={favoritesStyles.emptyText}>
              Start saving recipes you love by clicking the heart icon
            </p>
            <Link to="/" style={favoritesStyles.signInButton}>
              Browse Recipes
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        backgroundColor: COLORS.primary,
        color: COLORS.white,
        marginTop: '40px'
      }}>
        <p>© 2024 Recipe App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FavoritesPage;
