// ================= 1. CORE CONFIGURATION & i18n =================
let sessionUser = null;
let activeLang = "en";
let activeCurrency = "USD";

const systemAccountsBlueprint = {
    "101000 Cash and Liquidity Banks": 0,
    "121000 Accounts Receivable (A/R)": 0,
    "211000 Accounts Payable (A/P)": 0,
    "220000 Collected VAT Payables": 0,
    "400000 Corporate Sales Product Revenue": 0,
    "600000 Operating Costs & Supplier Expenses": 0,
    "300000 Retained Capital Business Equity": 0
};

const currencySpecs = {
    USD: { symbol: "$", rate: 1.0, locale: "en-US" },
    BDT: { symbol: "৳", rate: 118.5, locale: "bn-BD" }
};

const i18nDictionary = {
    en: {
        app_title: "Frontier Enterprise", btn_logout: "Sign Out",
        tab_dashboard: "Dashboard", tab_contacts: "Contacts", tab_sales: "Sales (A/R)", 
        tab_purchases: "Purchases (A/P)", tab_accounting: "Journal & Ledger", tab_reports: "Reports",
        cash_balance: "Liquid Cash", ar_balance: "Accounts Receivable", ap_balance: "Accounts Payable", net_revenue: "Net Revenue",
        quick_ops: "Quick Operations", audit_logs: "Live Audit Logs",
        btn_add_contact: "➕ Add New Contact", btn_add_invoice: "🧾 Issue Sales Invoice", btn_add_bill: "🛒 Record Vendor Bill", btn_add_journal: "⚖️ Post Manual Journal",
        contacts_title: "👥 Master Contacts Directory", invoices_title: "🧾 Customer Invoices (A/R)", bills_title: "🛒 Vendor Bills (A/P)", journal_title: "⚖️ Double-Entry Journal Postings", pl_title: "📈 Profit & Loss Statement", bs_title: "🏛️ Balance Sheet Report",
        th_partner_ref: "Ref", th_contact_name: "Name", th_role: "Role", th_action: "Action",
        th_invoice_id: "ID", th_bill_id: "ID", th_client: "Client", th_vendor: "Vendor", th_amount: "Amount", th_posting_ref: "Ref", th_account_head: "Account", th_debit: "Debit (Dr)", th_credit: "Credit (Cr)",
        pl_op_revenue: "Operating Revenue (+)", pl_op_costs: "Operating Costs (-)", pl_net_surplus: "Net Operating Surplus",
        bs_assets_header: "Total Assets", bs_cash: "Cash & Banks", bs_ar: "Accounts Receivables", bs_sum_assets: "Sum Total Assets",
        bs_liabilities_header: "Liabilities & Equity", bs_ap: "Accounts Payables", bs_equity: "Retained Equity", bs_sum_liabilities: "Total Liab & Equity",
        status_paid: "Cleared", status_open: "Open", action_pay: "Pay", action_receive: "Receive"
    },
    bn: {
        app_title: "ফ্রন্টিয়ার এন্টারপ্রাইজ", btn_logout: "লগআউট",
        tab_dashboard: "ড্যাশবোর্ড", tab_contacts: "পরিচিতি", tab_sales: "বিক্রয় (A/R)", 
        tab_purchases: "ক্রয় (A/P)", tab_accounting: "জাবেদা ও খতিয়ান", tab_reports: "প্রতিবেদন",
        cash_balance: "নগদ স্থিতি", ar_balance: "প্রাপ্য হিসাব", ap_balance: "প্রদেয় হিসাব", net_revenue: "নিট আয়",
        quick_ops: "কুইক অপারেশনস", audit_logs: "অডিট লগ",
        btn_add_contact: "➕ নতুন পরিচিতি", btn_add_invoice: "🧾 ইনভয়েস তৈরি", btn_add_bill: "🛒 ভেন্ডর বিল", btn_add_journal: "⚖️ ম্যানুয়াল জাবেদা",
        contacts_title: "👥 পরিচিতি ডিরেক্টরি", invoices_title: "🧾 গ্রাহক ইনভয়েস", bills_title: "🛒 ভেন্ডর বিল", journal_title: "⚖️ দ্বৈত-সত্তা জাবেদা", pl_title: "📈 লাভ-ক্ষতি বিবরণী", bs_title: "🏛️ উদ্বৃত্তপত্র",
        th_partner_ref: "রেফ", th_contact_name: "নাম", th_role: "ভূমিকা", th_action: "অ্যাকশন",
        th_invoice_id: "আইডি", th_bill_id: "আইডি", th_client: "গ্রাহক", th_vendor: "সরবরাহকারী", th_amount: "পরিমাণ", th_posting_ref: "রেফ", th_account_head: "অ্যাকাউন্ট", th_debit: "ডেবিট (Dr)", th_credit: "ক্রেডিট (Cr)",
        pl_op_revenue: "পরিচালন আয় (+)", pl_op_costs: "পরিচালন ব্যয় (-)", pl_net_surplus: "নিট পরিচালন উদ্বৃত্ত",
        bs_assets_header: "মোট সম্পদ", bs_cash: "নগদ ও ব্যাংক", bs_ar: "প্রাপ্য হিসাব", bs_sum_assets: "মোট সম্পদ",
        bs_liabilities_header: "দায় ও ইক্যুইটি", bs_ap: "প্রদেয় হিসাব", bs_equity: "সংরক্ষিত ইক্যুইটি", bs_sum_liabilities: "মোট দায় ও ইক্যুইটি",
        status_paid: "পরিশোধিত", status_open: "বাকি", action_pay: "পরিশোধ", action_receive: "জমা নিন"
    }
};

