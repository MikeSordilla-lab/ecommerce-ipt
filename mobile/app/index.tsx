import { Redirect, router } from "expo-router";
import { Button, Card, Loading, Muted, Screen, Subtitle, Title } from "@/components/ui";
import { API_BASE_URL } from "@/api/client";
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
      <Title>Shop Mobile</Title>
      <Card>
        <Subtitle>{user.username}</Subtitle>
        <Muted>{user.email}</Muted>
        <Muted>Role: {user.role}</Muted>
        <Muted>API: {API_BASE_URL}</Muted>
      </Card>
      <Button title="Open Dashboard" onPress={() => router.push(dashboard)} />
      <Button title="Sign Out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
