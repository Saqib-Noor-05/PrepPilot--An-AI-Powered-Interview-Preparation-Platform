import { createBrowserRouter } from "react-router";
import Register from "./features/auth/pages/Register.jsx";
import Login from "./features/auth/pages/Login.jsx";
import Protected from "./features/auth/components/protected.jsx";
import Interview from "./features/interview/pages/interview.jsx";
import Home from "./features/interview/pages/home.jsx";
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Home />
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
  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />,
      </Protected>
    ),
  },
]);
