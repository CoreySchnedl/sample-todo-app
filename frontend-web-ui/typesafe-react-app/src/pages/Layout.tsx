import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div style={{ backgroundColor: "#1976d2", height: "100vh" }}>
      <nav></nav>
      <Outlet />
    </div>
  );
};

export default Layout;
