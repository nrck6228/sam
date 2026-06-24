const {
    serviceData = [],
    heroBannerData = [],
    assetListData = [],
    allAssetTypeData = [],
    districtData = [],
    nearbyData = [],
    newsData = {}
} = window.AppData || {};

/**
 * 1. UI Components & Templates
 * ฟังก์ชันสำหรับสร้าง HTML Markup
 */
const STATUS_CONFIG = {
    1: { label: 'ซื้อตรง', class: 'card__badge--direct' },
    2: { label: 'ขายทอดตลาด', class: 'card__badge--auction' },
    3: { label: 'รอประกาศราคา', class: 'card__badge--waiting' }
};

const typeMap = allAssetTypeData.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
}, {});

// ใช้ typeId จาก assetListData
const assetTypeIdLookup = allAssetTypeData.reduce((acc, item) => {
    acc[item.id] = item.icon;
    return acc;
}, {});

const getAssetIconById = (typeId) => {
    const iconName = assetTypeIdLookup[typeId] || 'land';
    return `<svg class="icon"><use xlink:href="#icon-${iconName}"></use></svg>`;
};

/**
 * 2. Render Functions
 */

const renderHeroSliders = (data) => {
    const container = document.querySelector('.swiper--home .swiper-wrapper');
    if (!container) return;

    container.innerHTML = data.map((item, index) => `
        <div class="swiper-slide">
            <div class="swiper--home__picture">
                <picture>
                    <source media="(min-width: 992px)" srcset="${item.desktopImg}">
                    <source media="(min-width: 320px)" srcset="${item.mobileImg}">
                    <img alt="${item.alt}" class="swiper--home__image" src="${item.desktopImg}" 
                         ${index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}>
                </picture>
            </div>
        </div>
    `).join('');

    initSwiper();
};

const renderQuickLinks = (data) => {
    const container = document.querySelector('#highlight-grid');
    if (!container) return;

    container.innerHTML = data.map((item, index) => `
        <div class="highlight__item" style="animation-delay: ${(index + 1) * 0.1}s">
            <a href="${item.url}" class="highlight__link">
                <div class="highlight__number">${item.id}</div>
                <div class="highlight__content-wrapper">
                    <span class="highlight__label">${item.label}</span>
                    <span class="highlight__icon"><svg class="icon"><use xlink:href="#icon-arrow-explore"></use></svg></span>
                </div>
            </a>
        </div>
    `).join('');

    initScrollReveal('.highlight');
};

const renderAssets = (provinceId) => {
    const container = document.getElementById('asset-list');
    if (!container) return;

    // แปลง provinceId ให้เป็น Number เพื่อความแม่นยำในการเปรียบเทียบ
    const targetId = Number(provinceId);

    // 1. กรองตาม ID -> 2. กลับด้านเอาใหม่ขึ้นก่อน -> 3. เอาแค่ 3 รายการ
    const filteredData = assetListData
        .filter(item => item.provinceId === targetId)
        .reverse()
        .slice(0, 3);

    // กรณีไม่พบทรัพย์สิน (แสดงชื่อจังหวัดจากข้อมูลที่มีหรือ fallback)
    if (filteredData.length === 0) {
        container.innerHTML = `<div class="col-12 text-center p-5 text-muted">ไม่พบทรัพย์สินในพื้นที่ที่เลือก</div>`;
        return;
    }

    container.innerHTML = filteredData.map(asset => {
        const typeInfo = typeMap[asset.typeId];
        const status = STATUS_CONFIG[asset.statusId] || { label: 'ไม่ทราบสถานะ', class: '' };

        const isWaiting = asset.statusId === 3;
        const priceText = isWaiting ? 'ติดต่อเจ้าหน้าที่' : `${asset.totalPrice.toLocaleString()} บาท`;

        const iconHtml = typeInfo
            ? `<div class="card__type-icon">${getAssetIconById(asset.typeId)}</div>`
            : '';

        const detailUrl = `/asset-detail/${asset.assetCode}`;

        return `
                <div class="card card--asset">
                    <div class="card__figure">
                        <img src="${asset.img}" alt="${asset.alt}" class="card__image" />
                        <div class="card__badge ${status.class}">${status.label}</div>
                    </div>
                    <div class="card__body">
                        <div class="card__type">
                            ${iconHtml}
                            <div class="card__type-text">
                                ${typeInfo ? typeInfo.typeName : 'ไม่ระบุประเภท'}
                            </div>
                        </div>
                        <div class="card__location">
                            <div class="card__location-text">${asset.location}</div>
                        </div>
                        <div class="card__price">${priceText}</div>
                    </div>
                    <a href="${detailUrl}" class="stretched-link" title="ดูรายละเอียด ${asset.assetCode}"></a>
                </div>
        `;
    }).join('');
};

