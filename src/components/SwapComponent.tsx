import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useContractWrite, useWriteContract } from 'wagmi';
import { parseEther, formatEther, parseGwei } from 'viem';
import {PoolSwapTestAddress, HookAddress, MockFUSDAddress, MockUSDTAddress} from "../contractAddress";
import PoolSwapTestAbi from "../abi/PoolSwapTest_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { getPoolId } from '../misc/v4helpers';
import {formatBigIntToDecimal} from '../misc/formatBigIntToDecimals';
import MockERC721Abi from '../abi/MockERC721_abi.json';
import {MockERC721Address} from '../contractAddress';

const SwapComponent = () => {
  const [poolKeyHash, setPoolKeyHash] = useState('');
  const [token0, setToken0] = useState(MockFUSDAddress);
  const [token1, setToken1] = useState(MockUSDTAddress);
  const [amount, setAmount] = useState('1');
  const [tickSpacing, setTickSpacing] = useState(60);
  const [swapFee, setSwapFee] = useState(4000);
  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);
  const [MockFUSDBalanceState, setMockFUSDBalanceState] = useState<BigInt>(BigInt(0));
  const [MockUSDTBalanceState, setMockUSDTBalanceState] = useState<BigInt>(BigInt(0));
  const [isNFTHolderState, setIsNFTHolderState] = useState(false);


  const [hookData, setHookData] = useState<`0x${string}`>("0x0"); // New state for custom hook data
  const [swapError, setSwapError] = useState();


  const MIN_SQRT_PRICE_LIMIT = BigInt("4295128739") + BigInt("1");
  const MAX_SQRT_PRICE_LIMIT = BigInt("1461446703485210103287273052203988822378723970342") - BigInt("1");


  const { data: writeSwapData, error: writeSwapError, isPending: isSwapPending, writeContract: writeSwapContract } = useWriteContract();
  const { data: writeApprove0Data, error: writeApprove0Error, isPending: isApprove0Pending, writeContract: writeApproveToken0Contract } = useWriteContract();
  const { data: writeApprove1Data, error: writeApprove1Error, isPending: isApprove1Pending, writeContract: writeApproveToken1Contract } = useWriteContract();



  const { address } = useAccount();

  const {data: isNFTHolder} = useReadContract({
      address: MockERC721Address,
      abi: MockERC721Abi,
      functionName: 'isNFTHolder',
      args: [address],
  });

  useEffect(() => {
    if (isNFTHolder !== undefined) {
      setIsNFTHolderState(isNFTHolder as boolean);
    }
  }, [isNFTHolder]);


  
  const { data: token0Allowance } = useReadContract({
    address: MockFUSDAddress,
    abi: MockERC20Abi,
    functionName: 'allowance',
    args: [address, PoolSwapTestAddress], 
  });


  const { data: token1Allowance } = useReadContract({
    address: MockUSDTAddress,
    abi: MockERC20Abi,
    functionName: 'allowance',
    args: [address, PoolSwapTestAddress], 
  });

  const { data: MockFUSDBalance } = useReadContract({
    address: MockFUSDAddress,
    abi: MockERC20Abi,
    functionName: 'balanceOf',
    args: [address], 
  });

  const { data: MockUSDTBalance } = useReadContract({
    address: MockUSDTAddress,
    abi: MockERC20Abi,
    functionName: 'balanceOf',
    args: [address], 
  });


  useEffect(() => {
  if (token0Allowance != null && token1Allowance != null && amount != null) {
    try {
      const amountBigInt = BigInt(amount);
      const token0AllowanceBigInt = BigInt(token0Allowance.toString());
      const token1AllowanceBigInt = BigInt(token1Allowance.toString());
      
      const isToken0Approved = token0AllowanceBigInt >= amountBigInt;
      const isToken1Approved = token1AllowanceBigInt >= amountBigInt;
      setIsToken0Approved(isToken0Approved);
      setIsToken1Approved(isToken1Approved);
      
    } catch (error) {
      console.error('Error converting values to BigInt:', error);
      setIsToken0Approved(false);
      setIsToken1Approved(false);

    }
  } else {
    setIsToken0Approved(false);
    setIsToken1Approved(false);

  }
}, [token0Allowance, token1Allowance, amount]);

