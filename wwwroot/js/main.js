document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('#mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const hasMegaItems = document.querySelectorAll('.nav-item--has-mega');
    const closeButtons = document.querySelectorAll('.close-menu-btn');

    // ฟังก์ชันเปลี่ยน Panel (ดึงออกมาเป็น Global ภายใน Scope นี้เพื่อให้เรียกซ้ำได้)
    const switchPanel = (targetId, megaContainer) => {
        const panels = megaContainer.querySelectorAll('.content-panel');
        const categories = megaContainer.querySelectorAll('.mega-menu__category');

        categories.forEach(cat => {
            cat.classList.toggle('mega-menu__category--active', cat.dataset.target === targetId);
        });
        panels.forEach(panel => {
            panel.classList.toggle('content-panel--active', panel.id === targetId);
        });
    };

    const resetAllMenus = () => {
        navMenu?.classList.remove('active');
        mobileBtn?.classList.remove('is-active');

        hasMegaItems.forEach(item => {
            item.classList.remove('nav-item--open');
            const mainContent = item.querySelector('.mega-menu__main');
            mainContent?.classList.remove('slide-in');

            // Reset Level 3 กลับไปที่รายการแรกสุด (Optional แต่แนะนำ)
            const firstCategory = item.querySelector('.mega-menu__category[data-target]');
            if (firstCategory) {
                switchPanel(firstCategory.dataset.target, item);
            }
        });
    };

    // Resize Event พร้อม Debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 992) {
                resetAllMenus();
            }
        }, 150);
    });

    hasMegaItems.forEach(item => {
        const link = item.querySelector('.nav-item__link');
        const categories = item.querySelectorAll('.mega-menu__category');
        const mainContent = item.querySelector('.mega-menu__main');

        categories.forEach(cat => {
            const targetId = cat.dataset.target;
            if (targetId) {
                cat.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 992) switchPanel(targetId, item);
                });
                cat.addEventListener('click', (e) => {
                    if (window.innerWidth <= 992) {
                        e.preventDefault();
                        switchPanel(targetId, item);
                        mainContent?.classList.add('slide-in');
                    }
                });
            }
        });

        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                item.classList.add('nav-item--open');
            }
        });

        item.querySelector('.mega-menu__back-l1')?.addEventListener('click', (e) => {
            e.stopPropagation();
            item.classList.remove('nav-item--open');
        });

        item.querySelectorAll('.content-panel__back').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                mainContent?.classList.remove('slide-in');
            });
        });
    });

    // แก้ไขจุด Hamburger Toggle
    mobileBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = navMenu.classList.toggle('active'); // Toggle แค่ครั้งเดียว
        mobileBtn.classList.toggle('is-active');

        // ถ้าเป็นการปิดเมนู ให้ล้างค่าที่ค้างอยู่
        if (!isActive) {
            resetAllMenus();
        }
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            resetAllMenus(); // ใช้ฟังก์ชันเดิมที่เราเขียนไว้เพื่อล้าง class ทั้งหมด
        });
    });
});