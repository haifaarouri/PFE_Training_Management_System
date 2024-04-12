import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";
import {
  FaCartArrowDown,
  FaCartPlus,
  FaLuggageCart,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaMoneyCheck,
  FaPhone,
  FaPlusCircle,
} from "react-icons/fa";
import { MdCategory, MdDeleteForever, MdEmail } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import { IoIosPricetags } from "react-icons/io";
import { IoPerson } from "react-icons/io5";
import { FcRules } from "react-icons/fc";
import { SiBandsintown, SiOpenstreetmap } from "react-icons/si";
import { PiFileZipDuotone } from "react-icons/pi";
import { BsFillPinMapFill } from "react-icons/bs";

const CommandeModal = ({ show, handleClose }) => {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [produits, setProduits] = useState([]);
  const [total, setTotal] = useState([""]);
  const [showProduct, setShowProduct] = useState(false);

  // Function to handle adding a new product
  const addProduct = () => {
    setProduits([
      ...produits,
      {
        name: "",
        price: "",
        category: "",
        supplierName: "",
        supplierEmail: "",
        supplierPhoneNumber: "",
        supplierPaymentConditions: "",
        numero_rue: "",
        nom_rue: "",
        ville: "",
        code_postal: "",
        pays: "",
        region: "",
      },
    ]);
  };

  // Function to handle removing a product
  const removeProduct = (index) => {
    const newProducts = [...produits];
    newProducts.splice(index, 1);
    setProduits(newProducts);
  };

  // Function to handle product change
  const handleProductChange = (index, event) => {
    const newProducts = [...produits];
    newProducts[index][event.target.name] = event.target.value;
    setProduits(newProducts);
  };

  const csrf = () => axios.get("/sanctum/csrf-cookie");

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

  const handleAddCommande = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("date", date);
      formData.append("status", status);
      formData.append("quantity", quantity);
      formData.append("paymentMethod", paymentMethod);
      formData.append("total", total);
      produits.forEach((product, index) => {
        Object.keys(product).forEach((key) => {
          formData.append(`produits[${index}][${key}]`, product[key]);
        });
      });

      if (!localStorage.getItem("token")) {
        const res = await axios.post("/api/add-commande", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Commande ajoutée avec succès !",
            showConfirmButton: false,
            timer: 1500,
          });

          setDate("");
          setPaymentMethod("");
          setQuantity("");
          setStatus("");
          setTotal("");
          setProduits([]);

          handleClose();
        }
      } else {
        const headers = {
          "Content-Type": "multipart/form-data",
        };

        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.post("/api/add-commande", formData, {
          headers: headers,
        });
        console.log(response);

        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Commande ajoutée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setDate("");
          setPaymentMethod("");
          setQuantity("");
          setStatus("");
          setTotal("");
          setProduits([]);

          handleClose();
        }
      }
    } catch (error) {
      if (error) {
        if (error.response.data.error) {
          Object.values(error.response.data.error).forEach((element) => {
            handleError(element[0]);
          });
        }
        handleError(error.response.data.message);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Quelque chose s'est mal passé !",
        });
      }
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg"
      fullscreen="lg-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Formulaire pour ajouter une nouvelle demande d'une Commande
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddCommande}
        >
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i className="mdi mdi-calendar text-primary" />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="date"
                type="date"
                placeholder="Saisir la date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la date de la commande !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Etat de la commande</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i className="mdi mdi-ev-station text-primary" />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option>Selectionner l'état de la commande</option>
                <option value="Brouillon">Brouillon</option>
                <option value="EnCours">EnCours</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Annulé">Annulé</option>
                <option value="Réceptionné">Réceptionné</option>
                <option value="Consommé">Consommé</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner l'état de la commande !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantité</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaCartPlus className="text-primary" />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="quantity"
                type="number"
                placeholder="Saisir la quantité"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la quantité des produits de catte commande !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mode de Paiement</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaMoneyCheck className="text-primary" />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="paymentMethod"
                type="text"
                placeholder="Saisir le Mode de Paiement"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                minLength={8}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le Mode de Paiement de la commande !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Total</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <GiMoneyStack className="text-primary" />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="total"
                type="number"
                placeholder="Saisir le Total"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le Total de la commande !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Button
            className="mt-3 btn-icon-text btn-icon-prepend btn-info"
            style={{ color: "white" }}
            onClick={() => setShowProduct(!showProduct)}
          >
            Ajouter des Produits{" "}
            <FaCartArrowDown style={{ fontSize: "1.5em" }} />
          </Button>
          {showProduct && (
            <div className="shadow-lg p-3 mb-5 mt-5 bg-white rounded">
              {produits.map((product, index) => (
                <div key={index}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom du produit</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <FaLuggageCart
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="name"
                        type="text"
                        placeholder="Saisir le nom"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez sélectionner le nom du produit !
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Prix</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <IoIosPricetags
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="price"
                        type="double"
                        placeholder="Saisir le Prix"
                        value={product.price}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir le Prix du poduit !
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Catégorie du produit</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <MdCategory
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Select
                        name="category"
                        value={product.category}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                      >
                        <option value="">Selectionner l'état de la commande</option>
                        <option value="Alimentaire">Alimentaire</option>
                        <option value="Pharmaceutique">Pharmaceutique</option>
                        <option value="TicketRestaurant">
                          TicketRestaurant
                        </option>
                      </Form.Select>
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez sélectionner la catégorie de ce produit !
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <div className="shadow-lg p-3 mb-5 mt-5 bg-white rounded">
                    <Form.Group className="mb-3">
                      <Form.Label>Nom du fournisseur</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text bg-transparent border-right-0">
                              <IoPerson
                                className="text-primary"
                                style={{ fontSize: "1.5em" }}
                              />
                            </span>
                          </div>
                        </InputGroup.Text>
                        <Form.Control
                          name="supplierName"
                          type="text"
                          placeholder="Saisir le nom"
                          value={product.supplierName}
                          onChange={(e) => handleProductChange(index, e)}
                          required
                        />
                        <Form.Control.Feedback>
                          Cela semble bon !
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          Veuillez sélectionner le nom du fournisseur !
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>E-mail</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text bg-transparent border-right-0">
                              <MdEmail
                                className="text-primary"
                                style={{ fontSize: "1.5em" }}
                              />
                            </span>
                          </div>
                        </InputGroup.Text>
                        <Form.Control
                          name="supplierEmail"
                          type="email"
                          placeholder="Saisir l'e-mail"
                          value={product.supplierEmail}
                          onChange={(e) => handleProductChange(index, e)}
                          required
                        />
                        <Form.Control.Feedback>
                          Cela semble bon !
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          Veuillez saisir l'e-mail du fournisseur !
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro de téléphone</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text bg-transparent border-right-0">
                              <FaPhone
                                className="text-primary"
                                style={{ fontSize: "1.5em" }}
                              />
                            </span>
                          </div>
                        </InputGroup.Text>
                        <Form.Control
                          name="supplierPhoneNumber"
                          type="text"
                          value={product.supplierPhoneNumber}
                          onChange={(e) => handleProductChange(index, e)}
                          placeholder="Saisir le numéro de téléphone"
                          required
                          minLength={8}
                        />
                        <Form.Control.Feedback>
                          Cela semble bon !
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          Veuillez saisir le numéro de téléphone du fournisseur
                          minimum 8 caractères !
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Conditions de paiement</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text bg-transparent border-right-0">
                              <FcRules
                                className="text-primary"
                                style={{ fontSize: "1.5em" }}
                              />
                            </span>
                          </div>
                        </InputGroup.Text>
                        <Form.Control
                          name="supplierPaymentConditions"
                          type="text"
                          value={product.supplierPaymentConditions}
                          onChange={(e) => handleProductChange(index, e)}
                          placeholder="Saisir les conditions de paiement"
                          required
                        />
                        <Form.Control.Feedback>
                          Cela semble bon !
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          Veuillez saisir les conditions de paiement du
                          fournisseur !
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <div className="shadow-lg p-3 mb-5 mt-5 bg-white rounded">
                      <Row className="mb-3">
                        <Form.Group as={Col} className="mb-3">
                          <Form.Label>Numero de la Rue</Form.Label>
                          <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-sm">
                              <div className="input-group-prepend bg-transparent">
                                <span className="input-group-text bg-transparent border-right-0">
                                  <FaMapMarkedAlt className="text-primary" />
                                </span>
                              </div>
                            </InputGroup.Text>
                            <Form.Control
                              name="numero_rue"
                              type="number"
                              placeholder="numero du rue"
                              value={product.numero_rue}
                              onChange={(e) => handleProductChange(index, e)}
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                          <Form.Label>Nom de la Rue</Form.Label>
                          <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-sm">
                              <div className="input-group-prepend bg-transparent">
                                <span className="input-group-text bg-transparent border-right-0">
                                  <FaMapMarkerAlt className="text-primary" />
                                </span>
                              </div>
                            </InputGroup.Text>
                            <Form.Control
                              name="nom_rue"
                              type="text"
                              placeholder="nom de la rue"
                              value={product.nom_rue}
                              onChange={(e) => handleProductChange(index, e)}
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                          <Form.Label>Ville</Form.Label>
                          <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-sm">
                              <div className="input-group-prepend bg-transparent">
                                <span className="input-group-text bg-transparent border-right-0">
                                  <SiBandsintown className="text-primary" />
                                </span>
                              </div>
                            </InputGroup.Text>
                            <Form.Control
                              name="ville"
                              type="text"
                              placeholder="ville"
                              value={product.ville}
                              onChange={(e) => handleProductChange(index, e)}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Row>
                      <Row>
                        <Form.Group as={Col} className="mb-3">
                          <Form.Label>Code Postal</Form.Label>
                          <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-sm">
                              <div className="input-group-prepend bg-transparent">
                                <span className="input-group-text bg-transparent border-right-0">
                                  <PiFileZipDuotone className="text-primary" />
                                </span>
                              </div>
                            </InputGroup.Text>
                            <Form.Control
                              name="code_postal"
                              type="text"
                              placeholder="code postal"
                              value={product.code_postal}
                              onChange={(e) => handleProductChange(index, e)}
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                          <Form.Label>Pays</Form.Label>
                          <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-sm">
                              <div className="input-group-prepend bg-transparent">
                                <span className="input-group-text bg-transparent border-right-0">
                                  <SiOpenstreetmap className="text-primary" />
                                </span>
                              </div>
                            </InputGroup.Text>
                            <Form.Control
                              name="pays"
                              type="text"
                              placeholder="pays"
                              value={product.pays}
                              onChange={(e) => handleProductChange(index, e)}
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                          <Form.Label>Région</Form.Label>
                          <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-sm">
                              <div className="input-group-prepend bg-transparent">
                                <span className="input-group-text bg-transparent border-right-0">
                                  <BsFillPinMapFill className="text-primary" />
                                </span>
                              </div>
                            </InputGroup.Text>
                            <Form.Control
                              name="region"
                              type="text"
                              placeholder="région"
                              value={product.region}
                              onChange={(e) => handleProductChange(index, e)}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Row>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <Button
                      className="btn btn-info btn-rounded btn-icon btn-inverse-danger"
                      onClick={() => removeProduct(index)}
                    >
                      <MdDeleteForever size={25} />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-end">
                <Button
                  className="my-3 btn btn-info btn-rounded btn-icon btn-inverse-info"
                  onClick={addProduct}
                >
                  <FaPlusCircle size={25} />
                </Button>
              </div>
            </div>
          )}
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Ajouter
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CommandeModal;