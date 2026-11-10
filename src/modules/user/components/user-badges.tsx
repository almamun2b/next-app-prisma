import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/generated/prisma/enums";

export function RoleBadge({ role }: { role: Role }) {
  return role === Role.ADMIN ? (
    <Badge variant="primary">
      <ShieldCheck aria-hidden="true" /> Admin
    </Badge>
  ) : (
    <Badge variant="neutral">User</Badge>
  );
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "danger"} dot>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
