import { useAccount, useReadContract } from 'wagmi'
import { useEffect, useState } from 'react'

import { TimeSlotSystemAddress } from '../contractAddress'
import TimeSlotSystemAbi from '../abi/TimeSlotSystem_abi.json'

export default function ActionWindow() {
  const { address, isConnected } = useAccount()
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [remainingTime, setRemainingTime] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)

  const { data, isError, isLoading } = useReadContract({
    address: TimeSlotSystemAddress,
    abi: TimeSlotSystemAbi,
    functionName: 'getNextActionWindow',
    args: [address],
  })

  useEffect(() => {
    if (data) {
      const [start, end] = data as [bigint, bigint]
      const startDate = new Date(Number(start) * 1000)
      const endDate = new Date(Number(end) * 1000)
      setStartTime(startDate)
      setEndTime(endDate)
    }
  }, [data])

  useEffect(() => {
    if (startTime && endTime) {
      const interval = setInterval(() => {
        const now = new Date()
        let diff: number
        if (now < startTime) {
          diff = startTime.getTime() - now.getTime()
        } else if (now < endTime) {
          diff = endTime.getTime() - now.getTime()
        } else {
          diff = 0
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setRemainingTime({ days, hours, minutes, seconds })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime, endTime])

  const getTimerColor = () => {
    if (!startTime || !endTime || !remainingTime) return 'bg-gray-500'
    const totalDuration = endTime.getTime() - startTime.getTime()
    const elapsedTime = totalDuration - (remainingTime.days * 86400000 + remainingTime.hours * 3600000 + remainingTime.minutes * 60000 + remainingTime.seconds * 1000)
    const elapsedPercentage = elapsedTime / totalDuration
    if (elapsedPercentage < 0.5) return 'bg-green-500'
    if (elapsedPercentage < 0.75) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!isConnected) {
    return (
      <div className="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
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
        <span>You are not a registered Player!</span>
      </div>
    )
  }

  return (
    <div className="card flex bg-base-300 shadow-xl">
      <div className="card-body ">
        <h2 className="card-title">Your Action Window</h2>
        {startTime && endTime && remainingTime ? (
          <div>
            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-base-content/70">Start:</span>
                  <span className="badge badge-success">
                    {startTime.toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-base-content/70">End:</span>
                  <span className="badge badge-warning">
                    {endTime.toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

            <h2 className="card-title">Remaining Time</h2>

            <div className="grid grid-flow-col gap-4 text-center auto-cols-max pt-4">
              <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                <span className="countdown font-mono text-3xl">
                  <span style={{"--value": remainingTime.days} as React.CSSProperties}></span>
                </span>
                days
              </div>
              <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                <span className="countdown font-mono text-3xl">
                  <span style={{"--value": remainingTime.hours} as React.CSSProperties}></span>
                </span>
                hours
              </div>
              <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                <span className="countdown font-mono text-3xl">
                  <span style={{"--value": remainingTime.minutes} as React.CSSProperties}></span>
                </span>
                min
              </div>
              <div className={`flex flex-col p-2 ${getTimerColor()} rounded-box text-white`}>
                <span className="countdown font-mono text-3xl">
                  <span style={{"--value": remainingTime.seconds} as React.CSSProperties}></span>
                </span>
                sec
              </div>
            </div>
          </div>
        ) : (
          <p>No action window available.</p>
        )}
      </div>
    </div>
  )
}
