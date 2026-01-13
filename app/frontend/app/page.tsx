'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  flights: any[];
}

interface Flight {
  id: string;
  departurePoint: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  company: string;
  impeded?: boolean;
  redirected?: boolean;
  redirectionReason?: string;
}

interface Notification {
  id: string;
  recipient: string;
  message: string;
  timestamp: string;
  type: 'delay' | 'impediment' | 'redirection' | 'general';
}

export default function Dashboard() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [impededFlights, setImpededFlights] = useState<Flight[]>([]);
  const [redirectedFlights, setRedirectedFlights] = useState<Flight[]>([]);
  const [activeFlights, setActiveFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);

  // Airport form state
  const [airportForm, setAirportForm] = useState({
    code: '',
    name: '',
    city: '',
    country: '',
    latitude: '',
    longitude: ''
  });

  // Flight form state
  const [flightForm, setFlightForm] = useState({
    id: '',
    departurePoint: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    company: ''
  });

  // Weather form state
  const [weatherForm, setWeatherForm] = useState({
    airportCode: '',
    impactType: 'storm',
    severity: 'medium',
    durationMinutes: '60',
    isCatastrophe: false
  });

  // Load airports on component mount
  useEffect(() => {
    loadAirports();
    loadFlights();
    loadNotifications();
    loadSpecialFlights();

    // Socket.io integration
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('notification', (data) => {
      console.log('Real-time notification received:', data);
      // Immediate refresh of relevant data
      loadNotifications();
      loadFlights();
      loadSpecialFlights();
    });

    // Keep polling as a fallback, but at a lower frequency (60s)
    const interval = setInterval(() => {
      loadFlights();
      loadNotifications();
      loadSpecialFlights();
    }, 60000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const loadAirports = async () => {
    try {
      const response = await fetch('http://localhost:3000/airports', {
        method: 'GET',
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAirports(data.airports || []);
    } catch (error) {
      console.error('Error loading airports:', error);
      // Retry after 2 seconds if backend is not ready
      setTimeout(() => loadAirports(), 2000);
    }
  };

  const loadFlights = async () => {
    try {
      const response = await fetch('http://localhost:3000/flights', {
        method: 'GET',
        mode: 'cors',
      });
      if (response.ok) {
        const data = await response.json();
        setFlights(data.flights || []);
      }
    } catch (error) {
      console.error('Error loading flights:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/notifications', {
        method: 'GET',
        mode: 'cors',
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadSpecialFlights = async () => {
    try {
      const [impededRes, redirectedRes, activeRes] = await Promise.all([
        fetch('http://localhost:3000/flights/impeded', { method: 'GET', mode: 'cors' }),
        fetch('http://localhost:3000/flights/redirected', { method: 'GET', mode: 'cors' }),
        fetch('http://localhost:3000/flights/active', { method: 'GET', mode: 'cors' }),
      ]);

      if (impededRes.ok) {
        const impededData = await impededRes.json();
        setImpededFlights(impededData.flights || []);
      }

      if (redirectedRes.ok) {
        const redirectedData = await redirectedRes.json();
        setRedirectedFlights(redirectedData.flights || []);
      }

      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveFlights(activeData.flights || []);
      }
    } catch (error) {
      console.error('Error loading special flights:', error);
    }
  };

  const formatRecipient = (recipient: string): string => {
    switch (recipient) {
      case 'company':
        return 'Companhia Aérea';
      case 'cco':
        return 'Centro de Controle Operacional';
      case 'operator':
        return 'Operador';
      case 'authority':
        return 'Autoridade';
      case 'passengers':
        return 'Passageiros';
      default:
        return recipient;
    }
  };

  const createAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/airports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          ...airportForm,
          latitude: airportForm.latitude ? parseFloat(airportForm.latitude) : undefined,
          longitude: airportForm.longitude ? parseFloat(airportForm.longitude) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAirportForm({ code: '', name: '', city: '', country: '', latitude: '', longitude: '' });
      loadAirports();
      alert('Aeroporto criado com sucesso!');
    } catch (error) {
      console.error('Error creating airport:', error);
      alert('Erro ao criar aeroporto. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const createFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(flightForm),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFlightForm({ id: '', departurePoint: '', destination: '', departureTime: '', arrivalTime: '', company: '' });
      alert('Voo criado com sucesso!');
    } catch (error) {
      console.error('Error creating flight:', error);
      alert('Erro ao criar voo. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const simulateWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/simulate-weather-impact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(weatherForm),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert('Condição climática simulada com sucesso!');
    } catch (error) {
      console.error('Error simulating weather:', error);
      alert('Erro ao simular condição climática. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Sistema de Logística Aeroportuária</h1>
          <p className="text-blue-100 mt-2">Dashboard de Controle</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Airports Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                ✈️
              </span>
              Aeroportos
            </h2>

            <form onSubmit={createAirport} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={airportForm.code}
                  onChange={(e) => setAirportForm({ ...airportForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="JFK"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={airportForm.name}
                  onChange={(e) => setAirportForm({ ...airportForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="John F. Kennedy International"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={airportForm.city}
                    onChange={(e) => setAirportForm({ ...airportForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="New York"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    value={airportForm.country}
                    onChange={(e) => setAirportForm({ ...airportForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="USA"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Aeroporto'}
              </button>
            </form>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Aeroportos Criados ({airports.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {airports.map((airport) => (
                  <div key={airport.code} className="text-sm bg-gray-50 p-2 rounded">
                    <div className="font-medium text-gray-900">{airport.code} - {airport.name}</div>
                    <div className="text-gray-600">{airport.city}, {airport.country}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flights Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                🛩️
              </span>
              Voos
            </h2>

            <form onSubmit={createFlight} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Voo</label>
                <input
                  type="text"
                  value={flightForm.id}
                  onChange={(e) => setFlightForm({ ...flightForm, id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="FL123"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                  <select
                    value={flightForm.departurePoint}
                    onChange={(e) => setFlightForm({ ...flightForm, departurePoint: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Selecione...</option>
                    {airports.map((airport) => (
                      <option key={airport.code} value={airport.code}>{airport.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                  <select
                    value={flightForm.destination}
                    onChange={(e) => setFlightForm({ ...flightForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Selecione...</option>
                    {airports.map((airport) => (
                      <option key={airport.code} value={airport.code}>{airport.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partida</label>
                  <input
                    type="datetime-local"
                    value={flightForm.departureTime}
                    onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chegada</label>
                  <input
                    type="datetime-local"
                    value={flightForm.arrivalTime}
                    onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Companhia</label>
                <input
                  type="text"
                  value={flightForm.company}
                  onChange={(e) => setFlightForm({ ...flightForm, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Airlines Inc"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Voo'}
              </button>
            </form>
          </div>

          {/* Weather Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                ⛈️
              </span>
              Condições Climáticas
            </h2>

            <form onSubmit={simulateWeather} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aeroporto</label>
                <select
                  value={weatherForm.airportCode}
                  onChange={(e) => setWeatherForm({ ...weatherForm, airportCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">Selecione aeroporto...</option>
                  {airports.map((airport) => (
                    <option key={airport.code} value={airport.code}>{airport.code} - {airport.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Impacto</label>
                <select
                  value={weatherForm.impactType}
                  onChange={(e) => setWeatherForm({ ...weatherForm, impactType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="storm">Tempestade</option>
                  <option value="fog">Neblina</option>
                  <option value="snow">Neve</option>
                  <option value="rain">Chuva Forte</option>
                  <option value="wind">Vento Forte</option>
                  <option value="earthquake">Terremoto</option>
                  <option value="flood">Inundação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severidade</label>
                <select
                  value={weatherForm.severity}
                  onChange={(e) => setWeatherForm({ ...weatherForm, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="catastrophic">Catastrófica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
                <input
                  type="number"
                  value={weatherForm.durationMinutes}
                  onChange={(e) => setWeatherForm({ ...weatherForm, durationMinutes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCatastrophe"
                  checked={weatherForm.isCatastrophe}
                  onChange={(e) => setWeatherForm({ ...weatherForm, isCatastrophe: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isCatastrophe" className="ml-2 text-sm text-gray-700">
                  É uma catástrofe (pode redirecionar voos)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Simulando...' : 'Simular Condição Climática'}
              </button>
            </form>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">💡 Dicas:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Severidades baixas/médias causam delays</li>
                  <li>• Severidade alta pode impedir voos</li>
                  <li>• Catástrofes redirecionam voos em andamento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              📢
            </span>
            Notificações do Sistema ({notifications.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📭</div>
                <p>Nenhuma notificação ainda</p>
                <p className="text-sm">As notificações aparecerão aqui quando houver eventos no sistema</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${notification.type === 'delay'
                    ? 'border-l-yellow-500 bg-yellow-50'
                    : notification.type === 'impediment'
                      ? 'border-l-red-500 bg-red-50'
                      : notification.type === 'redirection'
                        ? 'border-l-purple-500 bg-purple-50'
                        : 'border-l-blue-500 bg-blue-50'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${notification.type === 'delay'
                          ? 'bg-yellow-200 text-yellow-800'
                          : notification.type === 'impediment'
                            ? 'bg-red-200 text-red-800'
                            : notification.type === 'redirection'
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}>
                          {notification.type === 'delay' && '⏰ DELAY'}
                          {notification.type === 'impediment' && '🚫 IMPEDIMENTO'}
                          {notification.type === 'redirection' && '🔄 REDIRECIONAMENTO'}
                          {notification.type === 'general' && 'ℹ️ INFO'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Para: {formatRecipient(notification.recipient)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flight Status Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Flights */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                ✈️
              </span>
              Voos Ativos ({activeFlights.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activeFlights.length === 0 ? (
                <p className="text-sm text-green-600">Nenhum voo ativo no momento</p>
              ) : (
                activeFlights.map((flight) => (
                  <div key={flight.id} className="bg-white p-2 rounded border border-green-200">
                    <div className="font-medium text-sm text-gray-900">{flight.id}</div>
                    <div className="text-xs text-gray-600">
                      {flight.departurePoint} → {flight.destination}
                    </div>
                    <div className="text-xs text-green-600">{flight.company}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Impeded Flights */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                🚫
              </span>
              Voos Impedidos ({impededFlights.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {impededFlights.length === 0 ? (
                <p className="text-sm text-red-600">Nenhum voo impedido</p>
              ) : (
                impededFlights.map((flight) => (
                  <div key={flight.id} className="bg-white p-2 rounded border border-red-200">
                    <div className="font-medium text-sm text-gray-900">{flight.id}</div>
                    <div className="text-xs text-gray-600">
                      {flight.departurePoint} → {flight.destination}
                    </div>
                    <div className="text-xs text-red-600">Impedido por condições climáticas</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Redirected Flights */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                🔄
              </span>
              Voos Redirecionados ({redirectedFlights.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {redirectedFlights.length === 0 ? (
                <p className="text-sm text-purple-600">Nenhum voo redirecionado</p>
              ) : (
                redirectedFlights.map((flight) => (
                  <div key={flight.id} className="bg-white p-2 rounded border border-purple-200">
                    <div className="font-medium text-sm text-gray-900">{flight.id}</div>
                    <div className="text-xs text-gray-600">
                      Redirecionado: {flight.redirectionReason}
                    </div>
                    <div className="text-xs text-purple-600">
                      Novo destino: {flight.destination}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 Status do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{airports.length}</div>
              <div className="text-sm text-gray-600">Aeroportos</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{flights.length}</div>
              <div className="text-sm text-gray-600">Total de Voos</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{activeFlights.length}</div>
              <div className="text-sm text-gray-600">Voos Ativos</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{impededFlights.length + redirectedFlights.length}</div>
              <div className="text-sm text-gray-600">Voos Afetados</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">🔄</div>
              <div className="text-sm text-gray-600">Polling (30s)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
