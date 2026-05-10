import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="fixed top-[10%] left-[5%] w-64 h-64 bg-[#63D5DF] opacity-20 blur-3xl rounded-full" />
      <div className="fixed bottom-[10%] right-[5%] w-96 h-96 bg-[#F3E2D2] opacity-30 blur-3xl rounded-full" />
      
      <div className="z-10 w-full flex flex-col items-center">
        <div className="mb-12 flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
            <span className="text-[#63D5DF] font-bold text-xl">T</span>
          </div>
          <span className="text-2xl font-outfit font-bold tracking-tight">TRAVELOOP</span>
        </div>
        
        <LoginCard />
        
        <footer className="mt-12 text-sm text-gray-600 font-medium">
          &copy; 2026 Traveloop Global. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
