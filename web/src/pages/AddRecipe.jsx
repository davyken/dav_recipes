import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { RecipeAPI } from "../services/api";

const addRecipeStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  backButton: {
    color: COLORS.white,
    textDecoration: "none",
    fontSize: "16px",
  },
  content: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
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
  ingredientRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  ingredientInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
  },
  removeButton: {
    padding: "12px",
    backgroundColor: COLORS.danger,
    color: COLORS.white,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  addButton: {
    padding: "12px",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
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
  },
  error: {
    color: COLORS.danger,
    fontSize: "14px",
    marginTop: "5px",
  },
  success: {
    color: "#28a745",
    fontSize: "14px",
    marginTop: "5px",
  },
};

const AddRecipePage = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For simplicity, we'll use a placeholder URL
      // In production, you would upload to Cloudinary
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title) {
      setError("Title is required");
      return;
    }

    if (ingredients.filter(i => i.trim()).length === 0) {
      setError("At least one ingredient is required");
      return;
    }

    if (instructions.filter(i => i.trim()).length === 0) {
      setError("At least one instruction is required");
      return;
    }

    setLoading(true);

    try {
      const recipeData = {
        userId,
        title,
        description,
        image,
        cookTime,
        servings: parseInt(servings) || 1,
        category,
        area,
        ingredients: ingredients.filter(i => i.trim()),
        instructions: instructions.filter(i => i.trim()),
        isPublic,
      };

      await RecipeAPI.createRecipe(recipeData);
      
      setSuccess("Recipe created successfully!");
      setTimeout(() => {
        navigate("/my-recipes");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={addRecipeStyles.container}>
      {/* Header */}
      <header style={addRecipeStyles.header}>
        <Link to="/profile" style={addRecipeStyles.backButton}>← Back</Link>
        <h1 style={addRecipeStyles.headerTitle}>Add Recipe</h1>
        <div style={{ width: "50px" }}></div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} style={addRecipeStyles.content}>
        {/* Image Upload */}
        <div style={addRecipeStyles.formGroup}>
          <label style={addRecipeStyles.label}>Recipe Image</label>
          <div style={addRecipeStyles.imageUpload}>
            {image ? (
              <>
                <img src={image} alt="Recipe" style={addRecipeStyles.imagePreview} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ marginTop: "10px" }}
                />
              </>
            ) : (
              <>
                <div style={addRecipeStyles.imagePlaceholder}>📷</div>
                <p>Click to upload an image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
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
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={addRecipeStyles.formGroup}>
          <label style={addRecipeStyles.label}>Recipe Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            style={addRecipeStyles.input}
          />
        </div>

        {/* Description */}
        <div style={addRecipeStyles.formGroup}>
          <label style={addRecipeStyles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter recipe description"
            style={addRecipeStyles.textarea}
          />
        </div>

        {/* Category and Area */}
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ ...addRecipeStyles.formGroup, flex: 1 }}>
            <label style={addRecipeStyles.label}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={addRecipeStyles.input}
            >
              <option value="">Select category</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Drink">Drink</option>
            </select>
          </div>

          <div style={{ ...addRecipeStyles.formGroup, flex: 1 }}>
            <label style={addRecipeStyles.label}>Cuisine</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={addRecipeStyles.input}
            >
              <option value="">Select cuisine</option>
              <option value="American">American</option>
              <option value="British">British</option>
              <option value="Cameroonian">Cameroonian</option>
              <option value="Chinese">Chinese</option>
              <option value="French">French</option>
              <option value="Indian">Indian</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Mexican">Mexican</option>
              <option value="Nigerian">Nigerian</option>
            </select>
          </div>
        </div>

        {/* Cook Time and Servings */}
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ ...addRecipeStyles.formGroup, flex: 1 }}>
            <label style={addRecipeStyles.label}>Cook Time</label>
            <input
              type="text"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="e.g., 30 mins"
              style={addRecipeStyles.input}
            />
          </div>

          <div style={{ ...addRecipeStyles.formGroup, flex: 1 }}>
            <label style={addRecipeStyles.label}>Servings</label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="e.g., 4"
              style={addRecipeStyles.input}
              min="1"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div style={addRecipeStyles.formGroup}>
          <label style={addRecipeStyles.label}>Ingredients *</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} style={addRecipeStyles.ingredientRow}>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                style={addRecipeStyles.ingredientInput}
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  style={addRecipeStyles.removeButton}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            style={addRecipeStyles.addButton}
          >
            + Add Ingredient
          </button>
        </div>

        {/* Instructions */}
        <div style={addRecipeStyles.formGroup}>
          <label style={addRecipeStyles.label}>Instructions *</label>
          {instructions.map((instruction, index) => (
            <div key={index} style={addRecipeStyles.ingredientRow}>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                style={{ ...addRecipeStyles.ingredientInput, minHeight: "60px" }}
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  style={addRecipeStyles.removeButton}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            style={addRecipeStyles.addButton}
          >
            + Add Step
          </button>
        </div>

        {/* Public/Private */}
        <div style={addRecipeStyles.formGroup}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ marginRight: "10px", width: "20px", height: "20px" }}
            />
            <span style={{ fontSize: "14px", color: COLORS.text }}>
              Make this recipe public
            </span>
          </label>
        </div>

        {/* Error/Success Messages */}
        {error && <p style={addRecipeStyles.error}>{error}</p>}
        {success && <p style={addRecipeStyles.success}>{success}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...addRecipeStyles.submitButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating Recipe..." : "Create Recipe"}
        </button>
      </form>
    </div>
  );
};

export default AddRecipePage;
