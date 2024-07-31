import { Button, Form, InputGroup } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import axios from "../../services/axios";
import { apiFetch } from "../../services/api";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { IoStatsChartSharp } from "react-icons/io5";
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
import { fetchAllSessions } from "../../services/SessionServices";
import ReactPaginate from "react-paginate";

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
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [sentiments, setSentiments] = useState(null);
  const [averagePerQuestion, setAveragePerQuestion] = useState(null);
  const [averagePerParticipant, setAveragePerParticipant] = useState(null);
  const [totalAverage, setTotalAverage] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formationsAvgChart, setFormationsAvgChart] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 2;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = feedbacks?.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(feedbacks?.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % feedbacks.length;
    setItemOffset(newOffset);
  };

  const optionsFormationsAvg = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Score moyen par formation",
      },
    },
  };

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
    fetchAllSessions().then(setSessions);

    const u = async () => {
      const d = await fetchData();
      setFeedbacks(d);
    };

    if (selectedSession) u();
  }, [selectedSession]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!localStorage.getItem("token")) {
        let responsesNotToken = [];

        const surveys = await axios.get(`/api/get-all-surveys`);

        if (surveys.data.length > 0) {
          let ids = [];
          for (let index = 0; index < surveys.data.length; index++) {
            if (surveys.data[index].session_ids.length > 0) {
              ids = surveys.data[index].session_ids.map((id) => id);
            }
          }

          if (ids.includes(selectedSession)) {
            try {
              const response = await axios.post(
                `http://localhost:8000/api/get-form-responses`,
                {
                  surveyId: surveys.data[0].surveyId,
                  sessionId: selectedSession,
                },
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );
              responsesNotToken.push(response.data);
            } catch (error) {
              console.error(`Error fetching responses : `, error);
            }

            setLoading(false);
            return responsesNotToken;
          } else {
            Swal.fire({
              icon: "warning",
              title: "Cette session de formation n'a pas de feedbacks !",
              showConfirmButton: false,
              timer: 3000,
            });
            setLoading(false);
          }
        }
      } else {
        let responsesToken = [];

        const surveys = await apiFetch(`get-all-surveys`);

        const headers = {
          "Content-Type": "multipart/form-data",
        };

        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        if (surveys.length > 0) {
          let ids = [];
          for (let index = 0; index < surveys.length; index++) {
            if (surveys[index].session_ids.length > 0) {
              ids = surveys[index].session_ids.map((id) => id);
            }
          }
          if (ids.includes(selectedSession)) {
            for (let index = 0; index < ids.length; index++) {
              try {
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
              } catch (error) {
                console.error(`Error fetching responses : `, error);
              }
            }

            setLoading(false);
            return responsesToken;
          }
        }
      }
    } catch (error) {
      setLoading(false);
      console.log("Error fetching feedbacks :", error);
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

    try {
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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops... !",
        text: error.response.data.message,
        showConfirmButton: false,
        timer: 5000,
      });
      console.log(error);
    }
  };

  const createFormationsAvgChart = (data) => {
    const labels = data.map((item) => `${item.reference}`);
    const averages = data.map((item) => item.averageFeedback);

    setFormationsAvgChart({
      labels,
      datasets: [
        {
          label: "Score moyen",
          data: averages,
          backgroundColor: averages.map((score) =>
            score > 3 ? "rgba(0, 208, 130, 0.6)" : "rgba(34, 62, 156, 0.6)"
          ),
          borderColor: averages.map((score) =>
            score > 3 ? "rgba(0, 208, 130, 1)" : "rgba(34, 62, 156, 1)"
          ),
          borderWidth: 1,
        },
      ],
    });
  };

  const handleAvgFormations = async () => {
    try {
      if (!localStorage.getItem("token")) {
        const response = await axios.get("/api/formation-averages");
        createFormationsAvgChart(response.data);
      } else {
        const response = await apiFetch("formation-averages");
        createFormationsAvgChart(response);
      }
    } catch (error) {
      console.log("Error fetching formation-averages :", error);
    }
  };

  const fetchParticipantsIds = async () => {
    try {
      if (!localStorage.getItem("token")) {
        const response = await axios.get(`/api/participant-ids`);
        return response.data;
      } else {
        const response = await apiFetch(`participant-ids`);
        return response;
      }
    } catch (error) {
      console.log("Error fetching formation-averages :", error);
    }
  };

  const handleRecomendations = async () => {
    setLoading(true);

    const participantIds = await fetchParticipantsIds();

    if (participantIds.length > 0) {
      participantIds.forEach(async (id) => {
        try {
          if (!localStorage.getItem("token")) {
            const response = await axios.get(`/api/get-recommendations/${id}`);
            console.log(response.data);
            if (response) {
              setLoading(false);
            }
          } else {
            const response = await apiFetch(`get-recommendations/${id}`);
            console.log(response);
            if (response) {
              setLoading(false);
            }
          }
        } catch (error) {
          setLoading(false);
          console.log("Error fetching recommendations :", error);
        }
      });
    }
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
              <div className="d-flex justify-content-center mt-3">
                <Form>
                  <div>
                    <div>
                      <Form.Group>
                        <InputGroup>
                          <Form.Select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            required
                          >
                            <option value="">
                              Séléctionner une session pour voir ses feedbacks
                            </option>
                            {sessions?.length > 0 &&
                              sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title} - {s.reference}
                                </option>
                              ))}
                          </Form.Select>
                        </InputGroup>
                      </Form.Group>
                    </div>
                  </div>
                </Form>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    {feedbacks?.length > 0 &&
                      currentItems?.length > 0 &&
                      currentItems.map((f, i) => (
                        <tr key={i}>
                          {f.data[0].length > 0 &&
                            f.data[0].map((q, ind) => (
                              <th key={ind} style={{ color: "black" }}>
                                {q}
                              </th>
                            ))}
                        </tr>
                      ))}
                  </thead>
                  <tbody>
                    {feedbacks?.length > 0 &&
                      currentItems.map((f) =>
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
                      )}
                  </tbody>
                </table>
              </div>
              {feedbacks?.length > 0 && currentItems?.length > 0 && (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="->"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={2}
                  pageCount={pageCount}
                  previousLabel="<-"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination justify-content-center mt-4"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousClassName="page-item"
                  previousLinkClassName="page-link"
                  nextClassName="page-item"
                  nextLinkClassName="page-link"
                  breakClassName="page-item"
                  breakLinkClassName="page-link"
                  activeClassName="active"
                />
              )}
              <div className="my-5 d-flex justify-content-center">
                {feedbacks?.length > 0 && selectedSession && (
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
                    <div className="d-flex justify-content-center my-3">
                      <p>
                        La moyenne totale des scores de tous les participants
                        pour cette formation est {totalAverage}
                      </p>
                    </div>
                  )}
                  <div className="d-flex justify-content-center">
                    <Button
                      className="mt-3 btn-block btn-inverse-success"
                      onClick={handleAvgFormations}
                    >
                      Afficher le score moyen pour chaque formation
                    </Button>
                  </div>
                  {formationsAvgChart && (
                    <div
                      className="col-4 chart-container m-3"
                      style={{ width: "100%", height: "400px" }}
                    >
                      <Bar
                        data={formationsAvgChart}
                        options={optionsFormationsAvg}
                      />
                    </div>
                  )}
                </div>
              )}
              {averagePerParticipant && (
                <div className="my-5 d-flex justify-content-center">
                  <Button
                    className="mt-3 btn-block btn-inverse-success"
                    onClick={handleRecomendations}
                  >
                    Afficher les recommendations des formations pour tous les
                    participants
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantFeedback;
