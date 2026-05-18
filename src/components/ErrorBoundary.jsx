import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0A0A0F',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          fontFamily: 'monospace',
        }}>
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
          }}>
            <h1 style={{ color: '#f87171', fontSize: 24, marginBottom: 16 }}>
              Error de Renderizado
            </h1>
            <p style={{ color: '#fff6', marginBottom: 8 }}>
              {this.state.error?.message || 'Error desconocido'}
            </p>
            {this.state.error?.stack && (
              <pre style={{
                background: 'rgba(0,0,0,0.3)',
                padding: 16,
                borderRadius: 8,
                fontSize: 11,
                color: '#fff4',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
