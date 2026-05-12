using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class MemberController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [Route("member/login")]
        public IActionResult Login()
        {
            return View();
        }

        [Route("member/register")]
        public IActionResult Register()
        {
            return View();
        }

        [Route("member/dashboard")]
        public IActionResult Dashboard()
        {
            return View();
        }

        [Route("member/manage")]
        public IActionResult Manage()
        {
            return View();
        }

        [Route("member/rights")]
        public IActionResult Rights()
        {
            return View();
        }

        [Route("yourdesign")]
        public IActionResult YourDesign()
        {
            return View();
        }

        [Route("designByYourSelf")]
        public IActionResult DesignPage()
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
