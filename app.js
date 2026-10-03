/* ============================================================
   مكتبة الأمين الذكية — Application Logic
   ============================================================ */

const DEFAULT_STATS = [
  { value: "12,480", label: "كتاب في الفهرس", delta: "محدّث" },
  { value: "318", label: "زائر مسجّل", delta: "شهريًا" },
  { value: "24", label: "مسابقة نشطة", delta: "الفصل" },
  { value: "96%", label: "رضا الزوار", delta: "استبيان" }
];

const FAQ = [
  "كيف أسجّل كزائر جديد؟",
  "ما مواعيد فتح المكتبة؟",
  "كيف أبحث عن كتاب معيّن؟",
  "ما شروط المشاركة في المسابقات؟",
  "كيف أحصل على عضوية المكتبة؟"
];

const routes = {
  "/": renderHome,
  "/books": renderBooks,
  "/competitions": renderCompetitions,
  "/announcements": renderAnnouncements,
  "/visitors": renderVisitors,
  "/support": renderSupport,
  "/dashboard": renderDashboard,
  "/dashboard/books": () => window.ADMIN_ROUTES?.["/dashboard/books"]?.(),
  "/dashboard/announcements": () => window.ADMIN_ROUTES?.["/dashboard/announcements"]?.(),
  "/dashboard/competitions": () => window.ADMIN_ROUTES?.["/dashboard/competitions"]?.(),
  "/dashboard/visitors": () => window.ADMIN_ROUTES?.["/dashboard/visitors"]?.(),
  "/dashboard/borrowings": () => window.ADMIN_ROUTES?.["/dashboard/borrowings"]?.(),
  "/dashboard/ai": () => window.ADMIN_ROUTES?.["/dashboard/ai"]?.()
};

