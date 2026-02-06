// Import Data
import { serviceData, heroBannerData, assetListData, allAssetTypeData, districtData, nearbyData, newsData } from './data.js';

/**
 * 1. UI Components & Templates
 * ฟังก์ชันสำหรับสร้าง HTML Markup
 */

const getStatusBadge = (status) => {
    const badgeMap = {
        'ซื้อตรง': 'card__badge--direct',
        'ประมูล': 'card__badge--auction',
        'รอประกาศราคา': 'card__badge--waiting'
    };
    const badgeClass = badgeMap[status] || 'card__badge--default';
    return `<div class="card__badge ${badgeClass}">${status}</div>`;
};

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

/**
 * 2. Render Functions
 * ฟังก์ชันสำหรับพ่นข้อมูลลง DOM
 */

const renderHeroSliders = (data) => {
    const container = document.querySelector('.hero-slide .swiper-wrapper');
    if (!container) return;

    container.innerHTML = data.map((item, index) => `
        <div class="swiper-slide">
            <div class="hero-slide__picture">
                <picture>
                    <source media="(min-width: 992px)" srcset="${item.desktopImg}">
                    <source media="(min-width: 320px)" srcset="${item.mobileImg}">
                    <img alt="${item.alt}" class="hero-slide__image" src="${item.desktopImg}" 
                         ${index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}>
                </picture>
            </div>
        </div>
    `).join('');

    initSwiper();
};

const renderQuickLinks = (data) => {
    const container = document.querySelector('#quick-links-grid');
    if (!container) return;

    container.innerHTML = data.map((item, index) => `
        <div class="quick-links__item" style="animation-delay: ${(index + 1) * 0.1}s">
            <a href="${item.url}" class="quick-links__link">
                <span class="quick-links__number">${item.id}</span>
                <div class="quick-links__content-wrapper">
                    <span class="quick-links__label">${item.label}</span>
                    <span class="quick-links__icon"><svg class="icon"><use xlink:href="#icon-arrow-explore"></use></svg></span>
                </div>
            </a>
        </div>
    `).join('');

    initScrollReveal('.quick-links');
};

const renderAssets = (province) => {
    const container = document.getElementById('asset-list');
    if (!container) return;

    const filteredData = assetListData.filter(item => item.location.includes(province));

    container.innerHTML = filteredData.map(asset => {
        // ดึงข้อมูลประเภทจาก Map ด้วย ID
        const typeInfo = typeMap[asset.typeId];
        const isWaiting = asset.saleStatus === 'รอประกาศราคา';
        const priceText = isWaiting ? 'ติดต่อเจ้าหน้าที่' : `${asset.totalPrice.toLocaleString()} บาท`;

        return `
            <a href="#" class="card card--asset">
                <div class="card__figure">
                    <img src="${asset.img}" alt="${asset.alt}" class="card__image" />
                </div>
                <div class="card__body">
                    <div class="card__type">
                         ${typeInfo ? typeInfo.typeName : 'ไม่ระบุประเภท'}
                    </div>
                    <div class="card__location">
                        <span class="card__location-icon">${getAssetIconById(asset.typeId)}</span>
                        <span class="card__location-text">${asset.location}</span>
                    </div>
                    <div class="card__price">${priceText}</div>
                </div>
            </a>
        `;
    }).join('');
};

