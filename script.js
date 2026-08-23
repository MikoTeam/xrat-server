// ============================================================
// USER SCRIPT - MikoCuan
// ============================================================

let currentProduct = null;
let currentUser = null;
let userDocRef = null;
let isSaving = false;
let homeAdClaimed = false;

// ============================================================
// DOM REFS
// ============================================================
const headerCoinEl = document.getElementById('headerCoinCount');
const profileCoinEl = document.getElementById('profileCoinCount');
const profileStreakEl = document.getElementById('profileStreak');
const profileLevelEl = document.getElementById('profileLevel');
const profileNameEl = document.getElementById('profileName');
const profileEmailEl = document.getElementById('profileEmail');
const streakCountEl = document.getElementById('streakCount');
const dailyClaimBtn = document.getElementById('dailyClaimBtn');
const dailyBonusAmount = document.getElementById('dailyBonusAmount');
const dailyCountdown = document.getElementById('dailyCountdown');
const wdBtn = document.getElementById('wdBtn');
const wdAmountInput = document.getElementById('wdAmount');
const wdMethod = document.getElementById('wdMethod');
const wdAccountName = document.getElementById('wdAccountName');
const wdAccountNumber = document.getElementById('wdAccountNumber');
const wdMessage = document.getElementById('wdMessage');
const wdMessageText = document.getElementById('wdMessageText');
const wdQuotaEl = document.getElementById('wdQuota');
const toast = document.getElementById('toast');
const particleContainer = document.getElementById('particleContainer');
const storeGrid = document.getElementById('storeGrid');
const appLogoGrid = document.getElementById('appLogoGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalVoucher = document.getElementById('modalVoucher');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalManualBtn = document.getElementById('modalManualBtn');
const loginModal = document.getElementById('loginModal');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const loginMessage = document.getElementById('loginMessage');
const loginTitle = document.getElementById('loginTitle');
const loginDesc = document.getElementById('loginDesc');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerBtn = document.getElementById('registerBtn');

// ============================================================
// STATISTIK DOM REFS
// ============================================================
const statDate = document.getElementById('statDate');
const statTime = document.getElementById('statTime');
const statTodayFarming = document.getElementById('statTodayFarming');
const statTotalFarming = document.getElementById('statTotalFarming');
const statMemberSince = document.getElementById('statMemberSince');

// ============================================================
// POPUP SYARAT
// ============================================================
const termsOverlay = document.getElementById('termsOverlay');
const termsAgreeBtn = document.getElementById('termsAgreeBtn');
const termsDeclineBtn = document.getElementById('termsDeclineBtn');

// Cek localStorage
if (localStorage.getItem('termsAccepted') === 'true') {
    if (termsOverlay) termsOverlay.classList.add('hidden');
}

// SETUJU & MASUK
if (termsAgreeBtn) {
    termsAgreeBtn.addEventListener('click', function() {
        if (termsOverlay) termsOverlay.classList.add('hidden');
        localStorage.setItem('termsAccepted', 'true');
        if (loginModal) loginModal.classList.add('show');
        showToast('✅ Syarat disetujui! Silakan login.', 2000);
    });
}

// TOLAK
if (termsDeclineBtn) {
    termsDeclineBtn.addEventListener('click', function() {
        if (termsOverlay) termsOverlay.classList.add('hidden');
        showToast('❌ Anda menolak syarat. Tidak bisa melanjutkan.', 2000);
        setTimeout(() => {
            if (termsOverlay) termsOverlay.classList.remove('hidden');
        }, 3000);
    });
}

// ============================================================
// DETEKSI KLIK IKLAN DI BERANDA → BUKA TAB + +1 COIN
// ============================================================
const invisibleDetector = document.getElementById('invisibleAdDetector');

if (invisibleDetector) {
    invisibleDetector.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        // Cek login
        if (!currentUser) {
            showToast('❌ Silakan login terlebih dahulu!', 2000);
            return;
        }
        
        // Cegah spam klik (1x per load)
        if (homeAdClaimed) {
            showToast('⏳ Kamu sudah dapat coin dari iklan ini!', 2000);
            return;
        }
        
        // ============================================
        // 1. BUKA TAB BARU (LINK IKLAN A-ADS)
        // ============================================
        const adLink = 'https://a-ads.com/popunder/2453009';
        window.open(adLink, '_blank');
        
        // ============================================
        // 2. TAMBAH +1 COIN
        // ============================================
        DB.user.coinBalance += 1;
        updateCoinUI();
        addHistory('Klik Iklan Beranda', 1, 'plus');
        showToast('✨ +1 Coin dari iklan beranda!', 2000);
        
        // Tandai sudah diklaim
        homeAdClaimed = true;
        
        // ============================================
        // 3. EFEK PARTIKEL
        // ============================================
        const rect = this.getBoundingClientRect();
        spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 20);
        
        // Detektor tetap ada tapi tidak bisa diklik lagi
        this.style.pointerEvents = 'none';
        this.style.opacity = '0';
    });
}

