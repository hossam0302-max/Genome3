/* PGDMS — Role-based navigation & interactions */

const ROLES = {
  researcher: {
    label: "الباحث / الموظف",
    short: "باحث",
    name: "أحمد السبيعي",
    avatar: "أح",
    home: "dashboard",
    nav: [
      { section: "الرئيسية" },
      { id: "dashboard", label: "لوحة المؤشرات", icon: "📊" },
      { section: "البيانات النباتية" },
      { id: "plants", label: "إدارة النباتات", icon: "🌿" },
      { id: "plant-new", label: "تسجيل نبات جديد", icon: "＋" },
      { id: "samples", label: "إدارة العينات", icon: "🧪" },
      { id: "sample-new", label: "تسجيل عينة", icon: "＋" },
      { section: "التقارير" },
      { id: "reports", label: "التقارير والإحصائيات", icon: "📑" },
    ],
  },
  technician: {
    label: "فني المختبر",
    short: "فني مختبر",
    name: "فهد العتيبي",
    avatar: "فه",
    home: "dashboard",
    nav: [
      { section: "الرئيسية" },
      { id: "dashboard", label: "لوحة المؤشرات", icon: "📊" },
      { section: "عمليات المختبر" },
      { id: "receive", label: "استلام ومراجعة العينات", icon: "📥" },
      { id: "samples", label: "متابعة العينات", icon: "🧪" },
      { id: "analysis", label: "التحاليل والنتائج والملفات", icon: "🔬" },
      { section: "التقارير" },
      { id: "reports", label: "تقارير محدودة", icon: "📑" },
    ],
  },
  manager: {
    label: "مدير المختبر",
    short: "مدير مختبر",
    name: "د. هند المطيري",
    avatar: "هن",
    home: "approval",
    nav: [
      { section: "الرئيسية" },
      { id: "dashboard", label: "لوحة المؤشرات", icon: "📊" },
      { id: "approval", label: "المراجعة والاعتماد", icon: "✅" },
      { section: "الاستعلام" },
      { id: "plants", label: "استعراض النباتات", icon: "🌿" },
      { id: "samples", label: "استعراض العينات", icon: "🧪" },
      { section: "التقارير" },
      { id: "reports", label: "التقارير والإحصائيات", icon: "📑" },
      { id: "audit", label: "سجل التدقيق", icon: "📝" },
    ],
  },
  admin: {
    label: "مسؤول النظام",
    short: "مسؤول النظام",
    name: "خالد الإداري",
    avatar: "خا",
    home: "dashboard",
    nav: [
      { section: "الرئيسية" },
      { id: "dashboard", label: "لوحة المؤشرات", icon: "📊" },
      { section: "الإشراف" },
      { id: "users", label: "المستخدمون والصلاحيات", icon: "👥" },
      { id: "audit", label: "سجل التدقيق", icon: "📝" },
      { section: "البيانات" },
      { id: "plants", label: "إدارة النباتات", icon: "🌿" },
      { id: "samples", label: "إدارة العينات", icon: "🧪" },
      { id: "approval", label: "المراجعة والاعتماد", icon: "✅" },
      { section: "التقارير" },
      { id: "reports", label: "التقارير والإحصائيات", icon: "📑" },
    ],
  },
};

let currentRole = sessionStorage.getItem("pgdms_role") || "researcher";
let currentView = null;

function init() {
  if (!sessionStorage.getItem("pgdms_role")) {
    window.location.href = "index.html";
    return;
  }

  const role = ROLES[currentRole] || ROLES.researcher;
  document.getElementById("userName").textContent = role.name;
  document.getElementById("userRoleLabel").textContent = role.label;
  document.getElementById("userAvatar").textContent = role.avatar;
  document.getElementById("roleChip").textContent = role.label;

  renderNav(role);
  navigate(role.home);
  bindTabs();
  bindReportTabs();
  bindMobile();
  bindApprovalModal();
  renderUsersTable();
  renderPermissionsMatrix();
  applyRoleVisibility();
  updatePendingCount();
  if (currentRole === "admin") initSeedDashboard();
}

function bindApprovalModal() {
  const overlay = document.getElementById("approvalModalOverlay");
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeApprovalModal();
  });

  const rejectOverlay = document.getElementById("rejectReasonOverlay");
  rejectOverlay?.addEventListener("click", (e) => {
    if (e.target === rejectOverlay) closeRejectReasonModal();
  });

  const userOverlay = document.getElementById("userModalOverlay");
  userOverlay?.addEventListener("click", (e) => {
    if (e.target === userOverlay) closeUserModal();
  });

  const rolePermsOverlay = document.getElementById("rolePermsModalOverlay");
  rolePermsOverlay?.addEventListener("click", (e) => {
    if (e.target === rolePermsOverlay) closeRolePermsModal();
  });

  const plantEditOverlay = document.getElementById("plantEditModalOverlay");
  plantEditOverlay?.addEventListener("click", (e) => {
    if (e.target === plantEditOverlay) closePlantEditModal();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".edit-menu")) closeAllEditMenus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (rejectOverlay?.classList.contains("show")) {
      closeRejectReasonModal();
    } else if (rolePermsOverlay?.classList.contains("show")) {
      closeRolePermsModal();
    } else if (userOverlay?.classList.contains("show")) {
      closeUserModal();
    } else if (plantEditOverlay?.classList.contains("show")) {
      closePlantEditModal();
    } else if (overlay?.classList.contains("show")) {
      closeApprovalModal();
    } else {
      closeAllEditMenus();
    }
  });
}

function renderNav(role) {
  const nav = document.getElementById("sidebarNav");
  nav.innerHTML = "";
  role.nav.forEach((item) => {
    if (item.section) {
      const s = document.createElement("div");
      s.className = "nav-section";
      s.textContent = item.section;
      nav.appendChild(s);
      return;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-item";
    btn.dataset.view = item.id;
    btn.innerHTML = `<span class="ni">${item.icon}</span><span>${item.label}</span>`;
    btn.addEventListener("click", () => {
      navigate(item.id);
      closeSidebar();
    });
    nav.appendChild(btn);
  });
}

function navigate(viewId) {
  const view = document.getElementById(`view-${viewId}`);
  if (!view) return;

  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  view.classList.add("active");
  currentView = viewId;

  document.getElementById("pageTitle").textContent = view.dataset.title || "";
  document.getElementById("pageSubtitle").textContent = view.dataset.sub || "";

  document.querySelectorAll(".nav-item").forEach((n) => {
    n.classList.toggle("active", n.dataset.view === viewId);
  });

  if (viewId === "sample-new") {
    setTimeout(initSampleMap, 50);
  }

  if (viewId === "dashboard" && currentRole === "admin") {
    const dash = document.getElementById("view-dashboard");
    if (dash) {
      dash.dataset.title = "لوحة المؤشرات — مركز بيانات البذور";
      dash.dataset.sub = "توزيع الاعتمادات والبيانات الجينومية عبر المناطق السعودية";
      document.getElementById("pageTitle").textContent = dash.dataset.title;
      document.getElementById("pageSubtitle").textContent = dash.dataset.sub;
    }
    setTimeout(() => {
      initSeedDashboard();
      if (seedMap) seedMap.invalidateSize();
    }, 80);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyRoleVisibility() {
  document.querySelectorAll("[data-roles]").forEach((el) => {
    const allowed = el.dataset.roles.split(",").map((s) => s.trim());
    el.style.display = allowed.includes(currentRole) ? "" : "none";
  });
}

function bindTabs() {
  document.querySelectorAll(".tabs").forEach((tabs) => {
    if (tabs.id === "reportTabs") return;
    tabs.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const paneId = tab.dataset.tab;
        if (!paneId) return;
        const parent = tabs.parentElement;
        tabs.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        parent.querySelectorAll(".tab-pane").forEach((p) => {
          p.style.display = p.id === paneId ? "block" : "none";
        });
      });
    });
  });
}

function bindReportTabs() {
  const tabs = document.getElementById("reportTabs");
  if (!tabs) return;
  tabs.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const id = tab.dataset.report;
      document.querySelectorAll(".report-pane").forEach((p) => {
        p.style.display = p.id === id ? "block" : "none";
      });
    });
  });
}

