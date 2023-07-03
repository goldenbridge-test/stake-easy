import { Button, makeStyles } from "@material-ui/core"
import { useEthers } from "@usedapp/core"
import logo from '../assets/logo.svg';
import easy from '../assets/easy.png';
// import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1)
  },
}))

export const Header = () => {
  const classes = useStyles()

  const { account, activateBrowserWallet, deactivate } = useEthers()

  const isConnected = account !== undefined

  return (
    <nav>
      <ul className='nav__links'>
        <li><a href="#">Labs</a></li>
        <li><a href="#">Academy</a></li>
        <li><a href="#">Research</a></li>
        <li><a href="#">Join us</a></li>
      </ul>

      <div className='nav__brand'>
        <img src={easy} alt="Logo" />
        {/* <h1>stakeEasy</h1> */}
      </div>
      
      <div className={classes.container}>
        {isConnected ? (
          <>
            <Button color="primary" variant="contained">
              {`${account?.slice(0, 4)}...${account?.slice(-3)}`}
            </Button>
            <Button variant="contained" onClick={deactivate}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            color="primary"
            variant="contained"
            onClick={() => activateBrowserWallet()}
          >
            Connect
          </Button>
        )}
      </div>
    </nav>
  )
}