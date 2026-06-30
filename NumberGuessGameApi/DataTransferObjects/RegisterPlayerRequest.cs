using System.ComponentModel.DataAnnotations;

namespace NumberGuessGameApi.DataTransferObjects
{
    public class RegisterPlayerRequest
    {
        [Required(ErrorMessage = "El apellido es obligatorio.")]
        public string Lastname { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        public string Firstname { get; set; } = string.Empty;

        [Required(ErrorMessage = "La edad es obligatoria.")]
        [Range(1, 120, ErrorMessage = "La edad debe ser un número válido.")]
        public int Age { get; set; }

        [Required(ErrorMessage = "El correo es obligatorio.")]
        [EmailAddress(ErrorMessage = "El formato del correo no es válido.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
        public string Password { get; set; } = string.Empty;
    }
}
