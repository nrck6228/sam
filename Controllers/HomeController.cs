using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using sam.Models;

namespace sam.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [Route("survey")]
        public IActionResult Survey()
        {
            return View();
        }

        [Route("/survey/website-usage")]
        public IActionResult SurveyPage()
        {
            return View();
        }

        [Route("/intropage")]
        public IActionResult Intro()
        {
            return View();
        }

        [Route("/microsite")]
        public IActionResult Microsite1()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
