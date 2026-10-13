const STORAGE_KEY = "storecount_inventory_v2";
const BRANCH_KEY = "storecount_branch_v1";
const AUDITOR_KEY = "storecount_auditor_v1";
const AUDIT_HISTORY_KEY = "storecount_audit_history_v1";
const APP_USER_KEY = "storecount_app_user_v1";
const POS_SESSION_KEY = "storecount_pos_session_v1";
const SYNC_STATE_KEY = "storecount_sync_state_v1";
const POS_QUICK_BUTTONS_KEY = "storecount_pos_quick_buttons_v1";
const SUPABASE_URL = "https://nzgdfygljemhapabbsnf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Z2RmeWdsamVtaGFwYWJic25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NzY2ODksImV4cCI6MjEwNzM1MjY4OX0.MRcXcfy3RFY93VwKDEUIBhQiwAOmireZo4-Kk-N617g";

let inventory = loadInventory();
let branchName = loadBranchName();
let auditorName = loadAuditorName();
let auditHistory = loadAuditHistory();
let appUser = loadAppUser();
let syncState = loadSyncState();
let posQuickButtons = loadPosQuickButtons();
let activeModule = appUser ? "home" : "login";
let posSession = loadPosSession();
let viewingSavedAuditId = "";
let posRecoveryNoticeShown = false;
let selectedSku = null;
let currentStatusFilter = "all";
let currentReportFilter = "in-stock";
let keypadOverwrite = true;
let deferredInstallPrompt = null;
let posLookupSelectedCode = "";
let posAutoSyncInProgress = false;
let scanner = {
  detector: null,
  stream: null,
  active: false,
  lockedCode: "",
  clearFrames: 0,
};
let posScanner = {
  detector: null,
  stream: null,
  active: false,
  lockedCode: "",
  clearFrames: 0,
  lastScanAt: 0,
};

const $ = (selector) => document.querySelector(selector);
const emptyTemplate = $("#emptyStateTemplate");

const elements = {
  authScreen: $("#authScreen"),
  appShell: $("#appShell"),
  appLoginForm: $("#appLoginForm"),
  appUsernameInput: $("#appUsernameInput"),
  appPasswordInput: $("#appPasswordInput"),
  homePanel: $("#homePanel"),
  screenTitle: $("#screenTitle"),
  homeButton: $("#homeButton"),
  logoutButton: $("#logoutButton"),
  openStoreCountButton: $("#openStoreCountButton"),
  openPosButton: $("#openPosButton"),
  openSyncButton: $("#openSyncButton"),
  openAdminButton: $("#openAdminButton"),
  storeCountChrome: document.querySelectorAll(".storecount-chrome"),
  tabs: document.querySelectorAll(".tab"),
  panels: {
    upload: $("#uploadPanel"),
    count: $("#countPanel"),
    report: $("#reportPanel"),
    pos: $("#posPanel"),
    sync: $("#syncPanel"),
    admin: $("#adminPanel"),
  },
  totalSku: $("#totalSku"),
  countedSku: $("#countedSku"),
  pendingSku: $("#pendingSku"),
  progressLabel: $("#progressLabel"),
  progressBar: $("#progressBar"),
  visibleCount: $("#visibleCount"),
  statusFilters: document.querySelectorAll(".status-filter"),
  bottomNav: document.querySelectorAll(".bottom-nav button"),
  skuFile: $("#skuFile"),
  branchInput: $("#branchInput"),
  auditorInput: $("#auditorInput"),
  initStrategy: document.querySelectorAll("input[name=\"initStrategy\"]"),
  previewCount: $("#previewCount"),
  catalogPreviewRows: $("#catalogPreviewRows"),
  beginCountingButton: $("#beginCountingButton"),
  manualAddForm: $("#manualAddForm"),
  skuCodeInput: $("#skuCodeInput"),
  descriptionInput: $("#descriptionInput"),
  searchInput: $("#searchInput"),
  skuList: $("#skuList"),
  countSheet: $("#countSheet"),
  selectedDescription: $("#selectedDescription"),
  selectedCode: $("#selectedCode"),
  selectedStatus: $("#selectedStatus"),
  savedQty: $("#savedQty"),
  newQty: $("#newQty"),
  varianceLabel: $("#varianceLabel"),
  quantityInput: $("#quantityInput"),
  modeTabs: document.querySelectorAll(".mode-tab"),
  scannerPane: $("#scannerPane"),
  scannerPlaceholder: $("#scannerPlaceholder"),
  manualKeypad: $("#manualKeypad"),
  barcodeFallbackForm: $("#barcodeFallbackForm"),
  barcodeInput: $("#barcodeInput"),
  scanButton: $("#scanButton"),
  stopScanButton: $("#stopScanButton"),
  scanVideo: $("#scanVideo"),
  scanStatus: $("#scanStatus"),
  clearQtyButton: $("#clearQtyButton"),
  saveQtyButton: $("#saveQtyButton"),
  saveNextButton: $("#saveNextButton"),
  clearAllButton: $("#clearAllButton"),
  reportBody: $("#reportBody"),
  reportSearchInput: $("#reportSearchInput"),
  reportFilters: document.querySelectorAll(".report-filter"),
  reportTotalSku: $("#reportTotalSku"),
  reportUnitsCounted: $("#reportUnitsCounted"),
  reportZeroedSku: $("#reportZeroedSku"),
  reportProgressText: $("#reportProgressText"),
  reportVerifiedBar: $("#reportVerifiedBar"),
  reportZeroedBar: $("#reportZeroedBar"),
  reportReadyBadge: $("#reportReadyBadge"),
  reportTableTitle: $("#reportTableTitle"),
  reportBranchLabel: $("#reportBranchLabel"),
  reportBranchSignoff: $("#reportBranchSignoff"),
  reportAuditorSignoff: $("#reportAuditorSignoff"),
  savedAuditCount: $("#savedAuditCount"),
  savedAuditSelect: $("#savedAuditSelect"),
  savedAuditDetails: $("#savedAuditDetails"),
  viewCurrentAuditButton: $("#viewCurrentAuditButton"),
  exportSavedAuditButton: $("#exportSavedAuditButton"),
  rowCountDisplay: $("#rowCountDisplay"),
  reportTimestamp: $("#reportTimestamp"),
  doneCountingButton: $("#doneCountingButton"),
  downloadReportButton: $("#downloadReportButton"),
  downloadExcelButton: $("#downloadExcelButton"),
  installButton: $("#installButton"),
  posCrewCard: $("#posCrewCard"),
  posFloatCard: $("#posFloatCard"),
  posRegister: $("#posRegister"),
  posCrewLabel: $("#posCrewLabel"),
  posStatusBadge: $("#posStatusBadge"),
  posCrewLoginForm: $("#posCrewLoginForm"),
  posCrewUsernameInput: $("#posCrewUsernameInput"),
  posCrewPasswordInput: $("#posCrewPasswordInput"),
  posStartShiftButton: $("#posStartShiftButton"),
  posChangeFundCard: $("#posChangeFundCard"),
  posFloatForm: $("#posFloatForm"),
  posFloatInput: $("#posFloatInput"),
  posFloatDisplay: $("#posFloatDisplay"),
  posCartTotal: $("#posCartTotal"),
  posSalesTotal: $("#posSalesTotal"),
  posQtyDisplay: $("#posQtyDisplay"),
  posCartCount: $("#posCartCount"),
  posCartRows: $("#posCartRows"),
  posScanVideo: $("#posScanVideo"),
  posScannerPlaceholder: $("#posScannerPlaceholder"),
  posScanButton: $("#posScanButton"),
  posStopScanButton: $("#posStopScanButton"),
  posScanStatus: $("#posScanStatus"),
  posManualBarcodeForm: $("#posManualBarcodeForm"),
  posBarcodeInput: $("#posBarcodeInput"),
  posLookupResults: $("#posLookupResults"),
  quickButtonCount: $("#quickButtonCount"),
  quickButtonGrid: $("#quickButtonGrid"),
  adminQuickButtonCount: $("#adminQuickButtonCount"),
  adminQuickButtonGrid: $("#adminQuickButtonGrid"),
  quickButtonSearchInput: $("#quickButtonSearchInput"),
  quickButtonSearchResults: $("#quickButtonSearchResults"),
  posCompleteSaleButton: $("#posCompleteSaleButton"),
  posCheckVoidStatusButton: $("#posCheckVoidStatusButton"),
  posClearCartButton: $("#posClearCartButton"),
  posXReadingButton: $("#posXReadingButton"),
  posYReadingButton: $("#posYReadingButton"),
  posReadingLabel: $("#posReadingLabel"),
  posReadingDetails: $("#posReadingDetails"),
  syncStatusBadge: $("#syncStatusBadge"),
  syncProductCount: $("#syncProductCount"),
  syncPendingSales: $("#syncPendingSales"),
  syncLastRun: $("#syncLastRun"),
  syncDetails: $("#syncDetails"),
  syncAllButton: $("#syncAllButton"),
  downloadProductsButton: $("#downloadProductsButton"),
  uploadSalesButton: $("#uploadSalesButton"),
  voidApprovalCount: $("#voidApprovalCount"),
  voidApprovalList: $("#voidApprovalList"),
  refreshVoidApprovalsButton: $("#refreshVoidApprovalsButton"),
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  elements.branchInput.value = branchName;
  elements.auditorInput.value = auditorName;
  bindEvents();
  render();
  renderAppShell();
}

function bindEvents() {
  elements.appLoginForm.addEventListener("submit", handleAppLogin);
  elements.homeButton.addEventListener("click", () => showModuleHome());
  elements.logoutButton.addEventListener("click", logoutApp);
  elements.openStoreCountButton.addEventListener("click", () => showStoreCount());
  elements.openPosButton.addEventListener("click", () => showPos());
  elements.openSyncButton.addEventListener("click", () => showSync());
  elements.openAdminButton.addEventListener("click", () => showAdminSetup());

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
  });

  elements.bottomNav.forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab, button));
  });

  elements.statusFilters.forEach((button) => {
    button.addEventListener("click", () => {
      currentStatusFilter = button.dataset.filter;
      elements.statusFilters.forEach((filter) => filter.classList.toggle("is-active", filter === button));
      renderSkuList();
    });
  });

  elements.skuFile.addEventListener("change", handleFileUpload);
  elements.branchInput.addEventListener("input", () => {
    branchName = elements.branchInput.value.trim();
    saveBranchName();
    renderReport();
  });
  elements.auditorInput.addEventListener("input", () => {
    auditorName = elements.auditorInput.value.trim();
    saveAuditorName();
    renderReport();
  });
  elements.beginCountingButton.addEventListener("click", () => setTab("count"));
  elements.manualAddForm.addEventListener("submit", handleManualAdd);
  elements.searchInput.addEventListener("input", renderSkuList);
  elements.reportSearchInput.addEventListener("input", renderReport);
  elements.reportFilters.forEach((button) => {
    button.addEventListener("click", () => {
      currentReportFilter = button.dataset.reportFilter;
      elements.reportFilters.forEach((filter) => filter.classList.toggle("is-active", filter === button));
      renderReport();
    });
  });

  document.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => updateQuantity(Number(button.dataset.step)));
  });

  elements.modeTabs.forEach((button) => {
    button.addEventListener("click", () => setCountMode(button.dataset.mode));
  });

  elements.manualKeypad.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("click", () => handleKeypad(button.dataset.key));
  });

  elements.quantityInput.addEventListener("input", () => {
    elements.quantityInput.value = sanitizeQty(elements.quantityInput.value);
    keypadOverwrite = true;
    updateCountPreview();
  });

  elements.saveQtyButton.addEventListener("click", saveSelectedQuantity);
  elements.saveNextButton.addEventListener("click", saveAndSelectNext);
  elements.clearQtyButton.addEventListener("click", clearSelectedQuantity);
  elements.clearAllButton.addEventListener("click", clearAllInventory);
  elements.savedAuditSelect.addEventListener("change", () => {
    viewingSavedAuditId = elements.savedAuditSelect.value;
    elements.viewCurrentAuditButton.hidden = !viewingSavedAuditId;
    renderSavedAuditDetails();
    renderReport();
  });
  elements.viewCurrentAuditButton.addEventListener("click", () => {
    viewingSavedAuditId = "";
    renderReport();
    renderSavedAudits();
  });
  elements.exportSavedAuditButton.addEventListener("click", exportSelectedSavedAudit);
  elements.downloadReportButton.addEventListener("click", downloadReport);
  elements.downloadExcelButton.addEventListener("click", downloadExcelReport);
  elements.doneCountingButton.addEventListener("click", finishCurrentAudit);
  elements.scanButton.addEventListener("click", startScanner);
  elements.stopScanButton.addEventListener("click", stopScanner);
  elements.barcodeFallbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateScanIdentity()) return;
    handleScannedCode(elements.barcodeInput.value, "manual");
    elements.barcodeInput.value = "";
  });
  elements.posCrewLoginForm.addEventListener("submit", handlePosCrewLogin);
  elements.posStartShiftButton.addEventListener("click", startPosShift);
  elements.posFloatForm.addEventListener("submit", handlePosFloat);
  elements.posScanButton.addEventListener("click", startPosScanner);
  elements.posStopScanButton.addEventListener("click", stopPosScanner);
  elements.posManualBarcodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedCode = posLookupSelectedCode;
    if (selectedCode) addPosItemByCode(selectedCode, "manual");
    else handlePosBarcode(elements.posBarcodeInput.value, "manual");
    posLookupSelectedCode = "";
    elements.posBarcodeInput.value = "";
    renderPosLookupResults();
  });
  elements.posBarcodeInput.addEventListener("input", renderPosLookupResults);
  elements.quickButtonSearchInput.addEventListener("input", renderQuickButtonSearchResults);
  elements.posCompleteSaleButton.addEventListener("click", handlePosTransactionButton);
  elements.posCheckVoidStatusButton.addEventListener("click", checkVoidRequestStatuses);
  elements.posClearCartButton.addEventListener("click", clearPosCart);
  elements.posXReadingButton.addEventListener("click", () => renderPosReading("X"));
  elements.posYReadingButton.addEventListener("click", closePosShift);
  elements.syncAllButton.addEventListener("click", syncAll);
  elements.downloadProductsButton.addEventListener("click", downloadProductsFromCloud);
  elements.uploadSalesButton.addEventListener("click", uploadSalesToCloud);
  elements.refreshVoidApprovalsButton.addEventListener("click", loadVoidApprovals);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;
  });
}

