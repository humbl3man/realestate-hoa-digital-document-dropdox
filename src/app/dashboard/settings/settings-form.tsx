"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SettingsForm({ initialName }: { initialName: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await updateProfile(formData);
    setIsPending(false);

    if (result.error) {
      toast.error("Error", {
        description: result.error,
      });
    } else {
      toast.success("Success", {
        description: "Your profile has been updated.",
      });
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h2 className="text-lg font-medium">Profile Information</h2>
        <p className="text-sm text-muted-foreground">
          Update your personal account details.
        </p>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialName}
            placeholder="Jane Doe"
            required
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
