using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class FaqController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [Route("faqs/corporate")]
        public IActionResult Corporate()
        {
            return View("~/Views/Faq/Corporate.cshtml");
        }

        [Route("faqs/npl")]
        public IActionResult Npl()
        {
            return View("~/Views/Faq/Npl.cshtml");
        }

        [Route("faqs/npa")]
        public IActionResult Npa()
        {
            return View("~/Views/Faq/Npa.cshtml");
        }

        [Route("open-data-integrity-and-transparency")]
        public IActionResult DataIntegrity()
        {
            return View("~/Views/Faq/DataIntegrity.cshtml");
        }
    }
}
