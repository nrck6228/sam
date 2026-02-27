namespace sam.Models
{
    public class CommitteeViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Position { get; set; }
        public string GroupName { get; set; } // เช่น "Executive", "Department", "Unit"
    }
}
