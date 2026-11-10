import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((_theme) => ({
  container: {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    gridTemplateRows: "150px"
  },
}));

export const ConnectionRequiredMsg = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography variant="h6" component="span">
        Please connect your Metamask account
      </Typography>
    </div>
  );
};
