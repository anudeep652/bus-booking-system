
import mongoose from "mongoose";
import { Operator } from "./models/operatorSchema";
import { Bus } from "./models/busSchema";
import { Trip } from "./models/tripSchema";
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI =
  process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/bus_booking";

const operators = [
  {
    company_name: "Kongu Travels",
    email: "admin@kongutravels.test",
    phone: "9876543210",
    password: "TestOnly123!",
    verification_status: "verified",
    buses: [
      {
        bus_number: "TN38AB1001",
        bus_type: "sleeper",
        hasAC: true,
        total_seats: 36,
        ratings: 5,
        amenities: ["WiFi", "Charging Point", "Blanket", "Water Bottle"],
      },
      {
        bus_number: "TN38AB1002",
        bus_type: "semi-sleeper",
        hasAC: true,
        total_seats: 40,
        ratings: 4,
        amenities: ["Charging Point", "Water Bottle"],
      },
    ],
    routes: [
      ["Coimbatore", "Bengaluru"],
      ["Coimbatore", "Chennai"],
      ["Coimbatore", "Madurai"],
      ["Bengaluru", "Coimbatore"],
      ["Chennai", "Coimbatore"],
      ["Salem", "Bengaluru"],
      ["Bengaluru", "Salem"],
      ["Coimbatore", "Kochi"],
      ["Kochi", "Coimbatore"],
      ["Madurai", "Bengaluru"],
    ],
  },
  {
    company_name: "Western Express",
    email: "admin@westernexpress.test",
    phone: "9876543211",
    password: "TestOnly123!",
    verification_status: "verified",
    buses: [
      {
        bus_number: "KA01CD2001",
        bus_type: "sleeper",
        hasAC: true,
        total_seats: 30,
        ratings: 5,
        amenities: ["WiFi", "Charging Point", "Blanket"],
      },
      {
        bus_number: "KA01CD2002",
        bus_type: "seater",
        hasAC: false,
        total_seats: 45,
        ratings: 3,
        amenities: ["Water Bottle"],
      },
    ],
    routes: [
      ["Bengaluru", "Chennai"],
      ["Bengaluru", "Mysuru"],
      ["Mysuru", "Bengaluru"],
      ["Bengaluru", "Hyderabad"],
      ["Hyderabad", "Bengaluru"],
      ["Chennai", "Bengaluru"],
      ["Bengaluru", "Pune"],
      ["Pune", "Bengaluru"],
      ["Bengaluru", "Coimbatore"],
      ["Coimbatore", "Bengaluru"],
    ],
  },
  {
    company_name: "GreenLine Travels",
    email: "admin@greenline.test",
    phone: "9876543212",
    password: "TestOnly123!",
    verification_status: "verified",
    buses: [
      {
        bus_number: "KL07EF3001",
        bus_type: "semi-sleeper",
        hasAC: true,
        total_seats: 40,
        ratings: 4,
        amenities: ["WiFi", "Charging Point", "Water Bottle"],
      },
      {
        bus_number: "KL07EF3002",
        bus_type: "sleeper",
        hasAC: false,
        total_seats: 32,
        ratings: 0,
        amenities: ["Blanket"],
      },
    ],
    routes: [
      ["Kochi", "Coimbatore"],
      ["Kochi", "Bengaluru"],
      ["Bengaluru", "Kochi"],
      ["Kochi", "Chennai"],
      ["Chennai", "Kochi"],
      ["Kochi", "Madurai"],
      ["Madurai", "Kochi"],
      ["Coimbatore", "Kochi"],
      ["Kochi", "Thiruvananthapuram"],
      ["Thiruvananthapuram", "Kochi"],
    ],
  },
];

async function seedDatabase() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  let totalBuses = 0;
  let totalTrips = 0;

  for (const operatorData of operators) {
    const { buses, routes, ...operatorFields } = operatorData;

    // Create the operator, or update it if it already exists.
    const operator = await Operator.findOneAndUpdate(
      { email: operatorFields.email },
      { $set: operatorFields },
      { upsert: true, new: true, runValidators: true }
    );

    const savedBuses = [];

    // Create or update each bus.
    for (const busData of buses) {
      const bus = await Bus.findOneAndUpdate(
        { bus_number: busData.bus_number },
        {
          $set: {
            ...busData,
            operator_id: operator._id,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );

      savedBuses.push(bus);
      totalBuses++;
    }

    // Create 10 trips per operator.
    for (let i = 0; i < routes.length; i++) {
      const [source, destination] = routes[i];
      const bus = savedBuses[i % savedBuses.length];

      // Future departure date, starting tomorrow.
      const departure = new Date();
      departure.setDate(departure.getDate() + i + 1);
      departure.setHours(7 + (i % 12), (i % 2) * 30, 0, 0);

      const arrival = new Date(departure);
      arrival.setHours(arrival.getHours() + 5 + (i % 5));

      // The route plus bus identifies this seeded trip.
      // Rerunning updates it rather than creating duplicates.
      await Trip.findOneAndUpdate(
        {
          bus_id: bus._id,
          source,
          destination,
        },
        {
          $set: {
            departure_time: departure,
            arrival_time: arrival,
            price: 350 + i * 100,
            available_seats: bus.total_seats,
            status: "scheduled",
          },
        },
        { upsert: true, new: true, runValidators: true }
      );

      totalTrips++;
    }

    console.log(`Seeded ${operator.company_name}: 10 trips`);
  }

  console.log("Database seeding completed");
  console.log(`Operators: ${operators.length}`);
  console.log(`Buses processed: ${totalBuses}`);
  console.log(`Trips processed: ${totalTrips}`);
}

seedDatabase()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
