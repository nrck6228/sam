using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class DocumentController : Controller
    {
        [Route("document/download")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
