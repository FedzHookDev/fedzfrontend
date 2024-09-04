import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useContractWrite, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {PoolSwapTestAddress, HookAddress, MockFUSDAddress, MockUSDTAddress, PoolModifyLiquidityTestAddress} from "../contractAddress";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import PoolModifiyLiquidityAbi from "../abi/PoolModifyLiquidityTest_abi.json"
import { getPoolId } from '../misc/v4helpers';


const LiquidityComponent = () => {
  const [poolKeyHash, setPoolKeyHash] = useState('');
  const [token0, setToken0] = useState(MockFUSDAddress);
  const [token1, setToken1] = useState(MockUSDTAddress);
  const [amount, setAmount] = useState('1');
  const [tickSpacing, setTickSpacing] = useState(60);
  const [swapFee, setSwapFee] = useState("4000");
  const [tickLower, setTickLower] = useState<Number>(tickSpacing);
  const [tickUpper, setTickUpper] = useState<Number>(tickSpacing);

  const [isApproved, setIsApproved] = useState(false);
  const [hookData, setHookData] = useState<`0x${string}`>("0x0"); // New state for custom hook data
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
    if (token0Allowance != null && token1Allowance != null && amount != null) {
      try {
        const amountBigInt = BigInt(amount);
        const token0AllowanceBigInt = BigInt(token0Allowance.toString());
        const token1AllowanceBigInt = BigInt(token1Allowance.toString());
        
        const isApproved = token0AllowanceBigInt >= amountBigInt && token1AllowanceBigInt >= amountBigInt;
        setIsApproved(isApproved);
      } catch (error) {
        console.error('Error converting values to BigInt:', error);
        setIsApproved(false);
      }
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
          hookData ,
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
        const id = getPoolId({currency0: token0,currency1: token1, fee: Number(swapFee), tickSpacing,hooks:  HookAddress});
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
    
    
    <div className="flex justify-center items-center min-h-screen ">
      <div className="card w-96 bg-neutral shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Add Liquidity</h2>
          
          <div className="card  bg-base-300 shadow-xl p-4">
            <h2 className="card-title text-lg font-bold mb-2 justify-center">Pool Key Hash:</h2>
            <p className="bg-base-200 p-2 rounded break-all">{poolKeyHash}</p>
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
              <option value={MockUSDTAddress}>mUSDT</option>
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
                  setSwapFee(((e.target.value)));
                }
              }} 
            />
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Tick Lower</span>
            </label>
            <div className="flex items-center">
              <button 
                className="btn btn-square btn-sm"
                onClick={() => {
                  const newValue = (tickLower as number) - tickSpacing;
                  setTickLower(newValue);
                }}
              >
                -
              </button>
              <input 
                type="text" 
                placeholder="-100" 
                className="input input-bordered w-full mx-2" 
                value={tickLower.toString()}
                onChange={(e) => {
                  const re = /^[-+]?[0-9]*$/;
                  if (e.target.value === '' || re.test(e.target.value)) {
                    setTickLower(e.target.value === '' ? 0 : parseInt(e.target.value, 10));
                  }
                }} 
              />
              <button 
                className="btn btn-square btn-sm"
                onClick={() => {
                  const newValue = (tickLower as number) + tickSpacing;
                  setTickLower(newValue);
                }}
              >
                +
              </button>
            </div>
            {(tickLower as number) % tickSpacing !== 0 && (
              <label className="label">
                <span className="label-text-alt text-error">Tick Lower must be divisible by {tickSpacing}</span>
              </label>
            )}
          </div>


          <div className="form-control w-full max-w-xs mb-4">
              <label className="label">
                <span className="label-text">Tick Upper</span>
              </label>
              <div className="flex items-center">
                <button 
                  className="btn btn-square btn-sm"
                  onClick={() => {
                    const newValue = (tickUpper as number) - tickSpacing;
                    setTickUpper(newValue);
                  }}
                >
                  -
                </button>
                <input 
                  type="text" 
                  placeholder="100" 
                  className="input input-bordered w-full mx-2" 
                  value={tickUpper.toString()}
                  onChange={(e) => {
                    const re = /^[-+]?[0-9]*$/;
                    if (e.target.value === '' || re.test(e.target.value)) {
                      setTickUpper(e.target.value === '' ? 0 : parseInt(e.target.value, 10));
                    }
                  }} 
                />
                <button 
                  className="btn btn-square btn-sm"
                  onClick={() => {
                    const newValue = (tickUpper as number) + tickSpacing;
                    setTickUpper(newValue);
                  }}
                >
                  +
                </button>
              </div>
              {(tickUpper as number) % tickSpacing !== 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">Tick Upper must be divisible by {tickSpacing}</span>
                </label>
              )}
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
                const re = /^[-+]?[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setAmount(e.target.value);
                }
              }} 
            />
          </div>

          <div className="mb-4">
            <p className="bg-base-200 p-2 rounded break-all font-bold">Approval Status: {isApproved ? 'Approved' : 'Not Approved'}</p>
          </div>

          <div className="card-actions justify-end">
            {isApproved ? <></> : 
            <div className="flex justify-between w-full">
            <button className="btn btn-primary" onClick={approveToken0}>
              Approve Token 0
            </button>
            <button className="btn btn-secondary" onClick={approveToken1}>
              Approve Token 1
            </button>
          </div>}
          </div>

          <div className="card-actions justify-center mt-4">
            {isApproved && <button className="btn btn-primary btn-wide" onClick={modifyLiquidity}>Modify Liquidity</button>}
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default LiquidityComponent;
