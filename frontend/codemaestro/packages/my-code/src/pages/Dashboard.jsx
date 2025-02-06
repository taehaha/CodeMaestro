import React, { useEffect, useState } from "react";
import api from "common/src/api";

const Dashboard = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/")
      .then(res => setMessage(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return <h1>{message}</h1>;
};

export default Dashboard;
