using Microsoft.EntityFrameworkCore;
using TicketBooking.Repository.Entity;

namespace TicketBooking.Repository
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }

        public DbSet<PassWordResetToken> PassWordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.MobileNumber).IsUnique();
            });

            modelBuilder.Entity<PassWordResetToken>(entity =>
            {
                entity.HasIndex(p => p.TokenHash);

                entity
                    .HasOne<User>()
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(p => p.IsUsed).HasDefaultValue(false);
            });
        }
    }
}
