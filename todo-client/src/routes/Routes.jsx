import { createBrowserRouter } from "react-router-dom";
import SocialLogin from "../pages/SocialLogin/SocialLogin";
import Home from "../pages/Home/Home";
import TaskDetails from "../pages/TaskDetails/TaskDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SocialLogin />,

  },
  {
    path:'todoHome',
    element:<Home />
  },

  {
    path:'/todos/:id',
    element:<TaskDetails />

  }
]);

export default router;
