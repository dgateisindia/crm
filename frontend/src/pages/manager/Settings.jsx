import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/settings.css";

export default function Settings() {
  return (
    <ManagerLayout>

      <div className="settings-container">

        <h1 className="settings-title">
          Settings
        </h1>

        <div className="settings-card">

          <div className="settings-section">
            <label className="settings-label">
              Company Name
            </label>

            <input
              type="text"
              placeholder="Enter company name"
              className="settings-input"
            />
          </div>

          <div className="settings-section">
            <label className="settings-label">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              className="settings-input"
            />
          </div>

          <div className="settings-section">
            <label className="settings-label">
              Password
            </label>

            <input
              type="password"
              placeholder="Change password"
              className="settings-input"
            />
          </div>

          <button className="settings-button">
            Save Changes
          </button>

        </div>

      </div>

    </ManagerLayout>
  );
}