let map;

// Marker ทรัพย์สิน
let markers = [];
let assetMarkerMap = new Map();

// Marker สิ่งอำนวยความสะดวก / จุดสนใจ
let poiMarkers = [];

// Marker ตำแหน่งค้นหา เช่น ตำแหน่งปัจจุบัน หรือจุดที่ user เลือกบนแผนที่
let searchMarker;

let currentMode = 'current';

// State สำหรับ interactive ระหว่าง marker กับ card
let activeAssetId = null;
let assetInfoWindow = null;

// State สำหรับ Places / POI
let placesService = null;
let poiInfoWindow = null;

const POI_CONFIG = {
    school: {
        label: 'โรงเรียน',
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    },
    hospital: {
        label: 'โรงพยาบาล',
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    },
    shopping_mall: {
        label: 'ห้างสรรพสินค้า',
        icon: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
    },
    supermarket: {
        label: 'ซูเปอร์มาร์เก็ต',
        icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    },
    bank: {
        label: 'ธนาคาร',
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    },
    transit_station: {
        label: 'สถานีขนส่ง / รถไฟฟ้า',
        icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
    }
};

// ข้อมูลจำลอง (Mock Data)
const mockAssets = [
    // --- กรุงเทพมหานคร (ProvinceId: 10) ---
    { id: 1, provinceId: 10, provinceName: 'กรุงเทพมหานคร', assetName: 'คอนโด เซอราโน่ พระราม 2', img: '/media/images/asset/sample-property-1.webp', alt: 'เซอราโน่ พระราม 2', assetCode: '3A2176', typeId: 8, location: 'บางขุนเทียน, กรุงเทพมหานคร', area: '32.16', unit: 'ตร.ม.', totalPrice: 1515000, statusId: 1, viewCount: 1250, isRecommended: true, lat: 13.6667, lng: 100.4333 },
    { id: 2, provinceId: 10, provinceName: 'กรุงเทพมหานคร', assetName: 'นาราสิริ บางนา', img: '/media/images/asset/sample-property-2.jpg', alt: 'นาราสิริ บางนา', assetCode: '2B1189', typeId: 9, location: 'บางนา, กรุงเทพมหานคร', area: '60.5', unit: 'ตร.ว.', totalPrice: 7500000, statusId: 2, viewCount: 3420, isRecommended: false, lat: 13.6925, lng: 100.6485 },
    { id: 3, provinceId: 10, provinceName: 'กรุงเทพมหานคร', assetName: 'ทาวน์โฮม สุขุมวิท ใกล้ BTS', img: '/media/images/asset/sample-property-3.jpg', alt: 'ทาวน์โฮม สุขุมวิท', assetCode: '4C5562', typeId: 6, location: 'วัฒนา, กรุงเทพมหานคร', area: '22.0', unit: 'ตร.ว.', totalPrice: 4200000, statusId: 3, viewCount: 890, isRecommended: true, lat: 13.6782, lng: 100.6360 },
    { id: 22, provinceId: 10, provinceName: 'กรุงเทพมหานคร', assetName: 'ASPIRE อ่อนนุช สเตชั่น', img: '/media/images/asset/sample-property-1.webp', alt: 'ASPIRE อ่อนนุช สเตชั่น', assetCode: '3B8176', typeId: 8, location: 'พระโขนง, กรุงเทพมหานคร', area: '45.5', unit: 'ตร.ม.', totalPrice: 3200000, statusId: 1, viewCount: 2100, isRecommended: false, lat: 13.6645, lng: 100.6380 },
    { id: 23, provinceId: 10, provinceName: 'กรุงเทพมหานคร', assetName: 'อาคารพาณิชย์ สีลม ทำเลทอง', img: '/media/images/asset/sample-property-2.jpg', alt: 'อาคารพาณิชย์ สีลม', assetCode: '1D9988', typeId: 11, location: 'บางรัก, กรุงเทพมหานคร', area: '18.0', unit: 'ตร.ว.', totalPrice: 12500000, statusId: 1, viewCount: 4500, isRecommended: true, lat: 13.6810, lng: 100.6450 },

    // --- ปทุมธานี (ProvinceId: 13) ---
    { id: 4, provinceId: 13, provinceName: 'ปทุมธานี', assetName: 'บ้านเดี่ยว รังสิต คลองหลวง', img: '/media/images/asset/sample-property-1.webp', alt: 'บ้านเดี่ยว รังสิต', assetCode: '2B2201', typeId: 9, location: 'ธัญบุรี, ปทุมธานี', area: '50.0', unit: 'ตร.ว.', totalPrice: 3800000, statusId: 1, viewCount: 2100, isRecommended: false, lat: 14.0208, lng: 100.7325 },
    { id: 5, provinceId: 13, provinceName: 'ปทุมธานี', assetName: 'คอนโด คลองหลวง ใกล้ ม.ธรรมศาสตร์', img: '/media/images/asset/sample-property-2.jpg', alt: 'คอนโด คลองหลวง', assetCode: '3A3302', typeId: 8, location: 'คลองหลวง, ปทุมธานี', area: '28.5', unit: 'ตร.ม.', totalPrice: 1250000, statusId: 2, viewCount: 5600, isRecommended: true, lat: 14.0754, lng: 100.6022 },
    { id: 6, provinceId: 13, provinceName: 'ปทุมธานี', assetName: 'ที่ดินเปล่า ลำลูกกา คลอง 4', img: '/media/images/asset/sample-property-3.jpg', alt: 'ที่ดินเปล่า ลำลูกกา', assetCode: '5E0045', typeId: 4, location: 'ลำลูกกา, ปทุมธานี', area: '100.0', unit: 'ตร.ว.', totalPrice: 2200000, statusId: 3, viewCount: 450, isRecommended: false, lat: 13.9317, lng: 100.6811 },
    { id: 24, provinceId: 13, provinceName: 'ปทุมธานี', assetName: 'ทาวน์เฮ้าส์ ลำลูกกา ต่อเติมครบ', img: '/media/images/asset/sample-property-1.webp', alt: 'ทาวน์เฮ้าส์ ลำลูกกา', assetCode: '6T4433', typeId: 6, location: 'ลำลูกกา, ปทุมธานี', area: '18.5', unit: 'ตร.ว.', totalPrice: 1650000, statusId: 1, viewCount: 1100, isRecommended: false },

    // --- ชลบุรี (ProvinceId: 20) ---
    { id: 7, provinceId: 20, provinceName: 'ชลบุรี', assetName: 'คอนโด พัทยา วิวทะเล', img: '/media/images/asset/sample-property-1.webp', alt: 'คอนโด พัทยา', assetCode: '3A4405', typeId: 8, location: 'บางละมุง, ชลบุรี', area: '45.0', unit: 'ตร.ม.', totalPrice: 3500000, statusId: 1, viewCount: 1850, isRecommended: false, lat: 12.9236, lng: 100.8824 },
    { id: 8, provinceId: 20, provinceName: 'ชลบุรี', assetName: 'อาคารพาณิชย์ ศรีราชา ติดถนนใหญ่', img: '/media/images/asset/sample-property-2.jpg', alt: 'อาคารพาณิชย์ ศรีราชา', assetCode: '1D5506', typeId: 11, location: 'ศรีราชา, ชลบุรี', area: '20.0', unit: 'ตร.ว.', totalPrice: 5900000, statusId: 2, viewCount: 920, isRecommended: false, lat: 13.1747, lng: 100.9314 },
    { id: 25, provinceId: 20, provinceName: 'ชลบุรี', assetName: 'โรงงาน พานทอง พร้อมใบอนุญาต', img: '/media/images/asset/sample-property-2.jpg', alt: 'โรงงาน พานทอง', assetCode: '13F7788', typeId: 13, location: 'พานทอง, ชลบุรี', area: '2.5', unit: 'ไร่', totalPrice: 25000000, statusId: 1, viewCount: 3200, isRecommended: true, lat: 13.4705, lng: 101.0944 },
    { id: 9, provinceId: 20, provinceName: 'ชลบุรี', assetName: 'บ้านแฝด อมตะนคร สไตล์โมเดิร์น', img: '/media/images/asset/sample-property-3.jpg', alt: 'บ้านแฝด อมตะนคร', assetCode: '2B6607', typeId: 24, location: 'เมือง, ชลบุรี', area: '38.0', unit: 'ตร.ว.', totalPrice: 2800000, statusId: 3, viewCount: 1100, isRecommended: true },

    // --- ภูเก็ต (ProvinceId: 83) ---
    { id: 10, provinceId: 83, provinceName: 'ภูเก็ต', assetName: 'วิลล่าหรู เชิงทะเล พร้อมสระว่ายน้ำ', img: '/media/images/asset/sample-property-1.webp', alt: 'วิลล่าหรู เชิงทะเล', assetCode: '2B7708', typeId: 9, location: 'ถลาง, ภูเก็ต', area: '120.0', unit: 'ตร.ว.', totalPrice: 15900000, statusId: 1, viewCount: 4300, isRecommended: true, lat: 7.9878, lng: 98.2916 },
    { id: 11, provinceId: 83, provinceName: 'ภูเก็ต', assetName: 'คอนโด ป่าตอง ใกล้หาด', img: '/media/images/asset/sample-property-2.jpg', alt: 'คอนโด ป่าตอง', assetCode: '3A8809', typeId: 8, location: 'กะทู้, ภูเก็ต', area: '35.0', unit: 'ตร.ม.', totalPrice: 4200000, statusId: 2, viewCount: 2750, isRecommended: false, lat: 7.8920, lng: 98.2961 },
    { id: 12, provinceId: 83, provinceName: 'ภูเก็ต', assetName: 'ที่ดิน ราไวย์ วิวภูเขา', img: '/media/images/asset/sample-property-3.jpg', alt: 'ที่ดิน ราไวย์', assetCode: '5E9910', typeId: 4, location: 'เมือง, ภูเก็ต', area: '80.0', unit: 'ตร.ว.', totalPrice: 6500000, statusId: 3, viewCount: 620, isRecommended: false },

    // --- เชียงใหม่ (ProvinceId: 50) ---
    { id: 13, provinceId: 50, provinceName: 'เชียงใหม่', assetName: 'บ้านไม้สัก หางดง บรรยากาศเหนือ', img: '/media/images/asset/sample-property-1.webp', alt: 'บ้านไม้สัก หางดง', assetCode: '2B1011', typeId: 9, location: 'หางดง, เชียงใหม่', area: '150.0', unit: 'ตร.ว.', totalPrice: 8900000, statusId: 1, viewCount: 1500, isRecommended: true, lat: 18.6861, lng: 98.9165 },
    { id: 14, provinceId: 50, provinceName: 'เชียงใหม่', assetName: 'คอนโด นิมมาน ใจกลางย่านธุรกิจ', img: '/media/images/asset/sample-property-2.jpg', alt: 'คอนโด นิมมาน', assetCode: '3A1112', typeId: 8, location: 'เมือง, เชียงใหม่', area: '30.0', unit: 'ตร.ม.', totalPrice: 2400000, statusId: 2, viewCount: 3100, isRecommended: false, lat: 18.7996, lng: 98.9675 },
    { id: 15, provinceId: 50, provinceName: 'เชียงใหม่', assetName: 'ตึกแถว กาดหลวง ค้าขายคล่อง', img: '/media/images/asset/sample-property-3.jpg', alt: 'ตึกแถว กาดหลวง', assetCode: '1D1213', typeId: 11, location: 'เมือง, เชียงใหม่', area: '16.0', unit: 'ตร.ว.', totalPrice: 7200000, statusId: 3, viewCount: 1200, isRecommended: false },

    // --- ระยอง (ProvinceId: 21) ---
    {
        id: 16, provinceId: 21, provinceName: 'ระยอง', assetName: 'บ้านเดี่ยว ปลวกแดง ใกล้นิคม', img: '/media/images/asset/sample-property-1.webp', alt: 'บ้านเดี่ยว ปลวกแดง', assetCode: '2B1314', typeId: 9, location: 'ปลวกแดง, ระยอง', area: '45.0', unit: 'ตร.ว.', totalPrice: 2100000, statusId: 1, viewCount: 880, isRecommended: false,
        bed: 3, bath: 5, lat: 12.9758, lng: 101.2154,
        promotions: ['SAM ทรัพย์มือสองบอกต่อ', 'ฟรี! ค่าโอนคนละครึ่ง', 'ลดราคาพิเศษประจำเดือน']
    },
    { id: 17, provinceId: 21, provinceName: 'ระยอง', assetName: 'ที่ดิน มาบตาพุด ผังเมืองสีม่วง', img: '/media/images/asset/sample-property-2.jpg', alt: 'ที่ดิน มาบตาพุด', assetCode: '5E1415', typeId: 4, location: 'เมือง, ระยอง', area: '2.0', unit: 'ไร่', totalPrice: 12000000, statusId: 2, viewCount: 540, isRecommended: false, lat: 12.6660, lng: 101.1474 },
    { id: 18, provinceId: 21, provinceName: 'ระยอง', assetName: 'คอนโด แกลง ติดชายหาดดวงตะวัน', img: '/media/images/asset/sample-property-3.jpg', alt: 'คอนโด แกลง', assetCode: '3A1516', typeId: 8, location: 'แกลง, ระยอง', area: '40.0', unit: 'ตร.ม.', totalPrice: 3200000, statusId: 3, viewCount: 720, isRecommended: false },

    // --- นครราชสีมา (ProvinceId: 30) ---
    { id: 19, provinceId: 30, provinceName: 'นครราชสีมา', assetName: 'บ้านสวน ปากช่อง ใกล้เขาใหญ่', img: '/media/images/asset/sample-property-1.webp', alt: 'บ้านสวน ปากช่อง', assetCode: '2B1617', typeId: 9, location: 'ปากช่อง, นครราชสีมา', area: '80.0', unit: 'ตร.ว.', totalPrice: 5500000, statusId: 1, viewCount: 2800, isRecommended: true, lat: 14.7081, lng: 101.4170 },
    { id: 20, provinceId: 30, provinceName: 'นครราชสีมา', assetName: 'ทาวน์โฮม โคราช ใกล้เซ็นทรัล', img: '/media/images/asset/sample-property-2.jpg', alt: 'ทาวน์โฮม โคราช', assetCode: '4C1718', typeId: 6, location: 'เมือง, นครราชสีมา', area: '20.0', unit: 'ตร.ว.', totalPrice: 1800000, statusId: 2, viewCount: 1400, isRecommended: false },
    { id: 21, provinceId: 30, provinceName: 'นครราชสีมา', assetName: 'อาคารพาณิชย์ บัวใหญ่ แหล่งชุมชน', img: '/media/images/asset/sample-property-3.jpg', alt: 'อาคารพาณิชย์ บัวใหญ่', assetCode: '1D1819', typeId: 11, location: 'บัวใหญ่, นครราชสีมา', area: '18.0', unit: 'ตร.ว.', totalPrice: 3400000, statusId: 3, viewCount: 650, isRecommended: false }
];