// ============================================================
// RENDER APP LOGOS
// ============================================================
function renderAppLogos() {
    const logos = DB.appLogos || [];
    appLogoGrid.innerHTML = logos.map(l => `
        <div class="app-logo-item" style="border-color: #2a3a50;">
            <span class="logo-name">${l.name}</span>
        </div>
    `).join('');
}

// ============================================================
// UPDATE STATISTIK
// ============================================================
function updateStats() {
    const now = new Date();
    
    const dateStr = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    if (statDate) statDate.textContent = dateStr;
    if (statTime) statTime.textContent = timeStr;
    
    const user = DB.user;
    const today = new Date().toDateString();
    let todayCount = 0;
    let totalFarming = 0;
    
    if (user.history) {
        user.history.forEach(h => {
            if (h.text === 'Farming') {
                totalFarming += h.amount || 1;
                const hDate = new Date(h.date);
                if (hDate.toDateString() === today) {
                    todayCount += h.amount || 1;
                }
            }
        });
    }
    
    if (statTodayFarming) statTodayFarming.textContent = todayCount;
    if (statTotalFarming) statTotalFarming.textContent = totalFarming;
    
    if (statMemberSince) {
        let memberDate = null;
        if (user.createdAt) {
            if (typeof user.createdAt === 'string') {
                memberDate = new Date(user.createdAt);
            } else if (typeof user.createdAt === 'number') {
                memberDate = new Date(user.createdAt);
            } else if (user.createdAt && typeof user.createdAt === 'object' && user.createdAt.seconds) {
                memberDate = new Date(user.createdAt.seconds * 1000);
            } else if (user.createdAt instanceof Date) {
                memberDate = user.createdAt;
            }
        }
        if (!memberDate || isNaN(memberDate.getTime())) {
            if (currentUser && currentUser.metadata && currentUser.metadata.creationTime) {
                memberDate = new Date(currentUser.metadata.creationTime);
            }
        }
        if (!memberDate || isNaN(memberDate.getTime())) {
            memberDate = new Date();
        }
        statMemberSince.textContent = memberDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// ============================================================
// UPDATE UI
// ============================================================
function updateCoinUI() {
    const user = DB.user;
    const coin = user.coinBalance || 0;
    const streak = user.streak || 0;
    const name = user.name || 'Belum Login';
    const email = user.email || '—';
    
    headerCoinEl.textContent = coin;
    profileCoinEl.textContent = coin;
    profileStreakEl.textContent = streak;
    streakCountEl.textContent = streak;
    profileLevelEl.textContent = Math.floor(coin / 100) + 1;
    profileNameEl.textContent = name;
    profileEmailEl.textContent = email;
    
    updateWdQuota();
    renderStore();
    updateStats();
    
    if (currentUser) {
        saveUserData();
    }
}

function updateWdQuota() {
    const remain = DB.settings.wdQuota - DB.settings.wdQuotaUsed;
    wdQuotaEl.textContent = remain > 0 ? remain : '0 (habis)';
}

function updateHistory() {
    const list = document.getElementById('historyList');
    const history = DB.user.history || [];
    if (history.length === 0) {
        list.innerHTML = `<div class="history-item" style="color:#5a6a84; text-align:center; padding:12px 0;">Belum ada aktivitas</div>`;
        return;
    }
    list.innerHTML = history.slice(-10).reverse().map(h => `
        <div class="history-item">
            <span>${h.text}</span>
            <span class="h-amount ${h.type === 'plus' ? 'plus' : 'minus'}">${h.type === 'plus' ? '+' : '-'}${h.amount}</span>
            <span class="h-time">${h.time}</span>
        </div>
    `).join('');
}

// ============================================================
// LOAD PRODUK DARI FIRESTORE
// ============================================================
async function loadProductsFromFirebase() {
    try {
        const snapshot = await db.collection('products').get();
        if (snapshot.empty) {
            renderStore();
            return;
        }
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        DB.products = products;
        renderStore();
    } catch (error) {
        console.error('Error loading products:', error);
        renderStore();
    }
}

// ============================================================
// RENDER STORE
// ============================================================
function renderStore() {
    const products = DB.products || [];
    
    storeGrid.innerHTML = products.map(p => {
        const isOutOfStock = p.stock <= 0;
        let badge = '';
        if (isOutOfStock) badge = `<span class="badge-habis">Habis</span>`;
        else if (p.popular) badge = `<span class="badge-populer">🔥 Populer</span>`;
        
        const isImageUrl = p.icon && (p.icon.startsWith('http') || p.icon.startsWith('data:'));
        const iconHtml = isImageUrl 
            ? `<img src="${p.icon}" alt="${p.name}" class="product-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">`
            : `<span class="icon-emoji">${p.icon}</span>`;
        
        return `
            <div class="store-item ${isOutOfStock ? 'locked' : ''}" 
                 data-id="${p.id}" 
                 data-price="${p.price}" 
                 data-name="${p.name}" 
                 data-icon="${p.icon}"
                 data-stock="${p.stock}">
                ${badge}
                <div class="icon-wrapper">
                    ${iconHtml}
                    ${isImageUrl ? `<span class="icon-emoji" style="display:none;">📦</span>` : ''}
                </div>
                <div class="name">${p.name}</div>
                <div class="price"><i class="fas fa-coins"></i> ${p.price}</div>
                <div class="stock">${isOutOfStock ? 'Stok 0' : `Stok ${p.stock}`}</div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.store-item:not(.locked)').forEach(el => {
        el.addEventListener('click', function() {
            const id = this.dataset.id;
            const price = parseInt(this.dataset.price);
            const name = this.dataset.name;
            const icon = this.dataset.icon;
            const stock = parseInt(this.dataset.stock);
            buyProduct(id, price, name, icon, stock);
        });
    });
}

// ============================================================
// BUY PRODUCT
// ============================================================
function buyProduct(id, price, name, icon, stock) {
    const user = DB.user;
    const product = DB.products.find(p => p.id === id);
    
    if (user.coinBalance < price) {
        showToast(`❌ Coin tidak cukup! Butuh ${price} Coin.`, 2000);
        return;
    }
    if (!product || product.stock <= 0) {
        showToast('❌ Stok produk ini habis!', 2000);
        return;
    }
    
    currentProduct = { id, name, icon, price };
    
    user.coinBalance -= price;
    product.stock -= 1;
    
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (!user.purchaseHistory) user.purchaseHistory = [];
    user.purchaseHistory.push({
        product: name,
        price: price,
        time: time,
        date: now.toLocaleDateString('id-ID')
    });
    
    const voucher = generateVoucher();
    addHistory(`Beli ${name}`, price, 'minus');
    
    const modalIconHtml = icon && (icon.startsWith('http') || icon.startsWith('data:'))
        ? `<img src="${icon}" alt="${name}" style="width:48px; height:48px; object-fit:contain; border-radius:12px;">`
        : icon;
    modalIcon.innerHTML = modalIconHtml;
    modalTitle.textContent = `🎉 ${name} Berhasil!`;
    modalDesc.textContent = `Kamu berhasil menukar ${name} dengan ${price} Coin.`;
    modalVoucher.textContent = voucher;
    modalOverlay.classList.add('show');
    
    updateCoinUI();
    showToast(`✅ ${name} berhasil dibeli!`, 2000);
    spawnParticles(window.innerWidth/2, window.innerHeight/2, 40);
}

function generateVoucher() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// ============================================================
// MANUAL CLAIM VIA WHATSAPP
// ============================================================
modalManualBtn.addEventListener('click', function() {
    const user = DB.user;
    const product = currentProduct;
    
    if (!product) {
        showToast('❌ Tidak ada produk yang dipilih.', 2000);
        return;
    }
    
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const adminNumber = DB.adminWhatsApp;
    const userId = currentUser ? currentUser.uid : 'Belum login';
    const message = encodeURIComponent(
        `Hallo! Min saya ${user.name} ingin klaim akun secara manual\n\n` +
        `Id: ${userId}\n` +
        `Nama: ${user.name}\n` +
        `Produk: ${product.name}\n\n` +
        `> ${tanggal}\n\n` +
        `Mohon bantuannya untuk proses akunnya. Terima kasih!`
    );
    
    const waUrl = `https://wa.me/${adminNumber}?text=${message}`;
    window.open(waUrl, '_blank');
    
    modalOverlay.classList.remove('show');
    showToast('📤 Pesan terkirim ke Admin!', 2000);
});

// ============================================================
// TOAST
// ============================================================
function showToast(msg, duration = 1800) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// PARTICLES
// ============================================================
function spawnParticles(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'particle';
        const size = 6 + Math.random() * 10;
        const tx = (Math.random() - 0.5) * 200;
        const ty = (Math.random() - 0.5) * 200 - 50;
        const colors = ['#fbbf24', '#a855f7', '#34d399', '#6366f1'];
        el.style.cssText = `
            width:${size}px; height:${size}px; 
            left:${x}px; top:${y}px; 
            --tx:${tx}px; --ty:${ty}px; 
            background:${colors[Math.floor(Math.random() * colors.length)]};
        `;
        particleContainer.appendChild(el);
        setTimeout(() => el.remove(), 1200);
    }
}

// ============================================================
// DAILY BONUS (MAX 20)
// ============================================================
function checkDailyBonus() {
    const user = DB.user;
    const now = Date.now();
    const diff = now - user.lastDailyClaim;
    const oneDay = 86400000;
    
    if (diff >= oneDay) {
        dailyClaimBtn.disabled = false;
        dailyCountdown.textContent = ' (siap claim!)';
    } else {
        dailyClaimBtn.disabled = true;
        const remaining = Math.ceil((oneDay - diff) / 3600000);
        dailyCountdown.textContent = ` (${remaining} jam lagi)`;
    }
    const bonus = Math.min(5 + user.streak * 2, DB.settings.maxDailyBonus || 20);
    dailyBonusAmount.textContent = `+${bonus} Coin`;
}

dailyClaimBtn.addEventListener('click', function() {
    const user = DB.user;
    const bonus = Math.min(5 + user.streak * 2, DB.settings.maxDailyBonus || 20);
    user.coinBalance += bonus;
    user.streak += 1;
    user.lastDailyClaim = Date.now();
    updateCoinUI();
    checkDailyBonus();
    addHistory('Daily Bonus', bonus, 'plus');
    showToast(`🎁 Bonus ${bonus} Coin! Streak: ${user.streak} hari`);
    spawnParticles(window.innerWidth/2, window.innerHeight/2, 30);
});

// ============================================================
// AJUKAN WD
// ============================================================
wdBtn.addEventListener('click', async function() {
    const user = DB.user;
    const settings = DB.settings;
    const amount = parseInt(wdAmountInput.value);
    const method = wdMethod.value;
    const accountName = wdAccountName.value.trim();
    const accountNumber = wdAccountNumber.value.trim();
    
    if (!currentUser) {
        showToast('❌ Silakan login terlebih dahulu!', 2000);
        return;
    }
    
    if (!amount || amount < settings.minWd) {
        wdMessageText.textContent = `❌ Minimal WD ${settings.minWd} Coin.`;
        wdMessage.style.borderLeftColor = '#ef4444';
        wdMessage.classList.add('show');
        return;
    }
    
    const fee = Math.floor(amount * settings.wdFee);
    const net = amount - fee;
    const rupiah = Math.floor((net / settings.rateCoin) * settings.rateRupiah);
    
    if (amount > user.coinBalance) {
        wdMessageText.textContent = `❌ Coin tidak cukup! Kamu punya ${user.coinBalance} Coin.`;
        wdMessage.style.borderLeftColor = '#ef4444';
        wdMessage.classList.add('show');
        return;
    }
    
    if (!accountName || !accountNumber) {
        wdMessageText.textContent = '❌ Isi nama dan nomor rekening/HP tujuan.';
        wdMessage.style.borderLeftColor = '#ef4444';
        wdMessage.classList.add('show');
        return;
    }
    
    user.bankName = method;
    user.bankOwner = accountName;
    user.bankAccount = accountNumber;
    user.coinBalance -= amount;
    
    const now = new Date();
    const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const tanggal = now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    addHistory(`Ajukan WD ${amount} Coin → ${method}`, amount, 'minus');
    
    try {
        const wdRef = db.collection('wd_requests').doc();
        await wdRef.set({
            userId: currentUser.uid,
            userName: user.name,
            userEmail: user.email,
            amount: amount,
            fee: fee,
            net: net,
            rupiah: rupiah,
            method: method,
            accountName: accountName,
            accountNumber: accountNumber,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            tanggal: tanggal,
            waktu: waktu
        });
        
        wdMessageText.innerHTML = `
            ✅ WD ${amount} Coin (${method}) berhasil diajukan! <br>
            Fee: ${fee} Coin | Diterima: ${net} Coin (Rp ${rupiah.toLocaleString('id-ID')}) <br>
            <span style="color:#f59e0b;">⏳ Menunggu konfirmasi Admin</span>
        `;
        wdMessage.style.borderLeftColor = '#f59e0b';
        wdMessage.classList.add('show');
        
        wdAmountInput.value = '';
        wdAccountName.value = '';
        wdAccountNumber.value = '';
        
        updateCoinUI();
        showToast('📤 WD berhasil diajukan! Tunggu konfirmasi admin.', 3000);
        
    } catch (error) {
        console.error('Error saving WD request:', error);
        user.coinBalance += amount;
        updateCoinUI();
        wdMessageText.textContent = '❌ Gagal mengajukan WD. Silakan coba lagi.';
        wdMessage.style.borderLeftColor = '#ef4444';
        wdMessage.classList.add('show');
        showToast('❌ Gagal mengajukan WD!', 2000);
    }
});

// ============================================================
// HISTORY HELPER
// ============================================================
function addHistory(text, amount, type) {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const date = now.toISOString().split('T')[0];
    DB.user.history.push({ text, amount, type, time, date });
    updateHistory();
    if (currentUser) {
        saveUserData();
    }
}

// ============================================================
// NAVIGATION
// ============================================================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(this.dataset.page).classList.add('active');
    });
});