/**
 * --- SHARED HELPERS ---
 * ฟังก์ชันพวกนี้ประกาศครั้งเดียว ใช้ร่วมกันได้ทั้ง 3 ชุด
 */
const getStatusConfig = (statusId) => {
    const config = {
        1: { label: 'ทรัพย์เด่น', class: 'badge-success' },
        2: { label: 'ขายแล้ว', class: 'badge-danger' },
        3: { label: 'รอราคา', class: 'badge-warning' }
    };
    return config[statusId] || { label: 'ไม่ระบุ', class: 'badge-gray' };
};

/**
 * --- CORE RENDER ENGINE ---
 * ฟังก์ชันหลักที่ใช้ควบคุมการไหลของข้อมูล
 */
/**
 * @param {number} provinceId - ID จังหวัด
 * @param {string} containerId - ID ของ HTML Element ที่จะแสดงผล
 * @param {string} templateType - รูปแบบดีไซน์ (STYLE_A, B, C)
 * @param {number} limit - จำนวนรายการที่ต้องการแสดง (ใส่ 0 หรือ null ถ้าจะเอาทั้งหมด)
 */
const masterRenderer = (provinceId, containerId, templateType, limit = 3) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const targetId = Number(provinceId);
    
    // 1. กรองข้อมูล
    let filteredData = assetListData.filter(item => item.provinceId === targetId);

    // 2. กลับด้านข้อมูล (เอาใหม่ขึ้นก่อน)
    filteredData.reverse();

    // 3. ตั้งค่าจำนวนข้อมูล (ถ้า limit เป็น 0 จะไม่ตัดข้อมูล)
    if (limit > 0) {
        filteredData = filteredData.slice(0, limit);
    }

    if (filteredData.length === 0) {
        container.innerHTML = `<div class="text-center p-4">ไม่พบข้อมูลในพื้นที่นี้</div>`;
        return;
    }

    // 4. Render ตาม Template
    container.innerHTML = filteredData.map(asset => {
        if (templateType === 'STYLE_A') return templateA(asset);
        if (templateType === 'STYLE_B') return templateB(asset);
        if (templateType === 'STYLE_C') return templateC(asset);
    }).join('');
};

/**
 * --- DESIGN TEMPLATES ---
 * แยก HTML Design ออกจาก Logic
 */

// แบบที่ 1: การ์ดมาตรฐาน (โค้ดเดิมของคุณ)
const templateA = (asset) => {
    const typeInfo = typeMap[asset.typeId];
    const status = STATUS_CONFIG[asset.statusId] || { label: 'ไม่ทราบสถานะ', class: '' };

    const isWaiting = asset.statusId === 3;
    const priceText = isWaiting ? 'ติดต่อเจ้าหน้าที่' : `${asset.totalPrice.toLocaleString()} บาท`;

    const iconHtml = typeInfo
        ? `<div class="card__type-icon">${getAssetIconById(asset.typeId)}</div>`
        : '';

    const detailUrl = `/asset-detail/${asset.assetCode}`;

    return `
            <div class="card card--asset">
                <div class="card__figure">
                    <img src="${asset.img}" alt="${asset.alt}" class="card__image" />
                    <div class="card__badge ${status.class}">${status.label}</div>
                </div>
                <div class="card__body">
                    <div class="card__type">
                        ${iconHtml}
                        <div class="card__type-text">
                            ${typeInfo ? typeInfo.typeName : 'ไม่ระบุประเภท'}
                        </div>
                    </div>
                    <div class="card__location">
                        <div class="card__location-text">${asset.location}</div>
                    </div>
                    <div class="card__price">${priceText}</div>
                </div>
                <a href="${detailUrl}" class="stretched-link" title="ดูรายละเอียด ${asset.assetCode}"></a>
            </div>
    `;
};

