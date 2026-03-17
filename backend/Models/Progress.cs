namespace CppCourse.Models;

public class Progress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string SectionId { get; set; } = "";   // e.g. "integer-types"
    public bool IsRead { get; set; }
    public bool FinalPassed { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
