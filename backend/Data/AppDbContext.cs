using CppCourse.Models;
using Microsoft.EntityFrameworkCore;

namespace CppCourse.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Progress> Progresses => Set<Progress>();
    public DbSet<QuizResult> QuizResults => Set<QuizResult>();
    public DbSet<PageFeedback> PageFeedbacks => Set<PageFeedback>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Progress>()
            .HasIndex(p => new { p.UserId, p.SectionId })
            .IsUnique();

        b.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
