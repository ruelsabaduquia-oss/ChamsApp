const STORAGE_KEY = "storecount_inventory_v2";
const BRANCH_KEY = "storecount_branch_v1";
const AUDITOR_KEY = "storecount_auditor_v1";
const AUDIT_HISTORY_KEY = "storecount_audit_history_v1";
const APP_USER_KEY = "storecount_app_user_v1";
const POS_SESSION_KEY = "storecount_pos_session_v1";

let inventory = loadInventory();
let branchName = loadBranchName();
let auditorName = loadAuditorName();
let auditHistory = loadAuditHistory();
let appUser = loadAppUser();
let activeModule = appUser ? "home" : "login";
let posSession = loadPosSession();
let viewingSavedAuditId = "";
let selectedSku = null;
let currentStatusFilter = "all";
let currentReportFilter = "in-stock";
let keypadOverwrite = true;
let deferredInstallPrompt = null;
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
  openStoreCountButton: $("#openStoreCountButton"),
  openPosButton: $("#openPosButton"),
  storeCountChrome: document.querySelectorAll(".storecount-chrome"),
  tabs: document.querySelectorAll(".tab"),
  panels: {
    upload: $("#uploadPanel"),
    count: $("#countPanel"),
    report: $("#reportPanel"),
    pos: $("#posPanel"),
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
  posFloatForm: $("#posFloatForm"),
  posFloatInput: $("#posFloatInput"),
  posFloatDisplay: $("#posFloatDisplay"),
  posCartTotal: $("#posCartTotal"),
  posSalesTotal: $("#posSalesTotal"),
  posCartCount: $("#posCartCount"),
  posCartRows: $("#posCartRows"),
  posScanVideo: $("#posScanVideo"),
  posScannerPlaceholder: $("#posScannerPlaceholder"),
  posScanButton: $("#posScanButton"),
  posStopScanButton: $("#posStopScanButton"),
  posScanStatus: $("#posScanStatus"),
  posManualBarcodeForm: $("#posManualBarcodeForm"),
  posBarcodeInput: $("#posBarcodeInput"),
  posCompleteSaleButton: $("#posCompleteSaleButton"),
  posClearCartButton: $("#posClearCartButton"),
  posXReadingButton: $("#posXReadingButton"),
  posYReadingButton: $("#posYReadingButton"),
  posReadingLabel: $("#posReadingLabel"),
  posReadingDetails: $("#posReadingDetails"),
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
  elements.openStoreCountButton.addEventListener("click", () => showStoreCount());
  elements.openPosButton.addEventListener("click", () => showPos());

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
  elements.posFloatForm.addEventListener("submit", handlePosFloat);
  elements.posScanButton.addEventListener("click", startPosScanner);
  elements.posStopScanButton.addEventListener("click", stopPosScanner);
  elements.posManualBarcodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlePosBarcode(elements.posBarcodeInput.value, "manual");
    elements.posBarcodeInput.value = "";
  });
  elements.posCompleteSaleButton.addEventListener("click", completePosSale);
  elements.posClearCartButton.addEventListener("click", clearPosCart);
  elements.posXReadingButton.addEventListener("click", () => renderPosReading("X"));
  elements.posYReadingButton.addEventListener("click", closePosShift);

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

function handleAppLogin(event) {
  event.preventDefault();
  const username = elements.appUsernameInput.value.trim();
  const password = elements.appPasswordInput.value.trim();
  if (!username || !password) {
    alert("Enter username and password.");
    return;
  }

  appUser = { username, loggedAt: new Date().toISOString() };
  saveAppUser();
  elements.appLoginForm.reset();
  showModuleHome();
}

function renderAppShell() {
  const loggedIn = Boolean(appUser);
  elements.authScreen.hidden = loggedIn;
  elements.appShell.hidden = !loggedIn;
  if (!loggedIn) return;
  if (activeModule === "pos") showPos();
  else if (activeModule === "storecount") showStoreCount();
  else showModuleHome();
}

function showModuleHome() {
  activeModule = "home";
  stopScanner();
  stopPosScanner();
  elements.authScreen.hidden = true;
  elements.appShell.hidden = false;
  elements.homePanel.classList.add("is-active");
  Object.values(elements.panels).forEach((panel) => panel.classList.remove("is-active"));
  elements.storeCountChrome.forEach((item) => (item.hidden = true));
  updateScreenTitle("Home");
}

