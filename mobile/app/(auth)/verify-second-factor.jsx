import { useSignIn } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { authStyles } from "../../assets/styles/auth.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";

const VerifySecondFactor = ({ signInAttempt, onBack }) => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!isLoaded || !signIn) return;

    if (!code || code.length < 6) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      // Attempt to verify the second factor
      const secondFactorAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: code,
      });

      if (secondFactorAttempt.status === "complete") {
        await setActive({ session: secondFactorAttempt.createdSessionId });
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
        console.error(JSON.stringify(secondFactorAttempt, null, 2));
      }
    } catch (err) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Container */}
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i3.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text style={authStyles.title}>Two-Factor Authentication</Text>
          <Text style={authStyles.subtitle}>
            We've sent a verification code to your email
          </Text>

          <View style={authStyles.formContainer}>
            {/* Verification Code Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter verification code"
                placeholderTextColor={COLORS.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleVerification}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Verifying..." : "Verify"}
              </Text>
            </TouchableOpacity>

            {/* Back to Sign In */}
            <TouchableOpacity style={authStyles.linkContainer} onPress={onBack}>
              <Text style={authStyles.linkText}>
                <Text style={authStyles.link}>Back to Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifySecondFactor;
