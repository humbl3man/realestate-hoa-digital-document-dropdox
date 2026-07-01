import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const res = NextResponse.redirect(new URL("/", req.url), 302);
    
    // Attempt to use better-auth to sign out and clear cookies
    await auth.api.signOut({
      headers: await headers(),
      asResponse: true,
    }).then((signOutRes) => {
        // If it's a Response object, we can iterate its headers and append them
        if (signOutRes && signOutRes.headers) {
            signOutRes.headers.forEach((value, key) => {
                res.headers.append(key, value);
            });
        }
    }).catch(console.error);

    return res;
  } catch (error) {
    console.error("Logout error", error);
    return NextResponse.redirect(new URL("/", req.url), 302);
  }
}
