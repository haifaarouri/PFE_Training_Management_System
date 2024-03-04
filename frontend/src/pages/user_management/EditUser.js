import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { editUser, fetchUserById } from "../../services/UserServices";
import { useParams } from "react-router-dom";
import { Option } from "antd/lib/mentions";
import axios from "../../services/axios";

function EditUser() {
  const { Title } = Typography;
  //   const navigate = useNavigate()
  const params = useParams();
  const { id } = params;
  const [user, setUser] = useState({
    email: "",
    firstName: "",
    id: "",
    lastName: "",
    phoneNumber: "",
    profileImage: "",
    role: "",
  });
  const [form] = Form.useForm(); // useForm hook initialized

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserById(id);
      // Once the user is fetched, set the form fields directly.
      form.setFieldsValue({ ...userData });
      setUser(userData);
    };

    if (id) {
      fetchUser();
    }
  }, [id, form]);

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleRegister = async () => {
    await csrf();

    try {
      const formData = new FormData();
      formData.append("firstName", user.firstName);
      formData.append("lastName", user.lastName);
      formData.append("email", user.email);
      formData.append("phoneNumber", user.phoneNumber);
      formData.append("profileImage", user.profileImage);
      formData.append("role", user.role);

      // Display FormData content
      const formDataObject = {};
      for (const [key, value] of formData.entries()) {
        formDataObject[key] = value;
      }
      console.log(formDataObject);

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };
      const response = await axios.put(
        `/api/update-user/${id}`,
        formData,
        config
      );
      // const res = await editUser(id, formDataObject);
      console.log(response);

      // form.resetFields();
      // setUser({
      //   email: "",
      //   firstName: "",
      //   id: "",
      //   lastName: "",
      //   phoneNumber: "",
      //   profileImage: "",
      //   role: "",
      // });
      //   navigate("/dashboard");
    } catch (error) {
      if (error.response.status === 422) {
        console.log(error.response.data.message);
      }
    }
  };

  return (
    <Row gutter={[24, 0]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} className="mb-24 mt-24">
        <Card bordered={false} className="criclebox cardbody h-full">
          <div className="project-ant">
            <div>
              <Title level={5} style={{ marginTop: "8%" }}>
                Mettre à jour les informations d'un administrateur
              </Title>
            </div>
          </div>
          <div className="ant-list-box">
            <Form
              form={form}
              name="basic"
              encType="multipart/form-data"
              onFinish={handleRegister}
              onFinishFailed={onFinishFailed}
              className="row-col"
              style={{ margin: "8%" }}
            >
              <Form.Item
                name="firstName"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir le prénom !",
                  },
                  {
                    whitespace: true,
                    message: "'Prénom' ne peut pas être vide !",
                  },
                  {
                    min: 3,
                    message:
                      "Le 'Prénom' doit comporter au moins 3 caractères !",
                  },
                ]}
                type="text"
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    firstName: e.target.value,
                  }))
                }
                hasFeedback
              >
                <Input placeholder="Prénom" />
              </Form.Item>
              <Form.Item
                name="lastName"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir le Nom de famille !",
                  },
                  {
                    whitespace: true,
                    message: "'Nom de famille' ne peut pas être vide !",
                  },
                  {
                    min: 3,
                    message:
                      "Le 'Nom de famille' doit comporter au moins 3 caractères !",
                  },
                ]}
                type="text"
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    lastName: e.target.value,
                  }))
                }
                hasFeedback
              >
                <Input placeholder="Nom de famille" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Veuillez saisir un Email !" },
                  {
                    type: "email",
                    message: "'E-mail' n'est pas un e-mail valide !",
                  },
                ]}
                hasFeedback
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    email: e.target.value,
                  }))
                }
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir le Numéro de Téléphone !",
                  },
                  {
                    whitespace: true,
                    message: "'Numéro de Téléphone' ne peut pas être vide !",
                  },
                  {
                    min: 8,
                    message:
                      "Le 'Numéro de Téléphone' doit comporter au moins 8 caractères !",
                  },
                ]}
                type="text"
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    phoneNumber: e.target.value,
                  }))
                }
                hasFeedback
              >
                <Input placeholder="Numéro de Téléphone" />
              </Form.Item>
              <Form.Item
                name="profileImage"
                label="Image de profil"
                rules={[
                  {
                    required: true,
                    message: "Veuillez selectionner une image !",
                  },
                ]}
                type="file"
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    profileImage: e.target.files[0],
                  }))
                }
                hasFeedback
              >
                <Upload
                  name="profileImage"
                  action="http://localhost:3000"
                  listType="picture"
                  accept="image/*"
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>
                    Cliquez pour télécharger votre image
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name="role"
                label="Sélectionner le role de cet admin"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Veuillez selectionner un role !",
                  },
                ]}
              >
                <Select placeholder="Sélectionner le role de cet admin">
                  <Option value="PiloteDuProcessus">Pilote du Processus</Option>
                  <Option value="Sales">Sales</Option>
                  <Option value="ChargéFormation">
                    Chargé de la Formation
                  </Option>
                  <Option value="AssistanceAcceuil">
                    Assistance d'Acceuil
                  </Option>
                  <Option value="CommunityManager">Community Manager</Option>
                  <Option value="ServiceFinancier">Service Financier</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button
                  style={{ width: "100%" }}
                  type="primary"
                  htmlType="submit"
                >
                  S'inscrire
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

export default EditUser;
