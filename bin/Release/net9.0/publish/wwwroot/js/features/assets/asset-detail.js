import { assetListData, allAssetTypeData } from '/js/data/data.js';

const STATUS_CONFIG = {
    1: { label: 'ซื้อตรง', class: 'card__badge--direct' },
    2: { label: 'ขายทอดตลาด', class: 'card__badge--auction' },
    3: { label: 'รอประกาศราคา', class: 'card__badge--waiting' }
};

const assetTypeLookup = allAssetTypeData.reduce((acc, item) => {
    acc[item.id] = { icon: item.icon, name: item.typeName };
    return acc;
}, {});

const formatValue = (value, unit = '') => (!value || value === 0 ? '-' : `${value}${unit}`);

const getStatusText = (statusId) => {
    return STATUS_CONFIG[statusId]?.label || '-';
};

// --- 1. ฟังก์ชันหลักสำหรับ Render รายละเอียด ---
const renderDetail = (code) => {
    try {
        const asset = assetListData.find(item => item.assetCode?.toUpperCase() === code?.toUpperCase());
        const infoContainer = document.getElementById('asset-detail-container');

        if (!asset || !infoContainer) return;

        const isWaitingPrice = asset.statusId === 3;
        const typeInfo = assetTypeLookup[asset.typeId] || { icon: 'land', name: 'ไม่ระบุประเภท' };

        // สร้าง HTML สำหรับราคา
        let priceHTML = isWaitingPrice ? `
            <div class="price">
                <div class="price__value price__value--contact">ติดต่อเจ้าหน้าที่</div>
                <div class="price__unit">เพื่อสอบถามราคาล่าสุด</div>
            </div>` : `
            <div class="price">
                <div class="price__value">${asset.totalPrice?.toLocaleString()} <span class="price__currency">บาท</span></div>
                <div class="price__unit">${Math.round(asset.totalPrice / (parseFloat(asset.area) || 1)).toLocaleString()} บาท ต่อ ${asset.unit || 'หน่วย'}</div>
            </div>`;

        // สถิติห้องนอน/ห้องน้ำ
        const statsHTML = ['bed', 'bath'].map(type => asset[type] ? `
            <div class="stat-item">
                <svg class="icon stat-item__icon"><use xlink:href="#icon-${type === 'bed' ? 'bed' : 'bathtub'}"></use></svg>
                <span class="stat-item__text">${asset[type]} ห้อง${type === 'bed' ? 'นอน' : 'น้ำ'}</span>
            </div>` : '').join('');

        // Render เนื้อหาหลัก
        infoContainer.innerHTML = `
            <div class="asset-info">
                <h1 class="asset-info__title">${formatValue(asset.assetName)}</h1>
                <p class="asset-info__address"><i class="bi bi-geo-alt-fill me-1"></i>${formatValue(asset.location)}</p>
                
                <div class="asset-info__stats">
                    <div class="stat-item">
                        <svg class="icon stat-item__icon"><use xlink:href="#icon-${typeInfo.icon}"></use></svg>
                        <span class="stat-item__text">${typeInfo.name}</span>
                    </div>
                    <div class="stat-item">
                        <svg class="icon stat-item__icon"><use xlink:href="#icon-expand"></use></svg>
                        <span class="stat-item__text">${formatValue(asset.area)} ${asset.unit || ''}</span>
                    </div>
                    ${statsHTML}
                </div>

                <ul class="asset-info__details list-unstyled mt-4">
                    <li><span class="label">รหัสทรัพย์สิน</span> : ${formatValue(asset.assetCode)}</li>
                    <li><span class="label">เอกสารสิทธิ์</span> : ${formatValue(asset.docType)} ${asset.docNo || ''}</li>
                    <li><span class="label">เขตพื้นที่</span> : ${formatValue(asset.zoneColor)}</li>
                    <li><span class="label">หน้ากว้าง</span> : ${formatValue(asset.width)}</li>
                    <li><span class="label">ยาว (ลึก)</span> : ${formatValue(asset.long)}</li>
                </ul>

                <div class="asset-info__price-block mt-4">${priceHTML}</div>
            </div>`;

        // เรียกฟังก์ชันเสริม
        renderGallery(asset);
        renderAssetMap(asset);
        renderRelatedAssets(asset);
        initAppointmentForm(asset);
        setupScrollToBooking();

        // ส่งราคาเข้า Calculator (ถ้ามีราคา)
        if (!isWaitingPrice) {
            setupLoanCalculator(asset.totalPrice);
        }

        setTimeout(() => initAssetGallery(), 100);

    } catch (error) {
        console.error("Error in renderDetail:", error);
    }
};

