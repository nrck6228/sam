import { compareList, toggleCompareAsset } from '/js/features/compare/compare-service.js';
import { assetListData, allAssetTypeData } from '/js/data/data.js';

// --- Configuration & Helpers ---
const STATUS_CONFIG = {
    1: { label: 'ซื้อตรง', class: 'card__badge--direct' },
    2: { label: 'ขายทอดตลาด', class: 'card__badge--auction' },
    3: { label: 'รอประกาศราคา', class: 'card__badge--waiting' }
};

const typeMap = allAssetTypeData.reduce((acc, curr) => {
    acc[curr.id] = curr.typeName;
    return acc;
}, {});

// --- Core Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบเบื้องต้น: ถ้า URL มี IDs ให้ทำการ Sync ลง Manager ก่อน (ถ้าจำเป็น)
    // ในที่นี้เราจะอิงตาม compareList ที่ Manager ดึงมาให้ตอน Import
    renderCompareTable();
});

function renderCompareTable() {
    const wrapper = document.getElementById('compare-result-wrapper');
    if (!wrapper) return;

    // กรองข้อมูลทรัพย์จาก List ที่มีอยู่ใน Manager
    const assets = assetListData.filter(a => compareList.includes(a.id));

    if (assets.length === 0) {
        wrapper.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-folder2-open display-1 text-muted"></i>
                <p class="mt-3">ไม่พบรายการเปรียบเทียบ</p>
                <button onclick="window.close()" class="btn btn--clear">
                    <span class="btn__text">ปิดหน้านี้</span>
                </button>
            </div>`;
        return;
    }

    const rows = [
        { label: 'รูปภาพ', field: 'img', type: 'image' },
        { label: 'สถานะ', field: 'statusId', type: 'status' },
        { label: 'รหัสทรัพย์', field: 'assetCode' },
        { label: 'ราคา', field: 'totalPrice', type: 'price' },
        { label: 'ประเภท', field: 'typeId', type: 'assetType' },
        { label: 'เนื้อที่', field: 'area', type: 'area' },
        { label: 'ทำเลที่ตั้ง', field: 'location' },
        { label: 'รายละเอียด', field: 'assetName', type: 'description' }
    ];

    // สร้าง Grid Container (ใช้ Inline Style สำหรับจำนวน Column)
    let html = `<div class="compare-grid" style="grid-template-columns: 200px repeat(${assets.length}, minmax(200px, 1fr));">`;

    rows.forEach(row => {
        // เปิด Row
        html += `<div class="compare-row">`;

        // 1. Label Cell
        html += `<div class="compare-cell compare-label">${row.label}</div>`;

        // 2. Data Cells
        assets.forEach(asset => {
            html += `<div class="compare-cell">`;
            html += renderCellContent(row, asset);
            html += `</div>`;
        });

        // ปิด Row
        html += `</div>`;
    });

    html += `</div>`; // ปิด Grid
    wrapper.innerHTML = html;
}

/**
 * แยก Logic การวาด Content ในแต่ละ Cell เพื่อความอ่านง่าย
 */
function renderCellContent(row, asset) {
    switch (row.type) {
        case 'image':
            return `
                <div class="compare-image-cell w-100">
                    <button class="btn btn--remove" onclick="removeAndRefresh(${asset.id})">
                        <span class="btn__icon"><i class="bi bi-x"></i></span>
                    </button>
                    <img src="${asset.img}" class="compare-img">
                    <a href="/asset-detail/${asset.assetCode}" target="_blank" class="btn btn--hover btn--pink mt-2">
                        <span class="btn__text">รายละเอียด</span>
                    </a>
                </div>`;

        case 'status':
            const status = STATUS_CONFIG[asset.statusId];
            return status ? `<span class="badge ${status.class}">${status.label}</span>` : '-';

        case 'assetType':
            return typeMap[asset.typeId] || 'ไม่ระบุ';

        case 'price':
            if (asset.statusId === 3) return `<span class="text-muted fw-bold">ติดต่อเจ้าหน้าที่</span>`;
            return `<span class="text-pink fw-bold">${(asset.totalPrice || 0).toLocaleString()} บาท</span>`;

        case 'area':
            return `${asset.area} ${asset.unit || ''}`;

        case 'description':
            return `<div class="compare-desc-text">${asset[row.field] || '-'}</div>`;

        default:
            return asset[row.field] || '-';
    }
}

// --- Global Functions (เรียกจาก HTML ได้) ---

window.removeAndRefresh = (id) => {
    // ใช้ Manager ในการลบ (ซึ่งจะบันทึกลง LocalStorage ให้เอง)
    toggleCompareAsset(id);

    // ตรวจสอบว่าถ้าลบจนหมดแล้วให้ปิดหน้า
    if (compareList.length === 0) {
        Swal.fire({
            title: 'ไม่มีรายการเหลืออยู่',
            text: 'ระบบกำลังนำคุณกลับหน้าหลัก',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false
        }).then(() => window.close());
    } else {
        renderCompareTable();
    }
};

window.clearAllCompare = () => {
    Swal.fire({
        title: 'ยืนยันการล้างข้อมูล?',
        text: "รายการเปรียบเทียบทั้งหมดจะถูกลบออก",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#E91E63',
        confirmButtonText: 'ใช่, ล้างทั้งหมด!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            // ล้าง Array ใน Manager
            compareList.length = 0;
            localStorage.setItem('sam_compare_list', JSON.stringify([]));
            renderCompareTable();
        }
    });
};

// Sync ข้อมูลเมื่อมีการเปลี่ยนจากหน้าอื่น (เช่น เปิดหน้า List คู่ไปด้วยแล้วกดลบ)
window.addEventListener('storage', (event) => {
    if (event.key === 'sam_compare_list') {
        // อัปเดตตัวแปรภายในให้ตรงกับ Storage และวาดใหม่
        const newList = JSON.parse(event.newValue) || [];
        compareList.splice(0, compareList.length, ...newList);
        renderCompareTable();
    }
});