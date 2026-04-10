using Microsoft.AspNetCore.Mvc;

namespace sam.Controllers
{
    public class ContactController : Controller
    {
        [Route("contact-us")]
        public IActionResult Index()
        {
            return View();
        }

        [Route("link-exchange")]
        public IActionResult LinkExchange()
        {
            return View("~/Views/Contact/LinkExchange.cshtml");
        }

        [Route("suggestions-complaints")]
        public IActionResult Suggestions()
        {
            return View("~/Views/Contact/Suggestions.cshtml");
        }

        [Route("contact-us/related-organization")]
        public IActionResult Organization()
        {
            return View("~/Views/Contact/Organization.cshtml");
        }
    }
}