/**
 * ฟังก์ชันสำหรับเลื่อนหน้าจอแบบนุ่มนวล (Manual Smooth Scroll)
 * @param {number} targetPosition - ตำแหน่ง Y ที่ต้องการให้เลื่อนไปถึง
 * @param {number} duration - ระยะเวลาในการเลื่อน (มิลลิวินาที)
 */
const manualSmoothScroll = (targetPosition, duration = 800) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    // Easing Function: easeOutQuad (ช้าลงเมื่อใกล้ถึงจุดหมาย)
    const easeOutQuad = (t, b, c, d) => {
        t /= d;
        return -c * t * (t - 2) + b;
    };

    const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;

        // คำนวณตำแหน่งถัดไป
        const nextScroll = easeOutQuad(timeElapsed, startPosition, distance, duration);

        window.scrollTo(0, nextScroll);

        // ถ้ายังไม่ครบเวลา ให้รันเฟรมถัดไป
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            // บังคับให้ไปที่จุดหมายเป๊ะๆ เมื่อจบการคำนวณ
            window.scrollTo(0, targetPosition);
        }
    };

    requestAnimationFrame(animation);
};

// แยกเป็นฟังก์ชันสำหรับจัดการการ Scroll โดยเฉพาะ
const setupScrollToBooking = () => {
    const btnBooking = document.querySelector('.btn-booking-top');

    if (btnBooking) {
        btnBooking.onclick = (e) => {
            e.preventDefault();

            const targetSection = document.getElementById('booking-section');
            if (targetSection) {
                // 1. หาความสูง Header เพื่อไม่ให้ทับเนื้อหา
                const headerHeight = document.querySelector('header')?.offsetHeight || 80;

                // 2. หาตำแหน่งเป้าหมายเทียบกับหน้าจอ
                const targetY = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                // 3. เรียกใช้ Manual Scroll
                manualSmoothScroll(targetY, 1000); // 1000ms = 1 วินาที
            }
        };
    }
};

const renderRelatedAssets = (currentAsset) => {
    const relatedContainer = document.getElementById('related-assets-grid');
    if (!relatedContainer || !currentAsset) return;

    // 1. Logic กรองข้อมูล (เหมือนเดิม)
    let relatedList = assetListData.filter(item =>
        item.id !== currentAsset.id &&
        item.typeId === currentAsset.typeId &&
        item.provinceId === currentAsset.provinceId
    );

    if (relatedList.length < 3) {
        const fallbackList = assetListData.filter(item =>
            item.id !== currentAsset.id &&
            item.provinceId === currentAsset.provinceId &&
            !relatedList.find(r => r.id === item.id)
        );
        relatedList = [...relatedList, ...fallbackList].slice(0, 3);
    }

    // 2. Render โดยเตรียมตัวแปรให้พร้อมเหมือนหน้า Asset List
    relatedContainer.innerHTML = relatedList.map(asset => {
        // ดึง Config ต่างๆ เตรียมไว้ก่อน return HTML
        const status = STATUS_CONFIG[asset.statusId] || { label: '-', class: '' };
        const typeInfo = assetTypeLookup[asset.typeId] || { icon: 'land', name: 'ทรัพย์สิน' };

        // จัดการเรื่องราคา
        const priceText = asset.statusId === 3
            ? 'ติดต่อเจ้าหน้าที่'
            : `${asset.totalPrice?.toLocaleString()} บาท`;

        return `
            <div class="col-md-4">
                <div class="card card--asset h-100">
                    <div class="card__figure">
                        <img src="${asset.img}" alt="${asset.alt}" class="card__image" loading="lazy">
                        <div class="card__badge ${status.class}">${status.label}</div>
                    </div>
                    <div class="card__body">
                        <div class="card__type">
                            <div class="card__type-icon">
                                <svg class="icon"><use xlink:href="#icon-${typeInfo.icon}"></use></svg>
                            </div>
                            <div class="card__type-text">${typeInfo.name}</div>
                        </div>
                        <div class="card__code">
                            <div class="card__type-icon">
                                <svg class="icon"><use xlink:href="#icon-search"></use></svg>
                            </div>
                            <div class="card__code-text">${asset.assetCode}</div>
                        </div>
                        <div class="card__location">
                            <div class="card__type-icon">
                                <svg class="icon"><use xlink:href="#icon-placeholder"></use></svg>
                            </div>
                            <div class="card__location-text">${asset.location}</div>
                        </div>
                        <div class="card__area">
                            <div class="card__type-icon">
                                <svg class="icon"><use xlink:href="#icon-expand"></use></svg>
                            </div>
                            <div class="card__area-text">${asset.area ? `${asset.area} ${asset.unit}` : '-'}</div>
                        </div>
                        <div class="card__price">${priceText}</div>
                    </div>
                    <a href="/asset-detail/${asset.assetCode}" class="stretched-link"></a>
                </div>
            </div>
        `;
    }).join('');
};

