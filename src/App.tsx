import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./components/landing/LandingPage";
import { DocsLayout } from "./components/docs/DocsLayout";
import { DocsContent } from "./components/docs/DocsContent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<Navigate to="/docs/getting-started" replace />} />
          <Route path=":slug" element={<DocsContent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
