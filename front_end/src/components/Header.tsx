import { useEthers } from "@usedapp/core"
import { Box, Button, FormControlLabel, Switch } from "@material-ui/core"
import { AppProps } from ".."

export const Header: React.FC<AppProps<boolean>> = ({ theme }) => {
    // variable
    const { account, activateBrowserWallet, deactivate } = useEthers();

    // if account is defined, user is connected
    const isConnected = account !== undefined

    // connect/disconnect button
    return (
        <Box
            sx={{ justifyContent: 'space-between', p: 3 }}
            display="flex"
            alignItems="center"
            flexDirection="row">
            <h1>Dapp App</h1>
            <Box display="flex" flexDirection="column" alignItems="right">
                <Box display="flex" width="220px">
                    <Box display="flex" pr="10px" alignItems="center">Kovan</Box>
                    {isConnected ? (
                        <Button style={{ width: 200 }} color="primary" variant="contained"
                            onClick={deactivate}>
                            Disconnect
                        </Button>
                    ) : (
                        <Button style={{ width: 200 }} color="primary" variant="contained"
                            onClick={() => activateBrowserWallet()}>
                            Connect
                        </Button>
                    )
                    }
                </Box>
                <FormControlLabel control={
                    <Switch checked={theme[0]} onChange={() => theme[1](!theme[0])} />
                } label="Dark theme" labelPlacement="start"/>

            </Box>
        </Box>
    )
} 