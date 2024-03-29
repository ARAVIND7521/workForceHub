import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"
import moment from "moment";
import Axios from 'axios';
import { useEffect } from 'react';
import { Accordion } from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Header from "../../components/Admin/Header";
import Footer from "../../components/Admin/Footer";

function ShowAttendance() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [info, setInfo] = useState([]);
    const [name, setName] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [mode, setMode] = useState("");
    const [status, setStatus] = useState("");
    const [empid, setEmpid] = useState("");
    const [errorMessages, setErrorMessages] = useState({});
    const ref_dashboard = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    // const searchQueryLower = searchQuery.toLowerCase();
    const ref_lists = useRef(null);
    const ref_lists_frame = useRef(null);
    const acc_option = useRef(null);
    const acc_selector = useRef(null);
    const [isDataVisible, setDataVisible] = useState(false);
    const errors = {
        DATA_PICK: "PICK ANY ONE",
        empID: "NO RECORD FOUND!",
        NULL: "",
        input: "EMPTY",
        name: "EMPLOYEE ID REQUIRED!"
    };

    const renderErrorMessage = (name) =>
        name === errorMessages.name && (
            <div className="error">{errorMessages.message}</div>
        );

    function handleAxiosError(error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log('Error', error.message);
        }
        console.log(error.config);
    }

    useEffect(() => {
        if (!localStorage.getItem("secretID")) {
            localStorage.clear();
            navigate("/login");
        }
    }, []);

    function Autopick(name) {
        Axios.post('http://localhost:3000/dashboard/', {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response => {
            setInfo(response.data);
            filter(response.data, name);
        })).catch(handleAxiosError);
    }

    function filter(data, name) {
        const filteredEmployees = data.filter((employee) =>
            employee.EmpID.toString().includes(name.toLowerCase()) || employee.First_Name.toLowerCase().includes(name.toLowerCase()) || employee.Last_Name.toLowerCase().includes(name.toLowerCase())
        );
        setFilteredEmployees(filteredEmployees);
        if (filteredEmployees.length === data.length || filteredEmployees.length === null) {
            setName("");
            setErrorMessages({ name: "EmpName", message: errors.NULL });
        } else if (filteredEmployees.length === 0) {
            setErrorMessages({ name: "EmpName", message: errors.empID });
            setName("");
        } else {
            setErrorMessages({ name: "EmpName", message: errors.NULL });
            const filterList = ref_lists_frame.current;
            if (filterList) {
                filterList.style.display = "flex";
            }
        }
    }

    const handleSearchChange = (newData) => {
        setSearchQuery(newData);
        Autopick(newData);
    };

    const handleEmployeeSelect = (employee) => {
        setSearchQuery(employee.EmpID);
        setName(employee.First_Name + " " + employee.Last_Name);
        const filteList = ref_lists_frame.current;
        filteList.style.display = "none";
    };


    function search() {
        const filteList = ref_lists_frame.current;
        if (searchQuery == "" || name == "") {
            setErrorMessages({ name: "EmpName", message: errors.name });
        } else if (dateFrom == "" || dateTo == "") {
            setErrorMessages({ name: "name", message: errors.input });
        } else if (filteList.style.display === "flex") {
            setErrorMessages({ name: "EmpName", message: errors.DATA_PICK });
        } else {
            filteList.style.display = "none"
            if (mode) {
                Axios.post('http://localhost:3000/show-all-attendance/', {
                    empid: searchQuery,
                    empname: name,
                    mode: mode,
                    status: status,
                    datefrom: dateFrom,
                    dateto: dateTo,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((response) => {
                    setUserData(response.data);
                    let Accordion = acc_option.current;
                    Accordion.style.display = "block";
                    setErrorMessages({ name: "null", message: errors.NULL });
                }).catch(handleAxiosError);
            } else {
                Axios.post('http://localhost:3000/show-all-attendance/', {
                    empid: searchQuery,
                    empname: name,
                    status: status,
                    datefrom: dateFrom,
                    dateto: dateTo,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((response) => {
                    let Accordion = acc_option.current;
                    Accordion.style.display = "block";
                    setUserData(response.data);
                    setErrorMessages({ name: "null", message: errors.NULL });
                }).catch(handleAxiosError);
            }
        }
    }

    function handleDelete(modeData) {
        Axios.post('http://localhost:3000/delete_record/', {
            empid: searchQuery,
            empname: name,
            date: moment(modeData[0].Date).format("YYYY-MM-DD"),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            search();
        }).catch(handleAxiosError)
    };

    function clear() {
        setSearchQuery("");
        setDateFrom("");
        setDateTo("");
        setName("");
        setErrorMessages({ name: "null", message: errors.NULL });
    }

    const handleModeSelection = () => {
        setDataVisible(!isDataVisible);
    };

    const renderModeAccordion = (modeKey, modeName, modeData) => {

        return (
            <Accordion.Item ref={acc_selector} key={modeKey} eventKey={modeKey}>
                <Accordion.Header onClick={() => handleModeSelection(modeKey)}>{modeName}
                    <span className="accordion-icon"> {isDataVisible ? <FaChevronUp /> : <FaChevronDown />}</span>
                </Accordion.Header>
                <Accordion.Body>
                    <div id="showing">
                        <table>
                            <tbody>
                                <tr>
                                    <th>EMPID</th>
                                    <th>EMPLOYEE NAME</th>
                                    <th>DESIGNATION</th>
                                    <th>DATE</th>
                                    <th>Status</th>
                                </tr>
                            </tbody>
                            <tbody>
                                {modeData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.EmpID}</td>
                                        <td>{item.EmpName}</td>
                                        <td>{item.Designation}</td>
                                        <td>{new Date(item.Date).toLocaleDateString("es-CL")}</td>
                                        <td>{item.Status}{" "}
                                            {item.Status === "Pending" && (
                                                <button className="btn-three" onClick={() => handleDelete(modeData)}>DELETE</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        );
    };

    return (
        <>
            <div id="full_frame">
                <Header />
                <div ref={ref_dashboard} id="body">
                    <center><h2 id="attendance_h2">Show Attendance</h2></center>
                    <div id="searching">
                        <div id="together_one">
                            <label htmlFor="empid">Emp ID</label>
                            {/* <Autocomplete
                                id="empNo"
                                options={info}
                                getOptionLabel={(employee) => `${employee.EmpID}-${employee.First_Name} ${employee.Last_Name}`}
                                renderInput={(params) => <TextField {...params} label="Employee" />}
                                onChange={(event, newValue) => handleEmployeeSelect(newValue)}
                                ListboxComponent={({ children }) => (
                                    <Paper style={{ backgroundColor: "wheat" }}>{children}</Paper>
                                  )}
                            /> */}
                            <input id="empNo" type="text" placeholder="1234" name="userName" onWheel={e => { e.target.blur() }} onChange={(e) => handleSearchChange(e.target.value)} value={searchQuery}></input>
                            {filteredEmployees.length > 0 && (
                                <ul ref={ref_lists_frame} id="atcelement1">
                                    {filteredEmployees.map((employee, index) => (
                                        <li id="filterName" ref={ref_lists} key={index} value={index} onClick={(e) => handleEmployeeSelect(employee)}>
                                            {employee.EmpID + "-" + employee.First_Name + " " + employee.Last_Name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {renderErrorMessage("EmpName")}
                            <label htmlFor="name">Employee name</label>
                            <input id="empName" type="text" disabled placeholder="Name" name="name" onChange={(e) => setName(e.target.value)} value={(name)}></input>
                            {/* {renderErrorMessage("name")} */}
                        </div>
                        <div id="together">
                            <label htmlFor="date">From</label>
                            <input id="dateFrom" type="date" onChange={(e) => setDateFrom(e.target.value)} value={dateFrom} name="date"></input>
                            {renderErrorMessage("name")}
                            <label htmlFor="date">To</label>
                            <input id="dateTo" type="date" onChange={(e) => setDateTo(e.target.value)} value={dateTo} name="date"></input>
                            {renderErrorMessage("name")}
                        </div>
                        <label htmlFor="mode">Attendance type</label>
                        <select id="empMode" onChange={(e) => setMode(e.target.value)} value={mode}>
                            <option value="">ALL</option>
                            <option value="1">WFH</option>
                            <option value="2">WFO</option>
                            <option value="3">HYBRID</option>
                            <option value="4">LEAVE</option>
                        </select>
                        <label htmlFor="status">Status type</label>
                        <select id="empMode" onChange={(e) => setStatus(e.target.value)} value={status}>
                            <option value="">ALL</option>
                            <option value="Accept">ACCEPT</option>
                            <option value="Pending">PENDING</option>
                        </select>
                    </div>
                    <div id="buttons">
                        <button id="search_buttom1" type="submit" value="search" onClick={(search)}>SEARCH</button>
                        <button id="search_buttom2" type="reset" value="cancel" onClick={(clear)}>RESET</button>
                    </div>
                    <Accordion ref={acc_option} defaultActiveKey="1" alwaysOpen>
                        {[
                            { key: "1", name: "WFH" },
                            { key: "2", name: "WFO" },
                            { key: "3", name: "HYBRID" },
                            { key: "4", name: "LEAVE" }
                        ].map((mode) => {
                            const modeData = userData.filter((item) => item.mode == mode.key);
                            if (modeData.length > 0) {
                                return renderModeAccordion(mode.key, mode.name, modeData);
                            }
                            return null;
                        })}
                    </Accordion>
                </div>
                <Footer />
            </div >
        </>
    )
};

export default ShowAttendance