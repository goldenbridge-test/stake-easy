# defi-stake-yield-brownie

<br/>
<p align="center">
<a href="https://chain.link" target="_blank">
<img src="./web-image.png" width="500" alt="Full Stack Example">
</a>
</p>
<br/>

## Summary 
This is a repo to build your own full stack defi staking application for yield farming, borrowing and lending, or any other project you can think of. It allows you to:

- `stakeTokens`: Add any approved token to the farming contract for yeild farming, collateral, or whatever you want to do.
- `unStakeTokens`: Remove your tokens from the contract.
- `getUserTotalValue`: Get the total value that users have supplied based on calculations from the Chainlink Price Feeds. 
- `issueTokens`: Issue a reward to the users staking on your platform!

And more!

- [defi-stake-yield-brownie](#defi-stake-yield-brownie)
  - [Summary](#summary)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Useage](#useage)
  - [Scripts](#scripts)
  - [Front end](#front-end)
  - [Testing](#testing)
  - [Linting](#linting)
- [Resources](#resources)
- [License](#license)

## Prerequisites

Please install or have installed the following:

- [nodejs and npm](https://nodejs.org/en/download/)
- [python](https://www.python.org/downloads/)
## Installation

1. [Install Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html), if you haven't already. Here is a simple way to install brownie.

```bash
pip install --user pipx
pipx ensurepath
# restart your terminal
pipx install eth-brownie
```
Or if you can't get `pipx` to work, via pip (it's recommended to use pipx)
```bash
pip install eth-brownie
```

2. Clone this repo
```
git clone https://github.com/PatrickAlphaC/defi-stake-yield-brownie
cd defi-stake-yield-brownie
```

1. [Install ganache-cli](https://www.npmjs.com/package/ganache-cli)

```bash
npm install -g ganache-cli
```

If you want to be able to deploy to testnets, do the following. 

4. Set your environment variables

Set your `WEB3_INFURA_PROJECT_ID`, and `PRIVATE_KEY` [environment variables](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html). 

You can get a `WEB3_INFURA_PROJECT_ID` by getting a free trial of [Infura](https://infura.io/). At the moment, it does need to be infura with brownie. You can find your `PRIVATE_KEY` from your ethereum wallet like [metamask](https://metamask.io/). 

You'll also need testnet rinkeby or Kovan ETH and LINK. You can get LINK and ETH into your wallet by using the [rinkeby faucets located here](https://docs.chain.link/docs/link-token-contracts#rinkeby). If you're new to this, [watch this video.](https://www.youtube.com/watch?v=P7FX_1PePX0)

You'll also want an [Etherscan API Key](https://etherscan.io/apis) to verify your smart contracts. 

You can add your environment variables to the `.env` file:
```bash
export WEB3_INFURA_PROJECT_ID=<PROJECT_ID>
export PRIVATE_KEY=<PRIVATE_KEY>
export ETHERSCAN_TOKEN=<YOUR_TOKEN>
```
> DO NOT SEND YOUR KEYS TO GITHUB
> If you do that, people can steal all your funds. Ideally use an account with no real money in it. 

# Useage

## Scripts

```bash
brownie run scripts/deploy.py
```
This will deploy the contracts, depoly some mock Chainlink contracts for you to interact with.
```bash
brownie run scripts/deploy.py --network kovan
```
This will do the same thing... but on Kovan.

## Front end
```bash
cd front_end
yarn
yarn start
```
and you'll be able to interact with the UI

## Testing

```
brownie test
```

## Linting

```
pip install black 
pip install autoflake
autoflake --in-place --remove-unused-variables -r .
black .
```

# Resources

To get started with Brownie:

* [Chainlink Documentation](https://docs.chain.link/docs)
* Check out the [Chainlink documentation](https://docs.chain.link/docs) to get started from any level of smart contract engineering. 
* Check out the other [Brownie mixes](https://github.com/brownie-mix/) that can be used as a starting point for your own contracts. They also provide example code to help you get started.
* ["Getting Started with Brownie"](https://medium.com/@iamdefinitelyahuman/getting-started-with-brownie-part-1-9b2181f4cb99) is a good tutorial to help you familiarize yourself with Brownie.
* For more in-depth information, read the [Brownie documentation](https://eth-brownie.readthedocs.io/en/stable/).
* [Create React App](https://create-react-app.dev/docs/adding-typescript/) for front end fun
* [Materials-UI](https://material-ui.com/)

Shoutout to [Matt Durkin](https://twitter.com/mdurkin92) on twitter for creating the UI!
Shoutout to [Gregory from Dapp University](https://www.dappuniversity.com/) for the inspiration for this!

Any questions? Join our [Discord](https://discord.gg/2YHSAey) or open an issue. 

# License

This project is licensed under the [MIT license](LICENSE).


Pushing code to github

connecter et initialiser git

<!-- git init -b main  --> pour initialiser de git et creation de la branche main
<!-- git config --global user.name "Cryptoniciencom"  -->
<!-- git config --global user.email "cryptoniciens@gmail.com" -->
<!-- git status  --> voir le statut des fishier disponible à envoyer sur github

commit -how to

<!-- git add .  --> pour selectionner les fichier à envoyer sur github
<!-- git commit -m "first commit" --> faire un commit et mettre la raison de la modification apportée
<!-- git rm --cached <nameFile>   --> enlever un fishier accidentellement envoyer sur github eg: .env
<!-- git log  --> voir toute les modification

travailler avec les branches

<!-- git branch <namebranche> --> pour ajouter une branche
<!-- git checkout <namebranche>  --> pour transiter de brnache en brache
<!-- git merge <namebranche>   --> pour fusionner les branches apres tous les modifications
<!-- git branch -d <namebranche>  --> supprimer une branche
<!-- git branch -D <namebranche>  --> confirmer la suppression d'une branche
<!-- git diff   --> voir la difference entre le dernier commit et maintenant
<!-- git diff main..testnet --> difference entre deux branches
<!-- gitk --> pour afficher l'interface des commits

envoyer les fichiers sur un depot distant

<!-- git remote add origin https://github.com/Cryptoniciencom/easy-stake.git  --> pour ajouter notre repos local a github
<!-- git push -u origin main  --> pour le classer dans la branche main

PULL REQUESTS

<!-- git pull origin main  --> rappatrier tous les depots distants vers les depots locals des collaborateurs

GH-PAGES

<!-- git branch gh-pages --> pour ajouter une branche
<!-- git checkout gh-pages  --> pour transiter de brnache en brache
<!-- git push -u origin gh-pages  --> pour le classer dans la branche gh-pages et heberger. Aller dans setting pour trouver le lien

<!-- git remote -v  --> check the organization
<!-- git remote remove origin  --> remove the organization
git rm --cached .env


Network Name - Sepolia Test Netwok
RPC URL - https://eth-sepolia.g.alchemy.com/v2/[YOUR-API-KEY]
Chain ID - 11155111
Currency Symbol - SepoliaETH
Block Explorer URL - https://sepolia.etherscan.io/#   s t a k e - e a s y  
 