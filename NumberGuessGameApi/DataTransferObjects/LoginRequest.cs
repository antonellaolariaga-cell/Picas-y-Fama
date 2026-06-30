using System.ComponentModel.DataAnnotations;

namespace NumberGuessGameApi.DataTransferObjects
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "El correo es obligatorio.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        public string Password { get; set; } = string.Empty;
    }
}
