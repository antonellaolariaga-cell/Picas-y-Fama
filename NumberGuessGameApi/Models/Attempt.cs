using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NumberGuessGameApi.Models
{
    public class Attempt
    {
        [Key]
        public int AttemptId { get; set; }

        [Required]
        public int GameId { get; set; }

        [Required]
        [StringLength(4)]
        public string AttemptedNumber { get; set; } = string.Empty;

        [Required]
        public string ResultMessage { get; set; } = string.Empty; // Guardará el texto de Famas/Picas

        [Required]
        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;

        // Propiedad de navegación
        [ForeignKey("GameId")]
        public Game Game { get; set; } = null!;
    }
}

