using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class DocumentController : Controller
    {
        [Route("document")]
        public IActionResult Index()
        {
            return View();
        }

        [Route("document/download")]
        public IActionResult Download()
        {
            return View();
        }
    }
}
