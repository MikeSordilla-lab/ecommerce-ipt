import { router } from "expo-router";
import { Image } from "expo-image";
import React from "react";
import { Platform, ScrollView, StatusBar, StyleSheet, View, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Button as PaperButton,
  Card as PaperCard,
  Chip,
  Divider,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  IconButton,
  Badge,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

const MARGIN_MOBILE = 20;
const RADIUS_SM = 4;
const RADIUS_MD = 6;
const RADIUS_LG = 8;

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={styles.screenWrapper} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.screen}
        contentContainerStyle={[styles.screenContent, style]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SafeScreen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.safeScreen, style]}>
      {children}
    </View>
  );
}

export function Hero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.hero}>
      <Text variant="headlineLarge" style={styles.heroTitle}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyLarge" style={styles.heroSubtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <PaperCard mode="elevated" style={[styles.card, style]}>
      <PaperCard.Content style={styles.cardContent}>{children}</PaperCard.Content>
    </PaperCard>
  );
}

export function ProductCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <Surface style={[styles.productCard, style]} elevation={0}>
      {children}
    </Surface>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <Surface style={[styles.panel, style]} elevation={0}>{children}</Surface>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="headlineMedium" style={styles.title}>
      {children}
    </Text>
  );
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="titleLarge" style={styles.subtitle}>
      {children}
    </Text>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="bodyMedium" style={styles.muted}>
      {children}
    </Text>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="labelSmall" style={styles.caption}>
      {children}
    </Text>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="labelMedium" style={styles.label}>
      {children}
    </Text>
  );
}