// แบบที่ 2: แถวแนวนอน (Minimal List)
const templateB = (asset) => {
    const typeInfo = typeMap[asset.typeId];
    const status = STATUS_CONFIG[asset.statusId] || { label: 'ไม่ทราบสถานะ', class: '' };

    const isWaiting = asset.statusId === 3;
    const priceText = isWaiting ? 'ติดต่อเจ้าหน้าที่' : `${asset.totalPrice.toLocaleString()} บาท`;

    const iconHtml = typeInfo
        ? `<div class="card__type-icon">${getAssetIconById(asset.typeId)}</div>`
        : '';

    const detailUrl = `/asset-detail/${asset.assetCode}`;

    return `
            <div class="card card--asset-full">
                <div class="card__figure">
                    <img src="${asset.img}" alt="${asset.alt}" class="card__image" />
                    <div class="card__badge ${status.class}">${status.label}</div>
                </div>
                <div class="card__body">
                    <div class="card__type">
                        ${iconHtml}
                        <div class="card__type-text">
                            ${typeInfo ? typeInfo.typeName : 'ไม่ระบุประเภท'}
                        </div>
                    </div>
                    <div class="card__location">
                        <div class="card__location-text">${asset.location}</div>
                    </div>
                    <div class="card__price">${priceText}</div>
                </div>
                <a href="${detailUrl}" class="stretched-link" title="ดูรายละเอียด ${asset.assetCode}"></a>
            </div>
    `;
};

// แบบที่ 3: เน้นภาพใหญ่ (Premium Grid)
const templateC = (asset) => {
    const typeInfo = typeMap[asset.typeId];
    const status = STATUS_CONFIG[asset.statusId] || { label: 'ไม่ทราบสถานะ', class: '' };

    const isWaiting = asset.statusId === 3;
    const priceText = isWaiting ? 'ติดต่อเจ้าหน้าที่' : `${asset.totalPrice.toLocaleString()} บาท`;

    const iconHtml = typeInfo
        ? `<div class="card__type-icon">${getAssetIconById(asset.typeId)}</div>`
        : '';

    const detailUrl = `/asset-detail/${asset.assetCode}`;

    return `
            <div class="card card--asset-full">
                <div class="card__figure">
                    <img src="${asset.img}" alt="${asset.alt}" class="card__image" />
                    <div class="card__badge ${status.class}">${status.label}</div>
                </div>
                <div class="card__body">
                    <div class="card__type">
                        ${iconHtml}
                        <div class="card__type-text">
                            ${typeInfo ? typeInfo.typeName : 'ไม่ระบุประเภท'}
                        </div>
                    </div>
                    <div class="card__location">
                        <div class="card__location-text">${asset.location}</div>
                    </div>
                    <div class="card__price">${priceText}</div>
                </div>
                <a href="${detailUrl}" class="stretched-link" title="ดูรายละเอียด ${asset.assetCode}"></a>
            </div>
    `;
};

