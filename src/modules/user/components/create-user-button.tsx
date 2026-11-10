"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useDisclosure } from "@/hooks/use-disclosure";
import { UserForm } from "./user-form";

export function CreateUserButton() {
  const { isOpen, open, close, setIsOpen } = useDisclosure();
  return (
    <>
      <Button onClick={open}>
        <UserPlus aria-hidden="true" /> New user
      </Button>
      <Modal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Create user"
        description="The user can sign in immediately with the password you set."
        size="lg"
      >
        <UserForm mode="create" onSuccess={close} onCancel={close} />
      </Modal>
    </>
  );
}
