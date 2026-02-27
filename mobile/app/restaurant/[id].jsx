import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../../constants/colors";
import { GooglePlacesAPI } from "../../services/api";

const RestaurantDetailScreen = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  
  let initialRestaurant = null;
  try {
    initialRestaurant = data ? JSON.parse(data) : null;
  } catch (e) {
    console.log("Error parsing:", e);
  }
  
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch additional details from Google if it's a Google Place
  useEffect(() => {
    if (restaurant?.placeId && !restaurant.placeId.startsWith("sample") && !restaurant.placeId.startsWith("local_")) {
      fetchRestaurantDetails();
    }
  }, []);

  const fetchRestaurantDetails = async () => {
    if (!restaurant?.placeId) return;
    
    setLoadingDetails(true);
    try {
      const details = await GooglePlacesAPI.getRestaurantDetails(restaurant.placeId);
      if (details) {
        setRestaurant(prev => ({
          ...prev,
          phone: details.phone || prev.phone,
          website: details.website,
          openingHours: details.openingHours,
          openNow: details.openNow,
          image: details.image || prev.image,
        }));
      }
    } catch (error) {
      console.log("Error fetching details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!restaurant) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.textLight} />
        <Text style={styles.errorText}>Restaurant not found</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const addToCart = (item) => {
    const existingItem = cart.find((i) => i.id === item.id);
    if (existingItem) {
      setCart(cart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    Alert.alert("Added to Cart", `${item.name} added to your order`);
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find((i) => i.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map((i) => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setCart(cart.filter((i) => i.id !== itemId));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCallRestaurant = () => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    } else {
      Alert.alert("Phone Not Available", "This restaurant's phone number is not available.");
    }
  };

  const handleContactDelivery = () => {
    if (restaurant.phone) {
      const orderItems = cart.length > 0 
        ? cart.map(item => `- ${item.name} x${item.quantity} = ${item.price * item.quantity} CFA`).join('\n')
        : "I'd like to order for delivery";
      
      const message = encodeURIComponent(
        `Hello! I would like to order from ${restaurant.name}.\n\n${orderItems}\n\nTotal: ${getCartTotal()} CFA\n\nPlease confirm.`
      );
      Linking.openURL(`whatsapp:${restaurant.phone.replace(/\D/g, '')}?text=${message}`);
    } else {
      Alert.alert("Cannot Contact", "Restaurant phone number not available.");
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  };

  const openWebsite = () => {
    if (restaurant.website) {
      Linking.openURL(restaurant.website);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        {restaurant.image ? (
          <Image source={{ uri: restaurant.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="restaurant" size={60} color={COLORS.textLight} />
          </View>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.address}>{restaurant.address}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.rating}>{restaurant.rating?.toFixed(1) || "N/A"}</Text>
              {restaurant.userRatingsTotal > 0 && (
                <Text style={styles.ratingCount}> ({restaurant.userRatingsTotal})</Text>
              )}
            </View>
            
            {restaurant.distance && (
              <View style={styles.distanceBadge}>
                <Ionicons name="location" size={14} color={COLORS.primary} />
                <Text style={styles.distanceText}>{restaurant.distance} km away</Text>
              </View>
            )}
          </View>

          {restaurant.openNow !== undefined && (
            <View style={[styles.statusBadge, restaurant.openNow ? styles.openNow : styles.closed]}>
              <Ionicons name="time" size={14} color={restaurant.openNow ? "#16A34A" : "#DC2626"} />
              <Text style={[styles.statusText, restaurant.openNow ? styles.openNowText : styles.closedText]}>
                {restaurant.openNow ? "Open Now" : "Closed"}
              </Text>
            </View>
          )}

          {loadingDetails && (
            <Text style={styles.loadingText}>Loading details...</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCallRestaurant}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={openInMaps}>
            <Ionicons name="navigate" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>

          {restaurant.website && (
            <TouchableOpacity style={styles.actionButton} onPress={openWebsite}>
              <Ionicons name="globe" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Website</Text>
            </TouchableOpacity>
          )}

          {cart.length > 0 && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowCart(true)}>
              <Ionicons name="cart" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Section */}
        {restaurant.menu && restaurant.menu.length > 0 ? (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Menu</Text>
            {restaurant.menu.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                  <Text style={styles.menuItemPrice}>{item.price} CFA</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                  <Ionicons name="add" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          /* For Google Places - show contact for delivery */
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Order for Delivery</Text>
            <View style={styles.deliveryInfo}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.deliveryText}>
                Contact this restaurant directly to order food for delivery.
              </Text>
            </View>
            
            <TouchableOpacity style={styles.whatsappButton} onPress={handleContactDelivery}>
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
              <Text style={styles.whatsappButtonText}>Contact for Delivery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Opening Hours */}
        {restaurant.openingHours && restaurant.openingHours.length > 0 && (
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            {restaurant.openingHours.map((hours, index) => (
              <Text key={index} style={styles.hoursText}>{hours}</Text>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.cartModal}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Your Order</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={50} color={COLORS.textLight} />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.cartItems}>
                  {cart.map((item) => (
                    <View key={item.id} style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>{item.price * item.quantity} CFA</Text>
                      </View>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity style={styles.quantityButton} onPress={() => removeFromCart(item.id)}>
                          <Ionicons name="remove" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={() => addToCart(item)}>
                          <Ionicons name="add" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.cartTotal}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>{getCartTotal()} CFA</Text>
                </View>

                <TouchableOpacity style={styles.checkoutButton} onPress={handleContactDelivery}>
                  <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
                  <Text style={styles.checkoutText}>Order via WhatsApp</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: COLORS.textLight, marginTop: 15, marginBottom: 20 },
  errorButton: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  errorButtonText: { color: COLORS.white, fontWeight: "600" },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 250 },
  imagePlaceholder: { backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
  backButton: { position: "absolute", top: 50, left: 15, backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 25 },
  content: { flex: 1, marginTop: -20, backgroundColor: COLORS.background, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  infoSection: { padding: 20 },
  name: { fontSize: 26, fontWeight: "bold", color: COLORS.text },
  address: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 12 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 16, fontWeight: "600", marginLeft: 4 },
  ratingCount: { fontSize: 12, color: COLORS.textLight, marginLeft: 2 },
  distanceBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  distanceText: { fontSize: 14, color: COLORS.primary, fontWeight: "600", marginLeft: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, gap: 6, alignSelf: "flex-start" },
  openNow: { backgroundColor: "#DCFCE7" },
  closed: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 14, fontWeight: "600" },
  openNowText: { color: "#16A34A" },
  closedText: { color: "#DC2626" },
  loadingText: { fontSize: 12, color: COLORS.textLight, marginTop: 8 },
  actionButtons: { flexDirection: "row", paddingHorizontal: 20, gap: 10, flexWrap: "wrap" },
  actionButton: { flex: 1, minWidth: 100, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.white, padding: 15, borderRadius: 12, gap: 8 },
  actionText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  menuSection: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.text, marginBottom: 15 },
  menuItem: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginBottom: 10 },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  menuItemDescription: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  menuItemPrice: { fontSize: 15, fontWeight: "bold", color: COLORS.primary, marginTop: 6 },
  addButton: { backgroundColor: COLORS.primary, width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  deliveryInfo: { flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.white, padding: 15, borderRadius: 12, gap: 12 },
  deliveryText: { flex: 1, fontSize: 14, color: COLORS.text },
  whatsappButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#25D366", padding: 16, borderRadius: 12, gap: 10, marginTop: 10 },
  whatsappButtonText: { fontSize: 16, fontWeight: "bold", color: COLORS.white },
  deliverySection: { padding: 20, paddingTop: 0 },
  hoursText: { fontSize: 13, color: COLORS.text, marginBottom: 4 },
  bottomPadding: { height: 30 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  cartModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: "80%" },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cartTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.text },
  emptyCart: { alignItems: "center", paddingVertical: 40 },
  emptyCartText: { fontSize: 16, color: COLORS.textLight, marginTop: 10 },
  cartItems: { maxHeight: 300 },
  cartItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  cartItemPrice: { fontSize: 14, color: COLORS.primary, fontWeight: "600", marginTop: 2 },
  quantityControls: { flexDirection: "row", alignItems: "center" },
  quantityButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" },
  quantity: { fontSize: 16, fontWeight: "600", marginHorizontal: 12 },
  cartTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  totalAmount: { fontSize: 22, fontWeight: "bold", color: COLORS.primary },
  checkoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#25D366", padding: 16, borderRadius: 12, gap: 10, marginBottom: 20 },
  checkoutText: { fontSize: 16, fontWeight: "bold", color: COLORS.white },
};

export default RestaurantDetailScreen;
