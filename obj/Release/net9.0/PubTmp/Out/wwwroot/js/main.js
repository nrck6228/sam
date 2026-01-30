document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('#mobile-menu-btn');
    const navWrapper = document.querySelector('.nav-wrapper');
    const navBar = document.querySelector('.nav-bar');
    const navMenu = document.querySelector('.nav-menu');
    const hasMegaItems = document.querySelectorAll('.nav-item--has-mega');
    const closeButtons = document.querySelectorAll('.close-menu-btn');
    const footer = document.querySelector('.footer');

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
        navWrapper?.classList.remove('active');
        navBar?.classList.remove('active');
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
        navWrapper.classList.toggle('active');
        navBar.classList.toggle('active');
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

    const initStickyNav = () => {
        // กำหนดจุดที่จะให้เริ่ม Sticky (เช่น scroll ลงมาเกิน 50px)
        const scrollThreshold = 50;

        window.addEventListener('scroll', () => {
            // ทำงานเฉพาะหน้าจอที่เล็กกว่าหรือเท่ากับ 992px
            if (window.innerWidth <= 992) {
                if (window.scrollY > scrollThreshold) {
                    navWrapper?.classList.add('is-sticky');
                } else {
                    navWrapper?.classList.remove('is-sticky');
                }
            } else {
                // ถ้ากลับไปหน้าจอใหญ่ ให้ล้าง class ออก
                navWrapper?.classList.remove('is-sticky');
            }
        }, { passive: true }); // passive: true ช่วยให้การ scroll ลื่นไหลขึ้น
    };

    // เรียกใช้งานฟังก์ชัน
    initStickyNav();

    if (footer && navBar) {
        const footerObserver = new IntersectionObserver((entries) => {
            // เช็คขนาดหน้าจอก่อนทำงาน (ใช้ค่า 992px ตาม logic เดิมของคุณ)
            if (window.innerWidth > 992) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // เมื่อเจอ Footer: จางหาย
                        navBar.style.opacity = '0';
                        navBar.style.pointerEvents = 'none'; // ป้องกันการกดโดนเมนูขณะซ่อน
                        navBar.style.transition = 'opacity 0.4s ease';
                    } else {
                        // เมื่อพ้น Footer: แสดงกลับมา
                        navBar.style.opacity = '1';
                        navBar.style.pointerEvents = 'auto';
                    }
                });
            } else {
                // ถ้าเป็น Mobile: ให้เมนูแสดงผลปกติ (เผื่อกรณีสลับจอไปมา)
                navBar.style.opacity = '';
                navBar.style.pointerEvents = '';
            }
        }, { threshold: 0.1 }); // เริ่มทำงานเมื่อเห็น footer 10%

        footerObserver.observe(footer);
    }

});