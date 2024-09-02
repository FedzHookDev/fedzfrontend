import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useContractWrite, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {PoolSwapTestAddress, HookAddress, MockFUSDAddress, MockUSDTAddress, PoolModifyLiquidityTestAddress} from "../contractAddress";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json"
import { getPoolId } from '../misc/v4helpers';


const LiquidityComponent = () => {
  const [poolKeyHash, setPoolKeyHash] = useState('');
  const [token0, setToken0] = useState('');
  const [token1, setToken1] = useState('');
  const [amount, setAmount] = useState('');
  const [tickSpacing, setTickSpacing] = useState(60);
  const [swapFee, setSwapFee] = useState("4000");
  const [tickLower, setTickLower] = useState(-(BigInt(tickSpacing) * BigInt(10)));
  const [tickUpper, setTickUpper] = useState((BigInt(tickSpacing) * BigInt(10)))

  const [isApproved, setIsApproved] = useState(false);
  const [hookData, setHookData] = useState<string>("0000000000000000000000000000000000000000"); // New state for custom hook data
  const [swapError, setSwapError] = useState();


  const MIN_SQRT_PRICE_LIMIT = BigInt("4295128739") + BigInt("1");
  const MAX_SQRT_PRICE_LIMIT = BigInt("1461446703485210103287273052203988822378723970342") - BigInt("1");


  const { data: writewriteLiquidityData, error: writeLiquidityError, isPending: isLiquidityPending, writeContract: writeModifyLiquidity } = useWriteContract();
  const { data: writeApprove0Data, error: writeApprove0Error, isPending: isApprove0Pending, writeContract: writeApproveToken0Contract } = useWriteContract();
  const { data: writeApprove1Data, error: writeApprove1Error, isPending: isApprove1Pending, writeContract: writeApproveToken1Contract } = useWriteContract();



  const { address } = useAccount();

  
  const { data: token0Allowance } = useReadContract({
    address: MockFUSDAddress,
    abi: MockERC20Abi,
    functionName: 'allowance',
    args: [address, PoolModifyLiquidityTestAddress], 
  });


  const { data: token1Allowance } = useReadContract({
    address: MockUSDTAddress,
    abi: MockERC20Abi,
    functionName: 'allowance',
    args: [address, PoolModifyLiquidityTestAddress], 
  });

  useEffect(() => {
    if (token0Allowance > amount && token1Allowance > amount) {
      setIsApproved(true);
    } else {
      setIsApproved(false);
    }
  }, [token0Allowance, token1Allowance, amount]);

  const approveToken0 = async () => {

    try {
      await writeApproveToken0Contract({
        address: MockFUSDAddress,
        abi: MockERC20Abi,
        functionName: 'approve',
        args: [PoolModifyLiquidityTestAddress, parseEther(amount)]
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
        args: [PoolModifyLiquidityTestAddress, parseEther(amount)]
      });
    } catch (err) {
        console.log(err)   
  }
  };

 


  const modifyLiquidity = async () => {
    try {
      const result = await writeModifyLiquidity({
        address: PoolModifyLiquidityTestAddress,
        abi : PoolModifiyLiquidityAbi,
        functionName: "modifyLiquidity",
        args: [
          {
            currency0: token0 < token1 ? token0 : token1,
            currency1: token0 < token1 ? token1 : token0,
            fee: Number(swapFee),
            tickSpacing: Number(tickSpacing),
            hooks: HookAddress,
          },
          {
            tickLower: Number(tickLower),
            tickUpper: Number(tickUpper),
            liquidityDelta: parseEther(amount),
            salt : `0x0000000000000000000000000000000000000000000000000000000000000000`,
          },
          hookData || "0x00",
        ],
      });
      console.log('Swap transaction sent:', result);
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

  
  

  return (
    
    
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Add Liquidity</h2>
          
          <div className="mb-4">
            <p className="text-sm">Pool Key Hash: {poolKeyHash}</p>
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Token 1</span>
            </label>
            <select 
              className="select select-bordered"
              value={token0}
              onChange={(e) => setToken0(e.target.value)}
            >
              <option disabled defaultValue={"SelectToken"}>Select token</option>
              <option value={MockFUSDAddress}>mFUSD</option>
              <option value={MockUSDTAddress}>mFUSDT</option>
              {/* Add more token options */}
            </select>
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Token 2</span>
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
                  setTickSpacing((e.target.value));
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
                  setSwapFee(Number((e.target.value)));
                }
              }} 
            />
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Tick Lower </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={amount}
              onChange={(e) => {
                const re = /^[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setTickLower(BigInt(e.target.value));
                }
              }} 
            />
          </div>


          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Tick Upper </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={amount}
              onChange={(e) => {
                const re = /^[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setTickUpper(BigInt(e.target.value));
                }
              }} 
            />
          </div>

          

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Amount </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={amount}
              onChange={(e) => {
                const re = /^[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setAmount(e.target.value);
                }
              }} 
            />
          </div>


          <div className="mb-4">
            <p className="text-sm">Approval Status: {isApproved ? 'Approved' : 'Not Approved'}</p>
          </div>

          <div className="card-actions justify-end">
            {isApproved ? <></> : 
            <div>
              <button onClick={approveToken0}>
                Approve Token0
              </button>
              <button onClick={approveToken1}>
                Approve Token1
              </button>
              
            </div>}
          </div>

          <div className="card-actions justify-end">
            {isApproved ? <button className="btn btn-primary" onClick={modifyLiquidity}>Add Liquidity</button> : <div>Approve Tokens First</div>}
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default LiquidityComponent;