function setTab(name, activeNav = null) {
  activeModule = "storecount";
  elements.homePanel.classList.remove("is-active");
  elements.storeCountChrome.forEach((item) => (item.hidden = false));
  const panelName = name === "scan" ? "count" : name;
  elements.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === panelName));
  elements.bottomNav.forEach((button) => {
    const isActive = activeNav
      ? button === activeNav
      : button.dataset.tab === name || (button.dataset.tab === panelName && button.dataset.primaryNav === "true");
    button.classList.toggle("is-active", isActive);
  });
  Object.entries(elements.panels).forEach(([key, panel]) => {
    panel.classList.toggle("is-active", key === panelName);
  });
  if (name === "report") renderReport();
  if (name === "scan") openScanMode();
  updateScreenTitle(panelName === "count" ? "Stock List" : panelName === "report" ? "Reports" : "Import");
}

async function handleAppLogin(event) {
  event.preventDefault();
  const username = elements.appUsernameInput.value.trim();
  const password = elements.appPasswordInput.value.trim();
  if (!username || !password) {
    alert("Enter username and password.");
    return;
  }

  const verifiedUser = await verifyCloudUser(username, password, "app");
  if (!verifiedUser) return;

  appUser = { ...verifiedUser, loggedAt: new Date().toISOString() };
  saveAppUser();
  elements.appLoginForm.reset();
  if (isCrewUser()) showPos();
  else showModuleHome();
}

function canUsePosFromAppUser() {
  return ["admin", "manager", "branch_head", "crew"].includes(String(appUser?.role || "").toLowerCase());
}

function isCrewUser() {
  return String(appUser?.role || "").toLowerCase() === "crew";
}

function renderAppShell() {
  const loggedIn = Boolean(appUser);
  elements.authScreen.hidden = loggedIn;
  elements.appShell.hidden = !loggedIn;
  if (!loggedIn) return;
  if (isCrewUser()) showPos();
  else if (activeModule === "pos") showPos();
  else if (activeModule === "sync") showSync();
  else if (activeModule === "admin") showAdminSetup();
  else if (activeModule === "storecount") showStoreCount();
  else showModuleHome();
}

function showModuleHome() {
  if (isCrewUser()) {
    showPos();
    return;
  }

  activeModule = "home";
  stopScanner();
  stopPosScanner();
  elements.authScreen.hidden = true;
  elements.appShell.hidden = false;
  elements.homePanel.classList.add("is-active");
  elements.openStoreCountButton.hidden = isCrewUser();
  elements.openSyncButton.hidden = isCrewUser();
  elements.openPosButton.hidden = !canUsePosFromAppUser();
  elements.openAdminButton.hidden = !isAdminUser();
  Object.values(elements.panels).forEach((panel) => panel.classList.remove("is-active"));
  elements.storeCountChrome.forEach((item) => (item.hidden = true));
  updateScreenTitle("Home");
}

function showStoreCount() {
  if (isCrewUser()) {
    showPos();
    return;
  }

  activeModule = "storecount";
  elements.homePanel.classList.remove("is-active");
  elements.storeCountChrome.forEach((item) => (item.hidden = false));
  setTab("upload");
}

function showPos() {
  activeModule = "pos";
  stopScanner();
  ensurePosCrewFromAppUser();
  elements.homePanel.classList.remove("is-active");
  elements.storeCountChrome.forEach((item) => (item.hidden = true));
  Object.entries(elements.panels).forEach(([key, panel]) => {
    panel.classList.toggle("is-active", key === "pos");
  });
  updateScreenTitle("POS");
  renderPos();
  autoSyncPosFromCloud();
}

function showSync() {
  if (isCrewUser()) {
    showPos();
    return;
  }

  activeModule = "sync";
  stopScanner();
  stopPosScanner();
  elements.homePanel.classList.remove("is-active");
  elements.storeCountChrome.forEach((item) => (item.hidden = true));
  Object.entries(elements.panels).forEach(([key, panel]) => {
    panel.classList.toggle("is-active", key === "sync");
  });
  updateScreenTitle("Cloud Sync");
  renderSync();
  loadVoidApprovals();
}

function showAdminSetup() {
  if (!isAdminUser()) {
    alert("Only Administrator can open Admin Setup.");
    showModuleHome();
    return;
  }

  activeModule = "admin";
  stopScanner();
  stopPosScanner();
  elements.homePanel.classList.remove("is-active");
  elements.storeCountChrome.forEach((item) => (item.hidden = true));
  Object.entries(elements.panels).forEach(([key, panel]) => {
    panel.classList.toggle("is-active", key === "admin");
  });
  updateScreenTitle("Admin Setup");
  renderQuickButtons();
  renderAdminQuickButtons();
  renderQuickButtonSearchResults();
  uploadLocalQuickButtonsToCloud();
}

function updateScreenTitle(title) {
  elements.screenTitle.textContent = title;
}

function logoutApp() {
  if (posSession.transactionActive && posSession.cart.length) {
    alert("Finish Cash Out before switching user. The current transaction is still unpaid.");
    return;
  }

  stopScanner();
  stopPosScanner();
  appUser = null;
  activeModule = "login";
  posSession = { ...createEmptyPosSession(), sales: posSession.sales || [] };
  savePosSession();
  localStorage.removeItem(APP_USER_KEY);
  elements.appLoginForm.reset();
  renderAppShell();
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const rows = parseCsv(text);
  const headers = rows.shift()?.map(normalizeHeader) || [];
  const skuIndex = headers.findIndex((header) => ["sku code", "sku", "code"].includes(header));
  const descIndex = headers.findIndex((header) => ["description", "desc", "item description"].includes(header));
  const qtyIndex = headers.findIndex((header) => ["qty", "quantity", "count"].includes(header));
  const stockIndex = headers.findIndex((header) => ["stock", "stock qty", "stock quantity", "inventory", "inventory qty", "on hand", "stock on hand"].includes(header));
  const barcodeIndex = headers.findIndex((header) => ["barcode", "bar code", "upc", "ean"].includes(header));
  const priceIndex = headers.findIndex((header) => ["price", "selling price", "retail price", "srp", "unit price"].includes(header));
  const supplierIndex = headers.findIndex((header) => ["supplier", "supplier name", "vendor", "vendor name"].includes(header));
  const keepBaseline = getInitStrategy() === "baseline";

  if (skuIndex === -1 || descIndex === -1) {
    alert("CSV needs SKU Code and Description columns.");
    return;
  }

  rows.forEach((row) => {
    upsertSku(
      row[skuIndex],
      row[descIndex],
      keepBaseline && qtyIndex !== -1 ? row[qtyIndex] : 0,
      keepBaseline,
      barcodeIndex !== -1 ? row[barcodeIndex] : "",
      priceIndex !== -1 ? row[priceIndex] : "",
      stockIndex !== -1 ? row[stockIndex] : null,
      supplierIndex !== -1 ? row[supplierIndex] : ""
    );
  });

  saveInventory();
  render();
  setTab("count");
  event.target.value = "";
}

function handleManualAdd(event) {
  event.preventDefault();
  const code = elements.skuCodeInput.value;
  const description = elements.descriptionInput.value;

  if (!upsertSku(code, description)) {
    alert("Enter both SKU Code and Description.");
    return;
  }

  elements.manualAddForm.reset();
  saveInventory();
  render();
}

function upsertSku(code, description, qty = null, saved = null, barcode = "", price = "", stockQty = null, supplierName = "") {
  const cleanCode = String(code || "").trim();
  const cleanDescription = String(description || "").trim();
  const cleanBarcode = String(barcode || "").trim();
  const cleanPrice = sanitizeMoney(price);
  const cleanStockQty = parseOptionalStockQty(stockQty);
  const cleanSupplierName = String(supplierName || "").trim();
  const shouldSetQty = qty !== null;
  const cleanQty = shouldSetQty ? sanitizeQty(qty) : 0;
  if (!cleanCode || !cleanDescription) return false;

  const existing = inventory.find((item) => item.code.toLowerCase() === cleanCode.toLowerCase());
  if (existing) {
    existing.description = cleanDescription;
    existing.barcode = cleanBarcode || existing.barcode || "";
    if (cleanPrice > 0) existing.price = cleanPrice;
    if (cleanStockQty !== null) existing.stockQty = cleanStockQty;
    if (cleanSupplierName) existing.supplierName = cleanSupplierName;
    if (shouldSetQty) existing.qty = cleanQty;
    if (saved !== null) {
      existing.saved = Boolean(saved);
      existing.updatedAt = saved ? new Date().toISOString() : null;
    }
    return true;
  }

  inventory.push({
    code: cleanCode,
    description: cleanDescription,
    barcode: cleanBarcode,
    price: cleanPrice,
    stockQty: cleanStockQty,
    supplierName: cleanSupplierName,
    qty: cleanQty,
    saved: Boolean(saved),
    updatedAt: saved ? new Date().toISOString() : null,
  });
  return true;
}

function render() {
  renderSummary();
  renderCatalogPreview();
  renderSkuList();
  renderReport();
  renderSavedAudits();
  renderSelectedSku();
  renderPos();
  renderSync();
}

function canApproveVoid(role) {
  return ["admin", "manager", "branch_head"].includes(String(role || "").toLowerCase());
}

function isAdminUser() {
  return String(appUser?.role || "").toLowerCase() === "admin";
}

function ensurePosCrewFromAppUser() {
  if (
    posSession.crewUsername &&
    appUser?.username &&
    posSession.crewUsername !== appUser.username &&
    !posSession.transactionActive &&
    !posSession.cart.length
  ) {
    posSession = { ...createEmptyPosSession(), sales: posSession.sales || [] };
  }

  if (posSession.crew || !canUsePosFromAppUser()) return;

  posSession.crew = appUser.displayName || appUser.username;
  posSession.crewUsername = appUser.username;
  posSession.crewRole = appUser.role;
  posSession.sales = posSession.sales || [];
  if (!branchName && appUser.branchName) {
    branchName = appUser.branchName;
    elements.branchInput.value = branchName;
    saveBranchName();
  }
  savePosSession();
}

