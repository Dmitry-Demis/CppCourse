using CppCourse.Data;
using CppCourse.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CppCourse.Controllers;

[ApiController]
[Route("api/feedback")]
public class FeedbackController(AppDbContext db) : ControllerBase
{
    public record FeedbackRequest(string PageId, int Rating, string? Comment);

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] FeedbackRequest req)
    {
        if (req.Rating < 1 || req.Rating > 10)
            return BadRequest("Rating must be between 1 and 10.");

        if (req.Comment?.Length > 1024)
            return BadRequest("Comment too long.");

        // Получаем userId из JWT если авторизован (опционально)
        int? userId = null;
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (int.TryParse(userIdClaim, out var uid)) userId = uid;

        var feedback = new PageFeedback
        {
            UserId = userId,
            PageId = req.PageId,
            Rating = req.Rating,
            Comment = string.IsNullOrWhiteSpace(req.Comment) ? null : req.Comment.Trim(),
        };

        db.PageFeedbacks.Add(feedback);
        await db.SaveChangesAsync();

        return Ok(new { feedback.Id });
    }

    [HttpGet("{pageId}")]
    public async Task<IActionResult> GetStats(string pageId)
    {
        var items = await db.PageFeedbacks
            .Where(f => f.PageId == pageId)
            .ToListAsync();

        if (items.Count == 0)
            return Ok(new { count = 0, average = (double?)null });

        return Ok(new
        {
            count = items.Count,
            average = Math.Round(items.Average(f => f.Rating), 1)
        });
    }
}
