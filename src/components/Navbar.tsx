// components/Navbar.js
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 fixed top-0 z-50 mb-10 pb-4">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost normal-case text-xl hover:scale-110 transition-transform duration-200">
          The Fedz
        </Link>
      </div>
      <div className="navbar-center">
        <ul className="menu menu-horizontal px-1 space-x-2">
          <li>
            <Link href="/" className="btn btn-neutral text-lg normal-case hover:scale-110 transition-transform duration-200">Home</Link>
          </li>
          <li>
            <Link href="/swap" className="btn btn-neutral text-lg normal-case hover:scale-110 transition-transform duration-200">Swap</Link>
          </li>
          <li>
            <Link href="/liquidity" className="btn btn-neutral text-lg normal-case hover:scale-110 transition-transform duration-200">Liquidity</Link>
          </li>
          <li>
            <Link href="/nft" className="btn btn-neutral text-lg normal-case hover:scale-110 transition-transform duration-200">Nft</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <ConnectButton />
      </div>
    </div>
  );
};

export default Navbar;
