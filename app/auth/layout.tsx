export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-black via-stellar-dark to-stellar-black">
      <div className="absolute top-4 left-4">
        <a 
          href="/"
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          ← Back to Home
        </a>
      </div>
      {children}
    </div>
  );
}