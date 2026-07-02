using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NumberGuessGameApi.Data;
using NumberGuessGameApi.DataTransferObjects;
using NumberGuessGameApi.Models;
using NumberGuessGameApi.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace NumberGuessGameApi.Controllers
{
    [ApiController]
    [Route("api/game/v1")]
    public class GameController : ControllerBase
    {
        private readonly GameDbContext _context;
        private readonly ILogger<GameController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IGameService _gameService;

        public GameController(
            GameDbContext context,
            ILogger<GameController> logger,
            IConfiguration configuration,
            IGameService gameService)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _gameService = gameService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterPlayerResponse>> Register([FromBody] RegisterPlayerRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingPlayer = await _context.Players
                    .FirstOrDefaultAsync(p => p.Email == request.Email);

                if (existingPlayer is not null)
                {
                    return BadRequest(new { message = "El correo ya está registrado." });
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var newPlayer = new Player
                {
                    PlayerId = Guid.NewGuid(),
                    Nombre = request.Firstname,
                    Apellido = request.Lastname,
                    Años = request.Age,
                    Email = request.Email,
                    Contraseña = passwordHash,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Players.Add(newPlayer);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Nuevo jugador registrado: {Email}", newPlayer.Email);

                var token = GenerateJwtToken(newPlayer);

                return Ok(new RegisterPlayerResponse { Token = token });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar jugador {Email}", request.Email);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Ocurrió un error interno al registrar el jugador." });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var player = await _context.Players
                    .FirstOrDefaultAsync(p => p.Email == request.Email);

                if (player is null || !BCrypt.Net.BCrypt.Verify(request.Password, player.Contraseña))
                {
                    return BadRequest(new { message = "Correo o contraseña incorrectos." });
                }

                var token = GenerateJwtToken(player);

                _logger.LogInformation("Login exitoso para {Email}", player.Email);

                return Ok(new LoginResponse { Token = token });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en login para {Email}", request.Email);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Ocurrió un error interno al iniciar sesión." });
            }
        }

        [Authorize]
        [HttpPost("start")]
        public async Task<IActionResult> StartGame()
        {
            var playerId = GetPlayerIdFromToken();
            if (playerId is null)
            {
                return Unauthorized(new { message = "Token inválido o sin información del jugador." });
            }

            try
            {
                var game = await _gameService.StartGameAsync(playerId.Value);

                _logger.LogInformation("Juego {GameId} iniciado para jugador {PlayerId}", game.GameId, playerId);

                var response = new StartGameResponse
                {
                    GameId = game.GameId,
                    PlayerId = game.PlayerId,
                    CreateAt = game.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss")
                };

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                // Ya tiene un juego activo
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al iniciar juego para jugador {PlayerId}", playerId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Ocurrió un error interno al iniciar el juego." });
            }
        }

        [Authorize]
        [HttpPost("guess")]
        public async Task<IActionResult> Guess([FromBody] GuessNumberRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var playerId = GetPlayerIdFromToken();
            if (playerId is null)
            {
                return Unauthorized(new { message = "Token inválido o sin información del jugador." });
            }

            var attemptedNumberStr = request.AttemptedNumber.ToString("D4");

            if (!HasFourUniqueDigits(attemptedNumberStr))
            {
                return BadRequest(new { message = "El número debe tener 4 dígitos sin repetir." });
            }

            try
            {
                var gameExists = await _context.Games.AnyAsync(g => g.GameId == request.GameId);
                if (!gameExists)
                {
                    return NotFound(new { message = $"El juego {request.GameId} no existe." });
                }

                var attempt = await _gameService.ProcessGuessAsync(request.GameId, attemptedNumberStr);

                var response = new GuessNumberResponse
                {
                    GameId = request.GameId,
                    AttemptedNumber = attemptedNumberStr,
                    Message = attempt.ResultMessage
                };

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                // Juego inexistente o ya finalizado
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar intento para juego {GameId}", request.GameId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Ocurrió un error interno al procesar el intento." });
            }


        }
        

        // --- Helpers privados ---

        private Guid? GetPlayerIdFromToken()
        {
            var claim = User.FindFirst("playerId")?.Value;
            return Guid.TryParse(claim, out var playerId) ? playerId : null;
        }

        private static bool HasFourUniqueDigits(string number)
        {
            if (number.Length != 4 || !number.All(char.IsDigit))
            {
                return false;
            }

            return number.Distinct().Count() == 4;
        }

        private string GenerateJwtToken(Player player)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, player.PlayerId.ToString()),
                new Claim("playerId", player.PlayerId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, player.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}