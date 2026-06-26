import { brochureList } from '/js/features/compare/brochure-service.js';
import { assetListData, allAssetTypeData } from '/js/data/data.js';

// ===========================================================================
// E-Brochure — เอกสาร A4 หลายหน้า (หน้าปก + หน้าเนื้อหาจัดกลุ่มตามทำเล)
// แหล่งข้อมูล: ?ids= ใน URL (รายการที่ผู้ใช้เลือก "ทำโบรชัวร์") fallback เป็น brochureList
// ===========================================================================

const typeMap = allAssetTypeData.reduce((acc, curr) => {
    acc[curr.id] = curr; // เก็บทั้ง object เพื่อใช้ typeName + icon
    return acc;
}, {});

const STATUS_CONFIG = {
    1: 'ซื้อตรง',
    2: 'ขายทอดตลาด',
    3: 'รอประกาศราคา'
};

// จำนวนรายการต่อ 1 หน้า A4 (ตามดีไซน์ = 4 ใบ/หน้า)
const ITEMS_PER_PAGE = 4;

// --- Helpers ---

// อ่านรายการ id ที่เลือก: เอาจาก ?ids= ก่อน ไม่มีค่อย fallback ไป localStorage
const getSelectedIds = () => {
    const param = new URLSearchParams(window.location.search).get('ids');
    if (param) {
        return param.split(',').map(Number).filter(n => !isNaN(n));
    }
    return [...brochureList];
};

const priceText = (asset) =>
    asset.statusId === 3 ? 'ติดต่อเจ้าหน้าที่' : `${(asset.totalPrice || 0).toLocaleString()} บาท`;

// แถบ footer ติดต่อ (ใช้ซ้ำทุกหน้าเนื้อหา) — pageNo ใส่เลขหน้ามุมขวา
const footerHTML = (pageNo) => `
    <div class="brochure-foot">
        <div class="brochure-foot__contact">
            <span class="brochure-foot__item"><i class="bi bi-telephone-fill"></i> 1443</span>
            <span class="brochure-foot__item"><i class="bi bi-globe"></i> www.sam.or.th</span>
            <span class="brochure-foot__item"><i class="bi bi-line"></i> @samline</span>
            <img class="brochure-foot__qr" src="/media/images/sample-qrcode.jpg" alt="QR">
        </div>
        ${pageNo ? `<span class="brochure-foot__page">${String(pageNo).padStart(2, '0')}</span>` : ''}
    </div>`;

// --- Core ---

document.addEventListener('DOMContentLoaded', renderBrochure);

function renderBrochure() {
    const wrapper = document.getElementById('brochure-pages');
    const typesEl = document.getElementById('brochure-types');
    const locationsEl = document.getElementById('brochure-locations');
    if (!wrapper) return;

    const ids = getSelectedIds();
    const assets = assetListData.filter(a => ids.includes(a.id));

    // Empty state
    if (assets.length === 0) {
        wrapper.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-folder2-open display-1 text-muted"></i>
                <p class="mt-3">ไม่พบรายการสำหรับสร้างโบรชัวร์</p>
                <button onclick="window.close()" class="btn btn--hover btn--gray">
                    <span class="btn__text">ปิดหน้านี้</span>
                </button>
            </div>`;
        document.querySelectorAll('.brochure__cover, .brochure__toolbar').forEach(el => el.classList.add('d-none'));
        return;
    }

    // 1) หน้าปก: ประเภททรัพย์ + ทำเล (unique จากรายการที่เลือก)
    const uniqueTypes = [...new Set(assets.map(a => typeMap[a.typeId]?.typeName).filter(Boolean))];
    const uniqueProvinces = [...new Set(assets.map(a => a.provinceName).filter(Boolean))];

    if (typesEl) {
        typesEl.innerHTML = uniqueTypes.map(t => `<li class="brochure-cover__item">${t}</li>`).join('');
    }
    if (locationsEl) {
        locationsEl.innerHTML = uniqueProvinces.map(p => `<li class="brochure-cover__item">${p}</li>`).join('');
    }

    // 2) จัดกลุ่มตามทำเล/จังหวัด แล้วแบ่งย่อยเป็นหน้าละ ITEMS_PER_PAGE รายการ
    //    เพื่อให้แต่ละหน้าพอดีกระดาษ A4 เสมอ (จังหวัดที่มีรายการเยอะจะกลายเป็นหลายหน้า)
    const pages = [];
    uniqueProvinces.forEach(province => {
        const items = assets.filter(a => a.provinceName === province);
        for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
            pages.push({ province, items: items.slice(i, i + ITEMS_PER_PAGE) });
        }
    });

    // 3) เรนเดอร์หน้าเนื้อหา — เริ่มเลขหน้าที่ 2 (หน้า 1 = ปก)
    wrapper.innerHTML = pages.map((page, i) => `
        <section class="brochure__page brochure__page--content">
            <div class="brochure-group__head">
                <img class="brochure-group__logo" src="/media/images/logo/logo-main.webp" alt="SAM">
                <h2 class="brochure-group__title">
                    <span class="brochure-group__icon"><i class="bi bi-geo-alt-fill"></i></span>
                    ${page.province}
                </h2>
            </div>

            <div class="brochure-group__list">
                ${page.items.map(renderItem).join('')}
            </div>

            ${footerHTML(i + 2)}
        </section>
    `).join('');
}

// การ์ดทรัพย์ 1 รายการ (รูปซ้าย + รายละเอียดขวา)
function renderItem(asset) {
    const type = typeMap[asset.typeId] || { typeName: 'ทรัพย์สิน', icon: 'land' };
    return `
        <article class="brochure-item">
            <div class="brochure-item__figure">
                <img src="${asset.img}" alt="${asset.alt || asset.assetName || ''}" loading="lazy">
            </div>
            <div class="brochure-item__body">
                <div class="brochure-item__code">รหัสทรัพย์สิน ${asset.assetCode}</div>
                <ul class="brochure-item__meta">
                    <li><svg class="icon"><use xlink:href="#icon-${type.icon}"></use></svg> ${type.typeName}</li>
                    <li><svg class="icon"><use xlink:href="#icon-placeholder"></use></svg> ${asset.location || '-'}</li>
                    <li><svg class="icon"><use xlink:href="#icon-expand"></use></svg> ${asset.area ? `${asset.area} ${asset.unit || ''}` : '-'}</li>
                </ul>
                <div class="brochure-item__price">${priceText(asset)}</div>
                <a href="/asset-detail/${asset.assetCode}" target="_blank" class="brochure-item__detail">รายละเอียด</a>
            </div>
        </article>`;
}
