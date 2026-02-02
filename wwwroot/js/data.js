export const heroBannerData = [
    {
        id: 1,
        desktopImg: '/media/images/hero/demo-banner-1.webp',
        mobileImg: '/media/images/hero/demo-banner-mobile-1.webp',
        alt: 'SAM ใส่ใจ โครงการปิดหนี้'
    },
    {
        id: 2,
        desktopImg: '/media/images/hero/demo-banner-2.webp',
        mobileImg: '/media/images/hero/demo-banner-mobile-1.webp',
        alt: 'รายการทรัพย์ประมูลมือสอง'
    }
];

export const serviceData = [
    { id: '01', label: 'โครงการปิดหนี้ไวไปต่อได้', url: '/debt-relief' },
    { id: '02', label: 'รายการทรัพย์ประมูล', url: '/auction-items' },
    { id: '03', label: 'บ้าน SAM ผ่อนได้', url: '/sam-installment' },
    { id: '04', label: 'SAM ทรัพย์มือสองต้องบอกต่อ', url: '/second-hand-property' }
];

export const assetListData = [
    // --- กรุงเทพมหานคร (BKK) ---
    {
        id: 1,
        img: '/media/images/asset/sample-property-1.webp',
        alt: 'เซอราโน่ พระราม 2',
        assetCode: '3A2176',
        assetType: 'อาคารชุด',
        location: 'เขต บางขุนเทียน จังหวัด กรุงเทพมหานคร',
        area: '32.16',
        unit: 'ตร.ม.',
        totalPrice: 1515000,
        saleStatus: 'ซื้อตรง'
    },
    {
        id: 2,
        img: '/media/images/asset/sample-property-2.jpg',
        alt: 'บ้านเดี่ยว ลาดพร้าว',
        assetCode: '2B1189',
        assetType: 'บ้านเดี่ยว',
        location: 'เขต ลาดพร้าว จังหวัด กรุงเทพมหานคร',
        area: '60.5',
        unit: 'ตร.ว.',
        totalPrice: 7500000,
        saleStatus: 'ประมูล'
    },
    {
        id: 3,
        img: '/media/images/asset/sample-property-3.jpg',
        alt: 'ทาวน์โฮม สุขุมวิท',
        assetCode: '4C5562',
        assetType: 'ทาวน์เฮาส์',
        location: 'เขต วัฒนา จังหวัด กรุงเทพมหานคร',
        area: '22.0',
        unit: 'ตร.ว.',
        totalPrice: 4200000,
        saleStatus: 'รอประกาศราคา'
    },

    // --- ปทุมธานี (PTE) ---
    {
        id: 4,
        img: '/media/images/asset/sample-property-1.webp',
        alt: 'บ้านเดี่ยว รังสิต',
        assetCode: '2B2201',
        assetType: 'บ้านเดี่ยว',
        location: 'อำเภอ ธัญบุรี จังหวัด ปทุมธานี',
        area: '50.0',
        unit: 'ตร.ว.',
        totalPrice: 3800000,
        saleStatus: 'ซื้อตรง'
    },
    {
        id: 5,
        img: '/media/images/asset/sample-property-2.jpg',
        alt: 'คอนโด ใกล้ ม.ธรรมศาสตร์',
        assetCode: '3A3302',
        assetType: 'อาคารชุด',
        location: 'อำเภอ คลองหลวง จังหวัด ปทุมธานี',
        area: '28.5',
        unit: 'ตร.ม.',
        totalPrice: 1250000,
        saleStatus: 'ประมูล'
    },
    {
        id: 6,
        img: '/media/images/asset/sample-property-3.jpg',
        alt: 'ที่ดินเปล่า ลำลูกกา',
        assetCode: '5E0045',
        assetType: 'ที่ดินเปล่า',
        location: 'อำเภอ ลำลูกกา จังหวัด ปทุมธานี',
        area: '100.0',
        unit: 'ตร.ว.',
        totalPrice: 2200000,
        saleStatus: 'รอประกาศราคา'
    },

    // --- ชลบุรี (CBI) ---
    {
        id: 7,
        img: '/media/images/asset/sample-property-1.webp',
        alt: 'คอนโดวิวทะเล พัทยา',
        assetCode: '3A4405',
        assetType: 'อาคารชุด',
        location: 'อำเภอ บางละมุง จังหวัด ชลบุรี',
        area: '45.0',
        unit: 'ตร.ม.',
        totalPrice: 3500000,
        saleStatus: 'ซื้อตรง'
    },
    {
        id: 8,
        img: '/media/images/asset/sample-property-2.jpg',
        alt: 'อาคารพาณิชย์ ศรีราชา',
        assetCode: '1D5506',
        assetType: 'อาคารพาณิชย์',
        location: 'อำเภอ ศรีราชา จังหวัด ชลบุรี',
        area: '20.0',
        unit: 'ตร.ว.',
        totalPrice: 5900000,
        saleStatus: 'ประมูล'
    },
    {
        id: 9,
        img: '/media/images/asset/sample-property-3.jpg',
        alt: 'บ้านแฝด อมตะนคร',
        assetCode: '2B6607',
        assetType: 'บ้านเดี่ยว',
        location: 'อำเภอ เมือง จังหวัด ชลบุรี',
        area: '38.0',
        unit: 'ตร.ว.',
        totalPrice: 2800000,
        saleStatus: 'รอประกาศราคา'
    },

    // --- ภูเก็ต (PKT) ---
    {
        id: 10,
        img: '/media/images/asset/sample-property-1.webp',
        alt: 'วิลล่าหรู เชิงทะเล',
        assetCode: '2B7708',
        assetType: 'บ้านเดี่ยว',
        location: 'อำเภอ ถลาง จังหวัด ภูเก็ต',
        area: '120.0',
        unit: 'ตร.ว.',
        totalPrice: 15900000,
        saleStatus: 'ซื้อตรง'
    },
    {
        id: 11,
        img: '/media/images/asset/sample-property-2.jpg',
        alt: 'คอนโด ป่าตอง',
        assetCode: '3A8809',
        assetType: 'อาคารชุด',
        location: 'อำเภอ กะทู้ จังหวัด ภูเก็ต',
        area: '35.0',
        unit: 'ตร.ม.',
        totalPrice: 4200000,
        saleStatus: 'ประมูล'
    },
    {
        id: 12,
        img: '/media/images/asset/sample-property-3.jpg',
        alt: 'ที่ดินเปล่า ราไวย์',
        assetCode: '5E9910',
        assetType: 'ที่ดินเปล่า',
        location: 'อำเภอ เมือง จังหวัด ภูเก็ต',
        area: '80.0',
        unit: 'ตร.ว.',
        totalPrice: 6500000,
        saleStatus: 'รอประกาศราคา'
    },

    // --- เชียงใหม่ (CMI) ---
    {
        id: 13,
        img: '/media/images/asset/sample-property-1.webp',
        alt: 'บ้านไม้สัก หางดง',
        assetCode: '2B1011',
        assetType: 'บ้านเดี่ยว',
        location: 'อำเภอ หางดง จังหวัด เชียงใหม่',
        area: '150.0',
        unit: 'ตร.ว.',
        totalPrice: 8900000,
        saleStatus: 'ซื้อตรง'
    },
    {
        id: 14,
        img: '/media/images/asset/sample-property-2.jpg',
        alt: 'คอนโด นิมมาน',
        assetCode: '3A1112',
        assetType: 'อาคารชุด',
        location: 'อำเภอ เมือง จังหวัด เชียงใหม่',
        area: '30.0',
        unit: 'ตร.ม.',
        totalPrice: 2400000,
        saleStatus: 'ประมูล'
    },
    {
        id: 15,
        img: '/media/images/asset/sample-property-3.jpg',
        alt: 'ตึกแถว กาดหลวง',
        assetCode: '1D1213',
        assetType: 'อาคารพาณิชย์',
        location: 'อำเภอ เมือง จังหวัด เชียงใหม่',
        area: '16.0',
        unit: 'ตร.ว.',
        totalPrice: 7200000,
        saleStatus: 'รอประกาศราคา'
    },

    // --- ระยอง (RYG) ---
    {
        id: 16,
        img: '/media/images/asset/sample-property-1.webp',
        alt: 'บ้านเดี่ยว ปลวกแดง',
        assetCode: '2B1314',
        assetType: 'บ้านเดี่ยว',
        location: 'อำเภอ ปลวกแดง จังหวัด ระยอง',
        area: '45.0',
        unit: 'ตร.ว.',
        totalPrice: 2100000,
        saleStatus: 'ซื้อตรง'
    },
    {
        id: 17,
        img: '/media/images/asset/sample-property-2.jpg',
        alt: 'ที่ดินอุตสาหกรรม มาบตาพุด',
        assetCode: '5E1415',
        assetType: 'ที่ดินเปล่า',
        location: 'อำเภอ เมือง จังหวัด ระยอง',
        area: '2.0',
        unit: 'ไร่',
        totalPrice: 12000000,
        saleStatus: 'ประมูล'
    },
    {
        id: 18,
        img: '/media/images/asset/sample-property-3.jpg',
        alt: 'คอนโดติดหาด แม่พิมพ์',
        assetCode: '3A1516',
        assetType: 'อาคารชุด',
        location: 'อำเภอ แกลง จังหวัด ระยอง',
        area: '40.0',
        unit: 'ตร.ม.',
        totalPrice: 3200000,
        saleStatus: 'รอประกาศราคา'
    },

    // --- นครราชสีมา (KOR) ---
    {
        id: 19,
        img: '/media/images/asset/sample-property-1.webp',
        alt: 'บ้านสวย ปากช่อง',
        assetCode: '2B1617',
        assetType: 'บ้านเดี่ยว',
        location: 'อำเภอ ปากช่อง จังหวัด นครราชสีมา',
        area: '80.0',
        unit: 'ตร.ว.',
        totalPrice: 5500000,
        saleStatus: 'ซื้อตรง'
    },
    {
        id: 20,
        img: '/media/images/asset/sample-property-2.jpg',
        alt: 'ทาวน์โฮม ในเมืองโคราช',
        assetCode: '4C1718',
        assetType: 'ทาวน์เฮาส์',
        location: 'อำเภอ เมือง จังหวัด นครราชสีมา',
        area: '20.0',
        unit: 'ตร.ว.',
        totalPrice: 1800000,
        saleStatus: 'ประมูล'
    },
    {
        id: 21,
        img: '/media/images/asset/sample-property-3.jpg',
        alt: 'อาคารพาณิชย์ บัวใหญ่',
        assetCode: '1D1819',
        assetType: 'อาคารพาณิชย์',
        location: 'อำเภอ บัวใหญ่ จังหวัด นครราชสีมา',
        area: '18.0',
        unit: 'ตร.ว.',
        totalPrice: 3400000,
        saleStatus: 'รอประกาศราคา'
    }
];

