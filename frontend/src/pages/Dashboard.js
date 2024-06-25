import { useEffect, useState } from "react";
import { fetchAllSessions } from "../services/SessionServices";
import TasksList from "./TaskList";
import { Card } from "react-bootstrap";

function Dashboard() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchAllSessions().then(setSessions);
  }, []);

  const getStatus = (session) => {
    const availablePlaces =
      session.max_participants - session.participants.length;
    const isFull = availablePlaces <= 0;
    const minMet = session.participants.length >= session.min_participants;

    return {
      availablePlaces,
      isFull,
      minMet,
    };
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <Card
                border="primary"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  marginBottom: "7%",
                }}
              >
                <Card.Body>
                  <section className="mb-5 timeline_area section_padding_130">
                    <div className="container">
                      <div className="row justify-content-center">
                        <div className="col-12 col-sm-8 col-lg-6">
                          <div className="section_heading text-center mb-5">
                            {/* <h6>Our History</h6> */}
                            <h3>Les sessions de formations prochaines</h3>
                            <div className="line" />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="apland-timeline-area">
                            <div className="single-timeline-area">
                              <div
                                className="timeline-date wow fadeInLeft"
                                data-wow-delay="0.1s"
                                style={{
                                  visibility: "visible",
                                  animationDelay: "0.1s",
                                  animationName: "fadeInLeft",
                                }}
                              >
                                <p>Ce mois</p>
                              </div>
                              <div className="row">
                                {sessions.length > 0 &&
                                  sessions
                                    .filter(
                                      (s) =>
                                        new Date(s.startDate).getMonth() ===
                                        new Date().getMonth()
                                    )
                                    .map((s) => {
                                      const {
                                        availablePlaces,
                                        isFull,
                                        minMet,
                                      } = getStatus(s);
                                      return (
                                        <div
                                          key={s.id}
                                          className="col-12 col-md-6 col-lg-4"
                                        >
                                          <div
                                            className="single-timeline-content d-flex wow fadeInLeft"
                                            data-wow-delay="0.3s"
                                            style={{
                                              visibility: "visible",
                                              animationDelay: "0.3s",
                                              animationName: "fadeInLeft",
                                            }}
                                          >
                                            <div className="timeline-text">
                                              <h6>
                                                {s.title} - {s.reference}
                                              </h6>
                                              <p>
                                                {s.startDate} - {s.endDate}
                                                <br />({s.location})
                                                {/* <br />
                                            {s.participants.length} participants
                                            <br />
                                            {s.max_participants} max
                                            {s.min_participants} min */}
                                              </p>
                                              <div className="event-details">
                                                <p>
                                                  {availablePlaces} places left{" "}
                                                  {minMet ? (
                                                    <span className="min-met">
                                                      Min met
                                                    </span>
                                                  ) : (
                                                    <span className="min-not-met">
                                                      Min not met
                                                    </span>
                                                  )}
                                                </p>
                                                <p>
                                                  {s.participants.length}/
                                                  {s.max_participants}{" "}
                                                  {isFull && (
                                                    <span className="full">
                                                      Full
                                                    </span>
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                              </div>
                            </div>
                            <div className="single-timeline-area">
                              <div
                                className="timeline-date wow fadeInLeft"
                                data-wow-delay="0.1s"
                                style={{
                                  visibility: "visible",
                                  animationDelay: "0.1s",
                                  animationName: "fadeInLeft",
                                }}
                              >
                                <p>Le mois prochain</p>
                              </div>
                              <div className="row">
                                {sessions.length > 0 &&
                                  sessions
                                    .filter(
                                      (s) =>
                                        new Date(s.startDate).getMonth() ===
                                        new Date().getMonth() + 1
                                    )
                                    .map((s) => {
                                      const {
                                        availablePlaces,
                                        isFull,
                                        minMet,
                                      } = getStatus(s);
                                      return (
                                        <div
                                          key={s.id}
                                          className="col-12 col-md-6 col-lg-4"
                                        >
                                          <div
                                            className="single-timeline-content d-flex wow fadeInLeft"
                                            data-wow-delay="0.3s"
                                            style={{
                                              visibility: "visible",
                                              animationDelay: "0.3s",
                                              animationName: "fadeInLeft",
                                            }}
                                          >
                                            <div className="timeline-text">
                                              <h6>
                                                {s.title} - {s.reference}
                                              </h6>
                                              <p>
                                                {s.startDate} - {s.endDate}
                                                <br />({s.location})
                                                {/* <br />
                                            {s.participants.length} participants
                                            <br />
                                            {s.max_participants} max
                                            {s.min_participants} min */}
                                              </p>
                                              <div className="event-details">
                                                <p>
                                                  {availablePlaces} places left{" "}
                                                  {minMet ? (
                                                    <span className="min-met">
                                                      Min met
                                                    </span>
                                                  ) : (
                                                    <span className="min-not-met">
                                                      Min not met
                                                    </span>
                                                  )}
                                                </p>
                                                <p>
                                                  {s.participants.length}/
                                                  {s.max_participants}{" "}
                                                  {isFull && (
                                                    <span className="full">
                                                      Full
                                                    </span>
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </Card.Body>
              </Card>
              <Card
                border="primary"
                style={{ width: "100%", borderRadius: "8px" }}
              >
                <Card.Body>
                  <section>
                    <h3 className="text-center">Mes tâches</h3>
                    <div className="line" />
                    <div className="row">
                      <div className="col-12">
                        <TasksList />
                      </div>
                    </div>
                  </section>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