function getPath() {
  return location.hash.replace(/^#/, "") || "/";
}

function navigate(path, push = true) {
  if (!routes[path]) path = "/";
  if (push) location.hash = path === "/" ? "" : path;
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.classList.remove("page-enter");
  void app.offsetWidth;
  app.classList.add("page-enter");
  routes[path]();
  document.querySelectorAll("[data-route]").forEach(a => {
    const href = (a.getAttribute("href") || "").replace(/^#/, "");
    a.classList.toggle("active", href === path);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  requestAnimationFrame(observeReveals);
}

document.addEventListener("click", e => {
  const link = e.target.closest("[data-route]");
  if (!link) return;
  e.preventDefault();
  navigate((link.getAttribute("href") || "").replace(/^#/, ""));
});
window.addEventListener("hashchange", () => navigate(getPath(), false));

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2800);
}

let revealObserver;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
  }
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
}

const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const monthName = i => MONTHS[i] || "";

function renderBookRow(b) {
  return `<div class="book-result">
    <div class="book-cover">${esc((b.category || "?").slice(0, 6))}</div>
    <div>
      <strong>${esc(b.title)}</strong>
      <small>${esc(b.author)}${b.category ? " • " + esc(b.category) : ""}</small>
    </div>
  </div>`;
}

/* ===== HOME ===== */
async function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy reveal">
        <p class="eyebrow">منصة المكتبة المدرسية الذكية</p>
        <h1>اكتشف <span>عالمًا</span> من المعرفة</h1>
        <p class="lead">مكتبة مدرسة الأمين الابتدائية — فهرس رقمي، مسابقات، ومساعد ذكي.</p>
        <div class="hero-actions">
          <a class="btn primary lg" href="#/books" data-route>📚 ابحث عن كتابك</a>
          <a class="btn subtle lg" href="#/support" data-route>💬 اسأل المساعد</a>
        </div>
        <div class="trust-row">
          <span><i></i> فهرس حقيقي</span>
          <span><i></i> مساعد Gemini</span>
          <span><i></i> إشراف أ. محمد حامد</span>
        </div>
      </div>
      <aside class="hero-board reveal">
        <div class="board-head"><strong>رف المعرفة</strong><small>مباشر</small></div>
        <div class="board-profile">
          <div class="profile-avatar">م.ح</div>
          <div><strong>الأستاذ محمد حامد</strong><small>مشرف المكتبة والمنصة</small></div>
        </div>
        <div class="book-shelf">
          <div class="shelf-book">أدب</div>
          <div class="shelf-book">علوم</div>
          <div class="shelf-book">تاريخ</div>
          <div class="shelf-book">فلسفة</div>
        </div>
        <div class="board-stats">
          <div class="mini-stat"><strong id="statBooks">—</strong><small>كتاب</small></div>
          <div class="mini-stat"><strong>318</strong><small>زائر</small></div>
          <div class="mini-stat"><strong>24</strong><small>مسابقة</small></div>
        </div>
      </aside>
    </section>
    <section class="section soft">
      <div class="section-head reveal"><div><h2>أرقام المكتبة</h2><p>نظرة سريعة على النشاط.</p></div></div>
      <div class="stats-grid">
        ${DEFAULT_STATS.map(s => `
          <div class="stat-card reveal">
            <strong>${esc(s.value)}</strong>
            <span>${esc(s.label)}</span>
            <small>▲ ${esc(s.delta)}</small>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="section">
      <div class="content-grid">
        <div class="card reveal"><div class="card-body">
          <div class="section-head">
            <h2 style="font-size:22px;margin:0">آخر الإعلانات</h2>
            <a class="text-link" href="#/announcements" data-route>عرض الكل</a>
          </div>
          <div id="homeAnnouncements" class="announcement-list">
            <div style="padding:20px;text-align:center;color:var(--muted)">جاري التحميل...</div>
          </div>
        </div></div>
        <div class="card reveal"><div class="card-body">
          <div class="section-head">
            <h2 style="font-size:22px;margin:0">مسابقات نشطة</h2>
            <a class="text-link" href="#/competitions" data-route>عرض الكل</a>
          </div>
          <div id="homeCompetitions" class="competition-list">
            <div style="padding:20px;text-align:center;color:var(--muted)">جاري التحميل...</div>
          </div>
        </div></div>
      </div>
    </section>
    <section class="section soft">
      <div class="content-grid" style="grid-template-columns:1fr 1.2fr">
        <div class="card reveal"><div class="card-body">
          <h2 style="font-size:22px;margin-bottom:6px">ابحث في الفهرس</h2>
          <p style="color:var(--muted);font-size:13px;margin-bottom:16px">اكتب اسم الكتاب أو المؤلف.</p>
          <form class="search-box" id="homeSearch">
            <span>⌕</span>
            <input type="search" placeholder="مثال: قصص" id="homeSearchInput">
            <button type="submit">ابحث</button>
          </form>
          <div class="book-results" id="homeResults">
            <div style="padding:20px;text-align:center;color:var(--muted)">جاري التحميل...</div>
          </div>
        </div></div>
        <div class="reveal">
          <h2 style="font-size:22px;margin-bottom:16px">وصول سريع</h2>
          <div class="quick-links">
            <a class="quick-card" href="#/books" data-route><div class="quick-icon">📚</div><div><strong>الكتب</strong><small>الفهرس</small></div></a>
            <a class="quick-card" href="#/competitions" data-route><div class="quick-icon">🏆</div><div><strong>المسابقات</strong><small>نشطة</small></div></a>
            <a class="quick-card" href="#/visitors" data-route><div class="quick-icon">🎫</div><div><strong>تسجيل زائر</strong><small>دقيقة</small></div></a>
            <a class="quick-card" href="#/support" data-route><div class="quick-icon">💬</div><div><strong>المساعد</strong><small>متاح</small></div></a>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="assistant-promo reveal">
        <div>
          <h2>مساعدك الذكي جاهز</h2>
          <p>اسأل عن أي شيء يخص المكتبة — يجيبك فورًا بالعربية.</p>
          <a class="btn gold lg" href="#/support" data-route>ابدأ المحادثة ←</a>
        </div>
        <div class="assistant-bubble">✦</div>
      </div>
    </section>
  `;

  try {
    const [books, announcements, competitions] = await Promise.all([
      SB.fetchBooks(), SB.fetchAnnouncements(), SB.fetchCompetitions()
    ]);

    const statBooks = document.getElementById("statBooks");
    if (statBooks) statBooks.textContent = books.length || "—";

    document.getElementById("homeAnnouncements").innerHTML = announcements.length
      ? announcements.slice(0, 3).map(a => {
          const d = new Date(a.published_at);
          return `<div class="announcement-item">
            <div class="date-box"><strong>${d.getDate()}</strong><small>${monthName(d.getMonth())}</small></div>
            <div class="item-content">
              <h3>${esc(a.title)}</h3>
              <p>${esc(a.body || "")}</p>
              <span class="tag">${esc(a.tag || "إعلان")}</span>
            </div>
          </div>`;
        }).join("")
      : `<div style="padding:20px;text-align:center;color:var(--muted)">لا توجد إعلانات.</div>`;

    document.getElementById("homeCompetitions").innerHTML = competitions.length
      ? competitions.slice(0, 3).map(c => {
          const d = new Date(c.deadline);
          return `<div class="competition-item">
            <div class="date-box"><strong>${d.getDate()}</strong><small>${monthName(d.getMonth())}</small></div>
            <div class="item-content">
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.body || "")}</p>
              <span class="tag">نشطة</span>
            </div>
          </div>`;
        }).join("")
      : `<div style="padding:20px;text-align:center;color:var(--muted)">لا توجد مسابقات.</div>`;

    document.getElementById("homeResults").innerHTML =
      books.slice(0, 3).map(renderBookRow).join("") ||
      `<div style="padding:20px;text-align:center;color:var(--muted)">لا توجد كتب.</div>`;

    const form = document.getElementById("homeSearch");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const q = document.getElementById("homeSearchInput").value.trim().toLowerCase();
      const results = document.getElementById("homeResults");
      if (!q) {
        results.innerHTML = books.slice(0, 3).map(renderBookRow).join("");
        return;
      }
      const found = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q)
      );
      results.innerHTML = found.length
        ? found.slice(0, 8).map(renderBookRow).join("")
        : `<div style="padding:20px;text-align:center;color:var(--muted)"><strong>لا توجد نتائج</strong><br>جرّب كلمة أخرى.</div>`;
    });
  } catch (err) {
    console.error("Home error:", err);
    toast("تعذّر تحميل البيانات.");
  }
}

