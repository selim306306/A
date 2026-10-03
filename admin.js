/* ============================================================
   admin.js — لوحة الإدارة الكاملة
   ============================================================ */

const ADMIN_ROUTES = {
  "/dashboard": renderAdminLogin,
  "/dashboard/books": renderAdminBooks,
  "/dashboard/announcements": renderAdminAnnouncements,
  "/dashboard/competitions": renderAdminCompetitions,
  "/dashboard/visitors": renderAdminVisitors,
  "/dashboard/borrowings": renderAdminBorrowings,
  "/dashboard/ai": renderAdminAI
};

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

async function renderAdminLogin() {
  const app = document.getElementById("app");
  const user = await getCurrentAdmin();
  if (user) return renderAdminHome(user);

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
              <input class="form-field" name="email" type="email" placeholder="البريد الإلكتروني" required>
              <input class="form-field" name="password" type="password" placeholder="كلمة المرور" required>
              <button class="btn primary block" type="submit" id="loginBtn">دخول</button>
              <p id="loginError" style="color:var(--brick);font-size:13px;display:none"></p>
            </form>
          </div>
        </div>
        <div class="card reveal">
          <div class="card-body">
            <h3 style="margin-bottom:12px">🛡️ منطقة آمنة</h3>
            <p style="color:var(--muted);font-size:13px;line-height:1.8">
              محمية بـ Supabase Auth. فقط المشرفون يمكنهم الوصول.
            </p>
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

async function renderAdminHome(user) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">مرحبًا</p>
          <h1>لوحة الإدارة</h1>
          <p>${esc(user.email)}</p>
        </div>
        <button class="btn" onclick="adminLogout()" type="button">تسجيل الخروج</button>
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
          <h3>📚 الكتب</h3><p>إضافة وتعديل الكتب.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/announcements" data-route>
          <h3>📢 الإعلانات</h3><p>نشر وإدارة الإعلانات.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/competitions" data-route>
          <h3>🏆 المسابقات</h3><p>إنشاء ومتابعة المسابقات.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/visitors" data-route>
          <h3>👥 الزوار</h3><p>سجل الزوار مع CSV.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/borrowings" data-route>
          <h3>📖 الإعارات</h3><p>تسجيل استعارة وإرجاع.</p>
        </a>
        <a class="dashboard-card reveal" href="#/dashboard/ai" data-route>
          <h3>🤖 إعدادات الذكاء الاصطناعي</h3><p>مفتاح API، النموذج، اختبار الاتصال.</p>
        </a>
        <a class="dashboard-card reveal" href="https://supabase.com/dashboard/project/zaztjrfhilmuvpcrrbji" target="_blank" rel="noopener">
          <h3>🗄️ قاعدة البيانات</h3><p>Supabase مباشرة.</p>
        </a>
      </div>
    </section>
  `;
  try {
    const { data } = await sb.rpc("admin_stats");
    if (data) {
      const c = document.querySelectorAll("#adminStats .stat-card strong");
      if (c[0]) c[0].textContent = data.books ?? "—";
      if (c[1]) c[1].textContent = data.visitors ?? "—";
      if (c[2]) c[2].textContent = data.borrowings_active ?? "—";
      if (c[3]) c[3].textContent = data.borrowings_late ?? "—";
    }
  } catch (e) { console.warn(e); }
}

/* ===== الكتب ===== */
async function renderAdminBooks() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div><p class="eyebrow">إدارة</p><h1>الكتب</h1></div>
        <div style="display:flex;gap:8px">
          <a class="btn" href="#/dashboard" data-route>← رجوع</a>
          <button class="btn primary" onclick="showBookForm()" type="button">+ كتاب جديد</button>
        </div>
      </div>
      <div id="bookFormContainer"></div>
      <div id="booksList"></div>
    </section>
  `;
  refreshBooksList();
}

