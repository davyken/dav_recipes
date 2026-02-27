import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { RecipeAPI, AddressAPI, OrderAPI } from "../../services/api";

const ProfileScreen = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  
  const [userRecipes, setUserRecipes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    try {
      // Fetch user recipes
      if (user?.id) {
        const recipes = await RecipeAPI.getUserRecipes(user.id);
        setUserRecipes(recipes);
        
        const addressList = await AddressAPI.getAddresses(user.id);
        setAddresses(addressList);
        
        const orderList = await OrderAPI.getUserOrders(user.id);
        setOrders(orderList);
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/(auth)/sign-in");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <View style={profileStyles.container}>
      <ScrollView contentContainerStyle={profileStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={profileStyles.header}>
          <View style={profileStyles.avatarContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={profileStyles.avatar} />
            ) : (
              <View style={profileStyles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={profileStyles.name}>{user?.fullName || "User"}</Text>
          <Text style={profileStyles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
          
          {/* Stats */}
          <View style={profileStyles.statsRow}>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>{userRecipes.length}</Text>
              <Text style={profileStyles.statLabel}>Recipes</Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>{addresses.length}</Text>
              <Text style={profileStyles.statLabel}>Addresses</Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>{orders.length}</Text>
              <Text style={profileStyles.statLabel}>Orders</Text>
            </View>
          </View>
        </View>

        {/* My Recipes */}
        <View style={profileStyles.menuSection}>
          <Text style={profileStyles.sectionTitle}>My Recipes</Text>
          
          <TouchableOpacity 
            style={profileStyles.menuItem}
            onPress={() => router.push("/(tabs)/add-recipe")}
          >
            <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Add New Recipe</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={profileStyles.menuItem}
            onPress={() => router.push("/(tabs)/my-recipes")}
          >
            <Ionicons name="book-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>View My Recipes ({userRecipes.length})</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={profileStyles.menuSection}>
          <Text style={profileStyles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={profileStyles.menuItem}
            onPress={() => router.push("/(tabs)/addresses")}
          >
            <Ionicons name="location-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Delivery Addresses ({addresses.length})</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={profileStyles.menuItem}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Ionicons name="receipt-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Order History ({orders.length})</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="wallet-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={profileStyles.menuSection}>
          <Text style={profileStyles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="language-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Restaurants */}
        <View style={profileStyles.menuSection}>
          <Text style={profileStyles.sectionTitle}>Restaurants</Text>
          
          <TouchableOpacity 
            style={profileStyles.menuItem}
            onPress={() => router.push("/(tabs)/restaurants")}
          >
            <Ionicons name="storefront-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Nearby Restaurants</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={profileStyles.menuItem}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Ionicons name="fast-food-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>My Deliveries</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={profileStyles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
          <Text style={profileStyles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={profileStyles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const profileStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.textLight,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 15,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 15,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  signOutText: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: "600",
    marginLeft: 10,
  },
  version: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
};

export default ProfileScreen;
