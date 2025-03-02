import React from "react";
import "../Styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../Context/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const { user, setUser } = useContext(AuthContext);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

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
          is_confirmed: doc.data().is_confirmed,
        }));
        setUsers(usersArray);
        console.log(usersArray);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = () => {
    const user = users.find((user) => user.id == id);
    if (user) {
      if(user.is_confirmed == 0){
        toast.error("User not confirmed yet");
        return;
      }
      if (user.password == password) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/home-expenses");
      } else {
        toast.error("Invalid password");
      }
    } else {
      toast.error("User not found");
    }
  };

  return (
    <div className="maincontainer">
      <div className="container-fluid">
        <div className="row no-gutter">
          <div className="col-md-6 d-flex bg-image"></div>

          <div className="col-md-6 bg-light">
            <div className="login d-flex align-items-center py-5">
              <div className="container">
                <div className="row">
                  <div className="col-lg-10 col-xl-7 mx-auto">
                    <h3 className="display-4">Home Expenses</h3>
                    <form>
                      <div className="form-group mb-3">
                        <input
                          type="text"
                          placeholder="Id"
                          required
                          className="form-control rounded-pill border-0 shadow-sm px-4"
                          onChange={(e) => setId(e.target.value)}
                          value={id}
                        />
                      </div>
                      <div className="form-group mb-3">
                        <input
                          type="password"
                          placeholder="Password"
                          required
                          className="form-control rounded-pill border-0 shadow-sm px-4 text-primary"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                        />
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-primary text-uppercase mb-2 rounded-pill shadow-sm"
                          onClick={handleLogin}
                        >
                          Sign in
                        </button>
                      </div>
                      <div className="d-flex justify-content-center mt-3">
                        <p className="text-left">
                          Don't have an account?
                          <button
                            className="btn btn-primary text-uppercase mb-2 rounded-pill shadow-sm ms-3"
                            onClick={() => navigate("/register")}
                          >
                            Register here
                          </button>
                        </p>
                      </div>
                    </form>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
