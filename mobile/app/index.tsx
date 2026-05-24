import { Redirect, router } from "expo-router";
import { StatusBar, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, TouchableRipple } from "react-native-paper";
import { useAuth } from "@/auth/auth-context";
import { colors } from "@/theme/colors";
import { Button, Caption, Hero, Screen } from "@/components/ui";
import { API_BASE_URL, API_CONFIGURATION_ERROR } from "@/api/client";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ActivityIndicator color={colors.primaryContainer} size="large" />
        <Text style={styles.loadingText}>Loading</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const dashboard =
    user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "seller"
        ? "/seller/dashboard"
        : "/customer/shop";

  return (
    <Screen>
      <Hero title="Shop Mobile" subtitle="A compact command center for customers, sellers, and admins." />
      <Text style={styles.username}>{user.username}</Text>
      <Caption>API: {API_CONFIGURATION_ERROR || API_BASE_URL}</Caption>
      <Button title="Open Dashboard" onPress={() => router.push(dashboard)} />
      <Button title="Sign Out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "300",
  },
  username: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "300",
  },
});
