import { Link, Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="container mx-auto pt-10 px-20">
      <h1 className="text-3xl font-bold underline">Cross-chain Swap API</h1>

      <div className="pt-10 flex gap-4">
        <Link
          to="/metamask"
          className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
        >
          Metamask Wallet
        </Link>
        <Link
          to="/keplr"
          className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
        >
          Keplr Wallet
        </Link>
        <Link
          to="/multiversx"
          className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
        >
          MultiversX Wallet
        </Link>
        <Link
          to="/ton"
          className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
        >
          Ton Connect
        </Link>
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;
