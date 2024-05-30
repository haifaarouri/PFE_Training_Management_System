import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { Badge, Card, Carousel, Pagination, Row } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import {
  editStatusCommande,
  fetchAllCommandes,
} from "../../services/CommandeServices";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { TbTruckDelivery } from "react-icons/tb";
import { MdRemoveShoppingCart } from "react-icons/md";
require("moment/locale/fr");

function AllConfirmedCommandes() {
  const [commandes, setCommandes] = useState([]);
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
  const [showList, setShowList] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [userAuth, setUserAuth] = useState(null);
  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      let confirmed = d.length > 0 && d.filter((c) => c.status === "Confirmé");
      setCommandes(confirmed);
    };

    u();
  }, []);

  useEffect(() => {
    setUserAuth(result.user);
  }, [result.user]);

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

  const fetchData = async () => {
    try {
      const response = await fetchAllCommandes();

      return response;
    } catch (error) {
      console.log("Error fetching Commandes :", error);
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

  const handleListView = () => {
    setShowList(true);
    setShowCarousel(false);
  };

  const handleCarouselView = () => {
    setShowCarousel(true);
    setShowList(false);
  };

  const handleDelivredCommande = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, commande livrée !",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await editStatusCommande(id, "Réceptionné");
          if (res.message) {
            Swal.fire({
              title: "Confirmée avec succès!",
              text: "Commande est confirmée et en cours de livraison !",
              icon: "success",
            });
            const d = await fetchData();
            setCommandes(d);
            handleSuccess(res.message);
          }
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

  const handleConsumeCommande = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, commande consommée !",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await editStatusCommande(id, "Consommé");
          if (res.message) {
            Swal.fire({
              title: "Annulée avec succès!",
              text: "Commande est non confirmée !",
              icon: "success",
            });
            const d = await fetchData();
            setCommandes(d);
            handleSuccess(res.message);
          }
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
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
                  Liste des commandes confirmées
                </h4>
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
              {showList && (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Date de création</th>
                          <th>Date de livraison maximale</th>
                          <th>Etat</th>
                          <th>Mode de Paiement</th>
                          <th>Total</th>
                          <th>Produits</th>
                          <th>Furnisseurs</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commandes.length > 0 &&
                          userAuth &&
                          userAuth.role === "ServiceFinancier" &&
                          commandesPage.map((c, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{c.date}</h6>
                                </td>
                                <td>
                                  <h6>{c.deliveryDate}</h6>
                                </td>
                                <td>
                                  <Badge
                                    bg={
                                      c.status === "Brouillon"
                                        ? "secondary"
                                        : c.status === "EnCours"
                                        ? "primary"
                                        : c.status === "Confirmé" ||
                                          c.status === "Réceptionné"
                                        ? "success"
                                        : "danger"
                                    }
                                    className="fs-5"
                                    pill
                                  >
                                    {c.status}
                                  </Badge>
                                </td>
                                <td>{c.paymentMethod}</td>
                                <td>{c.total} DT</td>
                                <td>
                                  {Array.isArray(c.produits) &&
                                    c.produits.map((p, i) => {
                                      return <p key={i}>{p.name}</p>;
                                    })}
                                </td>
                                <td>
                                  {Array.isArray(c.produits) &&
                                    c.produits.map((p, i) => {
                                      return (
                                        <p key={i}>{p.fournisseur.name}</p>
                                      );
                                    })}
                                </td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() =>
                                        handleDelivredCommande(c.id)
                                      }
                                      className="btn btn-sm mb-2"
                                      disabled={c.status === "Réceptionné"}
                                    >
                                      Commande livrée{" "}
                                      <TbTruckDelivery
                                        style={{ fontSize: 18 }}
                                      />
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleConsumeCommande(c.id)
                                      }
                                      variant="outline-success"
                                      className="btn btn-sm mb-2"
                                      disabled={c.status === "Consommé"}
                                    >
                                      Commande consommée{" "}
                                      <MdRemoveShoppingCart size={18} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
                  {userAuth &&
                    userAuth.role === "ServiceFinancier" &&
                    commandes.length > 0 &&
                    commandes.map((c, idx) => {
                      return (
                        <Carousel.Item key={idx} className="row">
                          <div
                            className="d-flex justify-content-end row"
                            style={{ marginRight: "5%" }}
                          >
                            <Button
                              onClick={() => handleDelivredCommande(c.id)}
                              className="btn btn-sm m-1 btn-rounded col-lg-2 col-xs-12 col-md-8"
                            >
                              Commande livrée{" "}
                              <TbTruckDelivery style={{ fontSize: 18 }} />
                            </Button>
                            <Button
                              onClick={() => handleConsumeCommande(c.id)}
                              className="btn btn-sm m-1 btn-success btn-rounded col-lg-2 col-xs-12 col-md-8"
                              style={{ color: "white" }}
                            >
                              Commande consommée{" "}
                              <MdRemoveShoppingCart size={18} />
                            </Button>
                          </div>
                          <div className="m-lg-5 m-md-5 m-sm-0 m-xs-0 p-sm-0 p-xs-0">
                            <Card className="shadow-lg p-3 rounded">
                              <Card.Body>
                                <Card.Title>
                                  <h3>Date de création : {c.date}</h3>
                                  <h3>
                                    {" "}
                                    Date de livaraison maximale :{" "}
                                    {c.deliveryDate}
                                  </h3>
                                </Card.Title>
                                <Card.Text className="d-flex justify-content-evenly row">
                                  <div className="mt-5 mb-5 col-sm-12 col-md-12 col-lg-6">
                                    <p>
                                      <span className="text-primary fw-bold">
                                        Etat de la commande :
                                      </span>{" "}
                                      <Badge
                                        bg={
                                          c.status === "Brouillon"
                                            ? "secondary"
                                            : c.status === "EnCours"
                                            ? "primary"
                                            : c.status === "Confirmé" ||
                                              c.status === "Réceptionné"
                                            ? "success"
                                            : "danger"
                                        }
                                        className="fs-5"
                                        pill
                                      >
                                        {c.status}
                                      </Badge>
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
                                                  <dt>Quantité</dt>
                                                  <dd>{p.quantity}</dd>
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

export default AllConfirmedCommandes;
