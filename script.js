// Global State
let currentState = {
    sessions: 0,
    photosPerSession: 0,
    currentSession: 1,
    currentPhoto: 1,
    capturedPhotos: [],
    totalPrice: 0,
    stream: null
};

// Pricing
const PRICING = {
    1: 5000,
    2: 8000,
    3: 12000
};

// Admin password (in production, this should be more secure)
const ADMIN_PASSWORD = 'admin123';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPaymentConfig();
    loadGallery();
});

// ==================== USER FLOW ====================

// Session Selection
function selectSession(sessions) {
    currentState.sessions = sessions;
    currentState.totalPrice = PRICING[sessions];
    showScreen('photoCountScreen');
}

// Photo Count Selection
function selectPhotoCount(count) {
    currentState.photosPerSession = count;
    currentState.currentSession = 1;
    currentState.currentPhoto = 1;
    currentState.capturedPhotos = [];
    startCamera();
}

// Camera Functions
async function startCamera() {
    showScreen('cameraScreen');
    updateCameraInfo();
    
    try {
        currentState.stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });
        
        const video = document.getElementById('video');
        video.srcObject = currentState.stream;
    } catch (error) {
        alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
        console.error('Camera error:', error);
        showScreen('welcomeScreen');
    }
}

function updateCameraInfo() {
    document.getElementById('currentSession').textContent = currentState.currentSession;
    document.getElementById('totalSessions').textContent = currentState.sessions;
    document.getElementById('currentPhoto').textContent = currentState.currentPhoto;
    document.getElementById('totalPhotos').textContent = currentState.photosPerSession;
}

function startCountdown() {
    const countdownEl = document.getElementById('countdown');
    const captureBtn = document.getElementById('captureBtn');
    
    captureBtn.disabled = true;
    let count = 3;
    
    countdownEl.classList.add('active');
    countdownEl.textContent = count;
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            clearInterval(interval);
            countdownEl.classList.remove('active');
            capturePhoto();
            captureBtn.disabled = false;
        }
    }, 1000);
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const flash = document.getElementById('flash');
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Flash effect
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 300);
    
    // Capture image
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Store photo with metadata
    currentState.capturedPhotos.push({
        data: imageData,
        session: currentState.currentSession,
        photoNumber: currentState.currentPhoto,
        timestamp: new Date().toISOString()
    });
    
    // Move to next photo or session
    if (currentState.currentPhoto < currentState.photosPerSession) {
        currentState.currentPhoto++;
        updateCameraInfo();
    } else if (currentState.currentSession < currentState.sessions) {
        currentState.currentSession++;
        currentState.currentPhoto = 1;
        updateCameraInfo();
    } else {
        // All photos captured
        stopCamera();
        showPreview();
    }
}

function stopCamera() {
    if (currentState.stream) {
        currentState.stream.getTracks().forEach(track => track.stop());
        currentState.stream = null;
    }
}

function cancelSession() {
    stopCamera();
    currentState.capturedPhotos = [];
    showScreen('welcomeScreen');
}

// Preview Functions
function showPreview() {
    showScreen('previewScreen');
    const grid = document.getElementById('photoGrid');
    grid.innerHTML = '';
    
    currentState.capturedPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = `
            <img src="${photo.data}" alt="Photo ${index + 1}">
            <div class="photo-info">
                Sesi ${photo.session} - Foto ${photo.photoNumber}
            </div>
        `;
        grid.appendChild(item);
    });
}

function retakePhotos() {
    currentState.currentSession = 1;
    currentState.currentPhoto = 1;
    currentState.capturedPhotos = [];
    startCamera();
}

function proceedToPayment() {
    showScreen('paymentScreen');
    
    // Update payment info
    document.getElementById('paymentSessions').textContent = `${currentState.sessions} Sesi`;
    document.getElementById('paymentPhotos').textContent = `${currentState.capturedPhotos.length} Foto`;
    document.getElementById('paymentAmount').textContent = formatCurrency(currentState.totalPrice);
    
    // Load payment method
    displayPaymentMethod();
}

