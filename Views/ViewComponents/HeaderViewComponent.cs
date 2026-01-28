using Microsoft.AspNetCore.Mvc;

namespace sam.Views.ViewComponents
{
    public class HeaderViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View("~/Views/Shared/_PartialHeader.cshtml");
        }
    }
}
