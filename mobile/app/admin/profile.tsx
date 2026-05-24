import { AdminBottomNav } from "@/components/ui";
import { RoleProfileScreen } from "@/components/RoleProfileScreen";

export default function AdminProfileScreen() {
  return (
    <RoleProfileScreen
      roleTitle="Admin"
      dashboardRoute="/admin/dashboard"
      bottomNav={<AdminBottomNav activeRoute="profile" />}
    />
  );
}
