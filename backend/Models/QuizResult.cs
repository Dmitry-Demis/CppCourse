namespace CppCourse.Models;

public class QuizResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string QuizId { get; set; } = "";      // e.g. "quiz_integer-types"
    public string QuizType { get; set; } = "";    // "mini" | "final"
    public int Score { get; set; }
    public int Percent { get; set; }
    public bool Passed { get; set; }
    public int Attempt { get; set; }
    public int BestPercent { get; set; }
    public DateTime TakenAt { get; set; } = DateTime.UtcNow;
}
