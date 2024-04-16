import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, Col, Row } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  editCommande,
  fetchCommandeById,
} from "../../services/CommandeServices";

const EditCommande = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [commande, setCommande] = useState({
    date: "",
    quantity: "",
    paymentMethod: "",
    total: "",
  });
  const [produits, setProduits] = useState([]);
  const [showProduct, setShowProduct] = useState(false);
  const [addSupplier, setAddSupplier] = useState(false);

  const addProduct = () => {
    setProduits([
      ...produits,
      {
        name: "",
        price: "",
        category: "",
        fournisseur: {
          name: "",
          email: "",
          phoneNumber: "",
          paymentConditions: "",
          address: {
            numero_rue: "",
            nom_rue: "",
            ville: "",
            code_postal: "",
            pays: "",
            region: "",
          },
        },
      },
    ]);
  };

  const removeProduct = (index) => {
    const newProducts = [...produits];
    newProducts.splice(index, 1);
    setProduits(newProducts);
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    setProduits((prevState) => {
      const updatedProduits = [...prevState];
      let currentPart = updatedProduits[index];

      // Iterate through the keys except for the last one
      for (let i = 0; i < keys.length - 1; i++) {
        // If the key is 'fournisseur', it will navigate to that part
        currentPart = currentPart[keys[i]];
      }

      // Update the last key with the new value
      // For 'fournisseur.name', it will update the 'name' property
      currentPart[keys[keys.length - 1]] = value;

      return updatedProduits;
    });
  };

  useEffect(() => {
    const fetchCommande = async () => {
      const commandeData = await fetchCommandeById(id);
      setCommande(commandeData);
      commandeData.produits.length > 0 && setProduits(commandeData.produits);
    };

    if (id) {
      fetchCommande();
    }
  }, [id]);

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

  const handleUpdateCommande = async (event) => {
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
      formData.append("_method", "PUT");
      formData.append("date", commande.date);
      formData.append("quantity", commande.quantity);
      formData.append("paymentMethod", commande.paymentMethod);
      formData.append("total", commande.total);
      formData.append("produits", JSON.stringify(produits));
      produits.forEach((p, index) => {
        Object.keys(p).forEach((key) => {
          if (key === "fournisseur") {
            formData.append(
              `produits[${index}][${key}]`,
              JSON.stringify(p[key])
            );
          } else {
            formData.append(`produits[${index}][${key}]`, p[key]);
          }
        });
      });

      const res = await editCommande(id, formData);

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Commande modifiée avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        setCommande({
          date: "",
          quantity: "",
          paymentMethod: "",
          total: "",
        });
        setProduits([]);

        navigate("/commandes");
      }
    } catch (error) {
      if (error && error.response.status === 422) {
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
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Mettre à jour les informations du Commande{" "}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateCommande}
              >
                <Form.Group className="mb-3">
                  <Form.Label>Date de la création de la commande</Form.Label>
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
                      defaultValue={commande.date}
                      disabled
                    />
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
                      value={commande.quantity}
                      onChange={(e) =>
                        setCommande((prevCmd) => ({
                          ...prevCmd,
                          quantity: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir la quantité des produits de catte commande
                      !
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
                      value={commande.paymentMethod}
                      onChange={(e) =>
                        setCommande((prevCmd) => ({
                          ...prevCmd,
                          paymentMethod: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={commande.total}
                      onChange={(e) =>
                        setCommande((prevCmd) => ({
                          ...prevCmd,
                          total: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                              <option value="">
                                Selectionner la catégorie de ce produit
                              </option>
                              <option value="Alimentaire">Alimentaire</option>
                              <option value="Pharmaceutique">
                                Pharmaceutique
                              </option>
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
                        <div className="d-flex justify-content-center">
                          <Button
                            className="my-3 btn btn-rounded btn-inverse-info"
                            onClick={() => setAddSupplier(!addSupplier)}
                          >
                            Ajouter le Fournisseur <FaPlusCircle size={25} />
                          </Button>
                        </div>
                        {addSupplier && (
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
                                  name="fournisseur.name"
                                  type="text"
                                  placeholder="Saisir le nom"
                                  value={product.fournisseur.name}
                                  onChange={(e) =>
                                    handleProductChange(index, e)
                                  }
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
                                  name="fournisseur.email"
                                  type="email"
                                  placeholder="Saisir l'e-mail"
                                  value={product.fournisseur.email}
                                  onChange={(e) =>
                                    handleProductChange(index, e)
                                  }
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
                                  name="fournisseur.phoneNumber"
                                  type="text"
                                  value={product.fournisseur.phoneNumber}
                                  onChange={(e) =>
                                    handleProductChange(index, e)
                                  }
                                  placeholder="Saisir le numéro de téléphone"
                                  required
                                  minLength={8}
                                />
                                <Form.Control.Feedback>
                                  Cela semble bon !
                                </Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                  Veuillez saisir le numéro de téléphone du
                                  fournisseur minimum 8 caractères !
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
                                  name="fournisseur.paymentConditions"
                                  type="text"
                                  value={product.fournisseur.paymentConditions}
                                  onChange={(e) =>
                                    handleProductChange(index, e)
                                  }
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
                                      name="fournisseur.address.numero_rue"
                                      type="number"
                                      placeholder="numero du rue"
                                      value={
                                        product.fournisseur.address.numero_rue
                                      }
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
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
                                      name="fournisseur.address.nom_rue"
                                      type="text"
                                      placeholder="nom de la rue"
                                      value={
                                        product.fournisseur.address.nom_rue
                                      }
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
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
                                      name="fournisseur.address.ville"
                                      type="text"
                                      placeholder="ville"
                                      value={product.fournisseur.address.ville}
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
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
                                      name="fournisseur.address.code_postal"
                                      type="text"
                                      placeholder="code postal"
                                      value={
                                        product.fournisseur.address.code_postal
                                      }
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
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
                                      name="fournisseur.address.pays"
                                      type="text"
                                      placeholder="pays"
                                      value={product.fournisseur.address.pays}
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
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
                                      name="fournisseur.address.region"
                                      type="text"
                                      placeholder="région"
                                      value={product.fournisseur.address.region}
                                      onChange={(e) =>
                                        handleProductChange(index, e)
                                      }
                                    />
                                  </InputGroup>
                                </Form.Group>
                              </Row>
                            </div>
                          </div>
                        )}
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
                        className="my-3 btn btn-info btn-icon btn-rounded btn-inverse-info"
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
                    Mettre à jour
                  </Button>
                </div>
              </Form>
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCommande;
