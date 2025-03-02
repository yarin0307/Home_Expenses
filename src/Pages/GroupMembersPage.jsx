import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { Spinner } from "react-bootstrap";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthProvider";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import {
  getFirestore,
  collection,
  getDocs,
  where,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";


const GroupMembersPage = () => {

  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const [users, setUsers] = useState([]);
  const [confirmedUsers, setConfirmedUsers] = useState([]);
  const [unconfirmedUsers, setUnconfirmedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "Users");

        // Create a query to filter users where groupId is 1
        const q = query(usersRef, where("groupId", "==", 1));

        const querySnapshot = await getDocs(q);

        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id, // If you need the document ID
          ...doc.data(), // Spread operator to get all fields
        }));
        console.log("user", user.groupId);
        setUsers(users);
        setConfirmedUsers(users.filter((user) => user.is_confirmed == 1));
        setUnconfirmedUsers(users.filter((user) => user.is_confirmed == 0));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleActive = async (rowData) => {
    try {
      console.log("Updating:", rowData); // Debugging

      // Reference to the specific user document
      const userDocRef = doc(db, "Users", rowData.id);

      // Update the `is_confirmed` field to 1
      await updateDoc(userDocRef, {
        is_confirmed: 1,
      });

      toast.success("User confirmed successfully!");
      setConfirmedUsers((prevConfirmed) => [...prevConfirmed, rowData]);
      setUnconfirmedUsers((prevUnconfirmed) =>
        prevUnconfirmed.filter((user) => user.id !== rowData.id)
      );
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const ActionCarTypeBodyTemplate = (rowData) => {
    return (
      <div className="actions">
        <InputSwitch
          checked={rowData.is_confirmed}
          onChange={(e) => handleActive(rowData)}
        />
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col sm={6}>
          <Card style={{ marginTop: "1%" }}>
            <Card.Header style={{ textAlign: "center", fontWeight: "bold" }}>
              Unconfirmed Users
            </Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {loading ? (
                      <Spinner animation="border" variant="primary" />
                    ) : (
                      <DataTable
                        value={unconfirmedUsers}
                        rowHover
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        rows={5}
                        responsiveLayout="stack"
                        breakpoint="960px"
                        style={{ fontSize: "14px" }}
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                      >
                        <Column
                          field="userId"
                          sortable
                          sortField="userId"
                          header="ID"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />
                        <Column
                          field="fname"
                          sortable
                          sortField="fname"
                          header="First Name"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />
                        <Column
                          field="lname"
                          sortable
                          sortField="lname"
                          header="Last Name"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />

                        <Column
                          header="Actions"
                          body={ActionCarTypeBodyTemplate}
                          style={{ textAlign: "center", width: "5%" }}
                        />
                      </DataTable>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6}>
          <Card style={{ marginTop: "1%" }}>
            <Card.Header style={{ textAlign: "center", fontWeight: "bold" }}>
              Group Members
            </Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {loading ? (
                      <Spinner animation="border" variant="primary" />
                    ) : (
                      <DataTable
                        value={confirmedUsers}
                        rowHover
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        rows={5}
                        responsiveLayout="stack"
                        breakpoint="960px"
                        style={{ fontSize: "14px" }}
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                      >
                        <Column
                          field="userId"
                          sortable
                          sortField="userId"
                          header="ID"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />
                        <Column
                          field="fname"
                          sortable
                          sortField="fname"
                          header="First Name"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />
                        <Column
                          field="lname"
                          sortable
                          sortField="lname"
                          header="Last Name"
                          style={{ textAlign: "center", width: "12.5%" }}
                        />
                      </DataTable>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ToastContainer />
    </div>
  );
};

export default GroupMembersPage;
