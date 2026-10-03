/* ============================================================
   supabase-client.js
   الاتصال بـ Supabase + Gemini AI
   ============================================================ */

const SUPABASE_URL = "https://zaztjrfhilmuvpcrrbji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphenRqcmZoaWxtdXZwY3JyYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5Nzk4MjUsImV4cCI6MjEwNjU1NTgyNX0.HL8t5BSTufF4NwN87RZHuM6vdvotMA03cBQFEwk9G6Y";
const GEMINI_KEY = "AQ.Ab8RN6IccYBh4dsEGcFXNmS-Z6XePRVD31_qw-h2K7UITbY6bw";

/* تهيئة عميل Supabase */
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============ جلب البيانات ============ */

async function sbFetchBooks() {
  const { data, error } = await sb.from("books").select("*").order("title");
  if (error) { console.error("books error:", error); return []; }
  return data || [];
}

async function sbFetchAnnouncements() {
  const { data, error } = await sb
    .from("announcements")
    .select("*")
    .eq("active", true)
    .order("published_at", { ascending: false });
  if (error) { console.error("announcements error:", error); return []; }
  return data || [];
}

async function sbFetchCompetitions() {
  const { data, error } = await sb
    .from("competitions")
    .select("*")
    .eq("active", true)
    .order("deadline");
  if (error) { console.error("competitions error:", error); return []; }
  return data || [];
}

async function sbSaveVisitor(visitor) {
  const { error } = await sb.from("visitors").insert(visitor);
  if (error) throw error;
}

/* ============ المساعد الذكي (Gemini) ============ */

async function askGemini(question) {
  const prompt = `أنت مساعد مكتبة مدرسة الأمين الذكية (مدرسة الأمين الابتدائية).
تحدث بالعربية الفصحى المبسطة، بنبرة ودودة ومهنية.
أجب بإيجاز (2-4 أسطر) إلا إذا طلب المستخدم تفصيلًا.

معلومات المكتبة:
- مفتوحة الأحد إلى الخميس، من 8 صباحًا حتى 2 ظهرًا.
- الاستعارة مجانية لطلاب المدرسة.
- المسابقات في صفحة "المسابقات".
- التسجيل للزوار في صفحة "الزوار".
- المشرف: الأستاذ محمد حامد.

سؤال الزائر: ${question}

الإجابة:`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
    }
  );

  if (!res.ok) {
    console.error("Gemini status:", res.status);
    const txt = await res.text();
    console.error("Gemini error:", txt);
    throw new Error("فشل الاتصال بالمساعد الذكي");
  }

  const data = await res.json();
  const answer =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "عذرًا، لم أستطع توليد إجابة. جرّب صياغة أخرى.";

  return { answer };
}

/* ============ تصدير عام ============ */
window.SB = {
  fetchBooks: sbFetchBooks,
  fetchAnnouncements: sbFetchAnnouncements,
  fetchCompetitions: sbFetchCompetitions,
  saveVisitor: sbSaveVisitor,
  askGemini,
};
