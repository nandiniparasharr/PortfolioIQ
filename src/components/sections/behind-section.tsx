import { Mail, Linkedin } from "lucide-react";
import { LeaveImprint } from "@/components/imprints/leave-imprint";

const EMAIL = "nandiniiparashar@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/nandiniparashar";
const LINKEDIN_LABEL = "linkedin.com/in/nandiniparashar";

export function BehindSection() {
  return (
    <section id="behind" className="relative scroll-mt-32 border-t border-border/60 py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Desktop: text left, contact cards right. Mobile: stacked. */}
        <div className="lg:grid lg:grid-cols-[1.7fr_1fr] lg:items-start lg:gap-12">
          {/* Text */}
          <div>
            <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
              Behind
            </div>
            <h2 className="font-display mt-1 text-3xl text-foreground lg:text-4xl">PortfolioIQ</h2>

            <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground lg:text-base">
              <p>Hi, I&apos;m Nandini :)</p>
              <p>
                I&apos;ve always been curious about how portfolios work and how studying them can
                help people make better investment decisions. PortfolioIQ started as a side project
                to explore that curiosity and eventually became something I genuinely enjoyed
                building.
              </p>
              <p>
                The goal was simple: combine transparent quantitative models with thoughtful design,
                while using AI to explain insights in plain language rather than replace the analysis
                itself.
              </p>
              <p>
                I&apos;m still working on improving PortfolioIQ, one feature at a time. If you have
                any feedback, ideas, or just want to talk about investing, markets, or building
                interesting products, I&apos;d love to hear from you :)
              </p>
            </div>
          </div>

          {/* Right column: contact cards + leave an imprint */}
          <div className="mt-8 lg:mt-1">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
                <span className="block truncate text-sm font-medium text-foreground">{EMAIL}</span>
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

            {/* Leave an Imprint — below the contact cards (right column on desktop) */}
            <LeaveImprint />
          </div>
        </div>
      </div>
    </section>
  );
}
