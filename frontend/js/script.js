// ================= AUTH =================
let currentUser = localStorage.getItem("currentUser");

function login(){
    let e = email.value;
    let p = password.value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(x => x.email === e && x.password === p);

    if(user){
        localStorage.setItem("currentUser", e);
        location.reload();
    } else {
        alert("Invalid login");
    }
}

function signup(){
    let u = username.value;
    let e = email.value;
    let p = password.value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if(users.find(x=>x.email===e)){
        alert("Email already exists");
        return;
    }

    users.push({username:u,email:e,password:p});
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created!");
}

function logout(){
    localStorage.removeItem("currentUser");
    location.reload();
}

// ================= USER BASED STORAGE =================
function getKey(name){
    return currentUser + "_" + name;
}

// ================= INIT =================
window.onload = ()=>{
    if(currentUser){
        authPage.style.display="none";
        app.style.display="flex";
        initApp();
    } else {
        authPage.style.display="flex";
    }
};

function initApp(){

let categories = JSON.parse(localStorage.getItem(getKey("categories"))) || ["Food","Travel","Shopping"];
let expenses = JSON.parse(localStorage.getItem(getKey("expenses"))) || [];
let budgets = JSON.parse(localStorage.getItem(getKey("budgets"))) || {};

let chart;

// elements
const mSel = document.getElementById("monthSelect");
const ySel = document.getElementById("yearSelect");
const categorySelect = document.getElementById("category");
const listEl = document.getElementById("expenseList");

const totalEl = document.getElementById("total");
const budgetEl = document.getElementById("budget");
const remainingEl = document.getElementById("remaining");

// ================= MONTHS =================
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

months.forEach((m,i)=>{
    let o=document.createElement("option");
    o.value=i;
    o.text=m;
    mSel.appendChild(o);
});

// YEARS
for(let y=2023;y<=2030;y++){
    let o=document.createElement("option");
    o.value=y;
    o.text=y;
    ySel.appendChild(o);
}

// DEFAULT
let d=new Date();
mSel.value=d.getMonth();
ySel.value=d.getFullYear();

// ================= CATEGORIES =================
function loadCategories(){
    categorySelect.innerHTML="";

    categories.forEach(c=>{
        let o=document.createElement("option");
        o.value=c;
        o.text=c;
        categorySelect.appendChild(o);
    });

    let add=document.createElement("option");
    add.value="add_new";
    add.text="➕ Add Category";
    categorySelect.appendChild(add);
}
loadCategories();

// ================= CATEGORY POPUP =================
let selectedCategory="";

categorySelect.addEventListener("change", function(){
    if(this.value==="add_new"){
        popup.style.display="flex";
        loadPopup();
    }
});

function loadPopup(){
    let list=document.getElementById("catList");
    list.innerHTML="";

    let arr=["Health","Education","Gym","Rent","Groceries","Others"];

    arr.forEach(c=>{
        let b=document.createElement("button");
        b.innerText=c;

        b.onclick=()=>{
            selectedCategory=c;

            if(c==="Others"){
                customCat.style.display="block";
            } else {
                customCat.style.display="none";
            }
        };

        list.appendChild(b);
    });
}

window.confirmCategory = function(){
    let val = selectedCategory==="Others" ? customCat.value : selectedCategory;

    if(val && !categories.includes(val)){
        categories.push(val);
        localStorage.setItem(getKey("categories"), JSON.stringify(categories));
    }

    loadCategories();
    categorySelect.value=val;

    closePopup();
};

window.closePopup = function(){
    popup.style.display="none";
    customCat.value="";
};

// ================= NAVIGATION =================
window.showPage = function(p){
    ["home","dashboard","add","list"].forEach(x=>{
        document.getElementById(x+"Page").style.display="none";
    });

    document.getElementById(p+"Page").style.display="block";

    render();
    loadList();
};

// ================= BUDGET =================
window.setBudget = function(){
    let key=mSel.value+"-"+ySel.value;

    budgets[key]=parseInt(budgetInput.value)||0;

    localStorage.setItem(getKey("budgets"), JSON.stringify(budgets));

    render();
    showPage("dashboard");
};

// ================= ADD EXPENSE =================
document.getElementById("expenseForm").addEventListener("submit", e=>{
    e.preventDefault();

    let today=new Date().toISOString().split("T")[0];

    expenses.push({
        desc:desc.value,
        amount:parseInt(amount.value),
        category:categorySelect.value,
        date:today
    });

    localStorage.setItem(getKey("expenses"), JSON.stringify(expenses));

    e.target.reset();

    render();
    loadList();
});

// ================= DELETE EXPENSE =================
function deleteExpense(index){
    expenses.splice(index,1);
    localStorage.setItem(getKey("expenses"), JSON.stringify(expenses));

    render();
    loadList();
}

// ================= EXPENSE LIST =================
function loadList(){
    listEl.innerHTML="";

    expenses.forEach((e,i)=>{
        let d=new Date(e.date);

        if(d.getMonth()==mSel.value && d.getFullYear()==ySel.value){

            let li=document.createElement("li");

            li.innerHTML = `
                ${e.desc} - ₹${e.amount} (${e.category})
                <button class="delete-btn" onclick="deleteExpense(${i})">Delete</button>
            `;

            listEl.appendChild(li);
        }
    });
}

// ================= DASHBOARD =================
function render(){
    let total=0,data={};

    expenses.forEach(e=>{
        let d=new Date(e.date);

        if(d.getMonth()==mSel.value && d.getFullYear()==ySel.value){
            total+=e.amount;
            data[e.category]=(data[e.category]||0)+e.amount;
        }
    });

    let key=mSel.value+"-"+ySel.value;
    let budget=budgets[key]||0;

    totalEl.innerText="₹"+total;
    budgetEl.innerText="₹"+budget;
    remainingEl.innerText="₹"+(budget-total);

    if(chart) chart.destroy();

    chart=new Chart(document.getElementById("chart"),{
        type:"pie",
        data:{
            labels:Object.keys(data),
            datasets:[{data:Object.values(data)}]
        }
    });
}

}