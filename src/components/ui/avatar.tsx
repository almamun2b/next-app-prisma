import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import Image from "next/image";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-semibold text-secondary-foreground select-none",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-14 text-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const PIXELS = { sm: 32, md: 40, lg: 56 } as const;

type AvatarProps = VariantProps<typeof avatarVariants> & {
  name: string;
  src?: string | null | undefined;
  className?: string;
  /** Set when the avatar is the only content of a control (adds an accessible name). */
  labelled?: boolean;
};

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** User avatar: optimized `next/image` when a picture exists, initials otherwise. */
export function Avatar({ name, src, size, className, labelled = false }: AvatarProps) {
  const px = PIXELS[size ?? "md"];
  return (
    <span
      className={cn(avatarVariants({ size }), className)}
      {...(labelled ? { role: "img", "aria-label": name } : { "aria-hidden": true })}
    >
      {src ? (
        <Image src={src} alt="" width={px} height={px} className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
