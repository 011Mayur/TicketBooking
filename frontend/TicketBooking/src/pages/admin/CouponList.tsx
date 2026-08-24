import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  MenuItem,
  Menu,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type { Coupon } from "../../Common/interface";
import api from "../../Api/axios";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { API_ROUTES } from "../../Constant/apiRoutes";
import { APP_ROUTES } from "../../Constant/appRoutes";
import { MESSAGES } from "../../Constant/messages";

const CouponList = () => {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [toggleTarget, setToggleTarget] = useState<Coupon | null>(null);
  const [toggling, setToggling] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    couponId: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(couponId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Coupon[]>(API_ROUTES.COUPON.GET_ALL);
      setCoupons(res.data);
    } catch {
      toast.error(MESSAGES.ERROR.FAILED_LOAD_COUPONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await api.get<Coupon[]>(API_ROUTES.COUPON.GET_ALL);
        if (!cancelled) setCoupons(res.data);
      } catch {
        if (!cancelled) toast.error(MESSAGES.ERROR.FAILED_LOAD_COUPONS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (id: number) => {
    navigate(APP_ROUTES.EDIT_COUPON(id));
    handleMenuClose();
  };

  const handleToggleClick = (coupon: Coupon) => {
    setToggleTarget(coupon);
    handleMenuClose();
  };

  const handleToggleCancel = () => {
    if (toggling) return;
    setToggleTarget(null);
  };

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      await api.delete(API_ROUTES.COUPON.DELETE(toggleTarget.id));
      const newStatus = toggleTarget.isActive ? "inactive" : "active";
      toast.success(MESSAGES.SUCCESS.TOGGLE_COUPON(newStatus));
      setToggleTarget(null);
      fetchCoupons();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.ERROR.FAILED_DELETE_COUPON,
      );
    } finally {
      setToggling(false);
    }
  };

  const getExpiryStatus = (expiryDate: string, isActive: boolean) => {
    if (!isActive) return { label: "Inactive", color: "default" as const };
    const expired = new Date(expiryDate) < new Date();
    return expired
      ? { label: "Expired", color: "error" as const }
      : { label: "Active", color: "success" as const };
  };

  return (
    <div className="p-6">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Coupons
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(APP_ROUTES.CREATE_COUPON)}
        >
          Create Coupon
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : coupons.length > 0 ? (
              coupons.map((coupon) => {
                const status = getExpiryStatus(
                  coupon.expiryDate,
                  coupon.isActive,
                );
                return (
                  <TableRow key={coupon.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {coupon.code}
                    </TableCell>
                    <TableCell>{coupon.discountPercentage}%</TableCell>
                    <TableCell>
                      {new Date(coupon.expiryDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, coupon.id)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        open={Boolean(anchorEl) && menuRowId === coupon.id}
                        onClose={handleMenuClose}
                        anchorEl={anchorEl}
                      >
                        <MenuItem onClick={() => handleEdit(coupon.id)}>
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleToggleClick(coupon)}>
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.isActive ? "Deactivate Coupon" : "Activate Coupon"}
        message={
          toggleTarget
            ? `Are you sure you want to ${
                toggleTarget.isActive ? "deactivate" : "activate"
              } coupon "${toggleTarget.code}"?`
            : ""
        }
        loading={toggling}
        onConfirm={handleToggleConfirm}
        onCancel={handleToggleCancel}
        abortButton="cancle"
        confirmButton={toggleTarget?.isActive ? "Deactive" : "Active"}
      />
    </div>
  );
};

export default CouponList;
