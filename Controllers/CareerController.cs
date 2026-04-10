using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class CareerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
