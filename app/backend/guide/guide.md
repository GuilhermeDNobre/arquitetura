# Guia de Uso - Sistema de Logística Aeroportuária

## Visão Geral

Este é um backend NestJS que implementa um sistema de logística aeroportuária em tempo real usando arquitetura Event-Driven. O sistema monitora condições climáticas e coordena operações de voos de forma desacoplada através de um Event Bus.

## Arquitetura

- **Event-Driven**: Comunicação exclusivamente via eventos
- **Hexagonal Architecture**: Separação clara entre domínio, infraestrutura e apresentação
- **Microservices-Ready**: Preparado para migração para Kafka/NATS
- **Coreografia**: Não usa orquestradores centralizados

## Endpoints Disponíveis

### 1. Criar Aeroporto
**POST** `/airports`

Cria um novo aeroporto no sistema.

#### Request Body
```json
{
  "code": "JFK",
  "name": "John F. Kennedy International Airport",
  "city": "New York",
  "country": "USA",
  "latitude": 40.6413,
  "longitude": -73.7781
}
```

#### Response
```json
{
  "message": "Airport created successfully",
  "airport": {
    "code": "JFK",
    "name": "John F. Kennedy International Airport",
    "city": "New York",
    "country": "USA",
    "latitude": 40.6413,
    "longitude": -73.7781,
    "flights": []
  }
}
```

#### Campos Obrigatórios
- `code`: Código IATA do aeroporto (3 letras)
- `name`: Nome completo do aeroporto
- `city`: Cidade onde está localizado
- `country`: País onde está localizado

#### Campos Opcionais
- `latitude`: Coordenada geográfica (latitude)
- `longitude`: Coordenada geográfica (longitude)

### 2. Listar Aeroportos
**GET** `/airports`

Retorna lista de todos os aeroportos cadastrados.

#### Response
```json
{
  "airports": [
    {
      "code": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "country": "USA",
      "latitude": 40.6413,
      "longitude": -73.7781,
      "flights": [...]
    }
  ]
}
```

### 3. Obter Aeroporto Específico
**GET** `/airports/:code`

Retorna detalhes de um aeroporto específico.

#### Parameters
- `code`: Código IATA do aeroporto

#### Response
```json
{
  "airport": {
    "code": "JFK",
    "name": "John F. Kennedy International Airport",
    "city": "New York",
    "country": "USA",
    "latitude": 40.6413,
    "longitude": -73.7781,
    "flights": [...]
  }
}
```

### 4. Listar Voos de um Aeroporto
**GET** `/airports/:code/flights`

Retorna todos os voos associados a um aeroporto (origem ou destino).

#### Parameters
- `code`: Código IATA do aeroporto

#### Response
```json
{
  "airport": "JFK",
  "flights": [
    {
      "id": "FL123",
      "departurePoint": "JFK",
      "destination": "LAX",
      "departureTime": "2026-01-12T10:00:00.000Z",
      "arrivalTime": "2026-01-12T13:00:00.000Z",
      "company": "Airlines Inc"
    }
  ]
}
```

### 5. Criar Voo
**POST** `/flights`

Cria um novo voo no sistema.

#### Request Body
```json
{
  "id": "FL123",
  "departurePoint": "JFK",
  "destination": "LAX",
  "departureTime": "2026-01-12T10:00:00Z",
  "arrivalTime": "2026-01-12T13:00:00Z",
  "company": "Airlines Inc"
}
```

#### Response
```json
{
  "message": "Flight created successfully"
}
```

#### Campos Obrigatórios
- `id`: Identificador único do voo
- `departurePoint`: Código do aeroporto de origem
- `destination`: Código do aeroporto de destino
- `departureTime`: Data/hora de partida (ISO 8601)
- `arrivalTime`: Data/hora de chegada (ISO 8601)
- `company`: Nome da companhia aérea

### 2. Simular Impacto Climático
**POST** `/simulate-weather-impact`

Simula um evento de impacto climático ou catástrofe em um aeroporto.

#### Request Body (Impacto Normal)
```json
{
  "airportCode": "JFK",
  "impactType": "storm",
  "severity": "high",
  "durationMinutes": 60,
  "isCatastrophe": false
}
```