// 1. กำหนดค่า Configuration สำหรับสถานะ
const STATUS_CONFIG = {
    1: { label: 'ซื้อตรง', class: 'card__badge--direct' },
    2: { label: 'ขายทอดตลาด', class: 'card__badge--auction' },
    3: { label: 'รอประกาศราคา', class: 'card__badge--waiting' }
};

function getDefaultAssetIcon() {
    return {
        url: '/media/images/sam-marker36.svg'
    };
}

function getActiveAssetIcon() {
    return {
        url: '/media/images/sam-marker36.svg'
    };
}

// 2. ฟังก์ชัน Helper สำหรับจัดการรูปแบบตัวเลขราคา
function formatPrice(price) {
    if (!price || price === 0) return "รอประกาศราคา";
    return new Intl.NumberFormat('th-TH').format(price);
}

// 3. ฟังก์ชัน Render Card (ปรับปรุงใหม่)
function renderCard(asset) {
    const status = STATUS_CONFIG[asset.statusId] || STATUS_CONFIG[1];
    const detailUrl = `/asset-detail/${asset.assetCode}`;

    const html = `

        <div class="card card--asset-map mb-lg-3 js-asset-card" data-asset-id="${asset.id}"
            tabindex="0">
            <div class="card__figure">
                <img src="${asset.img}" alt="${asset.alt || asset.assetName}" class="card__image" />
                <div class="card__badge ${status.class}">${status.label}</div>
            </div>
            <div class="card__body">
                <div class="card__title">
                    ${asset.assetName}
                </div>
                <div class="card__location">
                    <div class="card__location-icon"><svg class="icon"><use xlink:href="#icon-placeholder"></use></svg></div>
                    <div class="card__location-text">${asset.location}</div>
                </div>
                <div class="card__price">
                    ${formatPrice(asset.totalPrice)} 
                    ${asset.totalPrice > 0 ? 'บาท' : ''}
                </div>
                <div class="card__actions mt-2">
                    <button 
                        type="button" 
                        class="btn btn--sam-gray js-focus-marker"
                        data-asset-id="${asset.id}"
                        aria-label="ดู ${asset.assetName} บนแผนที่"
                    >
                        ดูบนแผนที่
                    </button>
                    <a href="${detailUrl}" class="btn btn--sam-green">
                        <span class="btn__text">รายละเอียด</span>
                    </a>
                </div>
            </div>
            <!-- <a href="${detailUrl}" class="stretched-link"></a> -->
        </div>
    `;
    document.getElementById('asset-results').insertAdjacentHTML('beforeend', html);
}