function bindMobile() {
  const btn = document.getElementById("menuBtn");
  const overlay = document.getElementById("overlay");
  btn?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
    overlay.classList.toggle("show");
  });
  overlay?.addEventListener("click", closeSidebar);
}

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("show");
}

function toast(message, type = "") {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = "toast show" + (type ? ` ${type}` : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2800);
}

function filterTable(tableId, query) {
  const q = (query || "").trim().toLowerCase();
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll("tbody tr").forEach((row) => {
    row.style.display = !q || row.textContent.toLowerCase().includes(q) ? "" : "none";
  });
}

let plantIdCounter = 142;
let editingPlantRow = null;

function plantStatusBadgeClass(status) {
  if (status === "نشط") return "badge-green";
  if (status === "قيد المراجعة") return "badge-amber";
  return "badge-gray";
}

function submitPlant(e) {
  e.preventDefault();
  const form = document.getElementById("plantForm");
  const tbody = document.getElementById("plantsTableBody");
  if (!form || !tbody) return false;

  const data = new FormData(form);
  const name = (data.get("PlantName") || "").toString().trim();
  const scientific = (data.get("ScientificName") || "").toString().trim();
  const variety = (data.get("Variety") || "").toString().trim() || "—";
  const status = (data.get("Status") || "نشط").toString();

  if (!name || !scientific) {
    toast("يرجى إدخال اسم النبات والاسم العلمي");
    return false;
  }

  plantIdCounter += 1;
  const plantId = `PLT-${String(plantIdCounter).padStart(5, "0")}`;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${escapeHtml(plantId)}</td>
    <td>${escapeHtml(name)}</td>
    <td>${escapeHtml(scientific)}</td>
    <td>${escapeHtml(variety)}</td>
    <td><span class="badge ${plantStatusBadgeClass(status)}">${escapeHtml(status)}</span></td>
    <td class="no-print"><button type="button" class="btn btn-ghost btn-sm" onclick="openEditPlantModal(this)">تعديل</button></td>
  `;
  tbody.insertBefore(row, tbody.firstChild);

  form.reset();
  toast(`تم حفظ النبات بنجاح وإصدار ${plantId}`, "success");
  setTimeout(() => navigate("plants"), 600);
  return false;
}

function openEditPlantModal(btn) {
  const row = btn.closest("tr");
  if (!row) return;

  editingPlantRow = row;
  const cells = row.querySelectorAll("td");
  const plantId = cells[0]?.textContent.trim() || "";
  const name = cells[1]?.textContent.trim() || "";
  const scientific = cells[2]?.textContent.trim() || "";
  const variety = cells[3]?.textContent.trim() || "";
  const status = cells[4]?.textContent.trim() || "نشط";

  document.getElementById("plantEditSubtitle").textContent = `تعديل ${plantId}`;
  document.getElementById("editPlantId").value = plantId;
  document.getElementById("editPlantName").value = name;
  document.getElementById("editScientificName").value = scientific;
  document.getElementById("editVariety").value = variety === "—" ? "" : variety;
  document.getElementById("editPlantStatus").value = status;

  document.getElementById("plantEditModalOverlay").classList.add("show");
  setTimeout(() => document.getElementById("editPlantName")?.focus(), 50);
}

function closePlantEditModal() {
  document.getElementById("plantEditModalOverlay")?.classList.remove("show");
  document.getElementById("plantEditForm")?.reset();
  editingPlantRow = null;
}

function submitPlantEdit(e) {
  e.preventDefault();
  if (!editingPlantRow) return false;

  const name = document.getElementById("editPlantName").value.trim();
  const scientific = document.getElementById("editScientificName").value.trim();
  const variety = document.getElementById("editVariety").value.trim() || "—";
  const status = document.getElementById("editPlantStatus").value;
  const plantId = document.getElementById("editPlantId").value;

  if (!name || !scientific) {
    toast("يرجى إدخال اسم النبات والاسم العلمي");
    return false;
  }

  const cells = editingPlantRow.querySelectorAll("td");
  cells[1].textContent = name;
  cells[2].textContent = scientific;
  cells[3].textContent = variety;
  cells[4].innerHTML = `<span class="badge ${plantStatusBadgeClass(status)}">${escapeHtml(status)}</span>`;

  toast(`تم تحديث بيانات النبات ${plantId} بنجاح`, "success");
  closePlantEditModal();
  return false;
}

let sampleIdCounter = 482;

function submitSample(e) {
  e.preventDefault();
  const form = document.getElementById("sampleForm");
  const tbody = document.getElementById("samplesTableBody");
  if (!form || !tbody) return false;

  const plant = document.getElementById("samplePlantSelect").value.trim();
  const type = document.getElementById("sampleTypeSelect").value.trim();
  const date = document.getElementById("sampleDateInput").value;
  const location = document.getElementById("sampleLocationInput").value.trim();

  if (!plant || !type || !date || !location) {
    toast("يرجى تعبئة الحقول المطلوبة لتسجيل العينة");
    return false;
  }

  const sampleCode = `SMP-2026-${String(sampleIdCounter).padStart(4, "0")}`;
  sampleIdCounter += 1;

  const nextCodeInput = document.getElementById("sampleCodeInput");
  if (nextCodeInput) {
    nextCodeInput.value = `SMP-2026-${String(sampleIdCounter).padStart(4, "0")}`;
  }

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${escapeHtml(sampleCode)}</td>
    <td>${escapeHtml(plant)}</td>
    <td>${escapeHtml(type)}</td>
    <td><span class="badge badge-purple">مسجّلة</span></td>
    <td>${escapeHtml(location)}</td>
    <td>${escapeHtml(date)}</td>
    <td class="no-print"><button type="button" class="btn btn-ghost btn-sm" onclick="navigate('receive')">متابعة</button></td>
  `;
  tbody.insertBefore(row, tbody.firstChild);

  document.getElementById("sampleLocationInput").value = "";
  const notes = form.querySelector("textarea");
  if (notes) notes.value = "";

  toast(`تم تسجيل العينة ${sampleCode} وربطها بالنبات`, "success");
  setTimeout(() => navigate("samples"), 600);
  return false;
}

function receiveSample(e) {
  e.preventDefault();
  toast("تم تحديث حالة العينة بنجاح", "success");
  return false;
}

function saveAnalysis(e) {
  e.preventDefault();
  toast("تم حفظ بيانات التحليل الجينومي", "success");
  return false;
}

/* ---------- إضافة نتيجة تحليل (AnalysisResult) ---------- */
let resultCounter = 9021;

