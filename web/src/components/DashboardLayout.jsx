import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";

const dashboardStyles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: COLORS.background,
  },
  sidebar: {
    width: "260px",
    backgroundColor: COLORS.primary,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    left: 0,
    top: 0,
  },
  logo: {
    padding: "30px 20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.white,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  nav: {
    flex: 1,
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    color: COLORS.white,
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.2s",
    opacity: 0.8,
  },
  navLinkActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
    opacity: 1,
    borderLeft: "4px solid white",
  },
  userSection: {
    padding: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userInfo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    fontSize: "20px",
  },
  userName: {
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "600",
  },
  logoutButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: COLORS.white,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  mainContent: {
    flex: 1,
    marginLeft: "260px",
    padding: "30px",
    maxWidth: "calc(100% - 260px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  addRecipeButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
};

const DashboardLayout = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  return (
    <div style={dashboardStyles.container}>
      {/* Sidebar */}
      <aside style={dashboardStyles.sidebar}>
        <div style={dashboardStyles.logo}>
          🍳 Recipe App
        </div>

        {/* Navigation */}
        <nav style={dashboardStyles.nav}>
          <Link 
            to="/home" 
            style={{
              ...dashboardStyles.navLink,
              ...(isActive("/home") || isActive("/") ? dashboardStyles.navLinkActive : {}),
            }}
          >
            🏠 Home
          </Link>
          <Link 
            to="/search" 
            style={{
              ...dashboardStyles.navLink,
              ...(isActive("/search") ? dashboardStyles.navLinkActive : {}),
            }}
          >
            🔍 Search
          </Link>
          <Link 
            to="/my-recipes" 
            style={{
              ...dashboardStyles.navLink,
              ...(isActive("/my-recipes") ? dashboardStyles.navLinkActive : {}),
            }}
          >
            📖 My Recipes
          </Link>
          <Link 
            to="/add-recipe" 
            style={{
              ...dashboardStyles.navLink,
              ...(isActive("/add-recipe") ? dashboardStyles.navLinkActive : {}),
            }}
          >
            ➕ Add Recipe
          </Link>
          <Link 
            to="/favorites" 
            style={{
              ...dashboardStyles.navLink,
              ...(isActive("/favorites") ? dashboardStyles.navLinkActive : {}),
            }}
          >
            ❤️ Favorites
          </Link>
          <Link 
            to="/restaurants" 
            style={{
              ...dashboardStyles.navLink,
              ...(isActive("/restaurants") ? dashboardStyles.navLinkActive : {}),
            }}
          >
            🍽️ Restaurants
          </Link>
          <Link 
            to="/profile" 
            style={{
              ...dashboardStyles.navLink,
              ...(isActive("/profile") ? dashboardStyles.navLinkActive : {}),
            }}
          >
            👤 Profile
          </Link>
        </nav>

        {/* User Section at Top */}
        <div style={dashboardStyles.userSection}>
          <div style={dashboardStyles.userInfo}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" style={dashboardStyles.userAvatar} />
            ) : (
              <div style={dashboardStyles.userAvatar}>👤</div>
            )}
            <span style={dashboardStyles.userName}>{user?.username || user?.fullName || "User"}</span>
          </div>
          <button style={dashboardStyles.logoutButton} onClick={handleSignOut} title="Sign Out">
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={dashboardStyles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
