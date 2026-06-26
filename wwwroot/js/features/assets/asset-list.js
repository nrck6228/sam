import { compareList, toggleCompareAsset, updateCompareUI } from '/js/features/compare/compare-service.js';
import { brochureList, toggleBrochureAsset, updateBrochureUI } from '/js/features/compare/brochure-service.js';
import { assetListData, allAssetTypeData } from '/js/data/data.js';

// --- Configuration ---
const DEFAULT_ITEMS_PER_PAGE = 20;

// อ่านจำนวนแสดงต่อหน้าจาก URL (?perPage=N) ถ้าไม่มี/ไม่ถูกต้อง ใช้ค่าเริ่มต้น
// ไม่จำกัดจำนวนสูงสุด ผู้ใช้กรอกได้ตามต้องการ
const getItemsPerPage = () => {
    const params = new URLSearchParams(window.location.search);
    const val = parseInt(params.get('perPage'), 10);
    if (isNaN(val) || val < 1) return DEFAULT_ITEMS_PER_PAGE;
    return val;
};

const STATUS_CONFIG = {
    1: { label: 'ซื้อตรง', class: 'card__badge--direct' },
    2: { label: 'ขายทอดตลาด', class: 'card__badge--auction' },
    3: { label: 'รอประกาศราคา', class: 'card__badge--waiting' }
};

// --- Helpers ---
const typeMap = allAssetTypeData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});

const getAreaValue = (asset) => {
    const { area, unit } = asset;
    if (!area) return 0;
    if (typeof area === 'string' && area.includes('-')) {
        const [rai, ngan, wah] = area.split('-').map(v => parseFloat(v) || 0);
        return (rai * 400) + (ngan * 100) + wah;
    }
    const val = parseFloat(area) || 0;
    const conversion = {
        'ไร่': 400, 'งาน': 100, 'ตารางวา': 1, 'ตร.ว.': 1, 'ตร.ว': 1,
        'ตารางเมตร': 0.25, 'ตร.ม.': 0.25, 'ตร.ม': 0.25
    };
    return val * (conversion[unit] || 1);
};

const sortAssets = (data, criteria) => {
    const sorted = [...data];
    return sorted.sort((a, b) => {
        switch (criteria) {
            case 'price-asc': return a.totalPrice - b.totalPrice;
            case 'price-desc': return b.totalPrice - a.totalPrice;
            case 'size-asc': return getAreaValue(a) - getAreaValue(b);
            case 'size-desc': return getAreaValue(b) - getAreaValue(a);
            case 'code-asc': return a.assetCode.localeCompare(b.assetCode, undefined, { numeric: true });
            case 'code-desc': return b.assetCode.localeCompare(a.assetCode, undefined, { numeric: true });
            default: return b.id - a.id; // newest
        }
    });
};

const getCurrentPage = () => {
    const segments = window.location.pathname.split('/');
    const pageIdx = segments.indexOf('page');
    return pageIdx !== -1 ? parseInt(segments[pageIdx + 1]) : 1;
};

// --- 1. ระบบคำพ้องความหมาย (Fuzzy Logic) ---
const SEARCH_SYNONYMS = {
    'ที่ดิน': ['ที่ดินเปล่า', 'ถมแล้ว', 'สวน', 'ไร่'],
    'บ้าน': ['บ้านเดี่ยว', 'บ้านแฝด', 'วิลล่า', 'home'],
    'คอนโด': ['ห้องชุด', 'อาคารชุด', 'เซอราโน่', 'condo'],
    'ทาวน์โฮม': ['ทาวน์เฮ้าส์', 'townhome', 'townhouse'],
    'ตึก': ['อาคารพาณิชย์', 'ตึกแถว', 'shophouse']
};

/**
 * ฟังก์ชันช่วยขยาย Keyword ให้ครอบคลุมคำใกล้เคียง
 */
