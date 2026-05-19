import { Link, router } from "expo-router";
import { useState } from "react";
import { Button, Card, Field, Muted, Notice, Screen, Title } from "@/components/ui";
import { API_BASE_URL } from "@/api/client";
import { useAuth } from "@/auth/auth-context";

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
    <Screen>
      <Title>Welcome Back</Title>
      <Muted>Connected to {API_BASE_URL}</Muted>
      <Card>
        <Field label="Username" value={username} onChangeText={setUsername} />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Notice tone="danger" message={error} /> : null}
        <Button title={busy ? "Signing in..." : "Sign In"} disabled={busy} onPress={submit} />
      </Card>
      <Link href="/auth/register">Create an account</Link>
    </Screen>
  );
}
