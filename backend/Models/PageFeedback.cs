namespace CppCourse.Models;

public class PageFeedback
{
    public int Id { get; set; }
    public int? UserId { get; set; }          // null = анонимный
    public User? User { get; set; }

    public string PageId { get; set; } = "";  // e.g. "signed-unsigned"
    public int Rating { get; set; }           // 1–10
    public string? Comment { get; set; }      // до 1024 символов, опционально
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