export const allAssetTypeData = [
    { id: 4, typeName: 'ที่ดินเปล่า', count: 9783, unit: 'รายการ', icon: 'land' },
    { id: 6, typeName: 'ทาวน์เฮ้าส์', count: 5420, unit: 'รายการ', icon: 'townhouse' },
    { id: 8, typeName: 'ห้องชุดพักอาศัย', count: 17232, unit: 'รายการ', icon: 'condo' },
    { id: 9, typeName: 'บ้านเดี่ยว', count: 7890, unit: 'รายการ', icon: 'house' },
    { id: 11, typeName: 'อาคารพาณิชย์', count: 3150, unit: 'รายการ', icon: 'shophouse' },
    { id: 13, typeName: 'โรงงาน/โกดัง', count: 1240, unit: 'รายการ', icon: 'factory' },
    { id: 14, typeName: 'อสังหาริมทรัพย์อื่นๆ', count: 560, unit: 'รายการ', icon: 'other' },
    { id: 16, typeName: 'โชว์รูม', count: 120, unit: 'รายการ', icon: 'showroom' },
    { id: 17, typeName: 'โฮมออฟฟิศ', count: 890, unit: 'รายการ', icon: 'home-office' },
    { id: 18, typeName: 'โรงแรม/รีสอร์ท', count: 450, unit: 'รายการ', icon: 'hotel' },
    { id: 19, typeName: 'ห้องชุดสำนักงาน', count: 320, unit: 'รายการ', icon: 'office-condo' },
    { id: 20, typeName: 'อาคารชุดพักอาศัย', count: 2150, unit: 'รายการ', icon: 'residential-building' },
    { id: 21, typeName: 'อาคารสำนักงาน', count: 210, unit: 'รายการ', icon: 'office-building' },
    { id: 23, typeName: 'ปั๊มน้ำมัน', count: 85, unit: 'รายการ', icon: 'gas-station' },
    { id: 24, typeName: 'บ้านแฝด', count: 1450, unit: 'รายการ', icon: 'twin-house' },
    { id: 25, typeName: 'ห้องชุดพาณิชยกรรม', count: 180, unit: 'รายการ', icon: 'commercial-unit' },
    { id: 26, typeName: 'อพาร์ทเมนท์', count: 12479, unit: 'รายการ', icon: 'apartment' },
    { id: 27, typeName: 'สิทธิการเช่า/พื้นที่การพาณิชย์', count: 95, unit: 'รายการ', icon: 'leasehold' },
    { id: 28, typeName: 'โรงพยาบาล', count: 12, unit: 'รายการ', icon: 'hospital' },
    { id: 29, typeName: 'บัตรสมาชิกสนามกอล์ฟ', count: 300, unit: 'รายการ', icon: 'golf-card' },
    { id: 30, typeName: 'สนามกอล์ฟ', count: 5, unit: 'รายการ', icon: 'golf-course' },
    { id: 31, typeName: 'ห้างสรรพสินค้า', count: 28, unit: 'รายการ', icon: 'shopping-mall' },
    { id: 32, typeName: 'โครงการที่พักอาศัย/พาณิชยกรรม', count: 45, unit: 'รายการ', icon: 'project-mix' },
    { id: 33, typeName: 'ฟาร์มเลี้ยงสัตว์', count: 32, unit: 'รายการ', icon: 'farm' },
    { id: 34, typeName: 'ตลาด', count: 42, unit: 'รายการ', icon: 'market' },
    { id: 35, typeName: 'โรงภาพยนต์', count: 15, unit: 'รายการ', icon: 'cinema' },
    { id: 36, typeName: 'เครื่องจักร', count: 210, unit: 'รายการ', icon: 'machinery' },
    { id: 37, typeName: 'ศูนย์กีฬา', count: 18, unit: 'รายการ', icon: 'sports-center' },
    { id: 38, typeName: 'โรงเรียน', count: 24, unit: 'รายการ', icon: 'school' },
    { id: 39, typeName: 'อาคารพักอาศัย', count: 1100, unit: 'รายการ', icon: 'residential-block' },
    { id: 40, typeName: 'สังหาริมทรัพย์', count: 1500, unit: 'รายการ', icon: 'movable-asset' },
    { id: 41, typeName: 'สวนน้ำ', count: 3, unit: 'รายการ', icon: 'water-park' },
    { id: 42, typeName: 'ส่วนโล่งหลังคาคลุม', count: 56, unit: 'รายการ', icon: 'open-roof' },
    { id: 43, typeName: 'ศูนย์จำหน่ายสินค้า', count: 14, unit: 'รายการ', icon: 'distribution-center' },
    { id: 44, typeName: 'ร้านอาหาร', count: 88, unit: 'รายการ', icon: 'restaurant' },
    { id: 45, typeName: 'มินิแฟคตอรี่', count: 112, unit: 'รายการ', icon: 'mini-factory' }
];