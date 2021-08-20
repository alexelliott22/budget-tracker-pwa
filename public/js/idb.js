// create variable to hold db
let db;

//establish connection to indexdb
const request = indexedDB.open('budget_tracker', 1);

//check if version changed
request.onupgradeneeded = function(e) {
    //save reference to the database
    const db = e.target.result

    db.createObjectStore('new_budget', {autoIncrement: true})
}

//upon a successful connection
request.onsuccess = function(e) {
    db = e.target.result;

    //check if app is online
    if(navigator.onLine) {
        uploadBudget();
    }
}

request.onerror = function(e) {
    console.log(e.target.errorCode)
}

function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to your store with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    //open transaction
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    //get all records from store and set to variable
    const allRecords = budgetObjectStore.getAll();

    allRecords.onsuccess = function() {
        //if data in indexDB store
        if(allRecords.result.length) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(allRecords.result),
                headers: {
                  Accept: 'application/json, text/plain, */*',
                  'Content-Type': 'application/json'
                }
              })
                .then(response => response.json())
                .then(serverResponse => {
                  if (serverResponse.message) {
                    throw new Error(serverResponse);
                  }
                  // open one more transaction
                  const transaction = db.transaction(['new_budget'], 'readwrite');
                  // access the new_pizza object store
                  const budgetObjectStore = transaction.objectStore('new_budget');
                  // clear all items in your store
                  budgetObjectStore.clear();
        
                  alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                  console.log(err);
                });
        }
    }
}

// listen for app coming back online
window.addEventListener('online', uploadBudget);