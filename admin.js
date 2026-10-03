/* ============================================================
   admin.js — لوحة الإدارة الكاملة
   ============================================================ */

const ADMIN_ROUTES = {
  "/dashboard": renderAdminLogin,
  "/dashboard/books": renderAdminBooks,
  "/dashboard/announcements": renderAdminAnnouncements,
  "/dashboard/competitions": renderAdminCompetitions,
  "/dashboard/visitors": renderAdminVisitors,
  "/dashboard/borrowings": renderAdminBorrowings
};

/* ===== التحقق من الجلسة ===== */
async function getCurrentAdmin() {
  const { data: { session } } = await sb.auth.getSession();
  return session?.user || null;
}

async function adminLogin(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function adminLogout() {
  await sb.auth.signOut();
  navigate("/dashboard");
  toast("✓ تم تسجيل الخروج");
}

/* ===== بوابة الإدارة ===== */
async function renderAdminLogin() {
  const app = document.getElementById("app");
  const user = await getCurrentAdmin();

  if (user) {
    // مسجّل — عرض لوحة الإدارة
    return renderAdminHome(user);
  }

  // غير مسجّل — عرض نموذج الدخول
  app.innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">منطقة محمية</p>
          <h1>لوحة التحكم</h1>
          <p>سجّل الدخول للوصول إلى أدوات الإدارة.</p>
        </div>
      </div>

      <div class="content-grid" style="grid-template-columns:1fr 1fr">
        <div class="card reveal">
          <div class="card-body">
            <h3 style="margin-bottom:16px">تسجيل الدخول</h3>
            <form id="loginForm" style="display:grid;gap:14px">
              <input class="form-field" name="email" type="email" 
                     placeholder="البريد الإلكتروني" required autocomplete="email">
              <input class="form-field" name="password" type="password" 
                     placeholder="كلمة المرور" required autocomplete="current-password" minlength="8">
              <button class="btn primary block" type="submit" id="loginBtn">دخول</button>
              <p id="loginError" style="color:var(--brick);font-size:13px;display:none"></p>
            </form>
          </div>
        </div>

        <div class="card reveal">
          <div class="card-body">
            <h3 style="margin-bottom:12px">🛡️ ملاحظة أمنية</h3>
            <p style="color:var(--muted);font-size:13px;line-height:1.8;margin-bottom:12px">
              هذه المنطقة محمية بـ Supabase Auth. فقط المستخدمون المُصرّح لهم 
              (المشرفون) يمكنهم الوصول إلى أدوات الإدارة.
            </p>
            <ul style="color:var(--muted);font-size:12.5px;line-height:1.9;padding-inline-start:20px">
              <li>كلمة المرور مشفّرة بـ bcrypt</li>
              <li>جلسة آمنة عبر JWT</li>
              <li>Row Level Security فعّال</li>
              <li>سجل الوصول متاح في Supabase</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = document.getElementById("loginBtn");
    const err = document.getElementById("loginError");
    const form = e.target;
    btn.disabled = true;
    btn.textContent = "...جاري التحقق";
    err.style.display = "none";

    try {
      await adminLogin(form.email.value.trim(), form.password.value);
      toast("✓ مرحبًا بك");
      renderAdminHome(await getCurrentAdmin());
    } catch (e) {
      err.textContent = "بيانات دخول غير صحيحة.";
      err.style.display = "block";
      btn.disabled = false;
      btn.textContent = "دخول";
    }
  });
}

