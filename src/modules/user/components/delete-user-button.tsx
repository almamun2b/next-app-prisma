"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useServerAction } from "@/hooks/use-server-action";
import { useAuth } from "@/modules/auth/providers/auth-provider";
import { deleteUserAction } from "../user.actions";

type DeleteUserButtonProps = {
  user: { id: string; name: string; email: string };
  variant?: "icon" | "button";
  /** Navigate here after deletion (e.g. from the detail page). */
  redirectTo?: "/users";
};

/** Destructive action with an explicit confirmation step. */
export function DeleteUserButton({ user, variant = "icon", redirectTo }: DeleteUserButtonProps) {
  const router = useRouter();
  const checkboxId = useId();
  const { user: me } = useAuth();
  const { isOpen, open, close, setIsOpen } = useDisclosure();
  const [confirmed, setConfirmed] = useState(false);
  const { execute, isPending } = useServerAction(deleteUserAction, {
    onSuccess: () => {
      close();
      if (redirectTo) router.push(redirectTo);
    },
  });

  // You cannot delete yourself; keep the column aligned in tables.
  if (me?.id === user.id)
    return variant === "icon" ? <span aria-hidden="true" className="size-9" /> : null;
  const label = `Delete ${user.name}`;

  return (
    <>
      {variant === "icon" ? (
        <Tooltip content="Delete user">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={open}
            className="text-destructive hover:bg-danger-soft hover:text-destructive"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </Tooltip>
      ) : (
        <Button variant="destructive" onClick={open}>
          <Trash2 aria-hidden="true" /> Delete user
        </Button>
      )}
      <Modal
        open={isOpen}
        onOpenChange={(next) => {
          setIsOpen(next);
          if (!next) setConfirmed(false);
        }}
        dismissible={!isPending}
        size="sm"
        title="Delete user?"
        description={`${user.name} (${user.email}) will be permanently removed and signed out.`}
        footer={
          <>
            <Button variant="outline" onClick={close} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={isPending}
              disabled={!confirmed}
              onClick={() => void execute({ id: user.id })}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <Checkbox
          id={checkboxId}
          checked={confirmed}
          onChange={(event) => {
            setConfirmed(event.target.checked);
          }}
          label="I understand this cannot be undone"
          disabled={isPending}
        />
      </Modal>
    </>
  );
}