function renderCatalogPreview() {
  const sample = inventory.slice(0, 4);
  elements.previewCount.textContent = inventory.length
    ? `Top ${sample.length.toLocaleString()} of ${inventory.length.toLocaleString()}`
    : "No SKU loaded";
  elements.catalogPreviewRows.innerHTML = "";

  if (!sample.length) {
    elements.catalogPreviewRows.innerHTML = `<div class="empty-state"><strong>No catalog yet</strong><p>Upload a file or add SKU manually.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  sample.forEach((item) => {
    const row = document.createElement("div");
    row.className = "preview-row";
    row.innerHTML = `
      <div>
        <span>${escapeHtml(item.code)}</span>
        <strong>${escapeHtml(item.description)}</strong>
      </div>
      <p><b>${Number(item.qty || 0).toLocaleString()}</b><small>Qty</small></p>
    `;
    fragment.appendChild(row);
  });
  elements.catalogPreviewRows.appendChild(fragment);
}

function renderSummary() {
  const counted = inventory.filter((item) => item.saved).length;
  const pending = Math.max(0, inventory.length - counted);
  const percent = inventory.length ? Math.round((counted / inventory.length) * 100) : 0;

  elements.totalSku.textContent = inventory.length.toLocaleString();
  elements.countedSku.textContent = counted.toLocaleString();
  elements.pendingSku.textContent = pending.toLocaleString();
  elements.progressLabel.textContent = `${percent}% Complete`;
  elements.progressBar.style.width = `${percent}%`;
}

function renderSkuList() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const matches = inventory
    .filter((item) => {
      const status = getItemStatus(item);
      const matchesQuery =
        !query ||
        item.code.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        String(item.barcode || "").toLowerCase().includes(query);
      const matchesStatus = currentStatusFilter === "all" || status === currentStatusFilter;
      return matchesQuery && matchesStatus;
    })
    .slice(0, 100);

  elements.visibleCount.textContent = `${matches.length.toLocaleString()} of ${inventory.length.toLocaleString()} SKUs`;

  elements.skuList.innerHTML = "";

  if (!inventory.length) {
    elements.skuList.appendChild(emptyTemplate.content.cloneNode(true));
    return;
  }

  if (!matches.length) {
    elements.skuList.innerHTML = `<div class="empty-state"><strong>No match found</strong><p>Try another SKU code or description.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  matches.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sku-card${selectedSku?.code === item.code ? " is-selected" : ""}`;
    const status = getItemStatus(item);
    const statusText = status === "counted" ? "COUNTED" : status === "zeroed" ? "ZEROED" : "PENDING";
    const statusClass = status === "pending" ? " class=\"is-pending\"" : status === "zeroed" ? " class=\"is-zeroed\"" : "";
    button.innerHTML = `
      <div>
        <strong>${escapeHtml(item.code)}</strong>
        <small>${escapeHtml(item.description)}</small>
        <em>${item.updatedAt ? `Audited ${formatAuditTime(item.updatedAt)}` : "Not counted yet"}</em>
      </div>
      <span${statusClass}>${statusText} ${Number(item.qty || 0).toLocaleString()}</span>
    `;
    button.addEventListener("click", () => selectSku(item.code));
    fragment.appendChild(button);
  });

  elements.skuList.appendChild(fragment);
}

function selectSku(code) {
  selectedSku = inventory.find((item) => item.code === code) || null;
  renderSelectedSku();
  if (selectedSku) requestAnimationFrame(() => elements.countSheet.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function renderSelectedSku() {
  if (!selectedSku) {
    elements.countSheet.hidden = true;
    return;
  }

  elements.countSheet.hidden = false;
  elements.selectedDescription.textContent = selectedSku.description;
  elements.selectedCode.textContent = selectedSku.code;
  elements.selectedStatus.textContent = getItemStatus(selectedSku) === "pending" ? "Pending Audit" : "Saved Audit";
  elements.savedQty.textContent = Number(selectedSku.qty || 0).toLocaleString();
  elements.quantityInput.value = Number(selectedSku.qty || 0);
  keypadOverwrite = true;
  updateCountPreview();
}

function openScanMode() {
  if (!inventory.length) {
    elements.searchInput.focus();
    return;
  }

  if (!selectedSku) {
    selectedSku = inventory.find((item) => getItemStatus(item) === "pending") || inventory[0];
    renderSelectedSku();
    renderSkuList();
  }

  setCountMode("scan");
  requestAnimationFrame(() => elements.countSheet.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function updateQuantity(step) {
  const next = Math.max(0, Number(elements.quantityInput.value || 0) + step);
  elements.quantityInput.value = next;
  keypadOverwrite = true;
  updateCountPreview();
}

function saveSelectedQuantity() {
  if (!selectedSku) return;
  selectedSku.qty = Number(sanitizeQty(elements.quantityInput.value));
  selectedSku.saved = true;
  selectedSku.updatedAt = new Date().toISOString();
  saveInventory();
  render();
}

function saveAndSelectNext() {
  if (!selectedSku) return;
  saveSelectedQuantity();
  const currentIndex = inventory.findIndex((item) => item.code === selectedSku.code);
  const nextItem = inventory.slice(currentIndex + 1).find((item) => getItemStatus(item) === "pending") || inventory[currentIndex + 1] || inventory[0];
  if (nextItem) selectSku(nextItem.code);
}

function clearSelectedQuantity() {
  if (!selectedSku) return;
  if (Number(selectedSku.qty || 0) > 0 && !confirm("Reset this SKU quantity to zero and mark it pending?")) return;
  elements.quantityInput.value = 0;
  selectedSku.qty = 0;
  selectedSku.saved = false;
  selectedSku.updatedAt = null;
  saveInventory();
  render();
}

function setCountMode(mode) {
  const isManual = mode === "manual";
  elements.modeTabs.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === mode));
  elements.scannerPane.hidden = isManual;
  elements.manualKeypad.hidden = !isManual;
}

function handleKeypad(key) {
  if (key === "clear") {
    elements.quantityInput.value = 0;
    keypadOverwrite = true;
  } else if (key === "backspace") {
    const next = String(elements.quantityInput.value || "0").slice(0, -1);
    elements.quantityInput.value = next ? Number(next) : 0;
    keypadOverwrite = !next;
  } else {
    const current = keypadOverwrite ? "" : String(elements.quantityInput.value || "");
    elements.quantityInput.value = sanitizeQty(`${current}${key}`);
    keypadOverwrite = false;
  }
  updateCountPreview();
  triggerHaptic();
}

function updateCountPreview() {
  if (!selectedSku) return;
  const saved = Number(selectedSku.qty || 0);
  const next = Number(sanitizeQty(elements.quantityInput.value));
  const delta = next - saved;

  elements.newQty.textContent = next.toLocaleString();
  elements.saveQtyButton.textContent = `Save Count (${next.toLocaleString()} Units)`;

  if (!selectedSku.saved) {
    elements.varianceLabel.textContent = "New";
  } else if (delta === 0) {
    elements.varianceLabel.textContent = "No Change";
  } else if (delta > 0) {
    elements.varianceLabel.textContent = `+${delta.toLocaleString()}`;
  } else {
    elements.varianceLabel.textContent = delta.toLocaleString();
  }
}

function clearAllInventory() {
  if (!confirm("Clear all SKU and counts?")) return;
  inventory = [];
  selectedSku = null;
  saveInventory();
  render();
  setTab("upload");
}

async function startScanner() {
  if (!inventory.length) {
    elements.scanStatus.textContent = "LOAD SKU FIRST";
    return;
  }

  if (!validateScanIdentity()) return;

  if (!("BarcodeDetector" in window)) {
    elements.scanStatus.textContent = "CAMERA SCAN UNSUPPORTED";
    alert("This Android WebView does not support camera barcode scanning yet. You can still count manually. I can add native Android barcode scanning next for guaranteed scanning.");
    return;
  }

  try {
    scanner.detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"] });
    scanner.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    elements.scanVideo.srcObject = scanner.stream;
    elements.scanVideo.hidden = false;
    elements.scannerPlaceholder.hidden = true;
    elements.stopScanButton.hidden = false;
    elements.scanButton.hidden = true;
    scanner.active = true;
    scanner.lockedCode = "";
    scanner.clearFrames = 0;
    await elements.scanVideo.play();
    elements.scanStatus.textContent = "SCANNING";
    scanLoop();
  } catch (error) {
    elements.scanStatus.textContent = "Camera could not start.";
  }
}

async function scanLoop() {
  if (!scanner.active) return;

  try {
    const barcodes = await scanner.detector.detect(elements.scanVideo);
    const found = String(barcodes[0]?.rawValue || "").trim();

    if (!found) {
      scanner.clearFrames += 1;
      if (scanner.clearFrames >= 8) scanner.lockedCode = "";
    } else if (found !== scanner.lockedCode) {
      scanner.lockedCode = found;
      scanner.clearFrames = 0;
      handleScannedCode(found, "camera");
    } else {
      scanner.clearFrames = 0;
      elements.scanStatus.textContent = "READ - MOVE ITEM";
    }
  } catch (error) {
    elements.scanStatus.textContent = "PAUSED";
  }

  requestAnimationFrame(scanLoop);
}

function handleScannedCode(rawCode, source = "manual") {
  const cleanCode = normalizeBarcode(rawCode);
  if (!cleanCode) return;

  const matched = inventory.find((item) => normalizeBarcode(item.barcode) === cleanCode || normalizeBarcode(item.code) === cleanCode);

  if (!matched) {
    elements.scanStatus.textContent = source === "manual" ? `TYPED UNKNOWN ${cleanCode}` : `UNKNOWN ${cleanCode}`;
    triggerHaptic();
    playScanBeep(180, 180);
    return;
  }

  selectedSku = matched;
  matched.qty = Number(matched.qty || 0) + 1;
  matched.saved = true;
  matched.updatedAt = new Date().toISOString();
  saveInventory();
  render();
  elements.scanStatus.textContent = source === "manual" ? `TYPED MATCH ${matched.code}` : `MATCHED ${matched.code}`;
  triggerHaptic();
  playScanBeep();
}

function validateScanIdentity() {
  branchName = elements.branchInput.value.trim();
  auditorName = elements.auditorInput.value.trim();
  saveBranchName();
  saveAuditorName();

  if (!branchName) {
    elements.scanStatus.textContent = "ENTER BRANCH";
    setTab("upload");
    elements.branchInput.focus();
    alert("Please enter the Branch before scanning.");
    return false;
  }

  if (!auditorName) {
    elements.scanStatus.textContent = "ENTER AUDITOR";
    setTab("upload");
    elements.auditorInput.focus();
    alert("Please enter the Auditor name before scanning.");
    return false;
  }

  return true;
}

function stopScanner() {
  scanner.active = false;
  scanner.stream?.getTracks().forEach((track) => track.stop());
  scanner.stream = null;
  elements.scanVideo.hidden = true;
  elements.scannerPlaceholder.hidden = false;
  elements.stopScanButton.hidden = true;
  elements.scanButton.hidden = false;
  elements.scanStatus.textContent = "READY";
}

async function handlePosCrewLogin(event) {
  event.preventDefault();
  const username = elements.posCrewUsernameInput.value.trim();
  const password = elements.posCrewPasswordInput.value.trim();
  if (!username || !password) {
    alert("Enter crew username and password.");
    return;
  }

  const verifiedUser = await verifyCloudUser(username, password, "pos");
  if (!verifiedUser) return;

  posSession.crew = verifiedUser.displayName || verifiedUser.username;
  posSession.crewUsername = verifiedUser.username;
  posSession.crewRole = verifiedUser.role;
  appUser = { ...verifiedUser, loggedAt: new Date().toISOString() };
  saveAppUser();
  if (!branchName && verifiedUser.branchName) {
    branchName = verifiedUser.branchName;
    elements.branchInput.value = branchName;
    saveBranchName();
  }
  posSession.startedAt = new Date().toISOString();
  posSession.float = 0;
  posSession.active = false;
  posSession.shiftStarted = false;
  posSession.transactionActive = false;
  posSession.cart = [];
  posSession.sales = posSession.sales || [];
  savePosSession();
  elements.posCrewLoginForm.reset();
  renderPos();
}

function startPosShift() {
  if (!posSession.crew) {
    alert("Login crew first.");
    return;
  }

  posSession.shiftStarted = true;
  posSession.startedAt = new Date().toISOString();
  savePosSession();
  renderPos();
  elements.posFloatInput.focus();
}

function handlePosFloat(event) {
  event.preventDefault();
  const floatAmount = sanitizeMoney(elements.posFloatInput.value);
  if (floatAmount <= 0) {
    alert("Change fund is mandatory. Enter the cashier's opening change fund before starting POS.");
    elements.posFloatInput.focus();
    return;
  }

  posSession.float = floatAmount;
  posSession.active = true;
  posSession.shiftStarted = true;
  posSession.transactionActive = false;
  posSession.startedAt = posSession.startedAt || new Date().toISOString();
  savePosSession();
  elements.posFloatForm.reset();
  renderPos();
}

function renderPos() {
  const hasCrew = Boolean(posSession.crew);
  const hasActiveRegister = hasCrew && posSession.active;
  const needsChangeFund = hasCrew && posSession.shiftStarted && !hasActiveRegister;
  elements.posCrewCard.hidden = hasCrew;
  elements.posFloatCard.hidden = !hasCrew || posSession.shiftStarted || hasActiveRegister;
  elements.posChangeFundCard.hidden = !needsChangeFund;
  elements.posRegister.hidden = !hasActiveRegister;
  elements.posCrewLabel.textContent = hasCrew ? `Crew: ${posSession.crew}` : "Crew not signed in";
  elements.posStatusBadge.textContent = hasActiveRegister ? "Open" : "Closed";
  elements.posCompleteSaleButton.textContent = posSession.transactionActive ? "Cash Out" : "Start Transaction";
  elements.posCheckVoidStatusButton.hidden = !posSession.transactionActive || !(posSession.voidRequests || []).some((request) => request.status === "pending");
  elements.posScanButton.hidden = !posSession.transactionActive || posScanner.active;
  elements.posStopScanButton.hidden = !posScanner.active;
  showPosRecoveryNotice();
  renderQuickButtons();
  renderPosCart();
  renderPosSummary();
}

function showPosRecoveryNotice() {
  if (posRecoveryNoticeShown || !posSession.transactionActive || !posSession.cart.length) return;
  posRecoveryNoticeShown = true;
  elements.posScanStatus.textContent = "UNPAID TRANSACTION";
  alert("Unpaid transaction recovered. Items are still in the cart. Complete Cash Out before starting another customer.");
}

function renderPosSummary() {
  const cashSalesTotal = getPosPaymentTotal("cash");
  const totalCash = Number(posSession.float || 0) + cashSalesTotal;
  elements.posFloatDisplay.textContent = formatMoney(posSession.float || 0);
  elements.posCartTotal.textContent = formatMoney(cashSalesTotal);
  elements.posSalesTotal.textContent = formatMoney(totalCash);
  elements.posQtyDisplay.textContent = getPosCartQty().toLocaleString();
  elements.posCartCount.textContent = `${getPosCartQty().toLocaleString()} items`;
}

function renderPosCart() {
  elements.posCartRows.innerHTML = "";
  if (!posSession.transactionActive) {
    elements.posCartRows.innerHTML = `<div class="empty-state"><strong>Ready for next customer</strong><p>Tap Start Transaction to open the scanner.</p></div>`;
    renderPosSummary();
    return;
  }

  if (!posSession.cart.length) {
    elements.posCartRows.innerHTML = `<div class="empty-state"><strong>No items</strong><p>Scan or type an item barcode.</p></div>`;
    renderPosSummary();
    return;
  }

  const fragment = document.createDocumentFragment();
  posSession.cart.forEach((line) => {
    const pendingVoid = (posSession.voidRequests || []).find((request) => request.code === line.code && request.status === "pending");
    const row = document.createElement("div");
    row.className = "pos-cart-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(line.code)}</strong>
        <span>${escapeHtml(line.description)}</span>
        <small>${formatMoney(line.price)} each${pendingVoid ? " | Void approval pending" : ""}</small>
      </div>
      <label>
        <span>Qty</span>
        <input type="number" min="1" step="1" inputmode="numeric" value="${Number(line.qty || 1)}" data-pos-qty="${escapeHtml(line.code)}" />
      </label>
      <p>${formatMoney(Number(line.qty || 0) * Number(line.price || 0))}</p>
      <button class="secondary-button danger" type="button" data-pos-void="${escapeHtml(line.code)}" ${pendingVoid ? "disabled" : ""}>${pendingVoid ? "Pending" : "Void"}</button>
    `;
    fragment.appendChild(row);
  });
  elements.posCartRows.appendChild(fragment);
  elements.posCartRows.querySelectorAll("[data-pos-qty]").forEach((input) => {
    input.addEventListener("change", () => updatePosLineQty(input.dataset.posQty, input.value));
  });
  elements.posCartRows.querySelectorAll("[data-pos-void]").forEach((button) => {
    button.addEventListener("click", () => voidPosLine(button.dataset.posVoid));
  });
  renderPosSummary();
}