/* ===== الصفحة الرئيسية للإدارة ===== */
async function renderAdminHome(user) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">مرحبًا، ${esc(user.email.split("@")[0])}</p>
          <h1>لوحة الإدارة</h1>
          <p>إدارة كاملة للمكتبة.</p>
        </div>
        <button class="btn" onclick="adminLogout()" type="button">تسجيل الخروج ←</button>
      </div>

      <div class="stats-grid" id="adminStats">
        <div class="stat-card reveal"><strong>—</strong><span>كتاب</span></div>
        <div class="stat-card reveal"><strong>—</strong><span>زائر</span></div>
        <div class="stat-card reveal"><strong>—</strong><span>إعارة نشطة</span></div>
        <div class="stat-card reveal"><strong>—</strong><span>متأخر</span></div>
      </div>

      <div style="height:32px"></div>

      <div class="dashboard-grid">
        <a class="dashboard-card reveal" href="#/dashboard/books" data-route>
          <h3>📚 الكتب</h3>
          <p>إضافة، تعديل، حذف الكتب مع صور الأغلفة.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/announcements" data-route>
          <h3>📢 الإعلانات</h3>
          <p>نشر وإدارة الإعلانات.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/competitions" data-route>
          <h3>🏆 المسابقات</h3>
          <p>إنشاء المسابقات ومتابعتها.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/visitors" data-route>
          <h3>👥 الزوار</h3>
          <p>سجل الزوار مع تصدير CSV.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/borrowings" data-route>
          <h3>📖 الإعارات</h3>
          <p>تسجيل استعارة وإرجاع الكتب.</p>
        </a>
        <a class="dashboard-card reveal" href="https://supabase.com/dashboard/project/zaztjrfhilmuvpcrrbji" target="_blank" rel="noopener">
          <h3>🗄️ قاعدة البيانات</h3>
          <p>الوصول المباشر إلى Supabase.</p>
        </a>
      </div>
    </section>
  `;

  // جلب الإحصاءات
  try {
    const { data } = await sb.rpc("admin_stats");
    if (data) {
      const cards = document.querySelectorAll("#adminStats .stat-card strong");
      if (cards[0]) cards[0].textContent = data.books ?? "—";
      if (cards[1]) cards[1].textContent = data.visitors ?? "—";
      if (cards[2]) cards[2].textContent = data.borrowings_active ?? "—";
      if (cards[3]) cards[3].textContent = data.borrowings_late ?? "—";
    }
  } catch (e) {
    console.warn("Stats error:", e);
  }
}

/* ===== إدارة الكتب ===== */
async function renderAdminBooks() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");

  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">إدارة الفهرس</p>
          <h1>الكتب</h1>
          <p>${""}</p>
        </div>
        <div style="display:flex;gap:8px">
          <a class="btn" href="#/dashboard" data-route>← رجوع</a>
          <button class="btn primary" onclick="showBookForm()" type="button">+ كتاب جديد</button>
        </div>
      </div>

      <div id="bookFormContainer"></div>
      <div id="booksList" class="table-card reveal" style="padding:0;border-radius:16px;overflow:hidden">
        <div style="padding:24px;text-align:center;color:var(--muted)">جاري التحميل...</div>
      </div>
    </section>
  `;

  await refreshBooksList();
}