function initMap() {
    // 1. สร้าง Map เริ่มต้น (ใส่พิกัดกลางกรุงเทพไว้สำรอง)
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 13.7563, lng: 100.5018 },
        zoom: 14,
        disableDefaultUI: true,
        styles: [ /* ใส่ Styles แผนที่ของคุณที่นี่ */ ]
    });

    placesService = new google.maps.places.PlacesService(map);
    poiInfoWindow = new google.maps.InfoWindow();
    assetInfoWindow = new google.maps.InfoWindow();

    bindAssetCardEvents();

    // 2. เมื่อโหลดหน้าเสร็จ ให้เรียกใช้ตำแหน่งปัจจุบันทันที
    handleFirstLoad();

    // คลิกสลับโหมด
    document.getElementById('btn-current-loc').addEventListener('click', function() {
        setMode('current');
    });

    document.getElementById('btn-select-map').addEventListener('click', function() {
        setMode('select');
    });

    // ฟังก์ชั่นค้นหา
    const searchBtn = document.querySelector('.btn-search');
    if(searchBtn) searchBtn.addEventListener('click', startSearch);

    // ปุ่มล้างข้อมูล (เพิ่ม ID 'btn-clear' ใน HTML ของคุณ)
    const clearBtn = document.getElementById('btn-clear');
    if(clearBtn) clearBtn.addEventListener('click', clearSearch);
}

