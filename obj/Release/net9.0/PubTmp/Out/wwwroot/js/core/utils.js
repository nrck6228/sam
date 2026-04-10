export const getData = async () => {
    try {
        const res = await fetch('/data/data.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error("Could not load data:", e);
        return null; // คืนค่า null เพื่อให้ฝั่งคนเรียกไปจัดการต่อได้
    }
};

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