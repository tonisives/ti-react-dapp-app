import { useContractFunction, useEthers, useTokenAllowance } from "@usedapp/core"
import { BigNumber, constants, Contract, utils } from "ethers"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import ERC20 from "../chain-info/contracts/RandomERC20.json"
import networkMapping from "../chain-info/deployments/map.json"
import { useEffect, useState } from "react"

export const approveTxName = "Approve ERC20 transfer"
export const stakeTxName = "Stake tokens"
export const maxAllowance = constants.MaxUint256

/**
 * Approve tokens if not already approved and the stake the tokens
 * @param tokenAddress 
 * @returns 
 */
export const useStakeTokens = (tokenAddress: string) => {
    const { chainId, account } = useEthers()
    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    // any erc20 child is fine for the abi
    const erc20Abi = ERC20.abi
    const erc20Interface = new utils.Interface(erc20Abi)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)

    const { send: approveSend, state: approveState } = useContractFunction(
        erc20Contract, "approve", { transactionName: approveTxName }
    )

    const { send: stakeTokensSend, state: stakeState } = useContractFunction(
        tokenFarmContract,
        "stakeTokens",
        { transactionName: stakeTxName }
    )

    // listen for the approved amount
    const [amountToStake, setAmountToStake] = useState(BigNumber.from(0))
    const allowance = useTokenAllowance(tokenAddress, account ?? "0", tokenFarmAddress)

    const approveAndStake = (amount: BigNumber = maxAllowance) => {
        setAmountToStake(amount)
        if (allowance?.lt(amount)) {
            approveSend(tokenFarmAddress, maxAllowance.toString())
        }
        else {
            // dont need to approve
            approveState.status = "Success"
        }
    }

    useEffect(() => {
        if (approveState.status === "Success") {
            approveState.status = "None"
            // stake
            console.log("Approved ERC20 transfer")
            stakeTokensSend(amountToStake, tokenAddress)
            console.log(stakeState.status)
        }

        // if anything in this array changes, it will kick off the useEffect
    }, [approveState, amountToStake, tokenAddress])

    // return the approve function, so it can be called with the amount from the StakeForm
    return { approveAndStake, approveState, stakeState }
} 