async function handleFirstLoad() {
    if (navigator.geolocation) {
        // แสดง Loading หรือบอกผู้ใช้ว่ากำลังระบุตำแหน่ง...
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // เลื่อนแผนที่ไปหาผู้ใช้
                map.setCenter(userPos);
                
                // ปักหมุดตำแหน่งปัจจุบันของผู้ใช้
                if (searchMarker) searchMarker.setMap(null);
                searchMarker = new google.maps.Marker({
                    position: userPos,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "white",
                        strokeWeight: 2,
                    },
                    title: "ตำแหน่งของคุณ"
                });

                // ตั้งค่า Dropdown รัศมีเป็น 3 กม. (ถ้ามีใน HTML)
                const radiusSelect = document.getElementById('radius');
                if (radiusSelect) radiusSelect.value = "5";

                // สั่งค้นหาทันที
                performFilter(userPos);
            },
            (error) => {
                console.error("Error identifying location:", error);
                let userMessage = "";
                switch(error.code) {
                    case 1:
                        userMessage = "คุณปฏิเสธการเข้าถึงตำแหน่ง ระบบจะแสดงผลในโซนบางนา-ประเวศแทน";
                        break;
                    case 2:
                        userMessage = "ไม่สามารถระบุตำแหน่งได้ (Position Unavailable)";
                        break;
                    case 3:
                        userMessage = "หมดเวลาการค้นหาตำแหน่ง (Timeout)";
                        break;
                }
                
                // แสดง Alert หรือ Toast แจ้งผู้ใช้
                alert(userMessage);

                // เลื่อนไปยังพิกัดสำรองเพื่อให้หน้าเว็บยังทำงานต่อไปได้
                const defaultPos = { lat: 13.6750, lng: 100.6330 }; // บางนา
                map.setCenter(defaultPos);
                performFilter(defaultPos);
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
    }
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
    
    if (mode === 'current') {
        document.getElementById('btn-current-loc').classList.add('active');
        // ล้างหมุดเลือกเองออกเมื่อกลับมาโหมดปัจจุบัน
        if (searchMarker) searchMarker.setMap(null);
        searchMarker = null; 
        handleFirstLoad();
    } else {
        document.getElementById('btn-select-map').classList.add('active');
        // ล้างหมุดเก่า (ถ้ามี) เพื่อบังคับให้ผู้ใช้จิ้มใหม่ในโหมดนี้
        if (searchMarker) searchMarker.setMap(null);
        searchMarker = null;

        // ลบ Listener เก่าป้องกันการซ้อน
        google.maps.event.clearListeners(map, 'click');
        map.addListener('click', (mapsMouseEvent) => {
            if (currentMode === 'select') placeSearchMarker(mapsMouseEvent.latLng);
        });
    }
}

