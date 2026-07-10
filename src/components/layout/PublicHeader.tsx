import { FileText } from "lucide-react";

export function PublicHeader({
  title = "HOA Document Portal",
}: {
  title?: string;
}) {
  return (
    <header className="w-full py-6 px-4 md:px-8 flex justify-center items-center">
      <div className="flex items-center gap-2 text-slate-900 group">
        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
          <FileText size={24} />
        </div>
        <span className="font-heading font-bold text-xl tracking-tight">
          {title}
        </span>
      </div>
    </header>
  );
}