function displayPaymentMethod() {
    const paymentMethodEl = document.getElementById('paymentMethod');
    const config = JSON.parse(localStorage.getItem('paymentConfig') || '{}');
    
    if (!config.type) {
        paymentMethodEl.innerHTML = `
            <h3>⚠️ Metode Pembayaran Belum Dikonfigurasi</h3>
            <p>Silakan hubungi admin untuk mengatur metode pembayaran.</p>
        `;
        return;
    }
    
    let content = '';
    
    switch (config.type) {
        case 'qris':
            content = `
                <h3>💳 Pembayaran QRIS</h3>
                <p>Scan QR Code berikut untuk melakukan pembayaran:</p>
                ${config.qrisImage ? `<img src="${config.qrisImage}" alt="QRIS">` : ''}
                ${config.qrisCode ? `<p><strong>Kode:</strong> ${config.qrisCode}</p>` : ''}
            `;
            break;
            
        case 'bank':
            content = `
                <h3>🏦 Transfer Bank</h3>
                <p><strong>Bank:</strong> ${config.bankName}</p>
                <p><strong>Nomor Rekening:</strong> ${config.bankAccount}</p>
                <p><strong>Atas Nama:</strong> ${config.bankHolder}</p>
                <p><strong>Jumlah:</strong> ${formatCurrency(currentState.totalPrice)}</p>
            `;
            break;
            
        case 'ewallet':
            content = `
                <h3>📱 E-Wallet</h3>
                <p><strong>Jenis:</strong> ${config.ewalletType.toUpperCase()}</p>
                <p><strong>Nomor:</strong> ${config.ewalletNumber}</p>
                <p><strong>Atas Nama:</strong> ${config.ewalletName}</p>
                <p><strong>Jumlah:</strong> ${formatCurrency(currentState.totalPrice)}</p>
            `;
            break;
            
        case 'va':
            content = `
                <h3>🏧 Virtual Account</h3>
                <p><strong>Bank:</strong> ${config.vaBank}</p>
                <p><strong>Nomor VA:</strong> ${config.vaNumber}</p>
                <p><strong>Jumlah:</strong> ${formatCurrency(currentState.totalPrice)}</p>
            `;
            break;
            
        case 'cashier':
            content = `
                <h3>🏪 Bayar di Kasir</h3>
                <p><strong>Lokasi:</strong> ${config.cashierLocation}</p>
                ${config.cashierInstructions ? `<p>${config.cashierInstructions}</p>` : ''}
                <p><strong>Jumlah:</strong> ${formatCurrency(currentState.totalPrice)}</p>
            `;
            break;
    }
    
    paymentMethodEl.innerHTML = content;
}

function cancelPayment() {
    showPreview();
}

function completePayment() {
    // Save to gallery
    saveToGallery();
    
    // Show complete screen
    showScreen('completeScreen');
    
    const grid = document.getElementById('downloadGrid');
    grid.innerHTML = '';
    
    currentState.capturedPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = `
            <img src="${photo.data}" alt="Photo ${index + 1}">
            <div class="photo-info">
                Sesi ${photo.session} - Foto ${photo.photoNumber}
            </div>
        `;
        grid.appendChild(item);
    });
}

function saveToGallery() {
    const gallery = JSON.parse(localStorage.getItem('photoGallery') || '[]');
    const now = new Date();
    
    const sessionData = {
        id: Date.now(),
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('id-ID'),
        time: now.toLocaleTimeString('id-ID'),
        sessions: currentState.sessions,
        totalPhotos: currentState.capturedPhotos.length,
        price: currentState.totalPrice,
        photos: currentState.capturedPhotos
    };
    
    gallery.unshift(sessionData);
    localStorage.setItem('photoGallery', JSON.stringify(gallery));
}

function downloadAllPhotos() {
    currentState.capturedPhotos.forEach((photo, index) => {
        const link = document.createElement('a');
        link.href = photo.data;
        link.download = `photo-booth-sesi${photo.session}-foto${photo.photoNumber}.jpg`;
        link.click();
    });
}

function startOver() {
    currentState = {
        sessions: 0,
        photosPerSession: 0,
        currentSession: 1,
        currentPhoto: 1,
        capturedPhotos: [],
        totalPrice: 0,
        stream: null
    };
    showScreen('welcomeScreen');
}

// ==================== ADMIN PANEL ====================

function showAdminLogin() {
    document.getElementById('adminPanel').classList.add('active');
    document.getElementById('adminLogin').classList.add('active');
    document.getElementById('adminPassword').value = '';
}

function closeAdmin() {
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('adminLogin').classList.remove('active');
    document.getElementById('adminDashboard').classList.remove('active');
}

function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').classList.remove('active');
        document.getElementById('adminDashboard').classList.add('active');
        loadPaymentConfig();
        loadGallery();
    } else {
        alert('Password salah!');
    }
}

function adminLogout() {
    document.getElementById('adminDashboard').classList.remove('active');
    document.getElementById('adminLogin').classList.add('active');
}

function showAdminTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    
    if (tab === 'gallery') {
        loadGallery();
    }
}

// Payment Configuration
function showPaymentConfig(type) {
    // Hide all config details
    document.querySelectorAll('.config-details').forEach(el => el.classList.remove('active'));
    
    // Show selected config
    document.getElementById(type + 'Config').classList.add('active');
}

