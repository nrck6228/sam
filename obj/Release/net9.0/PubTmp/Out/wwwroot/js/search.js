// --- Configuration & Elements ---
const priceSlider = {
    s1: document.getElementById("slider-1"),
    s2: document.getElementById("slider-2"),
    i1: document.getElementById("input-1"),
    i2: document.getElementById("input-2"),
    track: document.querySelector(".slider-track"),
    minGap: 100000,
    max: parseInt(document.getElementById("slider-1").max)
};

/**
 * แปลงตัวเลขเป็นฟอร์แมตเงิน (1,000,000)
 */
const formatMoney = (val) => {
    return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * ล้างคอมม่าออกเพื่อคำนวณ
 */
const parseMoney = (val) => {
    return parseInt(String(val).replace(/,/g, '')) || 0;
};

/**
 * วาดสีในเส้น Slider Track
 */
const updateTrackColor = () => {
    const p1 = (priceSlider.s1.value / priceSlider.max) * 100;
    const p2 = (priceSlider.s2.value / priceSlider.max) * 100;

    priceSlider.track.style.background = `linear-gradient(to right, 
        rgba(255,255,255,0.2) ${p1}%, 
        #df9faa ${p1}%, 
        #df9faa ${p2}%, 
        rgba(255,255,255,0.2) ${p2}%)`;
};

/**
 * ฟังก์ชันหลักในการ Sync ค่าระหว่าง Slider และ Input
 * @param {string} type - 'min' หรือ 'max'
 * @param {string} source - 'slider' หรือ 'input'
 */
const syncValues = (type, source = 'slider') => {
    let val1 = source === 'slider' ? parseInt(priceSlider.s1.value) : parseMoney(priceSlider.i1.value);
    let val2 = source === 'slider' ? parseInt(priceSlider.s2.value) : parseMoney(priceSlider.i2.value);

    if (type === 'min') {
        // ตรวจสอบขอบเขตค่าเริ่มต้น
        if (val1 > val2 - priceSlider.minGap) {
            val1 = val2 - priceSlider.minGap;
        }
        if (val1 < 0) val1 = 0;

        priceSlider.s1.value = val1;
        priceSlider.i1.value = formatMoney(val1);
    } else {
        // ตรวจสอบขอบเขตค่าสูงสุด
        if (val2 < val1 + priceSlider.minGap) {
            val2 = val1 + priceSlider.minGap;
        }
        if (val2 > priceSlider.max) val2 = priceSlider.max;

        priceSlider.s2.value = val2;
        priceSlider.i2.value = formatMoney(val2);
    }

    updateTrackColor();
};

// --- Event Listeners ---

// สำหรับ Slider
priceSlider.s1.addEventListener('input', () => syncValues('min', 'slider'));
priceSlider.s2.addEventListener('input', () => syncValues('max', 'slider'));

// สำหรับช่อง Input (พิมพ์ตัวเลข)
[priceSlider.i1, priceSlider.i2].forEach(input => {
    const type = input === priceSlider.i1 ? 'min' : 'max';

    // อัปเดตเมื่อกด Enter หรือเสีย Focus
    input.addEventListener('change', () => syncValues(type, 'input'));

    input.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            syncValues(type, 'input');
            input.blur();
        }
    });

    // กรองเฉพาะตัวเลขเท่านั้นขณะพิมพ์
    input.addEventListener('input', (e) => {
        const cursorPosition = e.target.selectionStart;
        const rawValue = e.target.value.replace(/\D/g, '');
        e.target.value = formatMoney(rawValue);
    });
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    syncValues('min');
    syncValues('max');
});