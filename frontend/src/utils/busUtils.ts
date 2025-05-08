export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  const formattedDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
};

export const getJourneyTime = (departure: string, arrival: string) => {
  const departureDate = new Date(departure);
  const arrivalDate = new Date(arrival);

  const diffInHours =
    Math.abs(arrivalDate.getTime() - departureDate.getTime()) / 36e5;

  if (diffInHours < 1) {
    return `${Math.round(diffInHours * 60)}m`;
  }

  const hours = Math.floor(diffInHours);
  const minutes = Math.round((diffInHours - hours) * 60);

  return `${hours}h ${minutes}m`;
};