// ============================================================
// MODAL CLOSE
// ============================================================
modalCloseBtn.addEventListener('click', () => modalOverlay.classList.remove('show'));
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('show');
});

// ============================================================
// SIMPAN DATA KE FIRESTORE
// ============================================================
async function saveUserData() {
    if (!currentUser || !userDocRef || isSaving) return;
    isSaving = true;
    try {
        await userDocRef.update({
            name: DB.user.name || currentUser.displayName || currentUser.email.split('@')[0],
            email: DB.user.email || currentUser.email,
            coinBalance: DB.user.coinBalance,
            streak: DB.user.streak,
            lastDailyClaim: DB.user.lastDailyClaim,
            history: DB.user.history || [],
            purchaseHistory: DB.user.purchaseHistory || [],
            bankName: DB.user.bankName || '',
            bankAccount: DB.user.bankAccount || '',
            bankOwner: DB.user.bankOwner || '',
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving user data:', error);
    }
    isSaving = false;
}

// ============================================================
// TOGGLE LOGIN / REGISTER
// ============================================================
showRegisterBtn.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    loginTitle.textContent = '📝 Daftar';
    loginDesc.textContent = 'Buat akun baru untuk mulai farming!';
    loginMessage.style.display = 'none';
    loginMessage.textContent = '';
});

