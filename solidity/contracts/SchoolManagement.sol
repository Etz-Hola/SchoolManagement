// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SchoolManagement {
    address public admin;
    
    struct Student {
        string name;
        bool isRegistered;
        uint256 registrationDate;
    }
    
    mapping(uint256 => Student) public students;
    uint256[] public studentIds;
    
    event StudentRegistered(uint256 indexed studentId, string name);
    event StudentRemoved(uint256 indexed studentId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    function registerStudent(uint256 _studentId, string memory _name) public onlyAdmin {
        require(!students[_studentId].isRegistered, "Student ID already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        students[_studentId] = Student({
            name: _name,
            isRegistered: true,
            registrationDate: block.timestamp
        });
        
        studentIds.push(_studentId);
        emit StudentRegistered(_studentId, _name);
    }
    
    function removeStudent(uint256 _studentId) public onlyAdmin {
        require(students[_studentId].isRegistered, "Student does not exist");
        
        students[_studentId].isRegistered = false;
        
        // Remove from studentIds array
        for (uint i = 0; i < studentIds.length; i++) {
            if (studentIds[i] == _studentId) {
                studentIds[i] = studentIds[studentIds.length - 1];
                studentIds.pop();
                break;
            }
        }
        
        emit StudentRemoved(_studentId);
    }
    
    function getStudent(uint256 _studentId) public view returns (string memory name, bool isRegistered, uint256 registrationDate) {
        Student memory student = students[_studentId];
        return (student.name, student.isRegistered, student.registrationDate);
    }
    
    function getAllStudentIds() public view returns (uint256[] memory) {
        return studentIds;
    }
}