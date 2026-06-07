import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/public/LandingPage';
import OurHotels from './pages/public/OurHotels';
import Residences from './pages/public/Residences';
import Dining from './pages/public/Dining';
import Wellness from './pages/public/Wellness';
import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';
import PublicRooms from './pages/public/PublicRooms';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
import CookiesPolicy from './pages/public/CookiesPolicy';
import AdminLogin from './pages/admin/AdminLogin';
import PortalHub from './pages/PortalHub';
import Dashboard from './pages/admin/Dashboard';
import Rooms from './pages/admin/Rooms';
import Bookings from './pages/admin/Bookings';
import Users from './pages/admin/Users';
import Housekeeping from './pages/admin/Housekeeping';
import Receptionist from './pages/admin/Receptionist';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Guests from './pages/admin/Guests';
import Feedback from './pages/admin/Feedback';
import WellnessPackages from './pages/admin/WellnessPackages';
import AdminResidences from './pages/admin/AdminResidences';
import AdminInventory from './pages/admin/AdminInventory';
import MainLayout from './layouts/MainLayout';
import GuestLayout from './layouts/GuestLayout';
import { GuestProvider } from './context/GuestContext';
import GuestBookings from './pages/guest/GuestBookings';
import GuestBilling from './pages/guest/GuestBilling';
import GuestProfile from './pages/guest/GuestProfile';
import GuestServices from './pages/guest/GuestServices';
import GuestFeedback from './pages/guest/GuestFeedback';
import StaffLayout from './layouts/StaffLayout';
import HousekeepingLayout from './layouts/HousekeepingLayout';
import GuestLogin from './pages/guest/GuestLogin';
import GuestDashboard from './pages/guest/GuestDashboard';
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';
import HousekeepingLogin from './pages/housekeeping/HousekeepingLogin';
import HousekeepingDashboard from './pages/housekeeping/HousekeepingDashboard';
import HousekeepingTasks from './pages/housekeeping/HousekeepingTasks';
import StaffCheckIn from './pages/staff/StaffCheckIn';
import StaffGuestRecords from './pages/staff/StaffGuestRecords';
import StaffBilling from './pages/staff/StaffBilling';
import StaffBookings from './pages/staff/StaffBookings';
import StaffProfile from './pages/staff/StaffProfile';
import HousekeepingInventory from './pages/housekeeping/HousekeepingInventory';
import HousekeepingMaintenance from './pages/housekeeping/HousekeepingMaintenance';
import HousekeepingProfile from './pages/housekeeping/HousekeepingProfile';
import './index.css';

const ADMIN_ROLES = ['Admin'];
const STAFF_ROLES = ['Receptionist'];
const HK_ROLES = ['Housekeeping Staff'];
const GUEST_ROLES = ['Guest'];

function App() {
  return (
    <Router>
      <Routes>
        {/* Public website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/rooms" element={<PublicRooms />} />
          <Route path="/our-hotels" element={<OurHotels />} />
          <Route path="/residences" element={<Residences />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookies-policy" element={<CookiesPolicy />} />
        </Route>

        {/* Admin portal — /admin = login, /admin/dashboard = panel */}
        <Route path="/admin">
          <Route index element={<AdminLogin />} />
          <Route
            element={
              <ProtectedRoute loginPath="/admin" allowedRoles={ADMIN_ROLES}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="users" element={<Users />} />
            <Route path="receptionist" element={<Receptionist />} />
            <Route path="housekeeping" element={<Housekeeping />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="billing" element={<Billing />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="guests" element={<Guests />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="wellness-packages" element={<WellnessPackages />} />
            <Route path="residences" element={<AdminResidences />} />
          </Route>
        </Route>

        {/* Receptionist portal (front desk) — /staff = login */}
        <Route path="/staff">
          <Route index element={<StaffLogin />} />
          <Route
            element={
              <ProtectedRoute loginPath="/staff" allowedRoles={STAFF_ROLES}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="bookings" element={<StaffBookings />} />
            <Route path="guests" element={<StaffGuestRecords />} />
            <Route path="checkin" element={<StaffCheckIn />} />
            <Route path="billing" element={<StaffBilling />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>
        </Route>

        {/* Housekeeping portal — /housekeeping = login */}
        <Route path="/housekeeping">
          <Route index element={<HousekeepingLogin />} />
          <Route
            element={
              <ProtectedRoute loginPath="/housekeeping" allowedRoles={HK_ROLES}>
                <HousekeepingLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<HousekeepingDashboard />} />
            <Route path="tasks" element={<HousekeepingTasks />} />
            <Route path="inventory" element={<HousekeepingInventory />} />
            <Route path="maintenance" element={<HousekeepingMaintenance />} />
            <Route path="profile" element={<HousekeepingProfile />} />
          </Route>
        </Route>

        {/* Guest portal — /guest = login */}
        <Route path="/guest">
          <Route index element={<GuestLogin />} />
          <Route
            element={
              <ProtectedRoute loginPath="/guest" allowedRoles={GUEST_ROLES}>
                <GuestProvider>
                  <GuestLayout />
                </GuestProvider>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<GuestDashboard />} />
            <Route path="bookings" element={<GuestBookings />} />
            <Route path="services" element={<GuestServices />} />
            <Route path="billing" element={<GuestBilling />} />
            <Route path="profile" element={<GuestProfile />} />
            <Route path="feedback" element={<GuestFeedback />} />
          </Route>
        </Route>

        <Route path="/login" element={<PortalHub />} />
      </Routes>
    </Router>
  );
}

export default App;
