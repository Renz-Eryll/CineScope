const StatusMessage = ({ title, message, action }) => (
  <div className="status-message" role="status">
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {action}
  </div>
);

export default StatusMessage;
