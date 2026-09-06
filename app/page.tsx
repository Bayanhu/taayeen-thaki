import Dashboard from "./dashboard-client";
import LoginForm from "./login-form";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { UserRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export default async function Home() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <LoginForm/>;
  const { data } = await supabase.from("profiles").select("id,name,email,role,status").eq("id", user.id).single();
  const profile = data as UserRecord | null;
  if (!profile || profile.status !== "active") return <main className="login-page" dir="rtl"><section className="login-card denied-card"><div className="login-logo amber">!</div><h1>الحساب غير مفعّل</h1><p>راجعي مدير النظام لتفعيل حسابك.</p><a className="secondary-button login-button" href="/auth/signout">تسجيل الخروج</a></section></main>;
  return <Dashboard user={profile} signOutPath="/auth/signout"/>;
}
