import { pdf } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#0047AB",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginVertical: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
  },
  value: {
    fontSize: 12,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  seats: {
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: "center",
    color: "#666",
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  importantInfo: {
    fontWeight: "bold",
    marginTop: 15,
    fontSize: 11,
  },
});

const TicketDocument = ({ ticketData }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);

      const options = {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>E-Ticket</Text>
        <Text style={styles.companyName}>BookBus Bus Services</Text>

        <View style={styles.divider} />

        <View style={styles.infoBox}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Passenger Name:</Text>
              <Text style={styles.value}>{ticketData.user_id.name}</Text>
            </View>
            <View>
              <Text style={styles.label}>Booking ID:</Text>
              <Text style={styles.value}>{ticketData._id}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{ticketData.user_id.email}</Text>
            </View>
            <View>
              <Text style={styles.label}>Booking Status:</Text>
              <Text style={styles.value}>
                {ticketData.booking_status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>Journey Details:</Text>
          <View style={styles.infoBox}>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>From:</Text>
                <Text style={styles.value}>{ticketData.trip_id.source}</Text>
              </View>
              <View>
                <Text style={styles.label}>To:</Text>
                <Text style={styles.value}>
                  {ticketData.trip_id.destination}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Departure:</Text>
                <Text style={styles.value}>
                  {formatDate(ticketData.trip_id.departure_time)}
                </Text>
              </View>
              <View>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.value}>₹{ticketData.trip_id.price}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Seat Information:</Text>
          <View style={styles.infoBox}>
            {ticketData.seats.map((seat) => (
              <View key={seat._id} style={styles.row}>
                <Text style={styles.value}>
                  Seat Number: {seat.seat_number}
                </Text>
                <Text style={styles.value}>
                  Status: {seat.status.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.importantInfo}>Important Information:</Text>
          <Text style={styles.value}>
            • Please arrive at least 30 minutes before departure time
          </Text>
          <Text style={styles.value}>
            • Carry a valid photo ID for verification
          </Text>
          <Text style={styles.value}>
            • Payment Status: {ticketData.payment_status.toUpperCase()}
          </Text>

          {ticketData.payment_status === "pending" && (
            <Text style={[styles.value, { color: "red" }]}>
              {/* Please complete your payment to confirm this booking. */}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text>
            This is an electronically generated ticket and requires no
            signature.
          </Text>
          <Text>For support, contact: support@bookbus.com | +91 xxxxxxxxx</Text>
          <Text>
            © {new Date().getFullYear()} BookBus Bus Services. All rights
            reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const generateTicketPDF = async (ticketData) => {
  if (!ticketData) {
    console.error("No ticket data available");
    return;
  }

  try {
    const blob = await pdf(<TicketDocument ticketData={ticketData} />).toBlob();

    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
