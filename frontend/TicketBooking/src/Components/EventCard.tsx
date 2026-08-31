import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";
import type { HomePageEvent } from "../types";
import { useRef, useState } from "react";
interface EventCardProps {
  event: HomePageEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const imageUrl = event.posterImageUrl || "/placeholder-event.png";
  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const venueRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const handleMouseEnter = () => {
    const element = venueRef.current;

    if (element) {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  };
  return (
    <Card
      onClick={() => navigate(APP_ROUTES.EVENT(event.id))}
      sx={{
        height: "100%",
        display: "flex",
        cursor: "pointer",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 24px rgba(69, 64, 225, 0.15)",
        },
        margin: isMobile ? "0 8px" : "0 12px",
      }}
    >
      <CardMedia
        component="img"
        image={imageUrl}
        alt={event.title}
        loading="lazy"
        sx={{
          width: "100%",
          aspectRatio: "4/3",
          objectFit: "cover",
          backgroundColor: "#f0f0f0",
          display: "block",
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: isMobile ? "12px" : "16px",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: isMobile ? "0.95rem" : "1rem",
            lineHeight: 1.4,
          }}
        >
          {event.title}
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{
            color: theme.palette.text.secondary,
            mb: 1,
            fontSize: isMobile ? "0.8rem" : "0.875rem",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <Tooltip title={isTruncated ? event.venue : ""} arrow>
            <Box
              ref={venueRef}
              onMouseEnter={handleMouseEnter}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                maxWidth: 250,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              <PushPinIcon fontSize="small" />

              <span>{event.venue}</span>
            </Box>
          </Tooltip>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 500,
            fontSize: isMobile ? "0.8rem" : "0.875rem",
          }}
        >
          <EventIcon fontSize="small" /> {formattedDate}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EventCard;
