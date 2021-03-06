import { useContractCall, useEthers } from "@usedapp/core"
import { BigNumber, constants, utils } from "ethers"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import networkMapping from "../chain-info/deployments/map.json"

export const unstakeTxName = "Unstake tokens"

/**
 * Approve tokens if not already approved and the stake the tokens
 * @param tokenAddress 
 * @returns 
 */
export const useStakingBalance = (tokenAddress: string): BigNumber | undefined => {
    const { chainId, account } = useEthers()
    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)

    const [stakingBalance] = useContractCall({
        abi: tokenFarmInterface,
        address: tokenFarmAddress,
        method: "stakingBalance",
        args: [tokenAddress, account],
    }) ?? []

    return stakingBalance
} 