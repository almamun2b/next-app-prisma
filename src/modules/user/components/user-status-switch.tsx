"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/modules/auth/providers/auth-provider";
import { setUserStatusAction } from "../user.actions";

/** Inline activate/deactivate toggle with optimistic UI and rollback on error. */
export function UserStatusSwitch({
  user,
}: {
  user: { id: string; name: string; isActive: boolean };
}) {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(user.isActive);

  return (
    <Switch
      size="sm"
      checked={optimistic}
      disabled={isPending || me?.id === user.id}
      aria-label={`Active status for ${user.name}`}
      onCheckedChange={(next) => {
        startTransition(async () => {
          setOptimistic(next);
          const result = await setUserStatusAction({ id: user.id, isActive: next });
          if (result.ok) {
            toast({
              title: `${user.name} ${next ? "activated" : "deactivated"}`,
              variant: "success",
            });
          } else {
            toast({ title: result.error.message, variant: "error" });
          }
        });
      }}
    />
  );
}
