document.addEventListener('DOMContentLoaded', () => {
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
            animation: 'shift-away',
            // เพิ่มบรรทัดนี้: กำหนดความกว้างสูงสุด หรือใส่ 'none' เพื่อให้กว้างตาม Content
            maxWidth: 'none',
            appendTo: () => document.body,
        });
    }
});

// ฟังก์ชันคัดลอกลิงก์ (Global Scope)
window.copyToClipboard = async (btn) => {
    try {
        await navigator.clipboard.writeText(window.location.href);

        const originalHTML = btn.innerHTML;
        btn.classList.add('copied');
        // เพิ่มสไตล์ Inline ชั่วคราวเพื่อให้เห็นความต่าง (หรือไปแก้ใน CSS)
        btn.innerHTML = '<span>คัดลอกแล้ว!</span> <i class="bi bi-check2"></i>';

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.style.color = '';
            btn.innerHTML = originalHTML;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
};

// ฟังก์ชันแชร์ (ต้องเป็น window.shareTo เพื่อให้ onclick ใน HTML มองเห็น)
window.shareTo = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
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
            // ปรับปรุง Subject ให้ดึงชื่อจริงจาก <h1> ของหน้ามาใช้ (ถ้ามี)
            const assetName = document.querySelector('.asset-info__title')?.innerText || document.title;
            const subject = encodeURIComponent(`สนใจทรัพย์สิน: ${assetName}`);
            const body = encodeURIComponent(`สวัสดีครับ,\n\nผมสนใจทรัพย์สินรายการนี้จากเว็บไซต์ SAM:\n${window.location.href}`);
            shareUrl = `mailto:?subject=${subject}&body=${body}`;
            break;
    }

    if (shareUrl) {
        if (platform === 'email') {
            window.location.href = shareUrl;
        } else {
            // คำนวณตำแหน่งกึ่งกลางหน้าจอสำหรับ Pop-up Window
            const width = 600;
            const height = 400;
            const left = (window.innerWidth / 2) - (width / 2);
            const top = (window.innerHeight / 2) - (height / 2);

            window.open(shareUrl, 'shareWindow',
                `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0`);
        }
    }
    return false;
};