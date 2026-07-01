import { redirect } from "next/navigation";

// About is now a section on the single-page home. Preserve old links.
export default function AboutPage() {
  redirect("/#about");
}
