import { promotionData } from './data.js';

let currentPage = 1;
const itemsPerPage = 6;

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

const renderPromotions = (page) => {
    // อัปเดตสถานะหน้าปัจจุบันทั้งใน Module และ Global
    currentPage = page;
    window.currentPage = page;

    const container = document.getElementById('promotion-container');
    if (!container) return;

    const startIndex = (page - 1) * itemsPerPage;
    const paginatedData = promotionData.slice(startIndex, startIndex + itemsPerPage);

    container.innerHTML = paginatedData.map(item => `
        <div class="card card--promotion" data-hover-img="${item.imageUrl}"> 
            <div class="card__figure">
                <img src="${item.imageUrl}" class="card__image" alt="${item.title}">
            </div>
            <div class="card__body">
                <h5 class="card__title">${item.title}</h5>
                <p class="card__text">${item.description}</p>
                <time class="card__date">${item.date}</time>
            </div>
            <a href="${item.link}" class="stretched-link"></a>
        </div>
    `).join('');

    renderPaginationControls();
    attachHoverEvents();
};

const renderPaginationControls = () => {
    const paginationEl = document.getElementById('promotion-pagination');
    if (!paginationEl) return;

    const totalPages = Math.ceil(promotionData.length / itemsPerPage);
    let html = '';

    // ฟังก์ชันช่วยสร้าง URL แบบ Clean
    const getCleanUrl = (p) => `/promotion/page/${p}`;

    // 1. ปุ่ม First (<<)
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="${getCleanUrl(1)}" aria-label="First">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>`;

    // 2. ปุ่ม Previous (<)
    const prevPage = currentPage > 1 ? currentPage - 1 : 1;
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="${getCleanUrl(prevPage)}" aria-label="Previous">
                <span aria-hidden="true">&lsaquo;</span>
            </a>
        </li>`;

    // 3. ปุ่มตัวเลขหน้า 1 2 3...
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="${getCleanUrl(i)}">${i}</a>
            </li>`;
    }

    // 4. ปุ่ม Next (>)
    const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="${getCleanUrl(nextPage)}" aria-label="Next">
                <span aria-hidden="true">&rsaquo;</span>
            </a>
        </li>`;

    // 5. ปุ่ม Last (>>)
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="${getCleanUrl(totalPages)}" aria-label="Last">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>`;

    paginationEl.innerHTML = html;
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

// ผูกเข้ากับ Global Window เพื่อให้ jQuery นอก Module เรียกใช้ได้
window.renderPromotions = renderPromotions;
window.currentPage = currentPage;

document.addEventListener('DOMContentLoaded', () => renderPromotions(1));