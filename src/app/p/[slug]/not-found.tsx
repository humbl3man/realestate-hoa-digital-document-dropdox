
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileQuestion, Search, ArrowLeft } from "lucide-react";
import { appConfig } from "@/config";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-slate-50 text-slate-900 font-sans">
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center pt-10 pb-8 border-b border-slate-100">
            <div className="mx-auto inline-flex items-center justify-center w-16 h-16 bg-slate-50 text-slate-400 rounded-full mb-4 ring-8 ring-slate-50/50">
              <FileQuestion size={32} />
            </div>
            <CardTitle className="text-3xl font-heading font-semibold text-slate-900">
              Portal Not Found
            </CardTitle>
            <CardDescription className="text-slate-500 mt-3 text-base max-w-sm mx-auto leading-relaxed">
              We couldn{"'"}t find the document portal you{"'"}re looking for.
              The link may be broken, or the portal might have been removed.
            </CardDescription>
          </CardHeader>

          <CardContent className="py-8 px-6 sm:px-10 text-center">
            <p className="text-sm text-slate-600 mb-6">
              Please double-check the URL provided to you, or contact the person
              who sent you the link for an updated one.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-500">
                Check the URL for typos
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full py-8 text-center text-slate-400 text-sm">
        <p>
          &copy; {new Date().getFullYear()} {appConfig.name}
        </p>
      </footer>
    </div>
  );
}