function uploadQRIS() {
    const file = document.getElementById('qrisImage').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('qrisPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="QRIS Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function savePaymentConfig() {
    const selectedType = document.querySelector('input[name="paymentType"]:checked');
    
    if (!selectedType) {
        alert('Pilih metode pembayaran terlebih dahulu!');
        return;
    }
    
    const type = selectedType.value;
    const config = { type };
    
    switch (type) {
        case 'qris':
            config.qrisCode = document.getElementById('qrisCode').value;
            const qrisPreview = document.querySelector('#qrisPreview img');
            if (qrisPreview) {
                config.qrisImage = qrisPreview.src;
            }
            break;
            
        case 'bank':
            config.bankName = document.getElementById('bankName').value;
            config.bankAccount = document.getElementById('bankAccount').value;
            config.bankHolder = document.getElementById('bankHolder').value;
            break;
            
        case 'ewallet':
            config.ewalletType = document.getElementById('ewalletType').value;
            config.ewalletNumber = document.getElementById('ewalletNumber').value;
            config.ewalletName = document.getElementById('ewalletName').value;
            break;
            
        case 'va':
            config.vaBank = document.getElementById('vaBank').value;
            config.vaNumber = document.getElementById('vaNumber').value;
            break;
            
        case 'cashier':
            config.cashierLocation = document.getElementById('cashierLocation').value;
            config.cashierInstructions = document.getElementById('cashierInstructions').value;
            break;
    }
    
    localStorage.setItem('paymentConfig', JSON.stringify(config));
    alert('Konfigurasi pembayaran berhasil disimpan!');
}

function loadPaymentConfig() {
    const config = JSON.parse(localStorage.getItem('paymentConfig') || '{}');
    
    if (!config.type) return;
    
    // Select the radio button
    const radio = document.querySelector(`input[name="paymentType"][value="${config.type}"]`);
    if (radio) {
        radio.checked = true;
        showPaymentConfig(config.type);
    }
    
    // Load values
    switch (config.type) {
        case 'qris':
            if (config.qrisCode) document.getElementById('qrisCode').value = config.qrisCode;
            if (config.qrisImage) {
                document.getElementById('qrisPreview').innerHTML = `<img src="${config.qrisImage}" alt="QRIS">`;
            }
            break;
            
        case 'bank':
            if (config.bankName) document.getElementById('bankName').value = config.bankName;
            if (config.bankAccount) document.getElementById('bankAccount').value = config.bankAccount;
            if (config.bankHolder) document.getElementById('bankHolder').value = config.bankHolder;
            break;
            
        case 'ewallet':
            if (config.ewalletType) document.getElementById('ewalletType').value = config.ewalletType;
            if (config.ewalletNumber) document.getElementById('ewalletNumber').value = config.ewalletNumber;
            if (config.ewalletName) document.getElementById('ewalletName').value = config.ewalletName;
            break;
            
        case 'va':
            if (config.vaBank) document.getElementById('vaBank').value = config.vaBank;
            if (config.vaNumber) document.getElementById('vaNumber').value = config.vaNumber;
            break;
            
        case 'cashier':
            if (config.cashierLocation) document.getElementById('cashierLocation').value = config.cashierLocation;
            if (config.cashierInstructions) document.getElementById('cashierInstructions').value = config.cashierInstructions;
            break;
    }
}

// Gallery Functions
function loadGallery() {
    const gallery = JSON.parse(localStorage.getItem('photoGallery') || '[]');
    const galleryEl = document.getElementById('adminGallery');
    
    if (gallery.length === 0) {
        galleryEl.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Belum ada foto yang diambil.</p>';
        return;
    }
    
    galleryEl.innerHTML = '';
    
    gallery.forEach(session => {
        session.photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.date = session.date;
            item.dataset.time = session.time;
            item.dataset.timestamp = session.timestamp;
            
            item.innerHTML = `
                <img src="${photo.data}" alt="Photo">
                <div class="gallery-item-info">
                    <p><strong>Tanggal:</strong> ${session.date}</p>
                    <p><strong>Waktu:</strong> ${session.time}</p>
                    <p><strong>Sesi:</strong> ${photo.session} - Foto ${photo.photoNumber}</p>
                    <button class="download-btn" onclick="downloadPhoto('${photo.data}', 'photo-${session.id}-${photo.photoNumber}.jpg')">Download</button>
                </div>
            `;
            
            galleryEl.appendChild(item);
        });
    });
}

function searchPhotos() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        const date = item.dataset.date.toLowerCase();
        const time = item.dataset.time.toLowerCase();
        
        if (date.includes(searchTerm) || time.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function clearSearch() {
    document.getElementById('searchBox').value = '';
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.display = 'block';
    });
}

function downloadPhoto(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

// ==================== UTILITY FUNCTIONS ====================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goBack(screenId) {
    stopCamera();
    showScreen(screenId);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}
