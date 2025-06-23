import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isVisualViewer = location.pathname.startsWith('/v/');

  return (
    <div className="via-gunmetal-25 to-bleu_de_france-25 relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-white">
      {/* Background Radial Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top left gradient */}
        <div className="via-bleu_de_france-50/20 absolute -left-40 -top-40 size-80 rounded-full bg-gradient-radial from-bleu_de_france-100/30 to-transparent blur-3xl"></div>

        {/* Top right gradient */}
        <div className="via-keppel-50/15 absolute -right-32 -top-32 size-96 rounded-full bg-gradient-radial from-keppel-100/25 to-transparent blur-3xl"></div>

        {/* Center gradient */}
        <div className="from-saffron-50/20 via-saffron-25/10 absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial to-transparent blur-3xl"></div>

        {/* Bottom left gradient */}
        <div className="via-keppel-50/10 absolute -bottom-48 -left-48 size-96 rounded-full bg-gradient-radial from-keppel-100/20 to-transparent blur-3xl"></div>

        {/* Bottom right gradient */}
        <div className="via-bleu_de_france-50/15 absolute -bottom-40 -right-40 size-80 rounded-full bg-gradient-radial from-bleu_de_france-100/25 to-transparent blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-bleu_de_france-500 to-keppel-600 shadow-lg">
                  <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gunmetal-800">
                  <Link to="/" className="transition-colors hover:text-bleu_de_france-600">
                    VizuLLM
                  </Link>
                </h1>
              </div>
            </div>

            <nav className="hidden space-x-1 md:flex">
              <a
                href="https://github.com/GenR8ive/VizuLLM"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-gunmetal-50 flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium text-gunmetal-600 transition-all hover:text-gunmetal-800 hover:shadow-sm"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
            </nav>

            <div className="md:hidden">
              <button
                type="button"
                className="hover:bg-gunmetal-50 rounded-lg p-2 text-gunmetal-500 hover:text-gunmetal-700 focus:outline-none focus:ring-2 focus:ring-bleu_de_france-500/20 focus:ring-offset-2"
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {isVisualViewer ? (
          <div className="w-full">
            {children}
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {children}
          </div>
        )}
      </main>

      {/* Footer - Hide for visual viewer */}
      {!isVisualViewer && (
        <footer className="relative z-10 bg-white/80 shadow-lg backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                <div className="col-span-1 md:col-span-2">
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-bleu_de_france-500 to-keppel-600 shadow-lg">
                      <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    
                      <a href="/"> <h3 className="text-lg font-bold text-gunmetal-800">VizuLLM</h3></a>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-gunmetal-600">
                    A powerful visualization platform for large language models,
                    helping you understand and interact with AI systems more effectively.
                  </p>
                </div>
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gunmetal-800">
                    Quick Links
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                        API Reference
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                        Examples
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gunmetal-800">
                    Support
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                        Community
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-t border-gunmetal-200/50 pt-8">
                <div className="flex flex-col items-center justify-between md:flex-row">
                  <p className="text-sm text-gunmetal-600">
                    © 2024 VisuLLM. All rights reserved.
                  </p>
                  <div className="mt-4 flex space-x-6 md:mt-0">
                    <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-sm text-gunmetal-600 transition-colors hover:text-bleu_de_france-600">
                      Terms of Service
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
