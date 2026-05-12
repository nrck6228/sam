const dataConfig = {
    exterior: ["สวน", "สระว่ายน้ำ", "ที่จอดรถ", "ระเบียง"],
    interior: ["ห้องนอน", "ห้องน้ำ", "ห้องครัว", "ห้องรับแขก"],
    materials: {
        minimal: ["ไม้สน", "หินอ่อนขาว", "ผ้าลินิน"],
        modern: ["เหล็ก", "กระจก", "คอนกรีตขัดมัน"],
        loft: ["อิฐแดง", "เหล็กดำ", "ไม้เนื้อแข็ง"]
    },
    colors: {
        "black": ["#333", "#555"], "white": ["#f8f9fa", "#e9ecef"],
        "blue": ["#0000FF", "#ADD8E6"], "pink": ["#FFC0CB", "#FF69B4"]
    }
};

let itemCount = 0;
let activeSelectionId = null;
let imageModal; // ประกาศไว้ก่อน

// ใช้ DOMContentLoaded เพื่อให้แน่ใจว่า HTML โหลดเสร็จก่อนเริ่มรัน JS
document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบว่ามี Element นี้จริงก่อนสร้าง Modal
    const modalEl = document.getElementById('imageModal');
    if (modalEl) {
        imageModal = new bootstrap.Modal(modalEl);
    }
    addNewItem(); // สร้างรายการแรก
});

