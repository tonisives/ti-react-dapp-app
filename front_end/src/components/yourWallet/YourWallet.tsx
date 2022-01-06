import { Avatar, Box, Tab } from "@material-ui/core"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import { useState } from "react"
import { Token } from "../Main"
import { StakeForm } from "./StakeForm"
import { UnstakeForm } from "./UnstakeForm"
import { WalletBalance } from "./WalletBalance"

interface YourWalletProps {
    supportedTokens: Array<Token>
}

export const YourWallet = ({ supportedTokens }: YourWalletProps) => {
    // setSelectedTokenIndex updates the selectedTokenIndex
    // useState saves state between renders(like jetpack compose)
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            bgcolor="background.paper"
            borderRadius="25px"
            boxShadow="5"
        >
            <h2>Stake tokens</h2>
            <TabContext value={selectedTokenIndex.toString()}>
                {/* list of tokens in the tab context */}
                <TabList onChange={handleChange} aria-label="stake form tabs">
                    {supportedTokens.map((token, index) => (
                        <Tab
                            label={token.name}
                            value={index.toString()}
                            key={index}
                            icon={<Avatar src={token.image} />} />
                    ))}
                </TabList>
                {supportedTokens.map((token, index) => {
                    return (
                        <TabPanel value={index.toString()} key={index}>
                            <Box
                                display="flex"
                                padding="20px"
                                height="250px"
                            >
                                <StakeForm token={token} />
                                <Box pr="80px" />
                                <UnstakeForm token={token} />
                            </Box>
                        </TabPanel>
                    )
                })}
            </TabContext>
        </Box>
    )
}