async function startPosScanner() {
  if (!posSession.active) {
    elements.posScanStatus.textContent = "OPEN POS FIRST";
    return;
  }

  if (!posSession.transactionActive) {
    elements.posScanStatus.textContent = "START TRANSACTION";
    return;
  }

  if (!inventory.length) {
    elements.posScanStatus.textContent = "LOAD SKU FIRST";
    return;
  }

  if (!("BarcodeDetector" in window)) {
    elements.posScanStatus.textContent = "CAMERA UNSUPPORTED";
    alert("Camera scanning is unavailable on this device. Use Manual Barcode.");
    return;
  }

  try {
    posScanner.detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"] });
    posScanner.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    elements.posScanVideo.srcObject = posScanner.stream;
    elements.posScanVideo.hidden = false;
    elements.posScannerPlaceholder.hidden = true;
    elements.posStopScanButton.hidden = false;
    elements.posScanButton.hidden = true;
    posScanner.active = true;
    posScanner.lockedCode = "";
    posScanner.clearFrames = 0;
    posScanner.lastScanAt = 0;
    await elements.posScanVideo.play();
    elements.posScanStatus.textContent = "SCANNING";
    posScanLoop();
  } catch {
    elements.posScanStatus.textContent = "Camera could not start.";
  }
}

async function posScanLoop() {
  if (!posScanner.active) return;

  try {
    const barcodes = await posScanner.detector.detect(elements.posScanVideo);
    const found = normalizeBarcode(barcodes[0]?.rawValue || "");

    if (!found) {
      posScanner.clearFrames += 1;
      if (posScanner.clearFrames >= 8) posScanner.lockedCode = "";
    } else if (found !== posScanner.lockedCode && Date.now() - posScanner.lastScanAt >= 1200) {
      posScanner.lockedCode = found;
      posScanner.clearFrames = 0;
      posScanner.lastScanAt = Date.now();
      handlePosBarcode(found, "camera");
    } else {
      posScanner.clearFrames = 0;
      elements.posScanStatus.textContent = "READ - WAIT";
    }
  } catch {
    elements.posScanStatus.textContent = "PAUSED";
  }

  requestAnimationFrame(posScanLoop);
}

function stopPosScanner() {
  posScanner.active = false;
  posScanner.stream?.getTracks().forEach((track) => track.stop());
  posScanner.stream = null;
  if (!elements.posScanVideo) return;
  elements.posScanVideo.hidden = true;
  elements.posScannerPlaceholder.hidden = false;
  elements.posStopScanButton.hidden = true;
  elements.posScanButton.hidden = false;
  elements.posScanStatus.textContent = "READY";
}

function handlePosBarcode(rawCode, source = "manual") {
  if (!posSession.active) {
    elements.posScanStatus.textContent = "OPEN POS FIRST";
    return;
  }

  if (!posSession.transactionActive) {
    elements.posScanStatus.textContent = "START TRANSACTION";
    alert("Tap Start Transaction before scanning items.");
    return;
  }

  const cleanCode = normalizeBarcode(rawCode);
  if (!cleanCode) return;

  const item = inventory.find((sku) => normalizeBarcode(sku.barcode) === cleanCode || normalizeBarcode(sku.code) === cleanCode);
  if (!item) {
    elements.posScanStatus.textContent = source === "manual" ? `TYPED UNKNOWN ${cleanCode}` : `UNKNOWN ${cleanCode}`;
    triggerHaptic();
    playScanBeep(180, 180);
    return;
  }

  addPosItemByCode(item.code, source === "manual" ? "manual" : "camera");
}

