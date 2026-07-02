using System.Text.Json.Serialization;

namespace NumberGuessGameApi.DataTransferObjects
{
    public class StartGameResponse
    {
        [JsonPropertyName("gameid")]
        public int GameId { get; set; }

        [JsonPropertyName("playerid")]
        public Guid PlayerId { get; set; }

        [JsonPropertyName("createat")]
        public string CreateAt { get; set; } = string.Empty;
    }
}