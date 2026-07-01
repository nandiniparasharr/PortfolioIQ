import { Header } from "./header";
import { ImprintsProvider } from "@/components/imprints/imprints-provider";
import { ImprintField } from "@/components/imprints/imprint-field";

/** Application chrome: a single top header above full-width routed content. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ImprintsProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="relative flex-1">
          {/* The living collection of visitor artifacts, scattered behind/above content. */}
          <ImprintField />
          <main className="relative z-10">{children}</main>
        </div>
      </div>
    </ImprintsProvider>
  );
}
