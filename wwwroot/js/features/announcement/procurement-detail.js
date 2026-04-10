let pendingFileLink = "";
let modalTerms = null;
let modalUserForm = null;

document.addEventListener('DOMContentLoaded', () => {
    modalTerms = new bootstrap.Modal(document.getElementById('modalTerms'));
    modalUserForm = new bootstrap.Modal(document.getElementById('modalUserForm'));
});

// ขั้นตอนที่ 1: กดปุ่ม Download
window.checkDownloadPermission = (fileLink) => {
    pendingFileLink = fileLink;
    modalTerms.show(); // แสดงเงื่อนไขก่อน
};

// ขั้นตอนที่ 2: กดยอมรับเงื่อนไข
window.acceptTerms = () => {
    modalTerms.hide();
    setTimeout(() => {
        modalUserForm.show(); // แสดงฟอร์มผู้ประกอบการต่อ
    }, 400); // รอ modal แรกปิดสนิทก่อน
};

// ขั้นตอนที่ 3: กดบันทึกข้อมูล
window.submitOperatorForm = () => {
    const form = document.getElementById('formOperator');
    if (form.checkValidity()) {
        // ในความเป็นจริงต้องส่งข้อมูลไปเก็บที่ Server ด้วย API
        console.log("Saving operator info...");

        modalUserForm.hide();

        // เริ่มการดาวน์โหลดไฟล์
        window.location.href = `/files/${pendingFileLink}.pdf`;

        // Reset ข้อมูล
        pendingFileLink = "";
        form.reset();
    } else {
        form.reportValidity();
    }
};