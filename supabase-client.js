/* ============================================================
   supabase-client.js
   الاتصال بـ Supabase + Gemini AI
   ============================================================ */

const SUPABASE_URL = "https://zaztjrfhilmuvpcrrbji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphenRqcmZoaWxtdXZwY3JyYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5Nzk4MjUsImV4cCI6MjEwNjU1NTgyNX0.HL8t5BSTufF4NwN87RZHuM6vdvotMA03cBQFEwk9G6Y";

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

/* ============ المساعد الذكي (متعدد المزوّدين) ============ */

async function askGemini(question) {
  try {
    // جلب الإعدادات من قاعدة البيانات
    const { data: settings, error: settingsError } = await sb
      .from("ai_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings?.api_key) {
      return {
        answer: "⚠️ المساعد غير مُهيّأ. على المشرف إضافة مفتاح API من لوحة التحكم → إعدادات الذكاء الاصطناعي."
      };
    }

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

    let answer = "";

    /* ===== Google Gemini ===== */
    if (settings.provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model_name}:generateContent`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": settings.api_key
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
        })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || `HTTP ${res.status}`);
      }
      answer = json.candidates?.[0]?.content?.parts?.[0]?.text || "عذرًا، لم أستطع توليد إجابة.";
    }
    /* ===== OpenAI ===== */
    else if (settings.provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.api_key}`
        },
        body: JSON.stringify({
          model: settings.model_name,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 500
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`);
      answer = json.choices?.[0]?.message?.content || "عذرًا.";
    }
    /* ===== Anthropic ===== */
    else if (settings.provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.api_key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: settings.model_name,
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`);
      answer = json.content?.[0]?.text || "عذرًا.";
    }
    else {
      throw new Error("مزوّد غير مدعوم: " + settings.provider);
    }

    return { answer };
  } catch (err) {
    console.error("AI error:", err);
    throw err;
  }
}

/* ============ تصدير عام ============ */
window.SB = {
  fetchBooks: sbFetchBooks,
  fetchAnnouncements: sbFetchAnnouncements,
  fetchCompetitions: sbFetchCompetitions,
  saveVisitor: sbSaveVisitor,
  askGemini
};
