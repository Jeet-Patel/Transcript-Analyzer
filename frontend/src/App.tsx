import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import JobsPage from "./pages/JobsPage";
import styles from "./styles/App.module.css";
import "./styles/theme.css";

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`${styles.navLink} ${isActive ? styles.active : ''}`}
    >
      {children}
    </Link>
  );
};

function App() {
  return (
    <div className={styles.appContainer}>
      <Router>
        <div className={styles.nav}>
          <div className={styles.navContent}>
            <NavLink to="/">Upload</NavLink>
            <NavLink to="/jobs">Jobs</NavLink>
          </div>
        </div>
        <main className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/jobs" element={<JobsPage />} />
            </Routes>
          </div>
        </main>
      </Router>
    </div>
  );
}

export default App;
