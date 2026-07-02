using System.Text.Json.Serialization;

namespace NumberGuessGameApi.DataTransferObjects
{
    public class GuessNumberResponse
    {
        [JsonPropertyName("gameid")]
        public int GameId { get; set; }

        [JsonPropertyName("attemptedNumber")]
        public string AttemptedNumber { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
    }
}