import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { Login, logout, register, getme } from "../services/auth.api";
// import { Link } from "react-router";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);
      const data = await Login({ email, password });
      setUser(data.user);
    } catch (err) {
      console.log("Login error: ", err);
    } finally {
      setLoading(true);
      // <Link to={"/"}></Link>;
    }
  };

  /**
   * this useEffect solves the page reload problem
   * @param get-me works by logging through token (in cookies)
   * useEffect runs only once as the dependency  array is empty []
   */

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getme();
        setUser(data.user);
      } catch (err) {
        console.log("Get-me  error: ", err);
      } finally {
        setLoading(false);
      }
    };
    getAndSetUser();
  }, []);

  const handleReg = async ({ email, username, password }) => {
    setLoading(true);
    try {
      const data = await register({ email, username, password });
      setUser(data.user);
    } catch (err) {
      console.log("Register error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.log("LoGout error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetme = async () => {
    setLoading(true);
    try {
      const data = await getme();
      setUser(data.user);
    } catch (err) {
      console.log("Get-me  error: ", err);
    } finally {
      setLoading(true);
    }
  };

  return { user, loading, handleGetme, handleLogin, handleLogout, handleReg };
};
