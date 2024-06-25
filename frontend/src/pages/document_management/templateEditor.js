import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";
import { useRef, useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import { BsFiletypeDocx } from "react-icons/bs";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { PiFileDocDuotone } from "react-icons/pi";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

function TemplateEditor() {
  let editorObj = useRef(null);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [type, setType] = useState("");
  const [docName, setDocName] = useState("");
  const navigate = useNavigate();

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

  const getDocumentAsBlob = async () => {
    if (editorObj.current) {
      const documentEditor = editorObj.current.documentEditor;
      const blob = await documentEditor.saveAsBlob("Docx");
      return blob;
    }
  };

  const saveDocumentTemplate = async (event) => {
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
      formData.append("type", type);

      const blob = await getDocumentAsBlob();
      blob
        ? formData.append("docName", blob, `TemplateDocument.${type}.docx`)
        : formData.append("docName", docName);

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/add-document-template", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            handleSuccess(res.data.message);
            Swal.fire(
              "Success",
              "Modèle du document enregistré avec succès !",
              "success"
            );

            setType("");
            setDocName("");

            navigate("/documents");
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
            "/api/add-document-template",
            formData,
            {
              headers: headers,
            }
          );

          if (response.status === 201) {
            handleSuccess(response.data.message);
            Swal.fire(
              "Success",
              "Modèle du document enregistré avec succès !",
              "success"
            );

            setType("");
            setDocName("");

            navigate("/documents");
          }
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Echec de l'enregistrement du modèle du document !",
          "error"
        );
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

  // const downloadDocument = async () => {
  //   const blob = await getDocumentAsBlob();
  //   if (blob) {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "EditedDocument.docx"; // Specify the file name
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //   }
  // };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Etapes de création d'un nouvel document modèle
              </h4>
              <ToastContainer />
              <Form
                onSubmit={saveDocumentTemplate}
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
                      <option value="CatalogueDesFormationParMois">
                        Catalogue des formations par mois
                      </option>
                      <option value="CatalogueDesFormationParTrimestre">
                        Catalogue des formations par trimestre
                      </option>
                      <option value="CatalogueDesFormationParSemestre">
                        Catalogue des formations par semestre
                      </option>
                      <option value="CatalogueDesFormationParAn">
                        Catalogue des formations par an
                      </option>
                      <option value="BonDeCommande">Bon de commande</option>
                      <option value="FicheProgramme">
                        Fiche programme de chaque formation
                      </option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Document (modèle)</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control
                      name="docName"
                      type="file"
                      accept=".doc,.docx"
                      placeholder="Sélectionner le fichier"
                      onChange={(e) => setDocName(e.target.files[0])}
                      required
                      style={{ display: "block" }}
                    />
                  </InputGroup>
                </Form.Group>
                <Alert variant="info" style={{ width: "32%" }}>
                  Veuillez importer un fichier de type .docx ou .doc
                </Alert>
                {docName === "" ? (
                  <>
                    <div className="d-flex justify-content-end">
                      <button
                        onClick={saveDocumentTemplate}
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
                      // ref={(scope) => {
                      //   editorObj = scope;
                      // }}
                      ref={editorObj}
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
                      enableExport={true}
                    >
                      <Inject services={[Toolbar]}></Inject>
                    </DocumentEditorContainerComponent>
                  </>
                ) : (
                  <div className="d-flex justify-content-center">
                    <Alert variant="info" style={{ width: "70%" }}>
                      Vous avez importer le modèle pour le document de type :{" "}
                      {type}
                    </Alert>
                  </div>
                )}
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Enregister
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
