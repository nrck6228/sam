// listEngine.js
export const initListEngine = (config) => {
    // 1. ดึงข้อมูลและ Config ออกมาเพียงครั้งเดียว
    let internalData = config.data || [];
    const {
        containerId,
        paginationId,
        itemsPerPage = 10,
        renderTemplate,
        urlPath
    } = config;

    const container = document.getElementById(containerId);

    // เก็บ "คลาสต้นฉบับ" ไว้ตั้งแต่โหลดครั้งแรก
    const originalClasses = container ? Array.from(container.classList) : [];

    let currentPage = 1;

    const render = (page) => {
        console.log("Current Data Length:", internalData.length); // เช็คว่ามีข้อมูลให้ Render ไหม
        if (!container) return;

        // 2. คำนวณ totalPages ไว้ด้านบนก่อนเพื่อน
        const totalPages = Math.ceil(internalData.length / itemsPerPage);

        // ปรับปรุง currentPage ให้ไม่เกินขอบเขต
        let targetPage = parseInt(page) || 1;
        currentPage = targetPage < 1 ? 1 : (targetPage > totalPages ? totalPages : targetPage);
        if (totalPages === 0) currentPage = 1;

        window.currentPage = currentPage;

        // 3. กรณีไม่มีข้อมูล
        if (internalData.length === 0) {
            container.className = ""; // ล้างคลาสเพื่อให้แสดงข้อความตรงกลาง
            container.innerHTML = `<div class="col-12 text-center p-5 w-100">ไม่พบข้อมูล</div>`;

            const paginationEl = document.getElementById(paginationId);
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        // 4. กรณีมีข้อมูล: คืนค่าคลาสเดิมกลับมา
        container.className = "";
        originalClasses.forEach(cls => container.classList.add(cls));

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = internalData.slice(startIndex, startIndex + itemsPerPage);

        container.innerHTML = paginatedData.map(item => renderTemplate(item)).join('');
        renderPagination(totalPages);
    };

    const renderPagination = (totalPages) => {
        const paginationEl = document.getElementById(paginationId);
        if (!paginationEl || totalPages <= 1) {
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        const getUrl = (p) => `${urlPath}/${p}`;
        let html = '';

        // ปุ่มควบคุม (First/Prev)
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="${getUrl(1)}" title="หน้าแรก"><svg class="icon"><use xlink:href="#icon-first"></use></svg></a></li>`;
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="${getUrl(currentPage - 1)}" title="ก่อนหน้า"><svg class="icon"><use xlink:href="#icon-previous"></use></svg></a></li>`;

        // ตัวเลขหน้า
        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="${getUrl(i)}">${i}</a></li>`;
        }

        // ปุ่มควบคุม (Next/Last)
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="${getUrl(currentPage + 1)}" title="ถัดไป"><svg class="icon"><use xlink:href="#icon-next"></use></svg></a></li>`;
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="${getUrl(totalPages)}" title="หน้าสุดท้าย"><svg class="icon"><use xlink:href="#icon-last"></use></svg></a></li>`;

        paginationEl.innerHTML = html;
    };

    const getInitialPage = () => {
        const segments = window.location.pathname.split('/');
        const pageIdx = segments.indexOf('page');
        const pageFromPath = pageIdx !== -1 ? parseInt(segments[pageIdx + 1]) : null;
        const params = new URLSearchParams(window.location.search);
        const pageFromQuery = parseInt(params.get('page'));
        return pageFromPath || pageFromQuery || 1;
    };

    return {
        render,
        getInitialPage,
        updateData: (newData) => { internalData = newData; },
    };
};