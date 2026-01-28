using Microsoft.AspNetCore.Mvc;

namespace sam.Views.ViewComponents
{
    public class FooterViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View("~/Views/Shared/_PartialFooter.cshtml");
        }
    }
}
