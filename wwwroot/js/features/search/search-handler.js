// search-engine.js
import { allAssetTypeData } from '/js/data/data.js';

const typeGroups = {
    "ที่พักอาศัย": [9, 8, 6, 24, 26, 39, 20], // บ้านเดี่ยว, คอนโด, ทาวน์เฮ้าส์, บ้านแฝด...
    "ที่ดินและพื้นที่เปล่า": [4, 42, 33], // ที่ดินเปล่า, ส่วนโล่งหลังคาคลุม, ฟาร์ม...
    "พาณิชยกรรมและสำนักงาน": [11, 17, 19, 21, 25, 31, 32, 43, 44, 16, 18, 27], // อาคารพาณิชย์, โฮมออฟฟิศ, โรงแรม...
    "อุตสาหกรรมและพิเศษ": [13, 45, 36, 23, 28, 30, 34, 35, 37, 38, 41] // โรงงาน, ปั๊มน้ำมัน, โรงพยาบาล...
};

// 1. ฟังก์ชันช่วยแสดงผลเงิน (ย้ายมาไว้ด้านบนเพื่อความเป็นระเบียบ)
const formatMoney = (val) => String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const parseMoney = (val) => parseInt(String(val).replace(/,/g, '')) || 0;

// 2. ฟังก์ชันเติมข้อมูลประเภททรัพย์ (ใช้ allAssetTypeData)
const initTypeDropdown = () => {
    const $typeSelect = $('#search-property-type, #adv-property-type');
    if (!$typeSelect.length || !allAssetTypeData) return;

    // 1. ล้างข้อมูลเก่าและใส่ Default Option
    $typeSelect.empty().append('<option value="">-- เลือกประเภททรัพย์ --</option>');

    // 2. วนลูปตามกลุ่มที่เรานิยามไว้
    Object.keys(typeGroups).forEach(groupName => {
        const idsInGroup = typeGroups[groupName];

        // สร้าง <optgroup>
        const $group = $(`<optgroup label="${groupName}"></optgroup>`);

        // ดึงข้อมูลรายชื่อทรัพย์ที่อยู่ในกลุ่มนี้มาสร้าง <option>
        idsInGroup.forEach(id => {
            const item = allAssetTypeData.find(d => d.id === id);
            if (item) {
                const newOption = new Option(item.typeName, item.id, false, false);
                $group.append(newOption);
            }
        });

        // ถ้ากลุ่มนั้นมีข้อมูล ให้เพิ่มเข้าไปใน Select
        if ($group.children().length > 0) {
            $typeSelect.append($group);
        }
    });

    // 3. (Optional) ตรวจสอบทรัพย์ที่อาจจะตกหล่นจากกลุ่ม (ถ้ามี)
    const assignedIds = Object.values(typeGroups).flat();
    const otherItems = allAssetTypeData.filter(d => !assignedIds.includes(d.id));

    if (otherItems.length > 0) {
        const $otherGroup = $('<optgroup label="อื่นๆ"></optgroup>');
        otherItems.forEach(item => {
            $otherGroup.append(new Option(item.typeName, item.id));
        });
        $typeSelect.append($otherGroup);
    }

    $typeSelect.trigger('change');
};

const districtData = {
    'bkk': ['บางขุนเทียน', 'จตุจักร', 'ลาดพร้าว', 'ปทุมวัน'],
    'nonthaburi': ['เมืองนนทบุรี', 'ปากเกร็ด', 'บางบัวทอง'],
    'pathum': ['คลองหลวง', 'ธัญบุรี', 'ลำลูกกา']
};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);

    // --- EXECUTION ORDER ---
    initTypeDropdown(); // เติมข้อมูลก่อน

    const getSelect2Config = (placeholder) => ({
        placeholder: placeholder,
        allowClear: true,
        closeOnSelect: false,
        width: '100%'
    });

    // Initialize Select2 (เรียกครั้งเดียวต่อ ID)
    const $type = $('#search-property-type, #adv-property-type').select2(getSelect2Config("เลือกประเภททรัพย์"));
    const $province = $('#search-province, #adv-province').select2(getSelect2Config("เลือกจังหวัด"));
    const $district = $('#search-district, #adv-district').select2(getSelect2Config("เลือกอำเภอ/เขต"));

    document.querySelectorAll('.popular-tag').forEach(tag => {
        tag.addEventListener('click', function () {
            const query = this.getAttribute('data-query');
            const keywordInput = document.getElementById('keywordInput');
            if (keywordInput) {
                keywordInput.value = query;
                executeSearch('normal');
            }
        });
    });

    // --- Logic: Select All & Dynamic District ---
    $('select').on('select2:select', function (e) {
        if (e.params.data.id === 'select-all') {
            const $el = $(this);
            const allValues = $el.find('option').not('[value="select-all"]').map(function () { return this.value; }).get();
            $el.val(allValues).trigger('change');
            $el.select2('close');
        }
    });

    $province.on('change', function () {
        const selectedProvinces = $(this).val() || [];
        updateDistrictSelect2(selectedProvinces, $district);
    });

    // --- Event Listeners ---
    const btnNormalSearch = document.getElementById('btn-normal-search');
    const btnAiSearch = document.querySelector('#ai-search .btn--purple');
    const btnReset = document.getElementById('btn-reset');

    btnNormalSearch?.addEventListener('click', () => executeSearch('normal'));
    btnAiSearch?.addEventListener('click', () => executeSearch('ai'));

    btnReset?.addEventListener('click', () => {
        document.getElementById('keywordInput').value = '';
        $type.val(null).trigger('change');
        $province.val(null).trigger('change');
        $district.empty().append('<option value="">อำเภอ/เขต</option>').prop('disabled', true).trigger('change');
    });

    initPriceSlider();

    // --- Auto-fill from URL (ปรับปรุงให้ Robust ขึ้น) ---
    if (urlParams.has('keyword')) {
        document.getElementById('keywordInput').value = urlParams.get('keyword');
    }

    // สำหรับ Types: ใช้ .getAll เพื่อกวาดค่าจาก ?types=9&types=8 มาให้ครบ
    if (urlParams.has('types')) {
        const rawTypes = urlParams.getAll('types');
        // จัดการเรื่อง format: รองรับทั้งแบบ "9,8" และแบบแยกคีย์
        const typeArray = rawTypes.join(',').split(',').map(s => s.trim()).filter(v => v);
        $type.val(typeArray).trigger('change');
    }

    // สำหรับ Provinces: ทำแบบเดียวกันเพื่อให้จำจังหวัดที่เลือกไว้ได้ครบ
    if (urlParams.has('provinces')) {
        const rawProvinces = urlParams.getAll('provinces');
        const provArray = rawProvinces.join(',').split(',').map(s => s.trim()).filter(v => v);
        $province.val(provArray).trigger('change');
    }

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // ป้องกัน Browser รีโหลดหน้าเอง
            executeSearch('normal');
        }
    };

    document.getElementById('keywordInput')?.addEventListener('keydown', handleEnterKey);
    document.getElementById('keywordInputAi')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch('ai');
        }
    });
});

