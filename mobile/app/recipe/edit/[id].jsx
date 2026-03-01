import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { RecipeAPI } from "../../../services/api";
import { uploadImageToCloudinary } from "../../../services/cloudinary";
import { COLORS } from "../../../constants/colors";

const CATEGORIES = [
  "Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drinks", "Salad", "Soup", "Side Dish"
];

const CUISINES = [
  "Cameroonian", "Nigerian", "Ghanaian", "Kenyan", "Ethiopian", "Egyptian", 
  "Moroccan", "Tunisian", "South African", "French", "Italian", "American", "Other"
];

const EditRecipeScreen = () => {
  const { id } = useLocalSearchParams();
  const { userId } = useAuth();
  const router = useRouter();

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
  const [uploadingImage, setUploadingImage] = useState(false);

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
      Alert.alert("Error", "Failed to load recipe");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Request permissions and pick image from gallery
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permission.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setLocalImageUri(uri);
        setImage(uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera permission.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setLocalImageUri(uri);
        setImage(uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

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

    setSaving(true);
    try {
      let imageUrl = originalImage; // Keep original by default

      // Upload new image if changed
      if (localImageUri && localImageUri !== originalImage) {
        setUploadingImage(true);
        const uploadResult = await uploadImageToCloudinary(localImageUri);
        setUploadingImage(false);

        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          Alert.alert("Warning", "Image upload failed. Original image will be kept.");
          imageUrl = originalImage;
        }
      }

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
        image: imageUrl,
        cookTime: cookTime.trim() || null,
        servings: servings ? parseInt(servings) : null,
        category: category || null,
        area: area || null,
        ingredients: ingredientList,
        instructions: instructionList,
        isPublic,
      };

      await RecipeAPI.updateRecipe(id, recipeData, userId);

      Alert.alert("Success", "Recipe updated successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update recipe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Recipe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipe Image</Text>
          
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity 
                style={styles.removeImageBtn}
                onPress={() => {
                  setImage("");
                  setLocalImageUri("");
                  setOriginalImage("");
                }}
              >
                <Ionicons name="close-circle" size={28} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="images-outline" size={40} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.imagePickerBtn} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Take a Photo</Text>
              </TouchableOpacity>
            </View>
          )}
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
          style={[styles.submitButton, (saving || uploadingImage) && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={saving || uploadingImage}
        >
          {saving || uploadingImage ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>
                {saving ? "Saving..." : "Update Recipe"}
              </Text>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
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
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
  },
  imagePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  imagePickerBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
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

export default EditRecipeScreen;
