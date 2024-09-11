import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import { MockERC721Address } from '../contractAddress';
import MockERC721Abi from '../abi/MockERC721_abi.json';
import Image from 'next/image';

const NftComponent = () => {
  const [nftIds, setNftIds] = useState<number[]>([]);
  const [currentNft, setCurrentNft] = useState(0);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data: balance} = useReadContract({
    address: MockERC721Address,
    abi: MockERC721Abi,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    const fetchNftIds = async () => {
      if (balance) {
        const BalanceNumber = parseInt(balance.toString());
        const ids = [];
        for (let i = 0; i < BalanceNumber; i++) {
            /*
          const id = await publicClient.readContract({
            address: MockERC721Address,
            abi: MockERC721Abi,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, i],
          });
            */
            const id = i + 1;
            ids.push(id);
        }
        setNftIds(ids);
      }
    };
    fetchNftIds();
  }, [balance, address, publicClient]);

  const nextNft = () => {
    setCurrentNft((prev) => (prev + 1) % nftIds.length);
  };

  const prevNft = () => {
    setCurrentNft((prev) => (prev - 1 + nftIds.length) % nftIds.length);
  };

  if (!address) {
    return <div>Please connect your wallet</div>;
  }

  if (balance === undefined) {
    return <div>Loading...</div>;
  }

  if (balance === 0) {
    return <div>You don't have any NFTs from this collection</div>;
  }

  return (
    <div className="flex mt-6 justify-center">
  <div className="card bg-base-100 shadow-xl h-full">
    <div className="card-body">
      <h2 className="card-title justify-center text-center mb-4">Your NFTs</h2>
      <div className="w-full max-w-xl mx-auto">
        <div className="carousel carousel-vertical rounded-box h-96">
          {nftIds.map((nftId, index) => (
            <div key={nftId} className="carousel-item relative w-full">
              <Image 
                src={`/NftPictures/nft_${nftId}.webp`}
                alt={`NFT ${nftId}`}
                width={500}  // Adjust this to your desired width
                height={500} // Adjust this to your desired height
                layout="responsive"
                className="w-full"
              />

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <p className="text-xl font-bold text-white">NFT #{nftId}</p>
                  <p className="text-sm text-gray-300">Legendary Crypto Collectible</p>
                </div>
            </div>
            
          ))}
        </div>
        {/* 
        <div className="flex justify-center w-full py-2 gap-2 mt-4">
          {nftIds.map((nftId, index) => (
            <button 
              key={nftId}
              className={`btn btn-xs ${index === currentNft ? 'btn-active' : ''}`}
              onClick={() => setCurrentNft(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        */}
      </div>
    </div>
  </div>
</div>


  );
};

export default NftComponent;