//imports 
const inquirer = require('inquirer');
const mysql = require("mysql2");
const dotenv = require("dotenv");
const { prompt } = require("inquirer");
const table = require("console.table");
dotenv.config();

const connection = mysql.createConnection({
    host: "localhost",
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

//start program
function startPrompt() {
    prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices:
                ["View All Departments",
                    "View All Roles",
                    "View All Employees",
                    "View All Employees By Manager",
                    "Add Department",
                    "Remove Department",
                    "Add Role",
                    "Remove Role",
                    "Add Employee",
                    "Remove Employee",
                    "Update Employee",
                    "Exit"
                ]
        }
    ]).then((data) => {
        switch (data.choice) {
            case "View All Departments":
                viewAllDepartments();
                break;
            case "View All Roles":
                viewAllRoles();
                break;
            case "View All Employees":
                viewAllEmployees();
                break;
            case "View All Employees By Manager":
                viewAllEmployeesByManager();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Remove Department":
                removeDepartment();
                break;
            case "Add Role":
                addRole();
                break;
            case "Remove Role":
                removeRole();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee":
                updateEmployee();
                break;
            case "Exit":
                exit();
                break;
        }
    })
}

function startFollowup() {
    prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do next?",
            choices:
                ["Go Back to Start",
                    "Exit",
                ]
        }
    ]).then((data) => {
        switch (data.choice) {
            case "Go Back to Start":
                startPrompt();
                break;
            case "Exit":
                exit();
                break;
        }
    })
}

//return the table of departments 
function viewAllDepartments() {
    const sql = "SELECT * FROM department"
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);
        startFollowup();
    });
}

//return table role
function viewAllRoles() {
    const sql = "SELECT  role.id, title, salary, department.name AS department FROM role INNER JOIN department ON department_id = department.id"
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);
        startFollowup();
    });
}

//return table employee
function viewAllEmployees() {
    const sql = `SELECT e1.id, e1.first_name, e1.last_name, role.title AS role, department.name AS department, role.salary, CONCAT(m1.first_name, " ", m1.last_name) AS manager FROM employee INNER JOIN role ON role_id = role.id INNER JOIN department ON department_id = department.id INNER JOIN employee e1 ON employee.id = e1.id LEFT JOIN employee m1 ON employee.manager_id = m1.id`;
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);
        startFollowup();
    });
}

//add Department
function addDepartment() {
    prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the Department",
        }
    ]).then((data) => {
        const newDepartment = (data.name)
        const sql = "INSERT INTO department (name) VALUES (?)"

        connection.promise().query(sql, newDepartment);

        console.log(`${newDepartment} added to the Database`);

        startFollowup();

    })
}

//remove Department
function removeDepartment() {
    viewAllDepartmentsNF()
    prompt([
        {
            type: "input",
            name: "remove",
            message: "Enter the ID of the Department you would like to Remove",
        }
    ]).then((data) => {
        const deleteDepartment = (data.remove)
        const sql = "DELETE FROM department WHERE id = (?)"

        connection.promise().query(sql, deleteDepartment);

        console.log(`Department removed from the Database`);

        startFollowup();

    })
}

//Add Role
const addRole = async () => {
    viewAllDepartmentsNF()
    await prompt([
        {
            type: "input",
            name: "departmentId",
            message: "Enter the ID of the department this role belongs to",
        },
        {
            type: "input",
            name: "title",
            message: "What is the Title of the Role"
        },
        {
            type: "input",
            name: "salary",
            message: "What is the Salary of the Role"
        },
    ]).then((data) => {
        const sql = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
        const newRole = [data.title, data.salary, data.departmentId]
        connection.promise().query(sql, newRole);

        console.log(`${data.title} added to the Database`)
        startFollowup()
        
    })
    
}

//Remove Role
const removeRole = async () => {
    viewRoleTitles()
    prompt([
        {
            type: "input",
            name: "remove",
            message: "Enter the ID of the Role you would like to Remove",
        }
    ]).then((data) => {
        const deleteRole = (data.remove)
        const sql = "DELETE FROM role WHERE id = (?)"

        connection.promise().query(sql, deleteRole);

        console.log(`Role removed from the Database`);

        startFollowup();

    })
}

