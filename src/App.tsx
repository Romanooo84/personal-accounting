import AnalizingInvoices from './pages/AnalizingInvoices'
import AddInvoice from './pages/AddInvoice';
import Home from './pages/Home'
import { Route, Routes, Navigate } from "react-router-dom";

export const App = () => {

  return (
    <Routes>
        <Route path="/" element={<Navigate to="/personal-accounting" />} />
        <Route path="/personal-accounting" element={<Home />} />
        <Route path="/personal-accounting/analizafaktur" element={<AnalizingInvoices />} />
        <Route path="/personal-accounting/dodajfakture" element={<AddInvoice />} />
        <Route path="*" element={<Navigate to="/personal-accounting" />} />
    </Routes>
  );
};



export default App;
