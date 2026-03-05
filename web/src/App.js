import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";

// Pages
import LandingPage from "./pages/Landing";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import RecipeDetailPage from "./pages/RecipeDetail";
import SearchPage from "./pages/Search";
import FavoritesPage from "./pages/Favorites";
import ProfilePage from "./pages/Profile";
import MyRecipesPage from "./pages/MyRecipes";
import HomePage from "./pages/Home";
import AddRecipePage from "./pages/AddRecipe";
import EditRecipePage from "./pages/EditRecipe";
import RestaurantsPage from "./pages/Restaurants";
import RestaurantDetailPage from "./pages/RestaurantDetail";

// Components
import DashboardLayout from "./components/DashboardLayout";

// Get the Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || "pk_test_bGl2ZS1pbXBhbGEtNDAuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Wrapper for authenticated pages (uses DashboardLayout)
const AuthenticatedApp = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-recipes" element={<MyRecipesPage />} />
        <Route path="/add-recipe" element={<AddRecipePage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/recipe/edit/:id" element={<EditRecipePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <Router>
        <Routes>
          {/* Landing Page - Visible to everyone (including unauthenticated) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Sign In / Sign Up - Visible when signed out */}
          <Route path="/sign-in" element={
            <SignedOut>
              <SignInPage />
            </SignedOut>
          } />
          <Route path="/sign-up" element={
            <SignedOut>
              <SignUpPage />
            </SignedOut>
          } />
          
          {/* Recipe Detail - Visible to everyone */}
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          
          {/* Restaurant Detail - Visible to everyone */}
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          
          {/* Authenticated Pages - Dashboard Layout */}
          <Route path="/*" element={
            <SignedIn>
              <AuthenticatedApp />
            </SignedIn>
          } />
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;
