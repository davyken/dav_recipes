import { Link } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import { COLORS } from "../constants/colors";

const SignUpPage = () => {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: COLORS.background,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: "16px",
        padding: "40px",
        width: "100%",
        maxWidth: "450px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "0 auto" }}
          >
            <circle cx="40" cy="40" r="40" fill={COLORS.primary} />
            <path
              d="M40 20C30 20 25 28 25 35C25 45 35 55 40 60C45 55 55 45 55 35C55 28 50 20 40 20Z"
              fill="white"
            />
            <circle cx="40" cy="35" r="5" fill={COLORS.primary} />
          </svg>
        </div>

        <h1 style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: COLORS.text,
          textAlign: "center",
          marginBottom: "30px",
        }}>Create Account</h1>

        <div style={{ minHeight: "350px" }}>
          <SignUp
            appearance={{
              elements: {
                rootBox: {
                  width: "100%",
                },
                card: {
                  boxShadow: "none",
                  border: "none",
                  width: "100%",
                },
                formButtonPrimary: {
                  backgroundColor: COLORS.primary,
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  padding: "16px",
                  minHeight: "50px",
                },
                inputField: {
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.border}`,
                  padding: "12px",
                },
                formFieldInput: {
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.border}`,
                },
              },
            }}
            routing="hash"
            signInUrl="/sign-in"
            redirectUrl="/home"
            fallbackRedirectUrl="/home"
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span style={{ fontSize: "16px", color: COLORS.textLight }}>
            Already have an account?{" "}
            <Link to="/sign-in" style={{ color: COLORS.primary, fontWeight: "600", textDecoration: "none" }}>
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
