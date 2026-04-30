const initRollingNumbers = () => {
    const counters = document.querySelectorAll('.stats__counter');

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

const initApp = () => {
    initRollingNumbers();
};

document.addEventListener('DOMContentLoaded', initApp);