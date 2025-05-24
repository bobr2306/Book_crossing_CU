import React, { useState, useEffect } from 'react';

function Exchanges() {
    // Состояния для хранения списков обменов
    const [availableExchanges, setAvailableExchanges] = useState([]);
    const [currentExchanges, setCurrentExchanges] = useState([]);
    const [archivedExchanges, setArchivedExchanges] = useState([]);
    
    // Состояния для загрузки и ошибок
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Состояние для текущей подвкладки
    const [activeTab, setActiveTab] = useState('available');
    
    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const exchangesPerPage = 10;

    // URL API для обменов
    const API_URL = 'http://localhost:5001/exchanges';

    // Функция для загрузки обменов
    const fetchExchanges = async (type) => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(API_URL);
            url.searchParams.append('type', type);
            url.searchParams.append('page', currentPage);
            url.searchParams.append('per_page', exchangesPerPage);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: статус ${response.status}`);
            }

            const data = await response.json();
            
            // Обновляем соответствующий список обменов
            switch (type) {
                case 'available':
                    setAvailableExchanges(data.exchanges);
                    break;
                case 'current':
                    setCurrentExchanges(data.exchanges);
                    break;
                case 'archived':
                    setArchivedExchanges(data.exchanges);
                    break;
                default:
                    break;
            }
            
            setTotalPages(Math.ceil(data.total / exchangesPerPage));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Загружаем обмены при изменении вкладки или страницы
    useEffect(() => {
        fetchExchanges(activeTab);
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

    // Функция для отображения карточки обмена
    const renderExchangeCard = (exchange) => (
        <div key={exchange.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{exchange.book.title}</h3>
                    <p className="text-gray-600">Автор: {exchange.book.author}</p>
                    <p className="text-gray-600">Предлагает: {exchange.offered_by}</p>
                    <p className="text-gray-600">Статус: {exchange.status}</p>
                </div>
                <div className="flex space-x-2">
                    {activeTab === 'available' && (
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Предложить обмен
                        </button>
                    )}
                    {activeTab === 'current' && (
                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Подтвердить
                        </button>
                    )}
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
                        setActiveTab('available');
                        setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded ${
                        activeTab === 'available'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Доступные обмены
                </button>
                <button
                    onClick={() => {
                        setActiveTab('current');
                        setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded ${
                        activeTab === 'current'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Текущие обмены
                </button>
                <button
                    onClick={() => {
                        setActiveTab('archived');
                        setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded ${
                        activeTab === 'archived'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Архив обменов
                </button>
            </div>

            {/* Состояние загрузки и ошибки */}
            {loading && <div className="text-center text-blue-500">Загрузка обменов...</div>}
            {error && <div className="text-center text-red-500">Ошибка загрузки: {error}</div>}

            {/* Список обменов */}
            {!loading && !error && (
                <>
                    <div className="space-y-4">
                        {activeTab === 'available' && availableExchanges.map(renderExchangeCard)}
                        {activeTab === 'current' && currentExchanges.map(renderExchangeCard)}
                        {activeTab === 'archived' && archivedExchanges.map(renderExchangeCard)}
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

export default Exchanges; 