async function refreshBooksList() {
  const { data: books } = await sb.from("books").select("*").order("created_at", { ascending: false });
  const container = document.getElementById("booksList");
  if (!container) return;

  if (!books || !books.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">لا توجد كتب. أضف أول كتاب!</div>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>الكتاب</th>
          <th>المؤلف</th>
          <th>التصنيف</th>
          <th>المتاح</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>
        ${books.map(b => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:10px">
                ${b.cover_url 
                  ? `<img src="${esc(b.cover_url)}" alt="" style="width:36px;height:48px;object-fit:cover;border-radius:4px">` 
                  : `<div class="book-cover" style="width:32px;height:44px;font-size:9px">${esc((b.category||"?").slice(0,4))}</div>`}
                <strong>${esc(b.title)}</strong>
              </div>
            </td>
            <td>${esc(b.author)}</td>
            <td><span class="tag">${esc(b.category || "عام")}</span></td>
            <td>${b.available_copies}/${b.total_copies}</td>
            <td>
              <button class="btn subtle" style="padding:4px 10px;font-size:12px" 
                      onclick="editBook('${b.id}')" type="button">✏️</button>
              <button class="btn subtle" style="padding:4px 10px;font-size:12px;color:var(--brick)" 
                      onclick="deleteBook('${b.id}', '${esc(b.title).replace(/'/g, "\\'")}')" type="button">🗑️</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function showBookForm(book = null) {
  const container = document.getElementById("bookFormContainer");
  container.innerHTML = `
    <div class="card reveal" style="margin-bottom:20px">
      <div class="card-body">
        <h3 style="margin-bottom:16px">${book ? "تعديل كتاب" : "إضافة كتاب جديد"}</h3>
        <form id="bookForm" style="display:grid;gap:14px">
          <input type="hidden" name="id" value="${book?.id || ""}">
          <input class="form-field" name="title" placeholder="عنوان الكتاب *" required value="${esc(book?.title || "")}">
          <input class="form-field" name="author" placeholder="المؤلف *" required value="${esc(book?.author || "")}">
          <input class="form-field" name="category" placeholder="التصنيف (ديني، علوم، ...)" value="${esc(book?.category || "")}">
          <input class="form-field" name="isbn" placeholder="ISBN (اختياري)" value="${esc(book?.isbn || "")}">
          <input class="form-field" name="cover_url" placeholder="رابط صورة الغلاف (اختياري)" value="${esc(book?.cover_url || "")}">
          <textarea class="form-field" name="description" placeholder="وصف مختصر" rows="2">${esc(book?.description || "")}</textarea>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <input class="form-field" name="total_copies" type="number" min="1" placeholder="عدد النسخ" value="${book?.total_copies || 1}">
            <input class="form-field" name="available_copies" type="number" min="0" placeholder="المتاح" value="${book?.available_copies || 1}">
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn primary" type="submit">${book ? "حفظ التعديلات" : "إضافة الكتاب"}</button>
            <button class="btn subtle" type="button" onclick="document.getElementById('bookFormContainer').innerHTML=''">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("bookForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const id = form.id.value;
    const payload = {
      title: form.title.value.trim(),
      author: form.author.value.trim(),
      category: form.category.value.trim() || null,
      isbn: form.isbn.value.trim() || null,
      cover_url: form.cover_url.value.trim() || null,
      description: form.description.value.trim() || null,
      total_copies: parseInt(form.total_copies.value) || 1,
      available_copies: parseInt(form.available_copies.value) || 1
    };

    try {
      let error;
      if (id) {
        ({ error } = await sb.from("books").update(payload).eq("id", id));
      } else {
        ({ error } = await sb.from("books").insert(payload));
      }
      if (error) throw error;
      toast(id ? "✓ تم حفظ التعديلات" : "✓ تمت إضافة الكتاب");
      document.getElementById("bookFormContainer").innerHTML = "";
      refreshBooksList();
    } catch (e) {
      console.error(e);
      toast("خطأ: " + (e.message || "تعذّر الحفظ"));
    }
  });
}

async function editBook(id) {
  const { data } = await sb.from("books").select("*").eq("id", id).single();
  if (data) showBookForm(data);
}

async function deleteBook(id, title) {
  if (!confirm(`حذف "${title}"؟`)) return;
  const { error } = await sb.from("books").delete().eq("id", id);
  if (error) { toast("تعذّر الحذف"); return; }
  toast("✓ تم الحذف");
  refreshBooksList();
}

/* ===== إدارة الإعلانات ===== */
async function renderAdminAnnouncements() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");

  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">إدارة المحتوى</p>
          <h1>الإعلانات</h1>
        </div>
        <div style="display:flex;gap:8px">
          <a class="btn" href="#/dashboard" data-route>← رجوع</a>
        </div>
      </div>
      <div class="card reveal" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:16px">إضافة إعلان</h3>
          <form id="annForm" style="display:grid;gap:14px">
            <input class="form-field" name="title" placeholder="العنوان *" required>
            <textarea class="form-field" name="body" placeholder="النص *" required rows="3"></textarea>
            <input class="form-field" name="tag" placeholder="وسم (جديد، تنبيه، مبادرة)">
            <button class="btn primary" type="submit">نشر الإعلان</button>
          </form>
        </div>
      </div>
      <div id="annList" class="card reveal"></div>
    </section>
  `;

  document.getElementById("annForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const { error } = await sb.from("announcements").insert({
      title: form.title.value.trim(),
      body: form.body.value.trim(),
      tag: form.tag.value.trim() || "إعلان",
      active: true
    });
    if (error) { toast("تعذّر النشر"); return; }
    toast("✓ تم النشر");
    form.reset();
    refreshAnnList();
  });

  refreshAnnList();
}

