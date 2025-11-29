// ========================================
// ROL BAZLI ERİŞİM KONTROL SİSTEMİ
// ========================================

// Rol tanımları ve erişim haritası
const roleAccessMap = {
    'buhara': ['hikaye', 'kaynaklar', 'gecmis', 'ayarlar'],
    'ugur': ['hikaye', 'kaynaklar', 'gecmis', 'ayarlar'],
    'senarist': ['hikaye', 'senaryo', 'revize', 'gecmis', 'ayarlar'],
    'hakan': ['senaryo', 'revize', 'gorseller', 'videolar', 'kurgu', 'gecmis', 'ayarlar'],
    'miray': ['gorseller', 'videolar', 'gecmis', 'ayarlar'],
    'kurgu': ['kurgu', 'gecmis', 'ayarlar'],
    'muzaffer': ['dashboard', 'hikaye', 'kaynaklar', 'senaryo', 'revize', 'gorseller', 'videolar', 'kurgu', 'gecmis', 'ayarlar']
};

// Rol isimleri
const roleNames = {
    'buhara': 'Buhara Hanım',
    'ugur': 'Uğur Bey',
    'senarist': 'Senarist',
    'hakan': 'Hakan Bey',
    'miray': 'Miray',
    'kurgu': 'Kurgu Ekibi',
    'muzaffer': 'Muzaffer Topaklı'
};

// Aktif rol (varsayılan: Muzaffer Topaklı)
let currentRole = 'muzaffer';

// ========================================
// SAYFA YÜKLENDİĞİNDE ÇALIŞACAK FONKSİYONLAR
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Film Projesi Panel Sistemi yüklendi.');
    
    // İlk yüklemede animasyonları başlat
    initializeAnimations();
    
    // Rol seçiciyi ayarla
    setupRoleSelector();
    
    // Navigasyon menüsünü ayarla
    setupNavigation();
    
    // Modal sistemini ayarla
    setupModals();
    
    // Form gönderimlerini ayarla
    setupForms();
    
    // İlk rol için görünürlüğü ayarla
    updateVisibilityByRole(currentRole);
    
    // Uyarı banner'ını göster (Miray, Hakan, Muzaffer için)
    if (['miray', 'hakan', 'muzaffer'].includes(currentRole)) {
        showWarningBanner();
    }
    
    console.log('Aktif rol:', roleNames[currentRole]);
});

// ========================================
// ANIMASYONLAR
// ========================================

function initializeAnimations() {
    // Kartların fade-in animasyonu
    const cards = document.querySelectorAll('.card, .metric-card, .resource-card, .image-card, .video-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
    });
    
    // Butonlara ripple efekti ekle
    addRippleEffect();
}

// Butonlara tıklama ripple efekti
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .btn-sm, .btn-icon');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Scale animasyonu
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// ========================================
// ROL SEÇİCİ SİSTEMİ
// ========================================

function setupRoleSelector() {
    const roleSelector = document.getElementById('roleSelector');
    const roleDropdown = document.getElementById('roleDropdown');
    const currentRoleElement = document.getElementById('currentRole');
    const roleOptions = document.querySelectorAll('.role-option');
    
    // Rol seçici tıklama
    roleSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        roleDropdown.classList.toggle('show');
        roleSelector.classList.toggle('active');
    });
    
    // Rol seçeneklerine tıklama
    roleOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedRole = this.getAttribute('data-role');
            
            // Rol değiştir
            changeRole(selectedRole);
            
            // Dropdown'u kapat
            roleDropdown.classList.remove('show');
            roleSelector.classList.remove('active');
        });
    });
    
    // Dışarı tıklandığında dropdown'u kapat
    document.addEventListener('click', function() {
        roleDropdown.classList.remove('show');
        roleSelector.classList.remove('active');
    });
}

// Rol değiştirme fonksiyonu
function changeRole(newRole) {
    if (currentRole === newRole) return;
    
    console.log(`Rol değiştiriliyor: ${roleNames[currentRole]} → ${roleNames[newRole]}`);
    
    const currentRoleElement = document.getElementById('currentRole');
    const mainContent = document.querySelector('.main-content');
    
    // Fade-out animasyonu
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        // Rolü güncelle
        currentRole = newRole;
        currentRoleElement.textContent = roleNames[newRole];
        
        // Görünürlüğü güncelle
        updateVisibilityByRole(newRole);
        
        // Uyarı banner'ını kontrol et
        if (['miray', 'hakan', 'muzaffer'].includes(newRole)) {
            showWarningBanner();
        } else {
            hideWarningBanner();
        }
        
        // Fade-in animasyonu
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
        
        // İlk erişilebilir bölümü göster
        showFirstAccessibleSection(newRole);
        
        console.log('Yeni aktif rol:', roleNames[newRole]);
    }, 300);
}

// Rol bazlı görünürlük kontrolü
function updateVisibilityByRole(role) {
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');
    const accessibleSections = roleAccessMap[role] || [];
    
    // Tüm bölümleri gizle
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Navigasyon öğelerini güncelle
    navItems.forEach(item => {
        const sectionId = item.getAttribute('data-section');
        
        if (accessibleSections.includes(sectionId)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// İlk erişilebilir bölümü göster
function showFirstAccessibleSection(role) {
    const accessibleSections = roleAccessMap[role] || [];
    
    if (accessibleSections.length > 0) {
        const firstSection = accessibleSections[0];
        showSection(firstSection);
        
        // Navigasyonda da aktif yap
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-section') === firstSection) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// ========================================
// NAVİGASYON SİSTEMİ
// ========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            const accessibleSections = roleAccessMap[currentRole] || [];
            
            // Erişim kontrolü
            if (!accessibleSections.includes(sectionId)) {
                alert('Bu bölüme erişim yetkiniz yok.');
                return;
            }
            
            // Aktif menü öğesini güncelle
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Bölümü göster
            showSection(sectionId);
        });
    });
}

// Bölüm gösterme fonksiyonu
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

// ========================================
// MODAL SİSTEMİ
// ========================================

function setupModals() {
    // Modal dışına tıklandığında kapat
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Modal açma fonksiyonu
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Arka planı kaydırmayı engelle
    }
}