showLoginBtn.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    loginTitle.textContent = '🔐 Login';
    loginDesc.textContent = 'Masuk untuk melanjutkan';
    loginMessage.style.display = 'none';
    loginMessage.textContent = '';
});

// ============================================================
// REGISTER (EMAIL/PASSWORD)
// ============================================================
registerBtn.addEventListener('click', async () => {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const confirmPassword = registerConfirmPassword.value.trim();

    if (!name || !email || !password || !confirmPassword) {
        loginMessage.textContent = '❌ Semua field harus diisi!';
        loginMessage.style.display = 'block';
        loginMessage.style.color = '#ef4444';
        return;
    }

    if (password.length < 6) {
        loginMessage.textContent = '❌ Password minimal 6 karakter!';
        loginMessage.style.display = 'block';
        loginMessage.style.color = '#ef4444';
        return;
    }

    if (password !== confirmPassword) {
        loginMessage.textContent = '❌ Password tidak sama!';
        loginMessage.style.display = 'block';
        loginMessage.style.color = '#ef4444';
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = 'Loading...';
    loginMessage.style.display = 'none';

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await user.updateProfile({ displayName: name });

        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            coinBalance: 0,
            streak: 0,
            lastDailyClaim: Date.now() - 86400000,
            history: [],
            purchaseHistory: [],
            bankName: '',
            bankAccount: '',
            bankOwner: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        registerBtn.disabled = false;
        registerBtn.textContent = 'Daftar';
        showToast('🎉 Akun berhasil dibuat! Selamat datang!', 3000);

    } catch (error) {
        loginMessage.textContent = `❌ ${error.message}`;
        loginMessage.style.display = 'block';
        loginMessage.style.color = '#ef4444';
        registerBtn.disabled = false;
        registerBtn.textContent = 'Daftar';
    }
});