// ฟังก์ชันเหล่านี้ต้องอยู่นอก DOMContentLoaded เพื่อให้เรียกใช้ข้ามกันได้
function updateDistrictSelect2(provinces, $target) {
    if (!$target.length) return;
    $target.empty().append('<option value="select-all">-- เลือกทั้งหมด --</option>');

    if (provinces.length === 0) {
        $target.prop('disabled', true).trigger('change');
        return;
    }

    $target.prop('disabled', false);
    provinces.forEach(prov => {
        if (districtData[prov]) {
            districtData[prov].forEach(dist => {
                $target.append(new Option(dist, dist, false, false));
            });
        }
    });
    $target.trigger('change');
}

export function executeSearch(mode) {
    const params = new URLSearchParams();
    params.set('mode', mode);

    if (mode === 'normal') {
        const keyword = document.getElementById('keywordInput')?.value?.trim();
        const types = $('#search-property-type').val() || [];
        const provinces = $('#search-province').val() || [];
        const districts = $('#search-district').val() || [];
        const i1 = document.getElementById('input-1')?.value;
        const i2 = document.getElementById('input-2')?.value;

        if (keyword) params.set('keyword', keyword);
        if (types.length > 0) params.set('types', types.join(','));
        if (provinces.length > 0) params.set('provinces', provinces.join(','));
        if (districts.length > 0) params.set('district', districts.join(','));

        const minP = parseMoney(i1);
        const maxP = parseMoney(i2);
        if (minP > 0) params.set('minPrice', minP);
        if (maxP > 0) params.set('maxPrice', maxP);

    } else {
        const keywordAi = document.getElementById('keywordInputAi')?.value?.trim();
        if (keywordAi) params.set('ai_query', keywordAi);
    }

    const finalQuery = params.toString();

    // ลอง Debug ดูที่ Console ก่อนครับว่า String ที่ออกมาหน้าตาเป็นยังไง
    console.log("Final Query:", finalQuery);

    if (finalQuery) {
        window.location.href = `/npa/search-results?${finalQuery}`;
    }
}

// ผูกฟังก์ชันเข้ากับ window เพื่อให้ปุ่มใน HTML มองเห็น (สำคัญมากสำหรับ type="module")
window.executeSearch = executeSearch;

function initPriceSlider() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    const i1 = document.getElementById("input-1");
    const i2 = document.getElementById("input-2");
    const track = document.querySelector(".slider-track");

    if (!s1 || !s2 || !i1 || !i2) return; // Exit if not on page

    const minGap = 100000;
    const max = parseInt(s1.max);

    const updateTrack = () => {
        const p1 = (s1.value / max) * 100;
        const p2 = (s2.value / max) * 100;
        if (track) track.style.background = `linear-gradient(to right, rgba(255,255,255,0.2) ${p1}%, #df9faa ${p1}%, #df9faa ${p2}%, rgba(255,255,255,0.2) ${p2}%)`;
    };

    const sync = (type, source = 'slider') => {
        let v1 = source === 'slider' ? parseInt(s1.value) : parseMoney(i1.value);
        let v2 = source === 'slider' ? parseInt(s2.value) : parseMoney(i2.value);

        if (type === 'min') {
            v1 = Math.min(v1, v2 - minGap);
            s1.value = v1;
            i1.value = formatMoney(v1);
        } else {
            v2 = Math.max(v2, v1 + minGap);
            s2.value = v2;
            i2.value = formatMoney(v2);
        }
        updateTrack();
    };

    s1.addEventListener('input', () => sync('min'));
    s2.addEventListener('input', () => sync('max'));
    i1.addEventListener('change', () => sync('min', 'input'));
    i2.addEventListener('change', () => sync('max', 'input'));

    // Numeric filter for inputs
    [i1, i2].forEach(input => {
        input.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = formatMoney(val);
        });
    });

    sync('min'); sync('max'); // Initial call
}