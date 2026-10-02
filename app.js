/* ============================================================
   مكتبة الأمين الذكية — Application Logic
   موقع ثابت يعمل على GitHub Pages
   ============================================================ */

const DATA = {
  stats: [
    { value: "12,480", label: "كتاب في الفهرس", delta: "+124 هذا الشهر" },
    { value: "318", label: "زائر مسجّل", delta: "+18 اليوم" },
    { value: "24", label: "مسابقة نشطة", delta: "3 جديدة" },
    { value: "96%", label: "رضا الزوار", delta: "استبيان أكتوبر" }
  ],
  announcements: [
    { day: "15", month: "نوف", title: "افتتاح قسم القراءة الحرة", excerpt: "قسم جديد مخصص للقراءة الحرة داخل المكتبة.", tag: "جديد" },
    { day: "12", month: "نوف", title: "تحديث مواعيد الزيارة", excerpt: "المواعيد الجديدة من 8 صباحًا حتى 2 ظهرًا.", tag: "تنبيه" },
    { day: "08", month: "نوف", title: "حملة «كتاب لكل طالب»", excerpt: "توزيع كتب قصصية على الصفوف الأولى.", tag: "مبادرة" }
  ],
  competitions: [
    { day: "20", month: "نوف", title: "مسابقة أفضل ملخص كتاب", excerpt: "للصفوف الرابع إلى السادس — الجوائز قيّمة.", tag: "مفتوحة" },
    { day: "25", month: "نوف", title: "تحدي القراءة السريعة", excerpt: "خلال أسبوع القراءة المدرسية.", tag: "قريبًا" }
  ],
  books: [
    { title: "قصص الأنبياء للأطفال", author: "أحمد بهجت", category: "ديني" },
    { title: "عالم الحيوان المدهش", author: "د. سامي خليل", category: "علوم" },
    { title: "ألف ليلة وليلة", author: "تراث عربي", category: "أدب" },
    { title: "الرياضيات المسلية", author: "ياسر شوقي", category: "رياضيات" },
    { title: "رحلة في جسم الإنسان", author: "د. هدى رمزي", category: "علوم" },
    { title: "قصائد للأطفال", author: "سليمان عيسى", category: "شعر" }
  ],
  faq: [
    "كيف أسجّل كزائر جديد؟",
    "ما مواعيد فتح المكتبة؟",
    "كيف أبحث عن كتاب معيّن؟",
    "ما شروط المشاركة في المسابقات؟",
    "كيف أحصل على عضوية المكتبة؟"
  ]
};

/* ===== Router (Hash-based for GitHub Pages) ===== */
const routes = {
  "/": renderHome,
  "/books": renderBooks,
  "/competitions": renderCompetitions,
  "/announcements": renderAnnouncements,
  "/visitors": renderVisitors,
  "/support": renderSupport,
  "/dashboard": renderDashboard
};