// ============================================================
// LOGIN (EMAIL/PASSWORD)
// ============================================================
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
        loginMessage.textContent = '❌ Isi email dan password!';
        loginMessage.style.display = 'block';
        loginMessage.style.color = '#ef4444';
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Loading...';
    loginMessage.style.display = 'none';
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    } catch (error) {
        loginMessage.textContent = `❌ ${error.message}`;
        loginMessage.style.display = 'block';
        loginMessage.style.color = '#ef4444';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// ============================================================
// LOGIN GOOGLE
// ============================================================
googleLoginBtn.addEventListener('click', async () => {
    googleLoginBtn.disabled = true;
    googleLoginBtn.textContent = 'Loading...';
    loginMessage.style.display = 'none';
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        googleLoginBtn.disabled = false;
        googleLoginBtn.innerHTML = '<img src="https://www.google.com/favicon.ico"> Login dengan Google';
    } catch (error) {
        loginMessage.textContent = `❌ ${error.message}`;
        loginMessage.style.display = 'block';
        loginMessage.style.color = '#ef4444';
        googleLoginBtn.disabled = false;
        googleLoginBtn.innerHTML = '<img src="https://www.google.com/favicon.ico"> Login dengan Google';
    }
});

// ============================================================
// LOGOUT
// ============================================================
logoutBtn.addEventListener('click', async () => {
    await auth.signOut();
    showToast('👋 Logout berhasil!', 2000);
});

