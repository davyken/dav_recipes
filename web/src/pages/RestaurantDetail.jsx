import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { COLORS } from "../constants/colors";
import { GooglePlacesAPI } from "../services/api";

const restaurantDetailStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: "20px",
    paddingTop: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    color: COLORS.white,
    textDecoration: "none",
    fontSize: "16px",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  imageContainer: {
    position: "relative",
    height: "250px",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.border,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "60px",
  },
  content: {
    marginTop: "-20px",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: "25px",
    borderTopRightRadius: "25px",
    padding: "20px",
  },
  name: {
    fontSize: "26px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "5px",
  },
  address: {
    fontSize: "14px",
    color: COLORS.textLight,
    marginBottom: "15px",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },
  ratingContainer: {
    display: "flex",
    alignItems: "center",
  },
  rating: {
    fontSize: "16px",
    fontWeight: "600",
    marginLeft: "4px",
  },
  ratingCount: {
    fontSize: "12px",
    color: COLORS.textLight,
    marginLeft: "2px",
  },
  distanceBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: "5px 10px",
    borderRadius: "10px",
  },
  distanceText: {
    fontSize: "14px",
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: "4px",
  },
  statusBadge: {
    padding: "5px 12px",
    borderRadius: "15px",
  },
  statusBadgeOpen: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeClosed: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: "14px",
    fontWeight: "600",
  },
  statusTextOpen: {
    color: "#16A34A",
  },
  statusTextClosed: {
    color: "#DC2626",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  actionButton: {
    flex: 1,
    minWidth: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: COLORS.white,
    padding: "15px",
    borderRadius: "12px",
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "15px",
  },
  deliveryInfo: {
    display: "flex",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    padding: "15px",
    borderRadius: "12px",
    gap: "12px",
    marginBottom: "20px",
  },
  deliveryText: {
    flex: 1,
    fontSize: "14px",
    color: COLORS.text,
  },
  whatsappButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    padding: "16px",
    borderRadius: "12px",
    gap: "10px",
    marginTop: "10px",
    cursor: "pointer",
    border: "none",
    width: "100%",
  },
  whatsappButtonText: {
    fontSize: "16px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  hoursSection: {
    padding: "20px 0",
  },
  hoursText: {
    fontSize: "13px",
    color: COLORS.text,
    marginBottom: "4px",
  },
  bottomPadding: {
    height: "30px",
  },
};

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  // Try to parse restaurant data from query params
  let initialRestaurant = null;
  try {
    const data = searchParams.get("data");
    if (data) {
      initialRestaurant = JSON.parse(decodeURIComponent(data));
    }
  } catch (e) {
    console.log("Error parsing restaurant data:", e);
  }
  
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch additional details from API if needed
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
      <div style={restaurantDetailStyles.container}>
        <header style={restaurantDetailStyles.header}>
          <Link to="/restaurants" style={restaurantDetailStyles.backButton}>← Back</Link>
          <h1 style={restaurantDetailStyles.headerTitle}>Restaurant</h1>
          <div style={{ width: "60px" }}></div>
        </header>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>⚠️</div>
          <h2>Restaurant not found</h2>
          <p style={{ color: COLORS.textLight, marginTop: "10px" }}>Please go back and try again</p>
        </div>
      </div>
    );
  }

  const handleCallRestaurant = () => {
    if (restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`;
    } else {
      alert("Phone number not available");
    }
  };

  const handleContactDelivery = () => {
    if (restaurant.phone) {
      const message = encodeURIComponent(
        `Hello! I would like to order from ${restaurant.name}. Please confirm.`
      );
      window.open(`https://wa.me/${restaurant.phone.replace(/\D/g, '')}?text=${message}`, "_blank");
    } else {
      alert("Cannot contact restaurant - phone number not available");
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
    window.open(url, "_blank");
  };

  const openWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, "_blank");
    }
  };

  return (
    <div style={restaurantDetailStyles.container}>
      {/* Header Image */}
      <div style={restaurantDetailStyles.imageContainer}>
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} style={restaurantDetailStyles.image} />
        ) : (
          <div style={restaurantDetailStyles.imagePlaceholder}>🍽️</div>
        )}
      </div>

      <div style={restaurantDetailStyles.content}>
        {/* Restaurant Info */}
        <div style={restaurantDetailStyles.infoSection}>
          <h1 style={restaurantDetailStyles.name}>{restaurant.name}</h1>
          <p style={restaurantDetailStyles.address}>{restaurant.address}</p>
          
          <div style={restaurantDetailStyles.metaRow}>
            <div style={restaurantDetailStyles.ratingContainer}>
              <span>⭐</span>
              <span style={restaurantDetailStyles.rating}>{restaurant.rating?.toFixed(1) || "N/A"}</span>
              {restaurant.userRatingsTotal > 0 && (
                <span style={restaurantDetailStyles.ratingCount}>({restaurant.userRatingsTotal})</span>
              )}
            </div>
            
            {restaurant.distance && (
              <div style={restaurantDetailStyles.distanceBadge}>
                <span>📍</span>
                <span style={restaurantDetailStyles.distanceText}>{restaurant.distance} km away</span>
              </div>
            )}
            
            {restaurant.openNow !== undefined && (
              <div style={{
                ...restaurantDetailStyles.statusBadge,
                ...(restaurant.openNow ? restaurantDetailStyles.statusBadgeOpen : restaurantDetailStyles.statusBadgeClosed)
              }}>
                <span style={{
                  ...restaurantDetailStyles.statusText,
                  ...(restaurant.openNow ? restaurantDetailStyles.statusTextOpen : restaurantDetailStyles.statusTextClosed)
                }}>
                  {restaurant.openNow ? "Open Now" : "Closed"}
                </span>
              </div>
            )}
          </div>

          {loadingDetails && (
            <p style={{ fontSize: "12px", color: COLORS.textLight, marginTop: "8px" }}>Loading details...</p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={restaurantDetailStyles.actionButtons}>
          <button style={restaurantDetailStyles.actionButton} onClick={handleCallRestaurant}>
            <span style={{ fontSize: "20px" }}>📞</span>
            <span>Call</span>
          </button>
          
          <button style={restaurantDetailStyles.actionButton} onClick={openInMaps}>
            <span style={{ fontSize: "20px" }}>📍</span>
            <span>Directions</span>
          </button>

          {restaurant.website && (
            <button style={restaurantDetailStyles.actionButton} onClick={openWebsite}>
              <span style={{ fontSize: "20px" }}>🌐</span>
              <span>Website</span>
            </button>
          )}
        </div>

        {/* Delivery Section */}
        <div style={restaurantDetailStyles.sectionTitle}>Order for Delivery</div>
        <div style={restaurantDetailStyles.deliveryInfo}>
          <span style={{ fontSize: "24px" }}>ℹ️</span>
          <p style={restaurantDetailStyles.deliveryText}>
            Contact this restaurant directly to order food for delivery.
          </p>
        </div>
        
        <button style={restaurantDetailStyles.whatsappButton} onClick={handleContactDelivery}>
          <span style={{ fontSize: "20px" }}>💬</span>
          <span style={restaurantDetailStyles.whatsappButtonText}>Contact for Delivery</span>
        </button>

        {/* Opening Hours */}
        {restaurant.openingHours && restaurant.openingHours.length > 0 && (
          <div style={restaurantDetailStyles.hoursSection}>
            <div style={restaurantDetailStyles.sectionTitle}>Opening Hours</div>
            {restaurant.openingHours.map((hours, index) => (
              <p key={index} style={restaurantDetailStyles.hoursText}>{hours}</p>
            ))}
          </div>
        )}

        <div style={restaurantDetailStyles.bottomPadding} />
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        backgroundColor: COLORS.primary,
        color: COLORS.white,
        marginTop: '40px'
      }}>
        <p>© 2024 Recipe App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RestaurantDetailPage;

