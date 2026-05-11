import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white tracking-tight">StellarHub</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs text-center md:text-left">
              Platform komunitas astronomi terbesar di Indonesia. Menghubungkan Anda dengan keajaiban kosmos setiap hari.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Legal</span>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                Syarat & Ketentuan
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navigasi</span>
              <Link href="/feed" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                Feed
              </Link>
              <Link href="/nasa" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                NASA APOD
              </Link>
            </div>
          </div>

          <div className="text-sm text-gray-500 text-center md:text-right">
            © {new Date().getFullYear()} StellarHub.
            <br />
            Dibuat dengan ❤️ di Indonesia.
          </div>
        </div>
      </div>
    </footer>
  );
}