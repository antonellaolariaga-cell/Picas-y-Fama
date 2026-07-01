
using GameCore;
using Microsoft.EntityFrameworkCore;
using NumberGuessGameApi.Data;
using NumberGuessGameApi.Models;

namespace NumberGuessGameApi.Services
{
    public class GameService : IGameService
    {
        private readonly GameDbContext _context;

        // Inyectar las dependencias por constructor para interactuar con la base de datos
        public GameService(GameDbContext context)
        {
            _context = context;
        }
        public async Task<Game> StartGameAsync(Guid playerId)
        {
            // Validar si el jugador ya tiene una partida activa en curso
            var activeGame = await _context.Games
                .FirstOrDefaultAsync(g => g.PlayerId == playerId && g.State == "Active");

            if (activeGame != null)
            {
                throw new InvalidOperationException("Ya tenés un juego activo. Debés finalizarlo para empezar uno nuevo.");
            }

            // Generar el número secreto aleatorio de 4 dígitos únicos
            string secretNumber = GenerateRandomFourDigits();

            var newGame = new Game
            {
                PlayerId = playerId,
                SecretNumber = secretNumber,
                State = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Games.Add(newGame);
            await _context.SaveChangesAsync();

            return newGame;
        }

        public async Task<Attempt> ProcessGuessAsync(int gameId, string attemptedNumber)
        {
            // Buscar que el juego exista y no esté cerrado
            var game = await _context.Games.FindAsync(gameId);
            if (game == null || game.State == "Finished")
            {
                throw new InvalidOperationException("El juego no existe o ya ha finalizado.");
            }

            //  INTEGRACIÓN CON LA LIBRERÍA DEL PROFESOR 
            // Invocamos el método de extensión nativo que calcula Famas y Picas
            var validationResult = game.SecretNumber.Validate(attemptedNumber);
            string resultMessage = validationResult.Message; // Ej: "Tu número tiene 1 fama y 2 pica"

            var attempt = new Attempt
            {
                GameId = gameId,
                AttemptedNumber = attemptedNumber,
                ResultMessage = resultMessage,
                AttemptedAt = DateTime.UtcNow
            };

            // Si el intento coincide con el número secreto (4 Famas), marcamos el juego como Finished
            if (attemptedNumber == game.SecretNumber)
            {
                game.State = "Terminaste";
            }

            _context.Attempts.Add(attempt);
            await _context.SaveChangesAsync();

            return attempt;
        }

        // Algoritmo auxiliar para garantizar 4 dígitos aleatorios sin repetir
        private string GenerateRandomFourDigits()
        {
            var random = new Random();
            var digits = Enumerable.Range(0, 10).OrderBy(x => random.Next()).Take(4);
            return string.Join("", digits);
        }
    }
}

