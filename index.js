//imports 
const mysql = require("mysql2");
const dotenv = require("dotenv");
const { prompt } = require("inquirer");
const table = require("console.table");
const sequelize = require('./config/connection');
dotenv.config();

//start program
function startPrompt(){
    prompt([
        {
            type: "list",
            name: "firstQuestion",
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
    ])

}