/**
 * --- INITIALIZATION & EVENT LISTENERS ---
 * ผูกเหตุการณ์เมื่อกดเปลี่ยน Tab
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // ตั้งค่าเริ่มต้น (Default Render)
    masterRenderer(10, 'asset-list-1', 'STYLE_A', 3);
    masterRenderer(10, 'asset-list-2', 'STYLE_B', 4);
    masterRenderer(10, 'asset-list-3', 'STYLE_C', 3);

    // ผูก Event ให้แต่ละ Tab ชุด
    const setupTabEvent = (tabId, containerId, style, limitValue) => {
        const tabs = document.querySelectorAll(`${tabId} .nav-link`);
        tabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const pId = e.target.getAttribute('data-province-id');
                // ส่ง limitValue เข้าไปด้วย
                masterRenderer(pId, containerId, style, limitValue);
            });
        });
    };

    setupTabEvent('#assetTab1', 'asset-list-1', 'STYLE_A', 3);
    setupTabEvent('#assetTab2', 'asset-list-2', 'STYLE_B', 4);
    setupTabEvent('#assetTab3', 'asset-list-3', 'STYLE_C', 3);
});

const renderAssetShowcase = (data) => {
    const typeContainer = document.getElementById('asset-type');
    const tagsContainer = document.getElementById('asset-tag');
    if (!typeContainer || !tagsContainer) return;

    // --- เรียงลำดับจากมากไปน้อย ---
    const sortedData = [...data].sort((a, b) => b.count - a.count);

    typeContainer.innerHTML = sortedData.slice(0, 4).map(asset => `
        <a href="/npa/${asset.id}/${asset.slug}" title="${asset.typeName}" class="card card--type">
            <div class="card__figure">
            </div>
            <div class="card__wrap">
                <div class="card__header">
                    <svg class="icon-xl"><use xlink:href="#icon-${asset.icon}"></use></svg>
                    <div class="card__type">${asset.typeName}</div>
                </div>
                <div class="card__body">
                    <div class="card__count">${asset.count.toLocaleString()}</div>
                    <div class="card__unit">${asset.unit}</div>
                </div>
            </div>
        </a>
    `).join('');

    tagsContainer.innerHTML = sortedData.slice(4).map(asset => `
        <a href="/npa/${asset.id}/${asset.slug}" title="${asset.typeName}" class="asset-badge">
            <svg class="icon"><use xlink:href="#icon-${asset.icon}"></use></svg>
            <span>${asset.typeName}</span>
        </a>
    `).join('');
};

const renderAssetAreaList = () => {
    const container = document.querySelector('.asset-area .row');
    if (!container) return;

    const createColumn = (data, title) => `
        <div class="col-lg-6">
            <div class="asset-area__group">
                <h3 class="asset-area__title">${title}</h3>
                <ul class="asset-area__list">
                    ${data.map(item => `
                        <li><a href="/search?q=${encodeURIComponent(item.name)}" class="asset-area__link">${item.name}</a></li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    container.innerHTML = createColumn(districtData, 'ย่าน') + createColumn(nearbyData, 'ใกล้');
};

/**
 * ฟังก์ชันสำหรับ Render รายการข่าว/บทความ/วิดีโอ
 * @param {string} contentType - ประเภทข้อมูล ('pressReleases', 'articles', 'media')
 */
// สร้าง Cursor Follower ไว้ใน DOM(ทำครั้งเดียวตอนโหลดหน้า)
const setupPreview = () => {
    let followerEl = document.getElementById('hover-preview-container');
    if (!followerEl) {
        followerEl = document.createElement('div');
        followerEl.id = 'hover-preview-container';
        followerEl.className = 'hover-reveal';
        followerEl.innerHTML = `<span class="preview-text">อ่านต่อ</span>`;
        document.body.appendChild(followerEl);
    }
    return { container: followerEl };
};

// const renderNews = (contentType) => {
//     const container = document.getElementById('news-list');
//     const btnNewsAll = document.getElementById('btn-news-all');
//     if (!container) return;

//     const newsPreview = setupPreview();
//     // 1. ดึงข้อมูลดิบมาเก็บไว้ก่อน (pressReleases | articles | media)
//     const data = newsData[contentType] || [];

//     // 2. จัดการลำดับและจำนวน (Logic เพิ่มเติม)
//     const processedData = [...data] // ใช้ Spread operator เพื่อไม่ให้กระทบข้อมูลต้นฉบับ
//         .sort((a, b) => new Date(b.date) - new Date(a.date)) // เรียงใหม่ไปเก่า
//         .slice(0, 3); // 3 รายการล่าสุด

//     if (processedData.length === 0) {
//         container.innerHTML = `<div class="text-center py-5 w-100">ไม่พบข้อมูลในหมวดหมู่ข้างต้น</div>`;
//         return;
//     }

//     // Map ข้อมูลสำหรับปุ่ม "ดูทั้งหมด"
//     const configMap = {
//         'pressReleases': { path: 'news', label: 'ข่าวสารประชาสัมพันธ์' },
//         'articles': { path: 'article', label: 'บทความและวารสาร' },
//         'media': { path: 'video', label: 'วีดิโอ/สื่อประชาสัมพันธ์' } // เปลี่ยนจาก media เป็น video
//     };

//     const currentConfig = configMap[contentType] || { path: 'news', label: '' };
//     if (btnNewsAll) btnNewsAll.href = `/${currentConfig.path}`;

//     // 3. Render เฉพาะข้อมูลที่ผ่านการตัดแล้ว (processedData)
//     container.innerHTML = processedData.map(item => {
//         // เช็คว่าเป็นหมวดวิดีโอหรือไม่ เพื่อใส่ Icon Play ทับบนรูป
//         const isVideo = contentType === 'media';
//         let actionUrl = `/${currentConfig.path}/${item.id}/${item.slug}`;
//         let actionEvent = "";