function addResultRow() {
  const descInput = document.getElementById("resultDescInput");
  const valueInput = document.getElementById("resultValueInput");
  const dateInput = document.getElementById("resultDateInput");
  const tbody = document.getElementById("resultsTableBody");
  if (!descInput || !valueInput || !dateInput || !tbody) return;

  const desc = descInput.value.trim();
  const value = valueInput.value.trim();
  const date = dateInput.value;

  if (!desc || !value) {
    toast("يرجى إدخال وصف النتيجة وقيمتها قبل الإضافة");
    return;
  }

  resultCounter += 1;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>RES-${resultCounter}</td>
    <td>${escapeHtml(desc)}</td>
    <td>${escapeHtml(value)}</td>
    <td>${date || "—"}</td>
    <td><span class="badge badge-amber">بانتظار الاعتماد</span></td>
  `;
  tbody.insertBefore(row, tbody.firstChild);

  descInput.value = "";
  valueInput.value = "";

  toast("تمت إضافة النتيجة إلى الجدول بنجاح", "success");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- لوحة المراجعة والاعتماد: جدول + نافذة تفاصيل ---------- */
let activeApprovalBtn = null;

function openApprovalDetails(btn) {
  activeApprovalBtn = btn;
  const d = btn.dataset;

  document.getElementById("modalAnalysisId").textContent = d.id || "—";
  document.getElementById("modalType").textContent = d.type || "—";
  document.getElementById("modalSample").textContent = d.sample || "—";
  document.getElementById("modalPlant").textContent = d.plant || "—";
  document.getElementById("modalLab").textContent = d.lab || "—";
  document.getElementById("modalPerformer").textContent = d.performer || "—";
  document.getElementById("modalDate").textContent = d.date || "—";
  document.getElementById("modalFiles").textContent = d.files ?? "—";
  document.getElementById("modalSummary").textContent = d.summary || "لا يوجد ملخص متاح.";

  const statusBadge = document.getElementById("modalStatusBadge");
  statusBadge.textContent = d.status || "—";
  statusBadge.className = "badge " + statusBadgeClass(d.status);

  document.getElementById("modalStatusLine").textContent =
    `${d.type || ""} · ${d.sample || ""}`;

  const isPending = d.status === "بانتظار الاعتماد";
  document.getElementById("modalApproveBtn").style.display = isPending ? "" : "none";
  document.getElementById("modalRejectBtn").style.display = isPending ? "" : "none";

  const infoBox = document.getElementById("modalApprovalInfo");
  if (d.status === "معتمد" && d.approvedBy) {
    infoBox.style.display = "block";
    document.getElementById("modalApprovedBy").textContent = d.approvedBy;
    document.getElementById("modalApprovalDate").textContent = d.approvalDate || "—";
  } else {
    infoBox.style.display = "none";
  }

  const rejectionBox = document.getElementById("modalRejectionInfo");
  if (d.status === "مرفوض") {
    rejectionBox.style.display = "block";
    document.getElementById("modalRejectReason").textContent = d.rejectReason || "—";
    document.getElementById("modalRejectDate").textContent = d.rejectDate || "—";
    document.getElementById("modalRejectNotes").textContent = d.rejectNotes || "—";
  } else {
    rejectionBox.style.display = "none";
  }

  document.getElementById("approvalModalOverlay").classList.add("show");
}

function closeApprovalModal() {
  document.getElementById("approvalModalOverlay").classList.remove("show");
  activeApprovalBtn = null;
}

function statusBadgeClass(status) {
  if (status === "معتمد") return "badge-green";
  if (status === "مرفوض") return "badge-red";
  return "badge-amber";
}

function setRowStatus(status, extra = {}) {
  if (!activeApprovalBtn) return;
  const row = activeApprovalBtn.closest("tr");
  const badge = row.querySelector("[data-status-badge]");
  if (badge) {
    badge.textContent = status;
    badge.className = "badge " + statusBadgeClass(status);
  }
  row.dataset.rowStatus = status;
  activeApprovalBtn.dataset.status = status;

  const today = new Date().toISOString().slice(0, 10);
  if (status === "معتمد") {
    activeApprovalBtn.dataset.approvedBy = extra.approvedBy || "المستخدم الحالي";
    activeApprovalBtn.dataset.approvalDate = today;
  }
  if (status === "مرفوض") {
    activeApprovalBtn.dataset.rejectReason = extra.reason || "";
    activeApprovalBtn.dataset.rejectNotes = extra.notes || "";
    activeApprovalBtn.dataset.rejectDate = today;
  }
  updatePendingCount();
}

function updatePendingCount() {
  const count = document.querySelectorAll('#approvalTable tbody tr[data-row-status="بانتظار الاعتماد"]').length;
  const el = document.getElementById("pendingCountBadge");
  if (el) el.textContent = `${count} بانتظار الاعتماد`;
}

function approveFromModal() {
  setRowStatus("معتمد", { approvedBy: "المستخدم الحالي" });
  toast("تم اعتماد النتائج وإتاحتها للبحث والتقارير", "success");
  closeApprovalModal();
}

/* ---------- نافذة إدخال أسباب الرفض ---------- */
function openRejectReasonModal() {
  if (!activeApprovalBtn) return;
  const d = activeApprovalBtn.dataset;

  document.getElementById("rejectContextLine").textContent = `${d.type || ""} · ${d.sample || ""} — ${d.id || ""}`;
  document.getElementById("rejectReasonForm").reset();
  document.getElementById("rejectReasonOverlay").classList.add("show");
  setTimeout(() => document.getElementById("rejectReasonSelect")?.focus(), 50);
}

function closeRejectReasonModal() {
  document.getElementById("rejectReasonOverlay").classList.remove("show");
}

function confirmReject(e) {
  e.preventDefault();
  const reason = document.getElementById("rejectReasonSelect").value;
  const notes = document.getElementById("rejectReasonNotes").value.trim();

  if (!reason || !notes) {
    toast("يرجى اختيار سبب الرفض وكتابة الملاحظات");
    return false;
  }

  setRowStatus("مرفوض", { reason, notes });
  toast("تم رفض النتائج وإرسال الملاحظات إلى الفني المسؤول", "success");
  closeRejectReasonModal();
  closeApprovalModal();
  return false;
}

function filterApprovalStatus(status) {
  const rows = document.querySelectorAll("#approvalTable tbody tr");
  rows.forEach((row) => {
    row.style.display = !status || row.dataset.rowStatus === status ? "" : "none";
  });
}

/* ---------- إدارة المستخدمين: جدول + نافذة إضافة / تعديل ---------- */
const USER_ROLE_BADGES = {
  researcher: "badge-green",
  technician: "badge-blue",
  manager: "badge-amber",
  admin: "badge-purple",
};

const ROLE_MATRIX_ORDER = ["admin", "researcher", "technician", "manager"];

const PERMISSION_DEFS = [
  { id: "manage_users", label: "إدارة المستخدمين والصلاحيات" },
  { id: "plants_edit", label: "تسجيل / تعديل النباتات" },
  { id: "samples_register", label: "تسجيل العينات" },
  { id: "samples_receive", label: "استلام وتحديث حالات العينات" },
  { id: "analysis_enter", label: "إدخال نتائج التحاليل ورفع الملفات" },
  { id: "approval", label: "اعتماد / رفض النتائج" },
  { id: "reports", label: "استخراج التقارير" },
];

/* true = ممنوح (✓)، false = ممنوع (—) */
let rolePermissions = {
  admin: {
    manage_users: true,
    plants_edit: true,
    samples_register: true,
    samples_receive: true,
    analysis_enter: true,
    approval: true,
    reports: true,
  },
  researcher: {
    manage_users: false,
    plants_edit: true,
    samples_register: true,
    samples_receive: false,
    analysis_enter: false,
    approval: false,
    reports: true,
  },
  technician: {
    manage_users: false,
    plants_edit: false,
    samples_register: false,
    samples_receive: true,
    analysis_enter: true,
    approval: false,
    reports: true,
  },
  manager: {
    manage_users: false,
    plants_edit: true,
    samples_register: true,
    samples_receive: true,
    analysis_enter: true,
    approval: true,
    reports: true,
  },
};

let users = [
  { id: "u1", name: "أحمد السبيعي", username: "a.subaie", role: "researcher", status: "نشط", lastLogin: "اليوم 08:12" },
  { id: "u2", name: "فهد العتيبي", username: "f.otaibi", role: "technician", status: "نشط", lastLogin: "اليوم 07:45" },
  { id: "u3", name: "د. هند المطيري", username: "h.mutairi", role: "manager", status: "نشط", lastLogin: "أمس 16:20" },
  { id: "u4", name: "خالد الإداري", username: "k.admin", role: "admin", status: "نشط", lastLogin: "اليوم 09:01" },
];

let userModalMode = "add";
let editingUserId = null;
let userIdCounter = 4;

function userRoleLabel(roleKey) {
  return ROLES[roleKey]?.label || roleKey;
}

function userStatusBadgeClass(status) {
  return status === "نشط" ? "badge-green" : "badge-red";
}

function closeAllEditMenus() {
  document.querySelectorAll(".edit-menu.open").forEach((m) => m.classList.remove("open"));
}

function toggleEditMenu(btn, event) {
  event.stopPropagation();
  const menu = btn.closest(".edit-menu");
  const wasOpen = menu.classList.contains("open");
  closeAllEditMenus();
  if (!wasOpen) menu.classList.add("open");
}

function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  tbody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td>${escapeHtml(user.name)}</td>
      <td dir="ltr" style="text-align:left">${escapeHtml(user.username)}</td>
      <td><span class="badge ${USER_ROLE_BADGES[user.role] || "badge-gray"}">${escapeHtml(userRoleLabel(user.role))}</span></td>
      <td><span class="badge ${userStatusBadgeClass(user.status)}">${escapeHtml(user.status)}</span></td>
      <td>${escapeHtml(user.lastLogin)}</td>
      <td>
        <div class="edit-menu">
          <button type="button" class="btn btn-ghost btn-sm" onclick="toggleEditMenu(this, event)">تعديل ▾</button>
          <div class="edit-menu-panel">
            <button type="button" onclick="openEditUserModal('${user.id}')">تعديل بيانات الشخص</button>
            <button type="button" onclick="openRolePermsModal('${user.role}')">تعديل صلاحيات الأدوار</button>
          </div>
        </div>
      </td>
    </tr>`
    )
    .join("");

  updateUserKpis();
}