// --- 2. ฟังก์ชันคำนวณสินเชื่อ (Refactored) ---
const setupLoanCalculator = (price) => {
    const inputPrice = document.getElementById('loan_asset_price');
    const inputLoan = document.getElementById('loan_amount');
    const inputInterest = document.getElementById('loan_interest');
    const inputYears = document.getElementById('loan_years');
    const btnCalc = document.querySelector('.btn-calculate-loan');

    if (!inputPrice) return;

    inputPrice.value = price;
    inputLoan.value = Math.round(price * 0.9);

    const doCalculate = () => {
        // ฟังก์ชันช่วยดึงค่าตัวเลขให้แม่นยำขึ้น
        const parseNum = (val) => {
            if (!val) return 0;
            // ล้างทุกอย่างที่ไม่ใช่ตัวเลขและจุดทศนิยม
            const cleaned = val.toString().replace(/[^0-9.]/g, '');
            return parseFloat(cleaned) || 0;
        };

        const assetPrice = parseNum(inputPrice.value);
        const loanAmount = parseNum(inputLoan.value);
        const interestRate = parseNum(inputInterest.value);
        const years = parseNum(inputYears.value);

        // --- Validation (คงเดิมของคุณไว้ เพราะดีอยู่แล้ว) ---
        if (loanAmount <= 0) { /* Swal Alert */ return; }
        if (loanAmount > assetPrice) { /* Swal Alert */ return; }

        // --- Calculation ---
        const r = (interestRate / 100) / 12;
        const n = years * 12;

        let monthlyPayment = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;

        const interestFirstMonth = loanAmount * r;
        const principalFirstMonth = monthlyPayment - interestFirstMonth;

        const downPayment = assetPrice - loanAmount;

        // คำนวณ % และดักค่าไม่ให้เกิน 100 หรือเป็น NaN
        const rawDownPercent = assetPrice > 0 ? (downPayment / assetPrice) * 100 : 0;
        const downPercent = Math.min(100, Math.max(0, rawDownPercent)); // อยู่ระหว่าง 0-100 เสมอ
        const loanPercent = 100 - downPercent;

        const principalPercent = monthlyPayment > 0 ? (principalFirstMonth / monthlyPayment) * 100 : 0;
        const interestPercent = 100 - principalPercent;

        // --- Update UI (ใช้ Optional Chaining ป้องกัน Error ถ้าหา ID ไม่เจอ) ---
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        };

        safeSetText('res_monthly_pay', Math.round(monthlyPayment).toLocaleString());
        safeSetText('res_principal_val', Math.round(principalFirstMonth).toLocaleString());
        safeSetText('res_principal_percent', Math.round(principalPercent));
        safeSetText('res_interest_val', Math.round(interestFirstMonth).toLocaleString());
        safeSetText('res_interest_percent', Math.round(interestPercent));

        safeSetText('res_down_payment', Math.round(downPayment).toLocaleString());
        safeSetText('res_down_percent', Math.round(downPercent));
        safeSetText('res_loan_val', Math.round(loanAmount).toLocaleString());
        safeSetText('res_loan_percent', Math.round(loanPercent));

        // อัปเดต Progress Bar
        const updateBar = (id, percent) => {
            const el = document.getElementById(id);
            if (el) el.style.width = `${percent}%`;
        };

        updateBar('bar_principal', principalPercent);
        updateBar('bar_interest', interestPercent);
        updateBar('bar_down', downPercent);
        updateBar('bar_loan', loanPercent);

        // แสดงผลสำเร็จเบาๆ (Toast)
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: 'คำนวณยอดผ่อนใหม่เรียบร้อยแล้ว'
        });
    };

    if (btnCalc) {
        btnCalc.onclick = doCalculate;
    }

    doCalculate();
};

