import { Box, Button, CircularProgress, Input, Snackbar } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { useNotifications } from "@usedapp/core"
import { utils } from "ethers"
import { useEffect, useState } from "react"
import { approveTxName, stakeTxName, useStakeTokens } from "../../hooks/useStakeTokens"
import { Token } from "../Main"
import { WalletBalance } from "./WalletBalance"

interface StakeFormProps {
    token: Token
}

export const StakeForm = ({ token }: StakeFormProps) => {
    const { address: tokenAddress, name } = token
    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const { notifications } = useNotifications()

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
    }

    const { approveAndStake, stakeState, approveState } = useStakeTokens(tokenAddress)

    const isMining = stakeState.status === "Mining" || approveState.status === "Mining"
    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] = useState(false)
    const [showStakeTokenSuccess, setStakeTokenSuccess] = useState(false)
    const [showError, setShowError] = useState(false)

    const handleCloseSnack = () => {
        setShowErc20ApprovalSuccess(false)
        setStakeTokenSuccess(false)
        setShowError(false)
    }

    const handleStakeClick = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveAndStake(amountAsWei)
    }

    // useEffect when something changes with the contract notification
    useEffect(() => {
        // follow approve erc20 and tx succeded
        if (notifications.filter((notification) =>
            notification.type === "transactionSucceed" &&
            notification.transactionName === approveTxName).length > 0) {
            setShowErc20ApprovalSuccess(true)
            setStakeTokenSuccess(false)
            setShowError(false)
        }

        if (notifications.filter((notification) =>
            notification.type === "transactionSucceed" &&
            notification.transactionName === stakeTxName).length > 0) {
            setShowErc20ApprovalSuccess(false)
            setStakeTokenSuccess(true)
            setShowError(false)
        }

        if (notifications.filter((notification) =>
            notification.type === "transactionFailed" &&
            (notification.transactionName === stakeTxName ||
                notification.transactionName === approveTxName)).length > 0
        ) {
            setShowErc20ApprovalSuccess(false)
            setStakeTokenSuccess(false)
            setShowError(true)
        }

    }, [notifications, showErc20ApprovalSuccess, showStakeTokenSuccess])

    return (
        <Box display="flex" justify-content="space-between" flexDirection="column">
            <Box
                display="flex"
                justifyContent="center"
                flex="1">
                <WalletBalance token={token} labelString={"Wallet balance:"} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
                <Input style={{ width: 200 }} onChange={handleInputChange} />
                <Box m={1} />
                <Button
                    style={{ width: 200 }}
                    onClick={handleStakeClick}
                    color="primary"
                    size="large"
                    variant="contained"
                    disabled={isMining}>

                    {isMining ? <CircularProgress size={26} /> : "Stake"}
                </Button>
            </Box>
            <Snackbar
                open={showErc20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 token transfer approved! Now approve the second transaction.
                </Alert>
            </Snackbar>

            <Snackbar
                open={showStakeTokenSuccess}
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