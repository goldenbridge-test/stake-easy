import React from "react"
import { Header } from "./features/Header"
import { Main } from "./features/Main"
import { ChainId, DAppProvider } from "@usedapp/core"
import { Container, AppBar, Toolbar, Typography, Link } from "@material-ui/core"


const Navbar = () => {
  return (
    <AppBar position="static" className="transparent">
      <Toolbar>
        <Typography variant="h6">
          <Link href="/features/Team" color="inherit">
            About us
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  )
}


export const App = () => {
  return (
    <DAppProvider config={{
      supportedChains: [ChainId.Kovan, ChainId.Rinkeby],
      notifications: {
        expirationPeriod: 1000,
        checkInterval: 1000
      }
    }}>
      
      <Header />
      <Navbar />
      <Container maxWidth="md">
        <Main />
      </Container>
    </DAppProvider>
  )
}
export default App
