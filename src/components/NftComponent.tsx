import React, { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { MockERC721Address } from '../contractAddress';
import MockERC721Abi from '../abi/MockERC721_abi.json';
import Image from 'next/image';
import { Abi } from 'viem';


type Address = `0x${string}`;


const NftComponent = () => {
  const [allNfts, setAllNfts] = useState<{owner: string, id: number}[]>([]);
  const { address } = useAccount();

  const { data: ownersResult  } = useReadContracts({
    contracts: [
      {
        address: MockERC721Address as `0x${string}`,
        abi: MockERC721Abi as Abi,
        functionName: 'getAllOwners',
      }
    ]
  });

  const owners = ownersResult?.[0].result as Address[] | undefined;


  const { data: ownedTokensResult } = useReadContracts({
    contracts: owners?.map(owner => ({
      address: MockERC721Address as `0x${string}`,
      abi: MockERC721Abi as Abi,
      functionName: 'getOwnedTokenIds',
      args: [owner] as const,
    })) ?? [],
  });

  useEffect(() => {
    if (owners && ownedTokensResult) {
      const nfts = owners.flatMap((owner, index) => 
        (ownedTokensResult[index].result as bigint[] | undefined)?.map(id => ({ owner, id: Number(id) })) ?? []
      );
      
      // Sort NFTs to put connected user's NFTs first
      nfts.sort((a, b) => {
        if (a.owner === address) return -1;
        if (b.owner === address) return 1;
        return 0;
      });
      
      setAllNfts(nfts);
    }
  }, [owners, ownedTokensResult, address]);

  if (!address) {
    return <div>Please connect your wallet</div>;
  }

  if (!owners || !ownedTokensResult) {
    return<div>Loading ...</div>;
  }

  return (
    <div className="flex mt-6 justify-center">
      <div className="card bg-base-100 shadow-xl h-full">
        <div className="card-body">
          <h2 className="card-title justify-center text-center mb-4">All NFTs</h2>
          <div className="w-full max-w-xl mx-auto">
            <div className="carousel carousel-vertical rounded-box h-96">
              {allNfts.map(({ owner, id }) => (
                <div key={`${owner}-${id}`} className="carousel-item relative w-full h-96">
                  <Image 
                    src={`/NftPictures/nft_${id}.jpg`}
                    alt={`NFT ${id}`}
                    width={500}
                    height={500}
                    layout="responsive"
                    className={`w-full ${owner === address ? 'border-4 border-yellow-400' : ''}`}
                    style={{
                      objectFit: "cover",
                      borderRadius: "25px", //👈 and here you can select border radius
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <p className="text-xl font-bold text-white">NFT #{id}</p>
                    <p className="text-sm text-gray-300">
                      Owner: {owner === address ? 'You' : `${owner.slice(0, 6)}...${owner.slice(-4)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftComponent;
