import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { MapPinOff, Home, ArrowLeft } from "lucide-react";
import { appConfig } from "@/config";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/30">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-70" />
      </div>

      <main className="flex-1 relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center justify-center text-center pt-20 pb-32">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-8 ring-8 ring-primary/5 duration-500">
          <MapPinOff size={40} />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight from-foreground mb-6">
          Page Not Found
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed duration-700 delay-150">
          The page you are looking for doesn{"'"}t exist or has been moved. Let
          {"'"}s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center duration-700 delay-300">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 w-full py-8 text-center text-muted-foreground text-sm">
        <p>
          &copy; {new Date().getFullYear()} {appConfig.name}
        </p>
      </footer>
    </div>
  );
}