// ================= 2. SECURITY & UTILS =================
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
}

async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function currencyFormat(val) {
    const config = currencySpecs[activeCurrency];
    const converted = val * config.rate;
    return new Intl.NumberFormat(config.locale, { style: "currency", currency: activeCurrency, currencyDisplay: "symbol" }).format(converted);
}

// ================= 3. DATABASE (IndexedDB) =================
const DB_NAME = 'FrontierERP_DB';
let dbInstance;

function initDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if(!db.objectStoreNames.contains('tenants')) db.createObjectStore('tenants', { keyPath: 'username' });
        };
        req.onsuccess = e => { dbInstance = e.target.result; resolve(dbInstance); };
        req.onerror = e => reject(e.target.error);
    });
}

function getUser(username) {
    return new Promise(resolve => {
        const tx = dbInstance.transaction('tenants', 'readonly');
        const req = tx.objectStore('tenants').get(username.toLowerCase());
        req.onsuccess = () => resolve(req.result);
    });
}

function saveUser(userData) {
    return new Promise(resolve => {
        const tx = dbInstance.transaction('tenants', 'readwrite');
        userData.username = userData.username.toLowerCase();
        const req = tx.objectStore('tenants').put(userData);
        req.onsuccess = () => resolve();
    });
}

async function saveCurrentUserState() {
    if(sessionUser) await saveUser(sessionUser);
}

// ================= 4. AUTHENTICATION =================
function switchAuthView(id) {
    document.querySelectorAll('.auth-view').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function handleSignup(e) {
    e.preventDefault();
    const user = document.getElementById('reg-name').value.trim();
    const existing = await getUser(user);
    
    if(existing) { alert("Username exists!"); return; }
    const hashedPassword = await hashPassword(document.getElementById('reg-pass').value);
    
    sessionUser = {
        username: user, instName: document.getElementById('reg-inst-name').value.trim(), passwordHash: hashedPassword,
        erpState: { partners: [], transactions: [], journalLines: [], audit: [] }
    };
    await saveUser(sessionUser); bootDashboard();
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.disabled = true; btn.innerText = "Verifying...";
    
    const u = document.getElementById('login-name').value;
    const p = document.getElementById('login-pass').value;
    const user = await getUser(u);
    
    if(user) {
        const hashedAttempt = await hashPassword(p);
        if(user.passwordHash === hashedAttempt || user.password === p) { 
            // Fallback provided above temporarily in case old DB schema exists
            if(user.password) { user.passwordHash = hashedAttempt; delete user.password; await saveUser(user); }
            sessionUser = user; bootDashboard(); 
        } else { alert("Invalid credentials."); }
    } else { alert("Invalid credentials."); }
    
    btn.disabled = false; btn.innerText = "Secure Login";
}

function logout() {
    sessionUser = null;
    document.getElementById('app-dashboard').classList.add('hidden');
    document.getElementById('auth-gateway').classList.remove('hidden');
    switchAuthView('view-login');
    window.history.replaceState({}, document.title, window.location.pathname);
}

function bootDashboard() {
    document.getElementById('auth-gateway').classList.add('hidden');
    document.getElementById('app-dashboard').classList.remove('hidden');
    document.getElementById('ui-user-name').innerText = escapeHTML(sessionUser.username);
    document.getElementById('ui-inst-name').innerText = escapeHTML(sessionUser.instName);
    
    const accountsKeys = Object.keys(systemAccountsBlueprint);
    const coaOptionsHTML = accountsKeys.map(k => `<option value="${k}">${k}</option>`).join('');
    document.getElementById('journalDebitSelect').innerHTML = coaOptionsHTML;
    document.getElementById('journalCreditSelect').innerHTML = coaOptionsHTML;
    
    switchTab('dashboard');
    applyLanguageTranslations();
    recomputeAndRender();
    handleManifestShortcuts();
}

function handleManifestShortcuts() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'invoice') openInvoiceModal('customer');
    if (action === 'journal') openModal('journalModal');
}