// --- 3. ฟังก์ชันนัดชม (Refactored) ---
const initAppointmentForm = (asset) => {
    const form = document.getElementById('appointmentForm');
    const dateInput = document.getElementById('app_date');
    const phoneInput = document.getElementById('app_phone'); // ตรวจสอบ ID ใน HTML
    const emailInput = document.getElementById('app_email'); // ตรวจสอบ ID ใน HTML

    if (document.getElementById('display-asset-code')) {
        document.getElementById('display-asset-code').innerText = asset.assetCode;
    }

    // 1. ตั้งค่า Flatpickr (วันที่ปัจจุบัน + 3 วัน)
    const initDatePicker = () => {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 3);

        flatpickr("#app_date", {
            locale: "th",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "j F Y",
            minDate: minDate, // กำหนดล่วงหน้า 3 วัน
            disable: [
                function (date) {
                    return (date.getDay() === 0); // ปิดวันอาทิตย์
                }
            ],
        });
    };

    // 2. Validate เบอร์โทรศัพท์ขณะพิมพ์ (ตัวเลขเท่านั้น และไม่เกิน 10 หลัก)
    if (phoneInput) {
        phoneInput.oninput = function () {
            // 1. ลบตัวอักษรที่ไม่ใช่ตัวเลขออกให้หมดก่อน
            let value = this.value.replace(/\D/g, '');

            // 2. จำกัดความยาวไม่เกิน 10 หลัก (เบอร์มือถือไทย)
            if (value.length > 10) {
                value = value.slice(0, 10);
            }

            // 3. จัด Format เป็น 0xx-xxx-xxxx
            let formattedValue = '';
            if (value.length > 0) {
                // ส่วนที่ 1: 0xx
                formattedValue = value.substring(0, 3);
                if (value.length > 3) {
                    // ส่วนที่ 2: -xxx
                    formattedValue += '-' + value.substring(3, 6);
                }
                if (value.length > 6) {
                    // ส่วนที่ 3: -xxxx
                    formattedValue += '-' + value.substring(6, 10);
                }
            }

            // 4. แสดงผลลัพธ์กลับไปที่ Input
            this.value = formattedValue;
        };
    }

    // 3. จัดการการ Submit และ Validate อีเมล
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();

            const phone = phoneInput.value.replace(/-/g, '');
            const email = emailInput?.value || '';
            //const date = dateInput?.value || '';

            // ตรวจสอบเบอร์โทร (ต้องครบ 10 หลัก)
            if (phone.length < 10) {
                Swal.fire({
                    icon: 'warning',
                    title: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
                    text: 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก'
                });
                return;
            }

            // ตรวจสอบ Format อีเมลด้วย Regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'อีเมลไม่ถูกต้อง',
                    text: 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง (เช่น name@example.com)'
                });
                return;
            }

            // ถ้าผ่านหมด
            Swal.fire({
                icon: 'success',
                title: 'ส่งข้อมูลสำเร็จ!',
                html: `นัดชมทรัพย์ รหัสทรัพย์สิน ${asset.assetCode} เรียบร้อยแล้ว<br>เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด`,
                customClass: {
                    confirmButton: 'btn btn--sam-green', // ปุ่มยืนยัน
                },

                // สำคัญ: ต้องปิดการใช้ Style พื้นฐานของ SweetAlert เพื่อให้ Class เราทำงานเต็มที่
                buttonsStyling: false,
                confirmButtonText: 'ตกลง',
            });

            form.reset();
            // รีเซ็ตวันที่ใน flatpickr (ถ้าจำเป็น)
            dateInput._flatpickr.clear();
        };
    }

    initDatePicker();
};