//         if (isVideo && item.displayMode === "modal") {
//             actionUrl = "javascript:void(0);";
//             actionEvent = `onclick="openVideoModal('${item.videoUrl}')"`;
//         }
//         const thumb = item.thumbnail ? item.thumbnail : '';

//         return `
//             <div class="card card--news" data-hover-img="${item.thumbnail}"> <div class="card__figure">
//                     <img src="${item.thumbnail}" alt="${item.title}" class="card__image" loading="lazy">
//                     ${isVideo ? '<div class="card__video-overlay"><svg class="icon"><use xlink:href="#icon-youtube"></use></svg></div>' : ''}
//                 </div>
//                 <div class="card__body">
//                     <time datetime="${item.date}" class="card__date">${item.displayDate}</time>
//                     <h3 class="card__title">${item.title}</h3>
//                 </div>
//                 <a href="${actionUrl}" ${actionEvent} class="stretched-link"></a>
//             </div>
//         `;
//     }).join('');

//     // Event Hover
//     if (window.innerWidth > 992) {
//         const newsCards = container.querySelectorAll('.card--news');

//         newsCards.forEach(card => {
//             card.addEventListener('mouseenter', () => {
//                 // เปลี่ยนมาเช็คแค่ว่ามี container ไหม หรือเช็คแค่ความกว้างจอ
//                 newsPreview.container.classList.add('active');
//                 newsPreview.container.style.opacity = '1';
//                 newsPreview.container.style.visibility = 'visible';
//             });

//             card.addEventListener('mouseleave', () => {
//                 newsPreview.container.classList.remove('active');
//                 newsPreview.container.style.opacity = '0';
//                 newsPreview.container.style.visibility = 'hidden';
//             });

//             card.addEventListener('mousemove', (e) => {
//                 let x = e.clientX + 20;
//                 let y = e.clientY + 20;
//                 if (x + 120 > window.innerWidth) x = e.clientX - 100; // กันหลุดขอบ
//                 newsPreview.container.style.transform = `translate3d(${x}px, ${y}px, 0)`;
//             });
//         });
//     }
// };
/**
 * --- MASTER RENDERER ---
 * ฟังก์ชันเดียวที่คุมการวาดทั้งหมด
 */
// 1. เรียก setupPreview ไว้ด้านนอกสุด เพื่อให้เป็น Global หรือรันครั้งเดียวตอนโหลดหน้า
let globalNewsPreview = null;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof setupPreview === 'function') {
        globalNewsPreview = setupPreview();
    }
});

const renderNewsSystem = (contentType, groupNumber, styleType, limit = 3) => {
    const container = document.getElementById(`news-list-${groupNumber}`);
    const btnNewsAll = document.getElementById(`btn-news-all-${groupNumber}`);
    
    if (!container) {
        console.warn(`Container #news-list-${groupNumber} not found`);
        return;
    }

    const data = newsData[contentType] || [];

    // Logic จัดการข้อมูล
    const processedData = [...data]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

    if (processedData.length === 0) {
        container.innerHTML = `<div class="text-center py-5 w-100">ไม่พบข้อมูล</div>`;
        return;
    }

    // จัดการ Link ปุ่มดูทั้งหมด
    const configMap = {
        'pressReleases': { path: 'news' },
        'articles': { path: 'article' },
        'media': { path: 'video' }
    };
    const currentConfig = configMap[contentType] || { path: 'news' };
    if (btnNewsAll) btnNewsAll.href = `/${currentConfig.path}`;

    // Render HTML
    container.innerHTML = processedData.map(item => {
        const isVideo = contentType === 'media';
        let actionUrl = `/${currentConfig.path}/${item.id}/${item.slug}`;
        let actionEvent = (isVideo && item.displayMode === "modal") 
            ? `onclick="openVideoModal('${item.videoUrl}')"` 
            : "";
        if (isVideo && item.displayMode === "modal") actionUrl = "javascript:void(0);";

        if (styleType === 'STYLE_B') return newsTemplateB(item, isVideo, actionUrl, actionEvent);
        if (styleType === 'STYLE_C') return newsTemplateC(item, isVideo, actionUrl, actionEvent);
        return newsTemplateA(item, isVideo, actionUrl, actionEvent);
    }).join('');

    // ผูก Hover Event (ส่ง globalNewsPreview เข้าไป)
    if (globalNewsPreview) {
        attachNewsHoverEvents(container, globalNewsPreview);
    }
};

