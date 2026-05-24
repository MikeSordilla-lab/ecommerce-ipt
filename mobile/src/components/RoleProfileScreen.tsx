import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";
import { apiFetch, jsonBody } from "@/api/client";
import type { User } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Button, Card, Field, Hero, Notice, Screen, StatusChip } from "@/components/ui";
import { colors } from "@/theme/colors";

type RoleProfileScreenProps = {
  roleTitle: "Seller" | "Admin";
  dashboardRoute: "/seller/dashboard" | "/admin/dashboard";
  bottomNav: React.ReactNode;
};

export function RoleProfileScreen({ roleTitle, dashboardRoute, bottomNav }: RoleProfileScreenProps) {
  const { user, refreshMe, signOut } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
  }, [user?.email, user?.username]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/");
  }, [signOut]);

  async function pickImage() {
    setMessage("");
    setError("");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function uploadImage() {
    if (!image) return;

    setUploading(true);
    setMessage("");
    setError("");

    const body = new FormData();
    body.append("profile_image", {
      uri: image.uri,
      name: image.fileName || "profile.jpg",
      type: image.mimeType || "image/jpeg",
    } as unknown as Blob);

    try {
      await apiFetch<{ user: User }>("/api/mobile/profile.php", { method: "POST", body });
      setImage(null);
      await refreshMe();
      setMessage("Profile photo updated.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not upload profile photo.");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await apiFetch<{ user: User }>("/api/mobile/profile.php", {
        method: "PATCH",
        body: jsonBody({
          username,
          email,
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refreshMe();
      setMessage("Profile updated.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  const avatarUri = image?.uri || user?.profile_image_url || null;

  return (
    <Screen bottomNav={bottomNav}>
      <Hero title={`${roleTitle} Profile`} subtitle="Update account details, photo, and password." />
      {message ? <Notice tone="success" message={message} /> : null}
      {error ? <Notice tone="danger" message={error} /> : null}

      <Card>
        <View style={styles.identity}>
          <Surface style={styles.avatar} elevation={0}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <IconButton icon="account" size={38} iconColor={colors.primaryContainer} style={styles.noMargin} />
            )}
          </Surface>
          <View style={styles.identityText}>
            <Text variant="titleMedium" style={styles.name}>{user?.username ?? roleTitle}</Text>
            <Text variant="bodySmall" style={styles.email}>{user?.email ?? ""}</Text>
            <StatusChip tone={user?.is_approved ? "success" : "warning"}>{user?.role ?? roleTitle.toLowerCase()}</StatusChip>
          </View>
        </View>
        <View style={styles.inlineActions}>
          <Button title="Choose Photo" variant="secondary" icon="image" onPress={pickImage} />
          <Button title={uploading ? "Uploading" : "Upload"} icon="upload" disabled={!image || uploading} onPress={uploadImage} />
        </View>
      </Card>

      <Card>
        <Text variant="titleMedium" style={styles.sectionTitle}>Account Details</Text>
        <Field label="Username" value={username} onChangeText={setUsername} />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      </Card>

      <Card>
        <Text variant="titleMedium" style={styles.sectionTitle}>Password</Text>
        <Field label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <Field label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Field label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <Button title={saving ? "Saving" : "Save Profile"} disabled={saving} icon="content-save" onPress={saveProfile} />
      </Card>

      <View style={styles.inlineActions}>
        <Button title="Dashboard" variant="secondary" icon="view-dashboard" onPress={() => router.push(dashboardRoute)} />
        <Button title="Sign Out" variant="danger" icon="logout" onPress={handleSignOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.border,
    borderRadius: 44,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    overflow: "hidden",
    width: 88,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  identityText: {
    flex: 1,
    gap: 5,
  },
  name: {
    color: colors.text,
    fontWeight: "500",
  },
  email: {
    color: colors.muted,
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "500",
  },
  noMargin: {
    margin: 0,
  },
});
