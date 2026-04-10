import { getData } from '/js/core/utils.js';
import { initListEngine } from '/js/shared/list-renderer.js';

let cachedData = []; // เก็บข้อมูลที่ fetch มาแล้ว

/**
 * 1. เตรียมและกรองข้อมูล
 */
const prepareData = (month = 'all', year = 'all') => {
    let filtered = [...cachedData];

    if (year !== 'all') {
        filtered = filtered.filter(item => new Date(item.publishedDate).getFullYear().toString() === year);
    }
    if (month !== 'all') {
        filtered = filtered.filter(item => (new Date(item.publishedDate).getMonth() + 1).toString() === month);
    }

    // เรียงลำดับจากใหม่ไปเก่า
    return filtered.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
};

/**
 * 2. Configuration สำหรับ List Engine
 */
const getDataConfig = () => ({
    data: prepareData(
        document.getElementById('filter-month')?.value || 'all',
        document.getElementById('filter-year')?.value || 'all'
    ),
    containerId: 'interest-rate-container',
    paginationId: 'interest-rate-pagination',
    itemsPerPage: 12,
    urlPath: '/announcement/interest-rate/page',
    renderTemplate: (item) => `
            <div class="card card--announcement h-100">
                <div class="card__body">
                    <time class="card__date">${item.displayDate}</time>
                    <h3 class="card__title">${item.title}</h3>
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
    `
});

/**
 * 3. ฟังก์ชันเริ่มต้นระบบ (Setup)
 */
const setupInterestEngine = async () => {
    const container = document.getElementById('interest-rate-container');
    if (!container) return;

    // ดึงข้อมูลครั้งแรกถ้ายังไม่มี
    if (cachedData.length === 0) {
        const response = await getData();
        cachedData = response?.interestRateData || [];
    }

    window.interestEngine = initListEngine(getDataConfig());
    const initialPage = window.interestEngine.getInitialPage();
    window.interestEngine.render(initialPage);
};

/**
 * 4. จัดการ Lifecycle และ Event Listeners
 */
const init = () => {
    setupInterestEngine();

    const monthSelect = document.getElementById('filter-month');
    const yearSelect = document.getElementById('filter-year');

    const handleFilter = () => {
        const m = monthSelect?.value || 'all';
        const y = yearSelect?.value || 'all';
        const newData = prepareData(m, y);

        if (window.interestEngine) {
            window.interestEngine.updateData(newData);
            window.interestEngine.render(1); // กลับไปหน้า 1 เสมอเมื่อ filter
            // อัปเดต URL เผื่อกรณีแชร์ลิงก์
            window.history.pushState({ page: 1 }, '', `?month=${m}&year=${y}`);
        }
    };

    monthSelect?.addEventListener('change', handleFilter);
    yearSelect?.addEventListener('change', handleFilter);
};

// รันเมื่อ DOM พร้อม
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// สำหรับกรณีใช้ปุ่ม Back ของ Browser
window.addEventListener('pageshow', (event) => {
    if (event.persisted) setupInterestEngine();
});