/* ===== BOOKS ===== */
async function renderBooks() {
  const app = document.getElementById("app");
  app.innerHTML = `<section class="page-shell"><div style="padding:40px;text-align:center;color:var(--muted)">جاري التحميل...</div></section>`;
  try {
    const books = await SB.fetchBooks();
    app.innerHTML = `
      <section class="page-shell">
        <div class="page-hero reveal">
          <div>
            <p class="eyebrow">الفهرس الكامل</p>
            <h1>الكتب</h1>
            <p>تصفّح المجموعة الكاملة.</p>
          </div>
        </div>
        ${books.length ? `
          <div class="catalog-grid">
            ${books.map(b => `
              <div class="catalog-card reveal">
                ${b.cover_url 
                  ? `<img src="${esc(b.cover_url)}" alt="" style="flex:0 0 70px;height:96px;object-fit:cover;border-radius:5px 10px 3px 3px">` 
                  : `<div class="catalog-cover">${esc((b.category || "?").slice(0, 8))}</div>`}
                <div>
                  <h3>${esc(b.title)}</h3>
                  <p>${esc(b.author)}${b.description ? " — " + esc(b.description) : ""}</p>
                  <span class="tag">${esc(b.category || "عام")}</span>
                </div>
              </div>
            `).join("")}
          </div>
        ` : `<div style="padding:40px;text-align:center;color:var(--muted)">لا توجد كتب.</div>`}
      </section>
    `;
  } catch (err) {
    console.error(err);
    app.innerHTML = `<section class="page-shell"><div style="padding:40px;text-align:center">تعذّر التحميل.</div></section>`;
  }
}