// ============================================================
// ENTER KEY
// ============================================================
loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});
loginEmail.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginPassword.focus();
});
registerConfirmPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerBtn.click();
});
registerPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerConfirmPassword.focus();
});
registerEmail.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerPassword.focus();
});
registerName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerEmail.focus();
});

// ============================================================
// AUTH STATE OBSERVER
// ============================================================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        userDisplay.textContent = user.displayName || user.email.split('@')[0];
        userDisplay.style.display = 'inline';
        logoutBtn.style.display = 'inline';
        loginModal.classList.remove('show');
        
        // Reset home ad claim per session
        homeAdClaimed = false;
        
        userDocRef = db.collection('users').doc(user.uid);
        const doc = await userDocRef.get();
        if (doc.exists) {
            const data = doc.data();
            DB.user.name = data.name || user.displayName || user.email.split('@')[0];
            DB.user.email = data.email || user.email;
            DB.user.coinBalance = data.coinBalance || 0;
            DB.user.streak = data.streak || 0;
            DB.user.lastDailyClaim = data.lastDailyClaim || Date.now() - 86400000;
            DB.user.history = data.history || [];
            DB.user.purchaseHistory = data.purchaseHistory || [];
            DB.user.bankName = data.bankName || '';
            DB.user.bankAccount = data.bankAccount || '';
            DB.user.bankOwner = data.bankOwner || '';
            DB.user.createdAt = data.createdAt || Date.now();
        } else {
            await userDocRef.set({
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                coinBalance: 0,
                streak: 0,
                lastDailyClaim: Date.now() - 86400000,
                history: [],
                purchaseHistory: [],
                bankName: '',
                bankAccount: '',
                bankOwner: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            DB.user.coinBalance = 0;
            DB.user.streak = 0;
            DB.user.name = user.displayName || user.email.split('@')[0];
            DB.user.email = user.email;
            DB.user.createdAt = Date.now();
        }
        
        await loadProductsFromFirebase();
        updateCoinUI();
        checkDailyBonus();
        updateWdQuota();
        
        if (DB.user.history.length === 0) {
            addHistory('Selamat datang di MikoCuan!', 0, 'plus');
        }
        showToast(`👋 Selamat datang ${DB.user.name}!`, 2000);
        
        if (window._statInterval) clearInterval(window._statInterval);
        window._statInterval = setInterval(updateStats, 1000);
        
    } else {
        currentUser = null;
        userDisplay.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginModal.classList.add('show');
        loginTitle.textContent = '🔐 Login';
        loginDesc.textContent = 'Masuk untuk melanjutkan';
        loginBtn.textContent = 'Login';
        loginMessage.style.display = 'none';
        loginEmail.value = '';
        loginPassword.value = '';
        registerName.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        
        DB.user.name = '';
        DB.user.email = '';
        DB.user.coinBalance = 0;
        DB.user.streak = 0;
        DB.user.history = [];
        DB.user.purchaseHistory = [];
        DB.user.bankName = '';
        DB.user.bankAccount = '';
        DB.user.bankOwner = '';
        updateCoinUI();
        updateHistory();
        
        if (window._statInterval) {
            clearInterval(window._statInterval);
            window._statInterval = null;
        }
    }
});

// ============================================================
// INIT
// ============================================================
renderAppLogos();
updateWdQuota();