/**
 * --- INITIALIZATION ---
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initial Render
    renderNewsSystem('pressReleases', '1', 'STYLE_A', 3);
    renderNewsSystem('pressReleases', '2', 'STYLE_B', 3);
    renderNewsSystem('pressReleases', '3', 'STYLE_C', 3);

    // 2. ปรับปรุง Selector และ Event
    const allNewsTabs = document.querySelectorAll('.sam-tabs__link');
    
    allNewsTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            // 1. จัดการ UI: ลบคลาส active ออกจากปุ่มอื่นๆ ใน "กลุ่มเดียวกัน" เท่านั้น
            const group = this.getAttribute('data-group');
            const parentGroup = document.getElementById(`tab-group-${group}`);
            
            if (parentGroup) {
                parentGroup.querySelectorAll('.sam-tabs__link').forEach(btn => {
                    btn.classList.remove('active');
                });
            }

            // 2. จัดการ UI: เพิ่มคลาส active ให้ปุ่มที่ถูกคลิก
            this.classList.add('active');

            // 3. ดึงค่ามา Render ข้อมูล (เหมือนเดิม)
            const type = this.getAttribute('data-type');
            const style = this.getAttribute('data-style');
            
            renderNewsSystem(type, group, style, 3);
        });
    });
});

/**
 * --- TEMPLATE A (แบบเดิมของคุณ) ---
 */
const newsTemplateA = (item, isVideo, actionUrl, actionEvent) => `
    <div class="card card--news" data-hover-img="${item.thumbnail}">
        <div class="card__figure">
            <img src="${item.thumbnail}" alt="${item.title}" class="card__image" loading="lazy">
            ${isVideo ? '<div class="card__video-overlay"><svg class="icon"><use xlink:href="#icon-youtube"></use></svg></div>' : ''}
        </div>
        <div class="card__body">
            <time class="card__date">${item.displayDate}</time>
            <h3 class="card__title">${item.title}</h3>
        </div>
        <a href="${actionUrl}" ${actionEvent} class="stretched-link"></a>
    </div>
`;
// --- เพิ่มฟังก์ชัน Template B และ C ตามความต้องการ UI ของคุณ ---
const newsTemplateB = (item, isVideo, actionUrl, actionEvent) => `
    <div class="card card--news-thumbnail" data-hover-img="${item.thumbnail}">
        <div class="card__figure">
            <img src="${item.thumbnail}" alt="${item.title}" class="card__image" loading="lazy">
            ${isVideo ? '<div class="card__video-overlay"><svg class="icon"><use xlink:href="#icon-youtube"></use></svg></div>' : ''}
        </div>
        <div class="card__body">
            <time class="card__date">${item.displayDate}</time>
            <h3 class="card__title">${item.title}</h3>
        </div>
        <a href="${actionUrl}" ${actionEvent} class="stretched-link"></a>
    </div>
`;
const newsTemplateC = (item, isVideo, actionUrl, actionEvent) => `
    <div class="card card--news mb-4" data-hover-img="${item.thumbnail}">
        <div class="row">
            <div class="col-lg-4 col-md-6">
                <div class="card__figure">
                    <img src="${item.thumbnail}" alt="${item.title}" class="card__image" loading="lazy">
                    ${isVideo ? '<div class="card__video-overlay"><svg class="icon"><use xlink:href="#icon-youtube"></use></svg></div>' : ''}
                </div>
            </div>
            <div class="col-lg-8 col-md-6">
                <div class="card__body">
                    <time class="card__date">${item.displayDate}</time>
                    <h3 class="card__title" style="font-size: 2rem;">${item.title}</h3>
                </div>
            </div>
        </div>
        <a href="${actionUrl}" ${actionEvent} class="stretched-link"></a>
    </div>
`;

/**
 * --- HOVER LOGIC (ยกมาจากโค้ดเดิมของคุณ) ---
 */
