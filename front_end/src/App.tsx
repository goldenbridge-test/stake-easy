import React from "react";
import { Header } from "./features/Header"
import { Main } from "./features/Main"
import  Social  from "./features/Social"
import  Footer  from "./features/Footer"
import { DAppProvider, ChainId, useEtherBalance, useEthers, Config } from "@usedapp/core"
import { Container } from "@material-ui/core"
import Projects from "./features/Projects"
import PublicTestnet from "./features/PublicTestnet"
import Roadmap from "./features/Roadmap"

export const App = () => {
  
  return (
    <DAppProvider config={{
      supportedChains: [ ChainId.Kovan, ChainId.Ropsten, ChainId.Goerli, ChainId.BSCTestnet, 1337 ],
      notifications: {
        expirationPeriod: 1000,
        checkInterval: 1000
      }
    }}>
      <Header/>
      <Container maxWidth="md">
        <Main />
      </Container>
      <PublicTestnet/>
      <Projects/>
      <Roadmap/>
      <Social/>
      <Footer/>
    </DAppProvider>
  )
}
export default App
