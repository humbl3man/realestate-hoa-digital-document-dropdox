import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { getAppUrl } from "@/lib/utils";

export const authClient = createAuthClient({
  baseURL: getAppUrl(),
  plugins: [
    magicLinkClient()
  ]
});
