import { newsData } from './data.js';
import { initListEngine } from './listEngine.js';

// 1. ฟังก์ชันเตรียมข้อมูล (เหมือนเดิม)
const prepareNewsData = (month = 'all', year = 'all') => {
    let allNews = newsData.pressReleases;
    if (year !== 'all') {
        allNews = allNews.filter(item => new Date(item.date).getFullYear().toString() === year);
    }
    if (month !== 'all') {
        allNews = allNews.filter(item => (new Date(item.date).getMonth() + 1).toString() === month);
    }
    return allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// 2. Configuration ก้อนเดิม
const getNewsConfig = () => ({
    data: prepareNewsData(
        document.getElementById('filter-month')?.value || 'all',
        document.getElementById('filter-year')?.value || 'all'
    ),
    containerId: 'news-container',
    paginationId: 'news-pagination',
    itemsPerPage: 6,
    urlPath: '/news/page',
    renderTemplate: (item) => `
        <div class="card card--news">
            <div class="card__figure">
                <img src="${item.thumbnail || '/media/images/news/default.jpg'}" class="card__image" alt="${item.title}">
            </div>
            <div class="card__body">
                <time class="card__date">${item.displayDate}</time>
                <h5 class="card__title">${item.title}</h5>
            </div>
            <a href="/news/${item.id}/${item.slug}" class="stretched-link"></a>
        </div>
    `
});

/**
 * 3. ฟังก์ชันจุดระเบิด (Safe Setup)
 * เพิ่มการตรวจสอบ DOM และใช้ setTimeout เพื่อหน่วงเวลาให้ Browser วาด Container ให้เสร็จ
 */
const setupNewsEngine = () => {
    const container = document.getElementById('news-container');

    // ถ้ายังไม่เจอ Container ให้รอ 50ms แล้วลองใหม่ (แก้ปัญหา Refresh/Back Error)
    if (!container) {
        setTimeout(setupNewsEngine, 50);
        return;
    }

    // เมื่อมั่นใจว่ามี Container แน่ๆ ค่อยเริ่มรัน Engine
    window.newsEngine = initListEngine(getNewsConfig());
    const currentPage = window.newsEngine.getInitialPage();
    window.newsEngine.render(currentPage);
};

// --- เปลี่ยนจากการเรียก setupNewsEngine() ลอยๆ มาใส่ในเงื่อนไขที่ปลอดภัยกว่า ---

/**
 * 4. จัดการ Lifecycle ของหน้าจอ
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNewsEngine);
} else {
    setupNewsEngine();
}

// กรณี Back Button
window.addEventListener('pageshow', (event) => {
    setupNewsEngine();
});

/**
 * 5. ส่วน Filter (เหมือนเดิม)
 */
document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('filter-month');
    const yearSelect = document.getElementById('filter-year');

    const handleFilter = () => {
        const m = monthSelect?.value || 'all';
        const y = yearSelect?.value || 'all';
        const newData = prepareNewsData(m, y);

        if (window.newsEngine) {
            window.newsEngine.updateData(newData);
            window.newsEngine.render(1);
            window.history.pushState({ page: 1 }, '', '/news');
        }
    };

    if (monthSelect) monthSelect.addEventListener('change', handleFilter);
    if (yearSelect) yearSelect.addEventListener('change', handleFilter);
});

window.renderNewsContent = (page) => {
    if (window.newsEngine) window.newsEngine.render(page);
};