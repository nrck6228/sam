import { annualReportData } from '/js/data/data.js';
import { initListEngine } from '/js/shared/list-renderer.js';

const engine = initListEngine({
    data: annualReportData,
    itemsPerPage: 6,
    containerId: 'annual-container',
    paginationId: 'annual-pagination',
    urlPath: '/about/annual-report/page',
    renderTemplate: (item) => {
        // --- 1. เงื่อนไขรูป Cover Default ---
        const displayImg = item.imageUrl || '/media/images/annual/default-thumb.svg';

        // --- 2. เงื่อนไข QR Code (ถ้าไม่มีไม่ต้องแสดง div) ---
        const qrSection = (item.qrCodeUrl && item.qrCodeUrl.trim() !== "")
            ? `
                <div class="card__code">
                    <img src="${item.qrCodeUrl}"
                         alt="QR Code ${item.year}"
                         onerror="this.parentElement.style.display='none';">
                </div>
              `
            : ""; // ไม่มีข้อมูล ไม่ต้องแสดงอะไรเลย

        return `
        <div class="card card--annual">
                                <div class="card__figure">
                                    <img src="${item.imageUrl}" alt="รายงานประจำปี ${item.year}" class="card__image" onerror="this.onerror=null; this.src='/media/images/annual/default-thumb.svg';">
                                    <div class="card__download">
                                        <a href="${item.viewUrl}" class="btn btn--download btn--white">
                                            <span class="btn__icon"><svg class="icon"><use xlink:href="#icon-view"></use></svg></span>
                                            <span class="btn__text">ดูออนไลน์</span>
                                        </a>
                                        <a href="${item.downloadUrl}" class="btn btn--download btn--white">
                                            <span class="btn__icon"><svg class="icon"><use xlink:href="#icon-download"></use></svg></span>
                                            <span class="btn__text">ดาวน์โหลด</span>
                                        </a>
                                    </div>
                                </div>
                                <div class="card__body">
                                    <div class="card__title-group">
                                        <div class="card__title">รายงานประจำปี</div>
                                        <div class="card__text">${item.year}</div>
                                    </div>
                                    ${qrSection}
                                </div>
                            </div>`;
    }
});

window.renderContent = engine.render;
document.addEventListener('DOMContentLoaded', () => engine.render(engine.getInitialPage()));