function updateUserKpis() {
  const total = users.length;
  const researchers = users.filter((u) => u.role === "researcher").length;
  const technicians = users.filter((u) => u.role === "technician").length;
  const managers = users.filter((u) => u.role === "manager").length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set("kpiUsersTotal", total);
  set("kpiUsersResearchers", researchers);
  set("kpiUsersTechnicians", technicians);
  set("kpiUsersManagers", managers);
}

function renderPermissionsMatrix() {
  const tbody = document.getElementById("permissionsMatrixBody");
  if (!tbody) return;

  tbody.innerHTML = PERMISSION_DEFS.map((perm) => {
    const cells = ROLE_MATRIX_ORDER.map((role) => {
      const allowed = !!rolePermissions[role]?.[perm.id];
      return `<td><span class="perm-cell ${allowed ? "allowed" : "denied"}">${allowed ? "✓" : "—"}</span></td>`;
    }).join("");
    return `<tr><td>${escapeHtml(perm.label)}</td>${cells}</tr>`;
  }).join("");
}

function openAddUserModal() {
  closeAllEditMenus();
  userModalMode = "add";
  editingUserId = null;

  document.getElementById("userModalTitle").textContent = "إضافة مستخدم";
  document.getElementById("userModalSubtitle").textContent = "أدخل بيانات الحساب وحدّد الدور والحالة.";
  document.getElementById("userForm").reset();
  document.getElementById("userStatusSelect").value = "نشط";
  document.getElementById("userUsernameInput").disabled = false;

  document.getElementById("userModalOverlay").classList.add("show");
  setTimeout(() => document.getElementById("userNameInput")?.focus(), 50);
}

function openEditUserModal(userId) {
  closeAllEditMenus();
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  userModalMode = "edit";
  editingUserId = userId;

  document.getElementById("userModalTitle").textContent = "تعديل بيانات الشخص";
  document.getElementById("userModalSubtitle").textContent = `تعديل بيانات ${user.name}`;
  document.getElementById("userNameInput").value = user.name;
  document.getElementById("userUsernameInput").value = user.username;
  document.getElementById("userRoleSelect").value = user.role;
  document.getElementById("userStatusSelect").value = user.status;
  document.getElementById("userUsernameInput").disabled = false;

  document.getElementById("userModalOverlay").classList.add("show");
  setTimeout(() => document.getElementById("userNameInput")?.focus(), 50);
}

function closeUserModal() {
  document.getElementById("userModalOverlay")?.classList.remove("show");
  document.getElementById("userForm")?.reset();
  userModalMode = "add";
  editingUserId = null;
}

function submitUserForm(e) {
  e.preventDefault();

  const name = document.getElementById("userNameInput").value.trim();
  const username = document.getElementById("userUsernameInput").value.trim();
  const role = document.getElementById("userRoleSelect").value;
  const status = document.getElementById("userStatusSelect").value;

  if (!name || !username || !role || !status) {
    toast("يرجى تعبئة جميع الحقول المطلوبة");
    return false;
  }

  const duplicate = users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== editingUserId
  );
  if (duplicate) {
    toast("اسم المستخدم مستخدم مسبقاً — اختر اسماً آخر");
    return false;
  }

  if (userModalMode === "add") {
    userIdCounter += 1;
    users.unshift({
      id: `u${userIdCounter}`,
      name,
      username,
      role,
      status,
      lastLogin: "—",
    });
    toast("تم إضافة المستخدم بنجاح", "success");
  } else {
    const user = users.find((u) => u.id === editingUserId);
    if (!user) return false;
    user.name = name;
    user.username = username;
    user.role = role;
    user.status = status;
    toast("تم تحديث بيانات الشخص بنجاح", "success");
  }

  renderUsersTable();
  closeUserModal();
  return false;
}

function openRolePermsModal(roleKey) {
  closeAllEditMenus();
  const select = document.getElementById("rolePermsRoleSelect");
  const role = roleKey && rolePermissions[roleKey] ? roleKey : "admin";
  select.value = role;

  document.getElementById("rolePermsSubtitle").textContent =
    `امنح أو امنع الصلاحيات لدور: ${userRoleLabel(role)}`;

  loadRolePermsChecks();
  document.getElementById("rolePermsModalOverlay").classList.add("show");
  setTimeout(() => select.focus(), 50);
}

function loadRolePermsChecks() {
  const role = document.getElementById("rolePermsRoleSelect").value;
  const list = document.getElementById("rolePermsList");
  if (!list || !rolePermissions[role]) return;

  document.getElementById("rolePermsSubtitle").textContent =
    `امنح أو امنع الصلاحيات لدور: ${userRoleLabel(role)}`;

  list.innerHTML = PERMISSION_DEFS.map((perm) => {
    const checked = rolePermissions[role][perm.id] ? "checked" : "";
    return `
      <label class="perm-item">
        <input type="checkbox" data-perm-id="${perm.id}" ${checked} />
        <span class="perm-item-text">
          <strong>${escapeHtml(perm.label)}</strong>
          <small>${rolePermissions[role][perm.id] ? "ممنوحة حالياً" : "ممنوعة حالياً"}</small>
        </span>
        <span class="perm-item-state">${rolePermissions[role][perm.id] ? "منع" : "منح"}</span>
      </label>`;
  }).join("");

  list.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const state = cb.closest(".perm-item").querySelector(".perm-item-state");
      const small = cb.closest(".perm-item").querySelector("small");
      if (state) state.textContent = cb.checked ? "منع" : "منح";
      if (small) small.textContent = cb.checked ? "ممنوحة حالياً" : "ممنوعة حالياً";
      cb.closest(".perm-item").classList.toggle("is-allowed", cb.checked);
      cb.closest(".perm-item").classList.toggle("is-denied", !cb.checked);
    });
    cb.closest(".perm-item").classList.toggle("is-allowed", cb.checked);
    cb.closest(".perm-item").classList.toggle("is-denied", !cb.checked);
  });
}

function closeRolePermsModal() {
  document.getElementById("rolePermsModalOverlay")?.classList.remove("show");
}

function submitRolePermsForm(e) {
  e.preventDefault();
  const role = document.getElementById("rolePermsRoleSelect").value;
  if (!rolePermissions[role]) {
    toast("الدور غير صالح");
    return false;
  }

  const list = document.getElementById("rolePermsList");
  list.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    const permId = cb.dataset.permId;
    if (permId) rolePermissions[role][permId] = cb.checked;
  });

  renderPermissionsMatrix();
  toast(`تم تحديث صلاحيات دور «${userRoleLabel(role)}» بنجاح`, "success");
  closeRolePermsModal();
  return false;
}

