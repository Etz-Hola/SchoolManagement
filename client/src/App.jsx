import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, Trash2, RefreshCw } from 'lucide-react';

const CONTRACT_ADDRESS = "0xbDE0a1B9a53971DBf1C29f8448Df4288903D41cf";
const CONTRACT_ABI = [
    "function registerStudent(uint256 _studentId, string memory _name) public",
    "function removeStudent(uint256 _studentId) public",
    "function getStudent(uint256 _studentId) public view returns (string memory name, bool isRegistered, uint256 registrationDate)",
    "function getAllStudentIds() public view returns (uint256[] memory)",
    "function admin() public view returns (address)"
];

const SchoolManagement = () => {
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({ id: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initializeEthereum = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                
                setProvider(provider);
                setContract(contract);
                
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const adminAddress = await contract.admin();
                    setIsAdmin(accounts[0].toLowerCase() === adminAddress.toLowerCase());
                } catch (err) {
                    setError('Failed to connect to wallet');
                }
            } else {
                setError('Please install MetaMask');
            }
        };

        initializeEthereum();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const ids = await contract.getAllStudentIds();
            const studentDetails = await Promise.all(
                ids.map(async (id) => {
                    const [name, isRegistered, registrationDate] = await contract.getStudent(id);
                    return {
                        id: id.toString(),
                        name,
                        isRegistered,
                        registrationDate: new Date(registrationDate * 1000).toLocaleDateString()
                    };
                })
            );
            setStudents(studentDetails.filter(s => s.isRegistered));
            setError('');
        } catch (err) {
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        if (!newStudent.id || !newStudent.name) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const tx = await contract.registerStudent(newStudent.id, newStudent.name);
            await tx.wait();
            setNewStudent({ id: '', name: '' });
            await loadStudents();
            setError('');
        } catch (err) {
            setError('Failed to register student');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            setLoading(true);
            const tx = await contract.removeStudent(studentId);
            await tx.wait();
            await loadStudents();
            setError('');
        } catch (err) {
            setError('Failed to remove student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">School Management System</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {isAdmin && (
                        <form onSubmit={handleRegisterStudent} className="mb-6 space-y-4">
                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    placeholder="Student ID"
                                    value={newStudent.id}
                                    onChange={(e) => setNewStudent(prev => ({ ...prev, id: e.target.value }))}
                                    className="flex-1"
                                />
                                <Input
                                    type="text"
                                    placeholder="Student Name"
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={loading}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Register
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Registered Students</h3>
                        <Button onClick={loadStudents} variant="outline" disabled={loading}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left">ID</th>
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-left">Registration Date</th>
                                    {isAdmin && <th className="px-4 py-2 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="border-b">
                                        <td className="px-4 py-2">{student.id}</td>
                                        <td className="px-4 py-2">{student.name}</td>
                                        <td className="px-4 py-2">{student.registrationDate}</td>
                                        {isAdmin && (
                                            <td className="px-4 py-2 text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveStudent(student.id)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SchoolManagement;