const expandKeywords = (keyword) => {
    let queries = [keyword];
    for (const [main, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
        if (keyword.includes(main) || synonyms.some(s => keyword.includes(s))) {
            queries.push(main, ...synonyms);
        }
    }
    return [...new Set(queries)]; // คืนค่าเฉพาะคำที่ไม่ซ้ำกัน
};

// --- Core Logic: Filtering ---
const performAssetFiltering = () => {
    const params = new URLSearchParams(window.location.search);

    // --- แก้จาก .get เป็น .getAll ---
    const rawTypes = params.getAll('types');

    // เทคนิคการรวมร่าง: ไม่ว่าจะมาแบบ "9,11" หรือ ["9", "11"] มันจะกลายเป็น [9, 11] เสมอ
    const selectedTypes = rawTypes.length > 0
        ? rawTypes.join(',').split(',').map(Number).filter(n => n > 0)
        : [];

    // ทำแบบเดียวกันกับ provinces (ถ้ามี)
    const rawProvinces = params.getAll('provinces');
    const selectedProvinces = rawProvinces.length > 0
        ? rawProvinces.join(',').split(',').map(Number).filter(n => n > 0)
        : [];

    const rawKeyword = params.get('keyword')?.trim().toLowerCase() || "";
    const expandedQueries = typeof expandKeywords === 'function' ? expandKeywords(rawKeyword) : [rawKeyword];

    return assetListData.filter(asset => {
        // --- 1. กรองด้วยประเภททรัพย์ ---
        if (selectedTypes.length > 0) {
            // เช็คว่า ID ของทรัพย์ อยู่ใน Array [9, 11] หรือไม่
            if (!selectedTypes.includes(Number(asset.typeId))) return false;
        }

        // --- 2. กรองด้วยจังหวัด ---
        if (selectedProvinces.length > 0) {
            if (!selectedProvinces.includes(Number(asset.provinceId))) return false;
        }

        // --- 3. กรองด้วย Keyword ---
        if (rawKeyword) {
            const assetType = typeMap[asset.typeId];
            const typeName = assetType?.typeName?.toLowerCase() || "";
            const isMatch = expandedQueries.some(q =>
                (asset.assetCode && asset.assetCode.toLowerCase().includes(q)) ||
                (asset.assetName && asset.assetName.toLowerCase().includes(q)) ||
                (asset.location && asset.location.toLowerCase().includes(q)) ||
                (typeName.includes(q))
            );
            if (!isMatch) return false;
        }
        return true;
    });
};

// --- Core Logic: Rendering ---
const renderAssetList = (data) => {
    const container = document.getElementById('asset-result-list');
    const paginationEl = document.getElementById('asset-pagination');
    const countEl = document.getElementById('asset-count');
    const sortSelect = document.getElementById('sort-criteria');

    if (!container) return;

    // Apply Sorting
    // อ่านค่าจาก URL ก่อน (กัน select ยังไม่ถูกตั้งค่าตอน render รอบแรก) แล้วค่อย fallback ไป select
    const sortParam = new URLSearchParams(window.location.search).get('sort');
    const currentSort = sortParam || (sortSelect ? sortSelect.value : 'newest');
    if (sortSelect && sortParam) sortSelect.value = sortParam; // sync ให้ select แสดงค่าที่ถูกต้อง
    const sortedData = sortAssets(data, currentSort);

    // Update Counter
    if (countEl) countEl.innerText = sortedData.length.toLocaleString();

    // Handle Empty State
    if (sortedData.length === 0) {
        container.innerHTML = `
        <div class="col-12 d-flex justify-content-center align-items-center w-100" style="min-height: 400px;">
            <div class="text-center p-5">
                <div class="mb-4">
                    <svg class="icon icon--lg text-gray" style="width: 80px; height: 80px; opacity: 0.3;">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <h4 class="fw-bold">ไม่พบข้อมูลทรัพย์สิน</h4>
                <p class="text-muted">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
                <a href="/" class="btn btn--hover btn--pink mt-3 px-4">กลับไปหน้าแรก</a>
            </div>
        </div>`;
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }

    // Pagination Logic
    const itemsPerPage = getItemsPerPage();
    const currentPage = getCurrentPage();
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

    // Build HTML
    container.innerHTML = paginatedItems.map(asset => {
        const status = STATUS_CONFIG[asset.statusId] || { label: '', class: '' };
        const priceText = asset.statusId === 3 ? 'ติดต่อเจ้าหน้าที่' : `${asset.totalPrice.toLocaleString()} บาท`;
        const assetType = typeMap[asset.typeId];
        const iconName = assetType?.icon || 'land';
        const isChecked = compareList.includes(asset.id) ? 'checked' : '';
        const isBrochureChecked = brochureList.includes(asset.id) ? 'checked' : '';

        return `
            <div class="card card--asset">
                <div class="card__figure">
                    <img src="${asset.img}" alt="${asset.alt}" class="card__image" loading="lazy">
                    <div class="card__badge ${status.class}">${status.label}</div>
                </div>
                <div class="card__compare" style="position: relative; z-index: 2;">
                    <div class="form-check">
                        <input class="form-check-input compare-input" type="checkbox" id="chk-${asset.id}" data-id="${asset.id}" ${isChecked}>
                        <label class="form-check-label" for="chk-${asset.id}">เปรียบเทียบ</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input brochure-input" type="checkbox" id="brc-${asset.id}" data-id="${asset.id}" ${isBrochureChecked}>
                        <label class="form-check-label" for="brc-${asset.id}">โบรชัวร์</label>
                    </div>
                </div>
                <div class="card__body">
                    <div class="card__code">
                        <div class="card__code-text">รหัสทรัพย์สิน</div>
                        <div class="card__code-text">${asset.assetCode}</div>
                    </div>
                    <div class="card__type">
                        <div class="card__type-icon"><svg class="icon"><use xlink:href="#icon-${iconName}"></use></svg></div>
                        <div class="card__type-text">${assetType?.typeName || 'ทรัพย์สิน'}</div>
                    </div>
                    <div class="card__location">
                        <div class="card__type-icon"><svg class="icon"><use xlink:href="#icon-placeholder"></use></svg></div>
                        <div class="card__location-text">${asset.location}</div>
                    </div>
                    <div class="card__area">
                        <div class="card__type-icon"><svg class="icon"><use xlink:href="#icon-expand"></use></svg></div>
                        <div class="card__area-text">${asset.area ? `${asset.area} ${asset.unit}` : '-'}</div>
                    </div>
                    <div class="card__price">${priceText}</div>
                </div>
                <a href="/asset-detail/${asset.assetCode}" class="stretched-link"></a>
            </div>`;
    }).join('');

    // Pagination Render
    const urlPath = window.location.pathname.replace(/\/page\/\d+/, '');
    renderPagination(totalPages, currentPage, urlPath, paginationEl);
};

const renderPagination = (totalPages, currentPage, urlPath, paginationEl) => {
    if (!paginationEl || totalPages <= 1) {
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }
    const search = window.location.search;
    const getUrl = (p) => p === 1 ? `${urlPath}${search}` : `${urlPath}/page/${p}${search}`;

    let html = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="${getUrl(1)}"><svg class="icon"><use xlink:href="#icon-first"></use></svg></a></li>
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="${getUrl(currentPage - 1)}"><svg class="icon"><use xlink:href="#icon-previous"></use></svg></a></li>
    `;
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="${getUrl(i)}">${i}</a></li>`;
    }
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="${getUrl(currentPage + 1)}"><svg class="icon"><use xlink:href="#icon-next"></use></svg></a></li>
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="${getUrl(totalPages)}"><svg class="icon"><use xlink:href="#icon-last"></use></svg></a></li>
    `;
    paginationEl.innerHTML = html;
};

// --- Initialization ---
// แถบล่างจะแสดงเมื่อมีรายการในลิสต์ใดลิสต์หนึ่ง (เปรียบเทียบ หรือ โบรชัวร์)
const refreshCompareBar = () => {
    const bar = document.getElementById('compare-sticky-bar');
    if (bar) bar.classList.toggle('active', compareList.length > 0 || brochureList.length > 0);
};
// เปิดให้ service ทั้งสองเรียกใช้ผ่าน window
window.refreshCompareBar = refreshCompareBar;

// สลับแท็บในแถบล่าง (เปรียบเทียบ / โบรชัวร์)
const switchBarTab = (tab) => {
    document.querySelectorAll('.compare--tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.compare--panel').forEach(panel => {
        panel.classList.toggle('d-none', panel.dataset.panel !== tab);
    });
};

const setupEvents = () => {
    document.addEventListener('change', (e) => {
        // เลือกเพื่อเปรียบเทียบ
        if (e.target.classList.contains('compare-input')) {
            const assetId = parseInt(e.target.dataset.id);
            if (!toggleCompareAsset(assetId)) e.target.checked = false;
        }
        // เลือกเพื่อสร้างโบรชัวร์
        if (e.target.classList.contains('brochure-input')) {
            const assetId = parseInt(e.target.dataset.id);
            if (!toggleBrochureAsset(assetId)) e.target.checked = false;
        }
    });

    // ปุ่มสลับแท็บในแถบล่าง
    document.querySelectorAll('.compare--tab').forEach(btn => {
        btn.addEventListener('click', () => switchBarTab(btn.dataset.tab));
    });

    const sortSelect = document.getElementById('sort-criteria');
    if (sortSelect) {
        // คืนค่าที่เคยเลือกจาก URL (ป้องกัน select รีเซ็ตเป็น newest หลัง reload)
        const currentSort = new URLSearchParams(window.location.search).get('sort');
        if (currentSort) sortSelect.value = currentSort;

        sortSelect.addEventListener('change', () => {
            const params = new URLSearchParams(window.location.search);
            // บันทึกค่าจัดเรียงลง URL เพื่อให้คงอยู่หลัง reload
            params.set('sort', sortSelect.value);
            // เมื่อเปลี่ยน Sort ให้กลับไปหน้า 1 เพื่อป้องกันความสับสน
            window.location.href = window.location.pathname.replace(/\/page\/\d+/, '') + "?" + params.toString();
        });
    }

    // จำนวนแสดงต่อหน้า (กรอกตัวเลขเอง แล้วกด Enter หรือปุ่ม "ตกลง")
    const perPageInput = document.getElementById('items-per-page');
    const perPageApplyBtn = document.getElementById('items-per-page-apply');
    if (perPageInput) {
        // ตั้งค่าเริ่มต้นให้ตรงกับค่าใน URL
        perPageInput.value = getItemsPerPage();

        // อนุญาตเฉพาะตัวเลขขณะพิมพ์
        perPageInput.addEventListener('input', () => {
            perPageInput.value = perPageInput.value.replace(/\D/g, '');
        });

        const applyPerPage = () => {
            let val = parseInt(perPageInput.value, 10);
            if (isNaN(val) || val < 1) val = DEFAULT_ITEMS_PER_PAGE;
            perPageInput.value = val; // sync ค่ากลับไปแสดง

            const params = new URLSearchParams(window.location.search);
            params.set('perPage', val);
            // เปลี่ยนจำนวนต่อหน้าแล้วกลับไปหน้า 1 เสมอ ป้องกันหน้าเกินช่วง
            window.location.href = window.location.pathname.replace(/\/page\/\d+/, '') + "?" + params.toString();
        };

        // กด Enter ในช่องกรอก
        perPageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPerPage();
            }
        });

        // กดปุ่มยืนยัน
        if (perPageApplyBtn) perPageApplyBtn.addEventListener('click', applyPerPage);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let finalData = [];

    // Helper: ฟังก์ชันเดียวจัดการ Breadcrumb ทั้งหมด
    const updateBreadcrumbUI = (text) => {
        const bcActive = document.querySelector('.breadcrumb-item.active');
        const bcText = document.getElementById('breadcrumb-current-text');
        if (bcActive) bcActive.textContent = text;
        if (bcText) bcText.textContent = text;
    };

    // 1. Determine Data Source & Update UI Text
    const kw = params.get('keyword');
    const rawTypes = params.getAll('types');
    const selectedTypes = rawTypes.length > 0 ? rawTypes.join(',').split(',').filter(v => v) : [];
    const mode = params.get('mode');

    if (kw || mode === 'normal' || selectedTypes.length > 0 || params.has('provinces')) {
        // 1. MODE: SEARCH (มีการกดค้นหามาจาก Search Panel)
        finalData = performAssetFiltering();
        const titleEl = document.getElementById('list-title');

        if (kw) {
            if (titleEl) titleEl.innerHTML = `ผลการค้นหา: <span class="text-pink">"${kw}"</span>`;
            updateBreadcrumbUI(`ค้นหา: ${kw}`);
        } else if (selectedTypes.length > 0) {
            const firstType = typeMap[selectedTypes[0]];
            const title = firstType ? firstType.typeName : "รายการทรัพย์สิน";
            document.getElementById('list-title').innerText = `รายการ${title}`;
            updateBreadcrumbUI(title);
        } else {
            document.getElementById('list-title').innerText = "ผลการค้นหาทรัพย์สิน";
            updateBreadcrumbUI("ผลการค้นหา");
        }

    } else if (typeof SELECTED_TYPE_ID !== 'undefined' && SELECTED_TYPE_ID !== null) {
        // 2. MODE: CATEGORY (กดมาจากหน้าแรกที่เป็นวงกลมประเภททรัพย์)
        finalData = assetListData.filter(item => item.typeId === SELECTED_TYPE_ID);
        const typeName = typeMap[SELECTED_TYPE_ID]?.typeName || "รายการทรัพย์สิน";
        document.getElementById('list-title').innerText = `ทรัพย์สินประเภท${typeName}`;
        updateBreadcrumbUI(typeName);

    } else {
        // 3. MODE: ALL (นี่คือส่วนที่เมนู "ค้นหาทรัพย์สิน" จะวิ่งเข้ามา)
        // แสดงทั้งหมด และ Sort ตาม ID ล่าสุด (ซึ่งทำอยู่ใน renderAssetList -> sortAssets อยู่แล้ว)
        finalData = assetListData;
        document.getElementById('list-title').innerText = "รายการทรัพย์สินทั้งหมด";
        updateBreadcrumbUI("รายการทรัพย์สิน");
    }

    // 2. Initialize UI
    renderAssetList(finalData);

    // อัปเดตตัวเลขจำนวนทรัพย์ทั้งหมด
    const totalCountEl = document.getElementById('total-assets-count');
    if (totalCountEl) totalCountEl.textContent = finalData.length;

    setupEvents();
    updateCompareUI();
    updateBrochureUI();
    refreshCompareBar();
});