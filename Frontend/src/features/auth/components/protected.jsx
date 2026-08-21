import { Navigate } from "react-router-dom";
import Loader from "../../../components/ui/Loader/Loader";
import { useAuth } from "../hooks/useAuth";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();
  if (loading) {
    return (
      <main>
        <Loader />
      </main>
    );
  }

  if (!user) {
    return <Navigate to={"/login"}></Navigate>;
  }
  return children;
};

export default Protected;
