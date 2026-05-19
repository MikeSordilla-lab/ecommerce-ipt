import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { IconButton, Surface, Text, TextInput, TouchableRipple } from "react-native-paper";
import { useAuth } from "@/auth/auth-context";
import { colors } from "@/theme/colors";

const MARGIN_MOBILE = 20;
const GAP_LG = 24;
const GAP_MD = 16;
const GAP_SM = 8;

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await register({ username, email, password, role });
      setMessage(result);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register");
    } finally {
      setBusy(false);
    }
  }

  function navigateToLogin() {
    router.push("/auth/login");
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.titleSection}>
          <Text variant="headlineLarge" style={styles.headline}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Join the Shop ecosystem today.
          </Text>
        </View>

        <Surface style={styles.formCard} elevation={0}>
          <View style={styles.formFields}>
            <View style={styles.fieldContainer}>
              <Text variant="labelMedium" style={styles.fieldLabel}>
                Username
              </Text>
              <TextInput
                mode="outlined"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                outlineColor={colors.border}
                activeOutlineColor={colors.primaryContainer}
                textColor={colors.label}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
                placeholderTextColor={colors.outlineVariant}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text variant="labelMedium" style={styles.fieldLabel}>
                Email Address
              </Text>
              <TextInput
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                outlineColor={colors.border}
                activeOutlineColor={colors.primaryContainer}
                textColor={colors.label}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
                placeholderTextColor={colors.outlineVariant}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text variant="labelMedium" style={styles.fieldLabel}>
                Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  mode="outlined"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a secure password"
                  secureTextEntry={!showPassword}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primaryContainer}
                  textColor={colors.label}
                  style={[styles.input, styles.passwordInput]}
                  contentStyle={styles.inputContent}
                  outlineStyle={styles.inputOutline}
                  placeholderTextColor={colors.outlineVariant}
                />
                <IconButton
                  icon={showPassword ? "visibility-off" : "visibility"}
                  iconColor={colors.secondary}
                  size={20}
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                />
              </View>
            </View>

            <View style={[styles.fieldContainer, styles.roleSection]}>
              <Text variant="labelMedium" style={styles.fieldLabel}>
                Account Role
              </Text>
              <Text variant="labelSmall" style={styles.roleHint}>
                Choose a customer account for shopping or a seller account for managing products.
              </Text>
              <View style={styles.roleGrid}>
                <TouchableRipple
                  onPress={() => setRole("customer")}
                  style={[
                    styles.roleOption,
                    role === "customer" && styles.roleOptionSelected,
                  ]}
                >
                  <View style={styles.roleContent}>
                    <IconButton
                      icon="shopping"
                      iconColor={role === "customer" ? colors.primaryContainer : colors.secondary}
                      size={24}
                      style={styles.roleIcon}
                    />
                    <Text
                      variant="labelMedium"
                      style={[
                        styles.roleText,
                        role === "customer" && styles.roleTextSelected,
                      ]}
                    >
                      Customer
                    </Text>
                  </View>
                </TouchableRipple>

                <TouchableRipple
                  onPress={() => setRole("seller")}
                  style={[
                    styles.roleOption,
                    role === "seller" && styles.roleOptionSelected,
                  ]}
                >
                  <View style={styles.roleContent}>
                    <IconButton
                      icon="store"
                      iconColor={role === "seller" ? colors.primaryContainer : colors.secondary}
                      size={24}
                      style={styles.roleIcon}
                    />
                    <Text
                      variant="labelMedium"
                      style={[
                        styles.roleText,
                        role === "seller" && styles.roleTextSelected,
                      ]}
                    >
                      Seller
                    </Text>
                  </View>
                </TouchableRipple>
              </View>
            </View>
          </View>

          {message ? (
            <Surface style={styles.noticeSuccess} elevation={0}>
              <Text variant="bodyMedium" style={styles.successText}>
                {message}
              </Text>
            </Surface>
          ) : null}

          {error ? (
            <Surface style={styles.noticeError} elevation={0}>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
            </Surface>
          ) : null}

          <TouchableRipple
            onPress={submit}
            disabled={busy}
            style={styles.submitButton}
          >
            <View style={styles.submitButtonInner}>
              <Text variant="bodyMedium" style={styles.submitText}>
                {busy ? "Creating..." : "Register"}
              </Text>
              <IconButton
                icon="arrow-right"
                iconColor={colors.onPrimaryContainer}
                size={20}
                style={styles.submitIcon}
              />
            </View>
          </TouchableRipple>
        </Surface>

        <View style={styles.footer}>
          <Text variant="labelMedium" style={styles.footerText}>
            Already have an account?{" "}
          </Text>
          <TouchableRipple onPress={navigateToLogin}>
            <Text variant="labelMedium" style={styles.loginLink}>
              Log in
            </Text>
          </TouchableRipple>
        </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: GAP_LG * 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: MARGIN_MOBILE,
  },
  titleSection: {
    marginTop: GAP_MD,
    marginBottom: GAP_LG,
  },
  headline: {
    color: colors.onSurface,
    fontWeight: "300",
    marginBottom: GAP_SM,
  },
  subtitle: {
    color: colors.secondary,
    fontWeight: "300",
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: GAP_MD,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 0,
  },
  formFields: {
    gap: GAP_LG,
  },
  fieldContainer: {
    gap: GAP_SM,
  },
  fieldLabel: {
    color: colors.label,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  inputContent: {
    minHeight: 48,
  },
  inputOutline: {
    borderRadius: 4,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: "absolute",
    right: 0,
    top: 0,
    margin: 0,
  },
  roleSection: {
    marginTop: GAP_SM,
  },
  roleHint: {
    color: colors.secondary,
    marginBottom: GAP_SM,
  },
  roleGrid: {
    flexDirection: "row",
    gap: GAP_SM,
  },
  roleOption: {
    flex: 1,
    padding: GAP_MD,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleOptionSelected: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.surfaceContainerLow,
  },
  roleContent: {
    alignItems: "flex-start",
  },
  roleIcon: {
    margin: 0,
    marginBottom: GAP_SM,
  },
  roleText: {
    color: colors.onSurface,
  },
  roleTextSelected: {
    color: colors.primaryContainer,
  },
  noticeSuccess: {
    marginTop: GAP_MD,
    padding: GAP_SM,
    borderRadius: 4,
    backgroundColor: "rgba(21, 190, 83, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(21, 190, 83, 0.4)",
  },
  successText: {
    color: colors.successText,
  },
  noticeError: {
    marginTop: GAP_MD,
    padding: GAP_SM,
    borderRadius: 4,
    backgroundColor: colors.errorContainer,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
  },
  submitButton: {
    marginTop: GAP_MD,
    borderRadius: 4,
    backgroundColor: colors.primaryContainer,
  },
  submitButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    gap: GAP_SM,
  },
  submitText: {
    color: colors.onPrimaryContainer,
  },
  submitIcon: {
    margin: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: GAP_LG,
  },
  footerText: {
    color: colors.secondary,
  },
  loginLink: {
    color: colors.primaryContainer,
  },
});