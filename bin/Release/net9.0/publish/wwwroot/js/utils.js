// ฟังก์ชันกลางสำหรับจัดการตัวเลขและข้อความ
export const formatCurrency = (num) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'decimal',
        minimumFractionDigits: 0
    }).format(num) + ' บาท';
};

export const truncateText = (text, limit) => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};