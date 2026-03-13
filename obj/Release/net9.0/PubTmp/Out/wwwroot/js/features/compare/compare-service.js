import { assetListData, allAssetTypeData } from '/js/data/data.js';

// --- 1. Configuration & Constants ---
const STORAGE_KEY = 'sam_compare_list';
const MAX_COMPARE = 5;
const THEME_COLOR = '#E91E63'; // สีชมพู SAM
const THEME_LIGHT = '#df9faa';

// สภาพแวดล้อมข้อมูล (Lookup Table)
const typeMap = allAssetTypeData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});

// ดึงข้อมูลเริ่มต้นจาก Storage
export let compareList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// --- 2. Internal Helpers (Data Management) ---

const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
};

/**
 * แจ้งเตือนผ่าน SweetAlert2 แบบ Reusable
 */
const notify = (title, text, icon = 'info') => {
    Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: THEME_COLOR,
        confirmButtonText: 'ตกลง'
    });
};

// --- 3. Core Exported Functions ---

/**
 * อัปเดต UI ทั้งหมดที่เกี่ยวข้องกับการเปรียบเทียบ
 */
export const updateCompareUI = () => {
    const compareBar = document.getElementById('compare-sticky-bar');
    const previewContainer = document.getElementById('compare-preview-items');
    const countEl = document.getElementById('compare-count');

    if (!compareBar) return;

    // การแสดงผล Sticky Bar
    compareBar.classList.toggle('active', compareList.length > 0);
    if (countEl) countEl.innerText = compareList.length;

    // การเรนเดอร์รายการย่อย (Mini Preview)
    if (previewContainer) {
        const selectedAssets = assetListData.filter(asset => compareList.includes(asset.id));

        previewContainer.innerHTML = selectedAssets.map(asset => `
            <div class="card card--compare">
                <div class="card__content">
                    <span class="card__code">${asset.assetCode}</span>
                    <span class="card__type">${typeMap[asset.typeId]?.typeName || ''}</span>
                    <span class="card__location text-truncate">${asset.location}</span>
                </div>
                <button class="card__remove" onclick="window.removeCompareItem(${asset.id})">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');
    }

    // Sync Checkboxes ในหน้ารายการทรัพย์
    document.querySelectorAll('.compare-input').forEach(input => {
        input.checked = compareList.includes(parseInt(input.dataset.id));
    });
};

/**
 * เพิ่มหรือลบทรัพย์สินจากรายการเปรียบเทียบ
 */
export const toggleCompareAsset = (assetId) => {
    const id = parseInt(assetId);
    const index = compareList.indexOf(id);

    if (index > -1) {
        compareList.splice(index, 1);
    } else {
        if (compareList.length >= MAX_COMPARE) {
            notify('แจ้งเตือน', `คุณสามารถเลือกเปรียบเทียบได้สูงสุด ${MAX_COMPARE} รายการ`, 'warning');
            return false;
        }
        compareList.push(id);
    }

    saveToStorage();
    updateCompareUI();
    return true;
};

/**
 * ล้างรายการเปรียบเทียบทั้งหมดพร้อมยืนยัน
 */
export const clearAllCompare = () => {
    Swal.fire({
        title: 'ยืนยันการล้างข้อมูล?',
        text: "รายการเปรียบเทียบทั้งหมดจะถูกลบออก",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: THEME_COLOR,
        cancelButtonColor: '#6e7881',
        confirmButtonText: 'ใช่, ล้างทั้งหมด!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            compareList.length = 0;
            saveToStorage();

            if (window.location.pathname.includes('compare-results')) {
                window.close(); // ปิดแท็บหากอยู่ในหน้าผลลัพธ์
            } else {
                updateCompareUI();
            }

            Swal.fire({
                title: 'ล้างข้อมูลเรียบร้อย!',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
            });
        }
    });
};

/**
 * เปิดหน้าแสดงผลการเปรียบเทียบในแท็บใหม่
 */
export const goToComparePage = () => {
    if (compareList.length < 2) {
        notify('เลือกรายการไม่พอ', 'กรุณาเลือกทรัพย์สินอย่างน้อย 2 รายการเพื่อเปรียบเทียบ', 'question');
        return;
    }

    const ids = compareList.join(',');
    const url = `/npa/compare-results?ids=${ids}`;
    const newTab = window.open(url, '_blank');

    if (newTab) {
        newTab.focus();
    } else {
        notify('เบราว์เซอร์บล็อกหน้าต่างใหม่', 'กรุณาอนุญาตให้เปิด Pop-up เพื่อดูผลการเปรียบเทียบ', 'info');
    }
};

// --- 4. Event Listeners & Window Binding ---

// ดักฟังการเปลี่ยนแปลงจากแท็บอื่น (Cross-tab Sync)
window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
        compareList = JSON.parse(event.newValue) || [];
        updateCompareUI();
    }
});

// ฟังก์ชันลบรายชิ้นสำหรับปุ่มใน Template
window.removeCompareItem = (id) => {
    const index = compareList.indexOf(parseInt(id));
    if (index > -1) {
        compareList.splice(index, 1);
        saveToStorage();
        updateCompareUI();
    }
};

// ผูกฟังก์ชันเข้ากับ Global window เพื่อให้ HTML onclick เรียกใช้ได้
window.clearAllCompare = clearAllCompare;
window.goToComparePage = goToComparePage;
window.toggleCompareAsset = toggleCompareAsset;