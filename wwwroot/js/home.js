function initHomeSliders() {
    new Swiper('.hero-slide', {
        slidesPerView: 1,
        loop: true,
        speed: 800,
        autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: '.hero-slide__pagination', clickable: true },
        navigation: { prevEl: '.hero-slide__prev', nextEl: '.hero-slide__next' },
        effect: "creative",
        creativeEffect: {
            prev: { shadow: true, translate: ["-20%", 0, -1] },
            next: { translate: ["100%", 0, 0] },
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // 1. ระบบคลิก Tag ยอดนิยม
    const tags = document.querySelectorAll('.popular-tag');
    const keywordInput = document.getElementById('keywordInput');

    tags.forEach(tag => {
        tag.addEventListener('click', function () {
            const query = this.getAttribute('data-query');
            keywordInput.value = query;
            // สลับกลับมาหน้าค้นหาปกติ (ถ้าอยู่ในหน้า AI)
            const normalTab = new bootstrap.Tab(document.querySelector('#normal-tab'));
            normalTab.show();
            // เรียกฟังก์ชันค้นหาที่นี่
            console.log("Searching for:", query);
        });
    });

    // 2. ตัวอย่างการใช้ Voice (เบื้องต้น)
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.addEventListener('click', () => {
        alert("กำลังเปิดไมโครโฟนเพื่อรับคำค้นหา...");
    });

    // 3. ฟังก์ชัน Reset Sidebar
    const resetBtn = document.querySelector('button[type="reset"]');
    resetBtn.addEventListener('click', () => {
        console.log("Filters cleared");
    });
});

document.addEventListener('DOMContentLoaded', () => {
    initHomeSliders();
});