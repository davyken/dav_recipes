import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { COLORS } from "../../constants/colors";
import { GooglePlacesAPI } from "../../services/api";

// Calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

const RestaurantsScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      await fetchNearbyRestaurants(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your location");
      setLoading(false);
    }
  };

  const fetchNearbyRestaurants = async (lat, lng) => {
    setLoading(true);
    try {
      // Fetch from Google Places API
      const results = await GooglePlacesAPI.getNearbyRestaurants(lat, lng, 10000, searchQuery || "restaurant");
      
      if (results && results.length > 0) {
        // Calculate distance for each restaurant
        const restaurantsWithDistance = results.map(r => ({
          ...r,
          distance: calculateDistance(lat, lng, r.latitude, r.longitude)
        }));
        setRestaurants(restaurantsWithDistance);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.log("Error fetching restaurants:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      if (searchQuery) {
        const results = await GooglePlacesAPI.searchRestaurants(searchQuery, location.latitude, location.longitude);
        const restaurantsWithDistance = results.map(r => ({
          ...r,
          distance: calculateDistance(location.latitude, location.longitude, r.latitude, r.longitude)
        }));
        setRestaurants(restaurantsWithDistance);
      } else {
        await fetchNearbyRestaurants(location.latitude, location.longitude);
      }
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = async (restaurant) => {
    router.push({
      pathname: "/restaurant/[id]",
      params: { id: restaurant.id, data: JSON.stringify(restaurant) },
    });
  };

  const openInMaps = (restaurant) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  };

  const callRestaurant = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const openFullMap = () => {
    if (location) {
      const url = `https://www.google.com/maps/search/restaurants/@${location.latitude},${location.longitude},14z`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Restaurants</Text>
        <Text style={styles.headerSubtitle}>
          {location 
            ? `${restaurants.length} restaurants near you`
            : "Getting your location..."
          }
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, cuisine..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => { setSearchQuery(""); if(location) fetchNearbyRestaurants(location.latitude, location.longitude); }}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Map/List Toggle */}
      <View style={styles.mapToggleContainer}>
        <TouchableOpacity style={[styles.mapToggleButton, !showMap && styles.mapToggleActive]} onPress={() => setShowMap(false)}>
          <Ionicons name="list" size={18} color={!showMap ? COLORS.white : COLORS.primary} />
          <Text style={[styles.mapToggleText, !showMap && styles.mapToggleTextActive]}>List ({restaurants.length})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.mapToggleButton, showMap && styles.mapToggleActive]} onPress={() => setShowMap(true)}>
          <Ionicons name="map" size={18} color={showMap ? COLORS.white : COLORS.primary} />
          <Text style={[styles.mapToggleText, showMap && styles.mapToggleTextActive]}>Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.refreshButton} onPress={() => getCurrentLocation()}>
          <Ionicons name="locate" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={60} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>View on Google Maps</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              {location ? `${restaurants.length} restaurants near you` : 'Enable location'}
            </Text>
          </View>
          <TouchableOpacity style={styles.openMapButton} onPress={openFullMap}>
            <Ionicons name="open-outline" size={20} color={COLORS.white} />
            <Text style={styles.openMapText}>Open Full Map</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Restaurant List */}
      {!showMap && (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="restaurant" size={40} color={COLORS.primary} />
              <Text style={styles.loadingText}>Finding restaurants near you...</Text>
            </View>
          ) : restaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No restaurants found</Text>
              <Text style={styles.emptySubtext}>Make sure Google Places API is configured</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => getCurrentLocation()}>
                <Text style={styles.retryText}>Refresh Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            restaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.card}
                onPress={() => handleRestaurantPress(restaurant)}
              >
                {restaurant.image ? (
                  <Image source={{ uri: restaurant.image }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <Ionicons name="restaurant" size={40} color={COLORS.textLight} />
                  </View>
                )}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{restaurant.name}</Text>
                  </View>
                  <Text style={styles.address} numberOfLines={1}>{restaurant.address}</Text>
                  
                  <View style={styles.cardMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.rating}>{restaurant.rating?.toFixed(1) || "N/A"}</Text>
                      {restaurant.userRatingsTotal > 0 && (
                        <Text style={styles.ratingCount}>({restaurant.userRatingsTotal})</Text>
                      )}
                    </View>
                    
                    {restaurant.distance && (
                      <View style={styles.distanceBadge}>
                        <Ionicons name="location" size={12} color={COLORS.primary} />
                        <Text style={styles.distanceText}>{restaurant.distance} km</Text>
                      </View>
                    )}
                    
                    {restaurant.openNow !== undefined && (
                      <View style={[styles.statusBadge, restaurant.openNow ? styles.openNow : styles.closed]}>
                        <Text style={[styles.statusText, restaurant.openNow ? styles.openNowText : styles.closedText]}>
                          {restaurant.openNow ? "Open" : "Closed"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionIcon} onPress={() => openInMaps(restaurant)}>
                    <Ionicons name="navigate" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon} onPress={() => callRestaurant(restaurant.phone)}>
                    <Ionicons name="call" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: COLORS.white, opacity: 0.8, marginTop: 5 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, margin: 15, marginBottom: 10, padding: 12, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.text },
  mapToggleContainer: { flexDirection: "row", paddingHorizontal: 15, marginBottom: 10, gap: 10 },
  mapToggleButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.white, padding: 12, borderRadius: 10, gap: 8 },
  mapToggleActive: { backgroundColor: COLORS.primary },
  mapToggleText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  mapToggleTextActive: { color: COLORS.white },
  refreshButton: { backgroundColor: COLORS.white, padding: 12, borderRadius: 10 },
  mapContainer: { height: 300, marginHorizontal: 15, borderRadius: 15, overflow: "hidden", marginBottom: 10 },
  mapPlaceholder: { flex: 1, backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center", padding: 20 },
  mapPlaceholderText: { fontSize: 18, fontWeight: "bold", color: COLORS.text, marginTop: 15 },
  mapPlaceholderSubtext: { fontSize: 14, color: COLORS.textLight, marginTop: 5, textAlign: "center" },
  openMapButton: { position: "absolute", bottom: 10, right: 10, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, gap: 5 },
  openMapText: { color: COLORS.white, fontWeight: "600", fontSize: 12 },
  list: { flex: 1, paddingHorizontal: 15 },
  loadingContainer: { alignItems: "center", paddingTop: 50 },
  loadingText: { fontSize: 16, color: COLORS.textLight, marginTop: 15 },
  emptyContainer: { alignItems: "center", paddingTop: 50 },
  emptyText: { fontSize: 18, fontWeight: "600", color: COLORS.text, marginTop: 15 },
  emptySubtext: { fontSize: 14, color: COLORS.textLight, marginTop: 5 },
  retryButton: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  retryText: { color: COLORS.white, fontWeight: "600" },
  card: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 15, overflow: "hidden" },
  cardImage: { width: "100%", height: 150 },
  cardImagePlaceholder: { backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text, flex: 1, marginRight: 10 },
  address: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  cardMeta: { flexDirection: "row", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginLeft: 4 },
  ratingCount: { fontSize: 12, color: COLORS.textLight, marginLeft: 2 },
  distanceBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  distanceText: { fontSize: 12, color: COLORS.primary, fontWeight: "600", marginLeft: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  openNow: { backgroundColor: "#DCFCE7" },
  closed: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "600" },
  openNowText: { color: "#16A34A" },
  closedText: { color: "#DC2626" },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 15, paddingBottom: 15, gap: 10 },
  actionIcon: { backgroundColor: COLORS.background, padding: 10, borderRadius: 20 },
  bottomPadding: { height: 20 },
};

export default RestaurantsScreen;