function placeSearchMarker(location) {
    if (searchMarker) searchMarker.setMap(null);
    searchMarker = new google.maps.Marker({
        position: location,
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        draggable: true
    });
}

function startSearch() {
    if (currentMode === 'current') {
        if (navigator.geolocation) {
            // แสดง Loading ระหว่างรอพิกัด (Optional แต่แนะนำ)
            Swal.fire({
                title: 'กำลังระบุตำแหน่ง...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            navigator.geolocation.getCurrentPosition((position) => {
                Swal.close(); // ปิด Loading
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                map.setCenter(pos);
                performFilter(pos);
            }, (error) => {
                Swal.close();
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้', 'error');
            });
        }
    } else {
        // โหมดเลือกจากแผนที่: ใช้ SweetAlert แจ้งเตือน
        if (!searchMarker || !searchMarker.getMap()) {
            Swal.fire({
                title: 'ไม่พบตำแหน่งที่เลือก',
                text: 'กรุณาคลิกเลือกตำแหน่งบนแผนที่ก่อนกดค้นหา',
                icon: 'warning',
                confirmButtonText: 'รับทราบ',
                customClass: {
                    confirmButton: 'btn btn--sam-green'
                }
            });
            return;
        }
        
        performFilter(searchMarker.getPosition().toJSON());
    }
}