/* ---------- لوحة مركز بيانات البذور (مسؤول النظام) ---------- */
const SEED_CROPS = [
  /* الحبوب — 6 */
  { id: "bread-wheat", name: "قمح الخبز", scientific: "Triticum aestivum", icon: "🌾", method: "GBS", total: 99, saudi: 75, color: "#D4A574", category: "grains", en: "BreadWheat", status: "اعتماد", hasGenomic: true, highlight: true, dashed: false, inPassport: true },
  { id: "sorghum", name: "الذرة الرفيعة", scientific: "Sorghum bicolor", icon: "🌽", method: "WGS", total: 85, saudi: 85, color: "#C0392B", category: "grains", en: "Sorghum", status: "اعتماد", hasGenomic: true, highlight: true, dashed: false, inPassport: true },
  { id: "millet", name: "الدخن", scientific: "Pennisetum typhoideum", icon: "🌾", method: "WGS", total: 57, saudi: 39, color: "#C9A84C", category: "grains", en: "Millet", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },
  { id: "barley", name: "الشعير", scientific: "Hordeum vulgare", icon: "🌿", method: "GBS", total: 37, saudi: 27, color: "#A0845C", category: "grains", en: "Barley", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },
  { id: "durum", name: "قمح الدوروم", scientific: "Triticum turgidum", icon: "🌾", method: "GBS", total: 9, saudi: 8, color: "#B8860B", category: "grains", en: "Durum", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },
  { id: "oats", name: "الشوفان", scientific: "Avena sativa", icon: "🌾", method: "GBS", total: 4, saudi: 0, color: "#94a3b8", category: "grains", en: "Oats", status: "GBS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },

  /* البقوليات — 5 */
  { id: "faba", name: "الفول", scientific: "Vicia faba", icon: "🫘", method: "GBS", total: 12, saudi: 2, color: "#5D8A5E", category: "legumes", en: "FabaBean", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },
  { id: "cowpea", name: "اللوبيا", scientific: "Vigna unguiculata", icon: "🫘", method: "WGS", total: 14, saudi: 0, color: "#7c3aed", category: "legumes", en: "Cowpea", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "chickpea", name: "الحمص", scientific: "Cicer arietinum", icon: "🫘", method: "WGS", total: 10, saudi: 0, color: "#8b5cf6", category: "legumes", en: "Chickpea", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "guar", name: "الجوار", scientific: "Cyamopsis tetragonoloba", icon: "🌱", method: "WGS", total: 4, saudi: 0, color: "#22c55e", category: "legumes", en: "Guar", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "fenugreek", name: "الحلبة", scientific: "Trigonella foenum-graecum", icon: "🌿", method: "WGS", total: 2, saudi: 0, color: "#65a30d", category: "legumes", en: "Fenugreek", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },

  /* الخضروات — 3 */
  { id: "okra", name: "البامية", scientific: "Abelmoschus esculentus", icon: "🥬", method: "WGS", total: 38, saudi: 0, color: "#16a34a", category: "vegetables", en: "Okra", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "chili", name: "الفلفل الحار", scientific: "Capsicum annuum", icon: "🌶️", method: "WGS", total: 20, saudi: 0, color: "#ea580c", category: "vegetables", en: "Chili", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "pumpkin", name: "القرع", scientific: "Cucurbita pepo", icon: "🎃", method: "WGS", total: 10, saudi: 0, color: "#f97316", category: "vegetables", en: "Pumpkin", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },

  /* الفواكه — 12 */
  { id: "mango", name: "المانجو", scientific: "Mangifera indica", icon: "🥭", method: "WGS", total: 63, saudi: 0, color: "#F4A623", category: "fruits", en: "Mango", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },
  { id: "papaya", name: "البابايا", scientific: "Carica papaya", icon: "🍈", method: "WGS", total: 13, saudi: 13, color: "#FFA500", category: "fruits", en: "Papaya", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },
  { id: "fig", name: "التين", scientific: "Ficus carica", icon: "🍇", method: "WGS", total: 24, saudi: 0, color: "#9333ea", category: "fruits", en: "Fig", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "pomegranate", name: "الرمان", scientific: "Punica granatum", icon: "🍎", method: "WGS", total: 16, saudi: 0, color: "#be123c", category: "fruits", en: "Pomegranate", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "peach", name: "الخوخ", scientific: "Prunus persica", icon: "🍑", method: "WGS", total: 10, saudi: 0, color: "#fb7185", category: "fruits", en: "Peach", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "plum", name: "البرقوق", scientific: "Prunus domestica", icon: "🟣", method: "WGS", total: 8, saudi: 0, color: "#7e22ce", category: "fruits", en: "Plum", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "grape", name: "العنب", scientific: "Vitis vinifera", icon: "🍇", method: "WGS", total: 8, saudi: 0, color: "#6d28d9", category: "fruits", en: "Grape", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "apricot", name: "المشمش", scientific: "Prunus armeniaca", icon: "🧡", method: "WGS", total: 8, saudi: 0, color: "#f59e0b", category: "fruits", en: "Apricot", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "guava", name: "الجوافة", scientific: "Psidium guajava", icon: "🍈", method: "WGS", total: 2, saudi: 0, color: "#16a34a", category: "fruits", en: "Guava", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "lemon", name: "الليمون", scientific: "Citrus limon", icon: "🍋", method: "WGS", total: 2, saudi: 0, color: "#eab308", category: "fruits", en: "Lemon", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "quince", name: "السفرجل", scientific: "Cydonia oblonga", icon: "🍐", method: "WGS", total: 2, saudi: 0, color: "#ca8a04", category: "fruits", en: "Quince", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
  { id: "armenian-apricot", name: "المشمش الأرمني", scientific: "Prunus armeniaca var.", icon: "🍑", method: "WGS", total: 1, saudi: 0, color: "#d97706", category: "fruits", en: "ArmenianApricot", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },

  /* البذور الزيتية — 1 */
  { id: "sesame", name: "السمسم", scientific: "Sesamum indicum", icon: "🌱", method: "WGS", total: 62, saudi: 13, color: "#C9A020", category: "oilseeds", en: "Sesame", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },

  /* أخرى — 2 */
  { id: "coffee", name: "القهوة", scientific: "Coffea arabica", icon: "☕", method: "WGS", total: 80, saudi: 80, color: "#6B4423", category: "other", en: "Coffee", status: "اعتماد", hasGenomic: true, highlight: false, dashed: false, inPassport: true },
  { id: "nemaguard", name: "نيما غارد", scientific: "Prunus persica × davidiana", icon: "🌱", method: "WGS", total: 2, saudi: 0, color: "#2563eb", category: "other", en: "Nemaguard", status: "WGS", hasGenomic: true, highlight: false, dashed: true, inPassport: false },
];

const SEED_PASSPORT_CROPS = () => SEED_CROPS.filter((c) => c.inPassport);

/** بيانات التوزيع الإقليمي من seed.embryo.sa — مجموع الاعتمادات السعودية = 342 */
const SEED_REGIONS = [
  { id: "riyadh", name: "الرياض", en: "Riyadh", lat: 24.7136, lng: 46.6753, count: 91, crops: { sorghum: 71, "bread-wheat": 13, millet: 3, durum: 2, barley: 2 }, crop: "sorghum" },
  { id: "jazan", name: "جازان", en: "Jazan", lat: 16.8892, lng: 42.5511, count: 90, crops: { coffee: 41, sorghum: 14, papaya: 13, millet: 10, sesame: 10, "bread-wheat": 1, barley: 1 }, crop: "coffee" },
  { id: "aseer", name: "عسير", en: "Aseer", lat: 18.2164, lng: 42.5053, count: 56, crops: { coffee: 26, "bread-wheat": 17, barley: 6, durum: 3, millet: 3, sesame: 1 }, crop: "coffee" },
  { id: "baha", name: "الباحة", en: "Al-Baha", lat: 20.0129, lng: 41.4677, count: 32, crops: { coffee: 13, millet: 10, "bread-wheat": 5, barley: 2, sesame: 2 }, crop: "coffee" },
  { id: "qaseem", name: "القصيم", en: "Qaseem", lat: 26.3264, lng: 43.975, count: 24, crops: { "bread-wheat": 15, millet: 4, barley: 4, durum: 1 }, crop: "bread-wheat" },
  { id: "taif", name: "الطائف", en: "Taif", lat: 21.2703, lng: 40.4158, count: 23, crops: { "bread-wheat": 11, millet: 7, barley: 3, durum: 2 }, crop: "bread-wheat" },
  { id: "najran", name: "نجران", en: "Najran", lat: 17.4924, lng: 44.1277, count: 13, crops: { "bread-wheat": 8, barley: 5 }, crop: "bread-wheat" },
  { id: "hail", name: "حائل", en: "Hail", lat: 27.5219, lng: 41.6901, count: 7, crops: { "bread-wheat": 4, barley: 3 }, crop: "bread-wheat" },
  { id: "eastern", name: "الشرقية", en: "Eastern", lat: 25.3833, lng: 49.5667, count: 4, crops: { millet: 2, faba: 2 }, crop: "millet" },
  { id: "tabuk", name: "تبوك", en: "Tabuk", lat: 28.3998, lng: 36.5782, count: 2, crops: { "bread-wheat": 1, barley: 1 }, crop: "bread-wheat" },
];

function seedDominantCrop(crops) {
  let best = null;
  let max = -1;
  Object.entries(crops || {}).forEach(([id, n]) => {
    if ((n || 0) > max) {
      max = n || 0;
      best = id;
    }
  });
  return best;
}

/** الاعتمادات السعودية لكل محصول — كما في seed.embryo.sa (مجموع المناطق) */
function getSeedSaudiByCrop() {
  const map = {};
  SEED_REGIONS.forEach((r) => {
    Object.entries(r.crops || {}).forEach(([id, n]) => {
      map[id] = (map[id] || 0) + (n || 0);
    });
  });
  return map;
}

function syncPassportSaudiFromRegions() {
  const saudiMap = getSeedSaudiByCrop();
  SEED_CROPS.forEach((c) => {
    if (c.inPassport) c.saudi = saudiMap[c.id] || 0;
  });
}

function seedPassportGrandTotal() {
  return SEED_PASSPORT_CROPS().reduce((s, c) => s + c.total, 0);
}

function seedSaudiGrandTotal() {
  return SEED_REGIONS.reduce((s, r) => s + r.count, 0);
}

function seedRegionDisplayCount(region) {
  if (seedSelectedCrops.length) {
    return seedSelectedCrops.reduce((s, id) => s + (region.crops?.[id] || 0), 0);
  }
  return region.count;
}

function seedRegionDisplayCrop(region) {
  if (seedSelectedCrops.length === 1) return seedSelectedCrops[0];
  if (seedSelectedCrops.length > 1) {
    const subset = {};
    seedSelectedCrops.forEach((id) => {
      if (region.crops?.[id]) subset[id] = region.crops[id];
    });
    return seedDominantCrop(subset) || region.crop;
  }
  return region.crop || seedDominantCrop(region.crops);
}

let seedMap = null;
let seedMarkers = [];
let seedSelectedCrops = [];
let seedFilterRegion = null;
let seedExpandedCategory = null;
let seedGenomicOnly = false;
let seedDashReady = false;

function toggleSeedCropFilter(cropId) {
  if (!cropId) return;
  const idx = seedSelectedCrops.indexOf(cropId);
  if (idx >= 0) seedSelectedCrops.splice(idx, 1);
  else seedSelectedCrops.push(cropId);
  renderSeedFilterBar();
  updateSeedCategoryUI();
  applySeedFilters();
}

function clearSeedCropFilters() {
  seedSelectedCrops = [];
  seedFilterRegion = null;
  renderSeedFilterBar();
  updateSeedCategoryUI();
  applySeedFilters();
}

function renderSeedFilterBar() {
  const bar = document.getElementById("seedFilterBar");
  const chips = document.getElementById("seedFilterChips");
  if (!bar || !chips) return;

  const activeRegion = SEED_REGIONS.find((r) => r.id === seedFilterRegion);

  if (!seedSelectedCrops.length && !activeRegion) {
    bar.hidden = true;
    chips.innerHTML = "";
    return;
  }

  bar.hidden = false;
  const cropChips = seedSelectedCrops
    .map((id) => {
      const crop = SEED_CROPS.find((c) => c.id === id);
      if (!crop) return "";
      return `<button type="button" class="seed-filter-chip" data-crop="${crop.id}" style="background:${crop.color}">
        <span>${crop.name}</span>
        <span class="seed-filter-chip-x" aria-hidden="true">×</span>
      </button>`;
    })
    .join("");

  const regionChip = activeRegion
    ? `<button type="button" class="seed-filter-chip seed-filter-chip-region" data-region="${activeRegion.id}" style="background:#193661">
        <span aria-hidden="true">📍</span>
        <span>${activeRegion.name}</span>
        <span class="seed-filter-chip-x" aria-hidden="true">×</span>
      </button>`
    : "";

  chips.innerHTML = cropChips + regionChip;

  chips.querySelectorAll(".seed-filter-chip[data-crop]").forEach((chip) => {
    chip.addEventListener("click", () => toggleSeedCropFilter(chip.dataset.crop));
  });
  chips.querySelectorAll(".seed-filter-chip[data-region]").forEach((chip) => {
    chip.addEventListener("click", () => {
      seedFilterRegion = null;
      applySeedFilters();
    });
  });
}

function initSeedDashboard() {
  if (currentRole !== "admin") return;
  const root = document.getElementById("dashboard-seed");
  if (!root || root.style.display === "none") return;

  syncPassportSaudiFromRegions();

  if (!seedDashReady) {
    renderSeedCropList();
    renderSeedMapLegend();
    renderSeedZonesList();
    renderSeedCharts();
    bindSeedInteractions();
    seedDashReady = true;
  }

  initSeedMap();
  renderSeedFilterBar();
  applySeedFilters();
}

function bindSeedInteractions() {
  document.querySelectorAll(".seed-map-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".seed-map-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const id = tab.dataset.seedTab;
      document.getElementById("seed-tab-regional").hidden = id !== "regional";
      document.getElementById("seed-tab-zones").hidden = id !== "zones";
      if (id === "regional" && seedMap) setTimeout(() => seedMap.invalidateSize(), 60);
    });
  });

  document.querySelectorAll(".seed-cat").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      const closing = seedExpandedCategory === cat;
      seedExpandedCategory = closing ? null : cat;
      updateSeedCategoryUI();
    });
  });

  document.getElementById("seedGenomicOnly")?.addEventListener("change", (e) => {
    seedGenomicOnly = e.target.checked;
    renderSeedSubcrops();
  });

  document.getElementById("seedFilterClear")?.addEventListener("click", clearSeedCropFilters);
}