//Add Employee
const addEmployee = async () => {
    viewRoleTitles()
    await prompt([
        {
            type: "input",
            name: "roleId",
            message: "Enter the ID of the role this employee belongs to",
        },
        {
            type: "input",
            name: "firstName",
            message: "What is the First Name of the Employee"
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the Last Name of the Employee"
        },
    ]).then((data) => {
        const newEmployee = [data.firstName, data.lastName, data.roleId]
        viewEmployeeNames()
        prompt([
            {
                type: "input",
                name: "manager",
                message: "Enter the ID of this Employees Manager (Leave Blank for no Manager)",
            }
        ]).then((data) => {
            newEmployee.push(data.manager)
            const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)"
            connection.promise().query(sql, newEmployee)

            console.log(`${newEmployee[0]} ${newEmployee[1]} added to database`)
            startFollowup();
        })
    })
}

//removeEmployee
const removeEmployee = async () => {
    viewEmployeeNames()
    prompt([
        {
            type: "input",
            name: "remove",
            message: "Enter the ID of the Employee you would like to Remove",
        }
    ]).then((data) => {
        const deleteRole = (data.remove)
        const sql = "DELETE FROM employee WHERE id = (?)"

        connection.promise().query(sql, deleteRole);

        console.log(`Employee removed from the Database`);

        startFollowup();

    })
}

//updateEmployee
const updateEmployee = async () => {
    viewEmployeeNames()
    await prompt([
        {
            type: "input",
            name: "update",
            message: "Enter the ID of the Employee you would like to Update",
        }
    ]).then((data) => {
        let update = [data.update]
        viewRoleTitles()
    
        prompt([
            {
                type: "input",
                name: "newRole",
                message: "What is the ID of their new Role",
            }
        ]).then((data) => {
            update.unshift(data.newRole)
            let sql = "UPDATE employee SET employee.role_id = ? WHERE employee.id = ?"
            connection.promise().query(sql, update);

            viewEmployeeNames();     
         
            prompt([
                {
                    type: "input",
                    name: "newManager",
                    message: "Enter the ID of the new Manager",
                }
            ]).then((data) => {
                update.shift()
                update.unshift(data.newManager)
                let sql = "UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?"
                connection.promise().query(sql, update)

                console.log(`Employee Updated`)
                startFollowup();
            })
        }) 
    })      

}

//console log list of employee ids and names
function viewEmployeeNames(){
    const data = connection.promise().query("SELECT id, first_name, last_name FROM employee")
    data.then(([data]) => {
        console.table(data);
    })
}

//console log list of role id and titles
function viewRoleTitles() {
    let table = connection.promise().query("SELECT id, title FROM role")
    table.then(([table]) => {
        console.table(table);
    })
}

function viewAllEmployeesByManager() {
    let data = connection.promise().query("SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL")
    data.then(([data]) => {
        console.table(data);
    })
    prompt([
        {
            type: "input",
            name: "managerId",
            message: "Enter the ID of the Manager whose Employees you would like to view",
        }
    ]).then((data) => {
        let manager = [data.managerId]
        let sql = "SELECT id, first_name, last_name FROM employee WHERE manager_id = ?"
        let employeeTable = connection.promise().query(sql, manager)
        employeeTable.then(([employeeTable]) => {
            console.table(employeeTable);
            startFollowup();
        })
    })
}

//return the table of departments  no followup
function viewAllDepartmentsNF() {
    const sql = "SELECT * FROM department"
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);

    });
}

//return table role no followup
function viewAllRolesNF() {
    const sql = "SELECT  role.id, title, salary, department.name AS department FROM role INNER JOIN department ON department_id = department.id"
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);

    });
}

//return table employee no followup
function viewAllEmployeesNF() {
    const sql = `SELECT e1.id, e1.first_name, e1.last_name, role.title AS role, department.name AS department, role.salary, CONCAT(m1.first_name, " ", m1.last_name) AS manager FROM employee INNER JOIN role ON role_id = role.id INNER JOIN department ON department_id = department.id INNER JOIN employee e1 ON employee.id = e1.id LEFT JOIN employee m1 ON employee.manager_id = m1.id`;
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);

    });
}

//exit program
function exit() {
    process.exit(0);
}
//call start function
startPrompt();