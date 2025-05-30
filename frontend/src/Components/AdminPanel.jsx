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
    const API_URL = 'http://localhost:5001/admin';

    // Состояние для модального окна
    const [modal, setModal] = useState({ open: false, type: '', data: null });

    // Функция для загрузки данных
    const fetchData = async (type) => {
        setLoading(true);
        setError(null);
        try {
            let url;
            if (type === 'users') {
                url = new URL('http://localhost:5001/users');
            } else if (type === 'books') {
                url = new URL('http://localhost:5001/admin/books');
            } else if (type === 'exchanges') {
                url = new URL('http://localhost:5001/admin/transactions');
            } else {
                url = new URL('http://localhost:5001/admin/' + type);
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: статус ${response.status}`);
            }
            const data = await response.json();
            switch (type) {
                case 'users':
                    setUsers(Array.isArray(data) ? data : []);
                    break;
                case 'books':
                    setBooks(Array.isArray(data) ? data : []);
                    break;
                case 'exchanges':
                    setExchanges(Array.isArray(data) ? data : []);
                    break;
                default:
                    break;
            }
            setTotalPages(1);
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

    // Открытие модального окна
    const openModal = (type, data) => setModal({ open: true, type, data });
    const closeModal = () => setModal({ open: false, type: '', data: null });

    // Функция для редактирования
    const handleEdit = async (type, data) => {
        try {
            let url = '';
            let method = 'PUT';
            let body = {};
            if (type === 'user') {
                url = `http://localhost:5001/users/${data.id}`;
                body = { username: data.username, role: data.role };
            } else if (type === 'book') {
                url = `http://localhost:5001/admin/books/${data.id}`;
                body = { title: data.title, author: data.author, category: data.category, year: data.year };
            } else if (type === 'exchange') {
                url = `http://localhost:5001/admin/transactions/${data.id}`;
                body = { place: data.place, status: data.status };
            }
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Ошибка редактирования');
            closeModal();
            fetchData(type + 's');
        } catch (err) {
            alert(err.message);
        }
    };

    // Функция для отображения карточки пользователя
    const renderUserCard = (user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{user.username}</h3>
                    <p className="text-gray-600">Роль: {user.role}</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={() => openModal('editUser', user)}>
                        Редактировать
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => openModal('deleteUser', user)}>
                        Удалить
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
                </div>
                <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={() => openModal('editBook', book)}>
                        Редактировать
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => openModal('deleteBook', book)}>
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
                    <p className="text-gray-600">Книга: {exchange.book?.title || '—'}</p>
                    <p className="text-gray-600">От: {exchange.from_user?.username || exchange.from_user?.id || '—'}</p>
                    <p className="text-gray-600">Кому: {exchange.to_user?.username || exchange.to_user?.id || '—'}</p>
                    <p className="text-gray-600">Статус: {exchange.status}</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={() => openModal('editExchange', exchange)}>
                        Редактировать
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => openModal('deleteExchange', exchange)}>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );

    // Функции для удаления
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Удалить пользователя?')) return;
        try {
            const response = await fetch(`http://localhost:5001/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Ошибка удаления пользователя');
            fetchData('users');
        } catch (err) { alert(err.message); }
    };
    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Удалить книгу?')) return;
        try {
            const response = await fetch(`http://localhost:5001/admin/books/${bookId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Ошибка удаления книги');
            fetchData('books');
        } catch (err) { alert(err.message); }
    };
    const handleDeleteExchange = async (exchangeId) => {
        if (!window.confirm('Удалить обмен?')) return;
        try {
            const response = await fetch(`http://localhost:5001/admin/transactions/${exchangeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Ошибка удаления обмена');
            fetchData('exchanges');
        } catch (err) { alert(err.message); }
    };

    // Модальное окно
    const renderModal = () => {
        if (!modal.open) return null;
        const { type, data } = modal;
        if (type.startsWith('delete')) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-xl font-bold mb-4">Подтвердите удаление</h2>
                        <p className="mb-4">Вы уверены, что хотите удалить?</p>
                        <div className="flex justify-end space-x-2">
                            <button className="bg-gray-300 px-4 py-2 rounded" onClick={closeModal}>Отмена</button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={async () => {
                                if (type === 'deleteUser') await handleDeleteUser(data.id);
                                if (type === 'deleteBook') await handleDeleteBook(data.id);
                                if (type === 'deleteExchange') await handleDeleteExchange(data.id);
                                closeModal();
                            }}>Удалить</button>
                        </div>
                    </div>
                </div>
            );
        }
        if (type.startsWith('edit')) {
            let fields = null;
            let localData = { ...data };
            const handleFieldChange = (field, value) => {
                localData[field] = value;
            };
            if (type === 'editUser') {
                fields = (
                    <>
                        <input className="w-full border p-2 mb-2" defaultValue={data.username} placeholder="Имя пользователя" onChange={e => handleFieldChange('username', e.target.value)} />
                        <input className="w-full border p-2 mb-2" defaultValue={data.role} placeholder="Роль" onChange={e => handleFieldChange('role', e.target.value)} />
                    </>
                );
            } else if (type === 'editBook') {
                fields = (
                    <>
                        <input className="w-full border p-2 mb-2" defaultValue={data.title} placeholder="Название" onChange={e => handleFieldChange('title', e.target.value)} />
                        <input className="w-full border p-2 mb-2" defaultValue={data.author} placeholder="Автор" onChange={e => handleFieldChange('author', e.target.value)} />
                        <input className="w-full border p-2 mb-2" defaultValue={data.category} placeholder="Категория" onChange={e => handleFieldChange('category', e.target.value)} />
                        <input className="w-full border p-2 mb-2" defaultValue={data.year} placeholder="Год" type="number" onChange={e => handleFieldChange('year', e.target.value)} />
                    </>
                );
            } else if (type === 'editExchange') {
                fields = (
                    <>
                        <input className="w-full border p-2 mb-2" defaultValue={data.place} placeholder="Место" onChange={e => handleFieldChange('place', e.target.value)} />
                        <input className="w-full border p-2 mb-2" defaultValue={data.status} placeholder="Статус" onChange={e => handleFieldChange('status', e.target.value)} />
                    </>
                );
            }
            return (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-xl font-bold mb-4">Редактировать</h2>
                        <form onSubmit={e => { e.preventDefault(); handleEdit(type.replace('edit', '').toLowerCase(), localData); }}>
                            {fields}
                            <div className="flex justify-end space-x-2 mt-4">
                                <button className="bg-gray-300 px-4 py-2 rounded" onClick={closeModal} type="button">Отмена</button>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
        return null;
    };

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
            {renderModal()}
        </div>
    );
}

export default AdminPanel; 