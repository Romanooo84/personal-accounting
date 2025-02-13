import AnalizingInvoices from './pages/AnalizingInvoices'
import Home from './pages/Home'
import { Route, Routes, Navigate } from "react-router-dom";

export const App = () => {

  return (
    <Routes>
    {/* Przekierowanie z "/" na "/personal-accounting" */}
        <Route path="/" element={<Navigate to="/personal-accounting" />} />

        {/* Strona główna pod "/personal-accounting" */}
        <Route path="/personal-accounting" element={<Home />} />

        {/* Podstrona dla analizy faktur */}
        <Route path="/personal-accounting/analizafakturprzelewowych" element={<AnalizingInvoices />} />

        {/* Przekierowanie w razie nieznanej ścieżki */}
        <Route path="*" element={<Navigate to="/personal-accounting" />} />
    </Routes>
  );
};



export default App;
