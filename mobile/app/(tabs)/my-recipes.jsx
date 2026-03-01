import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { RecipeAPI } from "../../services/api";
import { uploadImageToCloudinary } from "../../services/cloudinary";
import { COLORS } from "../../constants/colors";

const CATEGORIES = [
  "Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drinks", "Salad", "Soup", "Side Dish"
];

const CUISINES = [
  "Cameroonian", "Nigerian", "Ghanaian", "Kenyan", "Ethiopian", "Egyptian", 
  "Moroccan", "Tunisian", "South African", "French", "Italian", "American", "Other"
];

const MyRecipesScreen = () => {
  const { userId } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("myRecipes"); // "myRecipes" or "addRecipe"
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchMyRecipes = async () => {
    try {
      if (!userId) return;
      const data = await RecipeAPI.getUserRecipes(userId);
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyRecipes();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRecipes();
  };

  // Image picker functions
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
        setLocalImageUri(result.assets[0].uri);
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

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
        setLocalImageUri(result.assets[0].uri);
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
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
      let imageUrl = null;
      if (localImageUri) {
        setUploadingImage(true);
        const uploadResult = await uploadImageToCloudinary(localImageUri);
        setUploadingImage(false);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          Alert.alert("Warning", "Image upload failed. Recipe will be saved without image.");
        }
      }

      const ingredientList = ingredients.split("\n").map(i => i.trim()).filter(i => i.length > 0);
      const instructionList = instructions.split("\n").map(i => i.trim()).filter(i => i.length > 0);

      const recipeData = {
        userId,
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

      await RecipeAPI.createRecipe(recipeData);
      Alert.alert("Success", "Recipe created successfully!", [
        { text: "OK", onPress: () => {
          // Reset form and switch to recipes tab
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
          setActiveTab("myRecipes");
          fetchMyRecipes();
        }}
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create recipe");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (recipeId) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await RecipeAPI.deleteRecipe(recipeId, userId);
              setRecipes(recipes.filter(r => r.id !== recipeId));
              Alert.alert("Success", "Recipe deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete recipe");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (recipeId) => {
    router.push(`/recipe/edit/${recipeId}`);
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.recipeCard}>
      <TouchableOpacity 
        style={styles.recipeContent}
        onPress={() => router.push(`/recipe/${item.id}`)}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant" size={40} color={COLORS.textLight} />
          </View>
        )}
        
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description || "No description"}
          </Text>
          
          <View style={styles.recipeMeta}>
            {item.category && (
              <View style={styles.metaBadge}>
                <Ionicons name="pricetag" size={12} color={COLORS.primary} />
                <Text style={styles.metaText}>{item.category}</Text>
              </View>
            )}
            {item.cookTime && (
              <View style={styles.metaBadge}>
                <Ionicons name="time" size={12} color={COLORS.primary} />
                <Text style={styles.metaText}>{item.cookTime}</Text>
              </View>
            )}
          </View>

          <View style={styles.visibilityBadge}>
            <Ionicons 
              name={item.isPublic ? "public" : "lock-closed"} 
              size={12} 
              color={item.isPublic ? COLORS.success : COLORS.textLight} 
            />
            <Text style={[styles.visibilityText, { color: item.isPublic ? COLORS.success : COLORS.textLight }]}>
              {item.isPublic ? "Public" : "Private"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item.id)}>
          <Ionicons name="pencil" size={18} color={COLORS.white} />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={18} color={COLORS.white} />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No Recipes Yet</Text>
      <Text style={styles.emptySubtitle}>Create your first recipe!</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => setActiveTab("addRecipe")}>
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add Recipe</Text>
      </TouchableOpacity>
    </View>
  );

  // Add Recipe Form
  const renderAddRecipeForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Image Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recipe Image (optional)</Text>
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImage(""); setLocalImageUri(""); }}>
              <Ionicons name="close-circle" size={28} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Ionicons name="images-outline" size={40} color={COLORS.primary} />
              <Text style={styles.imagePickerText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
              <Text style={styles.imagePickerText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recipe Title *</Text>
        <TextInput style={styles.input} placeholder="Enter recipe name" placeholderTextColor={COLORS.textLight} value={title} onChangeText={setTitle} />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your recipe..." placeholderTextColor={COLORS.textLight} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cuisine */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cuisine</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {CUISINES.map((cuisine) => (
            <TouchableOpacity key={cuisine} style={[styles.chip, area === cuisine && styles.chipActive]} onPress={() => setArea(cuisine)}>
              <Text style={[styles.chipText, area === cuisine && styles.chipTextActive]}>{cuisine}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cook Time & Servings */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Cook Time</Text>
          <TextInput style={styles.input} placeholder="e.g., 30 min" placeholderTextColor={COLORS.textLight} value={cookTime} onChangeText={setCookTime} />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Servings</Text>
          <TextInput style={styles.input} placeholder="e.g., 4" placeholderTextColor={COLORS.textLight} value={servings} onChangeText={setServings} keyboardType="numeric" />
        </View>
      </View>

      {/* Ingredients */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ingredients * (one per line)</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="1 cup flour&#10;2 eggs" placeholderTextColor={COLORS.textLight} value={ingredients} onChangeText={setIngredients} multiline numberOfLines={6} />
      </View>

      {/* Instructions */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instructions * (one step per line)</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Preheat oven..." placeholderTextColor={COLORS.textLight} value={instructions} onChangeText={setInstructions} multiline numberOfLines={6} />
      </View>

      {/* Public Toggle */}
      <TouchableOpacity style={styles.toggleRow} onPress={() => setIsPublic(!isPublic)}>
        <View style={styles.toggleInfo}>
          <Ionicons name={isPublic ? "public" : "lock-closed"} size={22} color={COLORS.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.toggleLabel}>Make Public</Text>
            <Text style={styles.toggleSubtext}>{isPublic ? "Anyone can see" : "Only you can see"}</Text>
          </View>
        </View>
        <View style={[styles.toggle, isPublic && styles.toggleActive]}>
          <View style={[styles.toggleKnob, isPublic && styles.toggleKnobActive]} />
        </View>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={[styles.submitButton, (saving || uploadingImage) && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={saving || uploadingImage}>
        {saving || uploadingImage ? <ActivityIndicator color={COLORS.white} /> : <><Ionicons name="restaurant" size={20} color={COLORS.white} /><Text style={styles.submitButtonText}>Create Recipe</Text></>}
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Recipes</Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === "myRecipes" && styles.tabButtonActive]} onPress={() => setActiveTab("myRecipes")}>
          <Ionicons name="book" size={20} color={activeTab === "myRecipes" ? COLORS.white : COLORS.text} />
          <Text style={[styles.tabText, activeTab === "myRecipes" && styles.tabTextActive]}>My Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === "addRecipe" && styles.tabButtonActive]} onPress={() => setActiveTab("addRecipe")}>
          <Ionicons name="add-circle" size={20} color={activeTab === "addRecipe" ? COLORS.white : COLORS.text} />
          <Text style={[styles.tabText, activeTab === "addRecipe" && styles.tabTextActive]}>Add Recipe</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "myRecipes" ? (
        loading ? (
          <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          />
        )
      ) : (
        renderAddRecipeForm()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.white },
  tabContainer: { flexDirection: "row", backgroundColor: COLORS.white, padding: 8, marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  tabButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 8, gap: 8 },
  tabButtonActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  tabTextActive: { color: COLORS.white },
  listContent: { padding: 16, flexGrow: 1 },
  recipeCard: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  recipeContent: { flexDirection: "row" },
  recipeImage: { width: 120, height: 120 },
  imagePlaceholder: { width: 120, height: 120, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" },
  recipeInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  recipeTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  recipeDescription: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  recipeMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  metaBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  metaText: { fontSize: 11, color: COLORS.text },
  visibilityBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  visibilityText: { fontSize: 11 },
  actionButtons: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.border },
  editButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, backgroundColor: COLORS.primary, gap: 6 },
  deleteButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, backgroundColor: COLORS.danger, gap: 6 },
  buttonText: { color: COLORS.white, fontWeight: "600", fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: COLORS.textLight },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingTop: 60 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: "center", marginTop: 8 },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 24, gap: 8 },
  addButtonText: { color: COLORS.white, fontWeight: "600", fontSize: 16 },
  formContainer: { flex: 1, padding: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, padding: 15, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  imagePreviewContainer: { position: "relative" },
  imagePreview: { width: "100%", height: 180, borderRadius: 12 },
  removeImageBtn: { position: "absolute", top: 8, right: 8, backgroundColor: COLORS.white, borderRadius: 14 },
  imagePickerContainer: { flexDirection: "row", gap: 10 },
  imagePickerBtn: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 20, alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderStyle: "dashed" },
  imagePickerText: { marginTop: 8, fontSize: 14, color: COLORS.primary, fontWeight: "600" },
  chipContainer: { flexDirection: "row" },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextActive: { color: COLORS.white },
  row: { flexDirection: "row" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginBottom: 16 },
  toggleInfo: { flexDirection: "row", alignItems: "center" },
  toggleLabel: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  toggleSubtext: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  toggle: { width: 50, height: 30, borderRadius: 15, backgroundColor: COLORS.border, padding: 2 },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleKnob: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.white },
  toggleKnobActive: { marginLeft: 20 },
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, gap: 10 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: "bold", color: COLORS.white },
  bottomPadding: { height: 40 },
});

export default MyRecipesScreen;
