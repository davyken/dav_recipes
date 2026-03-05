import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";

const dashboardStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: "20px",
    paddingTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.white,
    textDecoration: "none",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userName: {
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "500",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: `2px solid ${COLORS.white}`,
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
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  nav: {
    display: "flex",
    gap: "10px",
    padding: "15px 20px",
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    overflowX: "auto",
  },
  navLink: {
    padding: "10px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    color: COLORS.text,
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  navLinkActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  footer: {
    backgroundColor: COLORS.primary,
    padding: "20px",
    textAlign: "center",
    color: COLORS.white,
    fontSize: "14px",
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
      {/* Header */}
      <header style={dashboardStyles.header}>
        <Link to="/" style={dashboardStyles.logo}>
          🍳 Recipe App
        </Link>
        <div style={dashboardStyles.userInfo}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" style={dashboardStyles.avatar} />
          ) : (
            <div style={{ ...dashboardStyles.avatar, backgroundColor: COLORS.textLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: COLORS.white, fontSize: "14px" }}>👤</span>
            </div>
          )}
          <span style={dashboardStyles.userName}>{user?.username || user?.fullName || "User"}</span>
          <button style={dashboardStyles.logoutButton} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

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

      {/* Main Content */}
      <main style={dashboardStyles.mainContent}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={dashboardStyles.footer}>
        <p>© 2024 Recipe App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;
