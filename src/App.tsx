import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LandingPage } from "./components/landing/LandingPage";

const DocsLayout = lazy(() =>
  import("./components/docs/DocsLayout").then((m) => ({ default: m.DocsLayout }))
);
const DocsContent = lazy(() =>
  import("./components/docs/DocsContent").then((m) => ({ default: m.DocsContent }))
);

function App() {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<Navigate to="/docs/getting-started" replace />} />
            <Route path=":slug" element={<DocsContent />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
