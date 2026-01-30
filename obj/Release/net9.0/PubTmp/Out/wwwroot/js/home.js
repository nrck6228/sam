// Import Data
import { serviceData, heroBannerData } from './data.js';

function initHomeSliders() {
    // เช็คว่ามี element ก่อนรันเพื่อป้องกัน error
    if (!document.querySelector('.hero-slide')) return;

    new Swiper('.hero-slide', {
        observer: true,
        observeParents: true,
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

const initScrollReveal = (targetSelector) => {
    const elements = document.querySelectorAll(targetSelector);

    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // เลิกตามเมื่อเห็นแล้ว
                console.log(`Revealed: ${targetSelector}`);
            }
        });
    }, observerOptions);

    elements.forEach(el => observer.observe(el));
};

const renderHeroSliders = (data) => {
    const swiperWrapper = document.querySelector('.hero-slide .swiper-wrapper');
    if (!swiperWrapper) return;

    const htmlMarkup = data.map((item, index) => `
        <div class="swiper-slide">
            <div class="hero-slide__picture">
                <picture>
                    <source media="(min-width: 992px)" srcset="${item.desktopImg}">
                    <source media="(min-width: 320px)" srcset="${item.mobileImg}">
                    <img 
                        alt="${item.alt}" 
                        class="hero-slide__image" 
                        src="${item.desktopImg}"
                        ${index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}
                    >
                </picture>
            </div>
        </div>
    `).join('');

    swiperWrapper.innerHTML = htmlMarkup;
    initHomeSliders();
};

const renderQuickLinks = (data) => {
    const gridContainer = document.querySelector('#quick-links-grid');
    if (!gridContainer) return;

    const htmlMarkup = data.map((item, index) => {
        const delay = (index + 1) * 0.1;
        return `
            <div class="quick-links__item" style="animation-delay: ${delay}s">
                <a href="${item.url}" class="quick-links__link">
                    <span class="quick-links__number">${item.id}</span>

                    <div class="quick-links__content-wrapper">
                        <span class="quick-links__label">${item.label}</span>
                        <span class="quick-links__icon">
                            <i class="bi bi-arrow-up-short"></i>
                        </span>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    gridContainer.innerHTML = htmlMarkup;
    initScrollReveal('.quick-links');
};

const initRollingNumbers = () => {
    const counters = document.querySelectorAll('.stats-board__counter');

    const setupCounter = (el) => {
        // ดึงเฉพาะตัวเลขออกมาเพื่อคำนวณ แต่เก็บรูปแบบเดิมไว้แสดงผล
        const originalTarget = el.getAttribute('data-target');
        el.innerHTML = '';

        [...originalTarget].forEach((char) => {
            if (/\d/.test(char)) { // เช็คว่าเป็นตัวเลขหรือไม่
                const col = document.createElement('div');
                col.className = 'digit-col';
                col.dataset.digit = char;

                // สร้าง 0-9
                for (let i = 0; i <= 9; i++) {
                    const span = document.createElement('span');
                    span.textContent = i;
                    col.appendChild(span);
                }
                el.appendChild(col);
            } else {
                // ถ้าเป็นเครื่องหมาย , + % หรือข้อความ ให้ใส่เป็น span ปกติ
                const span = document.createElement('span');
                span.className = 'digit-static';
                span.textContent = char;
                el.appendChild(span);
            }
        });
    };

    const animateRoll = (el) => {
        const cols = el.querySelectorAll('.digit-col');
        const targetStr = el.getAttribute('data-target'); // เช่น "150000"

        // ใช้ requestAnimationFrame เพื่อให้มั่นใจว่า DOM ถูกวาดเสร็จก่อนสั่งเลื่อน
        requestAnimationFrame(() => {
            cols.forEach((col, index) => {
                const targetDigit = parseInt(col.dataset.digit);
                // เพิ่ม delay เล็กน้อยให้แต่ละหลักเลื่อนไม่พร้อมกัน (Staggered) จะดูสวยและไม่ค้าง
                setTimeout(() => {
                    col.style.transform = `translateY(-${targetDigit * 10}%)`;
                }, index * 100);
            });

        });

        setTimeout(() => {
            // แปลงตัวเลขเป็น Format ที่มีคอมมา (เช่น 150,000)
            const formattedNumber = Number(targetStr).toLocaleString();

            // ใส่ Effect จางเข้าเล็กน้อยเพื่อให้การเปลี่ยนจาก Rolling เป็น Static ดูเนียน
            el.style.transition = 'opacity 0.3s';
            el.style.opacity = '0';

            setTimeout(() => {
                el.innerHTML = formattedNumber; // พ่นค่าที่มีคอมมาลงไปตรงๆ
                el.style.opacity = '1';
                // ปรับความสูงให้กลับเป็นปกติ (เผื่อมีการล็อคความสูงไว้ในโหมด Rolling)
                el.style.height = 'auto';
                el.style.overflow = 'visible';
            }, 300);

        }, 2800);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateRoll(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    counters.forEach(counter => {
        setupCounter(counter);
        observer.observe(counter);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // รัน Slider
    renderHeroSliders(heroBannerData);

    // รันการเรนเดอร์ข้อมูล
    renderQuickLinks(serviceData);

    // รันตัวเลข Stats
    initRollingNumbers();

    // ระบบคลิก Tag และอื่นๆ
    const tags = document.querySelectorAll('.popular-tag');
    const keywordInput = document.getElementById('keywordInput');

    tags.forEach(tag => {
        tag.addEventListener('click', function () {
            const query = this.getAttribute('data-query');
            if (keywordInput) keywordInput.value = query;

            const tabEl = document.querySelector('#normal-tab');
            if (tabEl) {
                const normalTab = new bootstrap.Tab(tabEl);
                normalTab.show();
            }
            console.log("Searching for:", query);
        });
    });

    // Voice และ Reset
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) voiceBtn.addEventListener('click', () => alert("กำลังเปิดไมโครโฟน..."));

    const resetBtn = document.querySelector('button[type="reset"]');
    if (resetBtn) resetBtn.addEventListener('click', () => console.log("Filters cleared"));
});