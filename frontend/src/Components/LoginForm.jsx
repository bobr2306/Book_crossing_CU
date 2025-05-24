import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5001';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка входа');
        return;
      }

      login(data.access_token, data.user_id, data.role);
      navigate('/');
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5 w-full">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="mb-6 text-gray-800 text-2xl font-semibold">Вход</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-sm text-gray-600 font-medium">Имя пользователя</label>
              <input
                  type="text"
                  placeholder="Имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <label className="text-sm text-gray-600 font-medium">Пароль</label>
              <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full p-3 rounded-lg bg-indigo-500 text-white text-base font-semibold hover:bg-indigo-600 transition-colors disabled:bg-indigo-300"
            >
              {isLoading ? 'Загрузка...' : 'Войти'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-6 text-sm text-gray-600">
              <span className="mr-2">Нет аккаунта?</span>
              <Link to="/register" className="text-indigo-500 font-medium hover:text-indigo-600 transition-colors">
                Регистрация
              </Link>
            </div>
          </form>
        </div>
      </div>
  );
}