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
function startPrompt(){
    prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: 
                ["View All Departments",
                "View All Roles",
                "View All Employees",
                "Add Department",
                "Remove Department",
                "Add Role",
                "Remove Role",
                "Add Employee",
                "Remove Employee",
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
                case "Exit":
                exit();
                break;
            }
        })
}

function startFollowup(){
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

function viewAllRoles() {
    const sql = "SELECT * FROM role"
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);
        startFollowup();
    });
}

function viewAllEmployees() {
    const sql = "SELECT * FROM employee"
    const data = connection.promise().query(sql)
    data.then(([data]) => {
        console.table(data);
        startFollowup();
    });
}


function exit() {
    process.exit(0);
}
//call start function
startPrompt();