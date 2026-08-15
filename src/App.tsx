import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { AddPlace } from './pages/AddPlace'; // 1. Importamos a tela nova
import { About } from './pages/About';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PlaceDetails } from './pages/PlaceDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/novo" element={<ProtectedRoute><AddPlace /></ProtectedRoute>} /> 
        <Route path="/local/:id" element={<PlaceDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
