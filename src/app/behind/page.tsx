import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Behind PortfolioIQ",
  description:
    "The story behind PortfolioIQ — a side project by Nandini exploring how transparent quantitative models and thoughtful design can help investors understand their portfolios.",
};

const EMAIL = "nandiniiparashar@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/nandiniparashar";
const LINKEDIN_LABEL = "linkedin.com/in/nandiniparashar";

export default function BehindPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 grid-texture" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-6 py-12 lg:py-16">
        <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
          Behind PortfolioIQ
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          Hi, I&apos;m Nandini :)
        </h1>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground lg:text-base">
          <p>
            I&apos;ve always been curious about how portfolios work and how studying them can
            help people make better investment decisions. PortfolioIQ started as a side
            project to explore that curiosity and eventually became a product I genuinely
            enjoyed building.
          </p>
          <p>
            The goal was simple: combine transparent quantitative models with thoughtful
            design, while using AI to explain insights in plain language rather than replace
            the analysis itself.
          </p>
          <p>
            I&apos;m still working on improving PortfolioIQ, one feature at a time. If you have
            any feedback, ideas, or just want to talk about investing, markets, or building
            interesting products, I&apos;d love to hear from you :)
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${EMAIL}`}
            className="glass glass-hover flex items-center gap-3 rounded-xl p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <span className="block truncate text-sm font-medium text-foreground">
                {EMAIL}
              </span>
            </span>
          </a>

          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-hover flex items-center gap-3 rounded-xl p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Linkedin className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                LinkedIn
              </span>
              <span className="block truncate text-sm font-medium text-foreground">
                {LINKEDIN_LABEL}
              </span>
            </span>
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/portfolio">
              Analyze your portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">About PortfolioIQ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