const renderAssetShowcase = (data) => {
    const typeContainer = document.getElementById('asset-type');
    const tagsContainer = document.getElementById('asset-tag');
    if (!typeContainer || !tagsContainer) return;

    typeContainer.innerHTML = data.slice(0, 4).map(asset => `
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

    tagsContainer.innerHTML = data.slice(4).map(asset => `
        <div class="asset-badge">
            <svg class="icon"><use xlink:href="#icon-${asset.icon}"></use></svg>
            <span>${asset.typeName}</span>
        </div>
    `).join('');
};

const renderAssetAreaList = () => {
    const container = document.querySelector('.asset-area .row');
    if (!container) return;

    const createColumn = (data, title) => `
        <div class="col-lg-6">
            <div class="asset-area__group">
                <h3 class="asset-area__title">${title}</h3>
                <ul class="asset-area__list">
                    ${data.map(item => `
                        <li><a href="/search?q=${encodeURIComponent(item.name)}" class="asset-area__link">${item.name}</a></li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    container.innerHTML = createColumn(districtData, 'ย่าน') + createColumn(nearbyData, 'ใกล้');
};

/**
 * ฟังก์ชันสำหรับ Render รายการข่าว/บทความ/วิดีโอ
 * @param {string} contentType - ประเภทข้อมูล ('pressReleases', 'articles', 'media')
 */
// สร้าง Cursor Follower ไว้ใน DOM(ทำครั้งเดียวตอนโหลดหน้า)
const setupPreview = () => {
    // ใช้ชื่อที่เฉพาะเจาะจงเพื่อเลี่ยงการชนกันของชื่อตัวแปร
    let followerEl = document.getElementById('hover-preview-container');

    if (!followerEl) {
        followerEl = document.createElement('div');
        followerEl.id = 'hover-preview-container';
        followerEl.className = 'hover-reveal';
        followerEl.innerHTML = `<img src="" class="hover-reveal__img">`;
        document.body.appendChild(followerEl);
    }

    return {
        container: followerEl,
        image: followerEl.querySelector('img')
    };
};

const renderNews = (contentType) => {
    const container = document.getElementById('news-list');
    const preview = document.getElementById('hover-preview');
    const btnNewsAll = document.getElementById('btn-news-all');
    if (!container) return;

    const newsPreview = setupPreview();

    // 1. ดึงข้อมูลดิบมาเก็บไว้ก่อน (pressReleases | articles | media)
    const data = newsData[contentType] || [];

    // 2. จัดการลำดับและจำนวน (Logic เพิ่มเติม)
    const processedData = [...data] // ใช้ Spread operator เพื่อไม่ให้กระทบข้อมูลต้นฉบับ
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // เรียงใหม่ไปเก่า
        .slice(0, 6); // เอาแค่ 6 รายการล่าสุด

    if (processedData.length === 0) {
        container.innerHTML = `<div class="text-center py-5 w-100">ไม่พบข้อมูลในหมวดหมู่ข้างต้น</div>`;
        return;
    }

    // Map ข้อมูลสำหรับปุ่ม "ดูทั้งหมด"
    const configMap = {
        'pressReleases': { path: 'news', label: 'ข่าวสารประชาสัมพันธ์' },
        'articles': { path: 'article', label: 'บทความและวารสาร' },
        'media': { path: 'media', label: 'วีดิโอ/สื่อประชาสัมพันธ์' }
    };

    const currentConfig = configMap[contentType] || { path: 'news', label: '' };

    // อัปเดตปุ่ม ดูทั้งหมด
    if (btnNewsAll) {
        btnNewsAll.href = `/${currentConfig.path}`;
    }

    const pathMap = {
        'pressReleases': 'news',
        'articles': 'article',
        'media': 'media'
    };

    const basePath = pathMap[contentType] || 'content';

    // 3. Render เฉพาะข้อมูลที่ผ่านการตัดแล้ว (processedData)
    container.innerHTML = processedData.map(item => {
        // เช็คว่าเป็นหมวดวิดีโอหรือไม่ เพื่อใส่ Icon Play ทับบนรูป
        const isVideo = contentType === 'media';
        const thumb = item.thumbnail ? item.thumbnail : '';

        return `
            <article class="card card--news" data-hover-img="${thumb}">
                <a href="/${basePath}/${item.slug}" class="card__link" title="${item.title}">
                    <div class="card__figure" style="display: none">
                        <img src="${item.thumbnail}" alt="${item.title}" class="card__image" loading="lazy">
                        ${isVideo ? '<div class="card__video-overlay"><i class="bi bi-play-circle-fill"></i></div>' : ''}
                        <div class="card__category-badge">${item.category}</div>
                    </div>
                    <div class="card__body">
                        <h4 class="card__title">${item.title}</h4>
                        <time datetime="${item.date}" class="card__date">
                            ${item.displayDate}
                        </time>
                        <p class="card__excerpt" style="display: none;">${item.shortDesc}</p>
                    </div>
                </a>
            </article>
        `;
    }).join('');

    // Event Hover
    if (window.innerWidth > 992) {
        const newsCards = container.querySelectorAll('.card--news');

        newsCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const imgUrl = card.dataset.hoverImg;
                if (imgUrl && imgUrl !== 'undefined' && imgUrl !== 'null' && imgUrl !== '') {
                    newsPreview.image.src = imgUrl;
                    newsPreview.container.classList.add('active');
                    newsPreview.container.style.opacity = '1';
                    newsPreview.container.style.visibility = 'visible';
                } else {
                    // ถ้าไม่มีรูป ให้ซ่อน Preview ทันที (ป้องกันกรณีเลื่อนจากตัวมีรูปมาตัวไม่มีรูปแล้วรูปเก่าค้าง)
                    newsPreview.container.style.opacity = '0';
                    newsPreview.container.style.visibility = 'hidden';
                }
            });

            card.addEventListener('mouseleave', () => {
                newsPreview.container.classList.remove('active');
                newsPreview.container.style.opacity = '0';
                newsPreview.container.style.visibility = 'hidden';
            });

            card.addEventListener('mousemove', (e) => {
                let x = e.clientX + 20;
                let y = e.clientY + 20;

                // กันรูปหลุดขอบจอขวา
                if (x + 300 > window.innerWidth) {
                    x = e.clientX - 320;
                }

                // ใช้ requestAnimationFrame หรือ transform เพื่อประสิทธิภาพ
                newsPreview.container.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        });
    }
};

/**
 * 3. Library Initializers
 * ตั้งค่า Swiper, IntersectionObserver ฯลฯ
 */

const initSwiper = () => {
    if (!document.querySelector('.hero-slide')) return;
    new Swiper('.hero-slide', {
        loop: true,
        speed: 800,
        autoplay: { delay: 5000, pauseOnMouseEnter: true },
        pagination: { el: '.hero-slide__pagination', clickable: true },
        navigation: { prevEl: '.hero-slide__prev', nextEl: '.hero-slide__next' },
        effect: "creative",
        creativeEffect: {
            prev: { shadow: true, translate: ["-20%", 0, -1] },
            next: { translate: ["100%", 0, 0] },
        }
    });
};

const initScrollReveal = (selector) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
};

const initRollingNumbers = () => {
    const counters = document.querySelectorAll('.stats-board__counter');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateRoll(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const setupCounter = (el) => {
        const target = el.getAttribute('data-target');
        el.innerHTML = [...target].map(char =>
            /\d/.test(char)
                ? `<div class="digit-col" data-digit="${char}">${Array.from({ length: 10 }, (_, i) => `<span>${i}</span>`).join('')}</div>`
                : `<span class="digit-static">${char}</span>`
        ).join('');
    };

    const animateRoll = (el) => {
        const targetStr = el.getAttribute('data-target');
        const cols = el.querySelectorAll('.digit-col');

        requestAnimationFrame(() => {
            cols.forEach((col, i) => {
                setTimeout(() => {
                    col.style.transform = `translateY(-${col.dataset.digit * 10}%)`;
                }, i * 100);
            });
        });

        // Convert to static text with commas after animation
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.innerHTML = Number(targetStr).toLocaleString();
                el.style.opacity = '1';
                el.style.height = 'auto';
                el.style.overflow = 'visible';
            }, 300);
        }, 2800);
    };

    counters.forEach(counter => {
        setupCounter(counter);
        observer.observe(counter);
    });
};

/**
 * 4. Event Listeners & Main App Boot
 */

const setupEventListeners = () => {
    // Tab Province switching
    document.querySelectorAll('#assetTab .sam-tabs__link').forEach(link => {
        link.addEventListener('shown.bs.tab', (e) => {
            renderAssets(e.target.getAttribute('data-province'));
        });
    });

    // Tags & Search
    const keywordInput = document.getElementById('keywordInput');
    document.querySelectorAll('.popular-tag').forEach(tag => {
        tag.addEventListener('click', function () {
            const query = this.dataset.query;
            if (keywordInput) keywordInput.value = query;

            const tabEl = document.querySelector('#normal-tab');
            if (tabEl) bootstrap.Tab.getOrCreateInstance(tabEl).show();
        });
    });

    //Tab News switching
    const newsTabs = document.querySelectorAll('#newsTab .sam-tabs__link');
    newsTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const type = e.target.getAttribute('data-type');
            renderNews(type);
        });
    });

    // Helper Buttons
    document.getElementById('voice-btn')?.addEventListener('click', () => alert("กำลังเปิดไมโครโฟน..."));
    document.querySelector('button[type="reset"]')?.addEventListener('click', () => console.log("Filters cleared"));
};

const initApp = () => {
    renderHeroSliders(heroBannerData);
    renderQuickLinks(serviceData);
    renderAssetShowcase(allAssetTypeData);
    renderAssetAreaList();
    renderAssets('กรุงเทพมหานคร');

    initRollingNumbers();
    initScrollReveal('.stats-board .card-deck');
    renderNews('pressReleases');
    setupEventListeners();
};

document.addEventListener('DOMContentLoaded', initApp);