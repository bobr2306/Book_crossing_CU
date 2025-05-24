import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


function Header({ isLoggedIn, isAdmin, onLoginLogout, onNavigate, logoSrc }) {

    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md w-full fixed top-0 left-0 right-0 z-50">
            <div className="w-full px-4 mx-auto flex justify-between items-center">
                <div className="text-xl font-bold flex items-center">
                    <a href="#" onClick={() => onNavigate('books')} className="text-white no-underline flex items-center">
                        {logoSrc && (
                            <img 
                                src={logoSrc} 
                                alt="BookShare Logo" 
                                className="h-6 w-6 mr-2 filter brightness-0 invert" 
                            />
                        )}
                        BookShare
                    </a>
                </div>

                <div className="flex-grow mx-4">
                    <ul className="flex space-x-4">
                        <li>
                            <a href="#" onClick={() => onNavigate('books')} className="text-white hover:text-gray-300 no-underline">
                                Список книг
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={() => onNavigate('exchanges')} className="text-white hover:text-gray-300 no-underline">
                                Обмены
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={() => onNavigate('collections')} className="text-white hover:text-gray-300 no-underline">
                                Коллекции
                            </a>
                        </li>
                        {/* Админская панель - отображается только для админов */}
                        {isAdmin && (
                            <li>
                                <a href="#" onClick={() => onNavigate('admin')} className="text-white hover:text-gray-300 no-underline">
                                    Админская панель
                                </a>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Кнопка профиля (Вход/Выход) */}
                <div>
                    {isLoggedIn ? (
                        <button
                            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                            onClick={logout}
                        >
                            Выход
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Войти
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Header;
