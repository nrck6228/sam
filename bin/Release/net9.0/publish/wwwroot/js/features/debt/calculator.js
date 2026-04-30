const setupLoanCalculator = (initialPrice = 0) => {
    const inputPrice = document.getElementById('loan_asset_price');
    const inputLoan = document.getElementById('loan_amount');
    const inputInterest = document.getElementById('loan_interest');
    const inputYears = document.getElementById('loan_years');
    const btnCalc = document.querySelector('.btn-calculate-loan');

    if (!inputPrice || !inputLoan) return;

    // --- ส่วนที่ 1: กำหนดค่าเริ่มต้น (ถ้ามีส่งมาจากหน้าอื่น) ---
    if (initialPrice > 0) {
        inputPrice.value = initialPrice;
        // ตั้งวงเงินกู้เริ่มต้นที่ 90% ของราคา (ผู้ใช้เปลี่ยนเองได้ภายหลัง)
        inputLoan.value = Math.round(initialPrice * 0.9);
    }

    // --- ส่วนที่ 2: Logic การคำนวณ ---
    const doCalculate = () => {
        const parseNum = (id) => {
            const el = document.getElementById(id);
            if (!el) return 0;
            const val = el.value.toString().replace(/[^0-9.]/g, '');
            return parseFloat(val) || 0;
        };

        // ดึงค่าใหม่ล่าสุดจาก Input เสมอ
        const assetPrice = parseNum('loan_asset_price');
        const loanAmount = parseNum('loan_amount');
        const interestRate = parseNum('loan_interest');
        const years = parseNum('loan_years');

        // --- Validation ---
        if (assetPrice <= 0) {
            Swal.fire('แจ้งเตือน', 'กรุณาระบุราคาทรัพย์สิน', 'warning');
            return;
        }
        if (loanAmount <= 0) {
            Swal.fire('แจ้งเตือน', 'กรุณาระบุวงเงินกู้ที่ต้องการ', 'warning');
            return;
        }
        if (loanAmount > assetPrice) {
            Swal.fire('แจ้งเตือน', 'วงเงินกู้ห้ามเกินราคาทรัพย์สิน', 'warning');
            return;
        }

        // --- Calculation ---
        const r = (interestRate / 100) / 12;
        const n = years * 12;

        let monthlyPayment = r > 0 
            ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) 
            : loanAmount / n;

        const interestFirstMonth = loanAmount * r;
        const principalFirstMonth = monthlyPayment - interestFirstMonth;
        const downPayment = assetPrice - loanAmount;

        // คำนวณ % สำหรับ Progress Bar
        const downPercent = assetPrice > 0 ? Math.min(100, (downPayment / assetPrice) * 100) : 0;
        const loanPercent = 100 - downPercent;
        const principalPercent = monthlyPayment > 0 ? (principalFirstMonth / monthlyPayment) * 100 : 0;
        const interestPercent = 100 - principalPercent;

        // --- Update UI ---
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        };

        safeSetText('res_monthly_pay', Math.round(monthlyPayment).toLocaleString());
        safeSetText('res_principal_val', Math.round(principalFirstMonth).toLocaleString());
        safeSetText('res_principal_percent', Math.round(principalPercent));
        safeSetText('res_interest_val', Math.round(interestFirstMonth).toLocaleString());
        safeSetText('res_interest_percent', Math.round(interestPercent));

        safeSetText('res_down_payment', Math.round(downPayment).toLocaleString());
        safeSetText('res_down_percent', Math.round(downPercent));
        safeSetText('res_loan_val', Math.round(loanAmount).toLocaleString());
        safeSetText('res_loan_percent', Math.round(loanPercent));

        // อัปเดตแถบสี (Progress Bars)
        const updateBar = (id, percent) => {
            const el = document.getElementById(id);
            if (el) el.style.width = `${percent}%`;
        };

        updateBar('bar_principal', principalPercent);
        updateBar('bar_down', downPercent);

        // Toast แจ้งผลสำเร็จ
        Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        }).fire({
            icon: 'success',
            title: 'คำนวณเรียบร้อยแล้ว'
        });
    };

    // ผูก Event กับปุ่ม
    if (btnCalc) {
        btnCalc.onclick = doCalculate;
    }

    // รันครั้งแรกตอนโหลดหน้า
    if (inputPrice.value > 0) doCalculate();
};

const initApp = () => {
    setupLoanCalculator();
};

document.addEventListener('DOMContentLoaded', initApp);