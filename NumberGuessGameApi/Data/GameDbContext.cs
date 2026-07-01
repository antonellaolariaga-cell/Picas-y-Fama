using NumberGuessGameApi.Models;
using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;


namespace NumberGuessGameApi.Data
{
    public class GameDbContext :DbContext
    {
        
        public GameDbContext(DbContextOptions<GameDbContext> options) : base(options)
        {
        }

        // Definimos las tablas que se crean en la Base de Datos
        public DbSet<Player> Players { get; set; } = null!;
        public DbSet<Game> Games { get; set; } = null!;
        public DbSet<Attempt> Attempts { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuracion adicional por si queremos asegurar reglas de negocio

            // Un jugador tiene muchos juegos, con clave foranea PlayerId
            modelBuilder.Entity<Game>()
                .HasOne(g => g.Player)
                .WithMany(p => p.Games)
                .HasForeignKey(g => g.PlayerId)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra un jugador, se borran sus partidas

            // Un juego tiene muchos intentos, con clave foranea GameId
            modelBuilder.Entity<Attempt>()
                .HasOne(a => a.Game)
                .WithMany(g => g.Attempts)
                .HasForeignKey(a => a.GameId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

