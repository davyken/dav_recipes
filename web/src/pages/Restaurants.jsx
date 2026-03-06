import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { COLORS } from "../constants/colors";
import { GooglePlacesAPI } from "../services/api";

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

const restaurantStyles = {
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
  searchContainer: {
    padding: "20px",
    backgroundColor: COLORS.primary,
    paddingBottom: "30px",
  },
  searchInput: {
    width: "100%",
    padding: "16px 20px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    boxSizing: "border-box",
  },
  content: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },
  loadingText: {
    fontSize: "16px",
    color: COLORS.textLight,
    marginTop: "15px",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: COLORS.textLight,
  },
  retryButton: {
    marginTop: "20px",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: "12px 30px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    marginBottom: "15px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "row",
  },
  cardImage: {
    width: "140px",
    height: "140px",
    objectFit: "cover",
  },
  cardImagePlaceholder: {
    width: "140px",
    height: "140px",
    backgroundColor: COLORS.border,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
  },
  cardContent: {
    flex: 1,
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "4px",
  },
  address: {
    fontSize: "14px",
    color: COLORS.textLight,
    marginBottom: "8px",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  ratingContainer: {
    display: "flex",
    alignItems: "center",
  },
  rating: {
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.text,
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
    backgroundColor: COLORS.background,
    padding: "4px 8px",
    borderRadius: "10px",
  },
  distanceText: {
    fontSize: "12px",
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: "4px",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "10px",
  },
  statusBadgeOpen: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeClosed: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: "12px",
    fontWeight: "600",
  },
  statusTextOpen: {
    color: "#16A34A",
  },
  statusTextClosed: {
    color: "#DC2626",
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "10px",
  },
  actionIcon: {
    backgroundColor: COLORS.background,
    padding: "10px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "18px",
  },
  resultsInfo: {
    marginBottom: "20px",
    fontSize: "16px",
    color: COLORS.text,
  },
};

const RestaurantsPage = () => {
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          await fetchNearbyRestaurants(latitude, longitude);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Could not get your location. Please enable location access.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  const fetchNearbyRestaurants = async (lat, lng) => {
    setLoading(true);
    try {
      const results = await GooglePlacesAPI.getNearbyRestaurants(lat, lng, 10000, searchQuery || "restaurant");
      
      if (results && results.length > 0) {
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (location) {
      fetchNearbyRestaurants(location.latitude, location.longitude);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    window.location.href = `/restaurant/${restaurant.id}?data=${encodeURIComponent(JSON.stringify(restaurant))}`;
  };

  const openInMaps = (restaurant) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
    window.open(url, "_blank");
  };

  const callRestaurant = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div style={restaurantStyles.container}>
      {/* Header */}
      <header style={restaurantStyles.header}>
        <Link to="/" style={restaurantStyles.backButton}>← Back</Link>
        <h1 style={restaurantStyles.headerTitle}>Nearby Restaurants</h1>
        <div style={{ width: "60px" }}></div>
      </header>

      {/* Search */}
      <div style={restaurantStyles.searchContainer}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            style={{ ...restaurantStyles.searchInput, flex: 1 }}
            placeholder="Search restaurants, cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            style={{
              backgroundColor: COLORS.white,
              border: "none",
              borderRadius: "12px",
              padding: "0 20px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            🔍
          </button>
        </form>
      </div>

      {/* Content */}
      <div style={restaurantStyles.content}>
        {loading ? (
          <div style={restaurantStyles.loadingContainer}>
            <div style={{ fontSize: "40px" }}>🍽️</div>
            <p style={restaurantStyles.loadingText}>Finding restaurants near you...</p>
          </div>
        ) : error ? (
          <div style={restaurantStyles.emptyContainer}>
            <div style={restaurantStyles.emptyIcon}>⚠️</div>
            <h3 style={restaurantStyles.emptyTitle}>Location Required</h3>
            <p style={restaurantStyles.emptyText}>{error}</p>
            <button style={restaurantStyles.retryButton} onClick={getCurrentLocation}>
              Try Again
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <div style={restaurantStyles.emptyContainer}>
            <div style={restaurantStyles.emptyIcon}>🍽️</div>
            <h3 style={restaurantStyles.emptyTitle}>No Restaurants Found</h3>
            <p style={restaurantStyles.emptyText}>Make sure Google Places API is configured</p>
            <button style={restaurantStyles.retryButton} onClick={getCurrentLocation}>
              Refresh Location
            </button>
          </div>
        ) : (
          <>
            <p style={restaurantStyles.resultsInfo}>
              {location ? `${restaurants.length} restaurants near you` : 'Finding your location...'}
            </p>
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                style={restaurantStyles.card}
                onClick={() => handleRestaurantClick(restaurant)}
              >
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    style={restaurantStyles.cardImage}
                  />
                ) : (
                  <div style={restaurantStyles.cardImagePlaceholder}>🍽️</div>
                )}
                <div style={restaurantStyles.cardContent}>
                  <div>
                    <h3 style={restaurantStyles.cardTitle}>{restaurant.name}</h3>
                    <p style={restaurantStyles.address}>{restaurant.address}</p>
                    
                    <div style={restaurantStyles.cardMeta}>
                      <div style={restaurantStyles.ratingContainer}>
                        <span>⭐</span>
                        <span style={restaurantStyles.rating}>{restaurant.rating?.toFixed(1) || "N/A"}</span>
                        {restaurant.userRatingsTotal > 0 && (
                          <span style={restaurantStyles.ratingCount}>({restaurant.userRatingsTotal})</span>
                        )}
                      </div>
                      
                      {restaurant.distance && (
                        <div style={restaurantStyles.distanceBadge}>
                          <span>📍</span>
                          <span style={restaurantStyles.distanceText}>{restaurant.distance} km</span>
                        </div>
                      )}
                      
                      {restaurant.openNow !== undefined && (
                        <div style={{
                          ...restaurantStyles.statusBadge,
                          ...(restaurant.openNow ? restaurantStyles.statusBadgeOpen : restaurantStyles.statusBadgeClosed)
                        }}>
                          <span style={{
                            ...restaurantStyles.statusText,
                            ...(restaurant.openNow ? restaurantStyles.statusTextOpen : restaurantStyles.statusTextClosed)
                          }}>
                            {restaurant.openNow ? "Open" : "Closed"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={restaurantStyles.cardActions}>
                    <span 
                      style={restaurantStyles.actionIcon}
                      onClick={(e) => { e.stopPropagation(); openInMaps(restaurant); }}
                    >
                      📍
                    </span>
                    <span 
                      style={restaurantStyles.actionIcon}
                      onClick={(e) => { e.stopPropagation(); callRestaurant(restaurant.phone); }}
                    >
                      📞
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;