function updateSeedCategoryUI() {
  document.querySelectorAll(".seed-cat").forEach((b) => {
    const cat = b.dataset.category;
    const open = seedExpandedCategory === cat;
    const selectedCount = SEED_CROPS.filter(
      (c) => c.category === cat && seedSelectedCrops.includes(c.id)
    ).length;

    b.classList.toggle("active", open);
    b.classList.toggle("has-selection", selectedCount > 0);
    b.setAttribute("aria-expanded", open ? "true" : "false");

    const caret = b.querySelector(".seed-cat-caret");
    if (caret) caret.textContent = open ? "▴" : "▾";

    let badge = b.querySelector(".seed-cat-badge");
    if (selectedCount > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "seed-cat-badge";
        b.appendChild(badge);
      }
      badge.textContent = String(selectedCount);
      badge.hidden = false;
    } else if (badge) {
      badge.hidden = true;
    }
  });

  const panel = document.getElementById("seedCatPanel");
  if (!panel) return;
  if (!seedExpandedCategory) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  renderSeedSubcrops();
}

function renderSeedSubcrops() {
  const grid = document.getElementById("seedSubcropGrid");
  if (!grid || !seedExpandedCategory) return;

  let crops = SEED_CROPS.filter((c) => c.category === seedExpandedCategory);
  if (seedGenomicOnly) crops = crops.filter((c) => c.hasGenomic);

  if (!crops.length) {
    grid.innerHTML = `<p class="seed-empty">لا توجد محاصيل مطابقة لهذا التصفية.</p>`;
    return;
  }

  grid.innerHTML = crops.map((c) => {
    const active = seedSelectedCrops.includes(c.id) ? "active" : "";
    const dashed = c.dashed ? "is-dashed" : "";
    return `
      <button type="button" class="seed-subcrop ${dashed} ${active}" data-crop="${c.id}">
        <span class="seed-subcrop-ico">${c.icon}</span>
        <strong class="seed-subcrop-name">${c.name}</strong>
        <span class="seed-subcrop-value" style="color:${c.color}">${c.total}</span>
        <span class="seed-subcrop-status">${c.status}</span>
      </button>`;
  }).join("");

  grid.querySelectorAll(".seed-subcrop").forEach((btn) => {
    btn.addEventListener("click", () => toggleSeedCropFilter(btn.dataset.crop));
  });
}

