import { assetListData } from '/js/data/data.js';

const renderDetail = (code) => {
    const container = document.getElementById('asset-detail-container');

    // ค้นหาทรัพย์สินโดยเปรียบเทียบจาก assetCode (ใช้ toUpperCase เพื่อป้องกันกรณีพิมพ์เล็ก)
    const asset = assetListData.find(item =>
        item.assetCode?.toUpperCase() === code?.toUpperCase()
    );

    if (!asset) {
        container.innerHTML = `
            <div class="text-center py-5">
                <h3>ไม่พบข้อมูลทรัพย์สินรหัส ${code}</h3>
                <a href="/npa/asset-category" class="btn btn-primary mt-3">กลับไปหน้าค้นหา</a>
            </div>`;
        return;
    }

    // Render รายละเอียดตามปกติ (ตัวอย่างการนำข้อมูลมาใช้)
    container.innerHTML = `
        <div class="asset-info">
            <span class="badge bg-secondary mb-2">รหัสทรัพย์: ${asset.assetCode}</span>
            <h1 class="h2">${asset.alt}</h1>
            <p>พื้นที่: ${asset.area} ${asset.unit}</p>
            </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    // SELECTED_ASSET_CODE รับมาจาก ViewBag ในหน้า .cshtml
    renderDetail(SELECTED_ASSET_CODE);
});