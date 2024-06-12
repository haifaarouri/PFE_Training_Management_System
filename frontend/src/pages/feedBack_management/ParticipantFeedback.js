import { Button, Form, InputGroup, Pagination } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "../../services/axios";
import { apiFetch } from "../../services/api";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";

function ParticipantFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 2;
  const lastIndex = currentPage * feedbacksPerPage;
  const firstIndex = lastIndex - feedbacksPerPage;
  const feedbacksPage =
    feedbacks.length > 0 && feedbacks.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    feedbacks.length > 0 && feedbacks.length / feedbacksPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [surveyTemplates, setSurveyTemplates] = useState([]);

  const handleLister = () => {
    feedbacks.length > 0 && setFilteredData(feedbacks);
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setFeedbacks(d);
    };

    u();
  }, []);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne") {
      const newFilter =
        feedbacks.length > 0 &&
        feedbacks.filter((feedback) =>
          feedback[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else {
      const newFilter =
        feedbacks.length > 0 &&
        feedbacks.filter((feedback) => {
          const feedbackFields = Object.values(feedback)
            .join(" ")
            .toLowerCase();
          return feedbackFields.includes(searchWord);
        });
      setFilteredData(newFilter);
    }
  };

  const fetchData = async () => {
    try {
      if (!localStorage.getItem("token")) {
        let responsesNotToken = [];

        const surveys = await axios.get(`/api/get-all-surveys`);
        setSurveyTemplates(surveys.data);

        if (surveys.data.length > 0) {
          surveys.data.forEach(async (element) => {
            const response = await axios.post(
              `http://localhost:8000/api/get-form-responses`,
              { surveyId: element.surveyId },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            responsesNotToken.push(response.data);
          });
          console.log(responsesNotToken);
          return responsesNotToken;
        }
      } else {
        let responsesToken = [];

        const surveys = await apiFetch(`get-all-surveys`);
        setSurveyTemplates(surveys);
        const headers = {
          "Content-Type": "multipart/form-data",
        };

        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        surveys.length > 0 &&
          surveys.forEach(async (element) => {
            const response = await axios.post(
              `http://localhost:8000/api/get-form-responses`,
              { surveyId: element.surveyId },
              {
                headers: headers,
              }
            );
            responsesToken.push(response.data);
          });
        return responsesToken;
      }
    } catch (error) {
      console.log("Error fetching feedbacks :", error);
    } finally {
      setLoading(false);
    }
  };

  const prevPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changeCurrentPage = (n) => {
    setCurrentPage(n);
  };

  const nextPage = () => {
    if (currentPage !== numberPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <ToastContainer />
              {loading ? <Spinner /> : null}
              <div className="d-flex justify-content-between">
                <h4 className="card-title mb-5 mt-2">
                  Liste de tous les feedbacks des participants
                </h4>
                <Link to="/survey-creator">
                  <Button
                    variant="outline-success"
                    className="btn btn-sm m-3 mt-1"
                  >
                    Ajouter un Formulaire
                  </Button>
                </Link>
              </div>
              <div className="d-flex justify-content-center mt-3 mb-5">
                <Form style={{ width: "50%" }}>
                  <div className="inner-form">
                    <div className="input-select">
                      <Form.Group>
                        <InputGroup>
                          <Form.Select
                            style={{ border: "none" }}
                            value={columnName}
                            onChange={(e) => setColumnName(e.target.value)}
                            required
                          >
                            <option value="">Colonne</option>
                            <option value="sessionTitle">
                              Titre de session
                            </option>
                            <option value="formationRef">
                              Référence de la formation
                            </option>
                          </Form.Select>
                        </InputGroup>
                      </Form.Group>
                    </div>
                    <div className="input-field second-wrap">
                      <Form.Group>
                        <InputGroup>
                          <Form.Control
                            id="search"
                            type="text"
                            placeholder="Recherchez des feedbacks ..."
                            size="lg"
                            name=""
                            value={wordEntered}
                            onChange={handleFilter}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </div>
                    <div className="input-field third-wrap">
                      <button className="btn-search" type="button">
                        <svg
                          className="svg-inline--fa fa-search fa-w-16"
                          aria-hidden="true"
                          data-prefix="fas"
                          data-icon="search"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path
                            fill="currentColor"
                            d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Form>
              </div>
              <div className="table-responsive">
                <Button onClick={handleLister}>Lister</Button>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Lien du SpreadSheet</th>
                      {/* <th>Réponses</th> */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((f, index) => {
                        return (
                          <tr key={index} className="text-center">
                            <td>
                              <h6>{f.spreadsheetUrl}</h6>
                              <iframe src={f.spreadsheetUrl} style={{ width: '100%', height: '500px', border: 'none' }} sandbox="seamless"></iframe>
                            </td>
                            {/* <td>
                              {f.data.length > 0 &&
                                f.data.map((r, i) => <p key={i}>{r}</p>)}
                            </td> */}
                            <td style={{width: "10%"}}>
                              <div className="d-flex flex-column justify-content-center">
                                <Button
                                  variant="outline-primary"
                                  // onClick={() => handleButtonEdit(f.id)}
                                  className="btn btn-sm mb-2"
                                >
                                  Afficher
                                  <i className="mdi mdi-tooltip-edit"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : filteredData.length === 0 && feedbacks.length === 0 ? (
                      <></>
                    ) : (
                      feedbacks.length > 0 &&
                      filteredData.map((f, index) => {
                        return (
                          <tr key={index} className="text-center">
                            <td>
                              <h6>{f.spreadsheetUrl}</h6>
                              
                            </td>
                            <td>
                              {f.data.length > 0 &&
                                f.data.map((r, i) => <p key={i}>{r}</p>)}
                            </td>
                            <td>
                              <div className="d-flex flex-column justify-content-center">
                                <Button
                                  variant="outline-primary"
                                  // onClick={() => handleButtonEdit(f.id)}
                                  className="btn btn-sm mb-2"
                                >
                                  Afficher
                                  <i className="mdi mdi-tooltip-edit"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination className="d-flex justify-content-center mt-5">
                <Pagination.Prev
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <i
                    className="mdi mdi-arrow-left-bold-circle-outline"
                    style={{ fontSize: "1.5em" }}
                  />
                </Pagination.Prev>
                {numbers.map((n, i) => (
                  <Pagination.Item
                    className={`${currentPage === n ? "active" : ""}`}
                    key={i}
                    style={{ fontSize: "1.5em" }}
                    onClick={() => changeCurrentPage(n)}
                  >
                    {n}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={nextPage}
                  disabled={currentPage === numberPages}
                >
                  <i
                    className="mdi mdi-arrow-right-bold-circle-outline"
                    style={{ fontSize: "1.5em" }}
                  />
                </Pagination.Next>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantFeedback;
