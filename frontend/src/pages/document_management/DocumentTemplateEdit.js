import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import { BsFiletypeDocx } from "react-icons/bs";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { PiFileDocDuotone, PiTableLight } from "react-icons/pi";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  editDocument,
  fetchDocumentById,
} from "../../services/DocumentServices";
import { BiUpload } from "react-icons/bi";
import { fetchAllVariables } from "../../services/VariableServices";
import VariableModal from "../../components/VariableModal";

function DocumentTemplateEdit() {
  let editorObj = useRef(null);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [docTemplate, setDocTemplate] = useState({
    id: "",
    type: "",
    docName: "",
  });
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [otherTemplate, setOtherTemplate] = useState(false);
  const [variables, setVariables] = useState([]);
  const [variableTemplates, setVariableTemplates] = useState([]);
  const [showVariableModal, setShowVariableModal] = useState(false);

  useEffect(() => {
    fetchAllVariables().then(setVariableTemplates);
  }, [showVariableModal]);

  const toggleOtherTemplate = () => {
    setOtherTemplate(!otherTemplate);
  };

  useEffect(() => {
    fetchDocumentById(id).then(setDocTemplate);
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
      formData.append("_method", "PUT");
      formData.append("type", docTemplate.type);
      formData.append("variable_ids", JSON.stringify(variables));

      const blob = await getDocumentAsBlob();
      blob
        ? formData.append(
          "docName",
          blob,
          `TemplateDocument.${docTemplate.type}.docx`
        )
        : formData.append("docName", docTemplate.docName);

      const res = await editDocument(id, formData);
      if (res) {
        handleSuccess("Modifié avec succès !");
        Swal.fire(
          "Success",
          "Modèle du document modifié avec succès !",
          "success"
        );

        setDocTemplate({
          id: "",
          type: "",
          docName: "",
        });

        navigate("/documents");
      }
    } catch (error) {
      if (error) {
        console.log(error);
        // handleError(error.response.data.message);
        // Swal.fire({
        //   icon: "error",
        //   title: "Oops...",
        //   text: "Quelque chose s'est mal passé !",
        // });
      }
    }
  };

  const handleShowVariableModal = () => {
    setShowVariableModal(true);
  };

  const handleCloseVariableModal = () => {
    setShowVariableModal(false);
  };

  const downloadDocument = async () => {
    const blob = await getDocumentAsBlob();
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docTemplate?.type; //file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Formulaire de modification du document modèle {docTemplate.type}
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
                      value={docTemplate.type}
                      onChange={(e) =>
                        setDocTemplate((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
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
                      onChange={(e) =>
                        setDocTemplate((prev) => ({
                          ...prev,
                          docName: e.target.files[0],
                        }))
                      }
                      required
                      style={{ display: "block" }}
                    />
                  </InputGroup>
                </Form.Group>
                <div className="d-flex justify-content-between mb-3">
                  <Alert variant="info">
                    Veuillez importer un fichier de type .docx ou .doc
                  </Alert>
                  <Button
                    className="btn btn-inverse-info btn-sm mb-3"
                    onClick={toggleOtherTemplate}
                  >
                    Importer un autre modèle <BiUpload size={22} />
                  </Button>
                </div>
                {docTemplate.docName !== "" && otherTemplate ? (
                  <>
                    <Alert variant="info">
                      Veuillez saisir dans le contenu du document, les variables
                      qui seront remplacées par des valeurs dynamiques lors de
                      la génération automatique du document, selon cette format
                      : <b>{"${nomDuVariable}"}</b>
                    </Alert>
                    <Form.Group className="mb-3">
                      <Form.Label>Variables</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                          <div className="input-group-prepend bg-transparent">
                            <span className="input-group-text bg-transparent border-right-0">
                              <i className="text-primary">
                                <PiTableLight size={30} />
                              </i>
                            </span>
                          </div>
                        </InputGroup.Text>
                        <Form.Select
                          multiple
                          name="variables"
                          value={variables}
                          onChange={(e) =>
                            setVariables(
                              [...e.target.selectedOptions].map((o) => o.value)
                            )
                          }
                          required
                        >
                          <option value="">
                            Selectionner les variables liée à ce document
                          </option>
                          {variableTemplates.length > 0 &&
                            variableTemplates.map((variable) => (
                              <option value={variable.id}>
                                {variable.variable_name}
                              </option>
                            ))}
                        </Form.Select>
                      </InputGroup>
                      <Button
                        type="button"
                        className="btn-inverse-primary"
                        onClick={handleShowVariableModal}
                      >
                        Ajouter nouvelle variable
                      </Button>
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                      {variables.length > 0 && variableTemplates.length > 0 && (
                        <div> Variables séléctionnées :
                          {variableTemplates.map((v) => {
                            const found = variables.find((varItem) => varItem == v.id);
                            return found ? <span key={v.id}>{"${"}{v.variable_name}{"}"} - </span> : null;
                          })}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={downloadDocument}
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
                      {docTemplate.type}
                    </Alert>
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
              <VariableModal
                show={showVariableModal}
                handleClose={handleCloseVariableModal}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentTemplateEdit;
