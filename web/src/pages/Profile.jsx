import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";
import { RecipeAPI, AddressAPI, OrderAPI } from "../services/api";

const profileStyles = {
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: "40px",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: "30px",
    borderBottomRightRadius: "30px",
    paddingBottom: "60px",
  },
  avatarContainer: {
    marginBottom: "15px",
    position: "relative",
    display: "inline-block",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: `3px solid ${COLORS.white}`,
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: COLORS.textLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `3px solid ${COLORS.white}`,
  },
  editBadge: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: COLORS.primary,
    width: "32px",
    height: "32px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `3px solid ${COLORS.white}`,
    cursor: "pointer",
  },
  name: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: "5px",
  },
  email: {
    fontSize: "14px",
    color: COLORS.white,
    opacity: 0.8,
  },
  statsRow: {
    display: "flex",
    marginTop: "20px",
    paddingHorizontal: "20px",
    gap: "30px",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: "12px",
    color: COLORS.white,
    opacity: 0.8,
  },
  menuSection: {
    paddingHorizontal: "20px",
    paddingTop: "25px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: "15px",
    textTransform: "uppercase",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "10px",
    cursor: "pointer",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontSize: "16px",
    color: COLORS.text,
  },
  menuIcon: {
    marginRight: "15px",
    fontSize: "20px",
  },
  menuText: {
    flex: 1,
    fontSize: "16px",
    color: COLORS.text,
  },
  menuArrow: {
    color: COLORS.textLight,
    fontSize: "20px",
  },
  signOutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    padding: "15px",
    borderRadius: "12px",
    margin: "20px",
    cursor: "pointer",
    border: "none",
    width: "calc(100% - 40px)",
    maxWidth: "560px",
    margin: "20px auto",
  },
  signOutText: {
    fontSize: "16px",
    color: COLORS.danger,
    fontWeight: "600",
    marginLeft: "10px",
  },
  version: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: "12px",
    marginTop: "20px",
    paddingBottom: "40px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
};

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [userRecipes, setUserRecipes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      fetchUserData();
    }
  }, [isLoaded]);

  const fetchUserData = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div style={profileStyles.container}>
        <div style={profileStyles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={profileStyles.container}>
        <header style={profileStyles.header}>
          <Link to="/" style={profileStyles.backButton}>← Back</Link>
          <h1 style={profileStyles.headerTitle}>Profile</h1>
          <div style={{ width: "60px" }}></div>
        </header>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Please sign in to view your profile.</p>
          <Link to="/sign-in" style={{ color: COLORS.primary, marginTop: "20px", display: "inline-block" }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={profileStyles.container}>
      {/* Header */}
      <header style={profileStyles.header}>
        <Link to="/" style={profileStyles.backButton}>← Back</Link>
        <h1 style={profileStyles.headerTitle}>Profile</h1>
        <div style={{ width: "60px" }}></div>
      </header>

      {/* Profile Header */}
      <div style={profileStyles.profileHeader}>
        <div style={profileStyles.avatarContainer}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" style={profileStyles.avatar} />
          ) : (
            <div style={profileStyles.avatarPlaceholder}>
              <span style={{ fontSize: "40px", color: COLORS.white }}>👤</span>
            </div>
          )}
        </div>
        <h2 style={profileStyles.name}>{user?.username || user?.fullName || "User"}</h2>
        <p style={profileStyles.email}>{user?.primaryEmailAddress?.emailAddress}</p>
        
        {/* Stats */}
        <div style={profileStyles.statsRow}>
          <div style={profileStyles.statItem}>
            <span style={profileStyles.statNumber}>{userRecipes.length}</span>
            <span style={profileStyles.statLabel}>Recipes</span>
          </div>
          <div style={profileStyles.statItem}>
            <span style={profileStyles.statNumber}>{addresses.length}</span>
            <span style={profileStyles.statLabel}>Addresses</span>
          </div>
          <div style={profileStyles.statItem}>
            <span style={profileStyles.statNumber}>{orders.length}</span>
            <span style={profileStyles.statLabel}>Orders</span>
          </div>
        </div>
      </div>

      {/* My Recipes */}
      <div style={profileStyles.menuSection}>
        <h3 style={profileStyles.sectionTitle}>My Recipes</h3>
        
        <Link to="/add-recipe" style={{ textDecoration: "none" }}>
          <button style={profileStyles.menuItem}>
            <span style={profileStyles.menuIcon}>➕</span>
            <span style={profileStyles.menuText}>Add New Recipe</span>
            <span style={profileStyles.menuArrow}>›</span>
          </button>
        </Link>

        <Link to="/my-recipes" style={{ textDecoration: "none" }}>
          <button style={profileStyles.menuItem}>
            <span style={profileStyles.menuIcon}>📖</span>
            <span style={profileStyles.menuText}>View My Recipes ({userRecipes.length})</span>
            <span style={profileStyles.menuArrow}>›</span>
          </button>
        </Link>
      </div>

      {/* Account */}
      <div style={profileStyles.menuSection}>
        <h3 style={profileStyles.sectionTitle}>Account</h3>
        
        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>👤</span>
          <span style={profileStyles.menuText}>Personal Information</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>

        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>📍</span>
          <span style={profileStyles.menuText}>Delivery Addresses ({addresses.length})</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>

        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>🧾</span>
          <span style={profileStyles.menuText}>Order History ({orders.length})</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>

        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>💳</span>
          <span style={profileStyles.menuText}>Payment Methods</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>
      </div>

      {/* Preferences */}
      <div style={profileStyles.menuSection}>
        <h3 style={profileStyles.sectionTitle}>Preferences</h3>
        
        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>🔔</span>
          <span style={profileStyles.menuText}>Notifications</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>

        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>🌐</span>
          <span style={profileStyles.menuText}>Language</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>

        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>❓</span>
          <span style={profileStyles.menuText}>Help & Support</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>
      </div>

      {/* Restaurants */}
      <div style={profileStyles.menuSection}>
        <h3 style={profileStyles.sectionTitle}>Restaurants</h3>
        
        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>🍽️</span>
          <span style={profileStyles.menuText}>Nearby Restaurants</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>

        <button style={profileStyles.menuItem}>
          <span style={profileStyles.menuIcon}>🚚</span>
          <span style={profileStyles.menuText}>My Deliveries</span>
          <span style={profileStyles.menuArrow}>›</span>
        </button>
      </div>

      {/* Sign Out Button */}
      <button style={profileStyles.signOutButton} onClick={handleSignOut}>
        <span style={{ fontSize: "22px" }}>🚪</span>
        <span style={profileStyles.signOutText}>Sign Out</span>
      </button>

      <p style={profileStyles.version}>Version 1.0.0</p>
    </div>
  );
};

export default ProfilePage;
