// Import Data
import { allAssetTypeData, promotionData } from './data.js';

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

const renderAssetShowcase = (data) => {
    const typeContainer = document.getElementById('asset-type');
    if (!typeContainer) return;

    // เก็บค่าคลาสเดิมไว้ (เพื่อเอากลับมาใส่ตอนมีข้อมูล)
    const gridClasses = "card-deck card-deck--cards-1 card-deck--cards-md-2 card-deck--cards-lg-4";

    if (data.length === 0) {
        // เมื่อไม่พบข้อมูล: ถอดคลาส Grid ออก และใส่เนื้อหาที่ต้องการจัดกลาง
        typeContainer.className = "";
        typeContainer.innerHTML = `
            <div class="text-center py-5 w-100">
                <h3 class="text-white h5 fw-light">ไม่พบประเภททรัพย์ที่ตรงกับคำค้นหา</h3>
                <p class="text-white-50">ลองใช้คำค้นหาอื่น เช่น บ้านเดี่ยว, ที่ดิน หรือคอนโด</p>
            </div>`;
        return;
    }

    // เมื่อมีข้อมูล: ใส่คลาส Grid กลับคืนไป
    typeContainer.className = gridClasses;

    const sortedData = [...data].sort((a, b) => b.count - a.count);

    typeContainer.innerHTML = sortedData.map(asset => `
        <a href="/npa/${asset.id}/${asset.slug}" title="${asset.typeName}" class="card card--type">
            <div class="card__figure">
                <svg class="icon-xl"><use xlink:href="#icon-${asset.icon || 'land'}"></use></svg>
                <div class="card__type">${asset.typeName}</div>
            </div>
            <div class="card__body">
                <div class="card__count">${asset.count.toLocaleString()}</div>
                <div class="card__unit">${asset.unit}</div>
            </div>
        </a>
    `).join('');
};

/**
 * ฟังก์ชันสำหรับการ Filter
 */
const handleFilter = () => {
    const searchInput = document.getElementById('keyword');
    const form = document.querySelector('.form--filter-search');

    if (!searchInput) return;

    // แบบที่ 1: พิมพ์ไปกรองไป (Real-time)
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();

        const filteredData = allAssetTypeData.filter(asset =>
            asset.typeName.toLowerCase().includes(keyword)
        );

        renderAssetShowcase(filteredData);
    });

    // แบบที่ 2: ป้องกัน Form Reload เมื่อกด Enter
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
    });
};

const initApp = () => {
    renderAssetShowcase(allAssetTypeData);
    handleFilter(); // เรียกใช้งานระบบ Filter
};

document.addEventListener('DOMContentLoaded', initApp);