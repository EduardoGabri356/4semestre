// ============================================================================
// CONFIGURACAO DOS PINOS 
// ============================================================================
const byte LED_VERMELHO_LADOA = 11; // LED Vermelho do Lado A ligado no pino 11
const byte LED_AMARELO_LADOA  = 10; // LED Amarelo do Lado A ligado no pino 10
const byte LED_VERDE_LADOA    = 9;  // LED Verde do Lado A ligado no pino 9

const byte LED_VERMELHO_LADOB = 7;  // LED Vermelho do Lado B ligado no pino 7
const byte LED_AMARELO_LADOB  = 6;  // LED Amarelo do Lado B ligado no pino 6
const byte LED_VERDE_LADOB    = 5;  // LED Verde do Lado B ligado no pino 5

const byte BOTAO_EMERGENCIA   = 2;  // Botao conectado no pino 2 (pino de interrupcao)

// ============================================================================
// TEMPOS E VARIAVEIS DE CONTROLE
// ============================================================================
const unsigned long TEMPO_VERDE_VERMELHO = 5000; // Tempo do sinal aberto/fechado (5s)
const unsigned long TEMPO_AMARELO        = 1000; // Tempo do sinal amarelo (1s)
const unsigned long TEMPO_PISCA_EMERG   = 500;  // Velocidade do pisca-alerta (0.5s)

// 'volatile' indica que a variavel muda instantaneamente na interrupcao
volatile bool modoEmergencia = false; 
volatile unsigned long ultimoDebounce = 0; // Evita que o botao registre cliques falsos

unsigned long tempoAnterior = 0; // Guarda a hora da ultima mudanca no semaforo
unsigned long tempoPisca = 0;    // Guarda a hora da ultima piscada do amarelo
byte estadoSemaforo = 0;         // Guarda qual "pagina" do semaforo esta rodando (0, 1, 2 ou 3)
bool estadoPisca = LOW;          // Controla se o amarelo da emergencia esta ACESO ou APAGADO

// ============================================================================
// ALARME DE EMERGENCIA (Funcao executada IMEDIATAMENTE ao apertar o botao)
// ============================================================================
void tratarBotaoEmergencia() {
  unsigned long agora = millis();
  
  // So aceita o clique se passou mais de 250 milissegundos do ultimo clique
  if (agora - ultimoDebounce > 250) {
    modoEmergencia = !modoEmergencia; // Inverte: se era falso vira verdadeiro (e vice-versa)
    ultimoDebounce = agora;
  }
}

// ============================================================================
// CONFIGURACOES INICIAIS (Executado apenas 1 vez ao ligar o Arduino)
// ============================================================================
void setup() {
  // Define todos os pinos dos LEDs como SAIDAS de energia
  pinMode(LED_VERMELHO_LADOA, OUTPUT);
  pinMode(LED_AMARELO_LADOA, OUTPUT);
  pinMode(LED_VERDE_LADOA, OUTPUT);

  pinMode(LED_VERMELHO_LADOB, OUTPUT);
  pinMode(LED_AMARELO_LADOB, OUTPUT);
  pinMode(LED_VERDE_LADOB, OUTPUT);

  // Define o pino do botao como ENTRADA (usa o resistor da sua protoboard)
  pinMode(BOTAO_EMERGENCIA, INPUT);

  // Liga o "alarme": quando o pino 2 receber energia (RISING), roda 'tratarBotaoEmergencia'
  attachInterrupt(digitalPinToInterrupt(BOTAO_EMERGENCIA), tratarBotaoEmergencia, RISING);

  Serial.begin(9600);
}

// ============================================================================
// LOOP PRINCIPAL (Executado infinitas vezes por segundo)
// ============================================================================
void loop() {
  // Se o botao ativou a emergencia, roda so a emergencia
  if (modoEmergencia) {
    executarEmergencia();
  } 
  // Senao, roda o ciclo normal do semaforo
  else {
    executarCicloNormal();
  }
}

