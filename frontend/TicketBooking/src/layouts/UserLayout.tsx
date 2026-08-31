import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";
import UserAvatarMenu from "../components/UserAvatarMenu";
import AuthButtons from "../components/AuthButtons";
import { APP_ROUTES } from "../constants/appRoutes";

function UserLayout() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );

  const { isAuthenticated, loading } = useAuth();

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" sx={{ bgcolor: "#ECEFF1" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box component="img" src="/logo.png" sx={{ height: 40, mr: 2 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href={APP_ROUTES.HOME}
              sx={{
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            ></Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
              ></Menu>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }} />
            <Box sx={{ flexGrow: 0 }}>
              {loading ? null : isAuthenticated ? (
                <UserAvatarMenu />
              ) : (
                <AuthButtons />
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default UserLayout;
