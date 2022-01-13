import { useContractFunction, useEthers } from "@usedapp/core"
import { constants, Contract, utils } from "ethers"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import networkMapping from "../chain-info/deployments/map.json"
export const unstakeTxName = "Unstake tokens"

/**
 * Approve tokens if not already approved and the stake the tokens
 * @param tokenAddress 
 * @returns 
 */
export const useUnstakeTokens = (tokenAddress: string) => {
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    const { send: unstakeSend, state: unstakeState } = useContractFunction(
        tokenFarmContract,
        "unstakeTokens",
        { transactionName: unstakeTxName },
    )

    return { unstakeSend, unstakeState }
} 