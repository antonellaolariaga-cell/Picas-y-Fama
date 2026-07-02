using System.ComponentModel.DataAnnotations;

namespace NumberGuessGameApi.Models
{
    public class Player
    {
        [Key]
        public Guid PlayerId { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        public int Años { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Contraseña { get; set; } = string.Empty; // Guardar siempre la contraseña encriptada

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relación: Un jugador puede tener muchas partidas
        public ICollection<Game> Games { get; set; } = new List<Game>();
    }
}

