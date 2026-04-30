using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class DebtController : Controller
    {
        [Route("debt/overview")]
        public IActionResult Index()
        {
            return View();
        }

        [Route("debt/restructuring")]
        public IActionResult Restructuring()
        {
            return View();
        }

        [Route("debt/benefits")]
        public IActionResult Benefits()
        {
            return View();
        }

        [Route("debt/download")]
        public IActionResult Download()
        {
            return View();
        }

        [Route("debt/register")]
        public IActionResult Register()
        {
            return View();
        }

        [Route("debt/clinic")]
        public IActionResult Clinic()
        {
            return View();
        }
    }
}