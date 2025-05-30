import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header({ onNavigate, logoSrc }) {
    const { isLoggedIn, isAdmin, username, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

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

                {/* Бургер-меню для мобильных */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Меню для десктопа */}
                <div className="hidden md:flex flex-grow mx-4">
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

                <div className="flex items-center space-x-4">
                    {isLoggedIn ? (
                        <>
                            <span className="text-gray-300">{username}</span>
                            <button
                                className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                                onClick={logout}
                            >
                                Выход
                            </button>
                        </>
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
            {/* Мобильное меню */}
            {menuOpen && (
                <div className="md:hidden bg-gray-800 px-4 pt-2 pb-4">
                    <ul className="flex flex-col space-y-2">
                        <li>
                            <a href="#" onClick={() => { onNavigate('books'); setMenuOpen(false); }} className="text-white hover:text-gray-300 no-underline block">
                                Список книг
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={() => { onNavigate('exchanges'); setMenuOpen(false); }} className="text-white hover:text-gray-300 no-underline block">
                                Обмены
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={() => { onNavigate('collections'); setMenuOpen(false); }} className="text-white hover:text-gray-300 no-underline block">
                                Коллекции
                            </a>
                        </li>
                        {isAdmin && (
                            <li>
                                <a href="#" onClick={() => { onNavigate('admin'); setMenuOpen(false); }} className="text-white hover:text-gray-300 no-underline block">
                                    Админская панель
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default Header;
