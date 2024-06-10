import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { PiFileDocDuotone } from "react-icons/pi";
import { useState, useRef } from "react";

function ParticipantFeedback() {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [type, setType] = useState("");

  return (
    <div className="content-wrapper">
      <div id="notfound">
        <div className="notfound-bg" />
        <div className="notfound">
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              {/* <div className="card shadow-lg p-3 mb-5 bg-white rounded">
                <div className="card-body"> */}
                  <h4 className="card-title mb-5 mt-2">
                    Evaluation de la session de formation
                  </h4>
                  <ToastContainer />
                  <Form
                    // onSubmit={saveDocumentTemplate}
                    ref={formRef}
                    noValidate
                    validated={validated}
                    className="p-4"
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Type de document</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text bg-transparent border-right-0">
                              <i className="text-primary">
                                <PiFileDocDuotone size={30} />
                              </i>
                            </span>
                          </div>
                        </InputGroup.Text>
                        <Form.Select
                          name="type"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          required
                        >
                          <option value="">
                            Selectionner le type de document à créer
                          </option>
                          <option value="AttestationDePrésence">
                            Attestation de présence
                          </option>
                          <option value="FeuilleDePrésence">
                            Feuille de présence
                          </option>
                          <option value="CatalogueDesFormation">
                            Catalogue des formations
                          </option>
                          <option value="BonDeCommande">Bon de commande</option>
                          <option value="FicheProgramme">
                            Fiche programme de chaque formation
                          </option>
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                    <div className="mt-5 d-flex justify-content-center">
                      <Button
                        type="submit"
                        className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                      >
                        Envoyer
                      </Button>
                    </div>
                  </Form>
                  <iframe
                    width="640px"
                    height="480px"
                    src="https://forms.office.com/r/khm1UVDMJ5?embed=true"
                    frameborder="0"
                    marginwidth="0"
                    marginheight="0"
                    style={{
                      border: "none",
                      maxWidth: "100%",
                      maxHeight: "100vh",
                    }}
                    allowfullscreen="true"
                    webkitallowfullscreen="true"
                    mozallowfullscreen="true"
                    msallowfullscreen="true"
                  ></iframe>
                {/* </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantFeedback;
