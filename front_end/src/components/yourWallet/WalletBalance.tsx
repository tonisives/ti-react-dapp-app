import { useEthers, useTokenBalance } from "@usedapp/core"
import { formatUnits } from "ethers/lib/utils"
import { Token } from "../Main"
import { BalanceMsg } from "../BalanceMsg"

export interface WalletBalanceProps {
    token: Token,
    labelString: string
}

export const WalletBalance = ({ token, labelString }: WalletBalanceProps) => {
    const { address } = token
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(address, account)
    const formattedBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0
    return (<BalanceMsg
        label={labelString}
        tokenBalance={formattedBalance}
    />)
}