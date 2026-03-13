using Microsoft.AspNetCore.Mvc;
using sam.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Linq;

namespace sam.Controllers
{
    public class AboutController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [Route("about/vision-mission")]
        public IActionResult Vision()
        {
            return View("~/Views/About/Vision.cshtml");
        }

        //[Route("about")]
        //public IActionResult History()
        //{
        //    return View("~/Views/About/History.cshtml");
        //}

        [Route("about/annual-report")]
        [Route("about/annual-report/page/{page:int}")]
        public IActionResult Annual(int page = 1)
        {
            // ไม่ต้องส่ง Model แล้ว เพราะ JS จะจัดการต่อเอง
            return View("~/Views/About/Annual.cshtml");
        }

        [Route("about/financial-statements")]
        [Route("about/financial-statements/page/{page:int}")]
        public IActionResult Financial(int page = 1) // รับค่า page มาจาก URL (ถ้าไม่มีจะเป็น 1)
        {
            return View("~/Views/About/Financial.cshtml");
        }

        [Route("about/board-of-directors")]
        public IActionResult Boards()
        {
            // 1. สร้างข้อมูลจำลองของคณะกรรมการ (หรือดึงจาก DB ในอนาคต)
            var committees = new List<DirectorViewModel>
            {
                new DirectorViewModel { Name = "นางสาวสุวรรณี เจษฎาศักดิ์", Position = "ประธานกรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board01.png" },
                new DirectorViewModel { Name = "นายวีระชัย อมรถกลสุเวช", Position = "รองประธานกรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board02.png" },
                new DirectorViewModel { Name = "ศ.พิเศษ วิศิษฏ์ วิศิษฏ์สรอรรถ", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board03.png" },
                new DirectorViewModel { Name = "นางอโณทัย บุญยะลีพรรณ", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board04.png" },
                new DirectorViewModel { Name = "นายอรรถพล อรรถวรเดช", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board05.png" },
                new DirectorViewModel { Name = "นายวิชิต จรัสสุขสวัสดิ์", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board06.png" },
                new DirectorViewModel { Name = "นางวริสนา บุญญาสัย", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board07.png" },
                new DirectorViewModel { Name = "นางปิยมาล ตุงควิจิตรวัฒน์", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board08.png" },
                new DirectorViewModel { Name = "นายพูลพัฒน์ ศรีเปล่ง", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board09.png" },
                new DirectorViewModel { Name = "นางสาวรุ้งนภา เลิศสุวรรณกุล", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board10.png" },
                new DirectorViewModel { Name = "นางบุษกร ธีระปัญญาชัย", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board11.png" },
                new DirectorViewModel { Name = "นายเกรียงศักดิ์ เซ่งเจริญ", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board12.png" },
                new DirectorViewModel { Name = "นางสาวนารถนารี รัฐปัตย์", Position = "กรรมการ", ImageUrl = "/media/images/board/committee/SAM_img-board13.png" }
            };

            // 2. ส่งข้อมูลไปยัง View
            return View("~/Views/About/Directors.cshtml", committees);
        }

        [Route("about/board-of-executives")]
        public IActionResult Executives()
        {
            var executives = new List<ExecutiveViewModel>
            {
                // ผู้บริหารระดับสูง (เขียว)
                new ExecutiveViewModel { Name = "นางสาวนารถนารี รัฐปัตย์", Position = "กรรมการผู้จัดการ", ImageUrl = "/media/images/board/executive/SAM_img-sm00.png", GroupName = "executives" },
        
                // ผู้บริหารสายงาน (เขียว, ชมพู, เหลือง)
                new ExecutiveViewModel { Name = "นายสุรไท รัตนนาวิน", Position = "รองกรรมการผู้จัดการ", ImageUrl = "/media/images/board/line-management/SAM_img-sm01.png", GroupName = "line-management" },
                new ExecutiveViewModel { Name = "นายสุรงค์ สุวรรณวานิช", Position = "ผู้ช่วยกรรมการผู้จัดการอาวุโส", ImageUrl = "/media/images/board/line-management/SAM_img-sm02.png", GroupName = "line-management" },
                new ExecutiveViewModel { Name = "นายกฤษณพงศ์ กิจสนาพิทักษ์", Position = "ผู้ช่วยกรรมการผู้จัดการอาวุโส", ImageUrl = "/media/images/board/line-management/SAM_img-sm03.png", GroupName = "line-management" },

                // ผู้บริหารกลุ่มงาน
                new ExecutiveViewModel { Name = "นางสาวอัจฉรา นันจุติ", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่ม Corporate & SME", ImageUrl = "/media/images/board/group-management/SAM_img-sm04.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "นายพัชรพงศ์ บุญนิ่ม", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่ม Retail & Branch", ImageUrl = "/media/images/board/group-management/SAM_img-sm05.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "นางสุวัธนา รัศมีโรจน์วงศ์", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่ม Clean Loan", ImageUrl = "/media/images/board/group-management/SAM_img-sm06.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "นายสุรไท รัชตะนาวิน", Position = "รองกรรมการผู้จัดการ กลุ่มบริหารทรัพย์สิน (รักษาการ)", ImageUrl = "/media/images/board/line-management/SAM_img-sm01.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "ดร.สุนทรา พลไตร", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มกฎหมายและงานคดี", ImageUrl = "/media/images/board/group-management/SAM_img-sm08.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "นายอุดม พลสมบัตินันท์", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มสนับสนุนธุรกิจ", ImageUrl = "/media/images/board/group-management/SAM_img-sm09.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มบัญชี การเงิน และจัดซื้อจัดจ้าง", ImageUrl = "", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "นางสาววรกานต์ศรี ด่านผดุงทรัพย์", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มเทคโนโลยีสารสนเทศ", ImageUrl = "/media/images/board/group-management/SAM_img-sm11.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "นายภิทย อนุรักษ์ภราดร", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มกลยุทธ์และสื่อสารองค์กร", ImageUrl = "/media/images/board/group-management/SAM_img-sm12.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มทรัพยากรมนุษย์", ImageUrl = "", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "ดร.วศิน ซื่อสุทธจิต", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มตรวจสอบ", ImageUrl = "/media/images/board/group-management/SAM_img-sm14.png", GroupName = "group-management" },
                new ExecutiveViewModel { Name = "นางสาววิยะดา มะโนประเสริฐกุล", Position = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มบริหารความเสี่ยงและกำกับการปฏิบัติงาน", ImageUrl = "/media/images/board/group-management/SAM_img-sm15.png", GroupName = "group-management" },
            };

            return View("~/Views/About/Executives.cshtml", executives);
        }

        [Route("about/vice-president")]
        [Route("about/vice-president/{slug?}")]
        public IActionResult VicePresident(string slug)
        {
            var presidents = new List<VicePresidentViewModel>
            {
                new VicePresidentViewModel { Name = "นายอภิสิทธิ์ วงศ์วิลาสชัย", Position = "ผู้บริหารฝ่ายตรวจสอบธุรกิจ", ImageUrl = "/media/images/board/division/SAM_img-dm01_01.png", GroupName = "group-1" },
                new VicePresidentViewModel { Name = "นายศิษฎ์วสุ ตุลยายน", Position = "ผู้บริหารฝ่ายตรวจสอบและพัฒนาระบบตรวจสอบเทคโนโลยีสารสนเทศ", ImageUrl = "/media/images/board/division/SAM_img-dm01_02.png", GroupName = "group-1" },
        
                new VicePresidentViewModel { Name = "นางสาวดิษยา สินศิริ", Position = "ผู้บริหารฝ่ายกำกับการปฏิบัติงาน", ImageUrl = "/media/images/board/division/SAM_img-dm02_02.png", GroupName = "group-2" },

                new VicePresidentViewModel { Name = "นายภิทย อนุรักษ์ภราดร", Position = "ผู้บริหารฝ่ายกลยุทธ์และพัฒนาผลิตภัณฑ์องค์กร (รักษาการ)", ImageUrl = "/media/images/board/division/SAM_img-sm12.png", GroupName = "group-3" },
                new VicePresidentViewModel { Name = "นางสาวนัยน์ชนก สังขวิจิตร", Position = "ผู้บริหารฝ่ายสื่อสารองค์กร", ImageUrl = "/media/images/board/division/SAM_img-dm03_02.png", GroupName = "group-3" },

                new VicePresidentViewModel { Name = "นายสุขสรรค์ รตเวสสนันท์", Position = "ผู้บริหารฝ่ายพัฒนาทรัพยากรมนุษย์ (รักษาการ)", ImageUrl = "/media/images/board/division/SAM_img-dm03_04.png", GroupName = "group-4" },

                new VicePresidentViewModel { Name = "นางสาวฉันทนีย์ รุ่งรัตน์ธวัชชัย", Position = "ผู้บริหารสำนักกรรมการผู้จัดการ และหน่วยงานโครงการพิเศษ", ImageUrl = "/media/images/board/division/SAM_img-dm03_06.png", GroupName = "group-5" },

                new VicePresidentViewModel { Name = "นางสาวอัจฉรา นันทจุติ", Position = "ผู้บริหารฝ่ายปรับโครงสร้างหนี้ Corporate&SME1 (รักษาการ)", ImageUrl = "/media/images/board/division/SAM_img-sm04.png", GroupName = "group-6" },
                new VicePresidentViewModel { Name = "นางสาวอัญชลี มณีเกียรติไพบูลย์", Position = "ผู้บริหารฝ่ายปรับโครงสร้างหนี้ Corporate&SME2", ImageUrl = "/media/images/board/division/SAM_img-dm04_02.png", GroupName = "group-6" },

                new VicePresidentViewModel { Name = "นายพัชรพงศ์ บุญนิ่ม", Position = "ผู้บริหารฝ่ายปรับโครงสร้างหนี้รายย่อย (รักษาการ)", ImageUrl = "/media/images/board/division/SAM_img-sm05.png", GroupName = "group-7" },
                new VicePresidentViewModel { Name = "นายเชฎฐพันธ์ อัศวพิชยนต์", Position = "ผู้บริหารฝ่ายกิจการสาขา", ImageUrl = "/media/images/board/division/SAM_img-dm04_04.png", GroupName = "group-7" },

                new VicePresidentViewModel { Name = "นายอุดม พลสมบัตินันท์", Position = "ผู้บริหารฝ่ายบริหารหนี้ไม่มีหลักประกัน (รักษาการ)", ImageUrl = "/media/images/board/division/SAM_img-sm09.png", GroupName = "group-8" },

                new VicePresidentViewModel { Name = "นายประพนธ์ เพิ่มพิทักษ์", Position = "ผู้บริหารฝ่ายบริหารการจำหน่ายทรัพย์ NPA 1", ImageUrl = "/media/images/board/division/SAM_img-dm05_01.png", GroupName = "group-9" },
                new VicePresidentViewModel { Name = "นายชวลิต พูลพิพัฒน์", Position = "ผู้บริหารฝ่ายบริหารการจำหน่ายทรัพย์ NPA 2", ImageUrl = "/media/images/board/division/SAM_img-dm05_02.png", GroupName = "group-9" },
                new VicePresidentViewModel { Name = "นางสาวทิพย์ประภา บูรณ์โภคา", Position = "ผู้บริหารฝ่ายบริหารการจำหน่ายทรัพย์ NPA 3", ImageUrl = "/media/images/board/division/SAM_img-dm05_03.png", GroupName = "group-9" },

                new VicePresidentViewModel { Name = "นายพงศธร แท่นประมูล", Position = "ผู้บริหารฝ่ายกำกับงานคดี", ImageUrl = "/media/images/board/division/SAM_img-dm06_02.png", GroupName = "group-10" },
                new VicePresidentViewModel { Name = "นายเริงศราวุธ สันทัด", Position = "ผู้บริหารฝ่ายกฎหมายและนิติกรรมสัญญา", ImageUrl = "/media/images/board/division/SAM_img-dm06_03.png", GroupName = "group-10" },

                new VicePresidentViewModel { Name = "นางสาวสุนทรี เกศการุณกุล", Position = "ผู้บริหารฝ่ายพิธีการปรับหนี้", ImageUrl = "/media/images/board/division/SAM_img-dm06_04.png", GroupName = "group-11" },
                new VicePresidentViewModel { Name = "นายจักรพงศ์ กาญจนจิระโรจน์", Position = "ผู้บริหารฝ่ายประเมินราคาทรัพย์สิน", ImageUrl = "/media/images/board/division/SAM_img-dm06_06.png", GroupName = "group-11" },
                new VicePresidentViewModel { Name = "นางสาวเนตรนภา บุษยบัณฑูร", Position = "ผู้บริหารฝ่ายบริหารข้อมูลทรัพย์สินและเอกสารสำคัญ", ImageUrl = "/media/images/board/division/SAM_img-dm06_05.png", GroupName = "group-11" },

                new VicePresidentViewModel { Name = "นางสาวชุติมา ดำรงค์ศักดิ์", Position = "ผู้บริหารฝ่ายบัญชีและการเงิน", ImageUrl = "/media/images/board/division/SAM_img-dm07_01.png", GroupName = "group-12" },
                new VicePresidentViewModel { Name = "นางสาวปภาดา เจนบุญญานนท์", Position = "ผู้บริหารฝ่ายจัดซื้อและอำนวยการกลาง", ImageUrl = "/media/images/board/division/SAM_img-dm07_02.png", GroupName = "group-12" },

                new VicePresidentViewModel { Name = "นายธเนศ ตั้งธนอำรุง", Position = "ผู้บริหารฝ่ายกลยุทธ์และวางแผนเทคโนโลยีสารสนเทศ", ImageUrl = "/media/images/board/division/SAM_img-dm07_03.png", GroupName = "group-13" },
                new VicePresidentViewModel { Name = "นางสาวธัญญารัตน์ เสน่ห์นุกูล", Position = "ผู้บริหารฝ่ายพัฒนาระบบเทคโนโลยีสารสนเทศ", ImageUrl = "/media/images/board/division/SAM_img-dm07_04.png", GroupName = "group-13" },

                new VicePresidentViewModel { Name = "นายปฏิภาณ พสุวัต", Position = "ผู้บริหารฝ่ายบริหารการซื้อทรัพย์", ImageUrl = "/media/images/board/division/SAM_img-dm07_05.png", GroupName = "group-14" },
            };

            return View("~/Views/About/VicePresident.cshtml", presidents);
        }

        [Route("about/committee")]
        [Route("about/committee/{slug?}")]
        public IActionResult Committee(string slug)
        {
            var presidents = new List<CommitteeViewModel>
            {
                new CommitteeViewModel { Name = "นายพูลพัฒน์ ศรีเปล่ง", Position = "ประธานกรรมการ", GroupName = "group-1" },
                new CommitteeViewModel { Name = "นางปนุท ณ เชียงใหม่", Position = "กรรมการ", GroupName = "group-1" },
                new CommitteeViewModel { Name = "นายบุญเที่ยง ภูมี", Position = "กรรมการ", GroupName = "group-1" },
                new CommitteeViewModel { Name = "นางสาวสุวรรณา ลีวีระพันธุ์", Position = "กรรมการ", GroupName = "group-1" },
                new CommitteeViewModel { Name = "นางสาวนารถนารี  รัฐปัตย์", Position = "กรรมการ", GroupName = "group-1" },
                new CommitteeViewModel { Name = "ผู้ช่วยกรรมการผู้จัดการ กลุ่มบริหารความเสี่ยงและกำกับการปฏิบัติงาน", Position = "เลขานุการ", GroupName = "group-1" },
                new CommitteeViewModel { Name = "ผู้บริหารฝ่ายบริหารความเสี่ยง", Position = "ผู้ช่วยเลขานุการ", GroupName = "group-1" },

                new CommitteeViewModel { Name = "ศ.(พิเศษ)วิศิษฏ์ วิศิษฏ์สรอรรถ", Position = "ประธานกรรมการ", GroupName = "group-2" },
                new CommitteeViewModel { Name = "นางอโณทัย บุญยะลีพรรณ", Position = "กรรมการ", GroupName = "group-2" },
                new CommitteeViewModel { Name = "นางสาวรุ้งนภา  เลิศสุวรรณกุล", Position = "กรรมการ", GroupName = "group-2" },
                new CommitteeViewModel { Name = "ดร.วศิน ซื่อสุทธจิต", Position = "เลขานุการ", GroupName = "group-2" },

                new CommitteeViewModel { Name = "ศ.(พิเศษ) วิศิษฏ์ วิศิษฏ์สรอรรถ", Position = "ประธานกรรมการ", GroupName = "group-3" },
                new CommitteeViewModel { Name = "นายวิชิต จรัสสุขสวัสดิ์", Position = "กรรมการ", GroupName = "group-3" },
                new CommitteeViewModel { Name = "ดร. วรรณชัย บุญบำรุง", Position = "กรรมการ", GroupName = "group-3" },
                new CommitteeViewModel { Name = "นางศศิวิมล ธนศานติ", Position = "กรรมการ", GroupName = "group-3" },
                new CommitteeViewModel { Name = "ศ.ดร. นนทวัชร์ นวตระกูลพิสุทธิ์", Position = "กรรมการ", GroupName = "group-3" },
                new CommitteeViewModel { Name = "ผู้บริหารสายงานกฎหมายและสนับสนุนธุรกิจ", Position = "เลขานุการ", GroupName = "group-3" },

                new CommitteeViewModel { Name = "นางวิรัสนา บุญญาสัย", Position = "ประธานกรรมการ", GroupName = "group-4" },
                new CommitteeViewModel { Name = "นางปนุท ณ เชียงใหม่", Position = "กรรมการ", GroupName = "group-4" },
                new CommitteeViewModel { Name = "นายพสิษฐ์ อัศววัฒนาพร", Position = "กรรมการ", GroupName = "group-4" },
                new CommitteeViewModel { Name = "นางสุรางค์ ธนัตถานนท์", Position = "กรรมการ", GroupName = "group-4" },
                new CommitteeViewModel { Name = "นางสาวชุลีพร น่วมทนง", Position = "กรรมการ", GroupName = "group-4" },
                new CommitteeViewModel { Name = "นางสาวนารถนารี รัฐปัตย์", Position = "กรรมการ", GroupName = "group-4" },
                new CommitteeViewModel { Name = "สำนักกรรมการผู้จัดการและหน่วยงานโครงการพิเศษ", Position = "เลขานุการ", GroupName = "group-4" },

                new CommitteeViewModel { Name = "นายอรรถพล อรรถวรเดช", Position = "ประธานกรรมการ", GroupName = "group-5" },
                new CommitteeViewModel { Name = "นายวสันต์ เอกนุ่ม", Position = "กรรมการ", GroupName = "group-5" },
                new CommitteeViewModel { Name = "นายอิสระ บุญยัง", Position = "กรรมการ", GroupName = "group-5" },
                new CommitteeViewModel { Name = "นางสาวนารถนารี รัฐปัตย์", Position = "กรรมการ", GroupName = "group-5" },
                new CommitteeViewModel { Name = "ผู้บริหารสายงานบริหารทรัพย์สิน", Position = "เลขานุการ", GroupName = "group-5" },

                new CommitteeViewModel { Name = "นางบุษกร ธีระปัญญาชัย ", Position = "ประธานกรรมการ", GroupName = "group-6" },
                new CommitteeViewModel { Name = "นายเมธพลนันทน์ อธิเมธพัฒน์", Position = "กรรมการ", GroupName = "group-6" },
                new CommitteeViewModel { Name = "ดร. สรณันท์ จิวะสุรัตน์", Position = "กรรมการ", GroupName = "group-6" },
                new CommitteeViewModel { Name = "ดร. สุนทรีย์ ส่งเสริม", Position = "กรรมการ", GroupName = "group-6" },
                new CommitteeViewModel { Name = "นางสาวนารถนารี รัฐปัตย์", Position = "กรรมการ", GroupName = "group-6" },
                new CommitteeViewModel { Name = "ผู้บริหารสายงานการเงิน ปฏิบัติการและเทคโนโลยี", Position = "เลขานุการ", GroupName = "group-6" },
            };

            return View("~/Views/About/Committee.cshtml", presidents);
        }

        [Route("about/business-policy")] // เก็บไว้เผื่อคนพิมพ์แบบเต็ม
        [Route("business-policy/{slug?}")] // URL ที่ต้องการ: business-policy/management-non-performing-loans
        public IActionResult BusinessPolicy(string slug)
        {
            // เราจะใช้ slug ในการระบุว่าจะเปิด Tab ไหน (จะอธิบายในส่วน JS)
            return View("~/Views/About/BusinessPolicy.cshtml");
        }
    }
}
