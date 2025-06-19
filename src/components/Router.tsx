import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from '../pages/HomePage';
import VisualPage from '../pages/VisualPage';
import VisualViewerPage from '../pages/VisualViewerPage';

const Router: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/visual" element={<VisualPage />} />
          <Route path="/v/:slug" element={<VisualViewerPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default Router;
