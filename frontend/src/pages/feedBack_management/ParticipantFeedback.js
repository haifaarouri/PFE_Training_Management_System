import { Button, Form, InputGroup, Pagination } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import axios from "../../services/axios";
import { apiFetch } from "../../services/api";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { IoStatsChartSharp } from "react-icons/io5";
import { RiSurveyFill } from "react-icons/ri";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  defaults,
  ArcElement,
} from "chart.js";
import Swal from "sweetalert2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "center";
defaults.plugins.title.font.size = 16;
defaults.plugins.title.color = "black";

function ParticipantFeedback() {
  const [feedbacks, setFeedbacks] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 2;
  const lastIndex = currentPage * feedbacksPerPage;
  const firstIndex = lastIndex - feedbacksPerPage;
  const feedbacksPage =
    feedbacks?.length > 0 && feedbacks?.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    feedbacks?.length > 0 && feedbacks?.length / feedbacksPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [surveyTemplates, setSurveyTemplates] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [sentiments, setSentiments] = useState(null);
  const [averagePerQuestion, setAveragePerQuestion] = useState(null);
  const [averagePerParticipant, setAveragePerParticipant] = useState(null);
  const [totalAverage, setTotalAverage] = useState(null);
  const [filters, setFilters] = useState({
    sessionTitle: "",
    formationRef: "",
    formationEntitled: "",
    firstNameParticipant: "",
    lastNameParticipant: "",
    emailParticipant: "",
  });

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Score de l'analyse des sentiments par question",
      },
    },
  };

  const optionsAvgQ = {
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Score moyen par question",
      },
    },
  };

  const optionsAvgP = {
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Score moyen par participant",
      },
    },
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      // setFeedbacks(d);
    };

    u();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  const fetchFeedbacks = async () => {
    const queryParams = new URLSearchParams(filters).toString();

    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/filter-feedbacks?${queryParams}`);
      const data = await response.data;
      console.log(data);
      setFeedbacks(data);
    } else {
      const response = await apiFetch(`/api/filter-feedbacks?${queryParams}`);
      const data = await response.json();
      console.log(data);
      setFeedbacks(data);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filters]);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne") {
      const newFilter =
        feedbacks?.length > 0 &&
        feedbacks?.filter((feedback) =>
          feedback[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else {
      const newFilter =
        feedbacks?.length > 0 &&
        feedbacks?.filter((feedback) => {
          const feedbackFields = Object.values(feedback)
            .join(" ")
            .toLowerCase();
          return feedbackFields.includes(searchWord);
        });
      setFilteredData(newFilter);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!localStorage.getItem("token")) {
        let responsesNotToken = [];

        const surveys = await axios.get(`/api/get-all-surveys`);
        setSurveyTemplates(surveys.data);

        if (surveys.data.length > 0) {
          for (let index = 0; index < surveys.data.length; index++) {
            let ids = [];
            if (surveys.data[index].session_ids.length > 0) {
              ids = surveys.data[index].session_ids.map((id) => id);
            }

            for (let index = 0; index < ids.length; index++) {
              const response = await axios.post(
                `http://localhost:8000/api/get-form-responses`,
                {
                  surveyId: surveys.data[index].surveyId,
                  sessionId: parseInt(ids[index]),
                },
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );
              responsesNotToken.push(response.data);
              setLoading(false);
              return responsesNotToken;
            }
          }
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

        if (surveys.length > 0) {
          for (let index = 0; index < surveys.length; index++) {
            let ids = [];
            if (surveys[index].session_ids.length > 0) {
              ids = surveys[index].session_ids.map((id) => id);
            }

            for (let index = 0; index < ids.length; index++) {
              const response = await axios.post(
                `http://localhost:8000/api/get-form-responses`,
                {
                  surveyId: surveys[index].surveyId,
                  sessionId: parseInt(ids[index]),
                },
                {
                  headers: headers,
                }
              );
              responsesToken.push(response.data);
              setLoading(false);
              return responsesToken;
            }
          }
        }
      }
    } catch (error) {
      setLoading(false);
      console.log("Error fetching feedbacks :", error);
    }
    // finally {
    //   setLoading(false);
    // }
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

  const handleAnalyse = async (feedbacks) => {
    const formData = new FormData();
    formData.append("feedbacks", JSON.stringify(feedbacks));

    if (!localStorage.getItem("token")) {
      const res = await axios.post("/api/sentiment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSentiments(res.data[0]);

      const labels = new Set();
      const datasets = {};

      res.data[0].data.forEach((item, i) => {
        Object.keys(item).forEach((key) => {
          if (key.endsWith("_sentiment") && key !== "ParticipantID_sentiment") {
            const question = key.replace("_sentiment", "");
            labels.add(`Participant ${i + 1}`);
            if (!datasets[question]) {
              datasets[question] = [];
            }
            datasets[question].push(item[key]);
          }
        });
      });

      datasets &&
        labels &&
        setChartData({
          labels: Array.from(labels),
          datasets: Object.keys(datasets).map((key, index) => ({
            label: key,
            data: datasets[key],
            backgroundColor: () => {
              let bgColors = [];
              if (datasets) {
                for (let index = 0; index < datasets[key].length; index++) {
                  if (datasets[key][index] > 3) {
                    bgColors.push("rgba(0, 208, 130, 0.6)");
                  } else {
                    bgColors.push("rgba(34, 62, 156, 0.6)");
                  }
                }
                return bgColors;
              }
            },
            borderColor: () => {
              let borderColors = [];
              if (datasets) {
                for (let index = 0; index < datasets[key].length; index++) {
                  if (datasets[key][index] > 3) {
                    borderColors.push("rgba(0, 208, 130, 1)");
                  } else {
                    borderColors.push("rgba(34, 62, 156, 1)");
                  }
                }
                return borderColors;
              }
            },
            borderWidth: 2,
          })),
        });
    } else {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post("/api/sentiment", formData, {
        headers: headers,
      });

      setSentiments(response.data[0]);

      const labels = new Set();
      const datasets = {};

      response.data[0].data.forEach((item, i) => {
        Object.keys(item).forEach((key) => {
          if (key.endsWith("_sentiment") && key !== "ParticipantID_sentiment") {
            const question = key.replace("_sentiment", "");
            labels.add(`Participant ${i + 1}`);
            if (!datasets[question]) {
              datasets[question] = [];
            }
            datasets[question].push(item[key]);
          }
        });
      });

      datasets &&
        labels &&
        setChartData({
          labels: Array.from(labels),
          datasets: Object.keys(datasets).map((key, index) => ({
            label: key,
            data: datasets[key],
            backgroundColor: () => {
              let bgColors = [];
              if (datasets) {
                for (let index = 0; index < datasets[key].length; index++) {
                  if (datasets[key][index] > 3) {
                    bgColors.push("rgba(0, 208, 130, 0.6)");
                  } else {
                    bgColors.push("rgba(34, 62, 156, 0.6)");
                  }
                }
                return bgColors;
              }
            },
            borderColor: () => {
              let borderColors = [];
              if (datasets) {
                for (let index = 0; index < datasets[key].length; index++) {
                  if (datasets[key][index] > 3) {
                    borderColors.push("rgba(0, 208, 130, 1)");
                  } else {
                    borderColors.push("rgba(34, 62, 156, 1)");
                  }
                }
                return borderColors;
              }
            },
            borderWidth: 2,
          })),
        });
    }
  };

  const calculateAverageSentimentPerQuestion = (data) => {
    const sentimentScores = {};
    let totalEntries = {};

    data.data.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key.includes("_sentiment")) {
          const question = key.replace("_sentiment", "");
          if (!sentimentScores[question]) {
            sentimentScores[question] = 0;
            totalEntries[question] = 0;
          }
          sentimentScores[question] += entry[key];
          totalEntries[question]++;
        }
      });
    });

    const averageSentiments = {};
    Object.keys(sentimentScores).forEach((question) => {
      averageSentiments[question] =
        sentimentScores[question] / totalEntries[question];
    });

    const labels = Object.keys(averageSentiments);
    const datasets = Object.values(averageSentiments);

    const backgroundColors = datasets.map((score) =>
      score > 3 ? "rgba(0, 208, 130, 0.8)" : "rgba(34, 62, 156, 0.8)"
    );
    const borderColors = datasets.map((score) =>
      score > 3 ? "rgba(0, 208, 130, 1)" : "rgba(34, 62, 156, 1)"
    );

    setAveragePerQuestion({
      labels: labels,
      datasets: [
        {
          label: "Moyenne du score de l'analyse de sentiment",
          data: datasets,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    });
    return averageSentiments;
  };

  const calculateOverallAverageSentimentPerParticipant = async (data) => {
    let totalAverage = 0;
    let participantCount = 0;
    const participantAverages = {};
    const averages = {};

    data.data.forEach((entry) => {
      let sumSentiments = 0;
      let countSentiments = 0;
      let sessionId = entry["Session ID"]; // Extract the Session ID from the entry

      Object.keys(entry).forEach((key) => {
        if (key.includes("_sentiment")) {
          sumSentiments += entry[key];
          countSentiments++;
        }
      });
      if (countSentiments > 0) {
        const participantAverage = sumSentiments / countSentiments;
        totalAverage += participantAverage;
        participantCount++;
        participantAverages[entry["Participant ID"]] = participantAverage;

        // Store both the average and the session ID in the averages object
        averages[entry["Participant ID"]] = {
          average: participantAverage,
          sessionId: sessionId,
        };
      }
    });

    //store avg in DB
    if (!localStorage.getItem("token")) {
      const res = await axios.post(
        "/api/save-avg-feedback",
        { averages },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Feedback moyen enregistré avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } else {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        "/api/save-avg-feedback",
        { averages },
        {
          headers: headers,
        }
      );

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Feedback moyen enregistré avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }

    const overallAverage =
      participantCount > 0 ? totalAverage / participantCount : 0;

    const labels = Object.keys(participantAverages);
    const datasets = Object.values(participantAverages);

    const backgroundColors = datasets.map((score) =>
      score > 3 ? "rgba(0, 208, 130, 0.8)" : "rgba(34, 62, 156, 0.8)"
    );
    const borderColors = datasets.map((score) =>
      score > 3 ? "rgba(0, 208, 130, 1)" : "rgba(34, 62, 156, 1)"
    );

    setAveragePerParticipant({
      labels: labels,
      datasets: [
        {
          label: "Moyenne du score de l'analyse de sentiment",
          data: datasets,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    });

    setTotalAverage(overallAverage);

    return { overallAverage, participantAverages };
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
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
              {loading && <Spinner />}
              <div className="d-flex justify-content-center mt-3 mb-5">
                <div>
                  <input
                    type="text"
                    name="sessionTitle"
                    value={filters.sessionTitle}
                    onChange={handleFilterChange}
                    placeholder="Session Title"
                  />
                  {/* Repeat for other filters */}
                  <button onClick={fetchFeedbacks}>Search</button>
                  <div>
                    {feedbacks?.length > 0 &&
                      feedbacks.map((feedback) => (
                        <div key={feedback.id}>
                          {feedback.sessionTitle} -{" "}
                          {feedback.firstNameParticipant}
                        </div>
                      ))}
                  </div>
                </div>
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
                              Réference de la formation
                            </option>
                            <option value="formationEntitled">
                              Titre de la formation
                            </option>
                            <option value="firstNameParticipant">
                              Prénom du participant
                            </option>
                            <option value="lastNameParticipant">
                              Nom du participant
                            </option>
                            <option value="emailParticipant">
                              E-mail du participant
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
              <div className="d-flex justify-content-evenly">
                <p>
                  Cliquez sur ce bouton pour voir les réponses du formulaire
                  d'évaluation de la session
                </p>
                <Button onClick={fetchData}>
                  Réponses <RiSurveyFill size={20} />
                </Button>
              </div>
              {/* <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    {feedbacks?.length > 0 &&
                      feedbacksPage.map((f, i) => (
                        <tr key={i}>
                          {f.data[0].length > 0 &&
                            f.data[0].map((q, ind) => <th key={ind}>{q}</th>)}
                        </tr>
                      ))}
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((f, index) => {
                        return (
                          <tr key={index} className="text-center">
                            <td>
                              {f.data.length > 0 &&
                                f.data.map((r, i) => <p key={i}>{r}</p>)}
                            </td>
                          </tr>
                        );
                      })
                    ) : filteredData.length === 0 && feedbacks?.length === 0 ? (
                      <></>
                    ) : (
                      feedbacks?.length > 0 &&
                      feedbacksPage.map((f) =>
                        f.data.map(
                          (response, i) =>
                            i !== 0 && (
                              <tr key={i}>
                                {Object.keys(response).map((key, j) => (
                                  <td key={j}>{response[key]}</td>
                                ))}
                              </tr>
                            )
                        )
                      )
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
              <div className="my-5 d-flex justify-content-center">
                {feedbacks?.length > 0 && (
                  <Button
                    className="btn-block btn-inverse-success"
                    onClick={() => handleAnalyse(feedbacks)}
                  >
                    Analyser les sentiments des feedbacks{" "}
                    <IoStatsChartSharp size={20} />
                  </Button>
                )}
              </div>
              {chartData && (
                <div className="row card shadow-lg p-3 mb-2 bg-white rounded">
                  {chartData.datasets.length > 0 && (
                    <div
                      className="col-4 chart-container"
                      style={{ width: "100%", height: "400px" }}
                    >
                      <Bar data={chartData} options={options} />
                    </div>
                  )}
                </div>
              )}
              <div className="my-5 d-flex justify-content-center">
                {sentiments && chartData && (
                  <Button
                    className="btn-block btn-inverse-success"
                    onClick={() => {
                      calculateAverageSentimentPerQuestion(sentiments);
                      calculateOverallAverageSentimentPerParticipant(
                        sentiments
                      );
                    }}
                  >
                    Calculer la moyenne des scores
                  </Button>
                )}
              </div>
              {averagePerQuestion && (
                <div className="row card shadow-lg p-3 mb-2 bg-white rounded">
                  {averagePerQuestion.labels && averagePerQuestion.datasets && (
                    <div
                      className="col-4 chart-container"
                      style={{ width: "100%", height: "400px" }}
                    >
                      <Doughnut
                        data={averagePerQuestion}
                        options={optionsAvgQ}
                      />
                    </div>
                  )}
                </div>
              )}
              {averagePerParticipant && (
                <div className="row card shadow-lg p-3 mb-2 bg-white rounded">
                  {averagePerParticipant.labels &&
                    averagePerParticipant.datasets && (
                      <div
                        className="col-4 chart-container"
                        style={{ width: "100%", height: "400px" }}
                      >
                        <Pie
                          data={averagePerParticipant}
                          options={optionsAvgP}
                        />
                      </div>
                    )}
                  {totalAverage && (
                    <p>
                      La moyenne totale des scores de tous les participants est{" "}
                      {totalAverage}
                    </p>
                  )}
                  <div className="d-flex justify-content-center">
                    <Button className="mt-3 btn-block btn-inverse-success">
                      Afficher les recommendations des formations pour tous les
                      participants
                    </Button>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantFeedback;