// Modal kapatma fonksiyonu
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Kaydırmayı geri aç
    }
}

// Global fonksiyonlar (HTML'den çağrılabilir)
window.openModal = openModal;
window.closeModal = closeModal;

// ========================================
// FORM YÖNETİMİ
// ========================================

function setupForms() {
    // Revize formu
    const revizeForm = document.getElementById('revizeForm');
    if (revizeForm) {
        revizeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const hedef = document.getElementById('revizeHedef').value;
            const aciklama = document.getElementById('revizeAciklama').value;
            
            if (!hedef || !aciklama) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }
            
            alert(`Revize talebi ${roleNames[hedef] || hedef} kişisine gönderildi.`);
            
            // Formu temizle
            revizeForm.reset();
        });
    }
    
    // Tüm formları dinle
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Revize formu zaten işleniyor, onu atla
            if (this.id === 'revizeForm') return;
            
            e.preventDefault();
            
            // Form gönderildi mesajı
            const formTitle = this.closest('.modal-content')?.querySelector('h3')?.textContent || 
                             this.closest('.card')?.querySelector('.card-title')?.textContent || 
                             'Form';
            
            alert(`${formTitle} başarıyla gönderildi!`);
            
            // Modal içindeyse kapat
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
            
            // Formu temizle
            this.reset();
        });
    });
}

// ========================================
// UYARI BANNER SİSTEMİ
// ========================================

function showWarningBanner() {
    const warningBanner = document.getElementById('warningBanner');
    if (warningBanner) {
        warningBanner.style.display = 'flex';
    }
}

function hideWarningBanner() {
    const warningBanner = document.getElementById('warningBanner');
    if (warningBanner) {
        warningBanner.style.display = 'none';
    }
}

function closeWarning() {
    hideWarningBanner();
}

// Global fonksiyon
window.closeWarning = closeWarning;

// ========================================
// YARDIMCI FONKSİYONLAR
// ========================================

// Tarih formatlama
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

// Zaman formatlama
function formatDateTime(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Bildirim gösterme (gelecekte kullanılabilir)
function showNotification(message, type = 'info') {
    // Basit alert yerine daha gelişmiş bir bildirim sistemi eklenebilir
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ========================================
// ÖZEL ANIMASYONLAR VE EFEKTLER
// ========================================

// Hover efekti için kart animasyonları
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.metric-card, .resource-card, .image-card, .video-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
});

// Scroll animasyonu (sayfa kaydırıldığında kartlar beliriyor)
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.card, .metric-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Scroll animasyonlarını başlat
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(handleScrollAnimations, 100);
});

// ========================================
// KLAVYE KISAYOLLARI (İsteğe bağlı)
// ========================================

document.addEventListener('keydown', function(e) {
    // ESC tuşu ile modal kapatma
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// ========================================
// PERFORMANS OPTİMİZASYONU
// ========================================

// Debounce fonksiyonu (gereksiz işlemleri azaltmak için)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Resize event'i için debounce
window.addEventListener('resize', debounce(function() {
    console.log('Pencere boyutu değişti.');
    // Gerekirse responsive ayarlamalar yapılabilir
}, 250));

// ========================================
// KONSOL MESAJLARI
// ========================================

console.log('%c🎬 Film Projesi Panel Sistemi', 'font-size: 20px; font-weight: bold; color: #2563eb;');
console.log('%cSistem başarıyla yüklendi!', 'font-size: 14px; color: #10b981;');
console.log('%cAktif Rol:', 'font-weight: bold;', roleNames[currentRole]);
console.log('%cErişilebilir Modüller:', 'font-weight: bold;', roleAccessMap[currentRole]);

// ========================================
// SAYFA GÖRÜNÜRLÜK DEĞİŞİMİ
// ========================================

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Sayfa arka plana alındı.');
    } else {
        console.log('Sayfa ön plana getirildi.');
    }
});

// ========================================
// LOCALSTORAGEden ROL KAYDETME (İsteğe bağlı)
// ========================================

// Rol değiştiğinde localStorage'a kaydet
function saveRoleToStorage(role) {
    try {
        localStorage.setItem('filmPanelRole', role);
    } catch (e) {
        console.warn('LocalStorage kullanılamıyor:', e);
    }
}

// Sayfa yüklendiğinde localStorage'dan rol oku
function loadRoleFromStorage() {
    try {
        const savedRole = localStorage.getItem('filmPanelRole');
        if (savedRole && roleAccessMap[savedRole]) {
            return savedRole;
        }
    } catch (e) {
        console.warn('LocalStorage okunamıyor:', e);
    }
    return 'muzaffer'; // Varsayılan
}

// İlk yüklemede kaydedilmiş rolü kullan
document.addEventListener('DOMContentLoaded', function() {
    const savedRole = loadRoleFromStorage();
    if (savedRole !== currentRole) {
        changeRole(savedRole);
    }
});

// Rol değiştiğinde kaydet
const originalChangeRole = changeRole;
changeRole = function(newRole) {
    originalChangeRole(newRole);
    saveRoleToStorage(newRole);
};

// ========================================
// SİSTEM HAZIR
// ========================================

console.log('%c✅ Tüm sistemler hazır!', 'font-size: 14px; font-weight: bold; color: #10b981;');
