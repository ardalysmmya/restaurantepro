import { Routes, Route } from 'react-router-dom';
import RestaurantLayout from '../layouts/RestaurantLayout';
import LandingPage from '../pages/restaurant/LandingPage';

export default function RestaurantApp() {
  return (
    <Routes>
      <Route element={<RestaurantLayout />}>
        <Route index element={<LandingPage />} />
      </Route>
    </Routes>
  );
}
