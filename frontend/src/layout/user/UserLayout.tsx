import { ReactNode } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const UserLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen ">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default UserLayout;
