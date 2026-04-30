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
    containerId: 'asset-form-container',
    paginationId: 'asset-form-pagination',
    itemsPerPage: 12,
    urlPath: '/npa/download/page',
    renderTemplate: (item) => `
            <a href="/survey/website-usage" class="card card--announcement h-100">
                <div class="card__body">
                    <h3 class="card__title mb-5">${item.title}</h3>
                    <time class="card__date">${item.displayDate}</time>
                </div>
            </a>
    `
});

/**
 * 3. ฟังก์ชันเริ่มต้นระบบ (Setup)
 */
const setupDownloadEngine = async () => {
    const container = document.getElementById('asset-form-container');
    if (!container) return;

    // ดึงข้อมูลครั้งแรกถ้ายังไม่มี
    if (cachedData.length === 0) {
        const response = await getData();
        cachedData = response?.surveyListData || [];
    }

    window.downloadEngine = initListEngine(getDataConfig());
    const initialPage = window.downloadEngine.getInitialPage();
    window.downloadEngine.render(initialPage);
};

/**
 * 4. จัดการ Lifecycle และ Event Listeners
 */
const init = () => {
    setupDownloadEngine();

    const monthSelect = document.getElementById('filter-month');
    const yearSelect = document.getElementById('filter-year');

    const handleFilter = () => {
        const m = monthSelect?.value || 'all';
        const y = yearSelect?.value || 'all';
        const newData = prepareData(m, y);

        if (window.downloadEngine) {
            window.downloadEngine.updateData(newData);
            window.downloadEngine.render(1); // กลับไปหน้า 1 เสมอเมื่อ filter
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
    if (event.persisted) setupDownloadEngine();
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-survey');
    const formWrapper = document.getElementById('survey-form-wrapper');
    const resultWrapper = document.getElementById('survey-result-wrapper');
    // const avgScoreEl = document.getElementById('avg-score');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            // จำลองฐานข้อมูล (ในที่นี้เรานับจากฟอร์มที่เพิ่งส่ง + ค่าสมมติเพื่อให้เห็นภาพแบบในรูป)
            const votes = {
                v4: 14, // ดีมาก
                v3: 10, // ดี
                v2: 4,  // ปานกลาง
                v1: 1   // ควรปรับปรุง
            };

            // คำนวณยอดรวม
            const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
            document.getElementById('res_total_votes').innerText = totalVotes;

            // อัปเดต UI แต่ละแถว
            const updatePollBar = (vKey) => {
                const count = votes[vKey];
                const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                
                document.getElementById(`count_${vKey}`).innerText = count;
                const bar = document.getElementById(`bar_${vKey}`);
                bar.style.width = percent + '%';
                
                // ถ้าเป็นข้อที่คะแนนสูงสุด (ในรูปคือ 'ดีมาก') ให้ใส่สีเขียวเข้ม
                // if (vKey === 'v4') {
                //     bar.style.backgroundColor = '#285e3e';
                //     bar.parentElement.previousElementSibling.firstElementChild.style.color = '#fff'; // ปรับสี Text ถ้าจำเป็น
                // }
            };

            ['v4', 'v3', 'v2', 'v1'].forEach(updatePollBar);

            formWrapper.style.display = 'none';
            resultWrapper.style.display = 'block';
        });
    }
});