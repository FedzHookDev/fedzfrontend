import { useAccount, useContractRead } from 'wagmi'
import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'

import { TimeSlotSystemAddress } from '../contractAddress'
import TimeSlotSystemAbi from '../abi/TimeSlotSystem_abi.json'

export default function ActionWindow() {
  const { address, isConnected } = useAccount()
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)

  const { data, isError, isLoading } = useContractRead({
    address: TimeSlotSystemAddress,
    abi: TimeSlotSystemAbi,
    functionName: 'getNextActionWindow',
    args: [address],
  })

  useEffect(() => {
    if (data) {
      const [start, end] = data
      setStartTime(new Date(Number(formatUnits(start, 0)) * 1000))
      setEndTime(new Date(Number(formatUnits(end, 0)) * 1000))
    }
  }, [data])

  if (!isConnected) {
    return (
      <div className="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>Please connect your wallet to see your action window.</span>
      </div>
    )
  }

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>You are not a registered Player !</span>
      </div>
    )
  }

  return (
    <div className="card w-64 bg-base-300 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Your Action Window</h2>
        {startTime && endTime ? (
          <div>
            <p>Start: {startTime.toLocaleString()}</p>
            <p>End: {endTime.toLocaleString()}</p>
          </div>
        ) : (
          <p>No action window available.</p>
        )}
      </div>
    </div>
  )
}
