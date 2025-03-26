import { Container, Row, Col, Card } from 'react-bootstrap'

const FormContainer = ({ children }) => {

    return (
    <Container className='my-5'>
      <Row className='justify-content-center'>
        <Col md={10} lg={8} xl={7}>
          <Card className='shadow-lg border-0 rounded-lg'>
            <Card.Body className='p-4 p-md-5'>
              {children}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    )
}

export default FormContainer;