function getPath() {
  const hash = location.hash.replace(/^#/, "");
  return hash || "/";
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
    const href = a.getAttribute("href").replace(/^#/, "");
    a.classList.toggle("active", href === path);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  requestAnimationFrame(observeReveals);
}

document.addEventListener("click", e => {
  const link = e.target.closest("[data-route]");
  if (!link) return;
  e.preventDefault();
  navigate(link.getAttribute("href").replace(/^#/, ""));
});
window.addEventListener("hashchange", () => navigate(getPath(), false));

/* ===== Reveal on scroll ===== */
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
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  }
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
}

/* ===== Helpers ===== */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ===== Home ===== */
function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy reveal">
        <p class="eyebrow">منصة المكتبة المدرسية الذكية</p>
        <h1>اكتشف <span>عالمًا</span> من المعرفة في متناول يدك</h1>
        <p class="lead">مكتبة مدرسة الأمين الابتدائية — فهرس رقمي شامل، مسابقات محفّزة، ومساعد ذكي يجيبك في أي وقت. كل ما يحتاجه الطالب والزائر في مكان واحد.</p>
        <div class="hero-actions">
          <a class="btn primary lg" href="#/books" data-route>📚 ابحث عن كتابك التالي</a>
          <a class="btn subtle lg" href="#/support" data-route>💬 اسأل المساعد الذكي</a>
        </div>
        <div class="trust-row">
          <span><i></i> تحديث فوري للفهرس</span>
          <span><i></i> دعم كامل للعربية RTL</span>
          <span><i></i> إشراف الأستاذ محمد حامد</span>
        </div>
      </div>

      <aside class="hero-board reveal">
        <div class="board-head">
          <strong>رف المعرفة</strong>
          <small>محدّث الآن</small>
        </div>
        <div class="board-profile">
          <div class="profile-avatar">م.ح</div>
          <div>
            <strong>الأستاذ محمد حامد</strong>
            <small>مشرف المكتبة والمنصة</small>
          </div>
        </div>
        <div class="book-shelf">
          <div class="shelf-book">أدب</div>
          <div class="shelf-book">علوم</div>
          <div class="shelf-book">تاريخ</div>
          <div class="shelf-book">فلسفة</div>
        </div>
        <div class="board-stats">
          <div class="mini-stat"><strong>12.4K</strong><small>كتاب</small></div>
          <div class="mini-stat"><strong>318</strong><small>زائر</small></div>
          <div class="mini-stat"><strong>24</strong><small>مسابقة</small></div>
        </div>
      </aside>
    </section>

    <section class="section soft">
      <div class="section-head reveal">
        <div><h2>أرقام المكتبة</h2><p>نظرة سريعة على نشاط المكتبة خلال الفترة الحالية.</p></div>
      </div>
      <div class="stats-grid">
        ${DATA.stats.map(s => `
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
        <div class="card reveal">
          <div class="card-body">
            <div class="section-head">
              <div><h2 style="font-size:24px;margin-bottom:4px">آخر الإعلانات</h2></div>
              <a class="text-link" href="#/announcements" data-route>عرض الكل</a>
            </div>
            <div class="announcement-list">
              ${DATA.announcements.map(a => `
                <div class="announcement-item">
                  <div class="date-box"><strong>${esc(a.day)}</strong><small>${esc(a.month)}</small></div>
                  <div class="item-content">
                    <h3>${esc(a.title)}</h3>
                    <p>${esc(a.excerpt)}</p>
                    <span class="tag">${esc(a.tag)}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
        <div class="card reveal">
          <div class="card-body">
            <div class="section-head">
              <div><h2 style="font-size:24px;margin-bottom:4px">مسابقات نشطة</h2></div>
              <a class="text-link" href="#/competitions" data-route>عرض الكل</a>
            </div>
            <div class="competition-list">
              ${DATA.competitions.map(c => `
                <div class="competition-item">
                  <div class="date-box"><strong>${esc(c.day)}</strong><small>${esc(c.month)}</small></div>
                  <div class="item-content">
                    <h3>${esc(c.title)}</h3>
                    <p>${esc(c.excerpt)}</p>
                    <span class="tag">${esc(c.tag)}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="content-grid" style="grid-template-columns:1fr 1.2fr">
        <div class="card reveal">
          <div class="card-body">
            <h2 style="font-size:22px;margin-bottom:6px">ابحث في الفهرس</h2>
            <p style="color:var(--muted);font-size:13px;margin-bottom:16px">اكتب اسم الكتاب أو المؤلف أو التصنيف.</p>
            <form class="search-box" id="homeSearch">
              <span>⌕</span>
              <input type="search" placeholder="مثال: قصص الأنبياء" aria-label="بحث">
              <button type="submit">ابحث</button>
            </form>
            <div class="book-results" id="homeResults">
              ${DATA.books.slice(0,3).map(renderBookRow).join("")}
            </div>
          </div>
        </div>
        <div class="reveal">
          <h2 style="font-size:22px;margin-bottom:16px">وصول سريع</h2>
          <div class="quick-links">
            <a class="quick-card" href="#/books" data-route><div class="quick-icon">📚</div><div><strong>الكتب</strong><small>الفهرس الكامل</small></div></a>
            <a class="quick-card" href="#/competitions" data-route><div class="quick-icon">🏆</div><div><strong>المسابقات</strong><small>نشطة الآن</small></div></a>
            <a class="quick-card" href="#/visitors" data-route><div class="quick-icon">🎫</div><div><strong>تسجيل زائر</strong><small>دقيقة واحدة</small></div></a>
            <a class="quick-card" href="#/support" data-route><div class="quick-icon">💬</div><div><strong>المساعد الذكي</strong><small>متاح دائمًا</small></div></a>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="assistant-promo reveal">
        <div>
          <h2>مساعدك الذكي جاهز للإجابة</h2>
          <p>اسأل عن مواعيد الزيارة، إجراءات الاستعارة، شروط المسابقات، أو أي شيء يتعلق بالمكتبة. المساعد يفهم العربية ويجيبك فورًا.</p>
          <a class="btn gold lg" href="#/support" data-route>ابدأ المحادثة الآن ←</a>
        </div>
        <div class="assistant-bubble">✦</div>
      </div>
    </section>
  `;

  setTimeout(() => {
    const form = document.getElementById("homeSearch");
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const q = form.querySelector("input").value.trim().toLowerCase();
      const results = document.getElementById("homeResults");
      if (!q) {
        results.innerHTML = DATA.books.slice(0,3).map(renderBookRow).join("");
        return;
      }
      const found = DATA.books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
      results.innerHTML = found.length
        ? found.map(renderBookRow).join("")
        : `<div style="padding:20px;text-align:center;color:var(--muted)"><strong>لا توجد نتائج</strong><br>جرّب كلمة أخرى.</div>`;
    });
  });
}

function renderBookRow(b) {
  return `<div class="book-result">
    <div class="book-cover">${esc(b.category)}</div>
    <div><strong>${esc(b.title)}</strong><small>${esc(b.author)} • ${esc(b.category)}</small></div>
  </div>`;
}

/* ===== Books ===== */
function renderBooks() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">الفهرس الكامل</p>
          <h1>الكتب</h1>
          <p>تصفّح مجموعتنا الكاملة من الكتب المتاحة للاستعارة من داخل المكتبة.</p>
          <div class="chip-row">
            <span class="chip">ديني</span><span class="chip">علوم</span><span class="chip">أدب</span>
            <span class="chip">تاريخ</span><span class="chip">رياضيات</span><span class="chip">شعر</span>
          </div>
        </div>
      </div>
      <div class="catalog-grid">
        ${DATA.books.map(b => `
          <div class="catalog-card reveal">
            <div class="catalog-cover">${esc(b.category)}</div>
            <div>
              <h3>${esc(b.title)}</h3>
              <p>${esc(b.author)}</p>
              <span class="tag">${esc(b.category)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

/* ===== Competitions ===== */
function renderCompetitions() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">أنشطة تحفيزية</p>
          <h1>المسابقات</h1>
          <p>شارك في مسابقات المكتبة واربح جوائز قيّمة.</p>
        </div>
      </div>
      <div class="catalog-grid">
        ${DATA.competitions.map(c => `
          <div class="catalog-card reveal">
            <div class="catalog-cover">${esc(c.day)}<br>${esc(c.month)}</div>
            <div>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.excerpt)}</p>
              <span class="tag">${esc(c.tag)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

/* ===== Announcements ===== */
function renderAnnouncements() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">تابع جديد المكتبة</p>
          <h1>الإعلانات</h1>
          <p>كل ما يستجد في المكتبة من أخبار وإجراءات ومواعيد.</p>
        </div>
      </div>
      <div class="card reveal">
        <div class="card-body">
          <div class="announcement-list">
            ${DATA.announcements.map(a => `
              <div class="announcement-item">
                <div class="date-box"><strong>${esc(a.day)}</strong><small>${esc(a.month)}</small></div>
                <div class="item-content">
                  <h3>${esc(a.title)}</h3>
                  <p>${esc(a.excerpt)}</p>
                  <span class="tag">${esc(a.tag)}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ===== Visitors ===== */
function renderVisitors() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">تسجيل الوصول</p>
          <h1>تسجيل زائر</h1>
          <p>سجّل زيارتك للمكتبة في أقل من دقيقة.</p>
        </div>
      </div>
      <div class="content-grid">
        <div class="card reveal">
          <div class="card-body">
            <h3 style="margin-bottom:16px">بيانات الزائر</h3>
            <form id="visitorForm" style="display:grid;gap:14px">
              <input class="form-field" placeholder="الاسم الكامل" required>
              <input class="form-field" placeholder="الصف / الجهة" required>
              <input class="form-field" placeholder="الغرض من الزيارة" required>
              <button class="btn primary block" type="submit">تسجيل الزيارة</button>
            </form>
          </div>
        </div>
        <div class="card reveal">
          <div class="card-body">
            <h3 style="margin-bottom:16px">إحصائيات اليوم</h3>
            <div class="stats-grid" style="grid-template-columns:1fr 1fr">
              <div class="stat-card"><strong>18</strong><span>زائر اليوم</span></div>
              <div class="stat-card"><strong>318</strong><span>إجمالي الزوار</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  setTimeout(() => {
    document.getElementById("visitorForm")?.addEventListener("submit", e => {
      e.preventDefault();
      e.target.reset();
      toast("✓ تم تسجيل الزيارة بنجاح، شكرًا لك!");
    });
  });
}

/* ===== Support / Assistant ===== */
function renderSupport() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">دعم فوري</p>
          <h1>الدعم الذكي</h1>
          <p>اسأل المساعد عن أي إجراء يخص المكتبة.</p>
        </div>
      </div>
      <div class="support-layout">
        <div class="chat-card reveal">
          <div class="chat-head">
            <div class="bot-dot">✦</div>
            <div>
              <strong>مساعد مكتبة الأمين</strong>
              <small>متصل الآن</small>
            </div>
          </div>
          <div class="chat-log" id="chatLog">
            <div class="message bot">مرحبًا بك! أنا مساعد مكتبة الأمين. كيف أقدر أساعدك اليوم؟</div>
          </div>
          <form class="chat-form" id="chatForm">
            <input id="chatInput" placeholder="اكتب سؤالك..." autocomplete="off">
            <button type="submit">إرسال</button>
          </form>
        </div>
        <div class="reveal">
          <div class="card">
            <div class="card-body">
              <h3 style="margin-bottom:14px">أسئلة شائعة</h3>
              <div class="faq-list">
                ${DATA.faq.map(q => `<button class="faq-button" data-q="${esc(q)}">${esc(q)}</button>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  setTimeout(() => {
    const log = document.getElementById("chatLog");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");

    const reply = q => {
      const s = q.toLowerCase();
      if (s.includes("زائر") || s.includes("تسجيل")) return "يمكنك التسجيل من صفحة «الزائرون» في القائمة العلوية، وتستغرق العملية أقل من دقيقة.";
      if (s.includes("موعد") || s.includes("وقت") || s.includes("مفتوح")) return "المكتبة مفتوحة من الأحد إلى الخميس، من 8 صباحًا حتى 2 ظهرًا.";
      if (s.includes("كتاب") || s.includes("بحث")) return "استخدم خانة البحث في الصفحة الرئيسية، أو تصفّح «الكتب» من القائمة.";
      if (s.includes("مسابقة") || s.includes("جائزة")) return "المسابقات النشطة معروضة في صفحة «المسابقات».";
      if (s.includes("عضوية")) return "للحصول على عضوية المكتبة، تواصل مع الأستاذ محمد حامد داخل المكتبة.";
      return "سؤال جيد! حاليًا أنا مساعد تجريبي، وسأتمكن قريبًا من الإجابة على كل استفساراتك عبر قاعدة معرفة كاملة.";
    };

    const send = text => {
      const q = text.trim();
      if (!q) return;
      log.insertAdjacentHTML("beforeend", `<div class="message user">${esc(q)}</div>`);
      input.value = "";
      log.scrollTop = log.scrollHeight;
      setTimeout(() => {
        log.insertAdjacentHTML("beforeend", `<div class="message bot">${esc(reply(q))}</div>`);
        log.scrollTop = log.scrollHeight;
      }, 450);
    };

    form.addEventListener("submit", e => { e.preventDefault(); send(input.value); });
    document.querySelectorAll(".faq-button").forEach(b => {
      b.addEventListener("click", () => send(b.dataset.q));
    });
  });
}

/* ===== Dashboard ===== */
function renderDashboard() {
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">منطقة الإدارة</p>
          <h1>لوحة التحكم</h1>
          <p>إدارة المكتبة بالكامل.</p>
        </div>
        <a class="btn primary" href="#/" data-route>← عودة للرئيسية</a>
      </div>

      <div class="security-note reveal">
        <span style="font-size:22px">🛡️</span>
        <div>
          <strong>ملاحظة</strong>
          <p>هذه النسخة الثابتة (Static) — لإدارة كاملة مع مصادقة آمنة وقاعدة بيانات، نحتاج ترقية إلى Supabase. راجع الدليل المرفق.</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card reveal">
          <h3>📚 إدارة الكتب</h3>
          <p>إضافة وتعديل وحذف الكتب.</p>
          <a class="btn subtle" href="#/books" data-route>فتح الفهرس</a>
        </div>
        <div class="dashboard-card reveal">
          <h3>📢 الإعلانات</h3>
          <p>نشر إعلانات جديدة.</p>
          <a class="btn subtle" href="#/announcements" data-route>إدارة الإعلانات</a>
        </div>
        <div class="dashboard-card reveal">
          <h3>🏆 المسابقات</h3>
          <p>إنشاء المسابقات ومتابعتها.</p>
          <a class="btn subtle" href="#/competitions" data-route>إدارة المسابقات</a>
        </div>
        <div class="dashboard-card reveal">
          <h3>👥 الزوار</h3>
          <p>سجل الزوار والتقارير.</p>
          <a class="btn subtle" href="#/visitors" data-route>سجل الزوار</a>
        </div>
        <div class="dashboard-card reveal">
          <h3>🖼️ الوسائط</h3>
          <p>رفع الصور والملفات.</p>
          <button class="btn subtle" onclick="alert('قيد التطوير')">إدارة الوسائط</button>
        </div>
        <div class="dashboard-card reveal">
          <h3>⚙️ الإعدادات</h3>
          <p>النسخ الاحتياطي والمزامنة.</p>
          <button class="btn subtle" onclick="alert('قيد التطوير')">الإعدادات</button>
        </div>
      </div>
    </section>
  `;
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
    if (open) {
      nav.removeAttribute("style");
    } else {
      Object.assign(nav.style, {
        display: "flex", position: "absolute", top: "76px",
        right: "16px", left: "16px", flexDirection: "column",
        background: "var(--ink)", padding: "16px", borderRadius: "16px",
        gap: "6px", alignItems: "stretch", boxShadow: "var(--shadow-lg)"
      });
    }
  });
}

/* ===== Boot ===== */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  navigate(getPath(), false);
});
