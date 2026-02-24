import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, Linking, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../../constants/colors";

const RestaurantDetailScreen = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const restaurant = data ? JSON.parse(data) : null;
  
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const addToCart = (item) => {
    const existingItem = cart.find((i) => i.id === item.id);
    if (existingItem) {
      setCart(cart.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    Alert.alert("Added to Cart", `${item.name} added to your order`);
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find((i) => i.id === itemId);
    if (existingItem.quantity > 1) {
      setCart(cart.map((i) => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
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
    }
  };

  const handleContactDelivery = () => {
    if (restaurant.phone) {
      const message = encodeURIComponent(`Hello! I would like to place an order from ${restaurant.name}. \n\nMy order:\n${cart.map(item => `- ${item.name} x${item.quantity} = ${item.price * item.quantity} CFA`).join('\n')}\n\nTotal: ${getCartTotal()} CFA\n\nPlease confirm delivery time.`);
      Linking.openURL(`whatsapp:${restaurant.phone.replace(/\D/g, '')}?text=${message}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{restaurant.rating}</Text>
            </View>
            <Text style={styles.distance}>{restaurant.distance}</Text>
            <Text style={styles.priceLevel}>{restaurant.priceLevel}</Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color={COLORS.textLight} />
            <Text style={styles.address}>{restaurant.address}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCallRestaurant}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowCart(true)}>
            <Ionicons name="cart" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Section */}
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

        {/* Delivery Info */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryInfo}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.deliveryText}>Estimated delivery time: 30-45 minutes</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Ionicons name="bicycle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.deliveryText}>Delivery available to your location</Text>
          </View>
        </View>

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
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => removeFromCart(item.id)}
                        >
                          <Ionicons name="remove" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => addToCart(item)}
                        >
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

                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={handleContactDelivery}
                >
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  infoSection: {
    padding: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
  },
  cuisine: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 15,
  },
  priceLevel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  address: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  menuSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  menuItemDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 6,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  deliverySection: {
    padding: 20,
    paddingTop: 0,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  deliveryText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  bottomPadding: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  cartModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "80%",
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cartTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  emptyCart: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 10,
  },
  cartItems: {
    maxHeight: 300,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  cartItemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
};

export default RestaurantDetailScreen;
