import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Exchanges() {
    const { userId, token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('available');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    const API_URL = 'http://localhost:5001/transactions';
    const BOOKS_URL = 'http://localhost:5001/books';

    const statusConfig = {
        available: [],
        current: ['pending', 'accepted', 'in_progress'],
        archived: ['completed', 'rejected', 'canceled']
    };

    const [showExchangeModal, setShowExchangeModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [exchangePlace, setExchangePlace] = useState('');
    const [exchangeLoading, setExchangeLoading] = useState(false);
    const [exchangeError, setExchangeError] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmTransaction, setConfirmTransaction] = useState(null);

    const fetchOtherBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(BOOKS_URL);
            url.searchParams.append('skip', (currentPage - 1) * perPage);
            url.searchParams.append('limit', perPage);
            if (userId) url.searchParams.append('exclude_user_id', userId);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setBooks(data.books);
            setTotalPages(Math.ceil(data.total / perPage));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(API_URL);
            url.searchParams.append('skip', (currentPage - 1) * perPage);
            url.searchParams.append('limit', perPage);
            url.searchParams.append('user_id', userId);
            if (activeTab !== 'available') {
                url.searchParams.append('status', statusConfig[activeTab].join(','));
            }
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setTransactions(data);
            setTotalPages(Math.ceil(data.length / perPage));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'available') {
            fetchOtherBooks();
        } else {
            fetchTransactions();
        }
    }, [activeTab, currentPage]);

    const openExchangeModal = (book) => {
        setSelectedBook(book);
        setExchangePlace('');
        setExchangeError('');
        setShowExchangeModal(true);
    };
    const closeExchangeModal = () => {
        setShowExchangeModal(false);
        setSelectedBook(null);
        setExchangePlace('');
        setExchangeError('');
    };
    const handleExchangeSubmit = async () => {
        if (!exchangePlace.trim()) {
            setExchangeError('Укажите место для обмена');
            return;
        }
        setExchangeLoading(true);
        setExchangeError('');
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    from_user_id: userId,
                    to_user_id: selectedBook.user_id,
                    book_id: selectedBook.id,
                    place: exchangePlace
                })
            });
            if (!response.ok) throw new Error('Ошибка создания обмена');
            closeExchangeModal();
            alert('Заявка на обмен отправлена!');
            fetchOtherBooks();
            fetchTransactions();
        } catch (err) {
            setExchangeError(err.message);
        } finally {
            setExchangeLoading(false);
        }
    };

    const openConfirmModal = (transaction) => {
        setConfirmTransaction(transaction);
        setShowConfirmModal(true);
    };
    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmTransaction(null);
    };
    const handleConfirm = async (status) => {
        if (!confirmTransaction) return;
        try {
            const response = await fetch(`http://localhost:5001/transactions/${confirmTransaction.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error('Ошибка обновления статуса');
            closeConfirmModal();
            fetchTransactions();
        } catch (err) {
            alert(err.message);
        }
    };

    const renderParticipants = (transaction) => {
        const isInitiator = userId === transaction.from_user_id;
        return (
            <div className="text-sm text-gray-600">
                {isInitiator ? (
                    <>Вы → Пользователь #{transaction.to_user_id}</>
                ) : (
                    <>Пользователь #{transaction.from_user_id} → Вы</>
                )}
            </div>
        );
    };

    const renderStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            canceled: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
                {{
                    pending: 'Ожидает подтверждения',
                    accepted: 'Подтверждён',
                    in_progress: 'В процессе',
                    completed: 'Завершён',
                    rejected: 'Отклонён',
                    canceled: 'Отменён'
                }[status]}
            </span>
        );
    };

    const renderActions = (transaction) => {
        if (activeTab === 'current' && transaction.status === 'pending' && userId === transaction.to_user_id) {
            return (
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => handleConfirmAction(transaction, 'accepted')}
                    >
                        Принять
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleConfirmAction(transaction, 'rejected')}
                    >
                        Отклонить
                    </button>
                </div>
            );
        }
        if (activeTab === 'current' && (transaction.status === 'accepted' || transaction.status === 'in_progress') && (userId === transaction.from_user_id || userId === transaction.to_user_id)) {
            return (
                <button
                    className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
                    onClick={() => handleConfirmAction(transaction, 'completed')}
                >
                    Завершить обмен
                </button>
            );
        }
        return null;
    };

    const handleConfirmAction = async (transaction, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5001/transactions/${transaction.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Ошибка обновления статуса');
            fetchTransactions();
        } catch (err) {
            alert(err.message);
        }
    };

    const renderTransactionCard = (transaction) => (
        <div key={transaction.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                            {transaction.book_title || 'Неизвестная книга'}
                        </h3>
                        {renderStatusBadge(transaction.status)}
                    </div>

                    {renderParticipants(transaction)}

                    <div className="mt-2 text-sm text-gray-600">
                        <p>Дата: {new Date(transaction.date).toLocaleDateString()}</p>
                        {transaction.place && <p>Место: {transaction.place}</p>}
                    </div>
                </div>

                {renderActions(transaction)}
            </div>
        </div>
    );

    const renderPagination = () => {
        return (
            <span className="px-4 py-2">
                Страница {currentPage} из {totalPages}
            </span>
        );
    };

    const renderAvailableBookCard = (book) => (
        <div key={book.id} className="border rounded-lg shadow-sm p-4">
            <div className="space-y-2">
                <h5 className="text-lg font-semibold">{book.title}</h5>
                <h6 className="text-sm text-gray-500">{book.author}</h6>
                <p className="text-sm"><strong>Категория:</strong> {book.category}</p>
                <p className="text-sm"><strong>Год:</strong> {book.year || '—'}</p>
                <p className="text-sm"><strong>Владелец:</strong> {book.username || book.user_id}</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => openExchangeModal(book)}>
                    Начать обмен
                </button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex space-x-4 mb-6">
                {['available', 'current', 'archived'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded ${
                            activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {{
                            available: 'Доступные книги',
                            current: 'Мои обмены',
                            archived: 'Архив обменов'
                        }[tab]}
                    </button>
                ))}
            </div>

            {loading && <div className="text-center text-blue-500">Загрузка...</div>}
            {error && <div className="text-center text-red-500">Ошибка: {error}</div>}

            {!loading && !error && (
                <>
                    {activeTab === 'available' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {books.length > 0 ? books.map(renderAvailableBookCard) : (
                                <div className="col-span-full text-center text-gray-500">Нет доступных книг.</div>
                            )}
                        </div>
                    )}
                    {activeTab === 'current' && (
                        <div className="space-y-4">
                            {transactions.length > 0 ? (
                                transactions.map(renderTransactionCard)
                            ) : (
                                <div className="text-center text-gray-500">Нет обменов</div>
                            )}
                        </div>
                    )}
                    {activeTab === 'archived' && (
                        <div className="space-y-4">
                            {transactions.length > 0 ? (
                                transactions.map(renderTransactionCard)
                            ) : (
                                <div className="text-center text-gray-500">Нет обменов</div>
                            )}
                        </div>
                    )}
                </>
            )}

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

            {showExchangeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-xl font-bold mb-4">Начать обмен</h2>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Место обмена:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
                                value={exchangePlace}
                                onChange={e => setExchangePlace(e.target.value)}
                                placeholder="Введите место встречи"
                            />
                        </div>
                        {exchangeError && <div className="text-red-500 mb-2">{exchangeError}</div>}
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeExchangeModal} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
                            <button onClick={handleExchangeSubmit} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={exchangeLoading}>
                                {exchangeLoading ? 'Отправка...' : 'Отправить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && confirmTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-xl font-bold mb-4">Подтвердить обмен</h2>
                        <p className="mb-4">Вы действительно хотите подтвердить или отклонить заявку на обмен книги <b>{confirmTransaction.book_title}</b>?</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeConfirmModal} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
                            <button onClick={() => handleConfirm('accepted')} className="bg-green-600 text-white px-4 py-2 rounded">Принять</button>
                            <button onClick={() => handleConfirm('rejected')} className="bg-red-600 text-white px-4 py-2 rounded">Отклонить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Exchanges;