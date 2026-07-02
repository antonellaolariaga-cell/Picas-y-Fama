using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NumberGuessGameApi.Data;
using NumberGuessGameApi.DataTransferObjects;
using NumberGuessGameApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace NumberGuessGameApi.Controllers
{
    [ApiController]
    [Route("api/game/v1")] // Ruta base unificada
    public class GameController : ControllerBase
    {
        private readonly GameDbContext _context;
        private readonly ILogger<GameController> _logger;
        private readonly IConfiguration _configuration;

        public GameController(GameDbContext context, ILogger<GameController> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
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

        // --- Helper privado para generar el JWT ---
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