#### Request Body (Catástrofe)
```json
{
  "airportCode": "LAX",
  "impactType": "earthquake",
  "severity": "catastrophic",
  "durationMinutes": 120,
  "isCatastrophe": true
}
```

#### Response
```json
{
  "message": "Weather impact simulated"
}
```

#### Campos Obrigatórios
- `airportCode`: Código do aeroporto afetado
- `impactType`: Tipo de impacto (ex: "storm", "fog", "earthquake", "flood")
- `severity`: Severidade ("low", "medium", "high", "catastrophic")
- `durationMinutes`: Duração do impacto em minutos

#### Campos Opcionais
- `isCatastrophe`: Booleano indicando se é uma catástrofe (padrão: false, ou true se severity="catastrophic")

## Eventos do Sistema

### WeatherImpactDetected
**Disparado por:** Simulação manual via endpoint
**Conteúdo:**
```typescript
{
  airportCode: string,
  impactType: string,
  severity: 'low' | 'medium' | 'high',
  durationMinutes: number,
  timestamp: Date
}
```

### AirportCreated
**Disparado por:** Criação de aeroporto
**Conteúdo:**
```typescript
{
  code: string,
  name: string,
  city: string,
  country: string,
  latitude?: number,
  longitude?: number,
  timestamp: Date
}
```

### FlightCreated
**Disparado por:** Criação de voo
**Conteúdo:**
```typescript
{
  id: string,
  departurePoint: string,
  destination: string,
  departureTime: Date,
  arrivalTime: Date,
  company: string,
  timestamp: Date
}
```

### OperationalDelayDetected
**Disparado por:** Impacto climático detectado
**Conteúdo:**
```typescript
{
  flightId: string,
  delayMinutes: number,
  reason: string,
  timestamp: Date
}
```

### FlightImpeded
**Disparado por:** Voo impedido devido a sobreposição temporal com impacto climático
**Conteúdo:**
```typescript
{
  flightId: string,
  reason: string,
  newDepartureTime: Date,
  timestamp: Date
}
```

### FlightRedirected
**Disparado por:** Voo redirecionado devido a catástrofe durante voo
**Conteúdo:**
```typescript
{
  flightId: string,
  originalDestination: string,
  newDestination: string,
  reason: string,
  timestamp: Date
}
```

### NotificationSent
**Disparado por:** Sistema de notificações
**Conteúdo:**
```typescript
{
  recipient: string, // 'company', 'cco', 'operator', 'authority'
  message: string,
  timestamp: Date
}
```

## Fluxos de Eventos

### Fluxo Principal: Delay Operacional
```
WeatherImpactDetected → OperationalDelayDetected → NotificationSent
```

**Exemplo:**
1. Impacto climático "storm" severidade "high" em JFK
2. Sistema detecta delay de 60 minutos
3. Notificações enviadas para companhia, CCO e operador

### Fluxo de Impedimento de Voo
```
WeatherImpactDetected → FlightImpeded → NotificationSent
```

**Condições:**
- Impacto climático em aeroporto de origem ou destino do voo
- Sobreposição temporal entre período do voo e período do impacto
- Novo horário gerado automaticamente (atraso de 2 horas)

**Exemplo:**
1. Voo FL123: JFK → LAX (10:00 - 13:00)
2. Impacto climático em JFK das 09:00 às 11:00
3. Sistema detecta impedimento e gera novo horário: 12:00
4. Notificações enviadas para todos os stakeholders

### Fluxo de Redirecionamento de Emergência
```
WeatherImpactDetected (Catástrofe) → FlightRedirected → NotificationSent
```

**Condições:**
- Impacto classificado como catástrofe (isCatastrophe: true)
- Voo em andamento (já decolou, ainda não pousou)
- Aeroporto de destino afetado pela catástrofe
- Existe aeroporto alternativo disponível

**Exemplo:**
1. Voo FL456 em voo rumo a LAX
2. Terremoto catastrófico detectado em LAX
3. Sistema identifica voo em andamento afetado
4. Redirecionamento automático para aeroporto alternativo (ex: BUR)
5. Notificações de emergência enviadas para companhia, CCO, operador, autoridade e passageiros

## Como Usar