function renderQuickButtons() {
  elements.quickButtonCount.textContent = `${posQuickButtons.length.toLocaleString()} saved`;
  elements.quickButtonGrid.innerHTML = "";

  if (!posQuickButtons.length) {
    elements.quickButtonGrid.innerHTML = `<div class="empty-state"><strong>No quick buttons</strong><p>Add products without barcode from Manage Quick Buttons.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  posQuickButtons.forEach((button) => {
    const item = inventory.find((sku) => sku.code === button.code);
    const savedPrice = sanitizeMoney(button.price);
    const productPrice = sanitizeMoney(item?.price);
    const tile = document.createElement("div");
    tile.className = "quick-sale-button";
    tile.innerHTML = `
      <button type="button" data-quick-sale="${escapeHtml(button.code)}">
        <strong>${escapeHtml(button.label || item?.description || button.code)}</strong>
        <span>${escapeHtml(button.code)} | ${formatMoney(savedPrice || productPrice)}</span>
      </button>
    `;
    fragment.appendChild(tile);
  });
  elements.quickButtonGrid.appendChild(fragment);
  elements.quickButtonGrid.querySelectorAll("[data-quick-sale]").forEach((button) => {
    button.addEventListener("click", () => handleQuickButtonSale(button.dataset.quickSale));
  });
}

function renderPosLookupResults() {
  posLookupSelectedCode = "";
  elements.posLookupResults.innerHTML = "";
  const query = elements.posBarcodeInput.value.trim();
  if (!query) return;

  const matches = findProductLookupMatches(query, 12);
  if (!matches.length) {
    elements.posLookupResults.innerHTML = `<div class="empty-state compact"><strong>No match found</strong><p>Try SKU, barcode, item name, or supplier.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  matches.forEach((item) => {
    const row = document.createElement("button");
    row.className = "pos-lookup-row";
    row.type = "button";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.description)}</strong>
        <small>${escapeHtml(getLookupMeta(item))}</small>
      </div>
      <span>${formatMoney(item.price || 0)}</span>
    `;
    row.addEventListener("click", () => {
      posLookupSelectedCode = item.code;
      elements.posBarcodeInput.value = item.barcode || item.code;
      elements.posLookupResults.innerHTML = `<div class="pos-lookup-selected"><strong>${escapeHtml(item.description)}</strong><small>Selected. Tap Add Item.</small></div>`;
    });
    fragment.appendChild(row);
  });
  elements.posLookupResults.appendChild(fragment);
}

function findProductLookupMatches(query, limit = 12) {
  const cleanQuery = query.trim().toLowerCase();
  const cleanBarcodeQuery = normalizeBarcode(query);
  if (!cleanQuery) return [];

  const scored = inventory
    .map((item) => {
      const barcode = normalizeBarcode(item.barcode);
      const code = normalizeBarcode(item.code);
      const description = String(item.description || "").toLowerCase();
      const supplier = String(item.supplierName || "").toLowerCase();
      let score = 0;

      if (barcode && barcode.startsWith(cleanBarcodeQuery)) score = 100;
      else if (code.startsWith(cleanBarcodeQuery)) score = 90;
      else if (barcode && barcode.includes(cleanBarcodeQuery)) score = 80;
      else if (code.includes(cleanBarcodeQuery)) score = 70;
      else if (supplier && supplier.includes(cleanQuery)) score = 60;
      else if (description.includes(cleanQuery)) score = 50;

      return score ? { item, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.item.description.localeCompare(b.item.description));

  return scored.slice(0, limit).map((match) => match.item);
}

function getLookupMeta(item) {
  const parts = [item.barcode || item.code, item.code];
  if (item.supplierName) parts.push(item.supplierName);
  const stockQty = getStockQty(item);
  if (stockQty !== null) parts.push(`Stock ${stockQty.toLocaleString()}`);
  return parts.filter(Boolean).join(" | ");
}

function renderQuickButtonSearchResults() {
  if (!isAdminUser()) return;
  const query = elements.quickButtonSearchInput.value.trim().toLowerCase();
  elements.quickButtonSearchResults.innerHTML = "";

  if (!query) {
    elements.quickButtonSearchResults.innerHTML = `<div class="empty-state"><strong>Search item</strong><p>Type SKU or description to add a quick button.</p></div>`;
    return;
  }

  const matches = inventory
    .filter((item) => {
      const alreadyAdded = posQuickButtons.some((button) => button.code === item.code);
      return (
        !alreadyAdded &&
        (!normalizeBarcode(item.barcode) || String(item.barcode || "").trim() === "") &&
        (item.code.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          String(item.supplierName || "").toLowerCase().includes(query))
      );
    })
    .slice(0, 12);

  if (!matches.length) {
    elements.quickButtonSearchResults.innerHTML = `<div class="empty-state"><strong>No item found</strong><p>Try another SKU or item description.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  matches.forEach((item) => {
    const row = document.createElement("div");
    row.className = "quick-search-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.description)}</strong>
        <small>${escapeHtml(getLookupMeta(item))} | ${formatMoney(item.price || 0)}</small>
      </div>
      <button class="secondary-button" type="button">Add</button>
    `;
    row.querySelector("button").addEventListener("click", () => addQuickButton(item.code));
    fragment.appendChild(row);
  });
  elements.quickButtonSearchResults.appendChild(fragment);
}

function renderAdminQuickButtons() {
  if (!isAdminUser()) return;
  elements.adminQuickButtonCount.textContent = `${posQuickButtons.length.toLocaleString()} saved`;
  elements.adminQuickButtonGrid.innerHTML = "";

  if (!posQuickButtons.length) {
    elements.adminQuickButtonGrid.innerHTML = `<div class="empty-state"><strong>No quick buttons</strong><p>Search below to add no-barcode items.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  posQuickButtons.forEach((button) => {
    const row = document.createElement("div");
    row.className = "quick-search-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(button.label || button.code)}</strong>
        <small>${escapeHtml(button.code)} | ${formatMoney(button.price || 0)}</small>
      </div>
      <button class="secondary-button danger" type="button">Remove</button>
    `;
    row.querySelector("button").addEventListener("click", () => removeQuickButton(button.code));
    fragment.appendChild(row);
  });
  elements.adminQuickButtonGrid.appendChild(fragment);
}

function addQuickButton(code) {
  if (!isAdminUser()) {
    alert("Only Administrator can add quick buttons.");
    return;
  }
  const item = inventory.find((sku) => sku.code === code);
  if (!item) return;
  let price = sanitizeMoney(item.price);
  if (price <= 0) {
    const entered = prompt(`Enter selling price for quick button\n${item.description}`, "0.00");
    if (entered === null) return;
    price = sanitizeMoney(entered);
    if (price <= 0) {
      alert("Price must be greater than zero.");
      return;
    }
    item.price = price;
    saveInventory();
  }

  posQuickButtons.push({
    code: item.code,
    label: item.description,
    price,
    createdAt: new Date().toISOString(),
  });
  savePosQuickButtons();
  elements.quickButtonSearchInput.value = "";
  renderQuickButtons();
  renderAdminQuickButtons();
  renderQuickButtonSearchResults();
  syncQuickButtonToCloud(posQuickButtons.find((button) => button.code === item.code));
}

function removeQuickButton(code) {
  if (!isAdminUser()) {
    alert("Only Administrator can remove quick buttons.");
    return;
  }
  const button = posQuickButtons.find((item) => item.code === code);
  if (!button) return;
  if (!confirm(`Remove quick button?\n${button.label || button.code}`)) return;
  posQuickButtons = posQuickButtons.filter((item) => item.code !== code);
  savePosQuickButtons();
  renderQuickButtons();
  renderAdminQuickButtons();
  renderQuickButtonSearchResults();
  removeQuickButtonFromCloud(button);
}

function handleQuickButtonSale(code) {
  if (!posSession.active) {
    elements.posScanStatus.textContent = "OPEN POS FIRST";
    alert("Open POS first.");
    return;
  }

  if (!posSession.transactionActive) {
    elements.posScanStatus.textContent = "START TRANSACTION";
    alert("Tap Start Transaction before adding quick button items.");
    return;
  }

  const quickButton = posQuickButtons.find((button) => button.code === code);
  addPosItemByCode(code, "quick", quickButton?.price || 0);
}

function addPosItemByCode(code, source = "quick", savedPrice = 0) {
  const item = inventory.find((sku) => sku.code === code);
  if (!item) {
    alert("Quick button item was not found in product list.");
    return;
  }

  const existing = posSession.cart.find((line) => line.code === item.code);
  const stockQty = getStockQty(item);
  const cartQty = Number(existing?.qty || 0);
  if (stockQty !== null && stockQty <= cartQty) {
    elements.posScanStatus.textContent = "OUT OF INVENTORY";
    alert(`Out of inventory.\n${item.description}\nAvailable stock: ${stockQty.toLocaleString()}`);
    triggerHaptic();
    playScanBeep(180, 180);
    return;
  }

  const price = sanitizeMoney(savedPrice) || ensurePosPrice(item);
  if (price === null) {
    elements.posScanStatus.textContent = "PRICE REQUIRED";
    return;
  }

  if (existing) {
    existing.qty = Number(existing.qty || 0) + 1;
  } else {
    posSession.cart.push({
      code: item.code,
      description: item.description,
      barcode: item.barcode || "",
      price,
      qty: 1,
    });
  }

  savePosSession();
  renderPosCart();
  elements.posScanStatus.textContent =
    source === "quick" ? `QUICK ${item.code}` : source === "manual" ? `TYPED ${item.code}` : `ADDED ${item.code}`;
  triggerHaptic();
  playScanBeep();
}

function ensurePosPrice(item) {
  let price = sanitizeMoney(item.price);
  if (price > 0) return price;

  const entered = prompt(`Enter selling price for ${item.description}`, "0.00");
  if (entered === null) return null;
  price = sanitizeMoney(entered);
  if (price <= 0) {
    alert("Price must be greater than zero.");
    return null;
  }

  item.price = price;
  saveInventory();
  return price;
}

function updatePosLineQty(code, value) {
  const line = posSession.cart.find((item) => item.code === code);
  if (!line) return;
  const item = inventory.find((sku) => sku.code === code);
  const stockQty = getStockQty(item);
  const requestedQty = Math.max(1, sanitizeQty(value));
  if (stockQty !== null && requestedQty > stockQty) {
    alert(`Not enough inventory.\n${line.description}\nAvailable stock: ${stockQty.toLocaleString()}`);
    if (stockQty <= 0) {
      removePosLine(code);
      return;
    }
    line.qty = stockQty;
  } else {
    line.qty = requestedQty;
  }
  savePosSession();
  renderPosCart();
}

async function createVoidApprovalRequest(line, reason) {
  const deviceRequestId = createDeviceId("void");
  const payload = {
    device_request_id: deviceRequestId,
    transaction_id: posSession.currentTransactionId || createDeviceId("txn"),
    branch_name: branchName || appUser?.branchName || "",
    crew_username: posSession.crewUsername || posSession.crew || "",
    crew_name: posSession.crew || "",
    item_code: line.code,
    barcode: line.barcode || null,
    description: line.description,
    qty: Number(line.qty || 0),
    price: sanitizeMoney(line.price),
    line_total: sanitizeMoney(Number(line.qty || 0) * Number(line.price || 0)),
    reason,
    status: "pending",
    raw_payload: {
      line,
      requestedBy: posSession.crewUsername || posSession.crew || "",
      requestedFrom: appUser?.username || "",
    },
  };

  const rows = await supabaseRequest("/rest/v1/void_approval_requests", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  return rows[0];
}

async function logApprovedVoid(line, reason) {
  try {
    const deviceRequestId = createDeviceId("void");
    await supabaseRequest("/rest/v1/void_approval_requests", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        device_request_id: deviceRequestId,
        transaction_id: posSession.currentTransactionId || createDeviceId("txn"),
        branch_name: branchName || appUser?.branchName || "",
        crew_username: posSession.crewUsername || posSession.crew || "",
        crew_name: posSession.crew || "",
        item_code: line.code,
        barcode: line.barcode || null,
        description: line.description,
        qty: Number(line.qty || 0),
        price: sanitizeMoney(line.price),
        line_total: sanitizeMoney(Number(line.qty || 0) * Number(line.price || 0)),
        reason,
        status: "approved",
        decided_at: new Date().toISOString(),
        decided_by: posSession.crewUsername || posSession.crew || "",
        decision_note: "Direct authorized void",
        applied_at: new Date().toISOString(),
        raw_payload: { line },
      }),
    });
  } catch {
    // A local authorized void should not fail just because audit logging is temporarily offline.
  }
}

async function voidPosLine(code) {
  const line = posSession.cart.find((item) => item.code === code);
  if (!line) return;

  if (canApproveVoid(posSession.crewRole)) {
    if (!confirm("Void this item from the current transaction?")) return;
    await logApprovedVoid(line, "Direct void by authorized POS user.");
    removePosLine(code);
    return;
  }

  const reason = prompt(`Reason for void request\n${line.description}`, "");
  if (reason === null) return;
  const cleanReason = reason.trim();
  if (!cleanReason) {
    alert("Void reason is required.");
    return;
  }

  try {
    const request = await createVoidApprovalRequest(line, cleanReason);
    posSession.voidRequests.unshift({
      requestId: request.id,
      deviceRequestId: request.device_request_id,
      code: line.code,
      status: "pending",
      requestedAt: request.requested_at,
    });
    savePosSession();
    renderPosCart();
    alert("Void request sent. Supervisor must approve before this item is removed.");
  } catch (error) {
    alert(`Void request could not be sent.\n${error.message}`);
  }
}

function removePosLine(code) {
  posSession.cart = posSession.cart.filter((item) => item.code !== code);
  savePosSession();
  renderPosCart();
}

function clearPosCart() {
  if (!posSession.transactionActive && !posSession.cart.length) return;
  if (!canApproveVoid(posSession.crewRole)) {
    alert("Only Manager, Branch Head, or Administrator can void the entire transaction.");
    return;
  }
  if (!confirm("Void entire current transaction?")) return;
  posSession.cart = [];
  posSession.transactionActive = false;
  savePosSession();
  stopPosScanner();
  renderPos();
}

function handlePosTransactionButton() {
  if (posSession.transactionActive) {
    completePosSale();
    return;
  }

  startPosTransaction();
}

function startPosTransaction() {
  if (!posSession.active) {
    alert("Open POS and enter change fund first.");
    return;
  }

  if (posSession.transactionActive && posSession.cart.length) {
    alert("There is an unpaid transaction in the cart. Complete Cash Out first.");
    return;
  }

  posSession.cart = [];
  posSession.transactionActive = true;
  posSession.currentTransactionId = createDeviceId("txn");
  posSession.voidRequests = [];
  savePosSession();
  renderPos();
  startPosScanner();
}

async function completePosSale() {
  if (!posSession.transactionActive) {
    startPosTransaction();
    return;
  }

  if (!posSession.cart.length) {
    alert("No items in transaction.");
    return;
  }

  if ((posSession.voidRequests || []).some((request) => request.status === "pending")) {
    alert("There is a pending void approval. Check Void Status before Cash Out.");
    return;
  }

  const total = getPosCartTotal();
  const payment = await collectPosPayment(total);
  if (!payment) return;

  const sale = {
    id: posSession.currentTransactionId || createDeviceId("sale"),
    crew: posSession.crew,
    crewUsername: posSession.crewUsername || posSession.crew,
    createdAt: new Date().toISOString(),
    total,
    payment,
    items: posSession.cart.map((line) => ({ ...line })),
  };
  posSession.sales.unshift(sale);
  deductInventoryStock(sale.items);
  posSession.cart = [];
  posSession.transactionActive = false;
  posSession.currentTransactionId = "";
  posSession.voidRequests = [];
  savePosSession();
  stopPosScanner();
  renderPos();
  if (payment.method === "cash") {
    alert(`Cash out completed.\nTotal: ${formatMoney(total)}\nCash: ${formatMoney(payment.amountTendered)}\nChange: ${formatMoney(payment.change)}`);
  } else if (payment.method === "gcash") {
    alert(`GCash payment recorded.\nTotal: ${formatMoney(total)}\nReference: ${payment.reference}`);
  } else {
    alert(`Credit/Debit Card payment recorded.\nTotal: ${formatMoney(total)}\nReference: ${payment.reference}`);
  }
}

function deductInventoryStock(items) {
  let changed = false;
  items.forEach((line) => {
    const item = inventory.find((sku) => sku.code === line.code);
    const stockQty = getStockQty(item);
    if (!item || stockQty === null) return;
    item.stockQty = Math.max(0, stockQty - Number(line.qty || 0));
    changed = true;
  });
  if (changed) saveInventory();
}

function collectPosPayment(total) {
  return openPaymentDialog(total);
}

function buildPayment(method, total, inputValue = "") {
  if (method === "cash") {
    const amountTendered = sanitizeMoney(inputValue);
    if (amountTendered < total) {
      alert("Cash amount is less than total purchase.");
      return null;
    }

    return {
      method: "cash",
      amountPaid: total,
      amountTendered,
      change: sanitizeMoney(amountTendered - total),
      reference: "",
    };
  }

  if (method === "gcash" || method === "card") {
    const cleanReference = String(inputValue || "").trim();
    if (!cleanReference) {
      alert(method === "gcash" ? "GCash reference number is required." : "Card reference number is required.");
      return null;
    }

    return {
      method,
      amountPaid: total,
      amountTendered: total,
      change: 0,
      reference: cleanReference,
    };
  }

  return null;
}

function openPaymentDialog(total) {
  stopPosScanner();

  return new Promise((resolve) => {
    let selectedMethod = "cash";
    const overlay = document.createElement("div");
    overlay.className = "payment-overlay";
    overlay.innerHTML = `
      <form class="payment-dialog">
        <div class="section-heading">
          <h2>Cash Out</h2>
          <span>Total ${formatMoney(total)}</span>
        </div>
        <div class="payment-methods" role="group" aria-label="Payment method">
          <button class="is-active" type="button" data-payment-method="cash">Cash</button>
          <button type="button" data-payment-method="gcash">GCash</button>
          <button type="button" data-payment-method="card">Credit/Debit Card</button>
        </div>
        <label>
          <span id="paymentInputLabel">Cash Given</span>
          <input id="paymentValueInput" type="number" min="0" step="0.01" inputmode="decimal" value="${formatMoney(total).replace(/,/g, "")}" />
        </label>
        <div class="payment-summary" id="paymentSummary">Change: 0.00</div>
        <div class="approval-actions">
          <button class="secondary-button" type="button" data-payment-cancel>Cancel</button>
          <button class="primary-button" type="submit">Confirm Payment</button>
        </div>
      </form>
    `;

    document.body.appendChild(overlay);
    const form = overlay.querySelector("form");
    const input = overlay.querySelector("#paymentValueInput");
    const label = overlay.querySelector("#paymentInputLabel");
    const summary = overlay.querySelector("#paymentSummary");
    const methodButtons = overlay.querySelectorAll("[data-payment-method]");

    function close(value) {
      overlay.remove();
      resolve(value);
    }

    function renderPaymentInput() {
      methodButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.paymentMethod === selectedMethod));
      if (selectedMethod === "cash") {
        label.textContent = "Cash Given";
        input.type = "number";
        input.inputMode = "decimal";
        input.value = input.value || formatMoney(total).replace(/,/g, "");
        summary.textContent = `Change: ${formatMoney(Math.max(sanitizeMoney(input.value) - total, 0))}`;
      } else {
        label.textContent = selectedMethod === "gcash" ? "GCash Reference Number" : "Card Reference Number";
        input.type = "text";
        input.inputMode = "text";
        input.value = "";
        summary.textContent = `Payment: ${formatMoney(total)}`;
      }
      input.focus();
    }

    methodButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedMethod = button.dataset.paymentMethod;
        renderPaymentInput();
      });
    });

    input.addEventListener("input", () => {
      if (selectedMethod === "cash") {
        summary.textContent = `Change: ${formatMoney(Math.max(sanitizeMoney(input.value) - total, 0))}`;
      }
    });

    overlay.querySelector("[data-payment-cancel]").addEventListener("click", () => close(null));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const payment = buildPayment(selectedMethod, total, input.value);
      if (!payment) return;
      close(payment);
    });

    renderPaymentInput();
  });
}

function renderPosReading(type) {
  const salesTotal = getPosSalesTotal();
  const cashTotal = getPosPaymentTotal("cash");
  const gcashTotal = getPosPaymentTotal("gcash");
  const cardTotal = getPosPaymentTotal("card");
  const transactionCount = posSession.sales.length;
  const itemCount = posSession.sales.reduce((sum, sale) => sum + sale.items.reduce((lineSum, item) => lineSum + Number(item.qty || 0), 0), 0);
  elements.posReadingLabel.textContent = `${type} Reading`;
  elements.posReadingDetails.innerHTML = `
    <strong>${type} Reading</strong>
    <span>Crew: ${escapeHtml(posSession.crew || "Not set")}</span>
    <span>Started: ${escapeHtml(posSession.startedAt ? formatAuditDate(posSession.startedAt) : "Not set")}</span>
    <span>Change Fund: ${formatMoney(posSession.float || 0)}</span>
    <span>Transactions: ${transactionCount.toLocaleString()} | Items: ${itemCount.toLocaleString()}</span>
    <span>Gross Sales: ${formatMoney(salesTotal)}</span>
    <span>Cash Sales: ${formatMoney(cashTotal)}</span>
    <span>GCash Sales: ${formatMoney(gcashTotal)}</span>
    <span>Credit/Debit Card Sales: ${formatMoney(cardTotal)}</span>
    <span>Total Cash: ${formatMoney(Number(posSession.float || 0) + cashTotal)}</span>
  `;
}

function closePosShift() {
  if (!posSession.active) return;
  renderPosReading("Y");
  if (!confirm("Y Reading will close the current POS shift. Continue?")) return;
  if (posSession.cart.length && !confirm("There is an active transaction. Close and void it?")) return;
  posSession = createEmptyPosSession();
  savePosSession();
  stopPosScanner();
  renderPos();
}

function renderSync() {
  if (!elements.syncProductCount) return;

  const pendingSales = getPendingSales();
  elements.syncProductCount.textContent = inventory.length.toLocaleString();
  elements.syncPendingSales.textContent = pendingSales.length.toLocaleString();
  elements.syncLastRun.textContent = syncState.lastRunAt ? `Last sync: ${formatAuditDate(syncState.lastRunAt)}` : "Never synced";
  elements.syncStatusBadge.textContent = pendingSales.length ? "Pending" : "Ready";
  elements.syncDetails.textContent =
    syncState.lastMessage || "Download product updates before selling, then upload completed POS sales when internet is available.";
}

async function loadVoidApprovals() {
  if (!elements.voidApprovalList) return;

  if (!canApproveVoid(appUser?.role)) {
    elements.voidApprovalCount.textContent = "restricted";
    elements.voidApprovalList.innerHTML =
      `<div class="empty-state"><strong>Supervisor access only</strong><p>Manager, Branch Head, or Administrator can approve void requests.</p></div>`;
    return;
  }

  elements.voidApprovalCount.textContent = "checking";
  elements.voidApprovalList.innerHTML = `<div class="empty-state"><strong>Loading requests</strong><p>Please wait.</p></div>`;

  try {
    const branchFilter = appUser?.role === "branch_head" && appUser.branchName
      ? `&branch_name=eq.${encodeURIComponent(appUser.branchName)}`
      : "";
    const requests = await supabaseRequest(
      `/rest/v1/void_approval_requests?select=*&status=eq.pending${branchFilter}&order=requested_at.asc&limit=50`
    );
    renderVoidApprovals(requests);
  } catch (error) {
    elements.voidApprovalCount.textContent = "error";
    elements.voidApprovalList.innerHTML =
      `<div class="empty-state"><strong>Cannot load requests</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function renderVoidApprovals(requests) {
  elements.voidApprovalCount.textContent = `${requests.length.toLocaleString()} pending`;
  elements.voidApprovalList.innerHTML = "";

  if (!requests.length) {
    elements.voidApprovalList.innerHTML =
      `<div class="empty-state"><strong>No pending request</strong><p>Void requests from crew will appear here.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  requests.forEach((request) => {
    const card = document.createElement("article");
    card.className = "approval-card";
    card.innerHTML = `
      <div>
        <strong>${escapeHtml(request.description)}</strong>
        <span>${escapeHtml(request.item_code)} | Qty ${Number(request.qty || 0).toLocaleString()} | ${formatMoney(request.line_total || 0)}</span>
        <small>Branch: ${escapeHtml(request.branch_name || "Not set")}</small>
        <small>Crew: ${escapeHtml(request.crew_name || request.crew_username || "Unknown")}</small>
        <small>Reason: ${escapeHtml(request.reason || "No reason")}</small>
        <small>Requested: ${escapeHtml(formatAuditDate(request.requested_at))}</small>
      </div>
      <div class="approval-actions">
        <button class="secondary-button" type="button" data-approve-void="${escapeHtml(request.id)}">Approve</button>
        <button class="secondary-button danger" type="button" data-reject-void="${escapeHtml(request.id)}">Reject</button>
      </div>
    `;
    fragment.appendChild(card);
  });

  elements.voidApprovalList.appendChild(fragment);
  elements.voidApprovalList.querySelectorAll("[data-approve-void]").forEach((button) => {
    button.addEventListener("click", () => decideVoidRequest(button.dataset.approveVoid, "approved"));
  });
  elements.voidApprovalList.querySelectorAll("[data-reject-void]").forEach((button) => {
    button.addEventListener("click", () => decideVoidRequest(button.dataset.rejectVoid, "rejected"));
  });
}

async function decideVoidRequest(id, status) {
  if (!canApproveVoid(appUser?.role)) {
    alert("Only Manager, Branch Head, or Administrator can approve void requests.");
    return;
  }

  const action = status === "approved" ? "approve" : "reject";
  const note = prompt(`Optional note for ${action} decision`, "");
  if (note === null) return;

  try {
    await supabaseRequest(`/rest/v1/void_approval_requests?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status,
        decided_at: new Date().toISOString(),
        decided_by: appUser?.username || "supervisor",
        decision_note: note.trim(),
      }),
    });
    await loadVoidApprovals();
  } catch (error) {
    alert(`Could not ${action} request.\n${error.message}`);
  }
}

async function checkVoidRequestStatuses() {
  const pending = (posSession.voidRequests || []).filter((request) => request.status === "pending");
  if (!pending.length) {
    alert("No pending void approval request.");
    return;
  }

  try {
    const ids = pending.map((request) => request.requestId).filter(Boolean);
    const rows = await supabaseRequest(
      `/rest/v1/void_approval_requests?select=id,item_code,status,decision_note&id=in.(${ids.map(encodeURIComponent).join(",")})`
    );
    let approved = 0;
    let rejected = 0;

    rows.forEach((row) => {
      const localRequest = posSession.voidRequests.find((request) => request.requestId === row.id);
      if (!localRequest) return;

      if (row.status === "approved") {
        removePosLine(row.item_code);
        localRequest.status = "applied";
        approved += 1;
        markVoidApplied(row.id);
      } else if (row.status === "rejected") {
        localRequest.status = "rejected";
        rejected += 1;
      }
    });

    savePosSession();
    renderPosCart();
    alert(`Void status checked.\nApproved and removed: ${approved}\nRejected: ${rejected}\nStill pending: ${Math.max(pending.length - approved - rejected, 0)}`);
  } catch (error) {
    alert(`Could not check void status.\n${error.message}`);
  }
}

async function markVoidApplied(id) {
  try {
    await supabaseRequest(`/rest/v1/void_approval_requests?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "applied",
        applied_at: new Date().toISOString(),
      }),
    });
  } catch {
    // The item was already approved and removed locally; applying the audit flag can retry later.
  }
}

async function syncAll() {
  setSyncBusy(true, "Syncing...");
  try {
    const download = await downloadProductsFromCloud({ silent: true });
    const buttons = await downloadQuickButtonsFromCloud({ silent: true });
    const upload = await uploadSalesToCloud({ silent: true });
    setSyncMessage(`Sync complete. Products updated: ${download.updated}. Quick buttons: ${buttons.updated}. Sales uploaded: ${upload.uploaded}.`);
  } catch (error) {
    setSyncMessage(`Sync failed: ${error.message}`);
    alert(`Sync failed.\n${error.message}`);
  } finally {
    setSyncBusy(false);
  }
}

async function autoSyncPosFromCloud() {
  if (posAutoSyncInProgress || !canUsePosFromAppUser()) return;
  posAutoSyncInProgress = true;
  const previousStatus = elements.posScanStatus.textContent || "READY";
  elements.posScanStatus.textContent = "SYNCING CLOUD";

  try {
    const products = await downloadProductsFromCloud({ silent: true });
    const buttons = await downloadQuickButtonsFromCloud({ silent: true });
    await uploadSalesToCloud({ silent: true });
    elements.posScanStatus.textContent = `SYNCED ${products.updated.toLocaleString()} SKU / ${buttons.updated.toLocaleString()} BUTTONS`;
  } catch (error) {
    elements.posScanStatus.textContent = "SYNC FAILED";
    console.warn("POS auto sync failed", error);
    setSyncMessage(`POS auto sync failed: ${error.message}`);
  } finally {
    posAutoSyncInProgress = false;
    window.setTimeout(() => {
      if (elements.posScanStatus.textContent.startsWith("SYNC")) {
        elements.posScanStatus.textContent = posSession.transactionActive ? "READY" : previousStatus;
      }
    }, 2500);
  }
}

async function downloadProductsFromCloud(options = {}) {
  if (!options.silent) setSyncBusy(true, "Downloading products...");

  try {
    const batchSize = 1000;
    let offset = 0;
    let updated = 0;

    while (true) {
      const products = await fetchProductPage(offset, batchSize);

      products.forEach((product) => {
        if (
          upsertSku(
            product.sku_code,
            product.description,
            null,
            null,
            product.barcode || "",
            product.price || 0,
            product.stock_qty,
            product.supplier_name || ""
          )
        ) {
          updated += 1;
        }
      });

      if (products.length < batchSize) break;
      offset += batchSize;
    }

    saveInventory();
    render();
    setSyncMessage(`Product download complete. ${updated.toLocaleString()} product records updated on this phone.`);
    await writeSyncLog("download_products", "success", `${updated} products downloaded`);
    return { updated };
  } catch (error) {
    setSyncMessage(`Product download failed: ${error.message}`);
    await writeSyncLog("download_products", "failed", error.message);
    if (!options.silent) alert(`Product download failed.\n${error.message}`);
    throw error;
  } finally {
    if (!options.silent) setSyncBusy(false);
  }
}

async function downloadQuickButtonsFromCloud(options = {}) {
  if (!options.silent) setSyncBusy(true, "Downloading quick buttons...");

  try {
    const rows = await supabaseRequest(
      "/rest/v1/pos_quick_buttons?select=sku_code,label,price,sort_order,updated_at&is_active=eq.true&order=sort_order.asc,sku_code.asc"
    );

    posQuickButtons = rows.map((row) => ({
      code: row.sku_code,
      label: row.label || row.sku_code,
      price: sanitizeMoney(row.price || 0),
      createdAt: row.updated_at || new Date().toISOString(),
    }));
    savePosQuickButtons();
    renderQuickButtons();
    renderAdminQuickButtons();
    renderQuickButtonSearchResults();
    if (!options.silent) setSyncMessage(`Quick buttons downloaded. ${posQuickButtons.length.toLocaleString()} saved on this phone.`);
    return { updated: posQuickButtons.length };
  } catch (error) {
    if (isQuickButtonCloudMissing(error)) {
      if (!options.silent) setSyncMessage("Quick button cloud table is not set up yet. Local buttons remain available.");
      return { updated: posQuickButtons.length, skipped: true };
    }
    if (!options.silent) {
      setSyncMessage(`Quick button download failed: ${error.message}`);
      alert(`Quick button download failed.\n${error.message}`);
    }
    throw error;
  } finally {
    if (!options.silent) setSyncBusy(false);
  }
}

async function uploadSalesToCloud(options = {}) {
  if (!options.silent) setSyncBusy(true, "Uploading sales...");

  try {
    const pendingSales = getPendingSales();
    let uploaded = 0;

    for (const sale of pendingSales) {
      const cloudSale = await uploadOneSale(sale);
      sale.syncedAt = new Date().toISOString();
      sale.cloudSaleId = cloudSale.id;
      uploaded += 1;
      savePosSession();
    }

    render();
    setSyncMessage(`Sales upload complete. ${uploaded.toLocaleString()} sale records uploaded.`);
    await writeSyncLog("upload_sales", "success", `${uploaded} sales uploaded`);
    return { uploaded };
  } catch (error) {
    savePosSession();
    setSyncMessage(`Sales upload failed: ${error.message}`);
    await writeSyncLog("upload_sales", "failed", error.message);
    if (!options.silent) alert(`Sales upload failed.\n${error.message}`);
    throw error;
  } finally {
    if (!options.silent) setSyncBusy(false);
  }
}

async function syncQuickButtonToCloud(button) {
  if (!button) return;
  try {
    await supabaseRequest("/rest/v1/pos_quick_buttons?on_conflict=sku_code", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        sku_code: button.code,
        label: button.label || button.code,
        price: sanitizeMoney(button.price || 0),
        sort_order: posQuickButtons.findIndex((item) => item.code === button.code) + 1,
        is_active: true,
        updated_by: appUser?.username || "admin",
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (error) {
    if (isQuickButtonCloudMissing(error)) return;
    alert(`Quick button saved on this phone but not synced to cloud.\n${error.message}`);
  }
}

async function uploadLocalQuickButtonsToCloud() {
  if (!isAdminUser() || !posQuickButtons.length) return;
  for (const button of posQuickButtons) {
    await syncQuickButtonToCloud(button);
  }
}

async function removeQuickButtonFromCloud(button) {
  if (!button) return;
  try {
    await supabaseRequest(`/rest/v1/pos_quick_buttons?sku_code=eq.${encodeURIComponent(button.code)}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        is_active: false,
        updated_by: appUser?.username || "admin",
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (error) {
    if (isQuickButtonCloudMissing(error)) return;
    alert(`Quick button removed on this phone but not synced to cloud.\n${error.message}`);
  }
}

function isQuickButtonCloudMissing(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("pos_quick_buttons") || message.includes("schema cache");
}

async function fetchProductPage(offset, batchSize) {
  const headers = {
    Range: `${offset}-${offset + batchSize - 1}`,
  };

  try {
    return await supabaseRequest(
      `/rest/v1/products?select=sku_code,barcode,description,price,stock_qty,supplier_name&is_active=eq.true&order=sku_code.asc`,
      { headers }
    );
  } catch (error) {
    if (!String(error.message || "").includes("supplier_name")) throw error;
    return supabaseRequest(
      `/rest/v1/products?select=sku_code,barcode,description,price,stock_qty&is_active=eq.true&order=sku_code.asc`,
      { headers }
    );
  }
}

async function uploadOneSale(sale) {
  const transactionPayload = {
    device_sale_id: sale.id,
    branch_name: branchName || "Not set",
    crew_username: sale.crewUsername || sale.crew || "Unknown",
    shift_started_at: posSession.startedAt || null,
    sold_at: sale.createdAt || new Date().toISOString(),
    payment_method: sale.payment?.method || "cash",
    total: sanitizeMoney(sale.total),
    amount_tendered: sanitizeMoney(sale.payment?.amountTendered ?? sale.total),
    change_amount: sanitizeMoney(sale.payment?.change || 0),
    gcash_reference: sale.payment?.reference || null,
    raw_payload: sale,
  };

  const existing = await findCloudSale(sale.id);
  const transaction = existing || (await insertCloudSale(transactionPayload));

  if (!existing) {
    const itemPayload = sale.items.map((item) => ({
      sale_id: transaction.id,
      sku_code: item.code,
      barcode: item.barcode || null,
      description: item.description,
      qty: Number(item.qty || 0),
      price: sanitizeMoney(item.price),
      line_total: sanitizeMoney(Number(item.qty || 0) * Number(item.price || 0)),
      raw_payload: item,
    }));

    if (itemPayload.length) {
      await supabaseRequest("/rest/v1/sales_items", {
        method: "POST",
        headers: {
          Prefer: "return=minimal",
        },
        body: JSON.stringify(itemPayload),
      });
    }
  }

  return transaction;
}

async function findCloudSale(deviceSaleId) {
  const encodedId = encodeURIComponent(deviceSaleId);
  const rows = await supabaseRequest(`/rest/v1/sales_transactions?select=id&device_sale_id=eq.${encodedId}&limit=1`);
  return rows[0] || null;
}

async function insertCloudSale(payload) {
  const rows = await supabaseRequest("/rest/v1/sales_transactions", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  return rows[0];
}

async function writeSyncLog(syncType, status, message) {
  try {
    await supabaseRequest("/rest/v1/sync_logs", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        device_id: appUser?.username || "phone",
        branch_name: branchName || "",
        sync_type: syncType,
        status,
        message,
      }),
    });
  } catch {
    // Sync logs should never block the actual product or sales sync.
  }
}

async function verifyCloudUser(username, password, requiredArea) {
  try {
    const rows = await supabaseRequest("/rest/v1/rpc/verify_app_user", {
      method: "POST",
      body: JSON.stringify({
        input_username: username,
        input_password: password,
        required_area: requiredArea,
      }),
    });

    const user = rows[0];
    if (!user) {
      alert(requiredArea === "pos" ? "Invalid crew username or password." : "Invalid username or password.");
      return null;
    }

    return {
      username: user.username,
      displayName: user.display_name || user.username,
      role: user.role || "crew",
      branchName: user.branch_name || "",
    };
  } catch (error) {
    if (isUserSetupMissing(error)) {
      alert("Cloud users are not set up yet. Temporary login allowed for now.");
      return {
        username,
        displayName: username,
        role: requiredArea === "pos" ? "crew" : "admin",
        branchName: "",
      };
    }

    alert(`Login failed.\n${error.message}`);
    return null;
  }
}

function isUserSetupMissing(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("verify_app_user") || message.includes("schema cache") || message.includes("function");
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.hint || response.statusText || "Supabase request failed.";
    throw new Error(message);
  }

  return data || [];
}

function getPendingSales() {
  return (posSession.sales || []).filter((sale) => !sale.syncedAt);
}

function setSyncBusy(isBusy, message = "") {
  [elements.syncAllButton, elements.downloadProductsButton, elements.uploadSalesButton].forEach((button) => {
    button.disabled = isBusy;
  });

  if (message) {
    elements.syncStatusBadge.textContent = isBusy ? "Working" : "Ready";
    elements.syncDetails.textContent = message;
  }
}

function setSyncMessage(message) {
  syncState.lastRunAt = new Date().toISOString();
  syncState.lastMessage = message;
  saveSyncState();
  renderSync();
}

function getPosCartTotal() {
  return posSession.cart.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.price || 0), 0);
}