// แยก Function Gallery ออกมาเพื่อความสะอาด
const renderGallery = (asset) => {
    const galleryWrapper = document.getElementById('gallery-wrapper');
    if (!galleryWrapper) return;

    // ใช้ img หลักเป็นรูปแรกเสมอ ตามด้วย images array (ถ้ามี)
    const allImages = [asset.img];
    if (asset.images && Array.isArray(asset.images)) {
        allImages.push(...asset.images);
    }

    galleryWrapper.innerHTML = allImages.map(imgUrl => `
        <div class="swiper-slide">
            <a class="spotlight" href="${imgUrl}" data-title="${asset.assetName}">
                <img src="${imgUrl}" class="asset-gallery__image" loading="lazy" alt="${asset.alt}">
            </a>
        </div>
    `).join('');
};

// ฟังก์ชันสำหรับ Render แผนที่และปุ่ม Action ที่เกี่ยวข้อง
const renderAssetMap = (asset) => {
    const mapContainer = document.querySelector('.asset-map__container');
    const directionBtn = document.getElementById('btn-direction');
    const parcelBtn = document.getElementById('btn-parcel');

    // 1. เช็คว่ามีข้อมูลพิกัดหรือไม่ (รองรับทั้ง Lat/Lng แยกกัน หรือ String เดียว)
    const lat = asset.latitude || asset.lat;
    const lng = asset.longitude || asset.lng;

    if (!lat || !lng) {
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center h-100 bg-light text-muted">
                    <i class="bi bi-map-fill fs-1 mb-2"></i>
                    <p>ไม่พบข้อมูลพิกัดแผนที่</p>
                </div>`;
        }
        return;
    }

    // 2. อัปเดต Iframe (ใช้พิกัดจริง)
    const mapIframe = document.getElementById('asset-google-map');
    if (mapIframe) {
        // ใช้ Google Maps Embed URL (Standard Search)
        const searchUrl = `https://www.google.com/maps?q=${lat},${lng}&output=embed&hl=th`;
        mapIframe.src = searchUrl;
    }

    // 3. ตั้งค่าปุ่มนำทาง (Google Maps App)
    if (directionBtn) {
        directionBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        directionBtn.target = "_blank";
    }

    // 4. ตั้งค่าปุ่มดูระวาง (เปิด Satellite View ในจุดนั้น)
    if (parcelBtn) {
        // ถ้ามีเลขโฉนด สามารถเปลี่ยนไปลิงก์ LandsMaps ได้ แต่เบื้องต้นใช้ Satellite View
        parcelBtn.href = `https://www.google.com/maps/@${lat},${lng},100m/data=!3m1!1e3`;
        parcelBtn.target = "_blank";
    }
};

const initAssetGallery = () => {
    const galleryContainer = document.querySelector('.asset-gallery__slider');
    if (!galleryContainer) return;

    const mainSwiper = new Swiper(galleryContainer, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        speed: 1000,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.nav-btn--next',
            prevEl: '.nav-btn--prev',
        },
        pagination: {
            el: '.asset-gallery__pagination',
            clickable: true,
            dynamicBullets: true, // เพิ่มลูกเล่นให้จุดเล็กลงตามจำนวนรูปที่ห่างออกไป
        },
    });

    return mainSwiper;
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof SELECTED_ASSET_CODE !== 'undefined' && SELECTED_ASSET_CODE) {
        renderDetail(SELECTED_ASSET_CODE);
    }
});