export function Money({ value, size = "medium" }: { value: number; size?: "small" | "medium" | "large" }) {
  const sizeStyle = size === "small" ? styles.moneySmall : size === "large" ? styles.moneyLarge : styles.money;
  return (
    <Text variant={size === "small" ? "labelMedium" : size === "large" ? "headlineSmall" : "titleMedium"} style={[styles.money, sizeStyle]}>
      ${Number(value || 0).toFixed(2)}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  icon,
  fullWidth = false,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
}) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";

  if (isGhost) {
    return (
      <PaperButton
        mode="text"
        onPress={onPress}
        disabled={disabled}
        textColor={colors.secondary}
        style={[styles.ghostButton, fullWidth && styles.fullWidth, style]}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        icon={icon}
      >
        {title}
      </PaperButton>
    );
  }

  return (
    <PaperButton
      mode={isPrimary ? "contained" : "outlined"}
      onPress={onPress}
      disabled={disabled}
      buttonColor={isPrimary ? colors.primaryContainer : undefined}
      textColor={isDanger ? colors.error : isPrimary ? colors.onPrimaryContainer : colors.primaryContainer}
      style={[
        styles.button,
        !isPrimary && styles.secondaryButton,
        isDanger && styles.dangerButton,
        fullWidth && styles.fullWidth,
        style,
      ]}
      contentStyle={styles.buttonContent}
      labelStyle={[styles.buttonLabel, !isPrimary && styles.secondaryButtonLabel]}
      icon={icon}
    >
      {title}
    </PaperButton>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
}) {
  return (
    <PaperButton
      mode="contained"
      onPress={onPress}
      disabled={disabled}
      buttonColor={colors.primaryContainer}
      textColor={colors.onPrimaryContainer}
      style={[styles.primaryButton, fullWidth && styles.fullWidth, style]}
      contentStyle={styles.primaryButtonContent}
      labelStyle={styles.primaryButtonLabel}
      icon={icon}
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
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  multiline?: boolean;
  error?: string;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text variant="labelMedium" style={styles.fieldLabel}>{label}</Text>
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        outlineColor={colors.border}
        activeOutlineColor={colors.primaryContainer}
        textColor={colors.text}
        style={[styles.field, multiline && styles.multilineField]}
        contentStyle={styles.fieldInput}
        error={!!error}
      />
      {error && <Text variant="labelSmall" style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

export function Notice({
  message,
  tone = "muted",
  icon,
}: {
  message: string;
  tone?: "muted" | "danger" | "success" | "info";
  icon?: string;
}) {
  const toneStyle =
    tone === "danger" ? styles.noticeDanger
    : tone === "success" ? styles.noticeSuccess
    : tone === "info" ? styles.noticeInfo
    : styles.noticeMuted;

  const toneTextStyle =
    tone === "danger" ? styles.dangerText
    : tone === "success" ? styles.successText
    : tone === "info" ? styles.infoText
    : styles.mutedText;

  return (
    <Surface style={[styles.notice, toneStyle]} elevation={0}>
      <View style={styles.noticeContent}>
        {icon && <IconButton icon={icon} size={18} iconColor={colors.muted} style={styles.noticeIcon} />}
        <Text variant="bodyMedium" style={[styles.noticeText, toneTextStyle]}>
          {message}
        </Text>
      </View>
    </Surface>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primaryContainer} size="large" />
      <Muted>Loading</Muted>
    </View>
  );
}

export function ProductImage({
  uri,
  size = "medium",
  style,
}: {
  uri?: string | null;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}) {
  const sizeStyle =
    size === "small" ? styles.productImageSmall
    : size === "large" ? styles.productImageLarge
    : styles.productImage;

  return (
    <Surface style={[styles.productImageContainer, sizeStyle, style]} elevation={0}>
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
  tone?: "neutral" | "success" | "danger" | "info" | "warning";
}) {
  return (
    <Chip
      compact
      mode="flat"
      style={[
        styles.chip,
        tone === "success" && styles.successChip,
        tone === "danger" && styles.dangerChip,
        tone === "info" && styles.infoChip,
        tone === "warning" && styles.warningChip,
      ]}
      textStyle={[
        styles.chipText,
        tone === "success" && styles.successText,
        tone === "danger" && styles.dangerText,
        tone === "info" && styles.infoText,
        tone === "warning" && styles.warningText,
      ]}
    >
      {children}
    </Chip>
  );
}

export function BadgeChip({
  children,
  tone = "success",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger";
}) {
  const bgColor = tone === "success" ? "rgba(21, 190, 83, 0.2)"
    : tone === "warning" ? "rgba(155, 104, 41, 0.1)"
    : "rgba(186, 26, 26, 0.1)";
  const borderColor = tone === "success" ? "rgba(21, 190, 83, 0.4)"
    : tone === "warning" ? "rgba(155, 104, 41, 0.3)"
    : "rgba(186, 26, 26, 0.3)";
  const textColor = tone === "success" ? colors.successText
    : tone === "warning" ? colors.warning
    : colors.error;

  return (
    <View style={[styles.badgeChip, { backgroundColor: bgColor, borderColor }]}>
      <Text variant="labelSmall" style={[styles.badgeChipText, { color: textColor }]}>
        {children}
      </Text>
    </View>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <Surface style={styles.statCard} elevation={0}>
      <View style={styles.statCardHeader}>
        {icon && <IconButton icon={icon} size={16} iconColor={colors.muted} style={styles.statIcon} />}
        <Caption>{label}</Caption>
      </View>
      <Text variant="headlineSmall" style={styles.statValue}>
        {value}
      </Text>
    </Surface>
  );
}

export function DividerLine() {
  return <Divider style={styles.divider} />;
}

export function ActionRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.actionRow, style]}>{children}</View>;
}

export function ChipRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.chipRow, style]}>{children}</View>;
}

export function PickerShell({ children }: { children: React.ReactNode }) {
  return <Surface style={styles.pickerShell} elevation={0}>{children}</Surface>;
}