function getPosCartQty() {
  return posSession.cart.reduce((sum, line) => sum + Number(line.qty || 0), 0);
}

function getPosSalesTotal() {
  return posSession.sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
}

function getPosPaymentTotal(method) {
  return posSession.sales
    .filter((sale) => sale.payment?.method === method)
    .reduce((sum, sale) => sum + Number(sale.payment?.amountPaid || sale.total || 0), 0);
}

function triggerHaptic() {
  if (navigator.vibrate) navigator.vibrate(25);
}

function playScanBeep(frequency = 880, duration = 110) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration / 1000);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration / 1000);
  } catch {
    // Sound is best-effort; scanning must continue if audio is blocked.
  }
}

function getItemStatus(item) {
  if (!item.saved) return "pending";
  return Number(item.qty || 0) > 0 ? "counted" : "zeroed";
}

function getInitStrategy() {
  return document.querySelector("input[name=\"initStrategy\"]:checked")?.value || "blind";
}

function formatAuditTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function renderReport() {
  const savedAudit = getViewingSavedAudit();
  if (savedAudit) {
    renderSavedAuditReport(savedAudit);
    return;
  }

  elements.reportBody.innerHTML = "";
  const branchLabel = branchName || "Not set";
  const auditorLabel = auditorName || "Not set";
  const counted = inventory.filter((item) => item.saved).length;
  const zeroed = inventory.filter((item) => getItemStatus(item) === "zeroed").length;
  const units = inventory.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const verifiedPercent = inventory.length ? (counted / inventory.length) * 100 : 0;
  const zeroedPercent = inventory.length ? (zeroed / inventory.length) * 100 : 0;
  const query = elements.reportSearchInput.value.trim().toLowerCase();
  const rows = getReportItems().filter((item) => {
    const status = getItemStatus(item);
    const matchesQuery =
      !query ||
      item.code.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      String(item.barcode || "").toLowerCase().includes(query);
    return matchesQuery;
  });

  elements.reportTableTitle.textContent = "Audit Records";
  elements.reportReadyBadge.textContent = "Ready";
  elements.reportBranchLabel.textContent = `Branch: ${branchLabel}`;
  elements.reportBranchSignoff.textContent = branchName || "Branch not set";
  elements.reportAuditorSignoff.textContent = `Auditor: ${auditorLabel}`;
  elements.reportTotalSku.textContent = inventory.length.toLocaleString();
  elements.reportUnitsCounted.textContent = units.toLocaleString();
  elements.reportZeroedSku.textContent = zeroed.toLocaleString();
  elements.reportProgressText.textContent = `${counted.toLocaleString()} / ${inventory.length.toLocaleString()} SKUs Verified`;
  elements.reportVerifiedBar.style.width = `${verifiedPercent}%`;
  elements.reportZeroedBar.style.width = `${zeroedPercent}%`;
  elements.rowCountDisplay.textContent = `${rows.length.toLocaleString()} non-zero items displayed`;
  elements.reportTimestamp.textContent = `Generated ${new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  if (!inventory.length) {
    elements.reportBody.innerHTML = `<tr><td colspan="3">No SKU loaded.</td></tr>`;
    return;
  }

  if (!rows.length) {
    elements.reportBody.innerHTML = `<tr><td colspan="3">No non-zero quantity items found.</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  rows.forEach((item) => {
    const row = document.createElement("tr");
    const status = getItemStatus(item);
    if (status === "zeroed") row.className = "is-zeroed";
    row.innerHTML = `
      <td>${escapeHtml(item.code)}</td>
      <td>
        <strong>${escapeHtml(item.description)}</strong>
        <small>${status === "pending" ? "Pending audit" : status === "zeroed" ? "Out of stock • flagged zero" : "Verified tally"}</small>
      </td>
      <td><span>${Number(item.qty || 0).toLocaleString()}</span></td>
    `;
    fragment.appendChild(row);
  });
  elements.reportBody.appendChild(fragment);
}

