import type { NextPage } from 'next';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Link from 'next/link';


const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 " style={{
      backgroundImage: "url('/background/background.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <Head>
        <title>The Fedz Project</title>
        <meta
          content="The Fedz - Revolutionary DeFi Platform"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-16">
        <section className="hero bg-base-100 rounded-lg shadow-md mb-8">
          <div className="hero-content text-center  py-12">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold mb-4 text-blue-600">The Fedz</h1>
              <p className="mb-6 text-gray-700">
                Welcome to The Fedz – The Fedz was founded to solve the persistent issue of instability in decentralized finance by offering a mechanism to mitigate bank runs. The Fedz aims to provide a resilient financial system that reduces bank-run risk while maintaining liquidity, allowing for greater trust and participation in DeFi markets.
              </p>
              <button className="btn btn-primary bg-blue-500 hover:bg-blue-600">Start Printing</button>
            </div>
          </div>
        </section>

        <section className="bg-base-100 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 text-center text-blue-600">Our Mission</h2>
          <p className="text-center max-w-2xl mx-auto text-gray-700">
          Our mission is to create a robust financial mechanism that mitigates bank runs, demonstrating the system's effectiveness by stabilizing the FUSD peg to USDT through under-collateralization and minimal capital needs.
          </p>
        </section>

        <section className="bg-base-100 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-blue-500">Preventing Bank Runs</h3>
                <p className="text-gray-700">Implement proven mechanisms to mitigate the risk of panic withdrawals and ensure the security of users' assets.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-blue-500">Private Liquidity Pools (PLP)</h3>
                <p className="text-gray-700">Modified structures of an AMM designed to enable issuers to demonstrate their financial trust, offering enhanced stability within decentralized markets.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-blue-500">FUSD</h3>
                <p className="text-gray-700">A stablecoin backed by undercollateralized assets, designed to maintain a stable value while minimizing capital requirements, and introduced as our first financial product to demonstrate stability and mitigate bank runs within The Fedz ecosystem.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-base-100 rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">FedzHook Repository</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-100">
                  <th className="text-left py-2 px-4 text-blue-500">Item</th>
                  <th className="text-left py-2 px-4 text-blue-500">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b">Repository Name</td>
                  <td className="py-2 px-4 border-b">TheFedzHook</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Owner</td>
                  <td className="py-2 px-4 border-b">Loris-EPFL</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Language</td>
                  <td className="py-2 px-4 border-b">Solidity</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Repository Link</td>
                  <td className="py-2 px-4 border-b">
                    <Link href="https://github.com/FedzHookDev/TheFedzHook"       
                    className="text-blue-500 hover:text-blue-700 font-bold underline"
                    passHref>
                      
                        TheFedzHook Repository
                      
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Description</td>
                  <td className="py-2 px-4">A template for writing Uniswap v4 Hooks, demonstrating beforeSwap() and afterSwap() hooks in Counter.sol</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="footer footer-center p-10 bg-base-100 text-gray-700 rounded-t-lg mt-8">
        <div>
          <p>Made with ❤️ by Loris from The Fedz Team</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