export function BottomNavItem({
  icon,
  label,
  active = false,
  onPress,
  badge,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <TouchableRipple onPress={onPress} style={styles.navItem}>
      <View style={styles.navItemInner}>
        <View style={styles.navIconContainer}>
          <IconButton
            icon={icon}
            iconColor={active ? colors.primaryContainer : colors.muted}
            size={22}
            style={active ? styles.navIconActive : undefined}
          />
          {badge !== undefined && badge > 0 && (
            <Badge size={8} style={styles.navBadge} />
          )}
        </View>
        <Text
          variant="labelSmall"
          style={[
            styles.navLabel,
            { color: active ? colors.primaryContainer : colors.muted },
            active && styles.navLabelActive,
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

export function TopBar({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
}: {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}) {
  return (
    <Surface style={styles.topBar} elevation={0}>
      <View style={styles.topBarLeft}>
        {leftIcon && (
          <TouchableRipple onPress={onLeftPress} style={styles.topBarAvatar}>
            <IconButton icon={leftIcon} iconColor={colors.secondary} size={20} />
          </TouchableRipple>
        )}
      </View>
      <View style={styles.topBarCenter}>
        <Text variant="titleLarge" style={styles.topBarTitle}>{title}</Text>
        {subtitle && <Text variant="bodySmall" style={styles.topBarSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.topBarRight}>
        {rightIcon && (
          <TouchableRipple onPress={onRightPress} style={styles.topBarIconBtn}>
            <IconButton icon={rightIcon} iconColor={colors.primaryContainer} size={20} />
          </TouchableRipple>
        )}
      </View>
    </Surface>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onSubmit,
  icon = "magnify",
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  icon?: string;
}) {
  return (
    <Surface style={styles.searchBarContainer} elevation={0}>
      <IconButton icon={icon} iconColor={colors.muted} size={20} style={styles.searchIcon} />
      <TextInput
        mode="flat"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onSubmitEditing={onSubmit}
        style={styles.searchInput}
        contentStyle={styles.searchInputContent}
        underlineColor="transparent"
        activeUnderlineColor="transparent"
      />
    </Surface>
  );
}

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
}) {
  return (
    <Surface style={styles.quantityStepper} elevation={0}>
      <TouchableRipple
        onPress={onDecrease}
        disabled={value <= min}
        style={styles.stepperButton}
      >
        <IconButton
          icon="remove"
          iconColor={value <= min ? colors.outline : colors.secondary}
          size={18}
        />
      </TouchableRipple>
      <Text variant="labelLarge" style={styles.stepperValue}>{value}</Text>
      <TouchableRipple
        onPress={onIncrease}
        disabled={value >= max}
        style={styles.stepperButton}
      >
        <IconButton
          icon="add"
          iconColor={value >= max ? colors.outline : colors.secondary}
          size={18}
        />
      </TouchableRipple>
    </Surface>
  );
}

const NAV_ITEMS = [
  { key: "shop", label: "Shop", icon: "storefront" },
  { key: "cart", label: "Cart", icon: "cart" },
  { key: "orders", label: "Orders", icon: "package" },
  { key: "profile", label: "Profile", icon: "account" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

export function CustomerBottomNav({
  activeRoute,
  cartCount = 0,
}: {
  activeRoute: NavKey;
  cartCount?: number;
}) {
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeRoute === item.key;
        return (
          <TouchableRipple
            key={item.key}
            onPress={() => {
              if (item.key !== activeRoute) {
                const routes: Record<string, string> = {
                  shop: "/customer/shop",
                  cart: "/customer/cart",
                  orders: "/customer/orders",
                  profile: "/customer/profile",
                };
                router.push(routes[item.key] as any);
              }
            }}
            style={styles.navItem}
          >
            <View style={styles.navItemInner}>
              {item.key === "cart" && cartCount > 0 ? (
                <View style={styles.navCartWrap}>
                  <IconButton
                    icon={item.icon}
                    iconColor={isActive ? colors.primaryContainer : colors.muted}
                    size={22}
                    style={[styles.navIconNoMargin, isActive && styles.navIconActive]}
                  />
                  <View style={styles.navDot} />
                </View>
              ) : (
                <IconButton
                  icon={item.icon}
                  iconColor={isActive ? colors.primaryContainer : colors.muted}
                  size={22}
                  style={[styles.navIconNoMargin, isActive && styles.navIconActive]}
                />
              )}
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? colors.primaryContainer : colors.muted },
                  isActive && styles.navLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

export function ScreenWrapper({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={[styles.screenWrapper, style]} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {children}
    </SafeAreaView>
  );
}

export function AppBar({
  title,
  leftIcon = "arrow-left",
  onLeftPress,
  rightIcon,
  onRightPress,
}: {
  title: string;
  leftIcon?: string;
  onLeftPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}) {
  return (
    <View style={styles.appBar}>
      <TouchableRipple
        style={styles.appBarBtn}
        onPress={onLeftPress || (() => router.back())}
      >
        <IconButton icon={leftIcon} iconColor={colors.primaryContainer} size={20} style={styles.appBarIconNoMargin} />
      </TouchableRipple>
      <Text style={styles.appBarTitle}>{title}</Text>
      <View style={styles.appBarRight}>
        {rightIcon ? (
          <TouchableRipple style={styles.appBarBtn} onPress={onRightPress}>
            <IconButton icon={rightIcon} iconColor={colors.primaryContainer} size={20} style={styles.appBarIconNoMargin} />
          </TouchableRipple>
        ) : <View style={styles.appBarBtn} />}
      </View>
    </View>
  );
}

export function OrderSummaryItem({
  label,
  value,
  highlight = false,
  free = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  free?: boolean;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text variant="bodyMedium" style={styles.summaryLabel}>{label}</Text>
      {free ? (
        <View style={styles.freeShipping}>
          <IconButton icon="local-shipping" size={14} iconColor={colors.successText} style={styles.freeIcon} />
          <Text variant="labelMedium" style={styles.freeText}>Free</Text>
        </View>
      ) : (
        <Text
          variant={highlight ? "titleMedium" : "labelMedium"}
          style={[
            styles.summaryValue,
            highlight && styles.summaryValueHighlight,
          ]}
        >
          {typeof value === "number" ? `$${value.toFixed(2)}` : value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },

  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appBarTitle: {
    color: colors.primaryContainer,
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: -0.22,
    flex: 1,
    textAlign: "center",
  },
  appBarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  appBarRight: {
    width: 38,
    alignItems: "flex-end",
  },
  appBarIconNoMargin: { margin: 0 },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: Platform.OS === "android" ? 0 : 8,
    shadowColor: colors.shadowSoft,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  navCartWrap: { position: "relative" },
  navDot: {
    position: "absolute",
    top: 4,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  navIconNoMargin: { margin: 0 },

  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screenContent: {
    gap: 16,
    paddingHorizontal: MARGIN_MOBILE,
    paddingTop: 16,
    paddingBottom: 100,
  },
  safeScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    gap: 4,
  },
  heroTitle: {
    color: colors.text,
    fontWeight: "300",
  },
  heroSubtitle: {
    color: colors.muted,
    fontWeight: "300",
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.border,
    borderRadius: RADIUS_MD,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardContent: {
    gap: 12,
    padding: 16,
  },
  productCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.border,
    borderRadius: RADIUS_MD,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 0,
  },
  panel: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.border,
    borderRadius: RADIUS_MD,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontWeight: "300",
  },
  subtitle: {
    color: colors.text,
    fontWeight: "300",
  },
  muted: {
    color: colors.muted,
    fontWeight: "300",
  },
  mutedText: {
    color: colors.muted,
  },
  caption: {
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  label: {
    color: colors.label,
  },
  money: {
    color: colors.primaryContainer,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  moneySmall: {
    fontSize: 14,
  },
  moneyLarge: {
    fontSize: 22,
  },
  button: {
    borderRadius: RADIUS_SM,
    borderColor: colors.primaryContainer,
  },
  primaryButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: RADIUS_SM,
  },
  primaryButtonContent: {
    minHeight: 48,
  },
  primaryButtonLabel: {
    color: colors.onPrimaryContainer,
    fontWeight: "400",
    fontSize: 14,
  },
  secondaryButton: {
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  secondaryButtonLabel: {
    color: colors.primaryContainer,
  },
  dangerButton: {
    borderColor: colors.error,
  },
  ghostButton: {
    borderRadius: RADIUS_SM,
  },
  buttonContent: {
    minHeight: 42,
    paddingHorizontal: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "400",
  },
  fullWidth: {
    width: "100%",
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.label,
    marginBottom: 4,
  },
  field: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: RADIUS_SM,
  },
  fieldInput: {
    minHeight: 48,
  },
  multilineField: {
    minHeight: 100,
  },
  fieldError: {
    color: colors.error,
    marginTop: 4,
  },
  notice: {
    borderRadius: RADIUS_SM,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  noticeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noticeIcon: {
    margin: 0,
  },
  noticeText: {
    flex: 1,
  },
  noticeMuted: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.border,
  },
  noticeDanger: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  noticeSuccess: {
    backgroundColor: "rgba(21, 190, 83, 0.16)",
    borderColor: "rgba(21, 190, 83, 0.4)",
  },
  noticeInfo: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  productImageContainer: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.border,
    borderRadius: RADIUS_SM,
    borderWidth: 1,
    overflow: "hidden",
  },
  productImageSmall: {
    height: 64,
    width: 64,
  },
  productImage: {
    height: 120,
  },
  productImageLarge: {
    height: 200,
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
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: RADIUS_SM,
    height: 28,
  },
  successChip: {
    backgroundColor: "rgba(21, 190, 83, 0.16)",
  },
  dangerChip: {
    backgroundColor: colors.errorContainer,
  },
  infoChip: {
    backgroundColor: colors.secondaryContainer,
  },
  warningChip: {
    backgroundColor: "rgba(155, 104, 41, 0.1)",
  },
  chipText: {
    color: colors.label,
    fontSize: 12,
  },
  successText: {
    color: colors.successText,
  },
  dangerText: {
    color: colors.error,
  },
  infoText: {
    color: colors.secondary,
  },
  warningText: {
    color: colors.warning,
  },
  badgeChip: {
    borderRadius: RADIUS_SM,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeChipText: {
    fontSize: 12,
  },
  statCard: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.border,
    borderRadius: RADIUS_LG,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowColor: colors.shadowAmbient,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 0,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    margin: 0,
  },
  statValue: {
    color: colors.text,
    fontVariant: ["tabular-nums"],
    fontWeight: "300",
  },
  divider: {
    backgroundColor: colors.border,
    marginVertical: 8,
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
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.border,
    borderRadius: RADIUS_SM,
    borderWidth: 1,
    overflow: "hidden",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navItemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  navIconContainer: {
    position: "relative",
  },
  navIconActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primaryContainer,
    marginTop: -2,
  },
  navBadge: {
    position: "absolute",
    top: 4,
    right: -4,
    backgroundColor: colors.error,
  },
  navLabel: {
    marginTop: -4,
    fontSize: 12,
  },
  navLabelActive: {
    fontWeight: "500",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MARGIN_MOBILE,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarLeft: {
    width: 40,
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  topBarRight: {
    width: 40,
    alignItems: "flex-end",
  },
  topBarTitle: {
    color: colors.primaryContainer,
    fontWeight: "600",
    fontSize: 18,
  },
  topBarSubtitle: {
    color: colors.muted,
  },
  topBarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarIconBtn: {
    borderRadius: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: RADIUS_SM,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
  },
  searchIcon: {
    margin: 0,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
  },
  searchInputContent: {
    minHeight: 40,
  },
  quantityStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: RADIUS_SM,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperButton: {
    margin: 0,
  },
  stepperValue: {
    minWidth: 32,
    textAlign: "center",
    color: colors.label,
    fontVariant: ["tabular-nums"],
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: colors.muted,
  },
  summaryValue: {
    color: colors.label,
    fontVariant: ["tabular-nums"],
  },
  summaryValueHighlight: {
    color: colors.primaryContainer,
    fontWeight: "500",
  },
  freeShipping: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  freeIcon: {
    margin: 0,
    marginLeft: -8,
  },
  freeText: {
    color: colors.successText,
  },
});