function renderSavedAuditReport(audit) {
  elements.reportBody.innerHTML = "";
  const query = elements.reportSearchInput.value.trim().toLowerCase();
  const rows = audit.rows.filter((item) => {
    return (
      !query ||
      item.code.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      String(item.barcode || "").toLowerCase().includes(query)
    );
  });
  const totalSku = Number(audit.totalSku || rows.length);
  const countedSku = Number(audit.countedSku || audit.rows.length);
  const units = Number(audit.units || 0);
  const verifiedPercent = totalSku ? (countedSku / totalSku) * 100 : 0;

  elements.reportTableTitle.textContent = "Saved Branch Report";
  elements.reportReadyBadge.textContent = "Saved";
  elements.reportBranchLabel.textContent = `Branch: ${audit.branch || "Not set"}`;
  elements.reportBranchSignoff.textContent = audit.branch || "Branch not set";
  elements.reportAuditorSignoff.textContent = `Auditor: ${audit.auditor || "Not set"}`;
  elements.reportTotalSku.textContent = totalSku.toLocaleString();
  elements.reportUnitsCounted.textContent = units.toLocaleString();
  elements.reportZeroedSku.textContent = "0";
  elements.reportProgressText.textContent = `${countedSku.toLocaleString()} / ${totalSku.toLocaleString()} SKUs Verified`;
  elements.reportVerifiedBar.style.width = `${Math.min(100, verifiedPercent)}%`;
  elements.reportZeroedBar.style.width = "0%";
  elements.rowCountDisplay.textContent = `${rows.length.toLocaleString()} saved items displayed`;
  elements.reportTimestamp.textContent = `Finished ${formatAuditDate(audit.finishedAt)}`;

  if (!rows.length) {
    elements.reportBody.innerHTML = `<tr><td colspan="3">No saved item matched the filter.</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.code)}</td>
      <td>
        <strong>${escapeHtml(item.description)}</strong>
        <small>Saved branch count</small>
      </td>
      <td><span>${Number(item.qty || 0).toLocaleString()}</span></td>
    `;
    fragment.appendChild(row);
  });
  elements.reportBody.appendChild(fragment);
}

