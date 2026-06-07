import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-[#F5FAFF] px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1240px] items-stretch md:min-h-[calc(100vh-40px)]">
        <Outlet />
      </div>
    </main>
  );
}
