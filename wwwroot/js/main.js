document.addEventListener('DOMContentLoaded', () => {
    // 1. UI Elements Reference
    const UI = {
        mobileBtn: document.querySelector('#mobile-menu-btn'),
        navWrapper: document.querySelector('.nav-wrapper'),
        navBar: document.querySelector('.nav-bar'),
        navMenu: document.querySelector('.nav-menu'),
        hasMegaItems: document.querySelectorAll('.nav-item--has-mega'),
        closeButtons: document.querySelectorAll('.close-menu-btn'),
        footer: document.querySelector('.footer'),
        isDesktop: () => window.innerWidth > 992
    };

    // 2. Core Functions
    const resetAllMenus = () => {
        UI.navWrapper?.classList.remove('active', 'is-sticky');
        UI.navBar?.classList.remove('active');
        UI.navMenu?.classList.remove('active');
        UI.mobileBtn?.classList.remove('is-active');

        UI.hasMegaItems.forEach(item => {
            item.classList.remove('nav-item--open');
            item.querySelector('.mega-menu__main')?.classList.remove('slide-in');

            // Reset to first panel
            const firstCat = item.querySelector('.mega-menu__category[data-target]');
            if (firstCat) switchPanel(firstCat.dataset.target, item);
        });
    };

    const switchPanel = (targetId, container) => {
        const panels = container.querySelectorAll('.content-panel');
        const categories = container.querySelectorAll('.mega-menu__category');

        categories.forEach(cat =>
            cat.classList.toggle('mega-menu__category--active', cat.dataset.target === targetId));
        panels.forEach(panel =>
            panel.classList.toggle('content-panel--active', panel.id === targetId));
    };

    const toggleMobileMenu = (forceClose = false) => {
        const shouldActive = forceClose ? false : !UI.navMenu.classList.contains('active');

        [UI.navMenu, UI.navWrapper, UI.navBar].forEach(el => el?.classList.toggle('active', shouldActive));
        UI.mobileBtn?.classList.toggle('is-active', shouldActive);

        if (!shouldActive) resetAllMenus();
    };

    // 3. Sub-Module: Mega Menu Logic
    const initMegaMenu = () => {
        UI.hasMegaItems.forEach(item => {
            const link = item.querySelector('.nav-item__link');
            const categories = item.querySelectorAll('.mega-menu__category');
            const mainContent = item.querySelector('.mega-menu__main');

            // Category Hover (Desktop) / Click (Mobile)
            categories.forEach(cat => {
                const targetId = cat.dataset.target;
                if (!targetId) return;

                cat.addEventListener('mouseenter', () => UI.isDesktop() && switchPanel(targetId, item));
                cat.addEventListener('click', (e) => {
                    if (!UI.isDesktop()) {
                        e.preventDefault();
                        switchPanel(targetId, item);
                        mainContent?.classList.add('slide-in');
                    }
                });
            });

            // Mobile Navigation Steps
            link?.addEventListener('click', (e) => {
                if (!UI.isDesktop()) {
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
    };

    // 4. Sub-Module: Utilities (Sticky, Observer, Resize)
    const initScrollEffects = () => {
        // Sticky Header
        window.addEventListener('scroll', () => {
            if (!UI.isDesktop()) {
                UI.navWrapper?.classList.toggle('is-sticky', window.scrollY > 50);
            }
        }, { passive: true });

        // Footer Intersection (Hide Nav)
        if (UI.footer && UI.navBar) {
            const observer = new IntersectionObserver((entries) => {
                if (!UI.isDesktop()) return;

                entries.forEach(entry => {
                    const isVisible = !entry.isIntersecting;
                    UI.navBar.style.cssText = `
                        opacity: ${isVisible ? '1' : '0'};
                        pointer-events: ${isVisible ? 'auto' : 'none'};
                        transition: opacity 0.4s ease;
                    `;
                });
            }, { threshold: 0.1 });
            observer.observe(UI.footer);
        }
    };

    const initResizeHandler = () => {
        let timer;
        window.addEventListener('resize', () => {
            clearTimeout(timer);
            timer = setTimeout(() => UI.isDesktop() && resetAllMenus(), 150);
        });
    };

    // 5. Initialize All
    const init = () => {
        initMegaMenu();
        initScrollEffects();
        initResizeHandler();

        UI.mobileBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobileMenu();
        });

        UI.closeButtons.forEach(btn => btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobileMenu(true);
        }));
    };

    init();
});