// ============================================================================
// COMPORTAMENTO NO MODO DE EMERGENCIA
// ============================================================================
void executarEmergencia() {
  // Garante que luzes vermelhas e verdes fiquem totalmente apagadas
  digitalWrite(LED_VERMELHO_LADOA, LOW);
  digitalWrite(LED_VERDE_LADOA, LOW);
  digitalWrite(LED_VERMELHO_LADOB, LOW);
  digitalWrite(LED_VERDE_LADOB, LOW);

  unsigned long agora = millis();
  
  // A cada 500ms (0.5s), inverte o estado dos LEDs amarelos (pisca-alerta)
  if (agora - tempoPisca >= TEMPO_PISCA_EMERG) {
    tempoPisca = agora;
    estadoPisca = !estadoPisca; // Se estava LOW vira HIGH, se estava HIGH vira LOW

    digitalWrite(LED_AMARELO_LADOA, estadoPisca);
    digitalWrite(LED_AMARELO_LADOB, estadoPisca);
  }
}

// ============================================================================
// CICLO NORMAL (MAQUINA DE ESTADOS SEM DELAY)
// ============================================================================
void executarCicloNormal() {
  unsigned long agora = millis(); // Checa o relogio do Arduino agora

  switch (estadoSemaforo) {
    
    case 0: // PAGINA 0: Lado A Verde / Lado B Vermelho
      digitalWrite(LED_VERDE_LADOA, HIGH);
      digitalWrite(LED_AMARELO_LADOA, LOW);
      digitalWrite(LED_VERMELHO_LADOA, LOW);

      digitalWrite(LED_VERDE_LADOB, LOW);
      digitalWrite(LED_AMARELO_LADOB, LOW);
      digitalWrite(LED_VERMELHO_LADOB, HIGH);

      // Espera dar 5 segundos olhando o relogio
      if (agora - tempoAnterior >= TEMPO_VERDE_VERMELHO) {
        tempoAnterior = agora; // Reinicia a contagem
        estadoSemaforo = 1;    // Vai para a proxima pagina (Estado 1)
      }
      break;

    case 1: // PAGINA 1: Lado A Amarelo / Lado B Vermelho
      digitalWrite(LED_VERDE_LADOA, LOW);
      digitalWrite(LED_AMARELO_LADOA, HIGH);
      digitalWrite(LED_VERMELHO_LADOA, LOW);

      digitalWrite(LED_VERDE_LADOB, LOW);
      digitalWrite(LED_AMARELO_LADOB, LOW);
      digitalWrite(LED_VERMELHO_LADOB, HIGH);

      // Espera dar 1 segundo
      if (agora - tempoAnterior >= TEMPO_AMARELO) {
        tempoAnterior = agora;
        estadoSemaforo = 2;    // Vai para a proxima pagina (Estado 2)
      }
      break;

    case 2: // PAGINA 2: Lado A Vermelho / Lado B Verde
      digitalWrite(LED_VERDE_LADOA, LOW);
      digitalWrite(LED_AMARELO_LADOA, LOW);
      digitalWrite(LED_VERMELHO_LADOA, HIGH);

      digitalWrite(LED_VERDE_LADOB, HIGH);
      digitalWrite(LED_AMARELO_LADOB, LOW);
      digitalWrite(LED_VERMELHO_LADOB, LOW);

      // Espera dar 5 segundos
      if (agora - tempoAnterior >= TEMPO_VERDE_VERMELHO) {
        tempoAnterior = agora;
        estadoSemaforo = 3;    // Vai para a proxima pagina (Estado 3)
      }
      break;

    case 3: // PAGINA 3: Lado A Vermelho / Lado B Amarelo
      digitalWrite(LED_VERDE_LADOA, LOW);
      digitalWrite(LED_AMARELO_LADOA, LOW);
      digitalWrite(LED_VERMELHO_LADOA, HIGH);

      digitalWrite(LED_VERDE_LADOB, LOW);
      digitalWrite(LED_AMARELO_LADOB, HIGH);
      digitalWrite(LED_VERMELHO_LADOB, LOW);

      // Espera dar 1 segundo
      if (agora - tempoAnterior >= TEMPO_AMARELO) {
        tempoAnterior = agora;
        estadoSemaforo = 0;    // Volta para o comeco de tudo (Estado 0)
      }
      break;
  }
}