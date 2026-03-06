using Microsoft.AspNetCore.Mvc;
using sam.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Linq;

namespace sam.Controllers
{
    public class AssetsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [Route("npa/type-assets")]
        public IActionResult TypeAsset()
        {
            return View("~/Views/Assets/TypeAsset.cshtml");
        }

        [Route("promotion")]
        [Route("promotion/page/{page:int}")]
        public IActionResult Promotion(int page = 1)
        {
            // เรียกใช้ฟังก์ชันดึงข้อมูลตามหน้าเพียงอย่างเดียว
            var promotions = GetPromotionsByPage(page);

            // ส่งตัวแปรที่ดึงมาไปยัง View
            return View("~/Views/Assets/Promotion.cshtml", promotions);
        }

        private List<PromotionViewModel> GetPromotionsByPage(int page)
        {
            int itemsPerPage = 6;

            // ข้อมูลทั้งหมด (ในสถานการณ์จริงอาจจะดึงจาก Database)
            var allData = new List<PromotionViewModel> {
                new PromotionViewModel {
                    Id = 1, Title = "โครงการปิดหนี้ไวไปต่อได้",
                    Description = "หนี้ครัวเรือนเป็นปัญหาเชิงโครงสร้าง...",
                    ImageUrl = "/media/images/promotion/thumb.jpg", Date = "ม.ค. 19, 2026", Link = "#"
                },
                new PromotionViewModel {
                    Id = 2, Title = "โครงการปิดหนี้ไวไปต่อได้",
                    Description = "หนี้ครัวเรือนเป็นปัญหาเชิงโครงสร้าง...",
                    ImageUrl = "/media/images/promotion/thumb.jpg", Date = "ม.ค. 19, 2026", Link = "#"
                },
                new PromotionViewModel {
                    Id = 3, Title = "โครงการปิดหนี้ไวไปต่อได้",
                    Description = "หนี้ครัวเรือนเป็นปัญหาเชิงโครงสร้าง...",
                    ImageUrl = "/media/images/promotion/thumb.jpg", Date = "ม.ค. 19, 2026", Link = "#"
                },
                new PromotionViewModel {
                    Id = 4, Title = "โครงการปิดหนี้ไวไปต่อได้",
                    Description = "หนี้ครัวเรือนเป็นปัญหาเชิงโครงสร้าง...",
                    ImageUrl = "/media/images/promotion/thumb.jpg", Date = "ม.ค. 19, 2026", Link = "#"
                },
                new PromotionViewModel {
                    Id = 5, Title = "โครงการปิดหนี้ไวไปต่อได้",
                    Description = "หนี้ครัวเรือนเป็นปัญหาเชิงโครงสร้าง...",
                    ImageUrl = "/media/images/promotion/thumb.jpg", Date = "ม.ค. 19, 2026", Link = "#"
                },
                new PromotionViewModel {
                    Id = 6, Title = "โครงการปิดหนี้ไวไปต่อได้",
                    Description = "หนี้ครัวเรือนเป็นปัญหาเชิงโครงสร้าง...",
                    ImageUrl = "/media/images/promotion/thumb.jpg", Date = "ม.ค. 19, 2026", Link = "#"
                },
            };

            // ทำ Pagination ฝั่ง Server
            return allData
                .Skip((page - 1) * itemsPerPage)
                .Take(itemsPerPage)
                .ToList();
        }
    }
}
