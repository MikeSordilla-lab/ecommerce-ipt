import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import type { Address } from "@/api/types";
import { Button, Card, Field, Hero, Loading, Muted, Notice, Screen, StatusChip, Subtitle } from "@/components/ui";

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch<{ addresses: Address[] }>("/api/mobile/addresses.php");
    setAddresses(data.addresses);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => {
        setMessage(error instanceof Error ? error.message : "Could not load addresses");
        setLoading(false);
      });
    }, [load]),
  );

  async function save() {
    await apiFetch("/api/mobile/addresses.php", {
      method: "POST",
      body: jsonBody({ full_name: fullName, phone, address, is_default: addresses.length === 0 }),
    });
    setFullName("");
    setPhone("");
    setAddress("");
    await load();
  }

  async function setDefault(addressId: number) {
    await apiFetch("/api/mobile/addresses.php", {
      method: "PATCH",
      body: jsonBody({ address_id: addressId }),
    });
    await load();
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Screen>
      <Hero title="Addresses" subtitle="Keep delivery details ready for faster checkout." />
      {message ? <Notice tone="danger" message={message} /> : null}
      {addresses.map((item) => (
        <Card key={item.id}>
          <Subtitle>{item.full_name}</Subtitle>
          <Muted>{item.phone}</Muted>
          <Muted>{item.address}</Muted>
          {item.is_default ? <StatusChip tone="success">Default</StatusChip> : null}
          <Button title={item.is_default ? "Default" : "Set Default"} disabled={item.is_default} onPress={() => setDefault(item.id)} />
        </Card>
      ))}
      <Card>
        <Subtitle>Add Address</Subtitle>
        <Field label="Full Name" value={fullName} onChangeText={setFullName} />
        <Field label="Phone" value={phone} onChangeText={setPhone} />
        <Field label="Address" value={address} onChangeText={setAddress} multiline />
        <Button title="Save Address" onPress={save} />
      </Card>
    </Screen>
  );
}
