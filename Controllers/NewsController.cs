using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    [Route("news")]
    public class NewsController : Controller
    {
        // 1. หน้ารวมข่าวสาร (รองรับ Pagination)
        [HttpGet("")]
        [HttpGet("page/{page:int}")] // เพิ่มบรรทัดนี้!
        public IActionResult Index(int page = 1)
        {
            ViewBag.CurrentPage = page;
            return View();
        }

        // 2. หน้ารายละเอียดข่าว (เพิ่ม Constraint เพื่อไม่ให้ทับกับ /page/)
        [HttpGet("{id:regex(^(?!page$).*)}/{slug}")]
        public IActionResult Detail(string id, string slug)
        {
            var model = new NewsDetailViewModel { Id = id, Title = "รายละเอียดข่าวสาร - SAM" };
            return View(model);
        }

        // --- ส่วนของวิดีโอ (ใช้ Absolute Route /video) ---

        // 2. หน้ารวมวิดีโอ (Pagination)
        // ใส่คำว่า "page" ไว้ใน Path เพื่อแยกออกจากหน้ารายละเอียดชัดเจน
        [HttpGet("/video/page/{page:int}")]
        [HttpGet("/video")]
        public IActionResult Video(int page = 1)
        {
            ViewBag.CurrentPage = page;
            return View("~/Views/News/Video.cshtml");
        }

        // 3. หน้ารายละเอียดวิดีโอ
        // เพิ่ม Constraint :regex(^(?!page$).*) เพื่อบอกว่า {id} ต้อง "ไม่ใช่" คำว่า page
        [HttpGet("/video/{id:regex(^(?!page$).*)}/{slug}")]
        public IActionResult VideoDetail(string id, string slug)
        {
            ViewBag.Id = id;
            ViewBag.Slug = slug;
            return View("~/Views/News/VideoDetail.cshtml");
        }
    }
}