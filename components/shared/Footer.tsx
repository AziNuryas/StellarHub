import { Rocket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Rocket className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">StellarHub</span>
          </div>

          <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Tentang
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Komunitas
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Kontak
            </a>
          </div>

          <div className="text-sm text-gray-500 text-center md:text-right">
            © {new Date().getFullYear()} StellarHub. All rights reserved.
            <br />
            Made with ❤️ for astronomy lovers in Indonesia
          </div>
        </div>
      </div>
    </footer>
  );
}