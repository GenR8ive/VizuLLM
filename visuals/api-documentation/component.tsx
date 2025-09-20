import React from 'react';
import { ApiDocumentationSchema, type ApiDocumentationData, type EndpointData, type ParameterData, type ResponseData, type RequestBodyData, type AuthenticationData } from './schema.ts';
import sampleData from './sample-data.json';

// Type for component registration
interface ApiDocumentationProps {
  schema: typeof ApiDocumentationSchema | null;
  data?: ApiDocumentationData | null;
}



// Helper function to get method color
const getMethodColor = (method: string) => {
  const colors = {
    GET: 'bg-green-100 text-green-800 border-green-200',
    POST: 'bg-blue-100 text-blue-800 border-blue-200',
    PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PATCH: 'bg-orange-100 text-orange-800 border-orange-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200',
    HEAD: 'bg-gray-100 text-gray-800 border-gray-200',
    OPTIONS: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Helper function to get status color
const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 300 && status < 400) return 'text-blue-600';
  if (status >= 400 && status < 500) return 'text-yellow-600';
  if (status >= 500) return 'text-red-600';
  return 'text-gray-600';
};

// Parameter component
const ParameterComponent: React.FC<{ parameter: ParameterData }> = ({ parameter }) => (
  <div className="mb-4 rounded border bg-gray-50 p-3">
    <div className="mb-2 flex items-center space-x-2">
      <span className="font-mono text-sm font-medium">{parameter.name}</span>
      <span className="rounded bg-gray-200 p-2 py-1 text-xs text-gray-700">
        {parameter.type}
      </span>
      {parameter.required && (
        <span className="rounded bg-red-100 p-2 py-1 text-xs text-red-700">
          required
        </span>
      )}
      {parameter.location && (
        <span className="rounded bg-blue-100 p-2 py-1 text-xs text-blue-700">
          {parameter.location}
        </span>
      )}
    </div>
    {parameter.description && (
      <p className="mb-2 text-sm text-gray-600">{parameter.description}</p>
    )}
    {parameter.example && (
      <div className="text-xs">
        <span className="text-gray-500">Example: </span>
        <code className="rounded border bg-white p-2 py-1">{parameter.example}</code>
      </div>
    )}
  </div>
);

// Response component
const ResponseComponent: React.FC<{ response: ResponseData }> = ({ response }) => (
  <div className="mb-4 rounded border bg-gray-50 p-3">
    <div className="mb-2 flex items-center space-x-2">
      <span className={`font-mono text-sm font-medium ${getStatusColor(response.status)}`}>
        {response.status}
      </span>
      <span className="text-sm text-gray-600">{response.description}</span>
    </div>
    {response.example && (
      <div className="mt-2">
        <pre className="overflow-x-auto rounded border bg-white p-3 text-xs">
          {JSON.stringify(response.example, null, 2)}
        </pre>
      </div>
    )}
  </div>
);

// Request body component
const RequestBodyComponent: React.FC<{ requestBody: RequestBodyData }> = ({ requestBody }) => (
  <div className="mb-4 rounded border bg-gray-50 p-3">
    <div className="mb-2 flex items-center space-x-2">
      <span className="text-sm font-medium">Request Body</span>
      {requestBody.required && (
        <span className="rounded bg-red-100 p-2 py-1 text-xs text-red-700">
          required
        </span>
      )}
    </div>
    {requestBody.description && (
      <p className="mb-2 text-sm text-gray-600">{requestBody.description}</p>
    )}
    {requestBody.example && (
      <div className="mt-2">
        <pre className="overflow-x-auto rounded border bg-white p-3 text-xs">
          {JSON.stringify(requestBody.example, null, 2)}
        </pre>
      </div>
    )}
  </div>
);

// Authentication component
const AuthenticationComponent: React.FC<{ auth: AuthenticationData }> = ({ auth }) => (
  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
    <h3 className="mb-2 text-lg font-semibold text-blue-900">Authentication</h3>
    <div className="mb-2 flex items-center space-x-2">
      <span className="text-sm font-medium">{auth.name}</span>
      <span className="rounded bg-blue-100 p-2 py-1 text-xs text-blue-700">
        {auth.type.toUpperCase()}
      </span>
      {auth.location && (
        <span className="rounded bg-gray-100 p-2 py-1 text-xs text-gray-700">
          {auth.location}
        </span>
      )}
    </div>
    {auth.description && (
      <p className="mb-2 text-sm text-blue-800">{auth.description}</p>
    )}
    {auth.scheme && (
      <div className="text-xs">
        <span className="text-blue-600">Scheme: </span>
        <code className="rounded border bg-white p-2 py-1">{auth.scheme}</code>
      </div>
    )}
  </div>
);

