using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using TicketBooking.Repository.Common;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class ImageUploadService(Cloudinary cloudinary) : IImageUploadService
    {
        private readonly Cloudinary _cloudinary = cloudinary;

        private const long MaxSizeBytes = 5 * 1024 * 1024;
        private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png"];
        private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png"];

        public async Task<string> UploadEventPosterAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ValidationException(ExceptionMessage.NoFile);

            if (file.Length > MaxSizeBytes)
                throw new ValidationException(ExceptionMessage.PosterImageSizeExceed(MaxSizeBytes));

            string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext) || !AllowedContentTypes.Contains(file.ContentType))
                throw new ValidationException(ExceptionMessage.InvalidImagePosterExtension);

            if (!IsValidImageSignature(file))
                throw new ValidationException(ExceptionMessage.InvalidImagePosterFormat);

            await using var stream = file.OpenReadStream();
            ImageUploadParams uploadParams = new()
            {
                File = new FileDescription(file.FileName, stream),
                PublicId = $"event_poster_{Guid.NewGuid()}",
                Overwrite = false,
            };

            ImageUploadResult? result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
                throw new Exception(ExceptionMessage.CloudinaryUploadFail(result.Error.Message));

            return result.SecureUrl.ToString();
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            string publicId = ExtractPublicId(imageUrl);

            DeletionParams deletionParams = new(publicId);

            DeletionResult result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Result != "ok" && result.Result != "not found")
            {
                throw new Exception(ExceptionMessage.CloudinaryDeleteFail(result.Result));
            }
        }

        private static string ExtractPublicId(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                throw new ArgumentException("Image URL cannot be null or empty.", nameof(imageUrl));
            }

            Uri uri = new(imageUrl);

            string path = uri.AbsolutePath;

            int uploadIndex = path.IndexOf("/upload/", StringComparison.OrdinalIgnoreCase);

            if (uploadIndex == -1)
            {
                throw new ArgumentException("Invalid Cloudinary URL.", nameof(imageUrl));
            }

            string publicPath = path[(uploadIndex + "/upload/".Length)..];

            string[] segments = publicPath.Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (segments.Length > 0 && segments[0].StartsWith("v"))
            {
                publicPath = string.Join("/", segments.Skip(1));
            }

            return Path.ChangeExtension(publicPath, null)!;
        }

        private static bool IsValidImageSignature(IFormFile file)
        {
            using var reader = new BinaryReader(file.OpenReadStream());
            var bytes = reader.ReadBytes(8);
       
            bool isJpeg =
                bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
            bool isPng =
                bytes.Length >= 4
                && bytes[0] == 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47;
            return isJpeg || isPng;
        }
    }
}
