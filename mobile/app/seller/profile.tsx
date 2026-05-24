import { RoleProfileScreen } from "@/components/RoleProfileScreen";
import { SellerBottomNav } from "@/components/ui";

export default function SellerProfileScreen() {
  return (
    <RoleProfileScreen
      roleTitle="Seller"
      dashboardRoute="/seller/dashboard"
      bottomNav={<SellerBottomNav activeRoute="profile" />}
    />
  );
}