const attachNewsHoverEvents = (container, newsPreview) => {
    if (window.innerWidth <= 992) return;
    const cards = container.querySelectorAll('[data-hover-img]');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            newsPreview.container.classList.add('active');
            newsPreview.container.style.opacity = '1';
            newsPreview.container.style.visibility = 'visible';
        });
        card.addEventListener('mouseleave', () => {
            newsPreview.container.classList.remove('active');
            newsPreview.container.style.opacity = '0';
            newsPreview.container.style.visibility = 'hidden';
        });
        card.addEventListener('mousemove', (e) => {
            let x = e.clientX + 20;
            let y = e.clientY + 20;
            newsPreview.container.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
    });
};
/**
 * 3. Library Initializers
 * ตั้งค่า Swiper, IntersectionObserver ฯลฯ
 */

const initSwiper = () => {
    if (!document.querySelector('.swiper--home')) return;
    new Swiper('.swiper--home', {
        loop: true,
        speed: 800,
        autoplay: { delay: 5000, pauseOnMouseEnter: true },
        pagination: { el: '.swiper--home__pagination', clickable: true },
        navigation: { prevEl: '.swiper--home__prev', nextEl: '.swiper--home__next' },
        effect: "creative",
        creativeEffect: {
            prev: { shadow: true, translate: ["-20%", 0, -1] },
            next: { translate: ["100%", 0, 0] },
        }
    });
};

const initScrollReveal = (selector) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
};

const initRollingNumbers = () => {
    const counters = document.querySelectorAll('.stats__counter');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateRoll(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const setupCounter = (el) => {
        const target = el.getAttribute('data-target');
        el.innerHTML = [...target].map(char =>
            /\d/.test(char)
                ? `<div class="digit-col" data-digit="${char}">${Array.from({ length: 10 }, (_, i) => `<span>${i}</span>`).join('')}</div>`
                : `<span class="digit-static">${char}</span>`
        ).join('');
    };

    const animateRoll = (el) => {
        const targetStr = el.getAttribute('data-target');
        const cols = el.querySelectorAll('.digit-col');

        requestAnimationFrame(() => {
            cols.forEach((col, i) => {
                setTimeout(() => {
                    col.style.transform = `translateY(-${col.dataset.digit * 10}%)`;
                }, i * 100);
            });
        });

        // Convert to static text with commas after animation
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.innerHTML = Number(targetStr).toLocaleString();
                el.style.opacity = '1';
                el.style.height = 'auto';
                el.style.overflow = 'visible';
            }, 300);
        }, 2800);
    };

    counters.forEach(counter => {
        setupCounter(counter);
        observer.observe(counter);
    });
};

/**
 * 4. Event Listeners & Main App Boot
 */

const setupEventListeners = () => {
    // Tab Province switching
    document.querySelectorAll('#assetTab .sam-tabs__link').forEach(link => {
        link.addEventListener('shown.bs.tab', (e) => {
            // ดึงค่า "10", "13", "20" ออกมา
            const provId = e.target.getAttribute('data-province-id');
            renderAssets(provId);
        });
    });

    // Tags & Search
    const keywordInput = document.getElementById('keywordInput');
    document.querySelectorAll('.popular-tag').forEach(tag => {
        tag.addEventListener('click', function () {
            const query = this.dataset.query;
            if (keywordInput) keywordInput.value = query;

            const tabEl = document.querySelector('#normal-tab');
            if (tabEl) bootstrap.Tab.getOrCreateInstance(tabEl).show();
        });
    });

    //Tab News switching
    const newsTabs = document.querySelectorAll('#newsTab .sam-tabs__link');
    newsTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const type = e.target.getAttribute('data-type');
            renderNews(type);
        });
    });

    // Helper Buttons
    document.getElementById('voice-btn')?.addEventListener('click', () => alert("กำลังเปิดไมโครโฟน..."));
    document.querySelector('button[type="reset"]')?.addEventListener('click', () => console.log("Filters cleared"));
};

const initApp = () => {
    renderHeroSliders(heroBannerData);
    renderQuickLinks(serviceData);
    renderAssetShowcase(allAssetTypeData);
    renderAssetAreaList();
    renderAssets(10);

    initRollingNumbers();
    initScrollReveal('.reveal-on-scroll');
    // renderNews('pressReleases');
    setupEventListeners();
};

document.addEventListener('DOMContentLoaded', initApp);