// Endpoint component
const EndpointComponent: React.FC<{ endpoint: EndpointData }> = ({ endpoint }) => (
  <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex-1">
        <div className="mb-2 flex items-center space-x-3">
          <span className={`rounded border px-3 py-1 text-sm font-medium ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <code className="rounded bg-gray-100 p-2 py-1 font-mono text-sm">
            {endpoint.path}
          </code>
          {endpoint.deprecated && (
            <span className="rounded bg-red-100 p-2 py-1 text-xs text-red-700">
              deprecated
            </span>
          )}
        </div>
        <h3 className="mb-1 text-lg font-semibold text-gray-900">{endpoint.summary}</h3>
        {endpoint.description && (
          <p className="mb-3 text-sm text-gray-600">{endpoint.description}</p>
        )}
        {endpoint.tags && endpoint.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap space-x-1">
            {endpoint.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded bg-gray-100 p-2 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Parameters */}
    {endpoint.parameters && endpoint.parameters.length > 0 && (
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Parameters</h4>
        <div className="space-y-2">
          {endpoint.parameters.map((param, index) => (
            <ParameterComponent key={index} parameter={param} />
          ))}
        </div>
      </div>
    )}

    {/* Request Body */}
    {endpoint.requestBody && (
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Request Body</h4>
        <RequestBodyComponent requestBody={endpoint.requestBody} />
      </div>
    )}

    {/* Responses */}
    {endpoint.responses && endpoint.responses.length > 0 && (
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Responses</h4>
        <div className="space-y-2">
          {endpoint.responses.map((response, index) => (
            <ResponseComponent key={index} response={response} />
          ))}
        </div>
      </div>
    )}

    {/* Security */}
    {endpoint.security && endpoint.security.length > 0 && (
      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Security</h4>
        <div className="flex flex-wrap space-x-1">
          {endpoint.security.map((sec, index) => (
            <span
              key={index}
              className="rounded bg-yellow-100 p-2 py-1 text-xs text-yellow-700"
            >
              {sec}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Main component
const ApiDocumentation: React.FC<ApiDocumentationProps> = ({ data }) => {
  let validatedData: ApiDocumentationData;
  try {
    if (data) {
      validatedData = ApiDocumentationSchema.parse(data);
    } else {
      validatedData = ApiDocumentationSchema.parse(sampleData);
    }
  } catch (error) {
    console.error('Data validation failed:', error);
    validatedData = ApiDocumentationSchema.parse(sampleData);
  }

  return (
    <div className="mx-auto max-w-6xl bg-white p-6">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {validatedData.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Version {validatedData.version}</span>
              {validatedData.baseUrl && (
                <span className="rounded bg-gray-100 p-2 py-1 font-mono">
                  {validatedData.baseUrl}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {validatedData.description && (
          <p className="mb-4 leading-relaxed text-gray-700">
            {validatedData.description}
          </p>
        )}

        {/* Contact and License */}
        <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
          {validatedData.contact && (
            <div>
              <span className="font-medium">Contact: </span>
              {validatedData.contact.name && <span>{validatedData.contact.name}</span>}
              {validatedData.contact.email && (
                <span className="ml-1">
                  <a href={`mailto:${validatedData.contact.email}`} className="text-blue-600 hover:underline">
                    {validatedData.contact.email}
                  </a>
                </span>
              )}
            </div>
          )}
          {validatedData.license && (
            <div>
              <span className="font-medium">License: </span>
              {validatedData.license.url ? (
                <a href={validatedData.license.url} className="text-blue-600 hover:underline">
                  {validatedData.license.name || 'View License'}
                </a>
              ) : (
                <span>{validatedData.license.name}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Authentication */}
      {validatedData.authentication && (
        <AuthenticationComponent auth={validatedData.authentication} />
      )}

      {/* Tags */}
      {validatedData.tags && validatedData.tags.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">API Categories</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validatedData.tags.map((tag, index) => (
              <div key={index} className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-1 font-medium text-gray-900">{tag.name}</h3>
                {tag.description && (
                  <p className="text-sm text-gray-600">{tag.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoints */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">API Endpoints</h2>
        <div className="space-y-6">
          {validatedData.endpoints.map((endpoint, index) => (
            <EndpointComponent key={index} endpoint={endpoint} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Export for dynamic loading
export default ApiDocumentation;
