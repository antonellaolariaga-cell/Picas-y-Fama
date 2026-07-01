using NumberGuessGameApi.Models;

namespace NumberGuessGameApi.Services
{
    public interface IGameService
    {
        // Contrato para inicializar una nueva partida
        Task<Game> StartGameAsync(Guid playerId);

        // Contrato para procesar cada intento de adivinanza
        Task<Attempt> ProcessGuessAsync(int gameId, string attemptedNumber);
    }
}
