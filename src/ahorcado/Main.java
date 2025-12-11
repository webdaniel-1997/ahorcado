package ahorcado;

import java.util.Scanner;

/**
 * Clase principal. Aquí está el menú y el control del juego.
 */
public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean salir = false;

        System.out.println("=========================================");
        System.out.println("    BIENVENIDO AL JUEGO DEL AHORCADO     ");
        System.out.println("=========================================");

        // Bucle para que el menú salga todo el rato hasta que quieras salir
        while (!salir) {
            System.out.println("\n--- MENÚ PRINCIPAL ---");
            System.out.println("1. Jugar (Modo Aleatorio)");
            System.out.println("2. Jugar (Modo 2 Jugadores)");
            System.out.println("3. Salir");
            System.out.print("Selecciona una opción: ");

            String opcion = scanner.nextLine();

            switch (opcion) {
                case "1":
                    jugarModoAleatorio(scanner);
                    break;
                case "2":
                    jugarModoDosJugadores(scanner);
                    break;
                case "3":
                    salir = true;
                    System.out.println("¡Gracias por jugar! Hasta pronto.");
                    break;
                default:
                    System.out.println("Opción no válida. Inténtalo de nuevo.");
            }
        }
        
        scanner.close();
    }

    private static void jugarModoAleatorio(Scanner scanner) {
        System.out.println("\n--- SELECCIONA DIFICULTAD ---");
        System.out.println("1. Básico (Palabras cortas)");
        System.out.println("2. Avanzado (Palabras técnicas)");
        System.out.print("Elige opción (1 o 2): ");
        
        String input = scanner.nextLine();
        int nivel = 1; // Si falla, ponemos nivel 1 por defecto
        try {
            nivel = Integer.parseInt(input);
            if (nivel != 1 && nivel != 2) nivel = 1;
        } catch (NumberFormatException e) {
            // No pasa nada, se queda en 1
        }

        // Pedimos una palabra al azar según el nivel
        String palabra = DiccionarioSencillo.palabraAleatoria(nivel);
        iniciarJuego(scanner, palabra);
    }

    private static void jugarModoDosJugadores(Scanner scanner) {
        System.out.println("\n--- MODO 2 JUGADORES ---");
        System.out.print("Jugador 1, introduce la palabra secreta (solo letras): ");
        String palabra = scanner.nextLine().toUpperCase();

        // Comprobamos que la palabra valga
        if (palabra.isEmpty() || !esSoloLetras(palabra)) {
            System.out.println("Error: La palabra debe contener solo letras y no estar vacía.");
            return;
        }

        // "Borramos" la pantalla imprimiendo muchas líneas vacías
        for (int i = 0; i < 50; i++) {
            System.out.println();
        }
        System.out.println("¡La consola ha sido limpiada! Turno del Jugador 2.");
        
        iniciarJuego(scanner, palabra);
    }

    private static boolean esSoloLetras(String str) {
        for (int i = 0; i < str.length(); i++) {
            if (!Character.isLetter(str.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private static void iniciarJuego(Scanner scanner, String palabra) {
        // Empezamos con 6 vidas
        JuegoAhorcado juego = new JuegoAhorcado(palabra, 6);
        
        System.out.println("\n¡Empieza la partida!");
        
        // Mientras no ganes ni pierdas, seguimos jugando
        while (juego.getEstado() == EstadoPartida.EN_CURSO) {
            mostrarEstadoTurno(juego);
            
            System.out.println("\nOpciones:");
            System.out.println(" - Escribe una letra para probar.");
            System.out.println(" - Escribe 'RESOLVER' para intentar adivinar la palabra completa.");
            System.out.println(" - Escribe 'PISTA' para obtener una letra (coste: 1 intento).");
            System.out.print("Tu acción: ");
            
            String entrada = scanner.nextLine().trim();

            try {
                procesarEntrada(juego, entrada);
            } catch (LetraRepetidaException e) {
                System.out.println(">>> AVISO: " + e.getMessage());
            } catch (IntentoInvalidoException e) {
                System.out.println(">>> ERROR: " + e.getMessage());
            } catch (Exception e) {
                System.out.println(">>> ERROR INESPERADO: " + e.getMessage());
            }
        }

        finalizarPartida(juego);
    }

    private static void mostrarEstadoTurno(JuegoAhorcado juego) {
        System.out.println("\n-----------------------------------------");
        System.out.println(AsciiArt.stage(juego.getIntentosRestantes()));
        System.out.println("Palabra: " + juego.getPalabraOculta());
        System.out.println("Fallos: " + juego.getLetrasFalladas());
        System.out.println("Intentos restantes: " + juego.getIntentosRestantes());
    }

    private static void procesarEntrada(JuegoAhorcado juego, String entrada) throws LetraRepetidaException, IntentoInvalidoException {
        if (entrada.isEmpty()) {
            throw new IntentoInvalidoException("No has introducido nada.");
        }

        // Si escribe RESOLVER (o intenta resolver con una palabra larga)
        if (entrada.equalsIgnoreCase("RESOLVER")) {
            System.out.print("Introduce la palabra completa: ");

            Scanner sc = new Scanner(System.in); 
            String intento = sc.nextLine();
            juego.resolver(intento);
            
        } else if (entrada.equalsIgnoreCase("PISTA")) {
             juego.pedirPista();
             System.out.println(">>> ¡Pista usada!");
             
        } else if (entrada.length() > 1) {
            // Si escribe más de una letra y no es un comando, asumimos que intenta resolver
            juego.resolver(entrada);
            
        } else {
            // Es una letra normal
            juego.intentarLetra(entrada.charAt(0));
        }
    }

    private static void finalizarPartida(JuegoAhorcado juego) {
        System.out.println("\n-----------------------------------------");
        System.out.println(AsciiArt.stage(juego.getIntentosRestantes()));
        
        if (juego.getEstado() == EstadoPartida.VICTORIA) {
            System.out.println("¡FELICIDADES! Has ganado.");
            System.out.println("La palabra era: " + juego.getPalabraSecreta());
        } else {
            System.out.println("¡GAME OVER! Te has quedado sin intentos.");
            System.out.println("La palabra era: " + juego.getPalabraSecreta());
        }
        
        // Calculamos y mostramos el tiempo
        java.time.Duration duracion = juego.getDuracion();
        long minutos = duracion.toMinutes();
        long segundos = duracion.minusMinutes(minutos).getSeconds();
        System.out.println("Duración de la partida: " + minutos + " min " + segundos + " s");

        System.out.println("-----------------------------------------");
    }
}
