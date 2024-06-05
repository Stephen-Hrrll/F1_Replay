import React from 'react';
import Card from 'react-bootstrap/Card'; // Assuming you are using React Bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import './DriverCard.css'; // Custom CSS file for additional styling

function DriverCard({ headshot, finishPos, firstName, lastName, team, qualifyPos, points, fastestLap }) {
    return (
        <Card style={{ width: '90%', margin: '10px auto' }}>
            <Card.Body>
                <Row>
                    <Col xs={1}>
                        <div className="driver-card-item">{finishPos}</div>
                    </Col>
                    <Col xs={1}>
                        <img src={headshot} alt={`${firstName} ${lastName}`} className="driver-headshot" />
                    </Col>
                    <Col xs={2}>
                        <div className="driver-card-item">{firstName} {lastName}</div>
                    </Col>
                    <Col xs={2}>
                        <div className="driver-card-item">{team}</div>
                    </Col>
                    <Col xs={2}>
                        <div className="driver-card-item">Qualify Pos.: {qualifyPos}</div>
                    </Col>
                    <Col xs={2}>
                        <div className="driver-card-item">points: {points}</div>
                    </Col>
                    <Col xs={2}>
                        <div className="driver-card-item">Fastest Lap: {fastestLap}</div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default DriverCard;
