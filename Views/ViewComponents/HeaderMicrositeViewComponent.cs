using Microsoft.AspNetCore.Mvc;

namespace sam.Views.ViewComponents
{
    public class HeaderMicrositeViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View("~/Views/Shared/_PartialHeaderMicrosite.cshtml");
        }
    }
}