function performFilter(centerPos) {
    const radiusElement = document.getElementById('radius');
    const radius = radiusElement ? parseFloat(radiusElement.value) : 3;

    // ล้าง Marker ทรัพย์เดิม
    markers.forEach(m => m.setMap(null));
    markers = [];
    assetMarkerMap.clear();
    activeAssetId = null;

    if (assetInfoWindow) {
        assetInfoWindow.close();
    }

    const resultsContainer = document.getElementById('asset-results');
    resultsContainer.innerHTML = '';

    let foundAssets = 0;

    mockAssets.forEach(asset => {
        if (!asset.lat || !asset.lng) return;

        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(centerPos.lat, centerPos.lng),
            new google.maps.LatLng(asset.lat, asset.lng)
        );

        if (distance <= radius * 1000) {
            addAssetMarker(asset);
            renderCard(asset);
            foundAssets++;
        }
    });

    if (foundAssets === 0) {
        resultsContainer.innerHTML = '<div class="no-result"><div class="mb-2"><i class="bi bi-house-x"></i></div><div>ไม่พบรายการทรัพย์ภายในรัศมีที่กำหนด</div></div>';
    }

    // เพิ่ม Section แสดงสิ่งอำนวยความสะดวก
    renderPoiSectionLoading();

    // ค้นหาสิ่งอำนวยความสะดวกรอบตำแหน่งค้นหา
    searchNearbyAmenities(centerPos, radius);
}

function addAssetMarker(asset) {
    if (!asset.lat || !asset.lng) return;

    const marker = new google.maps.Marker({
        position: { lat: asset.lat, lng: asset.lng },
        map: map,
        title: asset.assetName,
        icon: getDefaultAssetIcon()
    });

    marker.assetId = asset.id;

    // Hover pin: แสดง InfoWindow + highlight card
    marker.addListener('mouseover', () => {
        activateAsset(asset.id, {
            panTo: false,
            zoom: false,
            openInfoWindow: true,
            scrollToCard: false
        });
    });

    // Mouse ออกจาก pin: ปิด InfoWindow + reset active state
    marker.addListener('mouseout', () => {
        clearActiveAsset({
            closeInfoWindow: true
        });
    });

    // Click pin: แสดง InfoWindow + scroll ไปยังรายการทรัพย์
    marker.addListener('click', () => {
        activateAsset(asset.id, {
            panTo: false,
            zoom: false,
            openInfoWindow: true,
            scrollToCard: true
        });
    });

    markers.push(marker);

    assetMarkerMap.set(String(asset.id), {
        marker,
        asset
    });
}

// เพิ่มฟังก์ชันล้างข้อมูล (Clear)
function clearSearch() {
    markers.forEach(m => m.setMap(null));
    markers = [];
    assetMarkerMap.clear();
    activeAssetId = null;

    if (assetInfoWindow) {
        assetInfoWindow.close();
    }

    if (typeof clearPoiMarkers === 'function') {
        clearPoiMarkers();
    }

    if (searchMarker) {
        searchMarker.setMap(null);
        searchMarker = null;
    }

    const resultsContainer = document.getElementById('asset-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="no-result">กรุณากดค้นหาเพื่อดูรายการทรัพย์</div>';
    }

    console.log("Cleared all markers, active asset and results");
}

function getSelectedPoiTypes() {
    return Array.from(document.querySelectorAll('input[name="poi-type"]:checked'))
        .map(input => input.value);
}

function clearPoiMarkers() {
    if (!Array.isArray(poiMarkers)) {
        poiMarkers = [];
        return;
    }

    poiMarkers.forEach(marker => {
        if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
        }
    });

    poiMarkers = [];
}

function renderPoiSectionLoading() {
    const resultsContainer = document.getElementById('poi--wrapper');

    const html = `
        <div class="poi-results" id="poi-results">
            <div class="poi-results__header">
                <div class="poi-results__title">สิ่งอำนวยความสะดวกใกล้เคียง</div>
                <div class="poi-results__subtitle">กำลังค้นหาข้อมูลรอบบริเวณ...</div>
            </div>
            <div class="poi-results__list" id="poi-results-list"></div>
        </div>
    `;

    resultsContainer.insertAdjacentHTML('beforeend', html);
}

