// lib/supabase/client.ts
// Browser-side Supabase client (anon key, RLS enforced)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ============================================================
// lib/supabase/server.ts
// Server-side Supabase client (anon key, RLS enforced, uses cookies)
// ============================================================
// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';
//
// export async function createServerClient() {
//   const cookieStore = await cookies();
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return cookieStore.getAll(); },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options)
//           );
//         },
//       },
//     }
//   );
// }

// ============================================================
// lib/supabase/admin.ts
// Service-role client — bypasses RLS. ONLY use in server actions/API routes.
// ============================================================
// import { createClient } from '@supabase/supabase-js';
//
// export function createAdminClient() {
//   return createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     { auth: { persistSession: false } }
//   );
// }
