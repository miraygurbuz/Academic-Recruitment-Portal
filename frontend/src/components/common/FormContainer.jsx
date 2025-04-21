import { Container, Row, Col, Card } from 'react-bootstrap';

const FormContainer = ({ children }) => (
  <Container className='my-4'>
    <Row className='justify-content-center'>
      <Col md={10} lg={8} xl={7}>
        <Card className='shadow-sm border rounded-3'>
          <Card.Body className='p-5'>{children}</Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default FormContainer;