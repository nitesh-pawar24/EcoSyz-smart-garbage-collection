import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
