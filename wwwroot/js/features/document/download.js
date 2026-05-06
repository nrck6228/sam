import { getData } from '/js/core/utils.js';
import { initListEngine } from '/js/shared/list-renderer.js';

let cachedData = []; 
let engineInstances = {}; 

// ผูกเข้ากับ window ทันทีเพื่อให้เช็กได้ว่าไฟล์โหลดแน่ๆ
window.engineInstances = engineInstances;
window.cachedData = cachedData;

console.log("JS File Loaded Successfully!");
/**
 * 1. นิยามหมวดหมู่ที่ต้องการแสดงผล
 */
const CATEGORIES = [
    { id: 'guide', name: 'คู่มือและขั้นตอนการปรับโครงสร้างหนี้', container: 'container-guide', pagination: 'pager-guide' },
    { id: 'form', name: 'แบบฟอร์มคำขอและคำร้อง', container: 'container-form', pagination: 'pager-form' },
    { id: 'document', name: 'รายการเอกสารที่ต้องเตรียม', container: 'container-doc', pagination: 'pager-doc' }
];

/**
 * 2. กรองข้อมูล (ปรับปรุงการเปรียบเทียบเลขเดือน)
 */
const prepareDataByCategory = (categoryId, month = 'all', year = 'all') => {
    let filtered = cachedData.filter(item => item.category === categoryId);

    if (year !== 'all') {
        filtered = filtered.filter(item => new Date(item.publishedDate).getFullYear().toString() === year);
    }
    if (month !== 'all') {
        filtered = filtered.filter(item => {
            const m = (new Date(item.publishedDate).getMonth() + 1).toString();
            // ใช้ parseInt เพื่อตัดปัญหา "05" vs "5"
            return parseInt(m) === parseInt(month);
        });
    }

    return filtered.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
};

/**
 * 3. สร้าง Configuration สำหรับแต่ละ Engine
 */
const createConfig = (cat, initialData) => ({
    data: initialData,
    containerId: cat.container,
    paginationId: cat.pagination,
    itemsPerPage: 4, // ปรับตามความเหมาะสมของ UI
    renderTemplate: (item) => `
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card card--announcement h-100">
                <div class="card__body">
                    <h3 class="card__title">${item.title}</h3>
                    <time class="card__date">${item.displayDate}</time>
                </div>
                <div class="card__footer">
                    <div class="card__actions">
                        <a href="/files/${item.file.th}.pdf" target="_blank" class="btn btn--file btn--file-view">
                            <span class="btn__icon">
                                <svg class="icon"><use xlink:href="#icon-view"></use></svg>
                            </span>
                            <span class="btn__text">ดูออนไลน์</span>
                        </a>
                        <a href="/files/${item.file.th}.pdf" download class="btn btn--file btn--file-download">
                            <span class="btn__icon">
                                <svg class="icon"><use xlink:href="#icon-download"></use></svg>
                            </span>
                            <span class="btn__text">ดาวน์โหลด</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `
});

/**
 * 4. Setup Engine (เพิ่ม Debug Log)
 */
const setupAllEngines = async () => {
    console.log("1. setupAllEngines เริ่มทำงาน");
    try {
        if (cachedData.length === 0) {
            const response = await getData();
            console.log("2. ดึงข้อมูลสำเร็จ:", response);
            cachedData = response?.assetFormData || [];
            // บรรทัดนี้จะทำให้คุณพิมพ์ window.cachedData ใน console เจอ
            window.cachedData = cachedData; 
        }

        if (cachedData.length === 0) {
            console.error("3. ข้อมูลใน assetFormData ว่างเปล่า!");
            return;
        }

        const m = document.getElementById('filter-month')?.value || 'all';
        const y = document.getElementById('filter-year')?.value || 'all';

        CATEGORIES.forEach(cat => {
            const container = document.getElementById(cat.container);
            if (!container) return;

            const data = prepareDataByCategory(cat.id, m, y);
            console.log(`4. หมวดหมู่ ${cat.id} พบข้อมูล ${data.length} รายการ`);

            engineInstances[cat.id] = initListEngine(createConfig(cat, data));
            engineInstances[cat.id].render(1);
        });
    } catch (err) {
        console.error("เกิดข้อผิดพลาดในระบบ:", err);
    }
};

/**
 * 5. Handle Filtering (อัปเดตทุก Engine พร้อมกัน)
 */
const handleFilter = () => {
    const m = document.getElementById('filter-month')?.value || 'all';
    const y = document.getElementById('filter-year')?.value || 'all';

    CATEGORIES.forEach(cat => {
        if (engineInstances[cat.id]) {
            const newData = prepareDataByCategory(cat.id, m, y);
            engineInstances[cat.id].updateData(newData);
            engineInstances[cat.id].render(1);
        }
    });

    window.history.pushState({ m, y }, '', `?month=${m}&year=${y}`);
};

// --- Initialization ---
// ย้าย Event Listeners มาไว้ในฟังก์ชันแยก
const bindEvents = () => {
    document.getElementById('filter-month')?.addEventListener('change', handleFilter);
    document.getElementById('filter-year')?.addEventListener('change', handleFilter);
    console.log("5. ผูก Event Listeners เรียบร้อย");
};

const init = async () => {
    console.log("0. Init เริ่มรัน");
    await setupAllEngines();
    bindEvents();
};

// ตรวจสอบสถานะการโหลดของหน้าเว็บ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // ถ้าหน้าโหลดเสร็จแล้ว (interactive/complete) ให้รันทันที
}