function renderSavedAudits() {
  elements.savedAuditCount.textContent = `${auditHistory.length.toLocaleString()} saved`;
  elements.savedAuditSelect.innerHTML = "";

  if (!auditHistory.length) {
    elements.savedAuditSelect.innerHTML = `<option value="">No saved counts yet</option>`;
    elements.savedAuditSelect.disabled = true;
    elements.viewCurrentAuditButton.hidden = true;
    elements.exportSavedAuditButton.disabled = true;
    elements.savedAuditDetails.textContent = "No finished audit saved yet.";
    return;
  }

  elements.savedAuditSelect.disabled = false;
  elements.viewCurrentAuditButton.hidden = !viewingSavedAuditId;
  elements.exportSavedAuditButton.disabled = false;
  const fragment = document.createDocumentFragment();
  auditHistory.forEach((audit) => {
    const option = document.createElement("option");
    option.value = audit.id;
    option.textContent = `${audit.branch} - ${formatAuditDate(audit.finishedAt)} - ${audit.rows.length.toLocaleString()} items`;
    fragment.appendChild(option);
  });
  elements.savedAuditSelect.appendChild(fragment);
  elements.savedAuditSelect.value = viewingSavedAuditId || auditHistory[0].id;
  renderSavedAuditDetails();
}

function renderSavedAuditDetails() {
  const audit = getSelectedSavedAudit();
  if (!audit) {
    elements.savedAuditDetails.textContent = "No finished audit saved yet.";
    return;
  }

  elements.savedAuditDetails.innerHTML = `
    <strong>${escapeHtml(audit.branch)}</strong>
    <span>Auditor: ${escapeHtml(audit.auditor)}</span>
    <span>Finished: ${escapeHtml(formatAuditDate(audit.finishedAt))}</span>
    <span>Counted Items: ${audit.rows.length.toLocaleString()} | Units: ${Number(audit.units || 0).toLocaleString()}</span>
  `;
}

function finishCurrentAudit() {
  if (!inventory.length) {
    alert("No SKU loaded yet.");
    return;
  }

  if (!validateScanIdentity()) return;

  const rows = getReportItems();
  if (!rows.length) {
    alert("No counted quantity to save yet.");
    return;
  }

  if (
    !confirm(
      "Are you sure you are done counting?\n\nPress OK to save this branch audit and reset active quantities for the next audit.\nPress Cancel if this was accidental."
    )
  ) {
    return;
  }

  const finishedAt = new Date().toISOString();
  const audit = {
    id: `${finishedAt}-${Math.random().toString(36).slice(2, 8)}`,
    branch: branchName,
    auditor: auditorName,
    finishedAt,
    totalSku: inventory.length,
    countedSku: inventory.filter((item) => item.saved).length,
    units: rows.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    rows: rows.map((item) => ({
      code: item.code,
      description: item.description,
      qty: Number(item.qty || 0),
      barcode: item.barcode || "",
      updatedAt: item.updatedAt || "",
    })),
  };

  auditHistory.unshift(audit);
  saveAuditHistory();
  resetActiveAudit();
  render();
  setTab("upload");
  alert("Audit saved. Next scan will ask for Branch and Auditor again.");
}

function resetActiveAudit() {
  stopScanner();
  inventory = inventory.map((item) => ({
    ...item,
    supplierName: item.supplierName || item.supplier_name || "",
    qty: 0,
    saved: false,
    updatedAt: null,
  }));
  selectedSku = null;
  branchName = "";
  auditorName = "";
  elements.branchInput.value = "";
  elements.auditorInput.value = "";
  saveInventory();
  saveBranchName();
  saveAuditorName();
}

function downloadReport() {
  const savedAudit = getViewingSavedAudit();
  if (savedAudit) {
    const rows = buildAuditExportRows(savedAudit);
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveBlob(blob, `inventory-count-${slugify(savedAudit.branch)}-${savedAudit.finishedAt.slice(0, 10)}.csv`);
    return;
  }

  if (!inventory.length) return;

  const rows = [
    ["Branch", branchName || ""],
    ["Auditor", auditorName || ""],
    ["Generated", new Date().toLocaleString()],
    [],
    ["SKU Code", "Description", "Quantity"],
    ...getReportItems().map((item) => [item.code, item.description, item.qty]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveBlob(blob, `inventory-count${branchFileSuffix()}-${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadExcelReport() {
  const savedAudit = getViewingSavedAudit();
  if (savedAudit) {
    const rows = buildAuditExportRows(savedAudit);
    const blob = buildXlsxBlob(rows, "Saved Count");
    saveBlob(blob, `inventory-count-${slugify(savedAudit.branch)}-${savedAudit.finishedAt.slice(0, 10)}.xlsx`);
    return;
  }

  if (!inventory.length) return;

  const rows = [
    ["Branch", branchName || ""],
    ["Auditor", auditorName || ""],
    ["Generated", new Date().toLocaleString()],
    [],
    ["SKU Code", "Description", "Quantity"],
    ...getReportItems().map((item) => [item.code, item.description, Number(item.qty || 0)]),
  ];
  const blob = buildXlsxBlob(rows, "Inventory Count");
  saveBlob(blob, `inventory-count${branchFileSuffix()}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportSelectedSavedAudit() {
  const audit = getSelectedSavedAudit();
  if (!audit) return;

  const rows = buildAuditExportRows(audit);
  const blob = buildXlsxBlob(rows, "Saved Count");
  saveBlob(blob, `inventory-count-${slugify(audit.branch)}-${audit.finishedAt.slice(0, 10)}.xlsx`);
}

function getReportItems() {
  return inventory.filter((item) => Number(item.qty || 0) > 0);
}

function getSelectedSavedAudit() {
  const id = elements.savedAuditSelect.value || auditHistory[0]?.id;
  return auditHistory.find((audit) => audit.id === id) || null;
}

function getViewingSavedAudit() {
  return viewingSavedAuditId ? auditHistory.find((audit) => audit.id === viewingSavedAuditId) || null : null;
}

function buildAuditExportRows(audit) {
  return [
    ["Branch", audit.branch || ""],
    ["Auditor", audit.auditor || ""],
    ["Finished", formatAuditDate(audit.finishedAt)],
    ["Total SKUs", audit.totalSku || ""],
    ["Counted SKUs", audit.countedSku || ""],
    [],
    ["SKU Code", "Description", "Quantity"],
    ...audit.rows.map((item) => [item.code, item.description, Number(item.qty || 0)]),
  ];
}

function saveBlob(blob, filename) {
  if (window.AndroidBridge?.saveFile) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(",")[1] || "";
      window.AndroidBridge.saveFile(filename, blob.type || "application/octet-stream", base64);
    };
    reader.readAsDataURL(blob);
    return;
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function buildXlsxBlob(rows, sheetName) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${xmlEscape(sheetName).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`,
    "xl/worksheets/sheet1.xml": buildWorksheetXml(rows),
  };

  return new Blob([zipFiles(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function buildWorksheetXml(rows) {
  const body = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, colIndex) => {
          const ref = `${columnName(colIndex + 1)}${rowIndex + 1}`;
          if (typeof value === "number") return `<c r="${ref}"><v>${value}</v></c>`;
          return `<c r="${ref}" t="inlineStr"${rowIndex === 0 ? ' s="1"' : ""}><is><t>${xmlEscape(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols><col min="1" max="1" width="18" customWidth="1"/><col min="2" max="2" width="46" customWidth="1"/><col min="3" max="3" width="12" customWidth="1"/></cols>
  <sheetData>${body}</sheetData>
</worksheet>`;
}

function zipFiles(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const local = zipLocalHeader(nameBytes, data, crc);
    const central = zipCentralHeader(nameBytes, data, crc, offset);
    localParts.push(local, data);
    centralParts.push(central);
    offset += local.length + data.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = zipEndRecord(Object.keys(files).length, centralSize, offset);
  return concatUint8Arrays([...localParts, ...centralParts, end]);
}

function zipLocalHeader(nameBytes, data, crc) {
  const header = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, data.length, true);
  view.setUint32(22, data.length, true);
  view.setUint16(26, nameBytes.length, true);
  header.set(nameBytes, 30);
  return header;
}

function zipCentralHeader(nameBytes, data, crc, offset) {
  const header = new Uint8Array(46 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, data.length, true);
  view.setUint32(24, data.length, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint32(42, offset, true);
  header.set(nameBytes, 46);
  return header;
}

function zipEndRecord(count, centralSize, centralOffset) {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return record;
}

function concatUint8Arrays(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function crc32(bytes) {
  let crc = -1;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[index]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

function columnName(number) {
  let name = "";
  while (number > 0) {
    const mod = (number - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    number = Math.floor((number - mod) / 26);
  }
  return name;
}

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function sanitizeQty(value) {
  return Math.max(0, Math.floor(Number(value || 0)));
}

function parseOptionalStockQty(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  return sanitizeQty(value);
}

function getStockQty(item) {
  if (!item || item.stockQty === null || item.stockQty === undefined || item.stockQty === "") return null;
  return sanitizeQty(item.stockQty);
}

function sanitizeMoney(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  const amount = Number(cleaned || 0);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100) / 100) : 0;
}

function formatMoney(value) {
  return sanitizeMoney(value).toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function normalizeBarcode(value) {
  return String(value || "")
    .trim()
    .replace(/[\s-]+/g, "")
    .toUpperCase();
}

function createDeviceId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function loadInventory() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return stored.map((item) => ({
      ...item,
      supplierName: item.supplierName || item.supplier_name || "",
    }));
  } catch {
    return [];
  }
}

function saveAppUser() {
  localStorage.setItem(APP_USER_KEY, JSON.stringify(appUser));
}

function loadAppUser() {
  try {
    return JSON.parse(localStorage.getItem(APP_USER_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSyncState() {
  localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(syncState));
}

function loadSyncState() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_STATE_KEY)) || { lastRunAt: "", lastMessage: "" };
  } catch {
    return { lastRunAt: "", lastMessage: "" };
  }
}

function saveBranchName() {
  localStorage.setItem(BRANCH_KEY, branchName);
}

function loadBranchName() {
  return localStorage.getItem(BRANCH_KEY) || "";
}

function saveAuditorName() {
  localStorage.setItem(AUDITOR_KEY, auditorName);
}

function loadAuditorName() {
  return localStorage.getItem(AUDITOR_KEY) || "";
}

function saveAuditHistory() {
  localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(auditHistory));
}

function loadAuditHistory() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function savePosSession() {
  localStorage.setItem(POS_SESSION_KEY, JSON.stringify(posSession));
}

function loadPosSession() {
  try {
    return { ...createEmptyPosSession(), ...(JSON.parse(localStorage.getItem(POS_SESSION_KEY)) || {}) };
  } catch {
    return createEmptyPosSession();
  }
}

function savePosQuickButtons() {
  localStorage.setItem(POS_QUICK_BUTTONS_KEY, JSON.stringify(posQuickButtons));
}

function loadPosQuickButtons() {
  try {
    return JSON.parse(localStorage.getItem(POS_QUICK_BUTTONS_KEY)) || [];
  } catch {
    return [];
  }
}

function createEmptyPosSession() {
  return {
    crew: "",
    float: 0,
    active: false,
    shiftStarted: false,
    transactionActive: false,
    crewUsername: "",
    crewRole: "",
    currentTransactionId: "",
    startedAt: "",
    cart: [],
    sales: [],
    voidRequests: [],
  };
}

function formatAuditDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function slugify(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "branch"
  );
}

function branchFileSuffix() {
  const slug = branchName ? slugify(branchName) : "";
  return slug ? `-${slug}` : "";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
