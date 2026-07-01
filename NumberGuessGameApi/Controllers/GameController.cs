using Microsoft.AspNetCore.Mvc;
using NumberGuessGameApi.Data;

namespace NumberGuessGameApi.Controllers
{
    [ApiController]
    [Route("api/game/v1")] //  Ruta base unificada 
    public class GameController : ControllerBase
    {
        private readonly GameDbContext _context;
        private readonly ILogger<GameController> _logger;
    
        public GameController(GameDbContext context, ILogger<GameController> logger)
        {
            _context = context;
            _logger = logger;
        }

    }
}