/* ===== COMPETITIONS ===== */
async function renderCompetitions() {
  const app = document.getElementById("app");
  try {
    const competitions = await SB.fetchCompetitions();
    app.innerHTML = `
      <section class="page-shell">
        <div class="page-hero reveal">
          <div><p class="eyebrow">أنشطة</p><h1>المسابقات</h1></div>
        </div>
        ${competitions.length ? `
          <div class="catalog-grid">
            ${competitions.map(c => {
              const d = new Date(c.deadline);
              return `<div class="catalog-card reveal">
                <div class="catalog-cover">${d.getDate()}<br>${monthName(d.getMonth())}</div>
                <div>
                  <h3>${esc(c.title)}</h3>
                  <p>${esc(c.body || "")}</p>
                  <span class="tag">نشطة</span>
                </div>
              </div>`;
            }).join("")}
          </div>
        ` : `<div style="padding:40px;text-align:center;color:var(--muted)">لا توجد مسابقات.</div>`}
      </section>
    `;
  } catch {
    app.innerHTML = `<section class="page-shell"><div style="padding:40px;text-align:center">تعذّر.</div></section>`;
  }
}

/* ===== ANNOUNCEMENTS ===== */
async function renderAnnouncements() {
  const app = document.getElementById("app");
  try {
    const items = await SB.fetchAnnouncements();
    app.innerHTML = `
      <section class="page-shell">
        <div class="page-hero reveal">
          <div><p class="eyebrow">تابع الجديد</p><h1>الإعلانات</h1></div>
        </div>
        <div class="card reveal">
          <div class="card-body">
            <div class="announcement-list">
              ${items.length ? items.map(a => {
                const d = new Date(a.published_at);
                return `<div class="announcement-item">
                  <div class="date-box"><strong>${d.getDate()}</strong><small>${monthName(d.getMonth())}</small></div>
                  <div class="item-content">
                    <h3>${esc(a.title)}</h3>
                    <p>${esc(a.body || "")}</p>
                    <span class="tag">${esc(a.tag || "إعلان")}</span>
                  </div>
                </div>`;
              }).join("") : `<div style="padding:20px;text-align:center;color:var(--muted)">لا توجد إعلانات.</div>`}
            </div>
          </div>
        </div>
      </section>
    `;
  } catch {
    app.innerHTML = `<section class="page-shell"><div style="padding:40px;text-align:center">تعذّر.</div></section>`;
  }
}

