using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NumberGuessGameApi.Models
{
    public class Game
    {
        [Key]
        public int GameId { get; set; }

        [Required]
        public Guid PlayerId { get; set; }

        [Required]
        [StringLength(4)]
        public string SecretNumber { get; set; } = string.Empty;

        [Required]
        public string State { get; set; } = "Active"; // "Active" o "Finished"

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación de Entity Framework
        [ForeignKey("PlayerId")]
        public Player Player { get; set; } = null!;

        // Relación: Un juego tiene muchos intentos de adivinanza
        public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    }
}