function searchNearbyAmenities(centerPos, radiusKm) {
    if (!placesService) return;

    const selectedTypes = getSelectedPoiTypes();
    const poiList = document.getElementById('poi-results-list');
    const poiResults = document.getElementById('poi-results');

    if (!poiList || !poiResults) return;

    if (selectedTypes.length === 0) {
        poiResults.querySelector('.poi-results__subtitle').textContent = 'ไม่ได้เลือกประเภทจุดสนใจ';
        poiList.innerHTML = '<div class="poi-results__empty">กรุณาเลือกประเภทจุดสนใจอย่างน้อย 1 รายการ</div>';
        return;
    }

    poiList.innerHTML = '';
    poiResults.querySelector('.poi-results__subtitle').textContent = 'กำลังค้นหาข้อมูลรอบบริเวณ...';

    const center = new google.maps.LatLng(centerPos.lat, centerPos.lng);
    const searchRadius = Math.min(radiusKm * 1000, 5000); // จำกัดไว้ไม่เกิน 5 กม. เพื่อไม่ให้ผลลัพธ์เยอะเกิน

    const allPlaces = new Map();
    let completedRequests = 0;

    selectedTypes.forEach(type => {
        const request = {
            location: center,
            radius: searchRadius,
            type: type
        };

        placesService.nearbySearch(request, (results, status) => {
            completedRequests++;

            if (status === google.maps.places.PlacesServiceStatus.OK && Array.isArray(results)) {
                results.slice(0, 5).forEach(place => {
                    if (!place.place_id || allPlaces.has(place.place_id)) return;

                    allPlaces.set(place.place_id, {
                        ...place,
                        poiType: type
                    });
                });
            }

            if (completedRequests === selectedTypes.length) {
                renderPoiResults(Array.from(allPlaces.values()), center);
            }
        });
    });
}

function renderPoiResults(places, center) {
    const poiList = document.getElementById('poi-results-list');
    const poiResults = document.getElementById('poi-results');

    if (!poiList || !poiResults) return;

    clearPoiMarkers();

    if (places.length === 0) {
        poiResults.querySelector('.poi-results__subtitle').textContent = 'ไม่พบจุดสนใจในรัศมีที่กำหนด';
        poiList.innerHTML = '<div class="poi-results__empty">ไม่พบสิ่งอำนวยความสะดวกใกล้เคียง</div>';
        return;
    }

    poiResults.querySelector('.poi-results__subtitle').textContent = `พบ ${places.length} รายการใกล้บริเวณที่ค้นหา`;

    const sortedPlaces = places
        .map(place => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                center,
                place.geometry.location
            );

            return {
                ...place,
                distance
            };
        })
        .sort((a, b) => a.distance - b.distance);

    sortedPlaces.forEach(place => {
        addPoiMarker(place);
        renderPoiItem(place);
    });
}

function addPoiMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const config = POI_CONFIG[place.poiType] || {
        label: 'จุดสนใจ',
        icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
    };

    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: config.icon
    });

    marker.addListener('click', () => {
        const rating = place.rating ? `<div>คะแนน: ${place.rating}</div>` : '';
        const vicinity = place.vicinity ? `<div>${place.vicinity}</div>` : '';

        poiInfoWindow.setContent(`
            <div class="poi-info-window">
                <strong>${place.name}</strong>
                <div>${config.label}</div>
                ${rating}
                ${vicinity}
            </div>
        `);

        poiInfoWindow.open(map, marker);
    });

    poiMarkers.push(marker);
}

function renderPoiItem(place) {
    const poiList = document.getElementById('poi-results-list');
    if (!poiList) return;

    const config = POI_CONFIG[place.poiType] || { label: 'จุดสนใจ' };
    const distanceKm = place.distance / 1000;
    const rating = place.rating ? `<span class="poi-card__rating">★ ${place.rating}</span>` : '';

    const html = `
        <button type="button" class="poi-card" onclick="focusPoi('${place.place_id}')">
            <div class="poi-card__body">
                <div class="poi-card__meta">
                    <span class="poi-card__type">${config.label}</span>
                    ${rating}
                </div>
                <div class="poi-card__title">${place.name}</div>
                <div class="poi-card__address">${place.vicinity || ''}</div>
                <div class="poi-card__distance">ประมาณ ${distanceKm.toFixed(1)} กม.</div>
            </div>
        </button>
    `;

    poiList.insertAdjacentHTML('beforeend', html);

    // เก็บ place_id ไว้กับ marker เพื่อใช้ focus
    const lastMarker = poiMarkers[poiMarkers.length - 1];
    if (lastMarker) {
        lastMarker.placeId = place.place_id;
    }
}

function focusPoi(placeId) {
    const marker = poiMarkers.find(m => m.placeId === placeId);

    if (!marker) return;

    map.setCenter(marker.getPosition());
    map.setZoom(17);

    google.maps.event.trigger(marker, 'click');
}

