import { useSubdomain } from './hooks/useSubdomain';
import { SUBDOMAIN_TYPES } from './lib/constants';
import CorporateApp from './routes/CorporateApp';
import RestaurantApp from './routes/RestaurantApp';
import AdminApp from './routes/AdminApp';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const subdomain = useSubdomain();

  let content;
  switch (subdomain) {
    case SUBDOMAIN_TYPES.CORPORATE:
      content = <CorporateApp />;
      break;
    case SUBDOMAIN_TYPES.ADMIN:
      content = <AdminApp />;
      break;
    case SUBDOMAIN_TYPES.RESTAURANT:
    default:
      content = <RestaurantApp />;
  }

  return <ErrorBoundary>{content}</ErrorBoundary>;
}
