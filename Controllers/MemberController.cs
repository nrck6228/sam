using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class MemberController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [Route("login")]
        public IActionResult Login()
        {
            return View();
        }

        [Route("register")]
        public IActionResult Register()
        {
            return View();
        }

        [Route("staff")]
        public IActionResult Staff()
        {
            return View();
        }

        [Route("calculator")]
        public IActionResult Calculator()
        {
            return View();
        }
    }
}
