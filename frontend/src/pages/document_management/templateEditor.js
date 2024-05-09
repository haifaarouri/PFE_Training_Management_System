import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";
import { useEffect, useState } from "react";
import { Alert, Form, InputGroup } from "react-bootstrap";
import { BsFiletypeDocx } from "react-icons/bs";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import StepProgressBar from "react-step-progress";
import "react-step-progress/dist/index.css";
import { PiFileDocDuotone } from "react-icons/pi";

function TemplateEditor() {
  let editorObj = null;
  const [docTemplate, setdocTemplate] = useState("");
  const [docType, setDocType] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);

  const onSave = async () => {
    // editorObj?.documentEditor.save("Sample", "Docx"); //file name and type

    const formData = new FormData();
    formData.append("title", "title");
    formData.append("description", "description");
    formData.append("candidat_id", 2);
    formData.append("session_id", 1);
    formData.append("docTemplate", docTemplate);

    try {
      if (!localStorage.getItem("token")) {
        const res = await axios.post("/api/document", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Fichier téléchargé avec succès !",
            showConfirmButton: false,
            timer: 1500,
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

        const response = await axios.post("/api/document", formData, {
          headers: headers,
        });

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Fichier téléchargé avec succès !",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };
  console.log(docTemplate);
  useEffect(() => {
    if (docType !== "") {
      setForceUpdate((prev) => prev + 1);
    }
  }, [docType]);

  function step1Validator() {
    return docType !== "";
  }

  function step2Validator() {
    return true;
  }

  function step3Validator() {
    return true;
  }

  const onFormSubmit = async () => {
    if (docTemplate !== "") {
      const formData = new FormData();
      formData.append("docType", docType);
      formData.append("docTemplate", docTemplate);

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/upload-template", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 200) {
            Swal.fire({
              icon: "success",
              title: `${res.data.message}`,
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

          const response = await axios.post("/api/upload-template", formData, {
            headers: headers,
          });

          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: `${response.data.message}`,
              showConfirmButton: false,
              timer: 2000,
            });
          }
        }
      } catch (error) {
        if (error) {
          Swal.fire({
            icon: "error",
            title: `${error.response.data.error}`,
            showConfirmButton: false,
            timer: 3000,
          });
        }
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
                Etapes de création d'un nouvel document modèle
              </h4>
              <StepProgressBar
                key={forceUpdate}
                startingStep={0}
                onSubmit={onFormSubmit}
                // stepClass={stepColor}
                steps={[
                  {
                    label: "Etape 1",
                    subtitle: "Choix du type de document",
                    name: "Etape 1",
                    content: (
                      <Form style={{ marginTop: "15%" }}>
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
                              value={docType}
                              onChange={(e) => setDocType(e.target.value)}
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
                              <option value="BonDeCommande">
                                Bon de commande
                              </option>
                              <option value="FicheProgramme">
                                Fiche programme de chaque formation
                              </option>
                            </Form.Select>
                          </InputGroup>
                        </Form.Group>
                      </Form>
                    ),
                    validator: step1Validator,
                  },
                  {
                    label: "Etape 2",
                    subtitle:
                      "Importer un modèle depuis votre ordinateur (si le modèle existe déjà)",
                    name: "Etape 2",
                    content: (
                      <Form style={{ marginTop: "15%" }}>
                        <Form.Group className="mb-3">
                          <Form.Label>Document (modèle)</Form.Label>
                          <InputGroup className="mb-3">
                            <Form.Control
                              name="docTemplate"
                              type="file"
                              accept=".doc,.docx"
                              placeholder="Sélectionner le fichier"
                              onChange={(e) =>
                                setdocTemplate(e.target.files[0])
                              }
                              required
                              style={{ display: "block" }}
                            />
                          </InputGroup>
                        </Form.Group>
                        <Alert variant="info" style={{ width: "32%" }}>
                          Veuillez importer un fichier de type .docx ou .doc
                        </Alert>
                      </Form>
                    ),
                    validator: step2Validator,
                  },
                  {
                    label: "Etape 3",
                    subtitle: "Si vous n'avez pas de modèle, créer un !",
                    name: "Etape 3",
                    content: (
                      <div style={{ marginTop: "15%" }}>
                        {docTemplate === "" ? (
                          <>
                            <div className="d-flex justify-content-end">
                              <button
                                onClick={onSave}
                                style={{ marginBottom: 20 }}
                                className="btn btn-linkedin btn-social-icon-text"
                              >
                                <i>
                                  <BsFiletypeDocx size={22} />
                                </i>
                                Télécharger
                              </button>
                            </div>
                            <DocumentEditorContainerComponent
                              ref={(scope) => {
                                editorObj = scope;
                              }}
                              height="600"
                              enableToolbar={true}
                              id="container"
                              serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
                              enableEditorHistory={true}
                              isReadOnly={false}
                              enablePrint={true}
                              enableSelection={true}
                              enableEditor={true}
                              enableContextMenu={true}
                              enableSearch={true}
                              enableOptionsPane={true}
                              enableBookmarkDialog={true}
                              enableBordersAndShadingDialog={true}
                              enableFontDialog={true}
                              enableTableDialog={true}
                              enableParagraphDialog={true}
                              enableHyperlinkDialog={true}
                              enableImageResizer={true}
                              enableListDialog={true}
                              enablePageSetupDialog={true}
                              enableSfdtExport={true}
                              enableStyleDialog={true}
                              enableTableOfContentsDialog={true}
                              enableTableOptionsDialog={true}
                              enableTablePropertiesDialog={true}
                              enableTextExport={true}
                              enableWordExport={true}
                            >
                              <Inject services={[Toolbar]}></Inject>
                            </DocumentEditorContainerComponent>
                          </>
                        ) : (
                          <div className="d-flex justify-content-center">
                            <Alert variant="info" style={{ width: "70%" }}>
                              Vous pouvez passer cette étape, puisque vous avez
                              importer le modèle pour le document de type :{" "}
                              {docType}
                            </Alert>
                          </div>
                        )}
                      </div>
                    ),
                    validator: step3Validator,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