async function refreshAnnList() {
  const { data } = await sb.from("announcements").select("*").order("published_at", { ascending: false });
  const container = document.getElementById("annList");
  if (!container) return;
  if (!data?.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">لا توجد إعلانات.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="card-body">
      ${data.map(a => {
        const d = new Date(a.published_at);
        return `
          <div class="announcement-item">
            <div class="date-box"><strong>${d.getDate()}</strong><small>${monthName(d.getMonth())}</small></div>
            <div class="item-content">
              <h3>${esc(a.title)}</h3>
              <p>${esc(a.body || "")}</p>
              <span class="tag">${esc(a.tag || "إعلان")}</span>
            </div>
            <button class="btn subtle" style="color:var(--brick);padding:4px 10px;font-size:12px" 
                    onclick="deleteAnn('${a.id}')" type="button">🗑️</button>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function deleteAnn(id) {
  if (!confirm("حذف هذا الإعلان؟")) return;
  const { error } = await sb.from("announcements").delete().eq("id", id);
  if (error) { toast("تعذّر الحذف"); return; }
  toast("✓ تم الحذف");
  refreshAnnList();
}

/* ===== إدارة المسابقات ===== */
async function renderAdminCompetitions() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");

  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">إدارة المحتوى</p>
          <h1>المسابقات</h1>
        </div>
        <a class="btn" href="#/dashboard" data-route>← رجوع</a>
      </div>
      <div class="card reveal" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:16px">إضافة مسابقة</h3>
          <form id="compForm" style="display:grid;gap:14px">
            <input class="form-field" name="title" placeholder="عنوان المسابقة *" required>
            <textarea class="form-field" name="body" placeholder="الوصف *" required rows="3"></textarea>
            <input class="form-field" name="deadline" type="date" required>
            <button class="btn primary" type="submit">إضافة المسابقة</button>
          </form>
        </div>
      </div>
      <div id="compList" class="card reveal"></div>
    </section>
  `;

  document.getElementById("compForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const { error } = await sb.from("competitions").insert({
      title: form.title.value.trim(),
      body: form.body.value.trim(),
      deadline: form.deadline.value,
      active: true
    });
    if (error) { toast("تعذّرت الإضافة"); return; }
    toast("✓ تمت الإضافة");
    form.reset();
    refreshCompList();
  });

  refreshCompList();
}

async function refreshCompList() {
  const { data } = await sb.from("competitions").select("*").order("deadline");
  const container = document.getElementById("compList");
  if (!container) return;
  if (!data?.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">لا توجد مسابقات.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="card-body">
      ${data.map(c => {
        const d = new Date(c.deadline);
        return `
          <div class="competition-item">
            <div class="date-box"><strong>${d.getDate()}</strong><small>${monthName(d.getMonth())}</small></div>
            <div class="item-content">
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.body || "")}</p>
              <span class="tag">${c.active ? "نشطة" : "معطلة"}</span>
            </div>
            <button class="btn subtle" style="color:var(--brick);padding:4px 10px;font-size:12px" 
                    onclick="deleteComp('${c.id}')" type="button">🗑️</button>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function deleteComp(id) {
  if (!confirm("حذف هذه المسابقة؟")) return;
  const { error } = await sb.from("competitions").delete().eq("id", id);
  if (error) { toast("تعذّر الحذف"); return; }
  toast("✓ تم الحذف");
  refreshCompList();
}

/* ===== سجل الزوار ===== */
async function renderAdminVisitors() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");

  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">السجلات</p>
          <h1>الزوار</h1>
        </div>
        <div style="display:flex;gap:8px">
          <a class="btn" href="#/dashboard" data-route>← رجوع</a>
          <button class="btn gold" onclick="exportVisitorsCSV()" type="button">⬇ تصدير CSV</button>
        </div>
      </div>
      <div id="visitorsList" class="table-card reveal" style="padding:0;border-radius:16px;overflow:hidden">
        <div style="padding:24px;text-align:center;color:var(--muted)">جاري التحميل...</div>
      </div>
    </section>
  `;

  refreshVisitorsList();
}

let _visitorsCache = [];

async function refreshVisitorsList() {
  const { data } = await sb.from("visitors").select("*").order("visited_at", { ascending: false }).limit(200);
  _visitorsCache = data || [];
  const container = document.getElementById("visitorsList");
  if (!container) return;

  if (!data?.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">لا يوجد زوار بعد.</div>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الصف / الجهة</th>
          <th>الغرض</th>
          <th>التاريخ</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(v => {
          const d = new Date(v.visited_at);
          return `
            <tr>
              <td><strong>${esc(v.name)}</strong></td>
              <td>${esc(v.affiliation || "—")}</td>
              <td>${esc(v.purpose || "—")}</td>
              <td>${d.toLocaleDateString("ar-EG")} ${d.toLocaleTimeString("ar-EG", {hour: "2-digit", minute: "2-digit"})}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function exportVisitorsCSV() {
  if (!_visitorsCache.length) { toast("لا يوجد زوار للتصدير"); return; }
  const rows = [["الاسم", "الصف/الجهة", "الغرض", "التاريخ"]];
  _visitorsCache.forEach(v => {
    rows.push([
      v.name || "",
      v.affiliation || "",
      v.purpose || "",
      new Date(v.visited_at).toLocaleString("ar-EG")
    ]);
  });
  const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `visitors-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast("✓ تم التصدير");
}

/* ===== الإعارات ===== */
async function renderAdminBorrowings() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");

  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">نظام الاستعارة</p>
          <h1>الإعارات</h1>
        </div>
        <a class="btn" href="#/dashboard" data-route>← رجوع</a>
      </div>
      <div class="card reveal" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:16px">تسجيل استعارة</h3>
          <form id="borrowForm" style="display:grid;gap:14px">
            <select class="form-field" name="book_id" id="bookSelect" required>
              <option value="">اختر الكتاب...</option>
            </select>
            <input class="form-field" name="borrower_name" placeholder="اسم المستعير *" required>
            <input class="form-field" name="borrower_class" placeholder="الصف">
            <input class="form-field" name="borrower_phone" placeholder="الهاتف">
            <input class="form-field" name="due_at" type="date" required>
            <button class="btn primary" type="submit">تسجيل الاستعارة</button>
          </form>
        </div>
      </div>
      <div id="borrowList" class="table-card reveal" style="padding:0;border-radius:16px;overflow:hidden"></div>
    </section>
  `;

  // جلب الكتب للقائمة
  const { data: books } = await sb.from("books").select("id,title,available_copies").order("title");
  const sel = document.getElementById("bookSelect");
  if (books) {
    books.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = `${b.title} (${b.available_copies} متاح)`;
      if (b.available_copies <= 0) opt.disabled = true;
      sel.appendChild(opt);
    });
  }

  document.getElementById("borrowForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const bookId = form.book_id.value;
    const payload = {
      book_id: bookId,
      borrower_name: form.borrower_name.value.trim(),
      borrower_class: form.borrower_class.value.trim() || null,
      borrower_phone: form.borrower_phone.value.trim() || null,
      due_at: new Date(form.due_at.value).toISOString(),
      status: "active"
    };
    try {
      const { error } = await sb.from("borrowings").insert(payload);
      if (error) throw error;
      // خصم نسخة
      const { data: book } = await sb.from("books").select("available_copies").eq("id", bookId).single();
      if (book && book.available_copies > 0) {
        await sb.from("books").update({ available_copies: book.available_copies - 1 }).eq("id", bookId);
      }
      toast("✓ تم تسجيل الاستعارة");
      form.reset();
      renderAdminBorrowings();
    } catch (e) {
      console.error(e);
      toast("خطأ: " + (e.message || "تعذّر التسجيل"));
    }
  });

  refreshBorrowList();
}

async function refreshBorrowList() {
  const { data } = await sb.from("borrowings")
    .select("*, books(title)")
    .order("borrowed_at", { ascending: false })
    .limit(100);
  const container = document.getElementById("borrowList");
  if (!container) return;

  if (!data?.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">لا توجد إعارات.</div>`;
    return;
  }

  const now = new Date();
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>الكتاب</th>
          <th>المستعير</th>
          <th>الاستعارة</th>
          <th>الاستحقاق</th>
          <th>الحالة</th>
          <th>إجراء</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(b => {
          const due = new Date(b.due_at);
          const isLate = b.status === "active" && due < now;
          const statusLabel = b.status === "returned" ? "مُرجَع" : (isLate ? "متأخر" : "نشط");
          const statusColor = b.status === "returned" ? "var(--teal)" : (isLate ? "var(--brick)" : "var(--gold-dark)");
          return `
            <tr>
              <td><strong>${esc(b.books?.title || "—")}</strong></td>
              <td>${esc(b.borrower_name)}${b.borrower_class ? ` (${esc(b.borrower_class)})` : ""}</td>
              <td>${new Date(b.borrowed_at).toLocaleDateString("ar-EG")}</td>
              <td>${due.toLocaleDateString("ar-EG")}</td>
              <td><span style="color:${statusColor};font-weight:700">${statusLabel}</span></td>
              <td>
                ${b.status === "active" 
                  ? `<button class="btn subtle" style="padding:4px 10px;font-size:12px" 
                            onclick="returnBook('${b.id}', '${b.book_id}')" type="button">📥 إرجاع</button>` 
                  : "—"}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

async function returnBook(borrowId, bookId) {
  if (!confirm("تأكيد إرجاع الكتاب؟")) return;
  try {
    await sb.from("borrowings").update({ 
      status: "returned", 
      returned_at: new Date().toISOString() 
    }).eq("id", borrowId);

    // إعادة النسخة
    const { data: book } = await sb.from("books").select("available_copies,total_copies").eq("id", bookId).single();
    if (book) {
      const newAvail = Math.min(book.available_copies + 1, book.total_copies);
      await sb.from("books").update({ available_copies: newAvail }).eq("id", bookId);
    }
    toast("✓ تم إرجاع الكتاب");
    refreshBorrowList();
  } catch (e) {
    console.error(e);
    toast("تعذّر الإرجاع");
  }
}

/* ===== ربط لوحة الإدارة بالتوجيه ===== */
window.ADMIN_ROUTES = ADMIN_ROUTES;
window.adminLogout = adminLogout;
window.showBookForm = showBookForm;
window.editBook = editBook;
window.deleteBook = deleteBook;
window.deleteAnn = deleteAnn;
window.deleteComp = deleteComp;
window.exportVisitorsCSV = exportVisitorsCSV;
window.returnBook = returnBook;
