import React, { useState, useEffect } from 'react';

function AdminPanel() {
    // Состояния для хранения данных
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Состояние для текущей вкладки
    const [activeTab, setActiveTab] = useState('users');
    
    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // URL API для админ-панели
    const API_URL = 'http://localhost:5000/admin';

    // Функция для загрузки данных
    const fetchData = async (type) => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(`${API_URL}/${type}`);
            url.searchParams.append('page', currentPage);
            url.searchParams.append('per_page', itemsPerPage);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: статус ${response.status}`);
            }

            const data = await response.json();
            
            // Обновляем соответствующий список данных
            switch (type) {
                case 'users':
                    setUsers(data.items);
                    break;
                case 'books':
                    setBooks(data.items);
                    break;
                case 'exchanges':
                    setExchanges(data.items);
                    break;
                default:
                    break;
            }
            
            setTotalPages(Math.ceil(data.total / itemsPerPage));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Загружаем данные при изменении вкладки или страницы
    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, currentPage]);

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

    // Функция для отображения карточки пользователя
    const renderUserCard = (user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{user.username}</h3>
                    <p className="text-gray-600">Email: {user.email}</p>
                    <p className="text-gray-600">Роль: {user.role}</p>
                    <p className="text-gray-600">Статус: {user.status}</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        Редактировать
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Заблокировать
                    </button>
                </div>
            </div>
        </div>
    );

    // Функция для отображения карточки книги
    const renderBookCard = (book) => (
        <div key={book.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
                    <p className="text-gray-600">Автор: {book.author}</p>
                    <p className="text-gray-600">Категория: {book.category}</p>
                    <p className="text-gray-600">Статус: {book.status}</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        Редактировать
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );

    // Функция для отображения карточки обмена
    const renderExchangeCard = (exchange) => (
        <div key={exchange.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Обмен #{exchange.id}</h3>
                    <p className="text-gray-600">Книга: {exchange.book.title}</p>
                    <p className="text-gray-600">От: {exchange.from_user}</p>
                    <p className="text-gray-600">Кому: {exchange.to_user}</p>
                    <p className="text-gray-600">Статус: {exchange.status}</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        Просмотр
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Отменить
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Подвкладки */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('users');
                        setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded ${
                        activeTab === 'users'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Пользователи
                </button>
                <button
                    onClick={() => {
                        setActiveTab('books');
                        setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded ${
                        activeTab === 'books'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Книги
                </button>
                <button
                    onClick={() => {
                        setActiveTab('exchanges');
                        setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded ${
                        activeTab === 'exchanges'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Обмены
                </button>
            </div>

            {/* Состояние загрузки и ошибки */}
            {loading && <div className="text-center text-blue-500">Загрузка данных...</div>}
            {error && <div className="text-center text-red-500">Ошибка загрузки: {error}</div>}

            {/* Список данных */}
            {!loading && !error && (
                <>
                    <div className="space-y-4">
                        {activeTab === 'users' && users.map(renderUserCard)}
                        {activeTab === 'books' && books.map(renderBookCard)}
                        {activeTab === 'exchanges' && exchanges.map(renderExchangeCard)}
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
        </div>
    );
}

export default AdminPanel; 