// ================= 5. BACKUP & RESTORE =================
function exportBackup() {
    const dataStr = JSON.stringify(sessionUser);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Frontier_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
}

async function importBackup(e) {
    const file = e.target.files[0];
    if(!file) return;
    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if(parsed.username && parsed.erpState) {
            sessionUser = parsed;
            await saveCurrentUserState();
            recomputeAndRender();
            alert("Database restored successfully!");
        } else throw new Error("Invalid structure");
    } catch(err) {
        alert("Failed to parse backup file. Please ensure it is a valid JSON export.");
    }
}

// ================= 6. UI & ERP CONTROLLERS =================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('border-blue-600', 'text-blue-600', 'font-bold'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('border-blue-600', 'text-blue-600', 'font-bold');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function toggleDark() { document.documentElement.classList.toggle('dark'); }
function changeLanguage(langCode) { activeLang = langCode; document.body.classList.toggle('rtl-layout', langCode === 'ar'); applyLanguageTranslations(); recomputeAndRender(); }
function changeCurrency(currCode) { activeCurrency = currCode; recomputeAndRender(); }

function applyLanguageTranslations() {
    const strings = i18nDictionary[activeLang] || i18nDictionary['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (strings[key]) el.textContent = strings[key];
    });
}

async function pushAudit(text) {
    sessionUser.erpState.audit.unshift({ time: new Date().toLocaleTimeString(), text });
    await saveCurrentUserState();
}

async function submitPartner(e) {
    e.preventDefault();
    const name = document.getElementById('partnerNameInput').value.trim();
    const type = document.getElementById('partnerTypeInput').value;
    sessionUser.erpState.partners.push({ id: (type === 'customer' ? 'CUST-' : 'VEND-') + Date.now().toString().slice(-4), name, type });
    await pushAudit(`Partner Added: ${name}`);
    closeModal('partnerModal'); recomputeAndRender();
}

function openInvoiceModal(type) {
    const partners = sessionUser.erpState.partners.filter(p => p.type === type);
    if(!partners.length) return alert("Please create a partner for this role first.");
    document.getElementById('invoiceFlowType').value = type;
    document.getElementById('invoicePartnerSelect').innerHTML = partners.map(p => `<option value="${escapeHTML(p.name)}">${escapeHTML(p.name)}</option>`).join('');
    document.getElementById('invoiceModalTitle').innerText = type === 'customer' ? 'Issue Customer Invoice' : 'Record Vendor Bill';
    openModal('invoiceModal');
}

async function submitInvoice(e) {
    e.preventDefault();
    const type = document.getElementById('invoiceFlowType').value;
    const partner = document.getElementById('invoicePartnerSelect').value;
    const item = document.getElementById('invoiceItemInput').value.trim();
    const basePrice = parseFloat(document.getElementById('invoicePriceInput').value);
    const qty = parseInt(document.getElementById('invoiceQtyInput').value);
    const subtotal = basePrice * qty; const vat = subtotal * 0.15; const total = subtotal + vat;
    const docId = (type === 'customer' ? 'INV-' : 'BILL-') + Date.now().toString().slice(-5);
    
    sessionUser.erpState.transactions.unshift({ id: docId, type, partner, item: `${item} (x${qty})`, amount: total, subtotal, vat, status: 'Open' });
    postDocumentToLedger(docId, type, subtotal, vat, total);
    await pushAudit(`Drafted & Posted ${docId}`);
    closeModal('invoiceModal'); recomputeAndRender();
}

