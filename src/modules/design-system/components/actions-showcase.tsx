"use client";

import { Plus, Settings, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { useDisclosure } from "@/hooks/use-disclosure";
import { ShowcaseSection } from "./showcase-section";

const VARIANTS = ["primary", "secondary", "outline", "ghost", "destructive", "link"] as const;

export function ActionsShowcase() {
  const modal = useDisclosure();
  const { toast } = useToast();

  return (
    <>
      <ShowcaseSection
        title="Buttons"
        description="Variants, sizes and interaction states (hover, active, focus, loading, disabled)."
      >
        <div className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} className="capitalize">
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add item">
            <Plus aria-hidden="true" />
          </Button>
          <Button loading>Saving…</Button>
          <Button disabled>Disabled</Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Badges & avatars">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success" dot>
            Active
          </Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="danger" dot>
            Inactive
          </Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Avatar name="Ava Thompson" size="sm" />
          <Avatar name="Liam Carter" />
          <Avatar name="Noah Patel" size="lg" labelled />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Overlays"
        description="Tooltip (hover/focus, Esc to dismiss), modal dialog and toast notifications."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip content="Workspace settings">
            <Button variant="outline" size="icon" aria-label="Settings">
              <Settings aria-hidden="true" />
            </Button>
          </Tooltip>
          <Button variant="outline" onClick={modal.open}>
            Open modal
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast({
                title: "Changes saved",
                description: "Your update is live.",
                variant: "success",
              });
            }}
          >
            Success toast
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              toast({ title: "Something went wrong", variant: "error" });
            }}
          >
            Error toast
          </Button>
        </div>
        <Modal
          open={modal.isOpen}
          onOpenChange={modal.setIsOpen}
          title="Archive project?"
          description="Archived projects become read-only. You can restore them later."
          footer={
            <>
              <Button variant="outline" onClick={modal.close}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={modal.close}>
                <Trash2 aria-hidden="true" /> Archive
              </Button>
            </>
          }
        />
      </ShowcaseSection>
    </>
  );
}