/* ===== VISITORS ===== */
function renderVisitors() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div><p class="eyebrow">تسجيل</p><h1>زائر جديد</h1><p>سجّل زيارتك في أقل من دقيقة.</p></div>
      </div>
      <div class="content-grid">
        <div class="card reveal"><div class="card-body">
          <h3 style="margin-bottom:16px">بيانات الزائر</h3>
          <form id="visitorForm" style="display:grid;gap:14px">
            <input class="form-field" name="name" placeholder="الاسم الكامل" required minlength="2">
            <input class="form-field" name="affiliation" placeholder="الصف / الجهة" required>
            <input class="form-field" name="purpose" placeholder="الغرض" required>
            <button class="btn primary block" type="submit" id="visitorBtn">تسجيل الزيارة</button>
          </form>
        </div></div>
        <div class="card reveal"><div class="card-body">
          <h3 style="margin-bottom:16px">معلومات</h3>
          <p style="color:var(--muted);font-size:13px;line-height:1.8">
            تسجيلك يساعدنا على تنظيم المكتبة وتحسين الخدمة.
          </p>
        </div></div>
      </div>
    </section>
  `;
  document.getElementById("visitorForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = document.getElementById("visitorBtn");
    const form = e.target;
    btn.disabled = true;
    btn.textContent = "...جاري";
    try {
      await SB.saveVisitor({
        name: form.name.value.trim(),
        affiliation: form.affiliation.value.trim(),
        purpose: form.purpose.value.trim()
      });
      form.reset();
      toast("✓ تم تسجيل الزيارة");
    } catch (err) {
      console.error(err);
      toast("تعذّر التسجيل");
    } finally {
      btn.disabled = false;
      btn.textContent = "تسجيل الزيارة";
    }
  });
}

/* ===== SUPPORT ===== */
function renderSupport() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div><p class="eyebrow">دعم</p><h1>الدعم الذكي</h1></div>
      </div>
      <div class="support-layout">
        <div class="chat-card reveal">
          <div class="chat-head">
            <div class="bot-dot">✦</div>
            <div>
              <strong>مساعد مكتبة الأمين</strong>
              <small>مدعوم بـ Google Gemini</small>
            </div>
          </div>
          <div class="chat-log" id="chatLog">
            <div class="message bot">مرحبًا! كيف أساعدك؟</div>
          </div>
          <form class="chat-form" id="chatForm">
            <input id="chatInput" placeholder="اكتب سؤالك..." autocomplete="off">
            <button type="submit">إرسال</button>
          </form>
        </div>
        <div class="reveal">
          <div class="card"><div class="card-body">
            <h3 style="margin-bottom:14px">أسئلة شائعة</h3>
            <div class="faq-list">
              ${FAQ.map(q => `<button class="faq-button" data-q="${esc(q)}">${esc(q)}</button>`).join("")}
            </div>
          </div></div>
        </div>
      </div>
    </section>
  `;

  const log = document.getElementById("chatLog");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  const send = async text => {
    const q = text.trim();
    if (!q) return;
    log.insertAdjacentHTML("beforeend", `<div class="message user">${esc(q)}</div>`);
    input.value = "";
    log.scrollTop = log.scrollHeight;

    const typingId = "typing-" + Date.now();
    log.insertAdjacentHTML("beforeend", `<div class="message bot" id="${typingId}">... يفكر</div>`);
    log.scrollTop = log.scrollHeight;

    try {
      const { answer } = await SB.askGemini(q);
      document.getElementById(typingId)?.remove();
      log.insertAdjacentHTML("beforeend", `<div class="message bot">${esc(answer)}</div>`);
    } catch (err) {
      console.error(err);
      document.getElementById(typingId)?.remove();
      log.insertAdjacentHTML("beforeend", `<div class="message bot">عذرًا، حدث خطأ. تأكد من إعداد مفتاح API في لوحة التحكم.</div>`);
    }
    log.scrollTop = log.scrollHeight;
  };

  form.addEventListener("submit", e => { e.preventDefault(); send(input.value); });
  document.querySelectorAll(".faq-button").forEach(b => {
    b.addEventListener("click", () => send(b.dataset.q));
  });
}

/* ===== DASHBOARD (تفويض) ===== */
function renderDashboard() {
  if (window.ADMIN_ROUTES && window.ADMIN_ROUTES["/dashboard"]) {
    window.ADMIN_ROUTES["/dashboard"]();
  } else {
    document.getElementById("app").innerHTML =
      `<section class="page-shell"><div style="padding:40px;text-align:center">جاري التحميل...</div></section>`;
  }
}

/* ===== Theme ===== */
function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.body.classList.add("dark");
  }
  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

/* ===== Mobile menu ===== */
function initMenu() {
  document.getElementById("menuToggle").addEventListener("click", () => {
    const nav = document.querySelector(".primary-nav");
    const open = nav.style.display === "flex";
    if (open) nav.removeAttribute("style");
    else Object.assign(nav.style, {
      display: "flex",
      position: "absolute",
      top: "76px",
      right: "16px",
      left: "16px",
      flexDirection: "column",
      background: "var(--ink)",
      padding: "16px",
      borderRadius: "16px",
      gap: "6px",
      alignItems: "stretch",
      boxShadow: "var(--shadow-lg)"
    });
  });
}

/* ===== Boot ===== */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  navigate(getPath(), false);
});
