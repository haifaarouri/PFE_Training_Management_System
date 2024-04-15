import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Card, Carousel, Form, InputGroup, Pagination, Row } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import CommandeModal from "../../components/CommandeModal";
import { fetchAllCommandes } from "../../services/CommandeServices";
require("moment/locale/fr");

function AllCommandes() {
  const [commandes, setCommandes] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const commandesPerPage = 2;
  const lastIndex = currentPage * commandesPerPage;
  const firstIndex = lastIndex - commandesPerPage;
  const commandesPage =
    commandes.length > 0 && commandes.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    commandes.length > 0 && commandes.length / commandesPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setCommandes(d);
    };

    u();
  }, []);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne") {
      const newFilter =
        commandes.length > 0 &&
        commandes.filter((Commande) =>
          Commande[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else {
      const newFilter =
        commandes.length > 0 &&
        commandes.filter((Commande) => {
          const CommandeFields = Object.values(Commande)
            .join(" ")
            .toLowerCase();
          return CommandeFields.includes(searchWord);
        });
      setFilteredData(newFilter);
    }
  };

  const handleShowAddModal = () => setShowModal(true);
  const handleCloseAddModal = () => setShowModal(false);

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleError = (err) =>
    toast.error(err, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleButtonEdit = (id) => {
    navigate(`/edit-commande/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllCommandes();

      return response;
    } catch (error) {
      console.log("Error fetching Commandes :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setCommandes(d);
    };

    u();
  }, [showModal]);

  //   const handleDeleteCommande = async (id) => {
  //     Swal.fire({
  //       title: "Êtes-vous sûr?",
  //       text: "Vous ne pourrez pas revenir en arrière !",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#3085d6",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Oui, supprimer!",
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         try {
  //           const res = await deleteCommande(id);
  //           Swal.fire({
  //             title: "Supprimé avec succès!",
  //             text: "Commande est supprimé !",
  //             icon: "success",
  //           });
  //           const d = await fetchData();
  //           setCommandes(d);
  //           handleSuccess(res.message);
  //         } catch (error) {
  //           if (error && error.response.status === 422) {
  //             handleError(error.response.data.message);
  //           }
  //         }
  //       }
  //     });
  //   };

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

  const handleListView = () => {
    setShowList(true);
    setShowCarousel(false);
  };

  const handleCarouselView = () => {
    setShowCarousel(true);
    setShowList(false);
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <ToastContainer />
              <div className="d-flex justify-content-between">
                <h4 className="card-title mb-5 mt-2">
                  Liste de toutes les commandes
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter une Commande
                </Button>
              </div>
              <div className="d-flex justify-content-end px-3 py-3">
                <div className="btn-group">
                  <Button
                    className="btn btn-lg btn-inverse-success btn-icon"
                    onClick={handleListView}
                  >
                    <i className="icon-lg mdi mdi-view-list"></i>
                  </Button>
                  <Button
                    className="btn btn-lg btn-inverse-success btn-icon"
                    onClick={handleCarouselView}
                  >
                    <i className="icon-lg mdi mdi-view-carousel"></i>
                  </Button>
                </div>
              </div>
              <CommandeModal
                show={showModal}
                handleClose={handleCloseAddModal}
              />
              {showList && (
                <>
                  <div className="d-flex justify-content-center mt-3 mb-5">
                    <Form style={{ width: "50%" }}>
                      <div className="inner-form">
                        <div className="input-select">
                          <Form.Group>
                            <InputGroup>
                              <Form.Select
                                style={{ border: "none" }}
                                value={columnName}
                                onChange={(e) => {
                                  return setColumnName(e.target.value);
                                }}
                                required
                              >
                                <option value="">Colonne</option>
                                <option value="lastName">Nom</option>
                                <option value="firstName">Prénom</option>
                                <option value="email">E-mail</option>
                                <option value="type">Type</option>
                                <option value="speciality">Spécialité</option>
                                <option value="disponibility">
                                  Disponibilité
                                </option>
                              </Form.Select>
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
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Etat</th>
                          <th>Quantité</th>
                          <th>Mode de Paiement</th>
                          <th>Total</th>
                          <th>Produits</th>
                          <th>Furnisseurs</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((c, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{c.date}</h6>
                                </td>
                                <td>
                                  <div
                                    pill
                                    className="badge badge-outline-success badge-pill"
                                  >
                                    {c.status}
                                  </div>
                                </td>
                                <td>{c.quantity}</td>
                                <td>{c.paymentMethod}</td>
                                <td>{c.total} DT</td>
                                <td>
                                  {Array.isArray(c.produits) &&
                                    c.produits.map((p, i) => {
                                      return <p>{p.name}</p>;
                                    })}
                                </td>
                                <td>
                                  {Array.isArray(c.produits) &&
                                    c.produits.map((p, i) => {
                                      return <p>{p.fournisseur.name}</p>;
                                    })}
                                </td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleButtonEdit(c.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Modifier{" "}
                                      <i className="mdi mdi-tooltip-edit"></i>
                                    </Button>
                                    <Button
                                      //   onClick={
                                      // handleDeleteCommande(c.id)
                                      //   }
                                      variant="outline-danger"
                                      className="btn btn-sm"
                                    >
                                      Supprimer{" "}
                                      <i className="mdi mdi-delete"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : filteredData.length === 0 &&
                          commandes.length === 0 ? (
                          <></>
                        ) : (
                          commandes.length > 0 &&
                          commandesPage.map((c, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{c.date}</h6>
                                </td>
                                <td>
                                  <div
                                    pill
                                    className="badge badge-outline-success badge-pill"
                                  >
                                    {c.status}
                                  </div>
                                </td>
                                <td>{c.quantity}</td>
                                <td>{c.paymentMethod}</td>
                                <td>{c.total} DT</td>
                                <td>
                                  {Array.isArray(c.produits) &&
                                    c.produits.map((p, i) => {
                                      return <p>{p.name}</p>;
                                    })}
                                </td>
                                <td>
                                  {Array.isArray(c.produits) &&
                                    c.produits.map((p, i) => {
                                      return <p>{p.fournisseur.name}</p>;
                                    })}
                                </td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleButtonEdit(c.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Modifier{" "}
                                      <i className="mdi mdi-tooltip-edit"></i>
                                    </Button>
                                    <Button
                                      //   onClick={
                                      // handleDeleteCommande(c.id)
                                      //   }
                                      variant="outline-danger"
                                      className="btn btn-sm"
                                    >
                                      Supprimer{" "}
                                      <i className="mdi mdi-delete"></i>
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
                </>
              )}
              {showCarousel && (
                <Carousel
                  style={{ backgroundColor: "#D2D8EB" }}
                  className="shadow-lg p-5 mb-5 rounded"
                >
                  {commandes.length > 0 &&
                    commandes.map((c, idx) => {
                      return (
                        <Carousel.Item key={idx} className="row">
                          <div
                            className="d-flex justify-content-end row"
                            style={{ marginRight: "5%" }}
                          >
                            <Button
                              onClick={() => handleButtonEdit(c.id)}
                              className="btn btn-sm m-1 btn-dark btn-rounded col-lg-2 col-xs-12"
                            >
                              Modifier <i className="mdi mdi-tooltip-edit"></i>
                            </Button>
                            <Button
                              //   onClick={() => handleDeleteCommande(c.id)}
                              className="btn btn-sm m-1 btn-rounded col-lg-2 col-xs-12"
                            >
                              Supprimer <i className="mdi mdi-delete"></i>
                            </Button>
                          </div>
                          <div className="m-lg-5 m-md-5 m-sm-0 m-xs-0 p-sm-0 p-xs-0">
                            <Card className="shadow-lg p-3 rounded">
                              <Card.Body>
                                <Card.Title>
                                  <h2>{c.date}</h2>
                                </Card.Title>
                                <Card.Text className="d-flex justify-content-evenly row">
                                  <div className="mt-5 mb-5 col-sm-12 col-md-12 col-lg-6">
                                    <p>
                                      <span className="text-primary fw-bold">
                                        Etat de la commande :
                                      </span>{" "}
                                      <div
                                        pill
                                        className="badge badge-outline-success badge-pill"
                                      >
                                        {c.status}
                                      </div>
                                    </p>
                                    <p>
                                      <span className="text-primary fw-bold">
                                        Quantité :
                                      </span>{" "}
                                      {c.quantity}
                                    </p>
                                    <p>
                                      <span className="text-primary fw-bold">
                                        Méthode de paiement :
                                      </span>{" "}
                                      {c.paymentMethod}
                                    </p>
                                    <p>
                                      <span className="text-primary fw-bold">
                                        Total :
                                      </span>{" "}
                                      {c.total} DT
                                    </p>
                                    <span className="text-primary fw-bold">
                                      Liste des produits :
                                    </span>
                                    <Row>
                                      {c.produits.length > 0 &&
                                        c.produits.map((p, i) => (
                                          <Card
                                            key={i}
                                            className="col shadow-lg p-3 rounded mt-4"
                                          >
                                            <Card.Body className="p-1">
                                              <Card.Title>{p.name}</Card.Title>
                                              <Card.Text>
                                                <dl>
                                                  <dt>Prix</dt>
                                                  <dd>{p.price} DT</dd>
                                                  <dt>Catégorie</dt>
                                                  <dd>{p.category}</dd>
                                                  <dt style={{ color: "red" }}>
                                                    Nom du fournisseur
                                                  </dt>
                                                  <dd>{p.fournisseur.name}</dd>
                                                  <dt>E-mail du fournisseur</dt>
                                                  <dd>{p.fournisseur.email}</dd>
                                                  <dt>Numéro de téléphone</dt>
                                                  <dd>
                                                    {p.fournisseur.phoneNumber}
                                                  </dd>
                                                  <dt>
                                                    Conditions de paiement du
                                                    fournisseur
                                                  </dt>
                                                  <dd>
                                                    {
                                                      p.fournisseur
                                                        .paymentConditions
                                                    }
                                                  </dd>
                                                  <dt>
                                                    Adresse du fournisseur
                                                  </dt>
                                                  <dd>
                                                    {
                                                      p.fournisseur.address
                                                        .numero_rue
                                                    }{" "}
                                                    {
                                                      p.fournisseur.address
                                                        .nom_rue
                                                    }
                                                    ,{" "}
                                                    {
                                                      p.fournisseur.address
                                                        .ville
                                                    }
                                                    ,{" "}
                                                    {
                                                      p.fournisseur.address
                                                        .code_postal
                                                    }
                                                    ,{" "}
                                                    {
                                                      p.fournisseur.address
                                                        .region
                                                    }
                                                    ,{" "}
                                                    {p.fournisseur.address.pays}
                                                  </dd>
                                                </dl>
                                              </Card.Text>
                                            </Card.Body>
                                          </Card>
                                        ))}
                                    </Row>
                                  </div>
                                </Card.Text>
                              </Card.Body>
                            </Card>
                          </div>
                        </Carousel.Item>
                      );
                    })}
                </Carousel>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllCommandes;