function postDocumentToLedger(docId, type, subtotal, vat, total) {
    const d = new Date().toLocaleDateString();
    const lines = sessionUser.erpState.journalLines;
    if(type === 'customer') {
        lines.push({ date: d, ref: docId, account: "121000 Accounts Receivable (A/R)", debit: total, credit: 0 });
        lines.push({ date: d, ref: docId, account: "400000 Corporate Sales Product Revenue", debit: 0, credit: subtotal });
        lines.push({ date: d, ref: docId, account: "220000 Collected VAT Payables", debit: 0, credit: vat });
    } else {
        lines.push({ date: d, ref: docId, account: "600000 Operating Costs & Supplier Expenses", debit: subtotal, credit: 0 });
        lines.push({ date: d, ref: docId, account: "220000 Collected VAT Payables", debit: vat, credit: 0 });
        lines.push({ date: d, ref: docId, account: "211000 Accounts Payable (A/P)", debit: 0, credit: total });
    }
}

async function settlePaymentGateway(docId) {
    const doc = sessionUser.erpState.transactions.find(t => t.id === docId);
    if(!doc || doc.status === 'Cleared') return;
    doc.status = 'Cleared';
    const d = new Date().toLocaleDateString();
    const lines = sessionUser.erpState.journalLines;
    if(doc.type === 'customer') {
        lines.push({ date: d, ref: `PAY-${docId}`, account: "101000 Cash and Liquidity Banks", debit: doc.amount, credit: 0 });
        lines.push({ date: d, ref: `PAY-${docId}`, account: "121000 Accounts Receivable (A/R)", debit: 0, credit: doc.amount });
    } else {
        lines.push({ date: d, ref: `PAY-${docId}`, account: "211000 Accounts Payable (A/P)", debit: doc.amount, credit: 0 });
        lines.push({ date: d, ref: `PAY-${docId}`, account: "101000 Cash and Liquidity Banks", debit: 0, credit: doc.amount });
    }
    await pushAudit(`Payment cleared: ${docId}`);
    recomputeAndRender();
}

async function submitManualJournal(e) {
    e.preventDefault();
    const ref = "MAN-" + document.getElementById('journalRefInput').value.trim();
    const drAcc = document.getElementById('journalDebitSelect').value;
    const crAcc = document.getElementById('journalCreditSelect').value;
    const amt = parseFloat(document.getElementById('journalAmountInput').value);
    if(drAcc === crAcc) return alert("Accounts must differ.");
    const d = new Date().toLocaleDateString();
    sessionUser.erpState.journalLines.push({ date: d, ref, account: drAcc, debit: amt, credit: 0 });
    sessionUser.erpState.journalLines.push({ date: d, ref, account: crAcc, debit: 0, credit: amt });
    await pushAudit(`Manual JRN: ${ref}`);
    closeModal('journalModal'); recomputeAndRender();
}

