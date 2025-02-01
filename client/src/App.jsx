import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button, Input, Card, CardContent } from "@mui/material"; // Import MUI components
import abi from "./abi.json";

const CONTRACT_ADDRESS = "0xbDE0a1B9a53971DBf1C29f8448Df4288903D41cf";
const CONTRACT_ABI = abi;

export default function SchoolManagement() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.providers.Web3Provider(window.ethereum); // Update here
      setProvider(_provider);
      _provider.send("eth_requestAccounts", []).then(() => {
        _provider.getSigner().then((_signer) => {
          setSigner(_signer);
          setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer));
        });
      });
    }
  }, []);

  const registerStudent = async () => {
    if (!contract || !studentId || !studentName) return;
    try {
      const tx = await contract.registerStudent(studentId, studentName);
      await tx.wait();
      alert("Student Registered!");
      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const removeStudent = async (id) => {
    if (!contract) return;
    try {
      const tx = await contract.removeStudent(id);
      await tx.wait();
      alert("Student Removed!");
      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    if (!contract) return;
    try {
      const ids = await contract.getAllStudentIds();
      const studentData = await Promise.all(
        ids.map(async (id) => {
          const [name, isRegistered, registrationDate] = await contract.getStudent(id);
          return { id, name, isRegistered, registrationDate: new Date(registrationDate * 1000).toLocaleString() };
        })
      );
      setStudents(studentData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (contract) fetchStudents();
  }, [contract]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">School Management</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <Input
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={registerStudent}>Register</Button>
      </div>
      <div>
        {students.map(({ id, name, isRegistered, registrationDate }) => (
          <Card key={id} className="mb-2">
            <CardContent>
              <p>ID: {id}</p>
              <p>Name: {name}</p>
              <p>Registered: {isRegistered ? "Yes" : "No"}</p>
              <p>Date: {registrationDate}</p>
              {isRegistered && (
                <Button variant="outlined" color="secondary" onClick={() => removeStudent(id)}>
                  Remove
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
