import * as React from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";
import { useAuth } from "../hooks/auth/useAuth";
import { toast } from "react-toastify";
import { MESSAGES } from "../constants";

const settings = ["My Bookings", "Logout"];

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  return (first + last).toUpperCase() || "?";
};

const UserAvatarMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSettingClick = async (setting: string) => {
    handleClose();
    if (setting === "Logout") {
      try {
        const message = await logout();
        toast.success(message);
      } catch {
        toast.error(MESSAGES.AUTH.LOGOUT_FAIL);
      } finally {
        navigate(APP_ROUTES.USER_LOGIN);
      }
    } else if (setting === "My Bookings") {
      navigate(APP_ROUTES.MY_BOOKINGS);
    }
  };

  return (
    <>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpen} sx={{ p: 0 }}>
          <Avatar>{getInitials(user?.firstName, user?.lastName)}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: "45px" }}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {settings.map((setting) => (
          <MenuItem key={setting} onClick={() => handleSettingClick(setting)}>
            <Typography sx={{ textAlign: "center" }}>{setting}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default UserAvatarMenu;
