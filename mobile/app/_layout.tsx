import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/auth/auth-context";
import { appPaperTheme, colors } from "@/theme/colors";

export default function RootLayout() {
  return (
    <PaperProvider theme={appPaperTheme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: "300" },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Shop Mobile" }} />
          <Stack.Screen name="auth/login" options={{ title: "Sign In" }} />
          <Stack.Screen name="auth/register" options={{ title: "Register" }} />
          <Stack.Screen name="customer/shop" options={{ title: "Shop" }} />
          <Stack.Screen name="customer/product" options={{ title: "Product" }} />
          <Stack.Screen name="customer/cart" options={{ title: "Cart" }} />
          <Stack.Screen name="customer/checkout" options={{ title: "Checkout" }} />
          <Stack.Screen name="customer/addresses" options={{ title: "Addresses" }} />
          <Stack.Screen name="customer/orders" options={{ title: "My Orders" }} />
          <Stack.Screen name="seller/dashboard" options={{ title: "Seller" }} />
          <Stack.Screen name="seller/products" options={{ title: "My Products" }} />
          <Stack.Screen name="seller/product-form" options={{ title: "Product Form" }} />
          <Stack.Screen name="seller/orders" options={{ title: "Seller Orders" }} />
          <Stack.Screen name="admin/dashboard" options={{ title: "Admin" }} />
          <Stack.Screen name="admin/users" options={{ title: "Users" }} />
          <Stack.Screen name="admin/products" options={{ title: "Products" }} />
          <Stack.Screen name="admin/orders" options={{ title: "Orders" }} />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
