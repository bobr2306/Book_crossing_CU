import React, { useState, useEffect } from 'react';

function Collections() {
    // Состояния для хранения коллекций
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const collectionsPerPage = 8;

    // Состояния для модального окна создания коллекции
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDescription, setNewCollectionDescription] = useState('');

    // URL API для коллекций
    const API_URL = 'http://localhost:5001/collections';

    // Функция для загрузки коллекций
    const fetchCollections = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(API_URL);
            url.searchParams.append('skip', (currentPage - 1) * collectionsPerPage);
            url.searchParams.append('limit', collectionsPerPage);
            // Не фильтруем по user_id, чтобы видеть все коллекции
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: статус ${response.status}`);
            }
            const data = await response.json();
            setCollections(data);
            setTotalPages(1); // TODO: если сервер вернет total, пересчитать
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Загружаем коллекции при изменении страницы
    useEffect(() => {
        fetchCollections();
    }, [currentPage]);

    // Функция для создания новой коллекции
    const handleCreateCollection = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newCollectionName,
                    description: newCollectionDescription,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании коллекции');
            }

            setShowCreateModal(false);
            setNewCollectionName('');
            setNewCollectionDescription('');
            fetchCollections();
        } catch (err) {
            setError(err.message);
        }
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

    // Функция для отображения карточки коллекции
    const renderCollectionCard = (collection) => (
        <div key={collection.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{collection.title}</h3>
                    <p className="text-sm text-gray-500">Книг в коллекции: {collection.book_count}</p>
                    <p className="text-xs text-gray-400">ID пользователя: {collection.user_id}</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        Просмотр
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Заголовок и кнопка создания */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Мои коллекции</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Создать коллекцию
                </button>
            </div>

            {/* Состояние загрузки и ошибки */}
            {loading && <div className="text-center text-blue-500">Загрузка коллекций...</div>}
            {error && <div className="text-center text-red-500">Ошибка загрузки: {error}</div>}

            {/* Список коллекций */}
            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {collections.map(renderCollectionCard)}
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

            {/* Модальное окно создания коллекции */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Создать новую коллекцию</h2>
                        <form onSubmit={handleCreateCollection}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Название коллекции</label>
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Описание</label>
                                <textarea
                                    value={newCollectionDescription}
                                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Создать
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Collections; 