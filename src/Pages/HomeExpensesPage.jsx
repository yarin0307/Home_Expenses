import React, { useState, useEffect } from "react";
import { FaEquals, FaSearch } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { FaMinusCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import SelectInput from "../Components/SelectInput";
import DateInput from "../Components/DateInput";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { saveAs } from "file-saver";
import { Button } from "primereact/button";
import { Spinner } from "react-bootstrap";
import ExpenseModal from "../Components/ExpenseModal";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthProvider";


export default function HomeExpensesPage() {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [memberlist, setMemberList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesListName, setCategoriesListName] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("");
  const [selectedExpenseCategoryName, setSelectedExpenseCategoryName] =
    useState("");
  const [expenseslist, setExpenseslist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState({});
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [outcome, setOutcome] = useState(0);
  const [categoriesObjectList, setCategoriesObjectList] = useState([]);
  const { user, setUser } = useContext(AuthContext);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const navigate = useNavigate();

  // Function to get the first day of the current month
  const getFirstDayOfCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  };

  // Function to get the last day of the current month
  const getLastDayOfCurrentMonth = () => {
    const today = new Date();
    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate(); // Gets last day of the month
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(lastDay).padStart(2, "0")}`;
  };

  const [selectedStartDate, setSelectedStartDate] = useState(
    getFirstDayOfCurrentMonth()
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    getLastDayOfCurrentMonth()
  );

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // Create a Firestore query
      const q = query(
        collection(db, "Expenses"),
        where("expense_groupId", "==", user.groupId)
      );

      // Fetch documents
      const querySnapshot = await getDocs(q);
      let expensesData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Firestore document ID
        expense_amount: doc.data().expense_amount,
        expense_cat: doc.data().expense_cat,
        expense_date: doc.data().expense_date,
        expense_description: doc.data().expense_description,
        expense_groupId: doc.data().expense_groupId,
        expense_name: doc.data().expense_name,
        expense_userFname: doc.data().expense_userFname,
        expense_userId: doc.data().expense_userId,
        expense_type: doc.data().expense_type,
      }));
      const startDate = new Date(selectedStartDate);
      const endDate = new Date(selectedEndDate);
      startDate.setHours(0, 0, 0, 0); // Set to beginning of the day
      endDate.setHours(23, 59, 59, 999); // Set to end of the day

      expensesData = expensesData.filter((doc) => {
        if (!doc.expense_date || !doc.expense_date.seconds) {
          return false; // Ignore invalid timestamps
        }

        const expenseDate = new Date(doc.expense_date.seconds * 1000); // Convert Firestore timestamp to JS Date
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      console.log(expensesData);
      setExpenseslist(expensesData); // Update state
      setData(expensesData);
      let income = expensesData
        .filter((doc) => doc.expense_type === "Income")
        .reduce((acc, item) => acc + item.expense_amount, 0);
      let outcome = expensesData
        .filter((doc) => doc.expense_type === "Outcome")
        .reduce((acc, item) => acc + item.expense_amount, 0);
        setIncome(income.toLocaleString());
        setOutcome(outcome.toLocaleString());
        setBalance((income - outcome).toLocaleString());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Users"));
        const usersArray = querySnapshot.docs.map((doc) => ({
          id: doc.data().userId,
          password: doc.data().password,
          fname: doc.data().fname,
          lname: doc.data().lname,
          groupId: doc.data().groupId,
        }));
        const memberNames = usersArray
          .filter((doc) => doc.groupId === user.groupId)
          .map((doc) => doc.fname);
        setMemberList(memberNames);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

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

    fetchUsers();
    fetchExpenses();
    fetchExpensesCategories();
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchExpenses();
    console.log(selectedEndDate);
  }, [selectedStartDate, selectedEndDate]);

  const handleFilter = (e) => {
    console.log(data);
    const value = e.target.value || "";
    setFilterText(value);
    console.log(value);
    const lowercasedValue = value.toLowerCase().trim();
    console.log(lowercasedValue);
    const filteredData = data.filter((item) => {
      return Object.keys(item).some((key) => {
        const propertyValue = item[key];
        if (propertyValue !== null && propertyValue !== undefined) {
          return propertyValue
            .toString()
            .toLowerCase()
            .includes(lowercasedValue);
        }
        return false;
      });
    });
    setExpenseslist(filteredData);
    let income = filteredData
      .filter((doc) => doc.expense_type === "Income")
      .reduce((acc, item) => acc + item.expense_amount, 0);
    let outcome = filteredData
      .filter((doc) => doc.expense_type === "Outcome")
      .reduce((acc, item) => acc + item.expense_amount, 0);
      setIncome(income.toLocaleString());
      setOutcome(outcome.toLocaleString());
      setBalance((income - outcome).toLocaleString());
  };

  const deleteExpense = async (rowData) => {
    try {
      await deleteDoc(doc(db, "Expenses", rowData.id)); // Delete document by ID
      toast.success("Expense Deleted Successfully");
      setExpenseslist(expenseslist.filter((item) => item.id !== rowData.id));
      setData(expenseslist);
      // Optionally refresh data after deletion
      fetchExpenses(); // Re-fetch the expenses to update UI
    } catch (error) {
      toast.error("Error Seleting Expense");
    }
  };

  const editRequest = (expense) => {
    navigate("/update-record", { state: expense });
  };

  const handleSelectedMember = (value) => {
    setSelectedMember(value);
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

  const handleStartDate = (value) => {
    setSelectedStartDate(value);
  };

  const handleEndDate = (value) => {
    setSelectedEndDate(value);
  };
  const DateBodyTemplate = (rowData) => {
    return new Date(rowData.expense_date.seconds * 1000).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const AmountBodyTemplate = (rowData) => {
    return <span>{rowData.expense_amount.toLocaleString()} ₪</span>;
  };
  const ActionsBodyTemplate = (rowData) => {
    return (
      <div className="actions">
        <button className="btn mr-2" onClick={() => editRequest(rowData)}>
          <FaPencilAlt />
        </button>
        <button className="btn" onClick={() => deleteExpense(rowData)}>
          <FaTimes />
        </button>
        <button
          className="btn mr-2"
          onClick={() => handleRequestStatus(rowData)}
        >
          <FaInfoCircle />
        </button>
      </div>
    );
  };

  const handleRequestStatus = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const filterInputs = () => {
    if (selectedEndDate < selectedStartDate) {
      toast.error("End date cannot be smaller than start date");
      return;
    }

    let filteredData = [...data];
    if (selectedMember) {
      filteredData = filteredData.filter(
        (row) => row.expense_userFname == selectedMember
      );
    }
    if (selectedExpenseCategory) {
      filteredData = filteredData.filter(
        (row) => row.expense_cat == selectedExpenseCategory
      );
    }
    if (selectedExpenseCategoryName) {
      filteredData = filteredData.filter(
        (row) => row.expense_name === selectedExpenseCategoryName
      );
    }
    if (selectedStartDate && selectedEndDate) {
      filteredData = filteredData.filter((row) => {
        // Convert Firestore timestamp to Date object
        const expenseDate = new Date(row.expense_date.seconds * 1000);

        // Convert selectedStartDate and selectedEndDate to Date objects (ensuring time zone consistency)
        const startDate = new Date(selectedStartDate);
        const endDate = new Date(selectedEndDate);

        // Set time to 00:00:00 for correct date-only comparison (ignoring time differences)
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Convert Firestore date to Israel timezone and set time to 00:00:00
        const expenseDateIST = new Date(
          expenseDate.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
        );
        expenseDateIST.setHours(0, 0, 0, 0);

        return expenseDateIST >= startDate && expenseDateIST <= endDate;
      });
    }

    setExpenseslist(filteredData);
    let income = filteredData
      .filter((doc) => doc.expense_type === "Income")
      .reduce((acc, item) => acc + item.expense_amount, 0);
    let outcome = filteredData
      .filter((doc) => doc.expense_type === "Outcome")
      .reduce((acc, item) => acc + item.expense_amount, 0);
    setIncome(income.toLocaleString());
    setOutcome(outcome.toLocaleString());
    setBalance((income - outcome).toLocaleString());
  };

  const refreshTable = () => {
    setLoading(true);
    fetchExpenses();
    setLoading(false);
  };

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      // Convert Firestore timestamp to a readable date format
      const formattedData = data.map((item) => ({
        ...item,
        expense_date: item.expense_date?.seconds
          ? new Date(item.expense_date.seconds * 1000).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )
          : "No Date", // Handle missing dates
      }));

      const worksheet = xlsx.utils.json_to_sheet(formattedData);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAsExcelFile(excelBuffer, "Expenses");
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    let EXCEL_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    let EXCEL_EXTENSION = ".xlsx";
    const data = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    saveAs(
      data,
      fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
    );
  };

  const header = (
    <div
      style={{ display: "flex", justifyContent: "flex-end" }}
      className="table-header"
    >
      <span
        style={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
          fontSize: "30px",
        }}
      >
        Expenses
      </span>{" "}
      {/* added flex property */}
      <Button
        style={{ backgroundColor: "#0d6efd" }}
        icon="pi pi-refresh"
        onClick={refreshTable}
      />
      <span style={{ marginLeft: "10px" }}></span>
      <Button
        type="button"
        icon="pi pi-file-excel"
        onClick={exportExcel}
        className="p-button-success p-mr-2"
        data-pr-tooltip="XLS"
      />
    </div>
  );

  return (
    <div className="container" style={{ fontSize: "1em", textAlign: "center" }}>
      <div className="row justify" style={{ marginTop: "4%" }}>
        <div className="col- d-flex justify-content-center align-items-center mt-4">
          <h1
            style={{
              color: "#1E3A8A", // Deep blue color for a clean look
              fontSize: "36px",
              fontWeight: "bold",
              textAlign: "center",
              padding: "15px 20px",
              borderRadius: "10px",
              background: "linear-gradient(90deg, #3B82F6, #9333EA)", // Smooth blue to purple gradient
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
              letterSpacing: "1px",
            }}
          >
            Hello, {user.fname} {user.lname} 👋
          </h1>
        </div>
      </div>
      <div className="row justify" style={{ marginTop: "4%" }}>
        <div className="col-md-2 mb-3">
          <SelectInput
            type="Member"
            list={memberlist}
            setMember={handleSelectedMember}
          />
        </div>
        <div className="col-md-2 mb-3">
          <SelectInput
            type="Expense Category"
            list={categoriesList}
            setExpenseCategory={handleSelectedExpenseCategory}
          />
        </div>

        <div className="col-md-3 mb-3">
          <SelectInput
            type="Expense Category Name"
            list={categoriesListName}
            setExpenseCategoryName={handleSelectedExpenseCategoryName}
          />
        </div>
        <div className="col-md-2 mb-5 d-flex flex-column">
          <div className="mb-3">
            <DateInput
              type="startDate"
              value={selectedStartDate}
              setStartDate={handleStartDate}
            />
          </div>
          <div>
            <DateInput
              type="endDate"
              value={selectedEndDate}
              setEndDate={handleEndDate}
            />
          </div>
        </div>

        <div className="col-md-2 mb-3">
          <input
            type="text"
            onChange={handleFilter}
            value={filterText}
            placeholder="Search"
            className="form-control"
          />
        </div>
        <div className="col-md-1 mb-3">
          <button className="btn btn-primary" onClick={filterInputs}>
            <FaSearch />
          </button>
        </div>
      </div>
      <div className="row justify-content-center align-items-center financial-summary">
  {/* Income Section */}
  <div className="col-md-3 col-12 financial-box">
    <strong style={{ color: "green" }}>
      <FaPlusCircle /> Income: {income} ₪
    </strong>
  </div>

  {/* Outcome Section */}
  <div className="col-md-3 col-12 financial-box">
    <strong style={{ color: "red" }}>
      <FaMinusCircle /> Outcome: {outcome} ₪
    </strong>
  </div>

  {/* Balance Section */}
  <div className="col-md-3 col-12 financial-box">
    <strong style={{ color: Number(balance) >= 0 ? "green" : "red" }}>
      Balance: {balance} ₪
    </strong>
  </div>

  {/* Add New Record Button */}
  <div className="col-md-3 col-12 text-center mt-3">
    <button className="btn btn-primary add-record-btn" onClick={() => navigate("/new-record")}>
      Add New Record
    </button>
  </div>
</div>


      <div>
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            value={expenseslist}
            header={header}
            rowHover
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[5, 10, 25, 50]}
            rows={10}
            responsiveLayout="stack"
            breakpoint="960px"
            style={{ fontSize: "15px", marginTop: "20px" }}
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column
              field="expense_userFname"
              sortable
              header="Member"
              style={{ textAlign: "center", width: "15%" }}
            />
            <Column
              field="expense_type"
              sortable
              sortField="expense_type"
              header="Type"
              style={{ textAlign: "center", width: "15%" }}
            />
            <Column
              field="expense_cat"
              sortable
              sortField="expense_cat"
              header="Category"
              style={{ textAlign: "center", width: "15%" }}
            />
            <Column
              field="expense_name"
              sortable
              sortField="expense_name"
              header="Category Name"
              style={{ textAlign: "center", width: "15%" }}
            />
            <Column
              field="expense_date"
              body={DateBodyTemplate}
              sortable
              filterField="expense_date"
              header="Date"
              style={{ textAlign: "center", width: "15%" }}
            />
            <Column
              field="expense_amount"
              body={AmountBodyTemplate}
              sortable
              filterField="expense_amount"
              header="Amount"
              style={{ textAlign: "center", width: "15%" }}
            />
            <Column
              field="expense_description"
              sortable
              filterField="expense_description"
              header="Description"
              style={{ textAlign: "center", width: "20%" }}
            />
            <Column
              header="Actions"
              body={ActionsBodyTemplate}
              style={{ textAlign: "center", width: "5%" }}
            />
          </DataTable>
        )}
        <ExpenseModal
          visible={isModalOpen}
          handleClose={handleCloseModal}
          expense={selectedExpense}
        />
      </div>
      <ToastContainer />
    </div>
  );
}
