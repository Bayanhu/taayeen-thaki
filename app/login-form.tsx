"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const supabase = createSupabaseBrowser();
    if (mode === "signup") {
      const name = String(data.get("name") || "").trim();
      const { data: result, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) setMessage(error.message === "User already registered" ? "البريد مسجل مسبقاً" : error.message);
      else if (!result.session) setMessage("تم إنشاء الحساب. افحصي بريدك لتأكيده ثم سجّلي الدخول.");
      else window.location.assign("/");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage("بيانات الدخول غير صحيحة أو البريد غير مؤكد"); else window.location.assign("/");
    }
    setLoading(false);
  }
  return <main className="login-page" dir="rtl"><section className="login-card">
    <div className="login-logo">✦</div><p className="eyebrow">منظومة التعيينات</p><h1>تعيين ذكي</h1>
    <p>{mode === "login" ? "سجّلي الدخول للوصول إلى مراجعة واعتماد تعيينات كوادر التربية الخاصة." : "أنشئي حسابك وابدئي باستخدام المنظومة."}</p>
    <form onSubmit={submit} className="auth-form">
      {mode === "signup" && <label className="field"><span>الاسم الكامل *</span><input name="name" required minLength={2}/></label>}
      <label className="field"><span>البريد الإلكتروني *</span><input name="email" type="email" required dir="ltr"/></label>
      <label className="field"><span>كلمة المرور *</span><input name="password" type="password" required minLength={8} dir="ltr"/></label>
      {message && <div className={message.startsWith("تم") ? "message" : "error-message"}>{message}</div>}
      <button className="primary-button login-button" disabled={loading}>{loading ? "لحظة..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}</button>
    </form>
    <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "ليس لديك حساب؟ إنشاء حساب" : "لديك حساب؟ تسجيل الدخول"}</button>
    <small>دخول آمن • أول حساب يُنشأ يحصل على صلاحية مدير النظام</small>
  </section></main>;
}
