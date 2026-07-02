import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SettingsForm } from "./settings-form";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings | Dashboard",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <SettingsForm initialName={session.user.name} />
    </div>
  );
}
