import { StatusPage } from "@/components/layout/status-page";

export default function Unauthorized() {
  return (
    <StatusPage
      code="401"
      title="Sign in required"
      description="Please sign in to continue."
      action={{ href: "/login", label: "Sign in" }}
    />
  );
}
