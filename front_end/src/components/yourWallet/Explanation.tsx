import { Box, Link } from "@material-ui/core"
import { Token } from "../Main"

interface ExplanationProps {
    token: Token
}

export const Explanation = ({ token }: ExplanationProps) => {
    const visible = token.name === "FAU" ? "flex" : "none"

    return (
        <Box display={visible} justifyContent="center">
            <p>Add FAU tokens at <Link href="https://erc20faucet.com/">erc20faucet.com</Link></p>
        </Box>
    )
}