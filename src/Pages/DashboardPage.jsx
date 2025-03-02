import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import SelectInput from "../Components/SelectInput";
import DateInput from "../Components/DateInput";
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";
import { Chart } from "primereact/chart";
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


export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const { user, setUser } = useContext(AuthContext);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const [memberList, setMemberList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesListName, setCategoriesListName] = useState([]);
  const [categoriesObjectList, setCategoriesObjectList] = useState([]);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("");
  const [selectedExpenseCategoryName, setSelectedExpenseCategoryName] =
    useState("");
  const [expenseslist, setExpenseslist] = useState([]);
  const [income, setIncome] = useState("");
  const [outcome, setOutcome] = useState("");
  const [balance, setBalance] = useState("");
  const [lineChartData, setLineChartData] = useState({});
  const [lineChartOptions, setLineChartOptions] = useState({});

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

  const handleSelectedMember = (value) => {
    setSelectedMember(value);
  };

  const handleExpenseCategory = (value) => {
    setSelectedExpenseCategory(value);
    if (value === "") {
      setCategoriesListName(
        categoriesObjectList.map((doc) => doc.expense_name)
      );
    } else {
      setCategoriesListName(
        categoriesObjectList
          .filter((doc) => doc.expense_cat === value)
          .map((doc) => doc.expense_name)
      );
    }
  };

  const handleExpenseCategoryName = (value) => {
    setSelectedExpenseCategoryName(value);
  };

  const handleStartDate = (value) => {
    setSelectedStartDate(value);
  };

  const handleEndDate = (value) => {
    setSelectedEndDate(value);
  };

  const filterInputs = () => {
    console.log("start", data);
    if (selectedEndDate < selectedStartDate) {
      toast.error("End date cannot be smaller than start date");
      return;
    }
    console.log("filter", expenseslist);
    let filteredData = [...expenseslist];

    if (selectedMember) {
      filteredData = filteredData.filter(
        (row) => row.expense_userFname === selectedMember
      );
      console.log("member", filteredData);
    }
    if (selectedExpenseCategory) {
      filteredData = filteredData.filter(
        (row) => row.expense_cat === selectedExpenseCategory
      );
      console.log("selectedExpenseCategory", filteredData);
    }
    if (selectedExpenseCategoryName) {
      filteredData = filteredData.filter(
        (row) => row.expense_name === selectedExpenseCategoryName
      );
      console.log("selectedExpenseCategoryName", filteredData);
    }
    if (selectedStartDate && selectedEndDate) {
      filteredData = filteredData.filter((row) => {
        const expenseDate = new Date(row.expense_date.seconds * 1000);
        console.log("expense_date", expenseDate);
        const startDate = new Date(selectedStartDate);
        const endDate = new Date(selectedEndDate);
        startDate.setHours(0, 0, 0, 0); // Set to beginning of the day
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    setData(filteredData);
    console.log("end", filteredData);
  };

  const fetchExpenses = async () => {
    try {
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
      setExpenseslist(expensesData); // Update state
      expensesData = expensesData.filter((doc) => {
        if (!doc.expense_date || !doc.expense_date.seconds) {
          return false; // Ignore invalid timestamps
        }

        const expenseDate = new Date(doc.expense_date.seconds * 1000); // Convert Firestore timestamp to JS Date
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      console.log(expensesData);
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
  }, [user]);

  useEffect(() => {
    let income = data
      .filter((doc) => doc.expense_type === "Income")
      .reduce((acc, item) => acc + item.expense_amount, 0);
    let outcome = data
      .filter((doc) => doc.expense_type === "Outcome")
      .reduce((acc, item) => acc + item.expense_amount, 0);
    setIncome(income.toLocaleString());
    setOutcome(outcome.toLocaleString());
    setBalance((income - outcome).toLocaleString());
  }, [data]);

  const getPieChartData = useMemo(() => {
    const outcomeData = data.filter((doc) => doc.expense_type === "Outcome");

    // Sum the outcomes by category
    const categoryTotals = outcomeData.reduce((acc, curr) => {
      acc[curr.expense_cat] =
        (acc[curr.expense_cat] || 0) + curr.expense_amount;
      return acc;
    }, {});

    // Predefined pleasant colors for known categories
    const categoryColors = {
      Housing: "#3498db", // Soft Blue
      Salary: "#2ecc71", // Green
      Health: "#e74c3c", // Red
      Transportation: "#f39c12", // Orange
      Communication: "#9b59b6", // Purple
      Shopping: "#1abc9c", // Teal
      Education: "#f1c40f", // Yellow
    };

    // Function to generate soft pastel colors for new categories
    const generateRandomColor = () => {
      const hue = Math.floor(Math.random() * 360); // Random hue (0-360)
      return `hsl(${hue}, 60%, 70%)`; // Light pastel tone
    };

    const categories = Object.keys(categoryTotals);
    const colors = categories.map((cat) => {
      if (!categoryColors[cat]) {
        categoryColors[cat] = generateRandomColor(); // Assign new color if missing
      }
      return categoryColors[cat];
    });

    return {
      labels: categories,
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: colors,
          hoverBackgroundColor: colors.map((color) => color + "AA"), // Slightly transparent on hover
        },
      ],
    };
  }, [data]);

  const getBarChartData = useMemo(() => {
    const outcomeData = data.filter((doc) => doc.expense_type === "Outcome");

    // Sum the outcomes by category
    const categoryNameTotals = outcomeData.reduce((acc, curr) => {
      acc[curr.expense_name] =
        (acc[curr.expense_name] || 0) + curr.expense_amount;
      return acc;
    }, {});

    // Predefined colors for known categories
    const categoryColors = {
      "Mortgage Insurance": "#0B3D91", // Deep Royal Blue
      Electricity: "#F4A261", // Warm Orange
      Salary: "#16A085", // Teal Green
      "Private Health Insurance": "#D72638", // Strong Crimson
      Gas: "#F77F00", // Vibrant Orange
      "Car Test": "#6A0572", // Rich Purple
      Water: "#1D3557", // Dark Ocean Blue
      "Car Treatments": "#29AB87", // Jade Green
      "House Committee": "#495867", // Slate Gray
      Mobile: "#9A348E", // Bold Magenta
      "Property Tax": "#D62828", // Strong Red
      Mall: "#3D348B", // Royal Blue
      "Public Transportation": "#F2C078", // Golden Beige
      Supermarket: "#2A9D8F", // Deep Green
      Internet: "#6A0572", // Dark Purple
      TV: "#E76F51", // Soft Red
      Mortgage: "#1F1F1F", // Almost Black Gray
      Fuel: "#F77F00", // Burnt Orange
      Kindergarten: "#FFBA08", // Bright Yellow

      "Public Health Insurance": "#B31312", // Deep Red
      "Car Insurance": "#287271", // Deep Teal
      "Building Insurance": "#14213D", // Navy Blue
      Restaurant: "#D67D3E", // Warm Terracotta Orange
    };

    // Function to generate new soft pastel colors for unknown categories
    const generateRandomColor = () => {
      const hue = Math.floor(Math.random() * 360);
      return `hsl(${hue}, 60%, 70%)`; // Soft pastel tones
    };
    const categories = Object.keys(categoryNameTotals);
    const colors = categories.map((cat) => {
      if (!categoryColors[cat]) {
        categoryColors[cat] = generateRandomColor(); // Assign a new color if it's missing
      }
      return categoryColors[cat];
    });

    return {
      labels: categories,
      datasets: [
        {
          data: Object.values(categoryNameTotals),
          backgroundColor: colors,
          hoverBackgroundColor: colors.map((color) => color + "AA"), // Slightly transparent on hover
        },
      ],
    };
  }, [data]);

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend (labels)
      },
    },
    scales: {
      x: {
        display: true, // Hide x-axis labels
      },
      y: {
        display: true, // Hide y-axis labels
      },
    },
  };

  useEffect(() => {
    const incomeArray = data.filter((item) => item.expense_type === "Income");
    const outcomeArray = data.filter((item) => item.expense_type === "Outcome");

    const startDate = new Date(selectedStartDate);
    const endDate = new Date(selectedEndDate);

    const monthArray = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`; // Format YYYY-MM

      monthArray.push(monthKey);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Initialize income and outcome values for each month
    const monthlyData = monthArray.map((month) => ({
      month,
      totalIncome: 0,
      totalOutcome: 0,
    }));

    // Sum income by month
    incomeArray.forEach((item) => {
      if (item.expense_date && item.expense_date.seconds) {
        const date = new Date(item.expense_date.seconds * 1000);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const monthIndex = monthlyData.findIndex((m) => m.month === monthKey);
        if (monthIndex !== -1) {
          monthlyData[monthIndex].totalIncome += item.expense_amount;
        }
      }
    });

    // Sum outcome by month
    outcomeArray.forEach((item) => {
      if (item.expense_date && item.expense_date.seconds) {
        const date = new Date(item.expense_date.seconds * 1000);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const monthIndex = monthlyData.findIndex((m) => m.month === monthKey);
        if (monthIndex !== -1) {
          monthlyData[monthIndex].totalOutcome += item.expense_amount;
        }
      }
    });

    // Prepare chart data format for PrimeReact
    const chartData = {
      labels: monthArray,
      datasets: [
        {
          label: "Income",
          data: monthlyData.map((m) => m.totalIncome),
          borderColor: "#2ECC71", // Green color for income
          backgroundColor: "rgba(46, 204, 113, 0.2)",
          fill: true,
        },
        {
          label: "Outcome",
          data: monthlyData.map((m) => m.totalOutcome),
          borderColor: "#E74C3C", // Red color for outcome
          backgroundColor: "rgba(231, 76, 60, 0.2)",
          fill: true,
        },
      ],
    };
    const updatedChartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      aspectRatio: 1.5, // Adjusted ratio for better visibility

      plugins: {
        legend: {
          labels: {
            color: "#495057", // Dark gray legend labels
          },
        },
      },

      scales: {
        x: {
          ticks: {
            color: "#6c757d", // Gray x-axis labels
            font: {
              size: 14, // Set readable font size
            },
          },
          grid: {
            color: "#dee2e6", // Light gray grid lines
            drawBorder: false, // Removes border lines
          },
        },
        y: {
          ticks: {
            color: "#6c757d", // Gray y-axis labels
            font: {
              size: 14, // Set readable font size
            },
            callback: function (value) {
              return value.toLocaleString(); // Format numbers with commas
            },
          },
          grid: {
            color: "#dee2e6", // Light gray grid lines
            drawBorder: false, // Removes border lines
          },
        },
      },
    };

    setLineChartData(chartData);
    setLineChartOptions(updatedChartOptions);
  }, [data]);

  return (
    <div className="container" style={{ fontSize: "1em", textAlign: "center" }}>
      <div className="row justify" style={{ marginTop: "4%" }}>
        <Row>
          <div className="col-md-2 mb-3">
            <SelectInput
              type="Member"
              list={memberList}
              setMember={handleSelectedMember}
            />
          </div>
          <div className="col-md-2 mb-3">
            <SelectInput
              type="Expense Category"
              list={categoriesList}
              setExpenseCategory={handleExpenseCategory}
            />
          </div>
          <div className="col-md-3 mb-3">
            <SelectInput
              type="Expense Category Name"
              list={categoriesListName}
              setExpenseCategoryName={handleExpenseCategoryName}
            />
          </div>
          <div className="col-md-2 mb-3">
            <DateInput
              type="startDate"
              value={selectedStartDate}
              setStartDate={handleStartDate}
            />
          </div>
          <div className="col-md-2 mb-3">
            <DateInput
              type="endDate"
              value={selectedEndDate}
              setEndDate={handleEndDate}
            />
          </div>
          <div className="col-md-1 mb-3">
            <button className="btn btn-primary" onClick={filterInputs}>
              <FaSearch />
            </button>
          </div>
        </Row>
        <Row>
          <div
            className="card col-md-3 mb-3"
            style={{
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              marginTop: "2%",
              marginBottom: "2%",
              marginRight: "10%",
            }}
          >
            <h3>Outcome</h3>
            <h4>{outcome}</h4>
          </div>

          <div
            className="card col-md-3 mb-3"
            style={{
              backgroundColor: "rgba(46, 204, 113, 0.2)",
              marginTop: "2%",
              marginBottom: "2%",
              marginRight: "10%",
            }}
          >
            <h3>Income</h3>
            <h4>{income}</h4>
          </div>

          <div
            className="card col-md-3 mb-3"
            style={{
              backgroundColor: "rgba(46, 204, 113, 0.2)",
              marginTop: "2%",
              marginBottom: "2%",
            }}
          >
            <h3>Balance</h3>
            <h4>{balance}</h4>
          </div>
        </Row>
        <Row>
          <div
            className="col-lg-6 col-md-12 d-flex flex-column align-items-center"
            style={{ marginTop: "5%" }}
          >
            <h2 className="text-center">Division Into Categories</h2>

            <div
              className="card flex justify-content-center"
              style={{ width: "350px", height: "350px" ,marginTop: " 2%",}}
            >
              <Chart
                type="pie"
                data={getPieChartData}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>

          <div
            className="col-lg-6 col-md-12 d-flex flex-column align-items-center"
            style={{ marginTop: "5%" }}
          >
            <h2 className="text-center">Division Into Categories</h2>

            <div
              className="card flex justify-content-center"
              style={{ width: "600px", height: "350px" , marginTop: " 2%",}}
            >
              <Chart
                type="bar"
                data={getBarChartData}
                options={barChartOptions}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </Row>
        <Row>
          <h2 className="text-center" style={{ marginTop: " 5%" }}>
            Incomes Vs. Outcomes
          </h2>

          <div className="card" style={{ marginTop: " 2%", height: "400px" }}>
            <Chart
              style={{ height: "100%" }}
              type="line"
              data={lineChartData}
              options={lineChartOptions}
            />
          </div>
        </Row>
      </div>
      <ToastContainer />
    </div>
  );
}
