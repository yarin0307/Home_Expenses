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
import { useNavigate, useLocation } from "react-router-dom";
import { use } from "react";
import { doc, updateDoc } from "firebase/firestore";

export default function UpdateRecordPage() {
  const getFirstDayOfCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const location = useLocation();
  const expense = location.state; // Access passed data
  const { user, setUser } = useContext(AuthContext);
  const [expenseAmount, setExpenseAmount] = useState(Number(expense.expense_amount));
  const [expenseDate, setExpenseDate] = useState(new Date(expense.expense_date.seconds * 1000).toISOString().split("T")[0]);
  const [expenseDescription, setExpenseDescription] = useState(expense.expense_description);
  const [expenseType, setExpenseType] = useState(["Outcome", "Income"]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesListName, setCategoriesListName] = useState([]);
  const [categoriesObjectList, setCategoriesObjectList] = useState([]);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState(expense.expense_cat);
  const [selectedExpenseCategoryName, setSelectedExpenseCategoryName] =
    useState(expense.expense_name);
  const [selectedExpenseType, setSelectedExpenseType] = useState(expense.expense_type);
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

  const handleUpdateRecord = async () => {
    const ref = doc(db, "Expenses", expense.id);
    

    console.log(expense.id);
    try {
      await updateDoc(ref, {
        expense_cat: selectedExpenseCategory,
        expense_name: selectedExpenseCategoryName,
        expense_type: selectedExpenseType,
        expense_amount: parseFloat(expenseAmount),
        expense_date: Timestamp.fromDate(new Date(expenseDate)),
        expense_description: expenseDescription,
        expense_groupId: Number(user.groupId),
        expense_userFname: expense.expense_userFname,
        expense_userId: Number(user.id),
      });
      toast.success("Record updated successfully!");
      setTimeout(() => {
        navigate("/home-expenses");
      }, 5000);
    } catch (error) {
      toast.error("Error updating record");
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

  useEffect(() => {
    console.log(expense);
  }, []);

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
      setCategoriesList([
        ...new Set(categoriesObjectList.map((doc) => doc.expense_cat)),
      ]);
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
              value={selectedExpenseType}
                type="Expense Type"
                list={expenseType}
                setExpenseType={handleSelectedExpenseType}
              />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontWeight: "bold" }}>Expense Category</Label>
              <SelectInput
              value={selectedExpenseCategory}
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
              value={selectedExpenseCategoryName}
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
                onClick={handleUpdateRecord}
                className="ml-auto"
              >
                Update Record
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </div>
  );
}