### 1. Iniciar o Servidor
```bash
cd app/backend
npm install
npm run start:dev
```

### 2. Criar Aeroportos
```bash
# Criar aeroporto JFK
curl -X POST http://localhost:3000/airports \
  -H "Content-Type: application/json" \
  -d '{
    "code": "JFK",
    "name": "John F. Kennedy International Airport",
    "city": "New York",
    "country": "USA",
    "latitude": 40.6413,
    "longitude": -73.7781
  }'

# Criar aeroporto LAX
curl -X POST http://localhost:3000/airports \
  -H "Content-Type: application/json" \
  -d '{
    "code": "LAX",
    "name": "Los Angeles International Airport",
    "city": "Los Angeles",
    "country": "USA",
    "latitude": 33.9425,
    "longitude": -118.4081
  }'
```

### 3. Listar Aeroportos
```bash
curl http://localhost:3000/airports
```

### 4. Criar um Voo
```bash
curl -X POST http://localhost:3000/flights \
  -H "Content-Type: application/json" \
  -d '{
    "id": "FL123",
    "departurePoint": "JFK",
    "destination": "LAX",
    "departureTime": "2026-01-12T10:00:00Z",
    "arrivalTime": "2026-01-12T13:00:00Z",
    "company": "Airlines Inc"
  }'
```

### 3. Simular Impacto Climático
```bash
curl -X POST http://localhost:3000/simulate-weather-impact \
  -H "Content-Type: application/json" \
  -d '{
    "airportCode": "JFK",
    "impactType": "storm",
    "severity": "high",
    "durationMinutes": 60
  }'
```

### 4. Observar Logs
No console do servidor, você verá:
```
Publishing event: WeatherImpactDetected { airportCode: 'JFK', ... }
Flight Service received: WeatherImpactDetected { ... }
Publishing event: OperationalDelayDetected { flightId: 'FLIGHT-JFK-...', ... }
Notification Orchestrator received: OperationalDelayDetected { ... }
Notification sent to company: Flight FLIGHT-JFK-... delayed by 60 minutes due to Weather impact: storm
...
```

## Scripts de Teste

### test-airport-creation.js
Cria aeroportos de exemplo (JFK, LAX, GRU).

### test-flight-creation.js
Cria um voo de exemplo (FL123: JFK → LAX).

### test-simulation.js
Simula impacto climático normal em JFK.

### test-catastrophe.js
Simula catástrofe (terremoto) em LAX - testa redirecionamento de voos em andamento.

Para executar:
```bash
node test-airport-creation.js
node test-flight-creation.js
node test-simulation.js
node test-catastrophe.js
```

## Regras de Negócio

### Delays Operacionais
- **High severity**: 60 minutos de delay
- **Medium severity**: 30 minutos de delay
- **Low severity**: Sem delay

### Impedimento de Voos
- Verifica sobreposição temporal entre voo e impacto
- Aplica atraso automático de 2 horas
- Notifica autoridade adicionalmente

### Notificações
- **Delays**: Companhia, CCO, Operador
- **Impedimentos**: Companhia, CCO, Operador, Autoridade

## Arquitetura dos Módulos

```
src/
├── airport/            # Gestão de aeroportos
├── event-bus/          # Event Bus in-memory
├── events/             # Definições de eventos
├── flight/             # Serviço de voos
├── notification/       # Orquestrador de notificações
└── weather/            # Reservado para expansão
```

## Expansões Futuras

- Integração com APIs meteorológicas reais
- Persistência em banco de dados
- Migração para Kafka/NATS
- Interface web para monitoramento
- Alertas em tempo real via WebSocket

## Troubleshooting

### Erro de Compilação
```bash
npm run build
```
Verifique erros de TypeScript e corrija sintaxe.

### Servidor Não Inicia
- Verifique se porta 3000 está livre
- Confirme que dependências estão instaladas: `npm install`

### Eventos Não São Processados
- Verifique se módulos estão importados no `AppModule`
- Confirme que handlers estão registrados com `OnModuleInit`

## Contribuição

Para expandir o sistema:
1. Adicione novos eventos em `src/events/events.ts`
2. Crie handlers em módulos apropriados
3. Registre handlers no módulo correspondente
4. Atualize este guia