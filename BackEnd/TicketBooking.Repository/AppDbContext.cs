using Microsoft.EntityFrameworkCore;
using TicketBooking.Repository.Entity;

namespace TicketBooking.Repository
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<User> Users { get; set; }

        public DbSet<PassWordResetToken> PassWordResetTokens { get; set; }

        public DbSet<Event> Events { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<CouponUsage> CouponUsages { get; set; }

        public DbSet<EventCouponCode> EventCouponCodes { get; set; }

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

            modelBuilder.Entity<Event>(entity =>
            {
                entity.Property(e => e.Title).IsRequired();
                entity.Property(e => e.ArtistName).IsRequired();
                entity.Property(e => e.Venue).IsRequired();
                entity.Property(e => e.TicketPrice).HasColumnType("decimal(10,2)");
            });

            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.Property(c => c.Code).IsRequired();
                entity.HasIndex(c => c.Code).IsUnique();
                entity.Property(c => c.DiscountPercentage).HasColumnType("decimal(5,2)");
            });

            modelBuilder.Entity<CouponUsage>(entity =>
            {
                entity.HasIndex(cu => new { cu.CouponId, cu.UserId }).IsUnique();

                entity
                    .HasOne(cu => cu.Coupon)
                    .WithMany()
                    .HasForeignKey(cu => cu.CouponId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne<User>()
                    .WithMany()
                    .HasForeignKey(cu => cu.UserId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasIndex(rt => rt.Token);

                entity
                    .HasOne<User>()
                    .WithMany()
                    .HasForeignKey(rt => rt.UserId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<EventCouponCode>(entity =>
            {
                entity.HasIndex(ec => new { ec.CouponId, ec.EventId }).IsUnique();
                entity
                    .HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(ec => ec.EventId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne<Coupon>()
                    .WithMany()
                    .HasForeignKey(ec => ec.CouponId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
