
import CreateSessionForm from './CreateSession';
// import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import {  Route, Routes } from "react-router-dom";
import { UserProvider, Login } from './UserContext';
import { Navigate } from 'react-router-dom';
import EnrollmentPeriodCourses from './Enrollment';
import SessionListPage from './SessionList';
import DownloadSession from './DownloadSession';
import AdminSessionPage from './AdminSession';
import UploadStudent from './UploadStudent.jsx';
import AdminSessionDashboard from './SessionDetails.jsx';
export function App() {
  return (
    <UserProvider>

    <Routes>

      {/* <Route path="/enroll" element={<EnrollmentPeriodCourses />} /> */}
      <Route path="/create" element={<CreateSessionForm />} />
      <Route path="/enroll/:sessionName" element={<EnrollmentPeriodCourses/>} />
      <Route path="/login" element={<Login />} />
      <Route path='/session' element={<SessionListPage/>} />
      {/* <Route path="/enroll/:sessionName" element={<EnrollmentPeriodCourses />} /> */}
      <Route path="/download" element={<DownloadSession />} />
      <Route path="/admin/session" element={<AdminSessionPage />} />
      <Route path="/admin/upload" element={<UploadStudent />} />

// In your Routes component
<Route path="/admin/session/:sessionName" element={<AdminSessionDashboard />} />
      <Route path="/*" element={<Navigate to="/login" replace />} />
  </Routes>
     </UserProvider>
  );
}
export default App;