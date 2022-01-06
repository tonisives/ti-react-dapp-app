// Stake and unstake functions
import { useEthers } from "@usedapp/core"
import helperConfig from "../helper-config.json"
import brownieConfig from "../brownie-config.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants } from "ethers"

import dapp from "../res/dapp.png"
import dai from "../res/dai.png"
import eth from "../res/eth.png"
import { YourWallet } from "./yourWallet/YourWallet"
import { Box } from "@material-ui/core"

export type Token = {
    image: string
    address: string
    name: string
}

export const Main = () => {
    // Show token values from the wallet
    // Get the address of different tokens
    // Get the balance of the users wallet 
    const { chainId, error } = useEthers()
    const networkName = chainId ? helperConfig[chainId] : "dev"

    // const dappTokenAddress ??
    console.log(chainId)
    console.log(networkName)

    const dappTokenAddress = chainId ? networkMapping[String(chainId)]["DappToken"]
    [0] : constants.AddressZero
    const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
    const daiTokenAddress = chainId ? brownieConfig["networks"][networkName]["fau_token"] : constants.AddressZero

    const supportedTokens: Array<Token> = [
        {
            image: dapp,
            address: dappTokenAddress,
            name: "DAPP"
        },
        {
            image: dai,
            address: daiTokenAddress,
            name: "FAU"
        },
        {
            image: eth,
            address: wethTokenAddress,
            name: "WETH"
        }
    ]

    return (
        <Box>
            <YourWallet supportedTokens={supportedTokens} />
        </Box>
    )
}