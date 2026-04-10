import { getData } from '/js/core/utils.js';
import { initListEngine } from '/js/shared/list-renderer.js';

let cachedData = []; // เก็บข้อมูลที่ fetch มาแล้ว

/**
 * 1. Logic การกรองข้อมูลขั้นสูง
 */
const prepareProcurementData = () => {
    const keyword = document.getElementById('search-keyword')?.value.toLowerCase() || '';
    const method = document.getElementById('filter-method')?.value || 'all';
    const type = document.getElementById('filter-type')?.value || 'all';
    const dateStart = document.getElementById('filter-date-start')?.value || '';
    const budgetYear = document.getElementById('filter-budget-year')?.value || 'all';

    return cachedData.filter(item => {
        const matchKeyword = item.title.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword);
        const matchMethod = method === 'all' || item.method === method;
        const matchType = type === 'all' || item.type === type;
        const matchBudgetYear = budgetYear === 'all' || item.budgetYear === budgetYear;

        // กรองด้วยวันที่ (ถ้าเลือก)
        let matchDate = true;
        if (dateStart) {
            matchDate = new Date(item.publishedDate) >= new Date(dateStart);
        }

        return matchKeyword && matchMethod && matchType && matchBudgetYear && matchDate;
    }).sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
};

/**
 * 2. Setup Flatpickr & Events
 */
const initFilters = () => {
    // ตั้งค่า Flatpickr
    flatpickr("#filter-date-start", {
        dateFormat: "Y-m-d",
        locale: "th", // ต้องโหลด locale th เพิ่มถ้าต้องการแสดงเดือนไทย
    });

    const triggerSearch = () => {
        const filtered = prepareProcurementData();
        if (window.procurementEngine) {
            window.procurementEngine.updateData(filtered);
            window.procurementEngine.render(1);
        }
    };

    // ค้นหาเมื่อคลิกปุ่มหรือกด Enter ในช่องค้นหา
    document.getElementById('btn-search')?.addEventListener('click', triggerSearch);
    document.getElementById('search-keyword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerSearch();
    });

    // ล้างค่า Filter
    document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
        document.querySelectorAll('.form-control, .form-select').forEach(el => el.value = el.tagName === 'SELECT' ? 'all' : '');
        triggerSearch();
    });
};

const setupProcurementEngine = async () => {
    if (cachedData.length === 0) {
        const response = await getData();
        cachedData = response?.procurementData || [];
    }

    window.procurementEngine = initListEngine({
        data: prepareProcurementData(),
        containerId: 'procurement-container',
        paginationId: 'procurement-pagination',
        itemsPerPage: 12,
        urlPath: '/announcement/procurement/page',
        renderTemplate: (item) => `
                <div class="card card--announcement h-100">
                    <div class="card__body">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="card__date">${item.type}</span>
                            <small class="card__date">${item.displayDate}</small>
                        </div>
                        <h5 class="card__title">${item.title}</h5>
                        <p class="card__text">วิธีจัดซื้อ: ${item.method}</p>
                        <p class="card__text mb-3">ปีงบประมาณ: ${item.budgetYear}</p>
                    </div>
                    <div class="card__footer">
                        <a href="/announcement/procurement/${item.id}/${item.slug}" class="btn btn--hover btn--gray">
                            <span class="btn__text">รายละเอียด</span>
                            <span class="btn__icon">
                                <svg class="icon"><use xlink:href="#icon-arrow-explore"></use></svg>
                            </span>
                        </a>
                    </div>
                </div>
        `
    });
    window.procurementEngine.render(1);
};

// Start
initFilters();
setupProcurementEngine();
