using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace TicketBooking.Service.Service.Interface
{
    public interface IImageUploadService
    {
        Task<string> UploadEventPosterAsync(IFormFile file);
        Task DeleteImageAsync(string imageUrl);
    }
}
