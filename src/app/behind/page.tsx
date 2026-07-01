import { redirect } from "next/navigation";

// Behind PortfolioIQ is now a section on the single-page home. Preserve old links.
export default function BehindPage() {
  redirect("/#behind");
}