async function recomputeAndRender() {
    await saveCurrentUserState();
    const state = sessionUser.erpState;
    const strings = i18nDictionary[activeLang] || i18nDictionary['en'];
    
    let balances = structuredClone(systemAccountsBlueprint);
    state.journalLines.forEach(ln => {
        if(balances[ln.account] !== undefined) {
            if (ln.account.startsWith("101000") || ln.account.startsWith("121000") || ln.account.startsWith("600000")) {
                balances[ln.account] += (ln.debit - ln.credit);
            } else { balances[ln.account] += (ln.credit - ln.debit); }
        }
    });

    document.getElementById('statCash').innerText = document.getElementById('bsCash').innerText = currencyFormat(balances["101000 Cash and Liquidity Banks"]);
    document.getElementById('statAR').innerText = document.getElementById('bsAR').innerText = currencyFormat(balances["121000 Accounts Receivable (A/R)"]);
    document.getElementById('statAP').innerText = document.getElementById('bsAP').innerText = currencyFormat(balances["211000 Accounts Payable (A/P)"]);
    
    const revVal = balances["400000 Corporate Sales Product Revenue"];
    const expVal = balances["600000 Operating Costs & Supplier Expenses"];
    document.getElementById('statRevenue').innerText = document.getElementById('plRevenue').innerText = currencyFormat(revVal);
    document.getElementById('plExpense').innerText = currencyFormat(expVal);
    document.getElementById('plNetProfit').innerText = currencyFormat(revVal - expVal);

    document.getElementById('bsTotalAssets').innerText = currencyFormat(balances["101000 Cash and Liquidity Banks"] + balances["121000 Accounts Receivable (A/R)"]);
    document.getElementById('bsVAT').innerText = currencyFormat(balances["220000 Collected VAT Payables"]);
    const equity = balances["300000 Retained Capital Business Equity"] + (revVal - expVal);
    document.getElementById('bsEquity').innerText = currencyFormat(equity);
    document.getElementById('bsTotalLiabilities').innerText = currencyFormat(balances["211000 Accounts Payable (A/P)"] + balances["220000 Collected VAT Payables"] + equity);

    document.getElementById('dashboardAuditLogs').innerHTML = state.audit.map(a => `<div class="p-1 border-b border-slate-100 dark:border-slate-800">[${a.time}] ${escapeHTML(a.text)}</div>`).join("");
    
    document.getElementById('partnersTableBody').innerHTML = state.partners.map(p => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20"><td class="p-3 font-bold">${escapeHTML(p.id)}</td><td class="p-3">${escapeHTML(p.name)}</td><td class="p-3 uppercase text-[10px] font-bold">${escapeHTML(p.type)}</td><td class="p-3 text-right">-</td></tr>`).join('');

    document.getElementById('salesTableBody').innerHTML = state.transactions.filter(t => t.type === 'customer').map(s => {
        const paid = s.status === 'Cleared';
        return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20 text-xs">
            <td class="p-3 font-bold">${escapeHTML(s.id)}</td><td class="p-3">${escapeHTML(s.partner)}</td><td class="p-3">${escapeHTML(s.item)}</td><td class="p-3 font-bold">${currencyFormat(s.amount)}</td>
            <td class="p-3">${paid ? strings.status_paid : strings.status_open}</td>
            <td class="p-3 text-right">${!paid ? `<button onclick="settlePaymentGateway('${s.id}')" class="bg-blue-600 text-white px-2 py-1 rounded">${strings.action_receive}</button>` : `✓`}</td>
        </tr>`;
    }).join('');

    document.getElementById('purchaseTableBody').innerHTML = state.transactions.filter(t => t.type === 'vendor').map(b => {
        const paid = b.status === 'Cleared';
        return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20 text-xs">
            <td class="p-3 font-bold">${escapeHTML(b.id)}</td><td class="p-3">${escapeHTML(b.partner)}</td><td class="p-3">${escapeHTML(b.item)}</td><td class="p-3 font-bold">${currencyFormat(b.amount)}</td>
            <td class="p-3">${paid ? strings.status_paid : strings.status_open}</td>
            <td class="p-3 text-right">${!paid ? `<button onclick="settlePaymentGateway('${b.id}')" class="bg-slate-700 text-white px-2 py-1 rounded">${strings.action_pay}</button>` : `✓`}</td>
        </tr>`;
    }).join('');

    document.getElementById('journalLedgerTableBody').innerHTML = state.journalLines.slice().reverse().map(j => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20"><td class="p-3"><b>${escapeHTML(j.ref)}</b></td><td class="p-3 text-[10px]">${escapeHTML(j.account)}</td><td class="p-3 text-emerald-600">${j.debit>0?currencyFormat(j.debit):'-'}</td><td class="p-3 text-rose-500">${j.credit>0?currencyFormat(j.credit):'-'}</td></tr>`).join('');

    document.getElementById('chartOfAccountsContainer').innerHTML = Object.keys(balances).map(key => `
        <div class="py-2 flex justify-between"><span>${key}</span><span class="font-bold ${balances[key]<0?'text-rose-500':''}">${currencyFormat(balances[key])}</span></div>`).join('');
}

function exportPDF(type) {
    const records = sessionUser.erpState.transactions.filter(t => t.type === type);
    if (records.length === 0) return;
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    doc.setFontSize(14); doc.text(`${sessionUser.instName} - ${type === 'customer' ? 'Sales Invoices' : 'Vendor Bills'}`, 14, 20);
    doc.autoTable({
        head: [["ID", "Partner", "Desc", "Amount", "Status"]],
        body: records.map(r => [r.id, r.partner, r.item, r.amount.toFixed(2), r.status]),
        startY: 30, theme: 'grid', headStyles: { fillColor: type === 'customer' ? [37, 99, 235] : [5, 150, 105] }
    });
    doc.save(`Ledger_Export_${Date.now()}.pdf`);
}

// ================= 7. INITIALIZATION =================
window.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
            reg.onupdatefound = () => {
                const newWorker = reg.installing;
                newWorker.onstatechange = () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        document.getElementById('pwa-update-banner').classList.remove('hidden');
                    }
                };
            };
        });
    }
});
