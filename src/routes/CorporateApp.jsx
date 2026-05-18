import { Routes, Route } from 'react-router-dom';
import CorporateLayout from '../layouts/CorporateLayout';
import HomePage from '../pages/corporate/HomePage';
import ContactPage from '../pages/corporate/ContactPage';

export default function CorporateApp() {
  return (
    <Routes>
      <Route element={<CorporateLayout />}>
        <Route index element={<HomePage />} />
        <Route path="contacto" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
