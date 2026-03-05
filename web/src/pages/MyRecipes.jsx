import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { RecipeAPI } from "../services/api";

const CATEGORIES = [
  "Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drinks", "Salad", "Soup", "Side Dish"
];

const CUISINES = [
  "Cameroonian", "Nigerian", "Ghanaian", "Kenyan", "Ethiopian", "Egyptian", 
  "Moroccan", "Tunisian", "South African", "French", "Italian", "American", "Other"
];

const myRecipesStyles = {
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
  tabContainer: {
    display: "flex",
    backgroundColor: COLORS.white,
    padding: "8px",
    margin: "16px",
    borderRadius: "12px",
    gap: "8px",
  },
  tabButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  tabButtonInactive: {
    backgroundColor: "transparent",
    color: COLORS.text,
  },
  content: {
    padding: "16px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    marginBottom: "16px",
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  recipeImage: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "120px",
    height: "120px",
    backgroundColor: COLORS.border,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
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
    flexWrap: "wrap",
    gap: "8px",
  },
  metaBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: COLORS.background,
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    color: COLORS.text,
  },
  visibilityBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "8px",
    fontSize: "11px",
  },
  actionButtons: {
    display: "flex",
    borderTop: `1px solid ${COLORS.border}`,
  },
  editButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  deleteButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: COLORS.danger,
    color: COLORS.white,
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 40px",
  },
  emptyTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: "16px",
  },
  emptySubtitle: {
    fontSize: "14px",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: "8px",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: "14px 24px",
    borderRadius: "12px",
    marginTop: "24px",
    gap: "8px",
    color: COLORS.white,
    fontWeight: "600",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
  },
  formContainer: {
    padding: "16px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    color: COLORS.text,
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    boxSizing: "border-box",
  },
  textArea: {
    minHeight: "80px",
    resize: "vertical",
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "12px",
  },
  removeImageBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: COLORS.white,
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
  },
  imagePickerContainer: {
    display: "flex",
    gap: "10px",
  },
  imagePickerBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    alignItems: "center",
    border: `1px dashed ${COLORS.border}`,
    cursor: "pointer",
  },
  imagePickerText: {
    marginTop: "8px",
    fontSize: "14px",
    color: COLORS.primary,
    fontWeight: "600",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  chip: {
    padding: "8px 16px",
    borderRadius: "20px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    fontSize: "14px",
    color: COLORS.text,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.white,
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  toggleInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  toggleLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: COLORS.text,
  },
  toggleSubtext: {
    fontSize: "12px",
    color: COLORS.textLight,
  },
  toggle: {
    width: "50px",
    height: "28px",
    borderRadius: "14px",
    backgroundColor: COLORS.border,
    position: "relative",
    cursor: "pointer",
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleKnob: {
    width: "24px",
    height: "24px",
    borderRadius: "12px",
    backgroundColor: COLORS.white,
    position: "absolute",
    top: "2px",
    left: "2px",
    transition: "left 0.2s",
  },
  toggleKnobActive: {
    left: "24px",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: COLORS.primary,
    padding: "18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    color: COLORS.white,
    fontWeight: "600",
    fontSize: "16px",
    width: "100%",
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
};

const MyRecipesPage = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("myRecipes");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add recipe form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [localImageUri, setLocalImageUri] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        fetchMyRecipes();
      } else {
        navigate("/sign-in");
      }
    }
  }, [isLoaded, userId]);

  const fetchMyRecipes = async () => {
    try {
      if (!userId) return;
      const data = await RecipeAPI.getUserRecipes(userId);
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (recipeId) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      RecipeAPI.deleteRecipe(recipeId, userId)
        .then(() => {
          setRecipes(recipes.filter(r => r.id !== recipeId));
          alert("Recipe deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting recipe:", error);
          alert("Failed to delete recipe");
        });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a recipe title");
      return;
    }
    if (!ingredients.trim()) {
      alert("Please add at least one ingredient");
      return;
    }
    if (!instructions.trim()) {
      alert("Please add cooking instructions");
      return;
    }

    setSaving(true);
    try {
      const ingredientList = ingredients.split("\n").map(i => i.trim()).filter(i => i.length > 0);
      const instructionList = instructions.split("\n").map(i => i.trim()).filter(i => i.length > 0);

      const recipeData = {
        userId,
        title: title.trim(),
        description: description.trim(),
        image: image || null,
        cookTime: cookTime.trim() || null,
        servings: servings ? parseInt(servings) : null,
        category: category || null,
        area: area || null,
        ingredients: ingredientList,
        instructions: instructionList,
        isPublic,
      };

      await RecipeAPI.createRecipe(recipeData);
      alert("Recipe created successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setImage("");
      setLocalImageUri("");
      setCookTime("");
      setServings("");
      setCategory("");
      setArea("");
      setIngredients("");
      setInstructions("");
      setIsPublic(true);
      
      // Switch to recipes tab and refresh
      setActiveTab("myRecipes");
      fetchMyRecipes();
    } catch (error) {
      alert(error.message || "Failed to create recipe");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImageUri(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div style={myRecipesStyles.container}>
        <div style={myRecipesStyles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={myRecipesStyles.container}>
      {/* Header */}
      <header style={myRecipesStyles.header}>
        <Link to="/" style={myRecipesStyles.backButton}>← Back</Link>
        <h1 style={myRecipesStyles.headerTitle}>My Recipes</h1>
        <div style={{ width: "60px" }}></div>
      </header>

      {/* Tab Buttons */}
      <div style={myRecipesStyles.tabContainer}>
        <button
          style={{
            ...myRecipesStyles.tabButton,
            ...(activeTab === "myRecipes" ? myRecipesStyles.tabButtonActive : myRecipesStyles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("myRecipes")}
        >
          📖 My Recipes
        </button>
        <button
          style={{
            ...myRecipesStyles.tabButton,
            ...(activeTab === "addRecipe" ? myRecipesStyles.tabButtonActive : myRecipesStyles.tabButtonInactive),
          }}
          onClick={() => setActiveTab("addRecipe")}
        >
          ➕ Add Recipe
        </button>
      </div>

      {activeTab === "myRecipes" ? (
        <div style={myRecipesStyles.content}>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div key={recipe.id} style={myRecipesStyles.recipeCard}>
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.title} style={myRecipesStyles.recipeImage} />
                ) : (
                  <div style={myRecipesStyles.imagePlaceholder}>🍽️</div>
                )}
                
                <div style={myRecipesStyles.recipeInfo}>
                  <div>
                    <h3 style={myRecipesStyles.recipeTitle}>{recipe.title}</h3>
                    <p style={myRecipesStyles.recipeDescription}>
                      {recipe.description || "No description"}
                    </p>
                    
                    <div style={myRecipesStyles.recipeMeta}>
                      {recipe.category && (
                        <span style={myRecipesStyles.metaBadge}>
                          🏷️ {recipe.category}
                        </span>
                      )}
                      {recipe.cookTime && (
                        <span style={myRecipesStyles.metaBadge}>
                          ⏱️ {recipe.cookTime}
                        </span>
                      )}
                    </div>

                    <div style={myRecipesStyles.visibilityBadge}>
                      {recipe.isPublic ? "🌍 Public" : "🔒 Private"}
                    </div>
                  </div>
                </div>

                <div style={myRecipesStyles.actionButtons}>
                  <button 
                    style={myRecipesStyles.editButton}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    style={myRecipesStyles.deleteButton}
                    onClick={() => handleDelete(recipe.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={myRecipesStyles.emptyContainer}>
              <span style={{ fontSize: "80px" }}>📖</span>
              <h3 style={myRecipesStyles.emptyTitle}>No Recipes Yet</h3>
              <p style={myRecipesStyles.emptySubtitle}>Create your first recipe!</p>
              <button style={myRecipesStyles.addButton} onClick={() => setActiveTab("addRecipe")}>
                ➕ Add Recipe
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={myRecipesStyles.formContainer}>
          {/* Image Picker */}
          <div style={myRecipesStyles.inputGroup}>
            <label style={myRecipesStyles.label}>Recipe Image (optional)</label>
            {localImageUri ? (
              <div style={myRecipesStyles.imagePreviewContainer}>
                <img src={localImageUri} alt="Preview" style={myRecipesStyles.imagePreview} />
                <button 
                  style={myRecipesStyles.removeImageBtn}
                  onClick={() => { setImage(""); setLocalImageUri(""); }}
                >
                  ❌
                </button>
              </div>
            ) : (
              <div style={myRecipesStyles.imagePickerContainer}>
                <label style={myRecipesStyles.imagePickerBtn}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: "40px" }}>🖼️</span>
                  <span style={myRecipesStyles.imagePickerText}>Upload Image</span>
                </label>
              </div>
            )}
          </div>

          {/* Title */}
          <div style={myRecipesStyles.inputGroup}>
            <label style={myRecipesStyles.label}>Recipe Title *</label>
            <input 
              style={myRecipesStyles.input}
              placeholder="Enter recipe name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div style={myRecipesStyles.inputGroup}>
            <label style={myRecipesStyles.label}>Description</label>
            <textarea 
              style={{...myRecipesStyles.input, ...myRecipesStyles.textArea}}
              placeholder="Describe your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div style={myRecipesStyles.inputGroup}>
            <label style={myRecipesStyles.label}>Category</label>
            <div style={myRecipesStyles.chipContainer}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  style={{
                    ...myRecipesStyles.chip,
                    ...(category === cat ? myRecipesStyles.chipActive : {}),
                  }}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div style={myRecipesStyles.inputGroup}>
            <label style={myRecipesStyles.label}>Cuisine</label>
            <div style={myRecipesStyles.chipContainer}>
              {CUISINES.map((cuisine) => (
                <button
                  key={cuisine}
                  style={{
                    ...myRecipesStyles.chip,
                    ...(area === cuisine ? myRecipesStyles.chipActive : {}),
                  }}
                  onClick={() => setArea(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Cook Time & Servings */}
          <div style={myRecipesStyles.row}>
            <div style={{ ...myRecipesStyles.inputGroup, flex: 1 }}>
              <label style={myRecipesStyles.label}>Cook Time</label>
              <input 
                style={myRecipesStyles.input}
                placeholder="e.g., 30 min"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>
            <div style={{ ...myRecipesStyles.inputGroup, flex: 1 }}>
              <label style={myRecipesStyles.label}>Servings</label>
              <input 
                style={myRecipesStyles.input}
                placeholder="e.g., 4"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                type="number"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div style={myRecipesStyles.inputGroup}>
            <label style={myRecipesStyles.label}>Ingredients * (one per line)</label>
            <textarea 
              style={{...myRecipesStyles.input, ...myRecipesStyles.textArea}}
              placeholder="1 cup flour&#10;2 eggs"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>

          {/* Instructions */}
          <div style={myRecipesStyles.inputGroup}>
            <label style={myRecipesStyles.label}>Instructions * (one step per line)</label>
            <textarea 
              style={{...myRecipesStyles.input, ...myRecipesStyles.textArea}}
              placeholder="Preheat oven..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          {/* Public Toggle */}
          <div style={myRecipesStyles.toggleRow}>
            <div style={myRecipesStyles.toggleInfo}>
              <span style={{ fontSize: "22px" }}>{isPublic ? "🌍" : "🔒"}</span>
              <div>
                <p style={myRecipesStyles.toggleLabel}>Make Public</p>
                <p style={myRecipesStyles.toggleSubtext}>
                  {isPublic ? "Anyone can see" : "Only you can see"}
                </p>
              </div>
            </div>
            <div 
              style={{
                ...myRecipesStyles.toggle,
                ...(isPublic ? myRecipesStyles.toggleActive : {}),
              }}
              onClick={() => setIsPublic(!isPublic)}
            >
              <div style={{
                ...myRecipesStyles.toggleKnob,
                ...(isPublic ? myRecipesStyles.toggleKnobActive : {}),
              }} />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            style={{
              ...myRecipesStyles.submitButton,
              ...(saving ? myRecipesStyles.submitButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "🍽️ Create Recipe"}
          </button>

          <div style={{ height: "40px" }}></div>
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage;
