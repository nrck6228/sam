// ฟังก์ชันสำหรับ Initialize Tippy (เรียกใช้เฉพาะหน้าที่ต้องการ)
export const initShareTooltip = () => {
    const shareBtn = document.getElementById('btn-share-main');
    const template = document.getElementById('share-popover-content');

    if (shareBtn && template) {
        tippy(shareBtn, {
            content: template.innerHTML,
            allowHTML: true,
            interactive: true,
            trigger: 'click',
            theme: 'light-border',
            placement: 'top',
            maxWidth: 'none',
            appendTo: () => document.body,
        });
    }
};

// ตรวจสอบว่าถ้าไม่ใช่ Module ระบบก็ยังทำงานได้
window.copyToClipboard = async (btn) => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>คัดลอกแล้ว!</span> <i class="bi bi-check2"></i>';
        btn.disabled = true; // กันกดซ้ำรัวๆ

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
};

window.shareTo = (platform) => {
    const url = encodeURIComponent(window.location.href);
    // ฉลาดขึ้น: ลองหา h1 ก่อน ถ้าไม่มีค่อยเอา title
    const pageHeading = document.querySelector('h1')?.innerText;
    const title = encodeURIComponent(pageHeading || document.title);
    
    let shareUrl = '';
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'line':
            shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
            break;
        case 'x':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'email':
            const subject = encodeURIComponent(`แชร์เนื้อหาที่น่าสนใจ: ${decodeURIComponent(title)}`);
            const body = encodeURIComponent(`ดูรายละเอียดเพิ่มเติมได้ที่ลิงก์นี้:\n${window.location.href}`);
            shareUrl = `mailto:?subject=${subject}&body=${body}`;
            break;
    }

    if (shareUrl) {
        if (platform === 'email') {
            window.location.href = shareUrl;
        } else {
            const width = 600, height = 450;
            const left = (screen.width / 2) - (width / 2);
            const top = (screen.height / 2) - (height / 2);
            window.open(shareUrl, 'shareWindow', `width=${width},height=${height},left=${left},top=${top}`);
        }
    }
    return false;
};

// ถ้าโหลดแบบ Module ให้รัน init อัตโนมัติ (ถ้าพบ Element)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareTooltip);
} else {
    initShareTooltip();
}