import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";

const createSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().transform(v => v.toLowerCase()), password: z.string().min(8).max(72), role: z.enum(["admin", "reviewer", "school"]) });
async function adminClient() {
  const supabase = await createSupabaseServer(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role,status").eq("id", user.id).single();
  return data?.role === "admin" && data?.status === "active" ? supabase : null;
}
export async function GET() {
  const supabase = await adminClient(); if (!supabase) return Response.json({ error: "غير مصرح لك" }, { status: 403 });
  const { data, error } = await supabase.from("profiles").select("id,name,email,role,status").order("created_at", { ascending: false });
  return error ? Response.json({ error: "تعذر تحميل الحسابات" }, { status: 500 }) : Response.json({ accounts: data });
}
export async function POST(request: Request) {
  const supabase = await adminClient(); if (!supabase) return Response.json({ error: "غير مصرح لك" }, { status: 403 });
  const parsed = createSchema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "تحققي من البيانات وكلمة المرور" }, { status: 400 });
  const { name, email, password, role } = parsed.data;
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, { method: "POST", headers: { "Content-Type": "application/json", apikey: supabasePublishableKey }, body: JSON.stringify({ email, password, data: { name } }) });
  const created = await response.json();
  if (!response.ok || !created.user?.id) return Response.json({ error: created.msg || created.message || "تعذر إنشاء الحساب" }, { status: response.status || 400 });
  const { error } = await supabase.from("profiles").update({ name, role }).eq("id", created.user.id);
  return error ? Response.json({ error: "أُنشئ الحساب وتعذر تحديث صلاحيته" }, { status: 500 }) : Response.json({ account: { id: created.user.id, name, email, role, status: "active" } }, { status: 201 });
}
export async function PATCH(request: Request) {
  const supabase = await adminClient(); if (!supabase) return Response.json({ error: "غير مصرح لك" }, { status: 403 });
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["active", "inactive"]) }).safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  const { data: { user } } = await supabase.auth.getUser(); if (parsed.data.id === user?.id && parsed.data.status === "inactive") return Response.json({ error: "لا يمكنك تعطيل حسابك" }, { status: 400 });
  const { error } = await supabase.from("profiles").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  return error ? Response.json({ error: "تعذر تحديث الحساب" }, { status: 500 }) : Response.json({ ok: true });
}
