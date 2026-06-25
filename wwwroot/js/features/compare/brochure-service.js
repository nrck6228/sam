import { assetListData, allAssetTypeData } from '/js/data/data.js';

// ===========================================================================
// Brochure Service
// แยกออกจาก compare-service เพื่อให้ "เลือกทำโบรชัวร์" เป็นอิสระจาก "เปรียบเทียบ"
// ต่างกันตรง: โบรชัวร์เลือกได้ไม่จำกัดจำนวน
// ===========================================================================

// --- 1. Configuration & Constants ---
const STORAGE_KEY = 'sam_brochure_list';
const THEME_COLOR = '#E91E63'; // สีชมพู SAM

const typeMap = allAssetTypeData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});

// ดึงข้อมูลเริ่มต้นจาก Storage
export let brochureList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// --- 2. Internal Helpers ---
const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brochureList));
};

const notify = (title, text, icon = 'info') => {
    Swal.fire({ title, text, icon, confirmButtonColor: THEME_COLOR, confirmButtonText: 'ตกลง' });
};

// --- 3. Core Exported Functions ---

/**
 * อัปเดต UI ของรายการโบรชัวร์ (preview + ตัวนับ + sync checkbox)
 */
export const updateBrochureUI = () => {
    const previewContainer = document.getElementById('brochure-preview-items');
    const countEl = document.getElementById('brochure-count');

    if (countEl) countEl.innerText = brochureList.length;

    if (previewContainer) {
        const selectedAssets = assetListData.filter(asset => brochureList.includes(asset.id));

        // มีรูปทรัพย์ในรายการ preview
        previewContainer.innerHTML = selectedAssets.map(asset => `
            <div class="card card--compare card--compare--brochure">
                <div class="card__figure">
                    <img src="${asset.img}" alt="${asset.alt}" class="card__image" loading="lazy">
                </div>
                <div class="card__content">
                    <span class="card__code">${asset.assetCode}</span>
                    <span class="card__type">${typeMap[asset.typeId]?.typeName || ''}</span>
                    <span class="card__location text-truncate">${asset.location}</span>
                </div>
                <button class="card__remove" onclick="window.removeBrochureItem(${asset.id})">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');
    }

    // Sync checkbox โบรชัวร์ในหน้ารายการทรัพย์
    document.querySelectorAll('.brochure-input').forEach(input => {
        input.checked = brochureList.includes(parseInt(input.dataset.id));
    });

    // ให้แถบล่างคำนวณการแสดงผลจากทั้ง 2 ลิสต์ (ถ้ามี orchestrator)
    if (window.refreshCompareBar) {
        window.refreshCompareBar();
    } else {
        const bar = document.getElementById('compare-sticky-bar');
        if (bar) bar.classList.toggle('active', brochureList.length > 0);
    }
};

/**
 * เพิ่ม/ลบทรัพย์จากรายการโบรชัวร์ (ไม่จำกัดจำนวน)
 */
export const toggleBrochureAsset = (assetId) => {
    const id = parseInt(assetId);
    const index = brochureList.indexOf(id);

    if (index > -1) {
        brochureList.splice(index, 1);
    } else {
        brochureList.push(id);
    }

    saveToStorage();
    updateBrochureUI();
    return true;
};

/**
 * ล้างรายการโบรชัวร์ทั้งหมดพร้อมยืนยัน
 */
export const clearAllBrochure = () => {
    Swal.fire({
        title: 'ยืนยันการล้างข้อมูล?',
        text: "รายการสร้างโบรชัวร์ทั้งหมดจะถูกลบออก",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: THEME_COLOR,
        cancelButtonColor: '#6e7881',
        confirmButtonText: 'ใช่, ล้างทั้งหมด!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            brochureList.length = 0;
            saveToStorage();
            updateBrochureUI();
            Swal.fire({ title: 'ล้างข้อมูลเรียบร้อย!', icon: 'success', timer: 1000, showConfirmButton: false });
        }
    });
};

/**
 * เปิดหน้า e-brochure ในแท็บใหม่
 */
export const createBrochurePage = () => {
    if (brochureList.length < 1) {
        notify('เลือกรายการไม่พอ', 'กรุณาเลือกทรัพย์สินอย่างน้อย 1 รายการเพื่อสร้างโบรชัวร์', 'question');
        return;
    }

    const ids = brochureList.join(',');
    const newTab = window.open(`/npa/e-brochure?ids=${ids}`, '_blank');
    if (newTab) {
        newTab.focus();
    } else {
        notify('เบราว์เซอร์บล็อกหน้าต่างใหม่', 'กรุณาอนุญาตให้เปิด Pop-up เพื่อสร้างโบรชัวร์', 'info');
    }
};

// --- 4. Event Listeners & Window Binding ---

// Cross-tab Sync
window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
        brochureList = JSON.parse(event.newValue) || [];
        updateBrochureUI();
    }
});

// ลบรายชิ้นจากปุ่มใน Template
window.removeBrochureItem = (id) => {
    const index = brochureList.indexOf(parseInt(id));
    if (index > -1) {
        brochureList.splice(index, 1);
        saveToStorage();
        updateBrochureUI();
    }
};

window.clearAllBrochure = clearAllBrochure;
window.createBrochurePage = createBrochurePage;
window.toggleBrochureAsset = toggleBrochureAsset;
