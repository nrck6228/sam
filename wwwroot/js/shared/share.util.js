// ฟังก์ชันสำหรับแชร์ไปยังโซเชียลต่างๆ
window.shareTo = function (platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = '';

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
            break;
        case 'line':
            shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
            break;
    }

    if (shareUrl) {
        // เปิดหน้าต่าง Pop-up ขนาดพอเหมาะ
        window.open(shareUrl, '_blank', 'width=600,height=400,menubar=no,toolbar=no,resizable=yes,scrollbars=yes');
    }
};

// ฟังก์ชันคัดลอกลิงก์ (Copy to Clipboard)
window.copyToClipboard = function () {
    const dummy = document.createElement('input');
    const text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);

    // แสดงแจ้งเตือน (Toast หรือ Alert แบบง่าย)
    alert('คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว');
};