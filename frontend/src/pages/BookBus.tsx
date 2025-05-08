import { useNavigate, useParams } from "react-router-dom";
import BusSeatSelector from "../components/bus/BusSeatSelector";
import { useAppSelector } from "../app/hooks";
import { selectBus } from "../features/bus/busSlice";
import { useEffect } from "react";

const BookBus = () => {
  const params = useParams();
  const bus = useAppSelector(selectBus);
  const navigate = useNavigate();
  useEffect(() => {
    if (!params.id || bus?.id !== params.id) {
      navigate("/");
    }
  }, []);
  return <BusSeatSelector />;
};

export default BookBus;
