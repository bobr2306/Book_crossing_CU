import React from 'react';

function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-6 w-full fixed bottom-0 left-0 right-0">
            <div className="w-full px-4">
                <div className="flex flex-col items-center gap-4">
                    {/* Brief Info */}
                    <div className="text-center">
                        <p className="text-gray-300">
                            BookShare - платформа для обмена книгами.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex space-x-4">
                        <a 
                            href="https://t.me/Elona_muska" 
                            className="text-gray-300 hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Telegram
                        </a>
                        <a 
                            href="https://github.com/bobr2306" 
                            className="text-gray-300 hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="text-gray-300 text-sm">
                        <p>© {new Date().getFullYear()} BookShare. Все права защищены.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;