useEffect(() => {
  if (MockFUSDBalance != null && MockUSDTBalance != null) {
    try {
      const formattedToken0Balance = (MockFUSDBalance);
      const formattedToken1Balance = (MockUSDTBalance);
      
      setMockFUSDBalanceState(formattedToken0Balance as BigInt);
      setMockUSDTBalanceState(formattedToken1Balance as BigInt);
      
    } catch (error) {
      console.error('Error formatting balance values:', error);
      setMockFUSDBalanceState(BigInt(0));
      setMockUSDTBalanceState(BigInt(0));
    }
  } else {
    setMockFUSDBalanceState(BigInt(0));
    setMockUSDTBalanceState(BigInt(0));
  }
}, [MockFUSDBalance, MockUSDTBalance]);



  const approveToken0 = async () => {

    try {
      await writeApproveToken0Contract({
        address: MockFUSDAddress,
        abi: MockERC20Abi,
        functionName: 'approve',
        args: [PoolSwapTestAddress, parseEther(amount)]
      });
    } catch (err) {
        console.log(err)   
  }
  };

  const approveToken1 = async () => {

    try {
      await writeApproveToken1Contract({
        address: MockUSDTAddress,
        abi: MockERC20Abi,
        functionName: 'approve',
        args: [PoolSwapTestAddress, parseEther(amount)]
      });
    } catch (err) {
        console.log(err)   
  }
  };


 


  const swap = async () => {
    try {
      const result = await writeSwapContract({
        address: PoolSwapTestAddress,
        abi: PoolSwapTestAbi,
        functionName: 'swap',
        args: [
          {
            currency0: token0.toLowerCase() < token1.toLowerCase() ? token0 : token1,
            currency1: token0.toLowerCase() < token1.toLowerCase() ? token1 : token0,
            fee: Number(swapFee),
            tickSpacing: Number(tickSpacing),
            hooks: HookAddress,
          },
          {
            zeroForOne: token0.toLowerCase() < token1.toLowerCase(),
            amountSpecified: parseEther(amount), // TODO: assumes tokens are always 18 decimals
            sqrtPriceLimitX96:
              token0.toLowerCase() < token1.toLowerCase() ? MIN_SQRT_PRICE_LIMIT : MAX_SQRT_PRICE_LIMIT, // unlimited impact
          },
          {
            takeClaims	: false,
            settleUsingBurn: false
            
          },
          hookData,
        ],
      });
      console.log('Swap transaction sent:', writeSwapData);
    } catch (error) {
      console.error('Error in deposit:', error);
      //setSwapError(error);
    }
  };

  useEffect(() => {
    if (token0 && token1 && swapFee !== undefined && tickSpacing !== undefined && HookAddress) {
      try {
        const id = getPoolId({currency0: token0,currency1: token1, fee: swapFee, tickSpacing,hooks:  HookAddress});
        setPoolKeyHash(id);
      } catch (error) {
        console.error('Error calculating pool ID:', error);
        setPoolKeyHash('');
      }
    } else {
      setPoolKeyHash('');
    }
  }, [token0, token1, swapFee, tickSpacing, HookAddress]);
  

  const handleMaxClick = () => {
    if(token0.toLowerCase() === MockFUSDAddress.toLowerCase()) setAmount(MockFUSDBalanceState.toString());
    if(token0.toLowerCase() === MockUSDTAddress.toLowerCase()) setAmount(MockUSDTBalanceState.toString());
  };
  

  return (
    
    
    <div className="flex justify-center items-center min-h-screen">
      <div className="card w-96 bg-neutral shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Swap Tokens</h2>
          
          <div className="card  bg-base-300 shadow-xl p-4">
            <h2 className="card-title text-lg font-bold mb-2 justify-center">Pool Key Hash:</h2>
            <p className="bg-base-200 p-2 rounded break-all">{poolKeyHash}</p>
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Token 1 Balance: {formatBigIntToDecimal(MockFUSDBalanceState).toString()}</span>
            </label>
            
            <select 
              className="select select-bordered"
              value={token0}
              onChange={(e) => setToken0(e.target.value)}
            >
              <option disabled defaultValue={"SelectToken"}>Select token</option>
              <option value={MockFUSDAddress}>mFUSD</option>
              <option value={MockUSDTAddress}>mUSDT</option>
              {/* Add more token options */}
            </select>
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Token 2 Balance: {formatBigIntToDecimal(MockUSDTBalanceState).toString()}</span>
            </label>
           
            <select 
              className="select select-bordered"
              value={token1}
              onChange={(e) => setToken1(e.target.value)}
            >
              <option disabled defaultValue={"SelectToken"}>Select token</option>
              <option value={MockUSDTAddress}>mUSDT</option>
              <option value={MockFUSDAddress}>mFUSD</option>

              {/* Add more token options */}
            </select>
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Tick Spacing </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={tickSpacing}
              onChange={(e) => {
                const re = /^[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setTickSpacing(Number(e.target.value));
                }
              }} 
            />
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Fee Percent </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={swapFee}
              onChange={(e) => {
                const re = /^[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setSwapFee(Number(e.target.value));
                }
              }} 
            />
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <div className="flex items-center">
              <button className="btn btn-square" onClick={handleMaxClick}>Max</button>
              <input 
                type="text" 
                placeholder="0.0" 
                className="input input-bordered w-full" 
                value={formatEther(BigInt(Number(amount)))}
                onChange={(e) => {
                  const re = /^[0-9]*\.?[0-9]*$/;
                  if (e.target.value === '' || re.test(e.target.value)) {
                    setAmount(e.target.value);
                  }
                }} 
              />
            </div>
          </div>



          <div className="mb-4">
            <p className="bg-base-200 p-2 rounded break-all font-bold">Approval Status: {isToken0Approved ? 'Approved for Token 0' : 'Token 0 not Approved'} {isToken1Approved ? 'Approved for Token 1' : 'Token 1 not Approved'}</p>
          </div>
          
          {isNFTHolderState && (
          <div className="card-actions justify-end">
          
            <div className="flex justify-between w-full">
              <button className="btn btn-primary" onClick={approveToken0} disabled={isToken0Approved}>
                Approve Token 0
              </button>
              <button className="btn btn-secondary" onClick={approveToken1} disabled={isToken1Approved}>
                Approve Token 1
              </button>
              
            </div>
          </div>)}

          <div className="card-actions justify-center mt-4">
            {isNFTHolderState ? (
              <>
                {(isToken0Approved && !(token0.toLowerCase() < token1.toLowerCase())) && 
                  <button className="btn btn-primary" onClick={swap}>Swap</button>
                }
                {(isToken1Approved && (token0.toLowerCase() < token1.toLowerCase())) && 
                  <button className="btn btn-primary btn-wide" onClick={swap}>Swap</button>
                }
              </>
            ) : (
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>You need to be an NFT holder to swap tokens.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default SwapComponent;
