import { Component } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className='py-5'>
          <Row className='justify-content-center'>
            <Col md={8}>
              <Card className='border-danger shadow'>
                <Card.Header className='bg-danger text-white'>
                  <h3>Bir şeyler yanlış gitti</h3>
                </Card.Header>
                <Card.Body>
                  <p>Üzgünüz, uygulama bir hata ile karşılaştı.</p>
                  {this.state.error && (
                    <div className='my-3'>
                      <p><strong>Hata:</strong> {this.state.error.toString()}</p>
                      {process.env.NODE_ENV === 'development' && (
                        <details className='mt-2'>
                          <summary>Detaylı hata bilgisi</summary>
                          <pre className='bg-light p-3 mt-2 rounded'>
                            {this.state.errorInfo?.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                  <div className='mt-4'>
                    <Button 
                      variant='outline-secondary' 
                      className='ms-2'
                      onClick={() => window.location.reload()}
                    >
                      Sayfayı Yenile
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;