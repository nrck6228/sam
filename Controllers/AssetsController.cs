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
        public IActionResult Index() => View();

        [Route("npa/asset-category")]
        public IActionResult TypeAsset()
        {
            return View("~/Views/Assets/AssetCategory.cshtml");
        }

        // แก้ไข: ใช้ npa ให้ตรงกับ JS และระบุลำดับ (Order)
        [Route("npa/{id:int}/{slug}/page/{page:int}", Order = 1)]
        [Route("npa/{id:int}/{slug}", Order = 2)]
        public IActionResult AssetListByType(int id, string slug, int page = 1)
        {
            // ป้องกันกรณีส่งเลขหน้าติดลบมาทาง URL
            if (page < 1) page = 1;

            ViewBag.AssetTypeId = id;
            ViewBag.AssetSlug = slug;
            ViewBag.CurrentPage = page;

            // สร้าง Title เบื้องต้นจาก Slug (เช่น single-house -> Single House)
            ViewBag.Title = slug.Replace("-", " ").ToUpper() + " - SAM";

            return View("~/Views/Assets/AssetList.cshtml");
        }

        // เพิ่ม Route สำหรับการค้นหาโดยเฉพาะ
        [HttpGet]
        [Route("npa/search-results")]
        [Route("npa/search-results/page/{page:int?}")] // เพิ่มบรรทัดนี้เพื่อรองรับ /page/2
        public IActionResult SearchResults(
            int? page, // รับค่าเลขหน้า (Optional)
            string mode,
            string keyword,
            string types,
            string provinces,
            string district,
            string minPrice,
            string maxPrice)
        {
            // เก็บค่าหน้าปัจจุบันไว้ (ถ้าไม่ส่งมาให้เริ่มที่หน้า 1)
            ViewBag.CurrentPage = page ?? 1;

            // ส่งค่าที่ Search มาจากหน้าแรกผ่าน ViewBag เพื่อให้ JS ในหน้า AssetList นำไปกรองข้อมูล
            ViewBag.IsSearchMode = true;
            ViewBag.SearchMode = mode;
            ViewBag.Keyword = keyword;
            ViewBag.Types = types;
            ViewBag.Provinces = provinces;
            ViewBag.District = district;
            ViewBag.MinPrice = minPrice;
            ViewBag.MaxPrice = maxPrice;

            // ตั้งชื่อหัวข้อหน้าให้ดู Premium
            ViewBag.Title = !string.IsNullOrEmpty(keyword) ? $"ผลการค้นหา: {keyword} - SAM" : "ค้นหาทรัพย์สิน - SAM";

            // ส่งกลับไปที่ View เดิม
            return View("~/Views/Assets/AssetList.cshtml");
        }

        // เพิ่ม Route สำหรับหน้าเปรียบเทียบทรัพย์สิน
        [Route("npa/compare-results")]
        public IActionResult CompareResults()
        {
            // เนื่องจากเราใช้ JavaScript ดึงข้อมูลจาก LocalStorage 
            // เราจึงแค่ส่ง Title และจัดการ Breadcrumb เบื้องต้น
            ViewBag.Title = "เปรียบเทียบทรัพย์สิน - SAM";

            return View("~/Views/Assets/CompareResult.cshtml");
        }

        [Route("asset-detail/{code}")]
        public IActionResult Detail(string code)
        {
            ViewBag.AssetCode = code;
            return View("~/Views/Assets/AssetDetail.cshtml");
        }

        [Route("promotion/page/{page:int}", Order = 1)]
        [Route("promotion", Order = 2)]
        public IActionResult Promotion(int page = 1)
        {
            ViewBag.CurrentPage = page;
            return View("~/Views/Assets/Promotion.cshtml");
        }

        [Route("promotion/{id:int}/{slug}")]
        public IActionResult PromotionDetail(int id, string slug)
        {
            ViewBag.PromotionId = id;
            ViewBag.PromotionSlug = slug;

            return View("~/Views/Assets/PromotionDetail.cshtml");
        }
    }
}
