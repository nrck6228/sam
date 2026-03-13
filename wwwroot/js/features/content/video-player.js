import { newsData } from '/js/data/data.js';
import { initListEngine } from '/js/shared/list-renderer.js';

// 1. ฟังก์ชันสำหรับเตรียมข้อมูล (รองรับทั้ง Group และ Single Video)
const prepareVideoGroups = (category = 'all', year = 'all') => {
    let rawMedia = newsData.media;

    // 1. Filter ตามหมวดหมู่
    if (category !== 'all') {
        rawMedia = rawMedia.filter(v => v.category === category);
    }

    // 2. Filter ตามปี (สมมติว่าในข้อมูลมีฟิลด์ date: "2025-03-11")
    if (year !== 'all') {
        rawMedia = rawMedia.filter(v => {
            const videoYear = v.displayDate; // หรือใช้ตรรกะตัดสตริงปีจาก v.date
            return videoYear.includes(year);
        });
    }

    // 3. จัดกลุ่ม
    const grouped = rawMedia.reduce((acc, current) => {
        const effectiveGroupId = current.groupId || current.id;
        const existing = acc.find(item => (item.groupId || item.id) === effectiveGroupId);
        if (!existing) {
            const episodes = rawMedia.filter(v => (v.groupId || v.id) === effectiveGroupId);
            acc.push({ ...current, episodeCount: episodes.length });
        }
        return acc;
    }, []);

    return grouped;
};

// 2. เริ่มต้นใช้งาน Engine
const videoEngine = initListEngine({
    data: prepareVideoGroups('all'),
    containerId: 'video-container',
    paginationId: 'video-pagination',
    itemsPerPage: 3, // ปรับตามความเหมาะสมของดีไซน์
    urlPath: '/video/page',
    renderTemplate: (item) => {
        const isModal = item.displayMode === "modal";

        // Hybrid Logic: ตัดสินใจว่าจะไปหน้าใหม่หรือเปิด Modal
        const actionUrl = isModal ? "javascript:void(0);" : `/video/${item.id}/${item.slug}`;
        const actionEvent = isModal ? `onclick="openVideoModal('${item.videoUrl}')"` : "";
        const btnText = isModal ? "รับชมคลิป" : "รับชมเพลย์ลิสต์";
        const btnIcon = isModal ? "bi-play-fill" : "bi-collection-play";

        return `
                <div class="card card--video">
                    <div class="card__figure">
                        <img src="${item.thumbnail}" class="card__image" alt="${item.groupTitle || item.title}">
                        <div class="card__video-overlay">
                            <svg class="icon"><use xlink:href="#icon-youtube"></use></svg>
                            ${item.episodeCount > 1 ? `<span class="video-count">${item.episodeCount} วิดีโอ</span>` : ''}
                        </div>
                    </div>
                    <div class="card__body">
                        <small class="card__cate text-pink fw-bold">${item.category}</small>
                        <h5 class="card__title my-2">${item.groupTitle || item.title}</h5>
                        <p class="card__text text-muted small flex-grow-1">${item.shortDesc}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                            <time class="card__date small text-muted">${item.displayDate}</time>
                            <a href="${actionUrl}" ${actionEvent} class="btn btn--outline-black">
                                <span class="btn__icon"><i class="bi ${btnIcon} me-1"></i></span>
                                <span class="btn__text">${btnText}</span>
                            </a>
                        </div>
                    </div>
                </div>
        `;
    }
});

// เพิ่มบรรทัดนี้เพื่อให้ Script ข้างนอกเรียกใช้ได้
window.videoEngine = videoEngine;

// 3. สั่ง Render ครั้งแรก
document.addEventListener('DOMContentLoaded', () => {
    const startPage = videoEngine.getInitialPage();
    // ไม่ต้องเรียก updateData ซ้ำถ้าส่งไปตอน init แล้ว แต่ถ้าจะเปลี่ยน filter ให้ใช้ updateData
    videoEngine.render(startPage);

    const filterCategory = document.getElementById('filter-category');
    const filterYear = document.getElementById('filter-year'); // สมมติว่ามี ID นี้

    const handleFilterChange = () => {
        const cat = filterCategory ? filterCategory.value : 'all';
        const yr = filterYear ? filterYear.value : 'all';

        const newData = prepareVideoGroups(cat, yr);
        videoEngine.updateData(newData);
        videoEngine.render(1);
    };

    if (filterCategory) filterCategory.addEventListener('change', handleFilterChange);
    if (filterYear) filterYear.addEventListener('change', handleFilterChange);
});

// 5. Global Function สำหรับ Modal
window.openVideoModal = (videoUrl) => {
    const modalElement = document.getElementById('videoPlayerModal');
    if (!modalElement) return;

    const iframe = modalElement.querySelector('iframe');

    // จัดการแปลง URL YouTube ให้เป็น Embed Format
    let embedUrl = videoUrl;
    if (videoUrl.includes("watch?v=")) {
        embedUrl = videoUrl.replace("watch?v=", "embed/");
    } else if (videoUrl.includes("youtu.be/")) {
        embedUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/");
    }

    // เพิ่ม Autoplay และป้องกันเรื่อง Privacy
    iframe.src = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0`;

    const bsModal = new bootstrap.Modal(modalElement);
    bsModal.show();

    modalElement.addEventListener('hidden.bs.modal', () => {
        iframe.src = ""; // ล้าง src เพื่อหยุดวิดีโอทันทีที่ปิด
    }, { once: true });
};