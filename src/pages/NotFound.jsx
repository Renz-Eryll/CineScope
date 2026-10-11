import { Link } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";

const NotFound = () => (
  <div className="page-container flex min-h-[70vh] items-center justify-center pt-28">
    <StatusMessage
      title="Page not found"
      message="The title or page you're looking for doesn't exist."
      action={
        <Link to="/" className="btn btn-primary mt-4">
          Back to home
        </Link>
      }
    />
  </div>
);

export default NotFound;
