import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

function getAllCookies() {
  if (typeof document === "undefined") return [];
  if (!document.cookie) return [];

  return document.cookie.split("; ").map((cookie) => {
    const [name, ...rest] = cookie.split("=");
    return { name, value: rest.join("=") };
  });
}

function setAllCookies(cookiesToSet: Array<{
  name: string;
  value: string;
  options?: {
    path?: string;
    maxAge?: number;
    expires?: string | Date;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
  };
}>) {
  if (typeof document === "undefined") return;

  cookiesToSet.forEach(({ name, value, options }) => {
    let cookie = `${name}=${value}`;
    const path = options?.path ?? "/";
    cookie += `; Path=${path}`;

    if (options?.maxAge !== undefined) {
      cookie += `; Max-Age=${options.maxAge}`;
    }
    if (options?.expires) {
      const expires =
        options.expires instanceof Date ? options.expires.toUTCString() : options.expires;
      cookie += `; Expires=${expires}`;
    }
    if (options?.sameSite) {
      cookie += `; SameSite=${options.sameSite}`;
    }
    if (options?.secure) {
      cookie += "; Secure";
    }
    document.cookie = cookie;
  });
}

export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll: getAllCookies,
    setAll: setAllCookies,
  },
});
