import { COLORS } from "../constants/colors";

export const authStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  logo: {
    width: "120px",
    height: "120px",
    objectFit: "contain",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: "30px",
  },
  inputContainer: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    boxSizing: "border-box",
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  button: {
    width: "100%",
    padding: "18px",
    backgroundColor: COLORS.primary,
    borderRadius: "12px",
    border: "none",
    marginTop: "20px",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  buttonText: {
    fontSize: "16px",
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
  },
  linkContainer: {
    textAlign: "center",
    marginTop: "20px",
  },
  linkText: {
    fontSize: "16px",
    color: COLORS.textLight,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
  },
  error: {
    color: COLORS.danger,
    fontSize: "14px",
    marginTop: "10px",
    textAlign: "center",
  },
  success: {
    color: COLORS.success,
    fontSize: "14px",
    marginTop: "10px",
    textAlign: "center",
  },
};
