"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { BarChart3, BookOpenCheck, Building2, Check, ChevronLeft, CircleAlert, FilePlus2, LogOut, Menu, Search, ShieldCheck, Sparkles, UserPlus, Users, X } from "lucide-react";
import type { UserRecord } from "@/lib/types";

type View = "dashboard" | "requests" | "new" | "guide" | "accounts";
type RequestTone = "success" | "warning" | "danger";
const roleLabel = { admin: "مدير النظام", reviewer: "مختص مراجعة", school: "حساب مدرسة" } as const;
const statusLabel = { success: "مستوفٍ", warning: "يحتاج استكمالاً", danger: "غير مطابق" } as const;
const sampleRequests: {id:string;name:string;school:string;role:string;status:RequestTone;date:string}[] = [
  { id: "TA-024", name: "نورة الهنائية", school: "مدرسة الإبداع الخاصة", role: "أخصائية نطق وتخاطب", status: "warning", date: "6 سبتمبر 2026" },
  { id: "TA-023", name: "مريم البلوشية", school: "مدرسة الأمل الخاصة", role: "معلمة صعوبات تعلم", status: "success", date: "5 سبتمبر 2026" },
  { id: "TA-022", name: "فاطمة المعمرية", school: "مدرسة النهضة", role: "معلمة تربية خاصة", status: "danger", date: "5 سبتمبر 2026" },
  { id: "TA-021", name: "ريم الشحية", school: "مدرسة جيل المعرفة", role: "أخصائية نفسية", status: "success", date: "4 سبتمبر 2026" },
];

