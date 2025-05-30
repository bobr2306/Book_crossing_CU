import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Exchanges from './Exchanges';
import BookLogo from '../assets/book.svg';
import { useAuth } from '../context/AuthContext';
import AdminPanel from "./AdminPanel.jsx";

function HomePage() {
    const { token, userId, logout, isLoggedIn: authIsLoggedIn, isAdmin: authIsAdmin } = useAuth();
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [categoryFilter, setCategoryFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');

    const [currentTab, setCurrentTab] = useState('books');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const booksPerPage = 12;

    const [showModal, setShowModal] = useState(false);
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        category: '',
        year: ''
    });

    // Для коллекций
    const [collections, setCollections] = useState([]);
    const [collectionsLoading, setCollectionsLoading] = useState(false);
    const [collectionsError, setCollectionsError] = useState(null);

    const API_URL = 'http://localhost:5001/books';

    const GENRES = [
        { value: '', label: 'Все жанры' },
        { value: 'Классика', label: 'Классика' },
        { value: 'Фантастика', label: 'Фантастика' },
        { value: 'Фэнтези', label: 'Фэнтези' },
        { value: 'Роман', label: 'Роман' },
        { value: 'Детектив', label: 'Детектив' },
        { value: 'Приключения', label: 'Приключения' },
        { value: 'Наука', label: 'Наука' },
        { value: 'Поэзия', label: 'Поэзия' },
        { value: 'История', label: 'История' },
        { value: 'Биография', label: 'Биография' },
        { value: 'Антиутопия', label: 'Антиутопия' },
        { value: 'Служебная', label: 'Служебная' },
    ];

    const fetchBooks = async () => {
        if (!authIsLoggedIn || currentTab !== 'books') {
            setBooks([]);
            setLoading(false);
            setError(!authIsLoggedIn ? 'unauthorized' : null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = new URL(API_URL);
            if (categoryFilter) url.searchParams.append('category', categoryFilter);
            if (authorFilter) url.searchParams.append('author', authorFilter);
            url.searchParams.append('skip', (currentPage - 1) * booksPerPage);
            url.searchParams.append('limit', booksPerPage);
            if (userId) url.searchParams.append('user_id', userId);

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                setError('unauthorized');
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            setBooks(data.books);
            setTotalPages(Math.ceil(data.total / booksPerPage));
        } catch (err) {
            setError(err.message);
            console.error('Ошибка при загрузке книг:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        setCollectionsLoading(true);
        setCollectionsError(null);
        try {
            // Получаем все коллекции
            const url = new URL('http://localhost:5001/collections');
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки коллекций');
            const data = await response.json();
            setCollections(data); // Показываем все коллекции
        } catch (err) {
            setCollectionsError(err.message);
        } finally {
            setCollectionsLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
        if (currentTab === 'collections' && authIsLoggedIn) {
            fetchCollections();
        }
    }, [categoryFilter, authorFilter, currentTab, currentPage, authIsLoggedIn, token, userId]);

    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleAuthorChange = (e) => {
        setAuthorFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleProposeBook = () => {
        setShowModal(true);
    };

    const handleLoginLogout = () => {
        if (authIsLoggedIn) {
            logout();
        } else {
            navigate('/login');
        }
    };

    const handleNavigate = (tab) => {
        setCurrentTab(tab);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setNewBook({ title: '', author: '', category: '', year: '' });
    };

    const handleAddBook = async () => {
        // Валидация полей
        if (!newBook.title.trim() || !newBook.author.trim() || !newBook.category.trim() || !newBook.year.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        // Проверка года
        const yearNum = parseInt(newBook.year);
        if (isNaN(yearNum)) {
            alert('Год должен быть числом');
            return;
        }

        try {
            const bookToSend = {
                title: newBook.title.trim(),
                author: newBook.author.trim(),
                category: newBook.category.trim(),
                year: yearNum,
                user_id: userId // Используем userId из контекста аутентификации
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при добавлении книги');
            }

            handleModalClose();
            fetchBooks(); // Обновляем список книг
            alert('Книга успешно добавлена!');
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
            console.error('Ошибка при добавлении книги:', err);
        }
    };
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
        <div className="min-h-screen flex flex-col">
            <Header
                onNavigate={handleNavigate}
                logoSrc={BookLogo}
            />

            <main className="flex-grow container mx-auto px-4 pt-24 pb-20">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Фильтры</h2>

                        <div className="mb-4">
                            <label htmlFor="categoryFilter" className="block mb-2 text-sm font-medium text-gray-700">Жанр (Категория):</label>
                            <select
                                id="categoryFilter"
                                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
                                value={categoryFilter}
                                onChange={handleCategoryChange}
                            >
                                {GENRES.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="authorFilter" className="block mb-2 text-sm font-medium text-gray-700">Автор:</label>
                            <input
                                type="text"
                                id="authorFilter"
                                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
                                placeholder="Введите автора"
                                value={authorFilter}
                                onChange={handleAuthorChange}
                            />
                        </div>

                        <button
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md mb-4"
                            onClick={handleProposeBook}
                        >
                            Предложить свою книгу
                        </button>

                        <div className="text-sm text-gray-600">
                            Используйте фильтр "Книги пользователя" для просмотра книг других пользователей.
                        </div>
                    </div>

                    <div className="w-full md:w-3/4">
                        <h1 className="text-3xl font-bold mb-4">
                            {currentTab === 'books' && 'Доступные книги для обмена'}
                            {currentTab === 'exchanges' && 'Обмены книгами'}
                            {currentTab === 'collections' && 'Коллекции книг'}
                            {currentTab === 'admin' && 'Админская панель'}
                        </h1>

                        {currentTab === 'books' && (
                            <>
                                {loading && <div className="text-center text-blue-500">Загрузка книг...</div>}

                                {error === 'unauthorized' && (
                                    <div className="text-center text-red-500">Пожалуйста, войдите в аккаунт, чтобы просматривать книги.</div>
                                )}

                                {error && error !== 'unauthorized' && (
                                    <div className="text-center text-red-500">Ошибка загрузки: {error}</div>
                                )}

                                {!loading && !error && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {books.length > 0 ? (
                                                books.map(book => (
                                                    <div key={book.id} className="border rounded-lg shadow-sm p-4">
                                                        <div className="space-y-2">
                                                            <h5 className="text-lg font-semibold">{book.title}</h5>
                                                            <h6 className="text-sm text-gray-500">{book.author}</h6>
                                                            <p className="text-sm"><strong>Категория:</strong> {book.category}</p>
                                                            <p className="text-sm"><strong>Год:</strong> {book.year}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full text-center text-gray-500">Книги не найдены.</div>
                                            )}
                                        </div>

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

                        {currentTab === 'exchanges' && <Exchanges />}
                        {currentTab === 'collections' && (
                            <>
                                {collectionsLoading && <div className="text-center text-blue-500">Загрузка коллекций...</div>}
                                {collectionsError && <div className="text-center text-red-500">{collectionsError}</div>}
                                {!collectionsLoading && !collectionsError && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {collections.length > 0 ? collections.map(col => (
                                            <div key={col.id} className="border rounded-lg shadow-sm p-4">
                                                <h5 className="text-lg font-semibold mb-2">{col.title}</h5>
                                                <p className="text-sm text-gray-600 mb-1">ID: {col.id}</p>
                                                <p className="text-sm text-gray-600 mb-1">Книг в коллекции: {col.book_count}</p>
                                            </div>
                                        )) : (
                                            <div className="col-span-full text-center text-gray-500">Коллекции не найдены.</div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {currentTab === 'admin' && authIsAdmin && (
                            <AdminPanel />
                        )}
                        {currentTab === 'admin' && !authIsAdmin && (
                            <div className="text-center text-red-500">Доступ запрещён</div>
                        )}
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-xl font-bold mb-4">Добавить книгу</h2>

                        <input
                            type="text"
                            placeholder="Название*"
                            className="w-full mb-2 p-2 border bg-white text-gray-800"
                            value={newBook.title}
                            onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Автор*"
                            className="w-full mb-2 p-2 border bg-white text-gray-800"
                            value={newBook.author}
                            onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                            required
                        />
                        <select
                            className="w-full mb-2 p-2 border bg-white text-gray-800"
                            value={newBook.category}
                            onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                            required
                        >
                            <option value="">Выберите жанр*</option>
                            {GENRES.filter(g => g.value).map(g => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Год*"
                            className="w-full mb-4 p-2 border bg-white text-gray-800"
                            value={newBook.year}
                            onChange={e => setNewBook({ ...newBook, year: e.target.value })}
                            min="1900"
                            max={new Date().getFullYear()}
                            required
                        />

                        <div className="flex justify-end space-x-2">
                            <button onClick={handleModalClose} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
                            <button onClick={handleAddBook} className="bg-blue-600 text-white px-4 py-2 rounded">Добавить</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default HomePage;