function bindAssetCardEvents() {
    const resultsContainer = document.getElementById('asset-results');
    if (!resultsContainer) return;

    resultsContainer.addEventListener('mouseover', (event) => {
        const card = event.target.closest('.js-asset-card');
        if (!card) return;

        const assetId = card.dataset.assetId;
        if (!assetId) return;

        activateAsset(assetId, {
            panTo: false,
            zoom: false,
            openInfoWindow: true,
            scrollToCard: false,
            temporary: true
        });
    });

    resultsContainer.addEventListener('mouseout', (event) => {
        const card = event.target.closest('.js-asset-card');
        if (!card) return;

        const relatedTarget = event.relatedTarget;

        // ถ้า mouse ยังอยู่ภายใน card เดิม ไม่ต้องปิด
        if (relatedTarget && card.contains(relatedTarget)) return;

        clearActiveAsset({
            closeInfoWindow: true
        });
    });

    resultsContainer.addEventListener('focusin', (event) => {
        const card = event.target.closest('.js-asset-card');
        if (!card) return;

        const assetId = card.dataset.assetId;
        if (!assetId) return;

        activateAsset(assetId, {
            panTo: false,
            zoom: false,
            openInfoWindow: true,
            scrollToCard: false
        });
    });

    resultsContainer.addEventListener('focusout', (event) => {
        const card = event.target.closest('.js-asset-card');
        if (!card) return;

        const relatedTarget = event.relatedTarget;

        // ถ้า focus ยังวนอยู่ใน card เดิม ไม่ต้องปิด
        if (relatedTarget && card.contains(relatedTarget)) return;

        clearActiveAsset({
            closeInfoWindow: true
        });
    });

    resultsContainer.addEventListener('click', (event) => {
        const focusButton = event.target.closest('.js-focus-marker');
        if (!focusButton) return;

        event.preventDefault();
        event.stopPropagation();

        const assetId = focusButton.dataset.assetId;
        if (!assetId) return;

        activateAsset(assetId, {
            panTo: true,
            zoom: true,
            openInfoWindow: true,
            scrollToCard: false
        });
    });
}

function activateAsset(assetId, options = {}) {
    const {
        panTo = true,
        zoom = true,
        openInfoWindow = true,
        scrollToCard = true
    } = options;

    const markerData = assetMarkerMap.get(String(assetId));
    if (!markerData) return;

    const { marker, asset } = markerData;

    clearActiveAsset({
        closeInfoWindow: false
    });

    activeAssetId = String(assetId);

    marker.setIcon(getActiveAssetIcon());
    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

    const card = getAssetCard(assetId);
    if (card) {
        card.classList.add('is-active');
    }

    if (panTo) {
        map.panTo(marker.getPosition());
    }

    if (zoom) {
        map.setZoom(17);
    }

    if (openInfoWindow) {
        openAssetInfoWindow(marker, asset);
    }

    if (scrollToCard) {
        scrollToAssetCard(assetId);
    }
}

function clearActiveAsset(options = {}) {
    const {
        closeInfoWindow = false
    } = options;

    if (activeAssetId) {
        const previousMarkerData = assetMarkerMap.get(String(activeAssetId));

        if (previousMarkerData) {
            previousMarkerData.marker.setIcon(getDefaultAssetIcon());
            previousMarkerData.marker.setZIndex(null);
        }
    }

    document.querySelectorAll('.js-asset-card.is-active').forEach(card => {
        card.classList.remove('is-active');
    });

    if (closeInfoWindow && assetInfoWindow) {
        assetInfoWindow.close();
    }

    activeAssetId = null;
}

function openAssetInfoWindow(marker, asset) {
    if (!assetInfoWindow) return;

    const detailUrl = `/asset-detail/${asset.assetCode}`;

    assetInfoWindow.setContent(`
        <div class="asset-info-window">
            <a href="${detailUrl}" class="asset-info-window__figure">
                <img src="${asset.img}" alt="${asset.alt || asset.assetName}" class="asset-info-window__image" />
            </a>
            
            <div class="asset-info-window__title">
                ${asset.assetName}
            </div>

            <div class="asset-info-window__location">
                ${asset.location}
            </div>

            <!-- <div class="asset-info-window__price">
                ${formatPrice(asset.totalPrice)} ${asset.totalPrice > 0 ? 'บาท' : ''}
            </div> -->

            <!-- <a href="${detailUrl}" class="asset-info-window__link">
                ดูรายละเอียด
            </a> -->
        </div>
    `);

    assetInfoWindow.open(map, marker);
}

function scrollToAssetCard(assetId) {
    const card = getAssetCard(assetId);
    const resultSidebar = document.getElementById('result-sidebar');

    if (!card) return;

    if (resultSidebar) {
        const sidebarRect = resultSidebar.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        resultSidebar.scrollTo({
            top: resultSidebar.scrollTop + cardRect.top - sidebarRect.top - 16,
            behavior: 'smooth'
        });
    } else {
        card.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function getAssetCard(assetId) {
    return document.querySelector(`.js-asset-card[data-asset-id="${assetId}"]`);
}

// เพิ่มฟังก์ชันซูมไปที่พิกัดเมื่อคลิก Card
function focusMarker(lat, lng) {
    map.setCenter({lat, lng});
    map.setZoom(17);
}