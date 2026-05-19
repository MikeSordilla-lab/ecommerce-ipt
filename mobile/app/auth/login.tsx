import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, TextInput } from "react-native-paper";
import { useAuth } from "@/auth/auth-context";
import { colors } from "@/theme/colors";

const MARGIN_MOBILE = 20;
const GAP_LG = 24;
const GAP_MD = 16;
const GAP_SM = 8;
const RADIUS_SM = 4;
const RADIUS_FULL = 9999;

export default function LoginScreen() {
  const { signIn, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    router.replace("/");
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await signIn(username, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.ambientGlow} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.brandIcon}>
            <Icon source="storefront" size={32} color={colors.primaryContainer} />
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Shop</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor={colors.outlineVariant}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={colors.border}
                activeOutlineColor={colors.primaryContainer}
                textColor={colors.onSurface}
                disabled={busy}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.fieldLabel}>Password</Text>
              <Pressable>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </Pressable>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.outlineVariant}
                secureTextEntry
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineColor={colors.border}
                activeOutlineColor={colors.primaryContainer}
                textColor={colors.onSurface}
                disabled={busy}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              busy && styles.submitButtonDisabled,
            ]}
            onPress={submit}
            disabled={busy}
          >
            <Text style={styles.submitButtonText}>
              {busy ? "Signing in..." : "Sign In"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Link href="/auth/register" style={styles.footerLink}>
              Create an account
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ambientGlow: {
    position: "absolute",
    top: -100,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: colors.primaryContainer,
    opacity: 0.03,
    borderRadius: 150,
  },
  content: {
    flex: 1,
    paddingHorizontal: MARGIN_MOBILE,
    justifyContent: "center",
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: GAP_LG,
    gap: GAP_SM,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS_FULL,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: GAP_MD,
    shadowColor: "rgba(23, 23, 23, 0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0,
  },
  storefrontIcon: {
    fontSize: 32,
    color: colors.primaryContainer,
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 36,
    letterSpacing: -0.64,
    color: colors.onSurface,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "300",
    lineHeight: 26,
    color: colors.secondary,
    textAlign: "center",
  },
  form: {
    gap: GAP_LG,
  },
  fieldGroup: {
    gap: GAP_SM,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.label,
    paddingHorizontal: 4,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.primaryContainer,
  },
  inputContainer: {
    borderRadius: RADIUS_SM,
    shadowColor: "rgba(23, 23, 23, 0.02)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 0,
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: RADIUS_SM,
  },
  inputContent: {
    minHeight: 48,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: "rgba(186, 26, 26, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(186, 26, 26, 0.3)",
    borderRadius: RADIUS_SM,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "300",
    lineHeight: 20,
    color: colors.error,
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: RADIUS_SM,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(23, 23, 23, 0.08)",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 0,
  },
  submitButtonPressed: {
    backgroundColor: colors.primary,
    shadowColor: "rgba(50, 50, 93, 0.25)",
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 1,
    shadowRadius: 45,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.onPrimaryContainer,
  },
  footer: {
    marginTop: GAP_LG,
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 22,
    color: colors.secondary,
    textAlign: "center",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.primaryContainer,
    textDecorationLine: "underline",
  },
});