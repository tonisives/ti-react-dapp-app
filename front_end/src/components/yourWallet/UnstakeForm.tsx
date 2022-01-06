import { Box, Button, CircularProgress, Input, Paper, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useNotifications } from "@usedapp/core";
import { formatUnits } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { unstakeTxName, useStakingBalance } from "../../hooks/useStakingBalance";
import { useUnstakeTokens } from "../../hooks/useUnstakeTokens";
import { BalanceMsg } from "../BalanceMsg";
import { Token } from "../Main";

interface UnstakeFormProps {
    token: Token
}

export const UnstakeForm = ({ token }: UnstakeFormProps) => {
    const { address: tokenAddress, name } = token
    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const { notifications } = useNotifications()

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
        console.log(newAmount)
    }

    // TODO: show success/failed notifications
    const { unstakeSend, unstakeState } = useUnstakeTokens(tokenAddress)
    const isMining = unstakeState.status === "Mining"

    const handleUnstakeClick = () => {
        return unstakeSend(tokenAddress)
    }

    const [showUnstakeTokenSuccess, setUnstakeTokenSuccess] = useState(false)
    const [showError, setShowError] = useState(false)

    // useEffect when something changes with the contract notification
    useEffect(() => {
        // follow approve erc20 and tx succeded
        if (notifications.filter((notification) =>
            notification.type === "transactionSucceed" &&
            notification.transactionName === unstakeTxName).length > 0) {
            setUnstakeTokenSuccess(false)
            setShowError(false)
        }

        if (notifications.filter((notification) =>
            notification.type === "transactionFailed" &&
            (notification.transactionName === unstakeTxName)).length > 0
        ) {
            setUnstakeTokenSuccess(false)
            setShowError(true)
        }
    }, [notifications, showUnstakeTokenSuccess, showError])

    const stakingBalance = useStakingBalance(tokenAddress)
    const formattedBalance: number = stakingBalance ? parseFloat(formatUnits(stakingBalance, 18)) : 0

    const handleCloseSnack = () => {
        setUnstakeTokenSuccess(false)
        setShowError(false)
    }

    return (
        <Box display="flex" justify-content="space-between" flexDirection="column" >
            <Box flex="1">
                <BalanceMsg
                    label={"Staking balance:"}
                    tokenBalance={formattedBalance}
                />
            </Box>
            <Button
                style={{ width: 200, height: 50, margin: "auto" }}
                onClick={handleUnstakeClick}
                color="primary"
                size="large"
                variant="contained"
                disabled={isMining || stakingBalance?.eq(0)}>
                {isMining ? <CircularProgress size={26} /> : "unstake all"}
            </Button>

            <Snackbar
                open={showUnstakeTokenSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    Tokens staked!
                </Alert>
            </Snackbar>

            <Snackbar
                open={showError}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="error">
                    Transaction error!
                </Alert>
            </Snackbar>
        </Box>
    )
}