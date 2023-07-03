/* eslint-disable spaced-comment */
/// <reference types="react-scripts" />
import React, { useEffect, useState } from "react"
import eth from "../assets/eth.png"
import gld from "../assets/gld.png"
import dai from "../assets/dai.png"
import { YourWallet } from "./yourWallet"
import { TokenFarmContract } from "./tokenFarmContract"
import { useEthers } from "@usedapp/core"
import { constants } from "ethers"
import GoldenToken from "../chain-info/GoldenToken.json"
import { Snackbar, Typography, makeStyles } from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"
import networkMapping from "../chain-info/map.json"
import brownieConfig from "../brownie-config-json.json"
import helperConfig from "../helper-config.json"
// import Projects from "./Projects"

export type Token = {
  image: string
  address: string
  name: string
}

// Why not in a css folder? 
// For material UI
// https://material-ui.com/styles/basics/
const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.common.white,
    textAlign: "center",
    padding: theme.spacing(4),
  },
}))


export const Main = () => {
  const { chainId, error } = useEthers()

  const classes = useStyles()
  const networkName = chainId ? helperConfig[chainId] : "ganache"
  console.log(typeof chainId)
  console.log(networkName)
  // We need to pull the Golden token address from the .json file written to by Brownie
  const goldenTokenAddress = chainId ? networkMapping[String(chainId)]["GoldenToken"][0] : constants.AddressZero
  const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
  const fauTokenAddress = chainId ? brownieConfig["networks"][networkName]["fau_token"] : constants.AddressZero
  console.log(goldenTokenAddress)
  console.log(wethTokenAddress)
  /**
   * Our single central location to store info on support tokens.
   * This is the only place you'll need to add a new token to get it to display in the UI!
   * 
   * Modularize the addresses like with `goldenTokenAddress`
   * To make it chain agnostic
   */
  const supportedTokens: Array<Token> = [
    {
      image: eth,
      address: wethTokenAddress,
      name: "WETH",
    },
    {
      image: dai,
      address: fauTokenAddress,
      name: "FAU",
    },
    {
      image: gld,
      address: goldenTokenAddress,
      name: "GLD",
    },
  ]

  const [showNetworkError, setShowNetworkError] = useState(false)

  const handleCloseNetworkError = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return
    }

     showNetworkError && setShowNetworkError(false)
  }

  /**
   * useEthers will return a populated 'error' field when something has gone wrong.
   * We can inspect the name of this error and conditionally show a notification
   * that the user is connected to the wrong network.
   */
  useEffect(() => {
    if (error && error.name === "UnsupportedChainIdError") {
      !showNetworkError && setShowNetworkError(true)
    } else {
      showNetworkError && setShowNetworkError(false)
    }
  }, [error, showNetworkError])

  return (
    <>
      <Typography
        variant="h2"
        component="h1"
        classes={{
          root: classes.title,
        }}
      >
        Easy Token Farm
      </Typography>
      <YourWallet supportedTokens={supportedTokens} />
      <TokenFarmContract supportedTokens={supportedTokens} />
      <Snackbar
        open={showNetworkError}
        autoHideDuration={5000}
        onClose={handleCloseNetworkError}
      >
        <Alert onClose={handleCloseNetworkError} severity="warning">
          You gotta connect to the BSCTestnet, Ropsten or Goerli network! Mainnet comimg soon !!!
        </Alert>
      </Snackbar>
      {/* <Projects/> */}
      <div className='testnet'>
         <h2> Gain Early Access to Golden Public testnet </h2>
              <p >
                We are excited to announce the early access Pass to the upcoming Golden Public Testnet !
                The launch of the Golden public testnet will mark another important milestone on the road to successfully
                launching the Golden Mainnet, and you have a chance to be one of the very first to engage with it. You can earn 
                an Early Pass by completing all the current tasks in the golden Waitlist page. Act fast before the eligibility 
                period is over!
              </p>
      </div>
    </>
  )
}
