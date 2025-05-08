import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    bookBus: builder.mutation({
      query: (data) => ({
        url: "/booking/book",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useBookBusMutation } = bookingApi;
