import { createBrowserRouter } from "react-router";
import Register from "./features/auth/pages/Register.jsx";
import Login from "./features/auth/pages/Login.jsx";
import Protected from "./features/auth/components/protected.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <h1>You are on the homepage</h1>
      </Protected>
    ),
  },
  {
    path: "/login",
    element: (
      // <Protected>
      <Login />
      // </Protected>
    ),
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
