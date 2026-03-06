import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { RecipeAPI } from "../services/api";

const CATEGORIES = [
  "Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drinks", "Salad", "Soup", "Side Dish"
];

const CUISINES = [
  "Cameroonian", "Nigerian", "Ghanaian", "Kenyan", "Ethiopian", "Egyptian", 
  "Moroccan", "Tunisian", "South African", "French", "Italian", "American", "Other"
];

const editRecipeStyles = {
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
    maxWidth: "600px",
    margin: "0 auto",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.text,
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  imageUpload: {
    border: `2px dashed ${COLORS.border}`,
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: COLORS.white,
  },
  imagePreview: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px",
    marginTop: "10px",
  },
  imagePlaceholder: {
    fontSize: "40px",
    marginBottom: "10px",
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
    gap: "15px",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
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
    width: "100%",
    padding: "16px",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  error: {
    color: COLORS.danger,
    fontSize: "14px",
    marginTop: "5px",
  },
};

const EditRecipePage = () => {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [localImageUri, setLocalImageUri] = useState("");
  const [originalImage, setOriginalImage] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const recipe = await RecipeAPI.getRecipe(id);
      if (recipe) {
        setTitle(recipe.title || "");
        setDescription(recipe.description || "");
        setImage(recipe.image || "");
        setOriginalImage(recipe.image || "");
        setCookTime(recipe.cookTime || "");
        setServings(recipe.servings?.toString() || "");
        setCategory(recipe.category || "");
        setArea(recipe.area || "");
        setIngredients(recipe.ingredients?.join("\n") || "");
        setInstructions(recipe.instructions?.join("\n") || "");
        setIsPublic(recipe.isPublic !== false);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
      alert("Failed to load recipe");
      navigate("/my-recipes");
    } finally {
      setLoading(false);
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

  const removeImage = () => {
    setImage("");
    setLocalImageUri("");
    setOriginalImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!ingredients.trim()) {
      setError("At least one ingredient is required");
      return;
    }

    if (!instructions.trim()) {
      setError("At least one instruction is required");
      return;
    }

    setSaving(true);

    try {
      const ingredientList = ingredients
        .split("\n")
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const instructionList = instructions
        .split("\n")
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        image: image || null,
        cookTime: cookTime.trim() || null,
        servings: parseInt(servings) || null,
        category: category || null,
        area: area || null,
        ingredients: ingredientList,
        instructions: instructionList,
        isPublic,
      };

      await RecipeAPI.updateRecipe(id, recipeData, userId);
      
      alert("Recipe updated successfully!");
      navigate("/my-recipes");
    } catch (err) {
      setError(err.message || "Failed to update recipe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={editRecipeStyles.container}>
        <div style={editRecipeStyles.loadingContainer}>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={editRecipeStyles.container}>
      {/* Header */}
      <header style={editRecipeStyles.header}>
        <Link to="/my-recipes" style={editRecipeStyles.backButton}>← Back</Link>
        <h1 style={editRecipeStyles.headerTitle}>Edit Recipe</h1>
        <div style={{ width: "50px" }}></div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} style={editRecipeStyles.content}>
        {/* Image Upload */}
        <div style={editRecipeStyles.formGroup}>
          <label style={editRecipeStyles.label}>Recipe Image</label>
          {image ? (
            <div style={{ position: "relative" }}>
              <img src={image} alt="Recipe" style={editRecipeStyles.imagePreview} />
              <button
                type="button"
                onClick={removeImage}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  backgroundColor: COLORS.white,
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontSize: "20px",
                  padding: "5px",
                }}
              >
                ❌
              </button>
            </div>
          ) : (
            <div style={editRecipeStyles.imageUpload}>
              <div style={editRecipeStyles.imagePlaceholder}>📷</div>
              <p>Click to upload an image</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="image-upload"
              />
              <label htmlFor="image-upload" style={{ 
                display: "inline-block", 
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                borderRadius: "8px",
                cursor: "pointer",
              }}>
                Choose Image
              </label>
            </div>
          )}
        </div>

        {/* Title */}
        <div style={editRecipeStyles.formGroup}>
          <label style={editRecipeStyles.label}>Recipe Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            style={editRecipeStyles.input}
          />
        </div>

        {/* Description */}
        <div style={editRecipeStyles.formGroup}>
          <label style={editRecipeStyles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter recipe description"
            style={editRecipeStyles.textarea}
          />
        </div>

        {/* Category and Area */}
        <div style={editRecipeStyles.formGroup}>
          <label style={editRecipeStyles.label}>Category</label>
          <div style={editRecipeStyles.chipContainer}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                style={{
                  ...editRecipeStyles.chip,
                  ...(category === cat ? editRecipeStyles.chipActive : {}),
                }}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={editRecipeStyles.formGroup}>
          <label style={editRecipeStyles.label}>Cuisine</label>
          <div style={editRecipeStyles.chipContainer}>
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                style={{
                  ...editRecipeStyles.chip,
                  ...(area === cuisine ? editRecipeStyles.chipActive : {}),
                }}
                onClick={() => setArea(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Cook Time and Servings */}
        <div style={editRecipeStyles.row}>
          <div style={{ ...editRecipeStyles.formGroup, flex: 1 }}>
            <label style={editRecipeStyles.label}>Cook Time</label>
            <input
              type="text"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="e.g., 30 mins"
              style={editRecipeStyles.input}
            />
          </div>

          <div style={{ ...editRecipeStyles.formGroup, flex: 1 }}>
            <label style={editRecipeStyles.label}>Servings</label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="e.g., 4"
              style={editRecipeStyles.input}
              min="1"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div style={editRecipeStyles.formGroup}>
          <label style={editRecipeStyles.label}>Ingredients * (one per line)</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup sugar"
            style={editRecipeStyles.textarea}
          />
        </div>

        {/* Instructions */}
        <div style={editRecipeStyles.formGroup}>
          <label style={editRecipeStyles.label}>Instructions * (one per line)</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients"
            style={editRecipeStyles.textarea}
          />
        </div>

        {/* Public/Private Toggle */}
        <div style={editRecipeStyles.toggleRow}>
          <div style={editRecipeStyles.toggleInfo}>
            <span style={{ fontSize: "22px" }}>{isPublic ? "🌍" : "🔒"}</span>
            <div>
              <p style={editRecipeStyles.toggleLabel}>Make Public</p>
              <p style={editRecipeStyles.toggleSubtext}>
                {isPublic ? "Anyone can see this recipe" : "Only you can see this recipe"}
              </p>
            </div>
          </div>
          <div 
            style={{
              ...editRecipeStyles.toggle,
              ...(isPublic ? editRecipeStyles.toggleActive : {}),
            }}
            onClick={() => setIsPublic(!isPublic)}
          >
            <div style={{
              ...editRecipeStyles.toggleKnob,
              ...(isPublic ? editRecipeStyles.toggleKnobActive : {}),
            }} />
          </div>
        </div>

        {/* Error Message */}
        {error && <p style={editRecipeStyles.error}>{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            ...editRecipeStyles.submitButton,
            ...(saving ? editRecipeStyles.submitButtonDisabled : {}),
          }}
        >
          {saving ? "Saving..." : "✏️ Update Recipe"}
        </button>
      </form>
    </div>
  );
};

export default EditRecipePage;

