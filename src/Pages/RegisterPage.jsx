import React from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import registration from "../assets/registration.png";
import { useEffect } from "react";
import { useState } from "react";
import RegisterInputs from "../Components/RegisterInputs";
import { ToastContainer, toast } from "react-toastify";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import SelectInput from "../Components/SelectInput";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userGroupId, setUserGroupId] = useState("");
  const [id, setId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {}, []);

  const handleSignUp = async () => {
    //check if the fields are empty
    if (fname === "" || lname === "" || password === "" || id === "") {
      toast.error("Please fill all fields");
      return;
    }

    //check if the password and confirm password are the same
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    //id must contain 9 digits
    if (id.length !== 9) {
      toast.error("ID must contain 9 digits");
      return;
    }
    //check if the user already exists
    const querySnapshot = await getDocs(collection(db, "Users"));
    const usersArray = querySnapshot.docs.map((doc) => ({
      id: doc.data().userId,
      password: doc.data().password,
      fname: doc.data().fname,
      lname: doc.data().lname,
      groupId: doc.data().groupId,
    }));
    if (userGroupId !== "") {
      var maxGroupId = usersArray.find(
        (user) => user.id == userGroupId
      ).groupId;
      console.log(maxGroupId);
    } else {
      var maxGroupId = Math.max(...usersArray.map((user) => user.groupId)) + 1;
    }
    const user = usersArray.find((user) => user.id == id);
    if (user) {
      toast.error("User already exists");
      return;
    }
    //add the new user
    try {
      const docRef = await addDoc(collection(db, "Users"), {
        userId: id,
        password: password,
        fname: fname,
        lname: lname,
        groupId: maxGroupId,
        is_confirmed: userGroupId === "" ? 1 : 0,
      });
      toast.success("User added successfully");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col md={6}>
          <img
            style={{ height: "100%" }}
            src={registration}
            className="img-fluid"
          />
        </Col>
        <Col md={6}>
          <Form>
            <FormGroup>
              <RegisterInputs
                name={"First Name"}
                type={"text"}
                label={"First Name"}
                value={fname}
                setInputValue={setFname}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Last Name"}
                type={"text"}
                label={"Last Name"}
                value={lname}
                setInputValue={setLname}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"ID"}
                type={"number"}
                label={"ID"}
                value={id}
                setInputValue={setId}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Password"}
                type={"password"}
                label={"Password"}
                value={password}
                setInputValue={setPassword}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Confirm Password"}
                type={"password"}
                label={"Confirm Password"}
                value={confirmPassword}
                setInputValue={setConfirmPassword}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"User Group ID"}
                type={"text"}
                label={"User Group ID"}
                value={userGroupId}
                setInputValue={setUserGroupId}
              />
            </FormGroup>

            <div className="d-flex justify-content-end">
              <Button
                style={{ marginTop: "15px", fontWeight: "bold" }}
                color="primary"
                onClick={handleSignUp}
                className="ml-auto"
              >
                Create New User
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </div>
  );
}
