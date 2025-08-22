import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full py-6 mt-12 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Ace Store | Desenvolvido por Edinho</p>
            </div>
        </footer>
    );
};

export default Footer;