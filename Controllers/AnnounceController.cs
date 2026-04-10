using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Dynamic;

namespace sam.Controllers
{
    public class AnnounceController : Controller
    {
        [HttpGet("announcement/interest-rate")]
        [HttpGet("announcement/interest-rate/page/{page:int}")]
        public IActionResult Index(int page = 1)
        {
            ViewBag.CurrentPage = page;
            return View();
        }

        [HttpGet("announcement/npl-npa")]
        [HttpGet("announcement/npl-npa/page/{page:int}")]
        public IActionResult Npl(int page = 1)
        {
            ViewBag.CurrentPage = page;
            return View("~/Views/Announce/Npl.cshtml");
        }

        [HttpGet("announcement/general")]
        [HttpGet("announcement/general/page/{page:int}")]
        public IActionResult General(int page = 1)
        {
            ViewBag.CurrentPage = page;
            return View("~/Views/Announce/General.cshtml");
        }

        [HttpGet("announcement/procurement")]
        [HttpGet("announcement/procurement/page/{page:int}")]
        public IActionResult Procurement(int page = 1)
        {
            ViewBag.CurrentPage = page;
            return View(); // คาดหวังไฟล์ Views/Announce/Procurement.cshtml
        }

        private readonly IWebHostEnvironment _webHostEnvironment;

        public AnnounceController(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet("announcement/procurement/{id}/{slug}")]
        public IActionResult ProcurementDetail(string id, string slug)
        {
            var data = GetProcurementFromJson(id);

            if (data == null) return NotFound();

            // ส่งค่าไปที่ ViewBag (Newtonsoft จะจัดการเป็น dynamic object ให้เลย)
            ViewBag.Id = data.id;
            ViewBag.AnnounceTitle = data.title;
            ViewBag.DisplayDate = data.displayDate;
            ViewBag.Content = data.content;
            ViewBag.DownloadFiles = data.downloadFiles; // ตัวนี้จะเป็น List ที่วนลูปได้แล้ว

            return View();
        }

        private dynamic GetProcurementFromJson(string id)
        {
            try
            {
                string filePath = Path.Combine(_webHostEnvironment.WebRootPath, "data", "data.json");
                if (!System.IO.File.Exists(filePath)) return null;

                string jsonString = System.IO.File.ReadAllText(filePath);

                // แปลง JSON ทั้งหมดเป็น dynamic object
                dynamic root = JsonConvert.DeserializeObject(jsonString);

                // ค้นหาใน procurementData
                foreach (var item in root.procurementData)
                {
                    if (item.id.ToString() == id)
                    {
                        return item;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("JSON Error: " + ex.Message);
            }
            return null;
        }
    }
}
