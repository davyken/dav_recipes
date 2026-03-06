import { COLORS } from "../constants/colors";

export const homeStyles = {
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
  headerTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerNav: {
    display: "flex",
    gap: "20px",
  },
  navLink: {
    color: COLORS.white,
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
  },
  heroSection: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: "30px",
    borderBottomRightRadius: "30px",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: "10px",
  },
  heroSubtitle: {
    fontSize: "16px",
    color: COLORS.white,
    opacity: 0.9,
  },
  featuredSection: {
    padding: "20px",
  },
  featuredCard: {
    backgroundColor: COLORS.card,
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
    cursor: "pointer",
  },
  featuredImageContainer: {
    position: "relative",
    height: "300px",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "20px",
  },
  featuredBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "12px",
    paddingVertical: "6px",
    borderRadius: "20px",
    display: "inline-block",
    marginBottom: "10px",
  },
  featuredBadgeText: {
    color: COLORS.white,
    fontSize: "12px",
    fontWeight: "600",
  },
  featuredTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: "8px",
  },
  featuredMeta: {
    display: "flex",
    gap: "16px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: COLORS.white,
    fontSize: "14px",
  },
  section: {
    padding: "20px",
  },
  sectionHeader: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: "14px",
    color: COLORS.textLight,
    marginTop: "4px",
  },
  categoryContainer: {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "10px",
  },
  categoryButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: COLORS.card,
    borderRadius: "20px",
    border: `1px solid ${COLORS.border}`,
    minWidth: "80px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryImage: {
    width: "40px",
    height: "40px",
    borderRadius: "20px",
    marginBottom: "4px",
    objectFit: "cover",
  },
  categoryText: {
    fontSize: "12px",
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  recipesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  recipeCard: {
    backgroundColor: COLORS.card,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  recipeImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },
  recipeContent: {
    padding: "12px",
  },
  recipeTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: "4px",
  },
  recipeDescription: {
    fontSize: "12px",
    color: COLORS.textLight,
    marginBottom: "8px",
  },
  recipeMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyState: {
    textAlign: "center",
    paddingVertical: "64px",
    paddingHorizontal: "32px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: COLORS.text,
    marginTop: "16px",
    marginBottom: "8px",
  },
  emptyDescription: {
    fontSize: "14px",
    color: COLORS.textLight,
  },
};

export const recipeCardStyles = {
  container: {
    backgroundColor: COLORS.card,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  imageContainer: {
    position: "relative",
    height: "140px",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  content: {
    padding: "12px",
  },
  title: {
    fontSize: "15px",
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: "4px",
  },
  description: {
    fontSize: "12px",
    color: COLORS.textLight,
    marginBottom: "8px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  timeText: {
    fontSize: "11px",
    color: COLORS.textLight,
    fontWeight: "500",
  },
};