function renderSeedCropList() {
  const list = document.getElementById("seedCropList");
  if (!list) return;
  syncPassportSaudiFromRegions();

  const order = ["bread-wheat", "durum", "coffee", "barley", "faba", "millet", "sorghum", "sesame", "mango", "papaya"];
  const crops = SEED_PASSPORT_CROPS().slice().sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const saudiMap = getSeedSaudiByCrop();

  list.innerHTML = crops.map((c) => {
    const saudi = seedFilterRegion
      ? SEED_REGIONS.find((r) => r.id === seedFilterRegion)?.crops?.[c.id] || 0
      : saudiMap[c.id] || 0;
    const total = c.total;
    const pct = total ? Math.round((saudi / total) * 100) : 0;
    return `
      <button type="button" class="seed-crop-item" data-crop="${c.id}" data-category="${c.category}">
        <div class="seed-crop-row">
          <div class="seed-crop-info">
            <div class="seed-crop-head">
              <span class="seed-crop-name"><span class="seed-crop-ico">${c.icon}</span> ${c.name}</span>
              <span class="seed-method">${c.method}</span>
            </div>
            <div class="seed-crop-saudi">${saudi} سعودي <span class="seed-crop-pct">(${pct}%)</span></div>
            <div class="seed-progress"><span style="width:${pct}%;background:${c.color}"></span></div>
          </div>
          <div class="seed-crop-metric" style="color:${c.color}">
            <strong>${total}</strong>
            <em>${c.scientific}</em>
          </div>
        </div>
      </button>`;
  }).join("");

  list.querySelectorAll(".seed-crop-item").forEach((item) => {
    item.addEventListener("click", () => toggleSeedCropFilter(item.dataset.crop));
  });
}

function renderSeedMapLegend() {
  const legend = document.getElementById("seedMapLegend");
  if (!legend) return;

  const order = ["papaya", "mango", "sesame", "sorghum", "millet", "faba", "barley", "coffee", "durum", "bread-wheat"];
  const crops = order
    .map((id) => SEED_CROPS.find((c) => c.id === id))
    .filter(Boolean);

  legend.innerHTML = `
    <span class="seed-legend-note">(لون العلامة = المحصول السائد في المنطقة)</span>
    ${crops
      .map(
        (c) => `
      <button type="button" class="seed-legend-item" data-crop="${c.id}" title="${c.name}">
        <i style="background:${c.color}"></i>
        <span>${c.name}</span>
      </button>`
      )
      .join("")}
  `;

  legend.querySelectorAll(".seed-legend-item").forEach((item) => {
    item.addEventListener("click", () => toggleSeedCropFilter(item.dataset.crop));
  });
}

function renderSeedCropChips() {
  renderSeedMapLegend();
}

function renderSeedZonesList() {
  const el = document.getElementById("seedZonesList");
  if (!el) return;
  const regions = [...SEED_REGIONS].filter((r) => seedRegionDisplayCount(r) > 0);
  const max = Math.max(...regions.map((r) => seedRegionDisplayCount(r)), 1);
  el.innerHTML = regions
    .sort((a, b) => seedRegionDisplayCount(b) - seedRegionDisplayCount(a))
    .map((r) => {
      const cropId = seedRegionDisplayCrop(r);
      const crop = SEED_CROPS.find((c) => c.id === cropId);
      const count = seedRegionDisplayCount(r);
      const pct = Math.max(4, Math.round((count / max) * 100));
      return `
      <button type="button" class="seed-zone-row${seedFilterRegion === r.id ? " active" : ""}" data-region="${r.id}">
        <div class="seed-zone-top">
          <span class="seed-zone-name"><i aria-hidden="true">📍</i>${r.en}</span>
          <strong class="seed-zone-count">${count}</strong>
        </div>
        <div class="seed-zone-info">
          <small>${crop ? crop.name : "—"}</small>
          <small class="seed-zone-sub-count" style="color:${crop ? crop.color : "#1b8354"}">${count}</small>
        </div>
        <div class="seed-zone-bar"><span style="width:${pct}%;background:${crop ? crop.color : "#1b8354"}"></span></div>
      </button>`;
    })
    .join("");

  el.querySelectorAll(".seed-zone-row").forEach((row) => {
    row.addEventListener("click", () => {
      const id = row.dataset.region;
      seedFilterRegion = seedFilterRegion === id ? null : id;
      applySeedFilters();
      pulseSeedPassportPanel();
    });
  });
}

function pulseSeedPassportPanel() {
  const panel = document.querySelector(".seed-passport");
  if (!panel) return;
  panel.classList.remove("seed-pulse");
  requestAnimationFrame(() => panel.classList.add("seed-pulse"));
  setTimeout(() => panel.classList.remove("seed-pulse"), 700);
}

function renderSeedCharts() {
  syncPassportSaudiFromRegions();
  const order = ["bread-wheat", "durum", "coffee", "barley", "faba", "millet", "sorghum", "sesame", "mango", "papaya"];
  const passport = order.map((id) => SEED_CROPS.find((c) => c.id === id)).filter(Boolean);
  const total = passport.reduce((s, c) => s + c.total, 0) || 1;

  /* توزيع المحاصيل — Donut */
  const cropDist = document.getElementById("seedCropDistChart");
  if (cropDist) {
    let acc = 0;
    const stops = passport.map((c) => {
      const start = (acc / total) * 100;
      acc += c.total;
      const end = (acc / total) * 100;
      return `${c.color} ${start}% ${end}%`;
    });

    cropDist.innerHTML = `
      <ul class="seed-donut-legend">
        ${passport
          .map((c) => {
            const pct = Math.round((c.total / total) * 100);
            return `<li>
              <span class="vals"><em>${pct}%</em> <strong>${c.total}</strong></span>
              <span class="name"><i style="background:${c.color}"></i>${c.name}</span>
            </li>`;
          })
          .join("")}
      </ul>
      <div class="seed-donut" style="background:conic-gradient(${stops.join(",")})" aria-hidden="true">
        <div class="seed-donut-hole">
          <strong>${total}</strong>
          <span>اعتماد</span>
        </div>
      </div>`;
  }

  /* نظرة إقليمية — أشرطة أفقية بتدرج أخضر */
  const regionChart = document.getElementById("seedRegionChart");
  if (regionChart) {
    const regions = [...SEED_REGIONS].sort((a, b) => b.count - a.count);
    const scale = 100;
    const greens = ["#0f5132", "#146c43", "#1b8354", "#2f9a66", "#3fad75", "#55bc86", "#6fc997", "#8fd6ab", "#a9e0bc", "#c5ebd0"];
    regionChart.innerHTML = `
      <div class="seed-hbars">
        ${regions
          .map((r, i) => {
            const w = Math.max(2, Math.round((r.count / scale) * 100));
            return `<div class="seed-hbar-row">
              <span class="seed-hbar-name">${r.en}</span>
              <div class="seed-hbar-track">
                <span class="seed-hbar-fill" style="width:${w}%;background:${greens[i] || greens[greens.length - 1]}"></span>
              </div>
              <span class="seed-hbar-val">${r.count}</span>
            </div>`;
          })
          .join("")}
      </div>
      <div class="seed-axis">
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
      </div>`;
  }

  /* سعودي مقابل دولي — أشرطة مكدسة */
  const originChart = document.getElementById("seedOriginChart");
  if (originChart) {
    const enLabel = {
      "bread-wheat": "Bread Wheat",
      durum: "Durum",
      coffee: "Coffee",
      barley: "Barley",
      faba: "Faba Bean",
      millet: "Millet",
      sorghum: "Sorghum",
      sesame: "Sesame",
      mango: "Mango",
      papaya: "Papaya",
    };
    const scale = 100;
    originChart.innerHTML = `
      <div class="seed-hbars origin">
        ${passport
          .map((c) => {
            const barW = Math.max(2, Math.round((c.total / scale) * 100));
            const saudiPct = c.total ? Math.round((c.saudi / c.total) * 100) : 0;
            const intlPct = 100 - saudiPct;
            return `<div class="seed-hbar-row">
              <span class="seed-hbar-name">${enLabel[c.id] || c.en}</span>
              <div class="seed-hbar-track">
                <div class="seed-stack-bar" style="width:${barW}%">
                  <span class="saudi" style="width:${saudiPct}%"></span>
                  <span class="intl" style="width:${intlPct}%"></span>
                </div>
              </div>
            </div>`;
          })
          .join("")}
      </div>
      <div class="seed-axis">
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
      </div>`;
  }
}

