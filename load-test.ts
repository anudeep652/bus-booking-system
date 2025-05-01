import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:8000";

export let options = {
  scenarios: {
    loginUser: {
      executor: "constant-vus",
      exec: "testLoginUser",
      vus: 50,
      duration: "30s",
    },
    seatBooking: {
      executor: "ramping-vus",
      exec: "testSeatBooking",
      startVUs: 0,
      stages: [
        { duration: "15s", target: 20 },
        { duration: "30s", target: 20 },
        { duration: "15s", target: 50 },
      ],
      startTime: "30s",
    },
    tripSearching: {
      executor: "constant-vus",
      exec: "testTripSearching",
      vus: 100,
      duration: "30s",
      startTime: "0s",
    },
  },
  thresholds: {
    "http_req_failed{scenario:loginUser}": ["rate<0.01"],
    "http_req_failed{scenario:seatBooking}": ["rate<0.01"],
    "http_req_failed{scenario:tripSearching}": ["rate<0.01"],
  },
};

export function testLoginUser() {
  const headers = {
    "Content-Type": "application/json",
  };

  const data = JSON.stringify({
    name: "Anudeep",
    email: "anudeep1@gmail.com",
    phone: "09839983",
    password: "anudeep1",
    role: "user",
  });

  const res = http.post(`${BASE_URL}/api/v1/user/login`, data, { headers });
  check(res, {
    "successfull login": (r) =>
      r.status === 200 && r.json("token") !== undefined,
  });
  sleep(1);
}

export function testSeatBooking() {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDhmNDA2Yjk4NDhiMGI1YzRhNWZhNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MDIxNzU2LCJleHAiOjE3NDYxMDgxNTZ9.oiFMULSBzXy4GhTG3YvGyFOFZFOyEJgHYSzmHzHw8YY";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const payload = JSON.stringify({
    trip_id: "680905eea080419277888302",
    seat_numbers: [1, 2, 3],
  });
  const res = http.post(`${BASE_URL}/api/v1/booking/book`, payload, {
    headers,
  });
  check(res, {
    "boooking is successfull": (r) =>
      r.json("success") === true && r.status === 201,
  });
  sleep(1 + Math.random() * 2);
}

export function testTripSearching() {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDhmNDA2Yjk4NDhiMGI1YzRhNWZhNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MDIxNzU2LCJleHAiOjE3NDYxMDgxNTZ9.oiFMULSBzXy4GhTG3YvGyFOFZFOyEJgHYSzmHzHw8YY";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = http.get(
    `${BASE_URL}/api/v1/trip/search?source=CBE&minPrice=1000&maxPrice=5000&startDate=2025-04-23&endDate=2025-05-03`,
    { headers }
  );
  check(res, {
    "successfull trip search": (r) =>
      r.status === 200 && r.json("success") === true,
  });
  sleep(1);
}
