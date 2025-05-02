import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    parallel_booking: {
      executor: "per-vu-iterations",
      vus: 5,
      iterations: 1,
      maxDuration: "5s",
    },
  },
};

const API_URL = "http://localhost:8000/api/v1/booking/book";

const TRIP_ID = "680905eea080419277888302";
const SEATS = [1, 2, 3];

const USER_TOKENS = [
  {
    id: "6808f406b9848b0b5c4a5fa4",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDhmNDA2Yjk4NDhiMGI1YzRhNWZhNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MTk4MjU1LCJleHAiOjE3NDYyODQ2NTV9.GvdBos2GjzN1cjv8cl9moF9RM2ruLK3d5FMWTZb3OQY",
  },
  {
    id: "6808f40cb9848b0b5c4a5fa6",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDhmNDBjYjk4NDhiMGI1YzRhNWZhNiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MTk4NDU5LCJleHAiOjE3NDYyODQ4NTl9.Z9eBmhBweaxJ31v5jqIQKvpEUMmVJfgJdgxyE8Vu5gg",
  },
  {
    id: "6808f412b9848b0b5c4a5fa8",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDhmNDEyYjk4NDhiMGI1YzRhNWZhOCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MTk4NTA4LCJleHAiOjE3NDYyODQ5MDh9.g1pkc6xQJ-ioy_lEzovKXIsxBfjmxQG4LyEN10j8wTk",
  },
  {
    id: "6808f418b9848b0b5c4a5faa",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDhmNDE4Yjk4NDhiMGI1YzRhNWZhYSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MTk4NTQyLCJleHAiOjE3NDYyODQ5NDJ9.duZ__dRtddxZx5QAIbKhleu5geNzVthqeRwAxQqvQyw",
  },
  {
    id: "6808f41fb9848b0b5c4a5fac",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDhmNDFmYjk4NDhiMGI1YzRhNWZhYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MTk4NTcyLCJleHAiOjE3NDYyODQ5NzJ9.eXDFXHZj9NZSYqK6_w6c3dpKdcIOuf_36NXLVTcodzQ",
  },
];

export default function () {
  const index = __ITER;
  const user = USER_TOKENS[index];

  const payload = JSON.stringify({
    trip_id: TRIP_ID,
    seat_numbers: SEATS,
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user.token}`,
  };

  const res = http.post(API_URL, payload, { headers });

  check(res, {
    "status is 201 or 400": (r) => r.status === 201 || r.status === 400,
  });

  console.log(`[User ${user.id}] → ${res.status} | ${res.body}\n`);
}