function showStoreCount() {
  activeModule = "storecount";
  elements.homePanel.classList.remove("is-active");
  elements.storeCountChrome.forEach((item) => (item.hidden = false));
  setTab("upload");
}

function showPos() {
  activeModule = "pos";
  stopScanner();
  elements.homePanel.classList.remove("is-active");
  elements.storeCountChrome.forEach((item) => (item.hidden = true));
  Object.entries(elements.panels).forEach(([key, panel]) => {
    panel.classList.toggle("is-active", key === "pos");
  });
  updateScreenTitle("POS");
  renderPos();
}

function updateScreenTitle(title) {
  elements.screenTitle.textContent = title;
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const rows = parseCsv(text);
  const headers = rows.shift()?.map(normalizeHeader) || [];
  const skuIndex = headers.findIndex((header) => ["sku code", "sku", "code"].includes(header));
  const descIndex = headers.findIndex((header) => ["description", "desc", "item description"].includes(header));
  const qtyIndex = headers.findIndex((header) => ["qty", "quantity", "count", "stock"].includes(header));
  const barcodeIndex = headers.findIndex((header) => ["barcode", "bar code", "upc", "ean"].includes(header));
  const priceIndex = headers.findIndex((header) => ["price", "selling price", "retail price", "srp", "unit price"].includes(header));
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
      priceIndex !== -1 ? row[priceIndex] : ""
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

function upsertSku(code, description, qty = null, saved = null, barcode = "", price = "") {
  const cleanCode = String(code || "").trim();
  const cleanDescription = String(description || "").trim();
  const cleanBarcode = String(barcode || "").trim();
  const cleanPrice = sanitizeMoney(price);
  const shouldSetQty = qty !== null;
  const cleanQty = shouldSetQty ? sanitizeQty(qty) : 0;
  if (!cleanCode || !cleanDescription) return false;

  const existing = inventory.find((item) => item.code.toLowerCase() === cleanCode.toLowerCase());
  if (existing) {
    existing.description = cleanDescription;
    existing.barcode = cleanBarcode || existing.barcode || "";
    if (cleanPrice > 0) existing.price = cleanPrice;
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

function handlePosCrewLogin(event) {
  event.preventDefault();
  const username = elements.posCrewUsernameInput.value.trim();
  const password = elements.posCrewPasswordInput.value.trim();
  if (!username || !password) {
    alert("Enter crew username and password.");
    return;
  }

  posSession.crew = username;
  posSession.startedAt = new Date().toISOString();
  posSession.float = 0;
  posSession.active = false;
  posSession.cart = [];
  posSession.sales = posSession.sales || [];
  savePosSession();
  elements.posCrewLoginForm.reset();
  renderPos();
}

function handlePosFloat(event) {
  event.preventDefault();
  const floatAmount = sanitizeMoney(elements.posFloatInput.value);
  if (floatAmount <= 0 && !confirm("Opening float is zero. Continue?")) return;

  posSession.float = floatAmount;
  posSession.active = true;
  posSession.startedAt = posSession.startedAt || new Date().toISOString();
  savePosSession();
  elements.posFloatForm.reset();
  renderPos();
}

function renderPos() {
  const hasCrew = Boolean(posSession.crew);
  const hasActiveRegister = hasCrew && posSession.active;
  elements.posCrewCard.hidden = hasCrew;
  elements.posFloatCard.hidden = !hasCrew || hasActiveRegister;
  elements.posRegister.hidden = !hasActiveRegister;
  elements.posCrewLabel.textContent = hasCrew ? `Crew: ${posSession.crew}` : "Crew not signed in";
  elements.posStatusBadge.textContent = hasActiveRegister ? "Open" : "Closed";
  renderPosCart();
  renderPosSummary();
}

function renderPosSummary() {
  const cartTotal = getPosCartTotal();
  const salesTotal = getPosSalesTotal();
  elements.posFloatDisplay.textContent = formatMoney(posSession.float || 0);
  elements.posCartTotal.textContent = formatMoney(cartTotal);
  elements.posSalesTotal.textContent = formatMoney(salesTotal);
  elements.posCartCount.textContent = `${getPosCartQty().toLocaleString()} items`;
}

function renderPosCart() {
  elements.posCartRows.innerHTML = "";
  if (!posSession.cart.length) {
    elements.posCartRows.innerHTML = `<div class="empty-state"><strong>No items</strong><p>Scan or type an item barcode.</p></div>`;
    renderPosSummary();
    return;
  }

  const fragment = document.createDocumentFragment();
  posSession.cart.forEach((line) => {
    const row = document.createElement("div");
    row.className = "pos-cart-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(line.code)}</strong>
        <span>${escapeHtml(line.description)}</span>
        <small>${formatMoney(line.price)} each</small>
      </div>
      <label>
        <span>Qty</span>
        <input type="number" min="1" step="1" inputmode="numeric" value="${Number(line.qty || 1)}" data-pos-qty="${escapeHtml(line.code)}" />
      </label>
      <p>${formatMoney(Number(line.qty || 0) * Number(line.price || 0))}</p>
      <button class="secondary-button danger" type="button" data-pos-void="${escapeHtml(line.code)}">Void</button>
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
    } else if (found !== posScanner.lockedCode) {
      posScanner.lockedCode = found;
      posScanner.clearFrames = 0;
      handlePosBarcode(found, "camera");
    } else {
      posScanner.clearFrames = 0;
      elements.posScanStatus.textContent = "READ - MOVE ITEM";
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

  const cleanCode = normalizeBarcode(rawCode);
  if (!cleanCode) return;

  const item = inventory.find((sku) => normalizeBarcode(sku.barcode) === cleanCode || normalizeBarcode(sku.code) === cleanCode);
  if (!item) {
    elements.posScanStatus.textContent = source === "manual" ? `TYPED UNKNOWN ${cleanCode}` : `UNKNOWN ${cleanCode}`;
    triggerHaptic();
    playScanBeep(180, 180);
    return;
  }

  const price = ensurePosPrice(item);
  if (price === null) {
    elements.posScanStatus.textContent = "PRICE REQUIRED";
    return;
  }

  const existing = posSession.cart.find((line) => line.code === item.code);
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
  elements.posScanStatus.textContent = source === "manual" ? `TYPED ${item.code}` : `ADDED ${item.code}`;
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
  line.qty = Math.max(1, sanitizeQty(value));
  savePosSession();
  renderPosCart();
}

function voidPosLine(code) {
  if (!confirm("Void this item from the current transaction?")) return;
  posSession.cart = posSession.cart.filter((item) => item.code !== code);
  savePosSession();
  renderPosCart();
}

function clearPosCart() {
  if (!posSession.cart.length) return;
  if (!confirm("Void entire current transaction?")) return;
  posSession.cart = [];
  savePosSession();
  renderPosCart();
}

function completePosSale() {
  if (!posSession.cart.length) {
    alert("No items in transaction.");
    return;
  }

  const total = getPosCartTotal();
  const sale = {
    id: `${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`,
    crew: posSession.crew,
    createdAt: new Date().toISOString(),
    total,
    items: posSession.cart.map((line) => ({ ...line })),
  };
  posSession.sales.unshift(sale);
  posSession.cart = [];
  savePosSession();
  renderPos();
  alert(`Sale completed: ${formatMoney(total)}`);
}

function renderPosReading(type) {
  const salesTotal = getPosSalesTotal();
  const transactionCount = posSession.sales.length;
  const itemCount = posSession.sales.reduce((sum, sale) => sum + sale.items.reduce((lineSum, item) => lineSum + Number(item.qty || 0), 0), 0);
  elements.posReadingLabel.textContent = `${type} Reading`;
  elements.posReadingDetails.innerHTML = `
    <strong>${type} Reading</strong>
    <span>Crew: ${escapeHtml(posSession.crew || "Not set")}</span>
    <span>Started: ${escapeHtml(posSession.startedAt ? formatAuditDate(posSession.startedAt) : "Not set")}</span>
    <span>Float: ${formatMoney(posSession.float || 0)}</span>
    <span>Transactions: ${transactionCount.toLocaleString()} | Items: ${itemCount.toLocaleString()}</span>
    <span>Gross Sales: ${formatMoney(salesTotal)}</span>
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

function getPosCartTotal() {
  return posSession.cart.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.price || 0), 0);
}

function getPosCartQty() {
  return posSession.cart.reduce((sum, line) => sum + Number(line.qty || 0), 0);
}

function getPosSalesTotal() {
  return posSession.sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
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
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
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

function createEmptyPosSession() {
  return {
    crew: "",
    float: 0,
    active: false,
    startedAt: "",
    cart: [],
    sales: [],
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
