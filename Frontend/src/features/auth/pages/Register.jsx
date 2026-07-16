import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
const Register = () => {
  const { loading, handleReg } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleReg({ username, email, password });
    Navigate("/");
  };

  if (loading) {
    return (
      <main>
        <h1>Loading....</h1>
      </main>
    );
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              value={username}
              type="text"
              id="username"
              name="username"
              placeholder="Enter Username "
            ></input>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email address"
            ></input>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
              type="password"
              id="password"
              name="password"
              placeholder="Enter password address"
            ></input>
          </div>
          <button className="button primary-button">Submit</button>
        </form>
        <p>
          Already have an account ? <Link to={"/login"}> Login </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
