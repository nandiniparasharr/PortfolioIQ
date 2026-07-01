import { redirect } from "next/navigation";

// How it works is now a section on the single-page home. Preserve old links.
export default function HowItWorksPage() {
  redirect("/#how-it-works");
}
