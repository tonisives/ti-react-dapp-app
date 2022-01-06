import { makeStyles } from "@material-ui/core"

interface BalanceMsgProps {
    label: string,
    tokenBalance: number,
}
const useStyles = makeStyles((theme) => ({
    container: {
        display: "inline-grid",
        gridTemplateColumns: "auto auto auto",
        gap: theme.spacing(1),
        alignItems: "center",
    },
    amount: {
        fontWeight: 700,
    }
}))

export const BalanceMsg = (props: BalanceMsgProps) => {
    const classes = useStyles()

    return (<div>
        <div className={classes.container}>
            <div>{props.label}</div>
            <div className={classes.amount}>{props.tokenBalance}</div>
        </div>
    </div>)
}