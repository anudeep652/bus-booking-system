export const calculateTimeDifference = (start: Date, end: Date): string => {
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours} hr ${diffMinutes} min`;
  }
  return `${diffMinutes} min`;
};

export const getPaymentStatusDetails = (status: string) => {
  switch (status) {
    case "paid":
      return {
        color: "text-green-600",
        label: "Paid",
      };
    case "failed":
      return {
        color: "text-red-600",
        label: "Payment Failed",
      };
    case "pending":
      return {
        color: "text-yellow-600",
        label: "Pending",
      };
    case "refunded":
      return {
        color: "text-blue-600",
        label: "Refunded",
      };
    case "partially_refunded":
      return {
        color: "text-orange-600",
        label: "Partially Refunded",
      };
    default:
      return {
        color: "text-gray-600",
        label: "Unknown",
      };
  }
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
