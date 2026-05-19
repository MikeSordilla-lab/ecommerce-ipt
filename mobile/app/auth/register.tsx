import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Field, Notice, Screen, Title } from "@/components/ui";
import { useAuth } from "@/auth/auth-context";
import { colors } from "@/theme/colors";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  return (
    <Screen>
      <Title>Create Account</Title>
      <Card>
        <Field label="Username" value={username} onChangeText={setUsername} />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <View style={{ borderColor: colors.border, borderRadius: 8, borderWidth: 1 }}>
          <Picker selectedValue={role} onValueChange={setRole}>
            <Picker.Item label="Customer" value="customer" />
            <Picker.Item label="Seller" value="seller" />
          </Picker>
        </View>
        {message ? <Notice tone="success" message={message} /> : null}
        {error ? <Notice tone="danger" message={error} /> : null}
        <Button title={busy ? "Creating..." : "Register"} disabled={busy} onPress={submit} />
      </Card>
    </Screen>
  );
}
