using System.ComponentModel.DataAnnotations;

namespace NumberGuessGameApi.DataTransferObjects
{
    public class GuessNumberRequest
    {
        [Required(ErrorMessage = "El id del juego es obligatorio.")]
        public int GameId { get; set; }

        [Required(ErrorMessage = "El número intentado es obligatorio.")]
        [Range(0, 9999, ErrorMessage = "El número debe tener 4 dígitos.")]
        public int AttemptedNumber { get; set; }
    }
}