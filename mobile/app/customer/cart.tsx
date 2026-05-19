import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { CartItem } from "@/api/types";
import { ActionRow, Button, Card, DividerLine, Hero, Loading, Money, Notice, Panel, ProductImage, Screen, StatusChip, Subtitle } from "@/components/ui";

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch<{ items: CartItem[]; subtotal: number }>("/api/mobile/cart.php");
    setItems(data.items);
    setSubtotal(data.subtotal);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load cart");
        setLoading(false);
      });
    }, [load]),
  );

  async function updateQuantity(item: CartItem, quantity: number) {
    await apiFetch("/api/mobile/cart.php", {
      method: "PATCH",
      body: jsonBody({ cart_item_id: item.cart_item_id, quantity }),
    });
    await load();
  }

  async function remove(item: CartItem) {
    await apiFetch("/api/mobile/cart.php", {
      method: "DELETE",
      body: jsonBody({ cart_item_id: item.cart_item_id }),
    });
    await load();
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Hero title="Cart" subtitle="Review quantities before checkout." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {items.length === 0 ? <Notice message="Your cart is empty." /> : null}
      {items.map((item) => (
        <Card key={item.cart_item_id}>
          <ProductImage uri={item.image_url} />
          <Subtitle>{item.name}</Subtitle>
          <Money value={item.subtotal} />
          <StatusChip tone="info">Quantity: {item.quantity}</StatusChip>
          <ActionRow>
            <Button title="-" variant="secondary" disabled={item.quantity <= 1} onPress={() => updateQuantity(item, item.quantity - 1)} />
            <Button title="+" variant="secondary" disabled={item.quantity >= item.stock} onPress={() => updateQuantity(item, item.quantity + 1)} />
            <Button title="Remove" variant="danger" onPress={() => remove(item)} />
          </ActionRow>
        </Card>
      ))}
      <Panel>
        <Subtitle>Total</Subtitle>
        <DividerLine />
        <Money value={subtotal} />
      </Panel>
      <Button title="Checkout" disabled={items.length === 0} onPress={() => router.push("/customer/checkout")} />
      <Button title="Continue Shopping" variant="secondary" onPress={() => router.push("/customer/shop")} />
    </Screen>
  );
}
