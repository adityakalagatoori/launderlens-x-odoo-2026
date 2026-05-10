import { RegisterWizard } from "@/components/auth/RegisterWizard";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#63D5DF] opacity-30 blur-3xl rounded-full mix-blend-multiply" />
      <div className="absolute top-[30%] right-[10%] w-72 h-72 bg-[#AEE7EC] opacity-40 blur-3xl rounded-full mix-blend-multiply" />
      <div className="absolute bottom-[20%] left-[15%] w-80 h-80 bg-[#F3E2D2] opacity-50 blur-3xl rounded-full mix-blend-multiply" />
      
      <div className="z-10 w-full flex flex-col items-center">
        <div className="mb-8 flex items-center gap-2">
          <div className="w-10 h-10 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm border border-white/50">
            <span className="text-[#63D5DF] font-bold text-xl drop-shadow-md">T</span>
          </div>
          <span className="text-2xl font-outfit font-bold tracking-tight text-[#1A1A1A]">TRAVELOOP</span>
        </div>
        
        <RegisterWizard />
        
        <footer className="mt-8 text-sm text-gray-700 font-medium opacity-80">
          &copy; 2026 Traveloop Global. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
