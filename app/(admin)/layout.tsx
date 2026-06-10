// app/(admin)/layout.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

// ============================================================
// components/admin/AdminSidebar.tsx
// ============================================================

// 'use client';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard, Building2, UserRound, BookOpen,
//   Clock, CheckCircle, XCircle, Users, Trophy, LogOut
// } from 'lucide-react';
// import { createClient } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';
//
// const NAV_ITEMS = [
//   { href: '/admin',              label: 'Dashboard',     icon: LayoutDashboard },
//   { href: '/admin/departments',  label: 'Departments',   icon: Building2 },
//   { href: '/admin/teachers',     label: 'Teachers',      icon: UserRound },
//   { href: '/admin/subjects',     label: 'Subjects',      icon: BookOpen },
//   { href: '/admin/pending',      label: 'Pending',       icon: Clock },
//   { href: '/admin/approved',     label: 'Approved',      icon: CheckCircle },
//   { href: '/admin/rejected',     label: 'Rejected',      icon: XCircle },
//   { href: '/admin/contributors', label: 'Contributors',  icon: Users },
//   { href: '/admin/leaderboard',  label: 'Leaderboard',   icon: Trophy },
// ];
//
// export function AdminSidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const supabase = createClient();
//
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     router.push('/login');
//   };
//
//   return (
//     <aside className="w-64 border-r flex flex-col shrink-0">
//       <div className="p-6 border-b">
//         <h1 className="font-bold text-lg">NTU Archive</h1>
//         <p className="text-xs text-muted-foreground">Admin Panel</p>
//       </div>
//       <nav className="flex-1 p-4 space-y-1">
//         {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
//           const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
//           return (
//             <Link
//               key={href}
//               href={href}
//               className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
//                 active
//                   ? 'bg-primary text-primary-foreground'
//                   : 'text-muted-foreground hover:bg-muted hover:text-foreground'
//               }`}
//             >
//               <Icon className="h-4 w-4 shrink-0" />
//               {label}
//             </Link>
//           );
//         })}
//       </nav>
//       <div className="p-4 border-t">
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
//         >
//           <LogOut className="h-4 w-4" />
//           Sign Out
//         </button>
//       </div>
//     </aside>
//   );
// }