function applySeedFilters() {
  syncPassportSaudiFromRegions();

  const passport = SEED_PASSPORT_CROPS();
  const saudiMap = getSeedSaudiByCrop();
  const selected = seedSelectedCrops;

  const listCrops = passport.filter((c) => {
    if (selected.length) return selected.includes(c.id);
    return true;
  });
  const listIds = new Set(listCrops.map((c) => c.id));

  const passportTotal = listCrops.reduce((s, c) => s + c.total, 0);
  const totalEl = document.getElementById("seedPassportTotal");
  if (totalEl) totalEl.textContent = String(passportTotal || seedPassportGrandTotal());

  document.querySelectorAll(".seed-crop-item").forEach((item) => {
    const id = item.dataset.crop;
    const crop = SEED_CROPS.find((c) => c.id === id);
    if (!crop) return;

    const show = listIds.has(id);
    item.hidden = !show;
    item.classList.toggle("active", selected.includes(id));

    const saudi = seedFilterRegion
      ? SEED_REGIONS.find((r) => r.id === seedFilterRegion)?.crops?.[id] || 0
      : saudiMap[id] || 0;
    const pct = crop.total ? Math.round((saudi / crop.total) * 100) : 0;
    const saudiEl = item.querySelector(".seed-crop-saudi");
    const bar = item.querySelector(".seed-progress span");
    if (saudiEl) saudiEl.textContent = `${saudi} سعودي (${pct}%)`;
    if (bar) bar.style.width = `${pct}%`;
  });

  document.querySelectorAll(".seed-legend-item").forEach((item) => {
    item.classList.toggle("active", selected.includes(item.dataset.crop));
  });

  renderSeedZonesList();

  const visibleRegions = SEED_REGIONS.filter((r) => {
    if (seedFilterRegion && r.id !== seedFilterRegion) return false;
    if (selected.length) {
      return selected.some((id) => (r.crops?.[id] || 0) > 0);
    }
    return true;
  });

  const saudiTotal = visibleRegions.reduce((s, r) => s + seedRegionDisplayCount(r), 0);
  const noMapFilters = !selected.length && !seedFilterRegion;
  const displaySaudi = noMapFilters ? seedSaudiGrandTotal() : saudiTotal;
  const displayRegions = noMapFilters ? SEED_REGIONS.length : visibleRegions.length;

  const saudiCount = document.getElementById("seedSaudiCount");
  const saudiFooter = document.getElementById("seedSaudiFooter");
  const activeRegions = document.getElementById("seedActiveRegions");
  if (saudiCount) saudiCount.textContent = String(displaySaudi);
  if (saudiFooter) saudiFooter.textContent = String(displaySaudi);
  if (activeRegions) activeRegions.textContent = String(displayRegions);

  const hint = document.getElementById("seedPassportHint");
  if (hint) {
    const activeRegion = SEED_REGIONS.find((r) => r.id === seedFilterRegion);
    hint.textContent = activeRegion
      ? `مُصفّى حسب منطقة: ${activeRegion.name} — انقر عليها مجددًا لإزالة التصفية`
      : "انقر على منطقة في الخريطة أو بلاطة محصول للاستكشاف";
  }

  renderSeedFilterBar();
  updateSeedMarkers(visibleRegions);
}

function initSeedMap() {
  const el = document.getElementById("seedMap");
  if (!el || typeof L === "undefined") return;

  if (seedMap) {
    seedMap.invalidateSize();
    return;
  }

  seedMap = L.map("seedMap", {
    zoomControl: true,
    attributionControl: true,
  }).setView([23.8859, 45.0792], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(seedMap);

  updateSeedMarkers(SEED_REGIONS);
  setTimeout(() => seedMap.invalidateSize(), 120);
}

function updateSeedMarkers(regions) {
  if (!seedMap) return;
  seedMarkers.forEach((m) => seedMap.removeLayer(m));
  seedMarkers = [];

  regions.forEach((r) => {
    const count = seedRegionDisplayCount(r);
    if (!count) return;

    const cropId = seedRegionDisplayCrop(r);
    const crop = SEED_CROPS.find((c) => c.id === cropId);
    const color = crop ? crop.color : "#C0392B";
    const radius = Math.max(8, Math.min(42, 6 + Math.sqrt(count) * 3.2));
    const selected = seedFilterRegion === r.id;

    const marker = L.circleMarker([r.lat, r.lng], {
      radius,
      color: selected ? "#0f203a" : "#fff",
      weight: selected ? 3 : 2,
      fillColor: color,
      fillOpacity: selected ? 0.95 : 0.78,
      opacity: 1,
    }).addTo(seedMap);

    const cropLines = Object.entries(r.crops || {})
      .sort((a, b) => b[1] - a[1])
      .map(([id, n]) => {
        const c = SEED_CROPS.find((x) => x.id === id);
        return `${c ? c.name : id}: ${n}`;
      })
      .join("<br>");

    marker.bindPopup(
      `<div style="min-width:140px;text-align:right;direction:rtl">
        <strong>${r.name}</strong><br>
        <span style="color:#667085">${count} اعتماد سعودي</span><br>
        <span style="color:#667085">السائد: ${crop ? crop.name : "—"}</span>
        <hr style="margin:6px 0;border:0;border-top:1px solid #e4e7ec">
        ${cropLines}
      </div>`
    );

    marker.on("click", () => {
      seedFilterRegion = seedFilterRegion === r.id ? null : r.id;
      applySeedFilters();
    });

    seedMarkers.push(marker);
  });
}

/* ---------- خريطة تحديد موقع جمع العينة ---------- */
let sampleMap = null;
let sampleMarker = null;

const DEFAULT_MAP_CENTER = [24.7136, 46.6753]; // الرياض

function initSampleMap() {
  const el = document.getElementById("sampleMap");
  if (!el || typeof L === "undefined") return;

  if (sampleMap) {
    sampleMap.invalidateSize();
    return;
  }

  sampleMap = L.map("sampleMap", {
    zoomControl: true,
    attributionControl: false,
  }).setView(DEFAULT_MAP_CENTER, 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap",
  }).addTo(sampleMap);

  const pinIcon = L.divIcon({
    className: "map-pin",
    html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#1b8354;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(16,24,40,.35)"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  sampleMarker = L.marker(DEFAULT_MAP_CENTER, { icon: pinIcon, draggable: true }).addTo(sampleMap);

  sampleMarker.on("dragend", () => {
    const pos = sampleMarker.getLatLng();
    updateSampleCoords(pos.lat, pos.lng);
  });

  sampleMap.on("click", (e) => {
    sampleMarker.setLatLng(e.latlng);
    updateSampleCoords(e.latlng.lat, e.latlng.lng);
  });

  setTimeout(() => sampleMap.invalidateSize(), 100);
}

function updateSampleCoords(lat, lng) {
  const latStr = lat.toFixed(5);
  const lngStr = lng.toFixed(5);
  document.getElementById("sampleLat").value = latStr;
  document.getElementById("sampleLng").value = lngStr;
  document.getElementById("sampleCoords").value = `${latStr}, ${lngStr}`;
}

function locateMe(context) {
  if (!navigator.geolocation) {
    toast("تحديد الموقع الجغرافي غير مدعوم في هذا المتصفح");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (context === "sample" && sampleMap && sampleMarker) {
        sampleMarker.setLatLng([latitude, longitude]);
        sampleMap.setView([latitude, longitude], 13);
        updateSampleCoords(latitude, longitude);
        toast("تم تحديد موقعك الحالي على الخريطة", "success");
      }
    },
    () => toast("تعذّر تحديد الموقع — تأكد من صلاحيات الموقع في المتصفح")
  );
}

function logout() {
  sessionStorage.removeItem("pgdms_role");
  sessionStorage.removeItem("pgdms_user");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", init);