async function refreshBooksList() {
  const { data: books } = await sb.from("books").select("*").order("created_at", { ascending: false });
  const container = document.getElementById("booksList");
  if (!container) return;
  if (!books || !books.length) {
    container.innerHTML = `<div class="card" style="padding:40px;text-align:center;color:var(--muted)">لا توجد كتب.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="card" style="padding:0">
      <table>
        <thead><tr><th>الكتاب</th><th>المؤلف</th><th>التصنيف</th><th>المتاح</th><th>إجراءات</th></tr></thead>
        <tbody>
          ${books.map(b => `
            <tr>
              <td><strong>${esc(b.title)}</strong></td>
              <td>${esc(b.author)}</td>
              <td><span class="tag">${esc(b.category || "عام")}</span></td>
              <td>${b.available_copies}/${b.total_copies}</td>
              <td>
                <button class="btn subtle" style="padding:4px 10px;font-size:12px" onclick="editBook('${b.id}')" type="button">✏️</button>
                <button class="btn subtle" style="padding:4px 10px;font-size:12px;color:var(--brick)" onclick="deleteBook('${b.id}','${esc(b.title)}')" type="button">🗑️</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function showBookForm(book = null) {
  const container = document.getElementById("bookFormContainer");
  container.innerHTML = `
    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <h3 style="margin-bottom:16px">${book ? "تعديل كتاب" : "كتاب جديد"}</h3>
        <form id="bookForm" style="display:grid;gap:14px">
          <input type="hidden" name="id" value="${book?.id || ""}">
          <input class="form-field" name="title" placeholder="العنوان *" required value="${esc(book?.title || "")}">
          <input class="form-field" name="author" placeholder="المؤلف *" required value="${esc(book?.author || "")}">
          <input class="form-field" name="category" placeholder="التصنيف" value="${esc(book?.category || "")}">
          <input class="form-field" name="cover_url" placeholder="رابط صورة الغلاف" value="${esc(book?.cover_url || "")}">
          <textarea class="form-field" name="description" placeholder="وصف" rows="2">${esc(book?.description || "")}</textarea>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <input class="form-field" name="total_copies" type="number" min="1" value="${book?.total_copies || 1}">
            <input class="form-field" name="available_copies" type="number" min="0" value="${book?.available_copies || 1}">
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn primary" type="submit">${book ? "حفظ" : "إضافة"}</button>
            <button class="btn subtle" type="button" onclick="document.getElementById('bookFormContainer').innerHTML=''">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.getElementById("bookForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      title: form.title.value.trim(),
      author: form.author.value.trim(),
      category: form.category.value.trim() || null,
      cover_url: form.cover_url.value.trim() || null,
      description: form.description.value.trim() || null,
      total_copies: parseInt(form.total_copies.value) || 1,
      available_copies: parseInt(form.available_copies.value) || 1
    };
    try {
      const id = form.id.value;
      let result;
      if (id) result = await sb.from("books").update(payload).eq("id", id);
      else result = await sb.from("books").insert(payload);
      if (result.error) throw result.error;
      toast(id ? "✓ تم الحفظ" : "✓ تمت الإضافة");
      document.getElementById("bookFormContainer").innerHTML = "";
      refreshBooksList();
    } catch (err) {
      console.error(err);
      toast("خطأ: " + err.message);
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

/* ===== الإعلانات ===== */
async function renderAdminAnnouncements() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div><p class="eyebrow">محتوى</p><h1>الإعلانات</h1></div>
        <a class="btn" href="#/dashboard" data-route>← رجوع</a>
      </div>
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:16px">إعلان جديد</h3>
          <form id="annForm" style="display:grid;gap:14px">
            <input class="form-field" name="title" placeholder="العنوان *" required>
            <textarea class="form-field" name="body" placeholder="النص *" required rows="3"></textarea>
            <input class="form-field" name="tag" placeholder="وسم">
            <button class="btn primary" type="submit">نشر</button>
          </form>
        </div>
      </div>
      <div id="annList"></div>
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
    container.innerHTML = `<div class="card" style="padding:40px;text-align:center;color:var(--muted)">لا توجد إعلانات.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="card"><div class="card-body">
      ${data.map(a => `
        <div class="announcement-item">
          <div class="item-content">
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.body || "")}</p>
            <span class="tag">${esc(a.tag || "إعلان")}</span>
          </div>
          <button class="btn subtle" style="color:var(--brick);padding:4px 10px;font-size:12px" onclick="deleteAnn('${a.id}')" type="button">🗑️</button>
        </div>
      `).join("")}
    </div></div>
  `;
}

async function deleteAnn(id) {
  if (!confirm("حذف؟")) return;
  const { error } = await sb.from("announcements").delete().eq("id", id);
  if (error) { toast("تعذّر"); return; }
  toast("✓ تم الحذف");
  refreshAnnList();
}

/* ===== المسابقات ===== */
async function renderAdminCompetitions() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div><p class="eyebrow">محتوى</p><h1>المسابقات</h1></div>
        <a class="btn" href="#/dashboard" data-route>← رجوع</a>
      </div>
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:16px">مسابقة جديدة</h3>
          <form id="compForm" style="display:grid;gap:14px">
            <input class="form-field" name="title" placeholder="العنوان *" required>
            <textarea class="form-field" name="body" placeholder="الوصف *" required rows="3"></textarea>
            <input class="form-field" name="deadline" type="date" required>
            <button class="btn primary" type="submit">إضافة</button>
          </form>
        </div>
      </div>
      <div id="compList"></div>
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
    if (error) { toast("تعذّرت"); return; }
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
    container.innerHTML = `<div class="card" style="padding:40px;text-align:center;color:var(--muted)">لا توجد مسابقات.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="card"><div class="card-body">
      ${data.map(c => `
        <div class="competition-item">
          <div class="item-content">
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.body || "")}</p>
            <span class="tag">${c.active ? "نشطة" : "معطلة"}</span>
          </div>
          <button class="btn subtle" style="color:var(--brick);padding:4px 10px;font-size:12px" onclick="deleteComp('${c.id}')" type="button">🗑️</button>
        </div>
      `).join("")}
    </div></div>
  `;
}

async function deleteComp(id) {
  if (!confirm("حذف؟")) return;
  const { error } = await sb.from("competitions").delete().eq("id", id);
  if (error) { toast("تعذّر"); return; }
  toast("✓ تم الحذف");
  refreshCompList();
}

/* ===== الزوار ===== */
async function renderAdminVisitors() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");
  document.getElementById("app").innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div><p class="eyebrow">سجلات</p><h1>الزوار</h1></div>
        <div style="display:flex;gap:8px">
          <a class="btn" href="#/dashboard" data-route>← رجوع</a>
          <button class="btn gold" onclick="exportVisitorsCSV()" type="button">⬇ CSV</button>
        </div>
      </div>
      <div id="visitorsList"></div>
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
    container.innerHTML = `<div class="card" style="padding:40px;text-align:center;color:var(--muted)">لا يوجد زوار.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="card" style="padding:0">
      <table>
        <thead><tr><th>الاسم</th><th>الصف/الجهة</th><th>الغرض</th><th>التاريخ</th></tr></thead>
        <tbody>
          ${data.map(v => `
            <tr>
              <td><strong>${esc(v.name)}</strong></td>
              <td>${esc(v.affiliation || "—")}</td>
              <td>${esc(v.purpose || "—")}</td>
              <td>${new Date(v.visited_at).toLocaleString("ar-EG")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function exportVisitorsCSV() {
  if (!_visitorsCache.length) { toast("لا يوجد زوار"); return; }
  const rows = [["الاسم", "الصف/الجهة", "الغرض", "التاريخ"]];
  _visitorsCache.forEach(v => {
    rows.push([v.name || "", v.affiliation || "", v.purpose || "", new Date(v.visited_at).toLocaleString("ar-EG")]);
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
        <div><p class="eyebrow">إدارة</p><h1>الإعارات</h1></div>
        <a class="btn" href="#/dashboard" data-route>← رجوع</a>
      </div>
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:16px">استعارة جديدة</h3>
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
      <div id="borrowList"></div>
    </section>
  `;
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
    try {
      const { error } = await sb.from("borrowings").insert({
        book_id: bookId,
        borrower_name: form.borrower_name.value.trim(),
        borrower_class: form.borrower_class.value.trim() || null,
        borrower_phone: form.borrower_phone.value.trim() || null,
        due_at: new Date(form.due_at.value).toISOString(),
        status: "active"
      });
      if (error) throw error;
      const { data: book } = await sb.from("books").select("available_copies").eq("id", bookId).single();
      if (book && book.available_copies > 0) {
        await sb.from("books").update({ available_copies: book.available_copies - 1 }).eq("id", bookId);
      }
      toast("✓ تم تسجيل الاستعارة");
      renderAdminBorrowings();
    } catch (err) {
      console.error(err);
      toast("خطأ: " + err.message);
    }
  });
  refreshBorrowList();
}

async function refreshBorrowList() {
  const { data } = await sb.from("borrowings").select("*, books(title)").order("borrowed_at", { ascending: false }).limit(100);
  const container = document.getElementById("borrowList");
  if (!container) return;
  if (!data?.length) {
    container.innerHTML = `<div class="card" style="padding:40px;text-align:center;color:var(--muted)">لا توجد إعارات.</div>`;
    return;
  }
  const now = new Date();
  container.innerHTML = `
    <div class="card" style="padding:0">
      <table>
        <thead><tr><th>الكتاب</th><th>المستعير</th><th>الاستحقاق</th><th>الحالة</th><th>إجراء</th></tr></thead>
        <tbody>
          ${data.map(b => {
            const due = new Date(b.due_at);
            const isLate = b.status === "active" && due < now;
            const label = b.status === "returned" ? "مُرجَع" : (isLate ? "متأخر" : "نشط");
            const color = b.status === "returned" ? "var(--teal)" : (isLate ? "var(--brick)" : "var(--gold-dark)");
            return `
              <tr>
                <td><strong>${esc(b.books?.title || "—")}</strong></td>
                <td>${esc(b.borrower_name)}</td>
                <td>${due.toLocaleDateString("ar-EG")}</td>
                <td><span style="color:${color};font-weight:700">${label}</span></td>
                <td>
                  ${b.status === "active" 
                    ? `<button class="btn subtle" style="padding:4px 10px;font-size:12px" onclick="returnBook('${b.id}','${b.book_id}')" type="button">📥 إرجاع</button>` 
                    : "—"}
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function returnBook(borrowId, bookId) {
  if (!confirm("تأكيد الإرجاع؟")) return;
  try {
    await sb.from("borrowings").update({ status: "returned", returned_at: new Date().toISOString() }).eq("id", borrowId);
    const { data: book } = await sb.from("books").select("available_copies,total_copies").eq("id", bookId).single();
    if (book) {
      const n = Math.min(book.available_copies + 1, book.total_copies);
      await sb.from("books").update({ available_copies: n }).eq("id", bookId);
    }
    toast("✓ تم الإرجاع");
    refreshBorrowList();
  } catch (e) {
    console.error(e);
    toast("تعذّر الإرجاع");
  }
}

/* ===== إعدادات الذكاء الاصطناعي ===== */
async function renderAdminAI() {
  const user = await getCurrentAdmin();
  if (!user) return navigate("/dashboard");

  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="page-shell">
      <div class="page-hero reveal">
        <div>
          <p class="eyebrow">إدارة متقدمة</p>
          <h1>إعدادات الذكاء الاصطناعي</h1>
          <p>مفتاح API، النموذج، واختبار الاتصال.</p>
        </div>
        <a class="btn" href="#/dashboard" data-route>← رجوع</a>
      </div>

      <div class="content-grid" style="grid-template-columns:1.2fr .8fr">
        <div class="card reveal">
          <div class="card-body">
            <h3 style="margin-bottom:16px">⚙️ إعدادات المساعد</h3>
            <form id="aiForm" style="display:grid;gap:14px">
              <div>
                <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">
                  مزوّد الذكاء الاصطناعي
                </label>
                <select class="form-field" name="provider" id="providerSelect">
                  <option value="gemini">Google Gemini (مجاني)</option>
                  <option value="openai">OpenAI (مدفوع)</option>
                  <option value="anthropic">Anthropic Claude (مدفوع)</option>
                </select>
              </div>

              <div>
                <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">
                  النموذج
                </label>
                <select class="form-field" name="model_name" id="modelSelect">
                  <!-- يمتلئ ديناميكيًا -->
                </select>
                <p style="color:var(--muted);font-size:11px;margin-top:6px" id="modelHint">
                  أحدث النماذج المتاحة.
                </p>
              </div>

              <div>
                <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px">
                  مفتاح API
                </label>
                <input class="form-field" name="api_key" type="password" 
                       placeholder="الصق المفتاح هنا..." id="apiKeyInput" autocomplete="off">
                <p style="color:var(--muted);font-size:11px;margin-top:6px">
                  🔒 محفوظ في Supabase. الوصول مقصور على المشرفين.
                </p>
              </div>

              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="btn primary" type="submit" id="saveBtn">💾 حفظ الإعدادات</button>
                <button class="btn gold" type="button" id="testBtn">🔬 اختبار الاتصال</button>
              </div>
            </form>

            <div id="testResult" style="margin-top:16px;display:none"></div>
          </div>
        </div>

        <div class="reveal">
          <div class="card">
            <div class="card-body">
              <h3 style="margin-bottom:14px">📖 كيف أحصل على مفتاح؟</h3>
              
              <div style="display:grid;gap:12px;font-size:13px;line-height:1.7">
                <div>
                  <strong style="color:var(--teal)">Google Gemini (مجاني):</strong>
                  <ol style="padding-inline-start:20px;margin-top:4px;color:var(--muted)">
                    <li>افتح <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="color:var(--teal)">AI Studio</a></li>
                    <li>سجّل بحساب Google</li>
                    <li>اضغط "Create API key"</li>
                    <li>انسخ المفتاح (يبدأ بـ AIzaSy)</li>
                  </ol>
                </div>

                <div>
                  <strong style="color:var(--teal)">OpenAI (مدفوع):</strong>
                  <ol style="padding-inline-start:20px;margin-top:4px;color:var(--muted)">
                    <li>افتح <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" style="color:var(--teal)">platform.openai.com</a></li>
                    <li>أنشئ مفتاحًا (يبدأ بـ sk-)</li>
                  </ol>
                </div>

                <div>
                  <strong style="color:var(--teal)">Anthropic (مدفوع):</strong>
                  <ol style="padding-inline-start:20px;margin-top:4px;color:var(--muted)">
                    <li>افتح <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style="color:var(--teal)">console.anthropic.com</a></li>
                    <li>أنشئ مفتاحًا (يبدأ بـ sk-ant-)</li>
                  </ol>
                </div>
              </div>

              <div class="security-note" style="margin-top:16px;font-size:12px">
                <span>🛡️</span>
                <div>
                  <strong>أمان</strong>
                  <p>المفاتيح مشفّرة ومحمية بـ RLS. لا تظهر لأي زائر.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // قوائم النماذج لكل مزوّد — محدّثة لتشمل Gemini 3.5 وأعلى
  const MODELS = {
    gemini: [
      { value: "gemini-3.8-flash", label: "Gemini 3.8 Flash (الأحدث)" },
      { value: "gemini-3.7-flash", label: "Gemini 3.7 Flash" },
      { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
      { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash (موصى به)" },
      { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite" },
      { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (تجريبي)" },
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (قديم)" },
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (قديم)" }
    ],
    openai: [
      { value: "gpt-4o", label: "GPT-4o (الأقوى)" },
      { value: "gpt-4o-mini", label: "GPT-4o mini (اقتصادي)" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" }
    ],
    anthropic: [
      { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (الأقوى)" },
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
      { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (سريع)" }
    ]
  };

  const providerSelect = document.getElementById("providerSelect");
  const modelSelect = document.getElementById("modelSelect");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const modelHint = document.getElementById("modelHint");

  function fillModels(provider, selected = null) {
    modelSelect.innerHTML = "";
    MODELS[provider].forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.value;
      opt.textContent = m.label;
      if (m.value === selected) opt.selected = true;
      modelSelect.appendChild(opt);
    });
    modelHint.textContent = {
      gemini: "نماذج Google المجانية. 3.8 هو الأحدث.",
      openai: "تحتاج رصيدًا في حسابك.",
      anthropic: "تحتاج رصيدًا في حسابك."
    }[provider] || "";
  }

  // جلب الإعدادات الحالية
  try {
    const { data } = await sb.from("ai_settings").select("*").order("updated_at", { ascending: false }).limit(1).single();
    if (data) {
      providerSelect.value = data.provider || "gemini";
      fillModels(data.provider || "gemini", data.model_name);
      if (data.api_key) {
        const masked = data.api_key.slice(0, 6) + "..." + data.api_key.slice(-4);
        apiKeyInput.placeholder = `محفوظ: ${masked} (اتركه فارغًا للإبقاء)`;
        apiKeyInput.value = "";
        apiKeyInput.dataset.saved = "true";
      }
    } else {
      fillModels("gemini");
    }
  } catch (e) {
    fillModels("gemini");
  }

  providerSelect.addEventListener("change", () => {
    fillModels(providerSelect.value);
  });

  // حفظ الإعدادات
  document.getElementById("aiForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = document.getElementById("saveBtn");
    btn.disabled = true;
    btn.textContent = "...جاري الحفظ";

    try {
      const payload = {
        provider: providerSelect.value,
        model_name: modelSelect.value,
        updated_at: new Date().toISOString()
      };

      const newKey = apiKeyInput.value.trim();
      if (newKey) payload.api_key = newKey;

      const { data: existing } = await sb.from("ai_settings").select("id").limit(1).maybeSingle();

      let result;
      if (existing) {
        result = await sb.from("ai_settings").update(payload).eq("id", existing.id);
      } else {
        result = await sb.from("ai_settings").insert(payload);
      }

      if (result.error) throw result.error;

      toast("✓ تم حفظ الإعدادات");
      if (newKey) {
        apiKeyInput.value = "";
        apiKeyInput.placeholder = "محفوظ ✓";
      }
    } catch (err) {
      console.error(err);
      toast("خطأ: " + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "💾 حفظ الإعدادات";
    }
  });

  // اختبار الاتصال
  document.getElementById("testBtn").addEventListener("click", async () => {
    const btn = document.getElementById("testBtn");
    const resultBox = document.getElementById("testResult");
    btn.disabled = true;
    btn.textContent = "...جاري الاختبار";
    resultBox.style.display = "none";

    try {
      const { data } = await sb.from("ai_settings").select("*").limit(1).single();
      if (!data?.api_key) {
        throw new Error("لا يوجد مفتاح محفوظ. احفظ المفتاح أولًا.");
      }

      const testPrompt = "قل فقط: اختبار ناجح ✓";
      let answer = "";

      if (data.provider === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${data.model_name}:generateContent`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": data.api_key
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 50 }
          })
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || `HTTP ${res.status}`);
        }
        answer = json.candidates?.[0]?.content?.parts?.[0]?.text || "(لا يوجد رد)";
      } else if (data.provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.api_key}`
          },
          body: JSON.stringify({
            model: data.model_name,
            messages: [{ role: "user", content: testPrompt }],
            max_tokens: 50
          })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`);
        answer = json.choices?.[0]?.message?.content || "(لا يوجد رد)";
      } else if (data.provider === "anthropic") {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": data.api_key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify({
            model: data.model_name,
            max_tokens: 50,
            messages: [{ role: "user", content: testPrompt }]
          })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`);
        answer = json.content?.[0]?.text || "(لا يوجد رد)";
      }

      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="padding:14px;border-radius:12px;background:rgba(14,124,123,.1);border:1px solid var(--teal);color:var(--teal-dark)">
          <strong>✅ الاتصال ناجح!</strong>
          <p style="margin:6px 0 0;font-size:13px">
            <strong>النموذج:</strong> ${esc(data.model_name)}<br>
            <strong>الرد:</strong> ${esc(answer)}
          </p>
        </div>
      `;
      toast("✓ الاتصال ناجح");
    } catch (err) {
      console.error(err);
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="padding:14px;border-radius:12px;background:rgba(179,75,61,.1);border:1px solid var(--brick);color:var(--brick)">
          <strong>❌ فشل الاتصال</strong>
          <p style="margin:6px 0 0;font-size:13px">${esc(err.message)}</p>
          <p style="margin:6px 0 0;font-size:11px;color:var(--muted)">
            تحقق من: صحة المفتاح، اسم النموذج، واتصال الإنترنت.
          </p>
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.textContent = "🔬 اختبار الاتصال";
    }
  });
}

window.ADMIN_ROUTES = ADMIN_ROUTES;
window.adminLogout = adminLogout;
window.showBookForm = showBookForm;
window.editBook = editBook;
window.deleteBook = deleteBook;
window.deleteAnn = deleteAnn;
window.deleteComp = deleteComp;
window.exportVisitorsCSV = exportVisitorsCSV;
window.returnBook = returnBook;
window.renderAdminAI = renderAdminAI;
