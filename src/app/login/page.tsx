import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "../login-form";
import { Suspense } from "react";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black text-white p-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
