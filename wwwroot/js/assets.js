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

    // 1. เช็คแค่ container หลักตัวเดียว
    if (!typeContainer) return;

    // 2. เรียงลำดับจากมากไปน้อยตามจำนวน count
    const sortedData = [...data].sort((a, b) => b.count - a.count);

    // 3. แสดงผลทั้งหมด (ลบ .slice(0, 4) ออก)
    typeContainer.innerHTML = sortedData.map(asset => `
        <a href="/" title="${asset.typeName}" class="card card--type">
            <div class="card__figure">
                <svg class="icon-xl"><use xlink:href="#icon-${asset.icon}"></use></svg>
                <div class="card__type">${asset.typeName}</div>
            </div>
            <div class="card__body">
                <div class="card__count">${asset.count.toLocaleString()}</div>
                <div class="card__unit">${asset.unit}</div>
            </div>
        </a>
    `).join('');
};

const renderPromotions = (data) => {
    const container = document.getElementById('promotion-container');
    if (!container) return;

    const promotionPreview = setupPreview();

    // หมายเหตุ: ในกรณี Hybrid หน้าแรกจะถูกวาดจาก C# มาแล้ว 
    // แต่เมื่อมีการ Filter หรือเปลี่ยนหน้า JS จะเข้ามาเขียนทับส่วนนี้
    container.innerHTML = data.map(item => `
        <div class="card card--promotion" data-hover-img="${item.imageUrl}"> 
            <div class="card__figure">
                <img src="${item.imageUrl}" class="card__image" alt="${item.title}">
            </div>
            <div class="card__body">
                <h5 class="card__title">${item.title}</h5>
                <p class="card__text">${item.description}</p>
                <div class="card__date">
                    ${item.date}
                </div>
            </div>
            <a href="${item.link}" class="stretched-link"></a>
        </div>
    `).join('');

    // Event Hover
    if (window.innerWidth > 992) {
        const promotionCards = container.querySelectorAll('.card--promotion');

        promotionCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const imgUrl = card.dataset.hoverImg;
                if (imgUrl && imgUrl !== 'undefined' && imgUrl !== 'null' && imgUrl !== '') {
                    //newsPreview.image.src = imgUrl;
                    promotionPreview.container.classList.add('active');
                    promotionPreview.container.style.opacity = '1';
                    promotionPreview.container.style.visibility = 'visible';

                    // หากต้องการเปลี่ยนคำตามหมวดหมู่ สามารถทำตรงนี้ได้
                    // newsPreview.container.querySelector('.preview-text').innerText = 'อ่านรายละเอียด';
                }
                //else {
                //    // ถ้าไม่มีรูป ให้ซ่อน Preview ทันที (ป้องกันกรณีเลื่อนจากตัวมีรูปมาตัวไม่มีรูปแล้วรูปเก่าค้าง)
                //    newsPreview.container.style.opacity = '0';
                //    newsPreview.container.style.visibility = 'hidden';
                //}
            });

            card.addEventListener('mouseleave', () => {
                promotionPreview.container.classList.remove('active');
                promotionPreview.container.style.opacity = '0';
                promotionPreview.container.style.visibility = 'hidden';
            });

            card.addEventListener('mousemove', (e) => {
                let x = e.clientX + 20;
                let y = e.clientY + 20;

                // กันรูปหลุดขอบจอขวา
                //if (x + 300 > window.innerWidth) {
                //    x = e.clientX - 320;
                //}
                if (x + 40 > window.innerWidth) {
                    x = e.clientX - 80;
                }

                // ใช้ requestAnimationFrame หรือ transform เพื่อประสิทธิภาพ
                promotionPreview.container.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        });
    }
};

const initApp = () => {
    renderAssetShowcase(allAssetTypeData);
    renderPromotions(promotionData);
};

document.addEventListener('DOMContentLoaded', initApp);