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

        public DbSet<EventType> EventTypes { get; set; }

        public DbSet<EventCategory> EventCategories { get; set; }

        public DbSet<Booking> Bookings { get; set; }

        public DbSet<BookingLock> BookingLocks { get; set; }

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

                entity
                    .HasOne<EventCategory>()
                    .WithMany()
                    .HasForeignKey(e => e.EventCategoryId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
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

            modelBuilder.Entity<EventCategory>(entity =>
            {
                entity
                    .HasOne<EventType>()
                    .WithMany()
                    .HasForeignKey(ec => ec.EventTypeId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.Property(b => b.UnitPrice).HasColumnType("decimal(10,2)");
                entity.Property(b => b.SubTotal).HasColumnType("decimal(10,2)");
                entity.Property(b => b.BulkDiscountPercentage).HasColumnType("decimal(5,2)");
                entity.Property(b => b.BulkDiscountAmount).HasColumnType("decimal(10,2)");
                entity.Property(b => b.CouponDiscountPercentage).HasColumnType("decimal(5,2)");
                entity.Property(b => b.CouponDiscountAmount).HasColumnType("decimal(10,2)");
                entity.Property(b => b.FinalAmount).HasColumnType("decimal(10,2)");
                entity.Property(b => b.DiscountType).HasConversion<string>().HasMaxLength(20);

                entity.Property(b => b.Status).HasConversion<string>().HasMaxLength(20);

                entity
                    .HasOne<User>()
                    .WithMany()
                    .HasForeignKey(b => b.UserId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(b => b.EventId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne<Coupon>()
                    .WithMany()
                    .HasForeignKey(b => b.CouponId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<BookingLock>(entity =>
            {
                entity.HasIndex(e => e.ExpiresAt);
                entity.HasIndex(e => e.EventId);
                entity.HasIndex(e => e.RazorpayOrderId).IsUnique();

                entity
                    .HasOne(e => e.Event)
                    .WithMany()
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
