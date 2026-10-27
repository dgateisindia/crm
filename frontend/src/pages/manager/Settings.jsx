import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/settings.css";

export default function Settings() {
  return (
    <ManagerLayout>
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        <div className="settings-card">
          <h2>Account and Company Settings</h2>
          <p>
            Account security is managed through your
            D-GATE Account.
          </p>
          <p>
            Company configuration is managed by
            D-GATE administration.
          </p>
        </div>
      </div>
    </ManagerLayout>
  );
}