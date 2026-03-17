import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";

const theme = createTheme();

export default function Authentication() {

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleLogin, handleRegister } = React.useContext(AuthContext);

  const handleAuth = async (e) => {
    e.preventDefault();

    try {

      if (formState === 0) {
        // Login
        let result = await handleLogin(username, password);
        setMessage(result);
        setOpen(true);
      }

      if (formState === 1) {
        // Register
        let result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
        setUsername("");
      }

      setError("");

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: "flex", height: "100vh" }}>

        {/* Image Section */}
        <Box
          sx={{
            flex: 7,
            backgroundImage: "url(/background.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        />

        {/* Login Section */}
        <Paper
          elevation={6}
          square
          sx={{
            flex: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Box sx={{ width: 350 }}>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar sx={{ m: 1 }}>
                <LockOutlinedIcon />
              </Avatar>

              <div>
                <Button
                  variant={formState === 0 ? "contained" : "outlined"}
                  onClick={() => setFormState(0)}
                >
                  Sign In
                </Button>

                <Button
                  variant={formState === 1 ? "contained" : "outlined"}
                  onClick={() => setFormState(1)}
                >
                  Sign Up
                </Button>
              </div>

            </Box>

            <Box component="form" sx={{ mt: 2 }} onSubmit={handleAuth}>

              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{ color: "red" }}>{error}</p>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>

            </Box>
          </Box>
        </Paper>

      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />

    </ThemeProvider>
  );
}