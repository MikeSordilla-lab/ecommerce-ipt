import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { Address, CartItem } from "@/api/types";
import { Button, Card, Field, Loading, Money, Muted, Screen, Subtitle, Title } from "@/components/ui";

export default function CheckoutScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [cart, saved] = await Promise.all([
      apiFetch<{ items: CartItem[]; subtotal: number }>("/api/mobile/cart.php"),
      apiFetch<{ addresses: Address[] }>("/api/mobile/addresses.php"),
    ]);
    setItems(cart.items);
    setSubtotal(cart.subtotal);
    setAddresses(saved.addresses);
    const defaultAddress = saved.addresses.find((item) => item.is_default) || saved.addresses[0];
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load checkout");
        setLoading(false);
      });
    }, [load]),
  );

  async function placeOrder() {
    setMessage("");
    try {
      const body = selectedAddressId
        ? { address_id: selectedAddressId, notes }
        : { full_name: fullName, phone, address, notes, save_address: true };
      await apiFetch("/api/mobile/orders.php", {
        method: "POST",
        body: jsonBody(body),
      });
      router.replace("/customer/orders");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not place order");
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Title>Checkout</Title>
      {message ? <Muted>{message}</Muted> : null}
      <Card>
        <Subtitle>Order Summary</Subtitle>
        {items.map((item) => (
          <Muted key={item.cart_item_id}>
            {item.name} x{item.quantity}
          </Muted>
        ))}
        <Money value={subtotal} />
        <Muted>Payment: Cash on Delivery</Muted>
      </Card>
      {addresses.length > 0 ? (
        <Card>
          <Subtitle>Saved Addresses</Subtitle>
          {addresses.map((item) => (
            <Button
              key={item.id}
              title={`${selectedAddressId === item.id ? "Selected: " : ""}${item.full_name}`}
              variant={selectedAddressId === item.id ? "primary" : "secondary"}
              onPress={() => setSelectedAddressId(item.id)}
            />
          ))}
          <Button title="Use New Address" variant="secondary" onPress={() => setSelectedAddressId(null)} />
        </Card>
      ) : null}
      {!selectedAddressId ? (
        <Card>
          <Subtitle>New Address</Subtitle>
          <Field label="Full Name" value={fullName} onChangeText={setFullName} />
          <Field label="Phone" value={phone} onChangeText={setPhone} />
          <Field label="Address" value={address} onChangeText={setAddress} multiline />
        </Card>
      ) : null}
      <Card>
        <Subtitle>Notes</Subtitle>
        <Field label="Optional notes" value={notes} onChangeText={setNotes} multiline />
      </Card>
      <Button title="Place COD Order" disabled={items.length === 0} onPress={placeOrder} />
    </Screen>
  );
}
