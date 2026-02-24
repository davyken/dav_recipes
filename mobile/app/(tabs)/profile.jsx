import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { authStyles } from "../../assets/styles/auth.styles";

const ProfileScreen = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/(auth)/sign-in");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <View style={authStyles.container}>
      <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity style={profileStyles.editButton}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={profileStyles.name}>{user?.fullName || "User"}</Text>
          <Text style={profileStyles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>

        {/* Menu Items */}
        <View style={profileStyles.menuSection}>
          <Text style={profileStyles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="location-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Delivery Addresses</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="receipt-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Order History</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.menuItem}>
            <Ionicons name="wallet-outline" size={22} color={COLORS.primary} />
            <Text style={profileStyles.menuText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

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

          <TouchableOpacity style={profileStyles.menuItem}>
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
    position: "relative",
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
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
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
