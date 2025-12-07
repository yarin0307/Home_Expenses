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
import addNewRecord from "../assets/addNewRecord.png";
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

export default function NewRecordPage() {
  const getFirstDayOfCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const { user, setUser } = useContext(AuthContext);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseDate, setExpenseDate] = useState(getFirstDayOfCurrentMonth());
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseType, setExpenseType] = useState(["Outcome", "Income"]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesListName, setCategoriesListName] = useState([]);
  const [categoriesObjectList, setCategoriesObjectList] = useState([]);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("");
  const [selectedExpenseCategoryName, setSelectedExpenseCategoryName] =
    useState("");
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpensesCategories = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "Expenses_Category")
        );
        const expensesCategoriesArray = querySnapshot.docs.map((doc) => ({
          expense_cat: doc.data().expense_cat,
          expense_name: doc.data().expense_name,
        }));
        setCategoriesObjectList(expensesCategoriesArray);
        const categoriesNames = [
          ...new Set(expensesCategoriesArray.map((doc) => doc.expense_cat)),
        ];
        setCategoriesList(categoriesNames);
        const categoriesNamesName = expensesCategoriesArray.map(
          (doc) => doc.expense_name
        );
        setCategoriesListName(categoriesNamesName);
      } catch (error) {
        console.error("Error fetching expenses categories:", error);
      }
    };

    fetchExpensesCategories();
  }, []);

  const handleNewRecord = async () => {
    try {
      const docRef = await addDoc(collection(db, "Expenses"), {
        expense_cat: selectedExpenseCategory,
        expense_name: selectedExpenseCategoryName,
        expense_type: selectedExpenseType,
        expense_amount: parseFloat(expenseAmount),
        expense_date: Timestamp.fromDate(new Date(expenseDate)),
        expense_description: expenseDescription,
        expense_groupId: Number(user.groupId),
        expense_userFname: user.fname,
        expense_userId: Number(user.id),
      });
      toast.success("New record added successfully!");
      setTimeout(() => {
        navigate("/home-expenses");
      }, 3000);
    } catch (error) {
      toast.error("Error adding new record");
    }
  };
  const handleSelectedExpenseCategory = (value) => {
    console.log(value);
    if (value === "") {
      setCategoriesListName(
        categoriesObjectList.map((doc) => doc.expense_name)
      );
    } else {
      setSelectedExpenseCategory(value);
      setCategoriesListName(
        categoriesObjectList
          .filter((doc) => doc.expense_cat === value)
          .map((doc) => doc.expense_name)
      );
    }
  };

  const handleSelectedExpenseCategoryName = (value) => {
    setSelectedExpenseCategoryName(value);
  };

  const handleSelectedExpenseType = (value) => {
    setSelectedExpenseType(value);
  
    if (value === "Income") {
      setSelectedExpenseCategory("Salary");
      setSelectedExpenseCategoryName("Salary");
  
      // Ensure the category list updates immediately
      setCategoriesList(["Salary"]); // Only show Salary when Income is selected
      setCategoriesListName(["Salary"]);
    } else {
      // Reset to original categories if not Income
      setCategoriesList(
        [...new Set(categoriesObjectList.map((doc) => doc.expense_cat))]
      );
      setCategoriesListName(
        categoriesObjectList.map((doc) => doc.expense_name)
      );
    }
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col md={6}>
          <img
            style={{ height: "100%" }}
            src={addNewRecord}
            className="img-fluid"
          />
        </Col>
        <Col md={6}>
          <Form>
            <FormGroup>
              <Label style={{ fontWeight: "bold" }}>Expense Type</Label>
              <SelectInput
                type="Expense Type"
                list={expenseType}
                setExpenseType={handleSelectedExpenseType}
              />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontWeight: "bold" }}>Expense Category</Label>
              <SelectInput
                type="Expense Category"
                list={categoriesList}
                setExpenseCategory={handleSelectedExpenseCategory}
                
              />
            </FormGroup>

            <FormGroup>
              <Label style={{ fontWeight: "bold" }}>
                Expense Category Name
              </Label>
              <SelectInput
                type="Expense Category Name"
                list={categoriesListName}
                setExpenseCategoryName={handleSelectedExpenseCategoryName}
               
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Expense Date"}
                type={"date"}
                label={"Expense Date"}
                value={expenseDate}
                setInputValue={setExpenseDate}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Expense Amount:"}
                type={"text"}
                label={"Expense Amount"}
                value={expenseAmount}
                setInputValue={setExpenseAmount}
              />
            </FormGroup>

            <FormGroup>
              <RegisterInputs
                name={"Expense Description:"}
                type={"text"}
                label={"Expense Description"}
                value={expenseDescription}
                setInputValue={setExpenseDescription}
              />
            </FormGroup>

            <div className="d-flex justify-content-end">
              <Button
                style={{ marginTop: "15px", fontWeight: "bold" }}
                color="primary"
                onClick={handleNewRecord}
                className="ml-auto"
              >
                Add New Record
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </div>
  );
}
