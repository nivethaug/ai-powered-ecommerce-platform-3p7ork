import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * Layout component - Main application layout wrapper
 *
 * Provides the base structure for all pages using React Router nested routes.
 * Pages render inside the <Outlet /> component.
 *
 * Structure:
 * - Full viewport height (h-screen)
 * - Flex container with navbar and scrollable content
 * - Navbar at top, main content below
 */
const Layout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navigation Header */}
        <Navbar />

        {/* Main content area - scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
