import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex max-h-screen min-h-full text-white bg-slate-900">
      <Sidebar />

      <div className="relative flex flex-col w-full min-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
