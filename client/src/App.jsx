import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config/contract';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [students, setStudents] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  
  // Separate loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    connecting: false,
    registering: false,
    removing: null, // Will store student ID being removed
    searching: false,
    loadingStudents: false
  });

  const ADMIN_ADDRESS = "0x96d68F187ACCE7bCBE401D7111c4852a62b072E6".toLowerCase();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          checkAndSetAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkAndSetAccount);
      }
    };
  }, []);

  const checkAndSetAccount = async (newAccount) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const schoolContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const isUserAdmin = newAccount.toLowerCase() === ADMIN_ADDRESS;
      
      setAccount(newAccount);
      setContract(schoolContract);
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        toast.success('Connected as admin!');
      } else {
        toast.warning('Connected as viewer only. Admin functions restricted.');
      }

      await loadStudents(schoolContract);
    } catch (error) {
      toast.error('Error setting up contract: ' + error.message);
    }
  };

  const connectWallet = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, connecting: true }));

      if (!window.ethereum) {
        toast.error('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        toast.error('No accounts found!');
        return;
      }

      await checkAndSetAccount(accounts[0]);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, connecting: false }));
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setContract(null);
    setStudents([]);
    setIsAdmin(false);
    setSearchedStudent(null);
    toast.info('Wallet disconnected');
  };

  const loadStudents = async (contractInstance) => {
    if (!contractInstance) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, loadingStudents: true }));
      const studentIds = await contractInstance.getAllStudentIds();
      const loadedStudents = await Promise.all(
        studentIds.map(async (id) => {
          const student = await contractInstance.getStudent(id);
          return {
            id: id.toString(),
            name: student.name,
            isRegistered: student.isRegistered,
            registrationDate: new Date(student.registrationDate * 1000).toLocaleString()
          };
        })
      );
      setStudents(loadedStudents.filter(student => student.isRegistered));
      toast.success('Students loaded successfully!');
    } catch (error) {
      toast.error('Error loading students: ' + error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, loadingStudents: false }));
    }
  };

  const registerStudent = async (e) => {
    e.preventDefault();
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!isAdmin) {
      toast.error('Only admin can register students');
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, registering: true }));
      const tx = await contract.registerStudent(studentId, studentName);
      toast.info('Processing registration...');
      await tx.wait();
      toast.success('Student registered successfully!');
      await loadStudents(contract);
      setStudentId('');
      setStudentName('');
    } catch (error) {
      toast.error('Error registering student: ' + (error.reason || error.message));
    } finally {
      setLoadingStates(prev => ({ ...prev, registering: false }));
    }
  };

  const removeStudent = async (id) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!isAdmin) {
      toast.error('Only admin can remove students');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, removing: id }));
      const tx = await contract.removeStudent(id);
      toast.info('Processing removal...');
      await tx.wait();
      toast.success('Student removed successfully!');
      await loadStudents(contract);
    } catch (error) {
      toast.error('Error removing student: ' + (error.reason || error.message));
    } finally {
      setLoadingStates(prev => ({ ...prev, removing: null }));
    }
  };

  const searchStudent = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!searchId) {
      toast.error('Please enter a student ID');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, searching: true }));
      const student = await contract.getStudent(searchId);
      if (student.isRegistered) {
        setSearchedStudent({
          id: searchId,
          name: student.name,
          isRegistered: student.isRegistered,
          registrationDate: new Date(student.registrationDate * 1000).toLocaleString()
        });
        toast.success('Student found!');
      } else {
        setSearchedStudent(null);
        toast.info('No registered student found with this ID');
      }
    } catch (error) {
      toast.error('Error searching student: ' + (error.reason || error.message));
      setSearchedStudent(null);
    } finally {
      setLoadingStates(prev => ({ ...prev, searching: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">School Management</h1>
                  {!account ? (
                    <button
                      onClick={connectWallet}
                      disabled={loadingStates.connecting}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {loadingStates.connecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {account.slice(0, 6)}...{account.slice(-4)}
                        {isAdmin && " (Admin)"}
                      </span>
                      <button
                        onClick={disconnectWallet}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {account && (
                  <>
                    {isAdmin ? (
                      <form onSubmit={registerStudent} className="space-y-4">
                        <div>
                          <input
                            type="number"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="Student ID"
                            className="w-full px-3 py-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Student Name"
                            className="w-full px-3 py-2 border rounded-md"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loadingStates.registering}
                          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                        >
                          {loadingStates.registering ? 'Processing...' : 'Register Student'}
                        </button>
                      </form>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <p className="text-yellow-700">
                          View-only mode. Connect with admin wallet to manage students.
                        </p>
                      </div>
                    )}

                    <div className="mt-8 space-y-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => loadStudents(contract)}
                          disabled={loadingStates.loadingStudents}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                        >
                          {loadingStates.loadingStudents ? 'Loading...' : 'Get All Students'}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          placeholder="Enter Student ID"
                          className="flex-1 px-3 py-2 border rounded-md"
                        />
                        <button
                          onClick={searchStudent}
                          disabled={loadingStates.searching}
                          className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 disabled:bg-gray-400"
                        >
                          {loadingStates.searching ? 'Searching...' : 'Search'}
                        </button>
                      </div>

                      {searchedStudent && (
                        <div className="p-4 bg-gray-50 rounded-md">
                          <h3 className="font-semibold mb-2">Search Result:</h3>
                          <p>Name: {searchedStudent.name}</p>
                          <p>ID: {searchedStudent.id}</p>
                          <p>Registered: {searchedStudent.registrationDate}</p>
                        </div>
                      )}

                      <h2 className="text-xl font-semibold mb-4">Registered Students</h2>
                      <div className="space-y-4">
                        {loadingStates.loadingStudents ? (
                          <p>Loading...</p>
                        ) : students.length === 0 ? (
                          <p>No students registered yet.</p>
                        ) : (
                          students.map((student) => (
                            <div
                              key={student.id}
                              className="flex justify-between items-center p-4 bg-gray-50 rounded-md"
                            >
                              <div>
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-sm text-gray-500">ID: {student.id}</p>
                                <p className="text-sm text-gray-500">
                                  Registered: {student.registrationDate}
                                </p>
                              </div>
                              {isAdmin && (
                                <button
                                  onClick={() => removeStudent(student.id)}
                                  disabled={loadingStates.removing === student.id}
                                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 disabled:bg-gray-400"
                                >
                                  {loadingStates.removing === student.id ? 'Processing...' : 'Remove'}
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;