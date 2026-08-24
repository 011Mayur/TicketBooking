import {
  Card,
  CardContent,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const SkeletonCard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        margin: isMobile ? "0 8px" : "0 12px",
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{ height: isMobile ? 200 : 280, width: "100%" }}
      />
      <CardContent sx={{ flexGrow: 1, width: "100%" }}>
        <Skeleton variant="text" sx={{ mb: 1, height: 24 }} />
        <Skeleton variant="text" sx={{ mb: 1, height: 20 }} width="80%" />
        <Skeleton variant="text" sx={{ height: 20 }} width="70%" />
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
