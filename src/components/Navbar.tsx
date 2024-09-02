// components/Navbar.js
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 fixed top-0 z-50">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          The Fedz
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/swap">Swap</Link>
          </li>
          <li>
            <Link href="/liquidity">Liquidity</Link>
          </li>
        </ul>
        <ConnectButton />
      </div>
    </div>
  );
};

export default Navbar;