import { Redirect, router } from "expo-router";
import { Button, Caption, Card, Hero, Loading, Muted, Screen, StatusChip, Subtitle } from "@/components/ui";
import { API_BASE_URL, API_CONFIGURATION_ERROR } from "@/api/client";
import { useAuth } from "@/auth/auth-context";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <Loading />;
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
      <Card>
        <Subtitle>{user.username}</Subtitle>
        <Muted>{user.email}</Muted>
        <StatusChip tone="info">Role: {user.role}</StatusChip>
        <Caption>API: {API_CONFIGURATION_ERROR || API_BASE_URL}</Caption>
      </Card>
      <Button title="Open Dashboard" onPress={() => router.push(dashboard)} />
      <Button title="Sign Out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
