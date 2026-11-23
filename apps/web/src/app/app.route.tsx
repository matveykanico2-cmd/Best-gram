import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Home from "../features/posts/pages/Home";
import Profile from "../features/users/pages/Profile";
import AppLayout from "../components/layouts/AppLayout";
import Search from "../features/users/pages/Search";
import CreatePost from "../features/posts/pages/CreatePost";
import { ProtectedRoute, GuestRoute } from "./ProtectedRoute";
import Notifications from "../features/users/pages/Notifications";
import Messages from "../features/chats/pages/Messages";
import NotFound from "./NotFound";
import Discover from "../features/discover/Discover";
import Admin from "../features/admin/Admin";
import Communities from "../features/platform/pages/Communities";
import Marketplace from "../features/platform/pages/Marketplace";
import Calls from "../features/platform/pages/Calls";
import Videos from "../features/platform/pages/Videos";
import Settings from "../features/platform/pages/Settings";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/search",
            element: <Search />,
          },
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/create",
            element: <CreatePost />,
          },
          {
            path: "/notifications",
            element: <Notifications />,
          },
          {
            path: "/messages",
            element: <Messages />,
          },
          {
            path: "/discover",
            element: <Discover />,
          },
          {
            path: "/admin",
            element: <Admin />,
          },
          { path: "/communities", element: <Communities /> },
          { path: "/marketplace", element: <Marketplace /> },
          { path: "/calls", element: <Calls /> },
          { path: "/videos", element: <Videos /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },

  // Guest Routes
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },

  // 404 Catch-all
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
