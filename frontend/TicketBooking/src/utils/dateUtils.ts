export const formatEventDateTime = (isoDate: string, time: string) => {
    const datePart = new Date(isoDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const [h, m] = time.split(":").map(Number);
    const t = new Date();
    t.setHours(h, m);
    const timePart = t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${datePart} · ${timePart}`;
};