import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
      <div className="w-full max-w-md flex flex-col items-center animate-fade-in-up">
        {/* Brand Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/50 relative overflow-hidden group cursor-pointer transition-transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="text-[#1A1A1A] font-bold text-3xl font-outfit drop-shadow-sm">T</span>
          </div>
          <span className="text-3xl font-outfit font-bold tracking-tight text-[#1A1A1A] drop-shadow-sm">TRAVELOOP</span>
          <p className="text-[#1A1A1A]/70 font-medium text-sm tracking-wide uppercase">Luxury Reimagined</p>
        </div>
        
        {/* Auth Card */}
        <LoginCard />
        
        {/* Footer */}
        <footer className="mt-10 text-sm text-[#1A1A1A]/60 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Traveloop Global. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