// เริ่มต้นสร้างรายการที่ 1
function addNewItem() {
    if (itemCount >= 3) {
        Swal.fire('จำกัดจำนวน', 'สร้างได้สูงสุด 3 รายการ', 'warning');
        return;
    }
    itemCount++;
    const id = Date.now();
    
    // แก้ไข ID ของ Radio ไม่ให้ซ้ำกัน (ใช้ type-ext, type-int)
    const cardHtml = `
        <div class="design-item-card" id="card-${id}">
            <div class="design-header" style="cursor:pointer" onclick="toggleAccordion(${id})">
                <div>
                    <span class="fw-bold item-number">รายการที่</span>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <button type="button" class="btn btn--outline-white delete--item" onclick="deleteItem('${id}', event)">
                        <span class="btn__icon"><i class="bi bi-x"></i></span>
                        <span class="btn__text">ลบรายการ</span>
                    </button>
                    <i class="bi bi-chevron-down" id="icon-${id}"></i>
                </div>
            </div>
            <div class="design-body" id="body-${id}">
                <div class="row">
                    <div class="col-lg-6">
                        <div class="image-placeholder h-100" id="placeholder-${id}" onclick="openImagePicker(${id})">
                            <i class="bi bi-image h1"></i>
                            <p class="mb-0">คลิกเพื่อเลือกรูปภาพ</p>
                        </div>
                        <img src="" id="preview-${id}" class="preview-img h-100" onclick="openImagePicker(${id})">
                    </div>
                    <div class="col-lg-6">
                        <div class="form h-100" style="background-color: white;">
                            <label class="section-label">ประเภทการออกแบบ</label>
                            <div class="mb-4">
                                <div class="form-group border-0">
                                    <div class="radio-buttons">
                                        <input type="radio" id="type-ext-${id}" name="type-${id}" value="exterior" class="radio-button" checked onchange="updateSubTypes(${id})"> 
                                        <label for="type-ext-${id}" class="radio-button--label">ภายนอก</label>
                                    </div>

                                    <div class="radio-buttons">
                                        <input type="radio" id="type-int-${id}" name="type-${id}" value="interior" class="radio-button" onchange="updateSubTypes(${id})"> 
                                        <label for="type-int-${id}" class="radio-button--label">ภายใน</label>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="section-label">ประเภทภายนอก</label>
                                <select class="form-select mb-3" id="subtype-${id}"></select>
                            </div>
                            <div class="mb-4">
                                <label class="section-label">สไตล์</label>
                                <select class="form-select mb-3" id="style-${id}" onchange="updateMaterials(${id})">
                                    <option value="">ค่าเริ่มต้น</option>
                                    <option value="minimal">มินิมอล (Minimal)</option>
                                    <option value="modern">โมเดิร์น (Modern)</option>
                                    <option value="loft">ลอฟท์ (Loft)</option>
                                </select>
                            </div>

                            <div class="mb-4">
                                <label class="section-label">วัสดุ</label>
                                <select class="form-select mb-3" id="material-${id}">
                                    <option value="">ค่าเริ่มต้น</option>
                                </select>
                            </div>
                            
                            <label class="section-label">โทนสีโดยรวม</label>
                            <div class="mb-4">
                                <div class="color-palette d-flex gap-2" id="main-colors-${id}"></div>
                            </div>
                            
                            <div class="mb-4">
                                <div id="sec-sec-${id}" class="d-none">
                                    <label class="section-label">โทนสีรอง</label>
                                    <div class="color-palette d-flex gap-2" id="sec-colors-${id}"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    
    const list = document.getElementById('design-list');
    if (list) {
        list.insertAdjacentHTML('beforeend', cardHtml);
        updateSubTypes(id);
        renderColors(id);
        reIndexItems(); // เรียกฟังก์ชันเรียงเลขรายการใหม่
    }

    // --- ส่วนที่เพิ่มใหม่: ตรวจสอบเพื่อซ่อนปุ่ม ---
    if (itemCount >= 3) {
        const btnAdd = document.getElementById('btn-add');
        if (btnAdd) {
            btnAdd.style.display = 'none'; // ซ่อนปุ่มทันทีเมื่อครบ 3
        }
    }
}

// ฟังก์ชันลบรายการ
function deleteItem(id, event) {
    event.stopPropagation();

    // ค้นหารายการทั้งหมดเพื่อเช็คว่าตัวที่จะลบเป็นรายการแรกหรือไม่
    const allItems = Array.from(document.querySelectorAll('.design-item-card'));
    const targetItem = document.getElementById(`card-${id}`);
    const targetIndex = allItems.indexOf(targetItem);

    // เงื่อนไข: ถ้าเป็นรายการแรก (index 0) ห้ามลบ
    if (targetIndex === 0) {
        Swal.fire({
            icon: 'info',
            title: 'ไม่สามารถลบได้',
            text: 'ระบบกำหนดให้ต้องมีรายการออกแบบอย่างน้อย 1 รายการ',
            customClass: {
                confirmButton: 'btn btn--san-green'
            },
        });
        return;
    }

    // ส่วนการลบเดิม
    Swal.fire({
        title: 'ยืนยันการลบ?',
        text: "คุณต้องการลบรายการออกแบบนี้ใช่หรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบรายการ',
        cancelButtonText: 'ยกเลิก',
        customClass: {
            confirmButton: 'btn btn--danger',
            cancelButton: 'btn btn--sam-gray'
        },
    }).then((result) => {
        if (result.isConfirmed) {
            if (targetItem) {
                targetItem.remove();
                itemCount--; 
                reIndexItems(); 

                const btnAdd = document.getElementById('btn-add');
                if (btnAdd) {
                    btnAdd.style.display = 'flex'; // หรือ 'block' ตามความเหมาะสมของ UI
                }
            }
        }
    });
}

// ฟังก์ชันสำหรับเรียงลำดับตัวเลข "รายการที่..." ใหม่ให้ถูกต้อง
function reIndexItems() {
    const items = document.querySelectorAll('.design-item-card');
    items.forEach((item, index) => {
        // 1. เรียงเลขรายการ
        const numberSpan = item.querySelector('.item-number');
        if (numberSpan) {
            numberSpan.innerText = `รายการที่ ${index + 1}`;
        }

        // 2. จัดการปุ่มลบ (รายการที่ 1 ให้ซ่อนปุ่มลบ)
        const deleteButton = item.querySelector('.delete--item');
        if (deleteButton) {
            if (index === 0) {
                deleteButton.style.display = 'none'; // ซ่อนถังขยะในรายการแรก
            } else {
                deleteButton.style.display = 'flex'; // แสดงถังขยะในรายการอื่นๆ
            }
        }
    });
}

function openImagePicker(id) {
    activeSelectionId = id;
    if (imageModal) imageModal.show();
}

function confirmSelectImage(src) {
    const preview = document.getElementById(`preview-${activeSelectionId}`);
    const placeholder = document.getElementById(`placeholder-${activeSelectionId}`);
    if (preview && placeholder) {
        preview.src = src;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    }
    if (imageModal) imageModal.hide();
}

function toggleAccordion(id) {
    const body = document.getElementById(`body-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (!body || !icon) return;

    // เปลี่ยนมาเช็คสไตล์โดยตรง หรือใช้คลาส d-none แทนจะเสถียรกว่า
    if (body.style.display === 'none') {
        body.style.display = 'flex';
        icon.classList.replace('bi-chevron-right', 'bi-chevron-down');
    } else {
        body.style.display = 'none';
        icon.classList.replace('bi-chevron-down', 'bi-chevron-right');
    }
}

