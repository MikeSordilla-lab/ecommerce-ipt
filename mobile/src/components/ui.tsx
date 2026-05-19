import { Image } from "expo-image";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button as PaperButton,
  Card as PaperCard,
  Chip,
  Divider,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { colors } from "@/theme/colors";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Hero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.hero}>
      <Text selectable variant="headlineLarge" style={styles.heroTitle}>
        {title}
      </Text>
      {subtitle ? (
        <Text selectable variant="bodyLarge" style={styles.heroSubtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <PaperCard mode="elevated" style={styles.card}>
      <PaperCard.Content style={styles.cardContent}>{children}</PaperCard.Content>
    </PaperCard>
  );
}

export function Panel({ children }: { children: React.ReactNode }) {
  return <Surface style={styles.panel}>{children}</Surface>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Text selectable variant="headlineMedium" style={styles.title}>
      {children}
    </Text>
  );
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <Text selectable variant="titleLarge" style={styles.subtitle}>
      {children}
    </Text>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return (
    <Text selectable variant="bodyMedium" style={styles.muted}>
      {children}
    </Text>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Text selectable variant="labelSmall" style={styles.caption}>
      {children}
    </Text>
  );
}

export function Money({ value }: { value: number }) {
  return (
    <Text selectable variant="titleMedium" style={styles.money}>
      PHP {Number(value || 0).toFixed(2)}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const mode = isPrimary ? "contained" : "outlined";

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      buttonColor={isPrimary ? colors.primary : undefined}
      textColor={isDanger ? colors.danger : isPrimary ? "#ffffff" : colors.primary}
      style={[styles.button, isDanger && styles.dangerButton]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {title}
    </PaperButton>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  multiline?: boolean;
}) {
  return (
    <TextInput
      mode="outlined"
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      outlineColor={colors.border}
      activeOutlineColor={colors.primary}
      textColor={colors.text}
      style={[styles.field, multiline && styles.multilineField]}
      outlineStyle={styles.fieldOutline}
    />
  );
}

export function Notice({ message, tone = "muted" }: { message: string; tone?: "muted" | "danger" | "success" }) {
  const toneStyle = tone === "danger" ? styles.noticeDanger : tone === "success" ? styles.noticeSuccess : styles.noticeMuted;
  return (
    <Surface style={[styles.notice, toneStyle]} elevation={0}>
      <Text selectable variant="bodyMedium" style={tone === "danger" ? styles.dangerText : styles.successText}>
        {message}
      </Text>
    </Surface>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Muted>Loading</Muted>
    </View>
  );
}

export function ProductImage({ uri }: { uri?: string | null }) {
  return (
    <Surface style={styles.productImage} elevation={0}>
      {uri ? (
        <Image source={{ uri }} style={styles.productImageAsset} contentFit="cover" />
      ) : (
        <View style={styles.emptyImage}>
          <Caption>No image</Caption>
        </View>
      )}
    </Surface>
  );
}

export function StatusChip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "info";
}) {
  return (
    <Chip
      compact
      style={[
        styles.chip,
        tone === "success" && styles.successChip,
        tone === "danger" && styles.dangerChip,
        tone === "info" && styles.infoChip,
      ]}
      textStyle={[
        styles.chipText,
        tone === "success" && styles.successText,
        tone === "danger" && styles.dangerText,
        tone === "info" && styles.infoText,
      ]}
    >
      {children}
    </Chip>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Surface style={styles.statCard} elevation={1}>
      <Text selectable variant="labelSmall" style={styles.caption}>
        {label}
      </Text>
      <Text selectable variant="headlineSmall" style={styles.statValue}>
        {value}
      </Text>
    </Surface>
  );
}

export function DividerLine() {
  return <Divider style={styles.divider} />;
}

export function ActionRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.actionRow}>{children}</View>;
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

export function PickerShell({ children }: { children: React.ReactNode }) {
  return <Surface style={styles.pickerShell}>{children}</Surface>;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screenContent: {
    gap: 14,
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    gap: 6,
    paddingBottom: 2,
  },
  heroTitle: {
    color: colors.text,
    fontWeight: "300",
    letterSpacing: -0.64,
    lineHeight: 36,
  },
  heroSubtitle: {
    color: colors.muted,
    fontWeight: "300",
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: colors.shadowBlue,
  },
  cardContent: {
    gap: 10,
    padding: 14,
  },
  panel: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  title: {
    color: colors.text,
    fontWeight: "300",
    letterSpacing: -0.64,
  },
  subtitle: {
    color: colors.text,
    fontWeight: "300",
    letterSpacing: -0.22,
  },
  muted: {
    color: colors.muted,
    fontWeight: "300",
    lineHeight: 21,
  },
  caption: {
    color: colors.muted,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  money: {
    color: colors.primary,
    fontVariant: ["tabular-nums"],
    fontWeight: "400",
  },
  button: {
    borderColor: colors.primaryBorder,
    borderRadius: 4,
  },
  dangerButton: {
    borderColor: colors.magentaSoft,
  },
  buttonContent: {
    minHeight: 42,
    paddingHorizontal: 4,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0,
  },
  field: {
    backgroundColor: colors.surface,
  },
  multilineField: {
    minHeight: 94,
  },
  fieldOutline: {
    borderRadius: 4,
  },
  notice: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noticeMuted: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
  },
  noticeDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.magentaSoft,
  },
  noticeSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: "rgba(21, 190, 83, 0.35)",
  },
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  productImage: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 168,
    overflow: "hidden",
  },
  productImageAsset: {
    height: "100%",
    width: "100%",
  },
  emptyImage: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
  },
  successChip: {
    backgroundColor: colors.successSoft,
    borderColor: "rgba(21, 190, 83, 0.35)",
  },
  dangerChip: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.magentaSoft,
  },
  infoChip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  chipText: {
    color: colors.label,
    fontSize: 12,
    letterSpacing: 0,
  },
  successText: {
    color: colors.successText,
  },
  dangerText: {
    color: colors.danger,
  },
  infoText: {
    color: colors.primaryDeep,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    minWidth: "45%",
    padding: 12,
  },
  statValue: {
    color: colors.text,
    fontVariant: ["tabular-nums"],
    fontWeight: "300",
    marginTop: 4,
  },
  divider: {
    backgroundColor: colors.border,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerShell: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    overflow: "hidden",
  },
});
