import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { COLORS } from "../../constants/colors";

const RestaurantsScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to find nearby restaurants");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      
      // Fetch restaurants near the user
      fetchNearbyRestaurants(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      setLoading(false);
    }
  };

  const fetchNearbyRestaurants = async (lat, lng) => {
    try {
      // Using a mock API or you can integrate with Google Places API
      // For now, we'll use sample data
      const sampleRestaurants = [
        {
          id: "1",
          name: "Le Grand Hôtel Restaurant",
          cuisine: "French, African",
          rating: 4.5,
          distance: "0.5 km",
          priceLevel: "$$$",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
          address: "Rue de la Paix, Douala",
          phone: "+237 6XX XXX XXX",
          latitude: lat + 0.002,
          longitude: lng + 0.001,
          menu: [
            { id: "m1", name: "Poulet DG", price: 3500, description: "Chicken with fried plantains" },
            { id: "m2", name: "Ndolé", price: 2800, description: "Bitter leaf stew with palm oil" },
            { id: "m3", name: "Eru with Fish", price: 3200, description: "Eru soup with fresh fish" },
            { id: "m4", name: "Kpwem", price: 2500, description: "Corn fufu with vegetable soup" },
          ],
        },
        {
          id: "2",
          name: "Makossa Restaurant",
          cuisine: "African, Cameroon",
          rating: 4.2,
          distance: "1.2 km",
          priceLevel: "$$",
          image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
          address: "Bonanjo, Douala",
          phone: "+237 6XX XXX XXX",
          latitude: lat - 0.003,
          longitude: lng + 0.002,
          menu: [
            { id: "m1", name: "Fufu Corn", price: 1500, description: "Traditional corn fufu" },
            { id: "m2", name: "Yellow Soup", price: 1800, description: "Okra soup with meat" },
            { id: "m3", name: "Grilled Fish", price: 4000, description: "Fresh river fish" },
          ],
        },
        {
          id: "3",
          name: "Pizza Roma",
          cuisine: "Italian, Pizza",
          rating: 4.7,
          distance: "0.8 km",
          priceLevel: "$$",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
          address: "Akwa, Douala",
          phone: "+237 6XX XXX XXX",
          latitude: lat + 0.001,
          longitude: lng - 0.002,
          menu: [
            { id: "m1", name: "Margherita Pizza", price: 3500, description: "Tomato, mozzarella, basil" },
            { id: "m2", name: "Pepperoni Pizza", price: 4200, description: "With pepperoni slices" },
            { id: "m3", name: "Pasta Carbonara", price: 3800, description: "Creamy bacon pasta" },
          ],
        },
        {
          id: "4",
          name: "Savanna Grill",
          cuisine: "Grill, African",
          rating: 4.3,
          distance: "1.5 km",
          priceLevel: "$$",
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
          address: "Bali, Douala",
          phone: "+237 6XX XXX XXX",
          latitude: lat - 0.001,
          longitude: lng - 0.003,
          menu: [
            { id: "m1", name: "Assorted Grill", price: 5500, description: "Mixed grilled meat" },
            { id: "m2", name: "Lamb Skewers", price: 4500, description: "Spiced lamb pieces" },
            { id: "m3", name: "Fried Plantains", price: 1200, description: "Sweet fried plantains" },
          ],
        },
        {
          id: "5",
          name: " Chez Maman",
          cuisine: "Cameroonian",
          rating: 4.6,
          distance: "2.0 km",
          priceLevel: "$",
          image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400",
          address: "New Bell, Douala",
          phone: "+237 6XX XXX XXX",
          latitude: lat + 0.004,
          longitude: lng + 0.003,
          menu: [
            { id: "m1", name: "Rice and Stew", price: 1000, description: "Jollof rice with tomato stew" },
            { id: "m2", name: "Groundnut Soup", price: 1500, description: "Peanut soup with fufu" },
            { id: "m3", name: "Okra Soup", price: 1200, description: "Fresh okra with fish" },
          ],
        },
      ];
      
      setRestaurants(sampleRestaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestaurantPress = (restaurant) => {
    router.push({
      pathname: "/restaurant/[id]",
      params: { id: restaurant.id, data: JSON.stringify(restaurant) },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Restaurants</Text>
        <Text style={styles.headerSubtitle}>
          {location ? `Found ${filteredRestaurants.length} restaurants near you` : "Finding your location..."}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisine..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Restaurant List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Finding restaurants near you...</Text>
          </View>
        ) : filteredRestaurants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No restaurants found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.card}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <Image source={{ uri: restaurant.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{restaurant.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{restaurant.rating}</Text>
                  </View>
                </View>
                <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.infoText}>{restaurant.distance}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="pricetag-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.infoText}>{restaurant.priceLevel}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Order</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  cuisine: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    marginTop: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    alignItems: "center",
  },
  orderButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  bottomPadding: {
    height: 20,
  },
};

export default RestaurantsScreen;
