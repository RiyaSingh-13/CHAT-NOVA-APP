import { useContext, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../config";

export function AuthScreen() {
  const { login, startupError } = useContext(AuthContext);
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState(startupError);
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  const submit = async () => {
    setError("");
    if (isSignup && step === 0) {
      setStep(1);
      return;
    }
    setBusy(true);
    try {
      await login(
        mode,
        isSignup ? { fullName: fullName.trim(), email: email.trim(), password, bio: bio.trim() } : { email: email.trim(), password },
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const setAuthMode = (nextMode) => {
    setMode(nextMode);
    setStep(0);
    setError("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>N</Text>
          </View>
          <Text style={styles.brandTitle}>Chat Nova</Text>
          <Text style={styles.brandSubtitle}>Good conversations start here.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>
            {isSignup ? (step === 0 ? "Create your account" : "A little about you") : "Welcome back"}
          </Text>
          <Text style={styles.description}>
            {isSignup ? "Connect with people, wherever you are." : "Sign in to pick up where you left off."}
          </Text>

          {isSignup && step === 0 && (
            <TextInput
              autoCapitalize="words"
              onChangeText={setFullName}
              placeholder="Full name"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              value={fullName}
            />
          )}
          {(!isSignup || step === 0) && (
            <>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
                value={email}
              />
              <TextInput
                autoComplete={isSignup ? "new-password" : "current-password"}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </>
          )}
          {isSignup && step === 1 && (
            <TextInput
              multiline
              onChangeText={setBio}
              placeholder="Write a short bio"
              placeholderTextColor={COLORS.muted}
              style={[styles.input, styles.bio]}
              textAlignVertical="top"
              value={bio}
            />
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable
            disabled={busy}
            onPress={submit}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            {busy ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignup ? (step === 0 ? "Continue" : "Create account") : "Sign in"}
              </Text>
            )}
          </Pressable>

          {isSignup && step === 1 && (
            <Pressable onPress={() => setStep(0)} style={styles.secondaryAction}>
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
          )}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {isSignup ? "Already have an account? " : "New to Chat Nova? "}
            </Text>
            <Text
              onPress={() => setAuthMode(isSignup ? "login" : "signup")}
              style={styles.link}
            >
              {isSignup ? "Sign in" : "Create account"}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  brand: { alignItems: "center", marginBottom: 32 },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
    marginBottom: 12,
  },
  brandMarkText: { color: "white", fontSize: 27, fontWeight: "800" },
  brandTitle: { color: COLORS.text, fontSize: 28, fontWeight: "700" },
  brandSubtitle: { color: COLORS.muted, marginTop: 6 },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
  },
  heading: { color: COLORS.text, fontSize: 22, fontWeight: "700" },
  description: { color: COLORS.muted, marginTop: 8, marginBottom: 22, lineHeight: 20 },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
    fontSize: 15,
  },
  bio: { minHeight: 110 },
  primaryButton: {
    minHeight: 50,
    backgroundColor: COLORS.accent,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.82 },
  secondaryAction: { paddingVertical: 12, alignItems: "center" },
  secondaryText: { color: COLORS.accentLight, fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 22,
  },
  switchLabel: { color: COLORS.muted },
  link: { color: COLORS.accentLight, fontWeight: "700" },
  error: { color: "#fca5a5", marginBottom: 12, lineHeight: 20 },
});
