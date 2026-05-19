import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { apiFetch, jsonBody } from "@/api/client";
import type { User } from "@/api/types";
import { Button, Card, Loading, Muted, Screen, Subtitle, Title } from "@/components/ui";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch<{ users: User[] }>("/api/mobile/admin/users.php");
    setUsers(data.users);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load users");
        setLoading(false);
      });
    }, [load]),
  );

  async function action(body: Record<string, unknown>) {
    await apiFetch("/api/mobile/admin/users.php", { method: "PATCH", body: jsonBody(body) });
    await load();
  }

  async function remove(userId: number) {
    await apiFetch("/api/mobile/admin/users.php", { method: "DELETE", body: jsonBody({ user_id: userId }) });
    await load();
  }

  if (loading) return <Loading />;

  return (
    <Screen>
      <Title>Users</Title>
      {message ? <Muted>{message}</Muted> : null}
      {users.map((user) => (
        <Card key={user.id}>
          <Subtitle>{user.username}</Subtitle>
          <Muted>{user.email}</Muted>
          <Muted>{user.role} · {user.is_approved ? "Approved" : "Pending"}</Muted>
          {user.role === "seller" && !user.is_approved ? (
            <Button title="Approve Seller" onPress={() => action({ user_id: user.id, approve: true })} />
          ) : null}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title="Customer" variant="secondary" onPress={() => action({ user_id: user.id, role: "customer" })} />
            <Button title="Seller" variant="secondary" onPress={() => action({ user_id: user.id, role: "seller" })} />
          </View>
          <Button title="Delete" variant="danger" onPress={() => remove(user.id)} />
        </Card>
      ))}
    </Screen>
  );
}
