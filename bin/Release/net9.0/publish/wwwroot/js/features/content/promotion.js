import { promotionData } from '/js/data/data.js';
import { initListEngine } from '/js/shared/list-renderer.js';

// --- Logic เฉพาะของหน้า Promotion: Hover Preview ---
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

const attachHoverEvents = () => {
    if (window.innerWidth <= 992) return;
    const preview = setupPreview();
    const cards = document.querySelectorAll('.card--promotion');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            preview.container.style.opacity = '1';
            preview.container.style.visibility = 'visible';
            preview.container.classList.add('active');
        });
        card.addEventListener('mouseleave', () => {
            preview.container.style.opacity = '0';
            preview.container.style.visibility = 'hidden';
            preview.container.classList.remove('active');
        });
        card.addEventListener('mousemove', (e) => {
            let x = e.clientX + 20;
            let y = e.clientY + 20;
            if (x + 100 > window.innerWidth) x = e.clientX - 100;
            preview.container.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
    });
};

// --- เริ่มต้นใช้งาน Engine ---
const engine = initListEngine({
    data: promotionData,
    itemsPerPage: 6,
    containerId: 'promotion-container',
    paginationId: 'promotion-pagination',
    urlPath: '/promotion/page',
    renderTemplate: (item) => {
        // ดึงเฉพาะคำภาษาอังกฤษออกมาจาก item.link (เช่น จาก '/promotion/debt-free' เอาแค่ 'debt-free')
        const englishSlug = item.link.split('/').pop();

        // สร้าง URL รูปแบบ /promotion/id/english-slug
        const detailUrl = `/promotion/${item.id}/${englishSlug}`;

        return `
            <div class="card card--promotion" data-hover-img="${item.imageUrl}"> 
                <div class="card__figure">
                    <img src="${item.imageUrl}" class="card__image" alt="${item.title}" onerror="this.src='/media/images/promotion/default.jpg'">
                </div>
                <div class="card__body">
                    <h5 class="card__title">${item.title}</h5>
                    <p class="card__text text-truncate-2">${item.description}</p>
                    <time class="card__date">${item.date}</time>
                </div>
                <a href="${detailUrl}" class="stretched-link"></a>
            </div>
        `;
    }
});

// หุ้มฟังก์ชัน render เพื่อให้รัน hover events ทุกครั้งที่เปลี่ยนหน้า
const enhancedRender = (page) => {
    engine.render(page);
    //attachHoverEvents(); // รัน Event ใหม่ทุกครั้งที่ Render ข้อมูลชุดใหม่
};

window.renderContent = enhancedRender; // ผูกชื่อกลางให้ jQuery เรียกใช้

document.addEventListener('DOMContentLoaded', () => {
    enhancedRender(engine.getInitialPage());
});