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
    <div className="w-full max-w-xl mx-auto">
      <div className="carousel carousel-vertical w-full">
        <div className="carousel-item relative w-full">
        <Image 
            src={`/NftPictures/nft_${nftIds[currentNft]}.webp`}
            alt={`NFT ${nftIds[currentNft]}`}
            width={500}  // Adjust this to your desired width
            height={500} // Adjust this to your desired height
            layout="responsive"
            className="w-full"
          />
          <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
            <button onClick={prevNft} className="btn btn-circle">❮</button>
            <button onClick={nextNft} className="btn btn-circle">❯</button>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full py-2 gap-2">
        {nftIds.map((_, index) => (
          <button 
            key={index}
            className={`btn btn-xs ${index === currentNft ? 'btn-active' : ''}`}
            onClick={() => setCurrentNft(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NftComponent;