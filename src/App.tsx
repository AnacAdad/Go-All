import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { AddRestaurant } from './pages/AddRestaurant'; // 1. Importamos a tela nova
import { About } from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/novo" element={<AddRestaurant />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
