import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { RecipeAPI } from "../../services/api";
import { COLORS } from "../../constants/colors";

const CATEGORIES = [
  "Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drinks", "Salad", "Soup", "Side Dish"
];

const CUISINES = [
  "Cameroonian", "Nigerian", "Ghanaian", "Kenyan", "Ethiopian", "Egyptian", 
  "Moroccan", "Tunisian", "South African", "French", "Italian", "American", "Other"
];

const AddRecipeScreen = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a recipe title");
      return false;
    }
    if (!ingredients.trim()) {
      Alert.alert("Error", "Please add at least one ingredient");
      return false;
    }
    if (!instructions.trim()) {
      Alert.alert("Error", "Please add cooking instructions");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Parse ingredients (one per line)
      const ingredientList = ingredients
        .split("\n")
        .map(i => i.trim())
        .filter(i => i.length > 0);

      // Parse instructions (one per line)
      const instructionList = instructions
        .split("\n")
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const recipeData = {
        userId,
        title: title.trim(),
        description: description.trim(),
        image: image.trim() || null,
        cookTime: cookTime.trim() || null,
        servings: servings ? parseInt(servings) : null,
        category: category || null,
        area: area || null,
        ingredients: ingredientList,
        instructions: instructionList,
        isPublic,
      };

      await RecipeAPI.createRecipe(recipeData);

      Alert.alert("Success", "Recipe created successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Recipe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image URL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipe Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={COLORS.textLight}
            value={image}
            onChangeText={setImage}
          />
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
          ) : null}
        </View>

        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipe Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter recipe name"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your recipe..."
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cuisine/Area */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cuisine</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {CUISINES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[styles.chip, area === cuisine && styles.chipActive]}
                onPress={() => setArea(cuisine)}
              >
                <Text style={[styles.chipText, area === cuisine && styles.chipTextActive]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cook Time & Servings */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Cook Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30 minutes"
              placeholderTextColor={COLORS.textLight}
              value={cookTime}
              onChangeText={setCookTime}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 4"
              placeholderTextColor={COLORS.textLight}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ingredients * (one per line)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup sugar"
            placeholderTextColor={COLORS.textLight}
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instructions * (one step per line)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients"
            placeholderTextColor={COLORS.textLight}
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Public Toggle */}
        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsPublic(!isPublic)}>
          <View style={styles.toggleInfo}>
            <Ionicons name={isPublic ? "public" : "lock-closed"} size={22} color={COLORS.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.toggleLabel}>Make Public</Text>
              <Text style={styles.toggleSubtext}>
                {isPublic ? "Anyone can see this recipe" : "Only you can see this recipe"}
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, isPublic && styles.toggleActive]}>
            <View style={[styles.toggleKnob, isPublic && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Ionicons name="restaurant" size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>
            {loading ? "Creating..." : "Create Recipe"}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  row: {
    flexDirection: "row",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  toggleSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
  },
  toggleKnobActive: {
    marginLeft: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  bottomPadding: {
    height: 40,
  },
};

export default AddRecipeScreen;
