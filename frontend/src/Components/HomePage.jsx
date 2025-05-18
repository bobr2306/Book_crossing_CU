import React, { useState, useEffect } from 'react';
import Header from './Header'; // Импортируем компонент шапки
import Footer from './Footer';
import Exchanges from './Exchanges';
// Убедитесь, что SVG файл logo.svg находится в папке src/assets
import BookLogo from '../assets/book.svg'; // Импортируем SVG логотип

// Для простоты разработки используем CDN.
// В продакшене лучше устанавливать библиотеки через npm/yarn.
// Bootstrap CSS: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
// Bootstrap JS: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js
// Tailwind CSS: https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css

function HomePage() {
    // Состояния для хранения списка книг, состояния загрузки и ошибки
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для фильтров (обновлены в соответствии с роутом)
    const [categoryFilter, setCategoryFilter] = useState(''); // Используем category вместо genre
    const [authorFilter, setAuthorFilter] = useState('');   // Используем author вместо searchQuery для автора

    // Состояния для симуляции авторизации и роли администратора
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Для демонстрации админской панели

    // Состояние для текущей вкладки (для навигации в шапке)
    const [currentTab, setCurrentTab] = useState('books'); // По умолчанию 'Список книг'

    // Добавляем состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const booksPerPage = 12;

    // URL вашего бэкенд API для получения списка книг
    // Замените на актуальный URL вашего Flask-приложения
    // Учитываем параметры category, author, user_id
    const API_URL = 'http://localhost:5000/books'; // Пример URL роута /books

    // Функция для загрузки книг с бэкенда
    const fetchBooks = async () => {
        if (currentTab !== 'books') {
            // Загружаем книги только на вкладке "Список книг"
            setBooks([]); // Очищаем список при смене вкладки
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Формируем URL с параметрами фильтрации
            const url = new URL(API_URL);
            if (categoryFilter) {
                url.searchParams.append('category', categoryFilter);
            }
            if (authorFilter) {
                url.searchParams.append('author', authorFilter);
            }
            // Добавляем параметры пагинации
            url.searchParams.append('page', currentPage);
            url.searchParams.append('per_page', booksPerPage);

            const response = await fetch(url);

            // Проверяем статус ответа
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: статус ${response.status}`);
            }

            const data = await response.json();
            // Учитываем структуру данных из вашего роута
            setBooks(data.books);
            setTotalPages(Math.ceil(data.total / booksPerPage));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Загружаем книги при первом рендере компонента и при изменении фильтров или вкладки
    useEffect(() => {
        fetchBooks();
    }, [categoryFilter, authorFilter, currentTab, currentPage]); // Зависимости

    // Обработчики изменений для фильтров
    const handleCategoryChange = (event) => {
        setCategoryFilter(event.target.value);
        setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
    };

    const handleAuthorChange = (event) => {
        setAuthorFilter(event.target.value);
        setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
    };

    // Обработчик для кнопки "Предложить свою книгу" (пока просто выводим в консоль)
    const handleProposeBook = () => {
        console.log('Нажата кнопка "Предложить свою книгу"');
        // Здесь будет логика перехода на страницу добавления книги
    };

    // Обработчик для кнопки Вход/Выход (симуляция)
    const handleLoginLogout = () => {
        setIsLoggedIn(!isLoggedIn);
        // В реальном приложении здесь будет логика аутентификации
        // Для демонстрации переключаем isAdmin при входе/выходе
        if (!isLoggedIn) {
            setIsAdmin(true); // Симулируем вход админа
        } else {
            setIsAdmin(false); // Симулируем выход
        }
    };

    // Обработчик для навигации по вкладкам
    const handleNavigate = (tab) => {
        setCurrentTab(tab);
        // В реальном приложении здесь будет логика маршрутизации (например, с React Router)
    };

    // Функция для отображения пагинации
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 mx-1 rounded ${
                        currentPage === i
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Шапка - размещаем ее здесь, вне основного контейнера */}
            <Header
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                onLoginLogout={handleLoginLogout}
                onNavigate={handleNavigate}
                logoSrc={BookLogo} // Передаем путь к SVG логотипу
            />

            {/* Основное содержимое - теперь оно внутри контейнера */}
            <div className="container mx-auto p-4 flex-grow mt-24">
                <div className="flex flex-col md:flex-row">
                    {/* Левая колонка для фильтров и кнопки добавления книги */}
                    <div className="w-full md:w-1/4 pr-4">
                        <h2 className="text-xl font-semibold mb-4">Фильтры</h2>

                        {/* Фильтр по жанру (категории) */}
                        <div className="mb-4">
                            <label htmlFor="categoryFilter" className="form-label">Жанр (Категория):</label>
                            <select
                                id="categoryFilter"
                                className="form-select"
                                value={categoryFilter}
                                onChange={handleCategoryChange}
                            >
                                <option value="">Все жанры</option>
                                {/* Здесь должны быть опции жанров, полученные с бэкенда или предопределенные */}
                                <option value="fiction">Художественная литература</option>
                                <option value="science">Наука</option>
                                <option value="fantasy">Фэнтези</option>
                                {/* Добавьте другие жанры */}
                            </select>
                        </div>

                        {/* Фильтр по автору */}
                        <div className="mb-4">
                            <label htmlFor="authorFilter" className="form-label">Автор:</label>
                            <input
                                type="text"
                                id="authorFilter"
                                className="form-control"
                                placeholder="Введите автора"
                                value={authorFilter}
                                onChange={handleAuthorChange}
                            />
                        </div>

                        {/* Кнопка "Предложить свою книгу" */}
                        <button
                            className="btn btn-success w-full mb-4"
                            onClick={handleProposeBook}
                        >
                            Предложить свою книгу
                        </button>

                        {/* Подвкладка для просмотра книг других пользователей (логика будет зависеть от userBooksFilter) */}
                        {/* Этот элемент скорее индикативный, фильтр выше уже позволяет это делать */}
                        <div className="text-sm text-gray-600">
                            Используйте фильтр "Книги пользователя" для просмотра книг других пользователей.
                        </div>

                    </div>

                    {/* Правая колонка для списка книг */}
                    <div className="w-full md:w-3/4">
                        {/* Заголовок в зависимости от вкладки */}
                        <h1 className="text-3xl font-bold mb-4">
                            {currentTab === 'books' && 'Доступные книги для обмена'}
                            {currentTab === 'exchanges' && 'Обмены книгами'}
                            {currentTab === 'collections' && 'Коллекции книг'}
                            {currentTab === 'admin' && 'Админская панель'}
                        </h1>

                        {/* Отображение содержимого в зависимости от вкладки */}
                        {currentTab === 'books' && (
                            <>
                                {/* Отображение состояния загрузки или ошибки */}
                                {loading && <div className="text-center text-blue-500">Загрузка книг...</div>}
                                {error && <div className="text-center text-red-500">Ошибка загрузки: {error}</div>}

                                {/* Список книг */}
                                {!loading && !error && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {books.length > 0 ? (
                                                books.map(book => (
                                                    // Учитываем структуру данных из вашего роута
                                                    <div key={book.user_id + book.title} className="card shadow-sm"> {/* Используем комбинацию user_id и title как ключ, так как id нет в ответе */}
                                                        <div className="card-body">
                                                            <h5 className="card-title">{book.title}</h5>
                                                            <h6 className="card-subtitle mb-2 text-muted">{book.author}</h6>
                                                            <p className="card-text"><strong>Категория:</strong> {book.category}</p>
                                                            <p className="card-text"><strong>Год:</strong> {book.year}</p>
                                                            {/* Добавьте другие поля, если они есть в ответе API */}
                                                            {/* <p className="card-text"><strong>Пользователь ID:</strong> {book.user_id}</p> */}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full text-center text-gray-500">Книги не найдены.</div>
                                            )}
                                        </div>

                                        {/* Пагинация */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center mt-8">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                                                    >
                                                        Назад
                                                    </button>
                                                    {renderPagination()}
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                                                    >
                                                        Вперед
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {/* Содержимое для других вкладок */}
                        {currentTab === 'exchanges' && (
                            <Exchanges />
                        )}

                        {currentTab === 'collections' && (
                            <div className="text-center text-gray-500">Содержимое вкладки "Коллекции"</div>
                        )}
                        {currentTab === 'admin' && (
                            <div className="text-center text-gray-500">Содержимое вкладки "Админская панель" (видно только админам)</div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default HomePage;
