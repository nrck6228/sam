// /js/features/content/video-player.js

export const openVideoModal = (videoUrl) => {
    const modalElement = document.getElementById('videoPlayerModal');
    if (!modalElement) {
        console.error("Modal element #videoPlayerModal not found!");
        return;
    }

    const iframe = modalElement.querySelector('iframe');
    let embedUrl = videoUrl;

    // Logic การแปลง URL (YouTube/Embed)
    if (videoUrl.includes("watch?v=")) {
        embedUrl = videoUrl.replace("watch?v=", "embed/");
    } else if (videoUrl.includes("youtu.be/")) {
        embedUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/");
    }

    iframe.src = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0`;

    const bsModal = new bootstrap.Modal(modalElement);
    bsModal.show();

    modalElement.addEventListener('hidden.bs.modal', () => {
        iframe.src = "";
    }, { once: true });
};

// --- บรรทัดสำคัญ: ต้องมีบรรทัดนี้เพื่อให้ onclick ใน HTML มองเห็นฟังก์ชัน ---
window.openVideoModal = openVideoModal;