import { useNavigate, useParams } from "react-router-dom";
import BusSeatSelector from "../components/bus/BusSeatSelector";
import { useAppSelector } from "../app/hooks";
import { selectBus } from "../features/bus/busSlice";
import { useEffect } from "react";
import { selectBookingError } from "../features/booking/bookingSlice";
import toast from "react-hot-toast";

const BookBus = () => {
  const params = useParams();
  const bus = useAppSelector(selectBus);
  const navigate = useNavigate();
  const bookingError: string | null = useAppSelector(selectBookingError);
  useEffect(() => {
    if (!params.id || bus?.id !== params.id) {
      navigate("/");
    }
  }, []);
  useEffect(() => {
    if (bookingError) {
      toast.error(bookingError);
    }
  }, [bookingError]);
  return <BusSeatSelector />;
};

export default BookBus;