export default function Dashboard({ user, signOutPath }: { user: UserRecord; signOutPath: string }) {
  const [view, setView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [accounts, setAccounts] = useState<UserRecord[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ tone: RequestTone; title: string; text: string } | null>(null);
  const isAdmin = user.role === "admin";
  const visibleRequests = useMemo(() => sampleRequests.filter(item => (filter === "all" || item.status === filter) && `${item.name} ${item.school} ${item.role}`.includes(query)), [filter, query]);

  async function loadAccounts() {
    if (!isAdmin) return;
    setAccountsLoading(true);
    const response = await fetch("/api/accounts");
    const data = await response.json();
    if (response.ok) setAccounts(data.accounts);
    else setMessage(data.error ?? "تعذر تحميل الحسابات");
    setAccountsLoading(false);
  }
  useEffect(() => { if (view === "accounts") void loadAccounts(); }, [view]);
  function go(next: View) { setView(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password"), role: form.get("role") }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "تعذر إنشاء الحساب");
    formElement.reset(); setAccountModal(false); setMessage("تم إنشاء الحساب بنجاح"); await loadAccounts(); setTimeout(() => setMessage(""), 3000);
  }
  async function toggleAccount(account: UserRecord) {
    const status = account.status === "active" ? "inactive" : "active";
    const response = await fetch("/api/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: account.id, status }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "تعذر تحديث الحساب");
    await loadAccounts();
  }
  function evaluateCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const degree = form.get("degree"), major = form.get("major"), education = form.get("education"), experience = Number(form.get("experience"));
    if (degree === "diploma" || major === "other") setResult({ tone: "danger", title: "الطلب غير مطابق مبدئياً", text: "المؤهل أو التخصص يحتاج إلى مراجعة المختص قبل اتخاذ القرار." });
    else if (education === "no" || experience < 2) setResult({ tone: "warning", title: "الطلب يحتاج استكمالاً", text: "ظهرت ملاحظة على المؤهل التربوي أو مدة الخبرة." });
    else setResult({ tone: "success", title: "الطلب مستوفٍ مبدئياً", text: "يمكن تحويل الطلب إلى المختص للمراجعة والاعتماد النهائي." });
  }

  const nav: [View, string, typeof BarChart3][] = [["dashboard", "لوحة المؤشرات", BarChart3], ["requests", "طلبات التعيين", BookOpenCheck], ["new", "طلب تعيين جديد", FilePlus2], ["guide", "دليل الاشتراطات", ShieldCheck]];
  if (isAdmin) nav.push(["accounts", "إدارة الحسابات", Users]);

  return <div className="app" dir="rtl">
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="brand"><span className="brand-mark"><Sparkles size={24}/></span><div><strong>المنظومة الذكية</strong><small>لمراجعة واعتماد تعيينات التربية الخاصة</small></div></div>
      <nav>{nav.map(([id,label,Icon]) => <button key={id} className={view===id?"active":""} onClick={()=>go(id)}><Icon size={19}/><span>{label}</span>{id==="requests"&&<b>24</b>}</button>)}</nav>
      <div className="smart-note"><Sparkles size={20}/><strong>مراجعة ذكية</strong><p>فحص أولي موحّد يساعد المختص ولا يستبدل القرار البشري.</p></div>
      <div className="profile"><span>{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{roleLabel[user.role]}</small></div><a href={signOutPath} target="_top" title="تسجيل الخروج"><LogOut size={18}/></a></div>
    </aside>
    <main className="main">
      <header><button className="menu" onClick={()=>setMenuOpen(!menuOpen)}><Menu/></button><p>المنظومة الذكية <span>/</span> <b>{nav.find(([id])=>id===view)?.[1]}</b></p><div className="identity"><ShieldCheck size={18}/><span>دخول آمن</span></div></header>

      {view==="dashboard"&&<section className="view"><PageHead eyebrow="نظرة عامة" title={`مرحباً ${user.name.split(" ")[0]}، إليك ملخص الطلبات`} subtitle="تابعي حالة طلبات تعيين كوادر التربية الخاصة واتخذي القرار بثقة." action={<button className="primary-button" onClick={()=>go("new")}><FilePlus2 size={18}/> إضافة طلب جديد</button>}/><div className="stats"><Stat label="إجمالي الطلبات" value="24" tone="navy" icon={<BookOpenCheck/>}/><Stat label="طلبات مستوفية" value="14" tone="green" icon={<Check/>}/><Stat label="تحتاج استكمالاً" value="7" tone="amber" icon={<CircleAlert/>}/><Stat label="غير مطابقة" value="3" tone="red" icon={<X/>}/></div><div className="dashboard-grid"><article className="panel"><PanelTitle title="حالة الطلبات" subtitle="توزيع نتائج الفحص الأولي"/><div className="donut-area"><div className="donut"><span><b>24</b><small>طلباً</small></span></div><div className="legend"><Legend tone="green" label="مستوفية" value="58%"/><Legend tone="amber" label="تحتاج استكمالاً" value="29%"/><Legend tone="red" label="غير مطابقة" value="13%"/></div></div></article><article className="panel"><PanelTitle title="آخر التحديثات" subtitle="نشاط الطلبات خلال اليوم"/><div className="updates"><Update tone="green" title="تم اعتماد طلب مريم البلوشية" text="معلمة صعوبات تعلم • مدرسة الأمل"/><Update tone="amber" title="طلب استكمال مستند" text="شهادة الخبرة لا توضّح المسمى الوظيفي"/><Update tone="navy" title="طلب جديد من مدرسة الإبداع" text="أخصائية نطق وتخاطب"/></div></article></div><RequestsTable rows={sampleRequests}/></section>}

      {view==="requests"&&<section className="view"><PageHead eyebrow="إدارة المراجعة" title="طلبات التعيين" subtitle="راجعي النتائج الأولية والمستندات قبل اتخاذ القرار النهائي." action={<button className="primary-button" onClick={()=>go("new")}><FilePlus2 size={18}/> طلب جديد</button>}/><div className="panel toolbar"><label><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحثي باسم المرشحة أو المدرسة..."/></label><div>{[["all","الكل"],["success","مستوفية"],["warning","تحتاج استكمالاً"],["danger","غير مطابقة"]].map(([id,label])=><button key={id} className={filter===id?"active":""} onClick={()=>setFilter(id)}>{label}</button>)}</div></div><RequestsTable rows={visibleRequests}/></section>}

      {view==="new"&&<section className="view"><PageHead eyebrow="طلب إلكتروني موحّد" title="إضافة طلب تعيين جديد" subtitle="أدخلي بيانات المرشحة وسيجري النظام فحصاً أولياً للاشتراطات."/><form className="application-form" onSubmit={evaluateCandidate}><div className="form-sections"><FormSection number="1" title="بيانات الطلب"><div className="fields"><Field label="اسم المدرسة"><input required placeholder="مدرسة الأمل الخاصة"/></Field><Field label="اسم المرشحة"><input required placeholder="الاسم الرباعي"/></Field><Field label="الرقم المدني"><input required inputMode="numeric" placeholder="00000000"/></Field><Field label="المسمى الوظيفي"><select required><option value="">اختاري المسمى</option><option>معلمة صعوبات تعلم</option><option>معلمة تربية خاصة</option><option>أخصائية نطق وتخاطب</option><option>أخصائية نفسية</option></select></Field></div></FormSection><FormSection number="2" title="المؤهلات والخبرة"><div className="fields"><Field label="المؤهل العلمي"><select name="degree" required><option value="">اختاري</option><option value="bachelor">بكالوريوس</option><option value="master">ماجستير</option><option value="diploma">دبلوم</option></select></Field><Field label="التخصص"><select name="major" required><option value="">اختاري</option><option value="special">التربية الخاصة</option><option value="learning">صعوبات التعلم</option><option value="speech">النطق والتخاطب</option><option value="other">تخصص آخر</option></select></Field><Field label="المؤهل التربوي"><select name="education" required><option value="">اختاري</option><option value="yes">متوفر</option><option value="no">غير متوفر</option></select></Field><Field label="سنوات الخبرة"><input name="experience" type="number" min="0" required/></Field></div></FormSection></div><aside className="panel scan-card"><span><Sparkles/></span><h2>الفحص الذكي الأولي</h2><p>مطابقة البيانات مع اشتراطات المسمى الوظيفي وكشف النواقص.</p><ul><li>المؤهل والتخصص</li><li>الخبرة والمؤهل التربوي</li><li>المستندات والتنبيهات</li></ul><button className="primary-button">فحص الطلب الآن <ChevronLeft size={18}/></button></aside></form></section>}

      {view==="guide"&&<section className="view"><PageHead eyebrow="مرجع المراجعة" title="دليل الاشتراطات" subtitle="قائمة التحقق الموحدة المستخدمة في الفحص الأولي."/><div className="source-note"><Check/><div><b>قواعد المراجعة مبنية على الأدلة التنظيمية المرفقة</b><p>اشتراطات الهيئتين التدريسية والإدارية ومتطلبات كوادر التربية الخاصة.</p></div></div><div className="guide-grid">{[["01","المؤهل العلمي","مناسبة الدرجة العلمية للوظيفة المطلوبة."],["02","التخصص","مطابقة التخصص مع المسمى الوظيفي."],["03","المؤهل التربوي","التحقق من توفره عند اشتراطه."],["04","الخبرة","حساب المدة والتحقق من المجال والمسمى."],["05","المستندات","كشف الوثائق الناقصة أو غير الواضحة."],["06","المعادلات","التنبيه للتصديق أو المعادلة عند الحاجة."]].map(([n,t,p])=><article key={n} className="guide-card"><span>{n}</span><h2>{t}</h2><p>{p}</p></article>)}</div></section>}

      {view==="accounts"&&isAdmin&&<section className="view"><PageHead eyebrow="صلاحيات النظام" title="إدارة الحسابات" subtitle="أنشئي حسابات المدارس والمختصين وحددي صلاحية كل حساب." action={<button className="primary-button" onClick={()=>{setMessage("");setAccountModal(true)}}><UserPlus size={18}/> إنشاء حساب</button>}/>{message&&<div className="message">{message}</div>}<div className="account-summary"><Summary icon={<Users/>} label="إجمالي الحسابات" value={accounts.length}/><Summary icon={<ShieldCheck/>} label="حسابات نشطة" value={accounts.filter(a=>a.status==="active").length}/><Summary icon={<Building2/>} label="حسابات المدارس" value={accounts.filter(a=>a.role==="school").length}/></div><article className="panel table-panel">{accountsLoading?<p className="loading">جاري تحميل الحسابات...</p>:<div className="table-wrap"><table><thead><tr><th>المستخدم</th><th>البريد الإلكتروني</th><th>الصلاحية</th><th>الحالة</th><th></th></tr></thead><tbody>{accounts.map(account=><tr key={account.id}><td><div className="person"><span>{account.name.charAt(0)}</span><b>{account.name}</b></div></td><td>{account.email}</td><td><span className={`role ${account.role}`}>{roleLabel[account.role]}</span></td><td><span className={`status ${account.status==="active"?"success":"danger"}`}>{account.status==="active"?"نشط":"معطل"}</span></td><td><button className="small-button" onClick={()=>toggleAccount(account)} disabled={account.id===user.id}>{account.status==="active"?"تعطيل":"تفعيل"}</button></td></tr>)}</tbody></table></div>}</article></section>}
    </main>

    {(accountModal||result)&&<div className="modal"><button className="backdrop" aria-label="إغلاق" onClick={()=>{setAccountModal(false);setResult(null)}}/><div className="modal-card"><button className="modal-close" onClick={()=>{setAccountModal(false);setResult(null)}}><X/></button>{accountModal&&<form onSubmit={createAccount}><div className="modal-icon"><UserPlus/></div><h2>إنشاء حساب جديد</h2><p>أنشئي بيانات الدخول وحددي صلاحية المستخدم.</p><Field label="اسم المستخدم"><input name="name" required placeholder="الاسم الكامل"/></Field><Field label="البريد الإلكتروني"><input name="email" type="email" required placeholder="name@example.com" dir="ltr"/></Field><Field label="كلمة المرور المؤقتة"><input name="password" type="password" minLength={8} required placeholder="8 أحرف على الأقل" dir="ltr"/></Field><Field label="صلاحية الحساب"><select name="role" required><option value="school">حساب مدرسة</option><option value="reviewer">مختص مراجعة</option><option value="admin">مدير النظام</option></select></Field>{message&&<div className="error-message">{message}</div>}<button className="primary-button wide">إنشاء الحساب</button></form>}{result&&<div className="result"><div className={`result-icon ${result.tone}`}>{result.tone==="success"?<Check/>:result.tone==="warning"?<CircleAlert/>:<X/>}</div><h2>{result.title}</h2><p>{result.text}</p><button className="primary-button wide" onClick={()=>setResult(null)}>حفظ الطلب</button></div>}</div></div>}
  </div>;
}

function PageHead({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle:string;action?:ReactNode}){return <div className="page-head"><div><p>{eyebrow}</p><h1>{title}</h1><span>{subtitle}</span></div>{action}</div>}
function Stat({label,value,tone,icon}:{label:string;value:string;tone:string;icon:ReactNode}){return <article className="stat panel"><span className={tone}>{icon}</span><div><small>{label}</small><b>{value}</b></div></article>}
function PanelTitle({title,subtitle}:{title:string;subtitle:string}){return <div className="panel-title"><h2>{title}</h2><p>{subtitle}</p></div>}
function Legend({tone,label,value}:{tone:string;label:string;value:string}){return <div><i className={tone}/><span>{label}</span><b>{value}</b></div>}
function Update({tone,title,text}:{tone:string;title:string;text:string}){return <div className="update"><span className={tone}>{tone==="green"?<Check/>:<CircleAlert/>}</span><div><b>{title}</b><p>{text}</p></div></div>}
function RequestsTable({rows}:{rows:typeof sampleRequests}){return <article className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>المرشحة</th><th>المدرسة</th><th>المسمى الوظيفي</th><th>الحالة</th><th>التقديم</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><div className="person"><span>{r.name.charAt(0)}</span><div><b>{r.name}</b><small>{r.id}</small></div></div></td><td>{r.school}</td><td>{r.role}</td><td><span className={`status ${r.status}`}>{statusLabel[r.status]}</span></td><td>{r.date}</td></tr>)}</tbody></table></div></article>}
function FormSection({number,title,children}:{number:string;title:string;children:ReactNode}){return <article className="panel form-section"><div className="section-title"><b>{number}</b><h2>{title}</h2></div>{children}</article>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label} *</span>{children}</label>}
function Summary({icon,label,value}:{icon:ReactNode;label:string;value:number}){return <div><span>{icon}</span><div><small>{label}</small><b>{value}</b></div></div>}
