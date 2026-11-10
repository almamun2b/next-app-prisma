import { StatusPage } from "@/components/layout/status-page";

export default function Forbidden() {
  return (
    <StatusPage
      code="403"
      title="Access denied"
      description="You don't have permission to view this page. Contact an administrator if you need access."
      action={{ href: "/dashboard", label: "Back to dashboard" }}
    />
  );
}
