import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";
import { useEffect, useState } from "react";
import { Alert, Form } from "react-bootstrap";
import { BsFiletypeDocx } from "react-icons/bs";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import "./progressSteps.css"

function TemplateEditor() {
  let editorObj = null;
  const [docTemplate, setdocTemplate] = useState("")

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

  const [activeTab, setActiveTab] = useState(1);

  const handleTabClick = (tabNumber) => {
      setActiveTab(tabNumber);
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <div className="mainProg">
                <ul className="ulProg">
                  <li className="liProg">
                    <i className="icon uil uil-capture" />
                    <div className={activeTab === 1 ? "one active progress" : "one progress"} onClick={() => handleTabClick(1)}>
                      <p>1</p>
                      <i className="uil uil-check" />
                    </div>
                    <p className="text">Add To Cart</p>
                  </li>
                  <li className="liProg">
                    <i className="icon uil uil-clipboard-notes" />
                    <div className={activeTab === 2 ? "two active progress" : "two progress"} onClick={() => handleTabClick(2)}>
                      <p>2</p>
                      <i className="uil uil-check" />
                    </div>
                    <p className="text">Fill Details</p>
                  </li>
                  <li className="liProg">
                    <i className="icon uil uil-credit-card" />
                    <div className={activeTab === 3 ? "three active progress" : "three progress"} onClick={() => handleTabClick(3)}>
                      <p>3</p>
                      <i className="uil uil-check" />
                    </div>
                    <p className="text">Make Payment</p>
                  </li>
                </ul>
              </div>
              <Form.Control
                name="docTemplate"
                type="file"
                accept="file/*"
                placeholder="Sélectionner le fichier"
                onChange={(e) => setdocTemplate(e.target.files[0])}
                required
                style={{ display: "block" }}
              />
              <div className="d-flex justify-content-between">
                <Alert variant="info" style={{ display: "none" }}>
                  Veuillez importer le fichier de type docx pour le document
                  "Attestation de présence"
                </Alert>
                <button
                  onClick={onSave}
                  style={{ marginBottom: 20, display: "none" }}
                  className="btn btn-linkedin btn-social-icon-text"
                >
                  <i>
                    <BsFiletypeDocx size={22} />
                  </i>
                  Télécharger
                </button>
                {/* <Form.Control
                  name="docTemplate"
                  type="file"
                  accept="file/*"
                  placeholder="Sélectionner le fichier"
                  onChange={(e) => setdocTemplate(e.target.files[0])}
                  required
                /> */}
              </div>
              <DocumentEditorContainerComponent
                style={{ display: "none" }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