function updateSubTypes(id) {
    // ดึงค่าที่เลือก (exterior หรือ interior)
    const type = document.querySelector(`input[name="type-${id}"]:checked`).value;
    const select = document.getElementById(`subtype-${id}`);
    
    // 1. ปรับเปลี่ยน Label ให้ไดนามิก
    // เข้าถึง label ที่อยู่ก่อนหน้า select ตัวนี้
    const label = select.previousElementSibling;
    if (label && label.classList.contains('section-label')) {
        label.innerText = type === 'exterior' ? 'ประเภทภายนอก' : 'ประเภทภายใน';
    }

    // 2. เคลียร์ค่าเก่าและเพิ่ม "ค่าเริ่มต้น" เป็น Default Option
    select.innerHTML = `<option value="">ค่าเริ่มต้น</option>`;
    
    // 3. เพิ่มรายการจาก dataConfig
    if (dataConfig[type]) {
        dataConfig[type].forEach(t => {
            select.innerHTML += `<option value="${t}">${t}</option>`;
        });
    }
}

function updateMaterials(id) {
    const style = document.getElementById(`style-${id}`).value;
    const select = document.getElementById(`material-${id}`);
    
    // ตั้งค่าเริ่มต้นเสมอ
    select.innerHTML = '<option value="">ค่าเริ่มต้น</option>';
    
    if(style && dataConfig.materials[style]) {
        dataConfig.materials[style].forEach(m => {
            select.innerHTML += `<option value="${m}">${m}</option>`;
        });
    }
}

function renderColors(id) {
    const container = document.getElementById(`main-colors-${id}`);
    const colors = ["black", "white", "blue", "green", "yellow", "orange", "red", "pink"];
    container.innerHTML = colors.map(c => 
        `<div class="color-circle" style="background:${c}" onclick="selectColor(${id}, '${c}', this)"></div>`
    ).join('');
}

function selectColor(id, color, el) {
    const parent = document.getElementById(`main-colors-${id}`);
    parent.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    const secSec = document.getElementById(`sec-sec-${id}`);
    const secColors = document.getElementById(`sec-colors-${id}`);
    
    if (dataConfig.colors[color]) {
        secSec.classList.remove('d-none');
        secColors.innerHTML = dataConfig.colors[color].map(hex => 
            `<div class="color-circle" style="background:${hex}" onclick="this.classList.toggle('active')"></div>`
        ).join('');
    } else {
        secSec.classList.add('d-none');
    }
}

function handleFinalSubmit() {
    // 1. ตรวจสอบก่อนว่าเลือกรูปหรือยัง (Optionally)
    // คุณอาจจะเพิ่ม loop เช็คว่าทุกรายการมีการเลือกรูปภาพครบหรือไม่ที่นี่

    Swal.fire({
        title: 'ยืนยันการสร้างรายการ',
        text: 'กรุณากรอกอีเมลเพื่อรับลิงก์ดาวน์โหลดภาพที่ออกแบบ',
        input: 'email', // ใช้ input type email
        // inputLabel: 'อีเมลของคุณ',
        inputPlaceholder: 'example@email.com',
        showCancelButton: true,
        confirmButtonText: 'ส่งข้อมูล',
        cancelButtonText: 'ยกเลิก',
        customClass: {
            confirmButton: 'btn btn--sam-green',
            cancelButton: 'btn btn--sam-gray'
        },
        inputValidator: (value) => {
            if (!value) {
                return 'กรุณากรอกอีเมลของคุณ!';
            }
            // ตรวจสอบรูปแบบ email เบื้องต้น
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'รูปแบบอีเมลไม่ถูกต้อง!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const userEmail = result.value;
            
            // แสดงสถานะกำลังโหลด (ถ้ามีการส่งไป Server จริง)
            Swal.fire({
                title: 'กำลังประมวลผล...',
                didOpen: () => {
                    Swal.showLoading();
                },
                allowOutsideClick: false
            });

            // จำลองการส่งข้อมูล (ตรงนี้คุณสามารถใส่ AJAX/Fetch เพื่อส่ง userEmail และข้อมูลภาพไปยัง Backend)
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'ส่งข้อมูลสำเร็จ!',
                    text: `ระบบได้ส่งลิงก์ดาวน์โหลดไปยังอีเมล: ${userEmail} เรียบร้อยแล้ว`,
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'btn btn--sam-green',
                    }
                });
            }, 1500);
        }
    });
}