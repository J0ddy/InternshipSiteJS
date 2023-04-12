// ===================
// Required Modules and Actions
// ===================
// DB Actions
createDbIfNotExists();

// Check for URL parameters
actionFromUrlListener();

// Global Variables
let internImage = "";
let attachedFiles = [];
const defaultInternImage = "/src/img/profile.jpg";
const defaultImage = "/src/img/default.png";

// ===================
// DOM Functions
// ===================

/* 
 * Dashboard
 */

/**
 * Adds an intern to the DOM containing all the intern's data
 * @param {Intern} intern an {@link Intern} object
 */
function createInternCard(intern) {
    const internCard = document.createElement('div');
    if (intern.image === null || intern.image === '' || intern.image === undefined) {
        intern.image = defaultInternImage;
    }

    const internMentor = generateInternMentor(intern.mentor);

    internCard.classList.add('scrollable-columns', 'data-intern');
    internCard.setAttribute('data-intern-id', intern.id);
    internCard.innerHTML = `
    <div class="table-cell">${intern.internName}${getInternIcon(intern)} <a class="text-secondary accent-on-hover hover-right edit-icon" href="edit-intern/?id=${intern.id}" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
    </svg></a></div>
    <div class="table-cell image-cell"><img src="${intern.image}" alt="Intern Image" class="intern-image"></div>
    <div class="table-cell"><a href="tel:${intern.telephone}">${intern.telephone}</a></div>
    <div class="table-cell"><a href="mailto:${intern.email}">${intern.email}</a></div>
    <div class="table-cell">${intern.startDate}</div>
    <div class="table-cell">${intern.dueDate}</div>
    <div class="table-cell">${styleRemainingDays(calculateRemainingDays(intern.dueDate))} (${calculateTermPercentage(intern.startDate, intern.dueDate)}%)</div>
    <div class="table-cell">${intern.firstTask}</div>
    <div class="table-cell">${intern.secondTask}</div>
    <div class="table-cell">${intern.department??"&nbsp;"}</div>
    <div class="table-cell">${internMentor}</div>
    <div class="table-cell">${intern.firstTaskResult !== null && intern.firstTaskResult !== -1 ? intern.firstTaskResult : "&nbsp;"}</div>
    <div class="table-cell">${intern.secondTaskResult !== null && intern.secondTaskResult !== -1 ? intern.secondTaskResult : "&nbsp;"}</div>
    `;
    internCard.appendChild(createAttachments(intern.attachedFiles));
    document.getElementById('dataTable').appendChild(internCard);
}

/**
 * Creates a div element containing all the attachments for an {@link Intern} to be displayed in the DOM
 * @param {Array<string>} attachments An array of attachments, each attachment is a path to the file
 * @returns {HTMLDivElement} attachmentsContainer A div element containing all the attachments
 */
function createAttachments(attachments) {
    if (!Array.isArray(attachments)) {
        throw new TypeError('Attachments must be an array');
    }

    if (attachments.length === 0 || attachments[0] === '' || attachments[0] === null) {
         none = document.createElement('div');
         none.classList.add('attachment-container');
         none.classList.add('empty');
         none.innerHTML = "<span class=\"text-secondary\">None</span>"??"<span class=\"text-secondary\">None</span></div>";
         return none;
    }

    const attachmentsContainer = document.createElement('div');
    attachmentsContainer.classList.add('attachments-container');

    attachments.forEach((item) => {
        const attachment = document.createElement('div');
        attachment.classList.add('attachment-container');
        attachment.innerHTML = `<a target="_blank"><img class="attachment" src="${item}" alt="Attached File"></a>`;
        attachmentsContainer.appendChild(attachment);
    });

    attachmentsContainer.innerHTML += `</div>`;
    return attachmentsContainer;
}

/* 
 * Edit Intern Form
 */

/**
 * Loads the intern's data from the database and populates the form with it
 */
function loadInternDataToForm() {
    const id = getInternIdFromUrl();
    const db = getDB();

    if (!id) {
        returnWithAlert("load-data-to-form", "No intern id provided!", "danger");
        return;
    }

    if (!db) {
        returnWithAlert("load-data-to-form", "No interns found!", "danger");
        return;
    }

    const intern = getInternFromDB(id);
    if (!intern) {
        returnWithAlert("load-data-to-form", "Intern not found!", "danger");
    }

    if (intern.firstTaskResult > 50 && intern.secondTaskResult > 50) {
        document.querySelector('header').innerHTML += `<h4 class="text-success">Intern has completed the internship</h4>`;
        document.getElementById('removeBtn').disabled = true;
    }    
    
    if (intern.image) {
        document.getElementById('btnRemoveInternImage').style.display = 'block';
        internImage = intern.image;
    } else intern.image = defaultInternImage;

    if (intern.firstTaskResult > 50 && intern.secondTaskResult > 50) {
        document.getElementById('department').disabled = false;
    } else {
        document.getElementById('department').disabled = true;
        document.getElementById('department').value = "Can't be assigned";
        document.getElementById('department').title = "Intern has not completed the internship";
    }    

    document.getElementById('id').value = intern.id;
    document.getElementById('image-container').style.display = 'block';
    document.getElementById('name').value = intern.internName;
    document.getElementById('intern-image').src = intern.image;
    document.getElementById('telephone').value = intern.telephone;
    document.getElementById('email').value = intern.email;
    document.getElementById('start-date').value = new Date(`${intern.startDate}T00:00:00.000Z`).toISOString().slice(0, 10);
    document.getElementById('end-date').value = new Date(`${intern.dueDate}T00:00:00.000Z`).toISOString().slice(0, 10);
    document.getElementById('days-left').value = calculateRemainingDays(intern.dueDate);
    document.getElementById('first-task').value = intern.firstTask;
    document.getElementById('second-task').value = intern.secondTask;
    document.getElementById('department').value = intern.department??'';
    document.getElementById('mentor').value = intern.mentor;
    document.getElementById('first-task-result').value = intern.firstTaskResult !== null && intern.firstTaskResult !== -1 ? intern.firstTaskResult : "";
    document.getElementById('second-task-result').value = intern.secondTaskResult !== null && intern.secondTaskResult !== -1 ? intern.secondTaskResult : "";

    if (intern.attachedFiles === null  || intern.attachedFiles.length < 0) {
        return;
    }
    attachedFiles = intern.attachedFiles;
    var taskImagesContainer = document.getElementById('task-images-container');
    intern.attachedFiles.forEach ((item) => {
        const attachment = document.createElement('div');
        attachment.setAttribute('attachment-id', intern.attachedFiles.indexOf(item));
        attachment.classList.add('attachment-container');
        attachment.innerHTML = `<img src="${item}" alt="Attached File" class="attachment">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeAttachment(${intern.attachedFiles.indexOf(item)})">Remove</button>`;
        taskImagesContainer.appendChild(attachment);
    });
    taskImagesContainer.style.display = 'flex';
}
/*
 * Alerts
 */

/**
 * Renders a new alert at the top of the page
 * @param {string} message The message to display.
 * @param {string} type The type of alert to display (success, error, warning, info).
 * @returns {void}
 * @example showAlert('Hello World', 'success')
 */
function showAlert(message, type, persist = false) {
    console.log("New Alert -> ["+ type + "]" +": "+message);
    const alert = document.createElement('div');
    alert.classList.add('alert');
    alert.classList.add(type);
    alert.innerHTML = message;
    const alertsContainer = document.getElementById('alerts');
    alertsContainer.appendChild(alert);
    if (!persist) {
        setTimeout(function() {
            alert.style.opacity = 0;
            setTimeout(function() {
              alert.remove();
            }, 1000);
          }, 3000);
    }
}

// ===================
// DB operations
// ===================

/**
 * Load all interns from LocalStorage to the DOM
 * @argument {Array} db An array of {@link Intern} objects
 * @argument {Intern} item An {@link Intern} object
 */
function loadInterns() {
    if (validateDB()) {
        const db = getDB();
        
        db.forEach((item) => {
            createInternCard(item);
        });
    } else {
        document.getElementById('dataTable').innerHTML = '';
        showAlert('No interns found.<br>Click the button below to add some.', 'info', true);
    }
}

/**
 * Get interns from LocalStorage
 * @returns {Array<Intern>} interns An array of interns from LocalStorage
 */
function getDB() {
    return JSON.parse(localStorage.getItem('interns')) || [];
}

/**
 * Check if DB exists
 * @returns {Boolean} true if DB exists and false if not
 */
function validateDB() {
    if (getDB() !== null && getDB().length > 0) {
        return true;
    } return false;
}

/**
 * Creates the DB in LocalStorage
 */
function createDB() {
    localStorage.setItem('interns', JSON.stringify([]));
}

/**
 * Creates the DB in LocalStorage if it doesn't exist
 */
function createDbIfNotExists() {
    if (!validateDB()) {
        createDB();
    }
}

/**
 * Adds an intern to LocalStorage
 * Note: Validation is done before calling this function
 * @argument {Intern} intern An {@link Intern} object
 * @param {Intern} intern An {@link Intern} object
 * @returns {Boolean} true if added and false if not
 */
function addInternToDB(intern) {
    const db = getDB();
    db.push(intern);
    localStorage.setItem('interns', JSON.stringify(db));
    return (db.findIndex((item) => item.id === parseInt(intern.id))??null) !== -1;
}

/**
 * Edits an intern in LocalStorage
 * @param {Intern} intern An {@link Intern} object
 * @returns {Boolean} true if edited and false if not
 */
function editInternToDB(intern) {
    const db = getDB();
    const index = db.findIndex((item) => item.id === parseInt(intern.id))??null;
    if (index === -1) throw new Error("Intern with id "+intern.id+" not found!")
    db[index] = intern;
    localStorage.setItem('interns', JSON.stringify(db));
    return true;
}

/**
 * Gets an intern from LocalStorage
 * @param {int} id The id of the intern to get
 * @returns {Intern} An {@link Intern} object or null if not found
 */
function getInternFromDB(id) {
    const db = getDB();
    return db.find((item) => item.id === parseInt(id))??null;
}

/**
 * Deletes an intern from LocalStorage
 * @param {int} id The id of the intern to delete
 * @example deleteInternToDB(1)
 * @returns {Boolean} true if deleted and false if not
 */
function deleteInternToDB(id) {
    const db = getDB();
    const index = db.findIndex((item) => item.id === parseInt(id));
    db.splice(index, 1);
    localStorage.setItem('interns', JSON.stringify(db));

    if (db.findIndex((item) => item.id === parseInt(id)) === -1) {
        return true;
    }
    return false;
}

// ===================
// Validation
// ===================

/**
 * Validates the intern data
 * @param {Intern} intern An {@link Intern} object
 * @param {boolean} isEdit If the data is being edited or not
 * @returns {Array} An array with the first element being a boolean and the second element being a string. 
 *                  The boolean is true if the data is valid and false if not.
 *                  The string is the error message if the data is invalid and null if not.
 */
function validateData(intern, isEdit = false) {
    console.log(intern);
    if (validateEmail(intern.email) === false) {
        return [false, 'Invalid Email!'];
    }
    if (checkInternDuplicateName(intern) === true) {
        return [false, 'Intern with name `' + intern.internName + '` already exists!'];
    }
    if (checkInternDuplicateEmail(intern) === true) {
        return [false, 'Intern with email `' + intern.email + '` already exists!'];
    }
    if (validatePhoneNumber(intern.telephone) === false) {
        return [false, 'Invalid phone number!'];
    }
    if (validateDate(intern.startDate) === false || validateDate(intern.dueDate) === false) {
        return [false, 'Invalid date format!'];
    }
    return [true, null];
}

/**
 * Validates the image input
 * @param {HTMLInputElement} imageInput The image input
 * @returns {Boolean} true if valid and false if not
 */
function validateImage(imageInput) {
    if (imageInput.files.length === 0) {
        new Error('Image is required');
    }

    if (imageInput.files[0].type !== 'image/jpeg') {
        new Error('Image must be .jpg or .jpeg');
    }

    return true;
}

/**
 * Validates the email input using regex
 * @param {string} email Email to validate
 * @returns {Boolean} true if valid and false if not
 * @author https://stackoverflow.com/a/9204568
 */
function validateEmail(email) {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
}

/**
 * Validates the phone number input using regex
 * @param {string} phoneNumber Phone number to validate
 * @returns {Boolean} true if valid and false if not
 */
function validatePhoneNumber(phoneNumber) {
    const regex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
    return regex.test(phoneNumber);
}

/**
 * Checks for a duplicate intern with the same name
 * @param {string} internName The name of the intern to check
 * @returns {Boolean} true if there is a duplicate and false if not
 */
function checkInternDuplicateName(intern) {
    const db = getDB();
    const index = db.findIndex((item) => item.internName === intern.internName && item.id !== parseInt(intern.id));
    return index !== -1;
}

/**
 * Checks for a duplicate intern with the same email
 * @param {string} email The email of the intern to check
 * @returns {Boolean} true if intern exists and false if not
 */
function checkInternDuplicateEmail(intern) {
    const db = getDB();
    const index = db.findIndex((item) => item.email === intern.email && item.id !== parseInt(intern.id));
    return index !== -1;
}

/**
 * Validates the date input using regex
 * @param {string} date Date to validate
 * @returns {Boolean} true if valid and false if not
 */
function validateDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
}

// ===================
// Form Submission
// ===================

/**
 * Adds an intern to LocalStorage from the form
 * @argument {HTMLFormElement} form The form to get the data from
 */
function addIntern() {
    try {
        const form = document.getElementById('actionForm');
        const formData = new FormData(form);
        const intern = {
                id: Date.now(),
                internName: formData.get('name'),
                image: internImage,
                telephone: formData.get('telephone'),
                email: formData.get('email'),
                startDate: formData.get('start-date'),
                dueDate: formData.get('end-date'),
                //daysLeft: formData.get('days-left'),
                firstTask: formData.get('first-task'),
                secondTask: formData.get('second-task'),
                department: formData.get('department'),
                mentor: formData.get('mentor'),
                firstTaskResult: -1,
                secondTaskResult: -1,
                attachedFiles: attachedFiles
            };
            const valid = validateData(intern);
            if (valid[0] === false) {
                throw new Error('<strong>Invalid data</strong> '+valid[1]);
            }
            if (addInternToDB(intern)) {
                window.location = '/?action=add-intern&status=success&id=' + intern.id;
            } else {
                showAlert('Intern could not be added', 'danger');
            }
    } catch (error) {
        showAlert(error.message, 'danger');
        throw error;
    }
}

/**
 * Edits an intern in LocalStorage from the form. This function is called when the form is submitted
 */
function editIntern() {
    try {
        const form = document.getElementById('actionForm');
        const formData = new FormData(form);
        const intern = {
            id: parseInt(formData.get('id')),
            internName: formData.get('name'),
            image: internImage,
            telephone: formData.get('telephone'),
            email: formData.get('email'),
            startDate: formData.get('start-date'),
            dueDate: formData.get('end-date'),
            firstTask: formData.get('first-task'),
            secondTask: formData.get('second-task'),
            mentor: formData.get('mentor'),
            firstTaskResult: parseInt(formData.get('first-task-result'??-1))??-1,
            secondTaskResult: parseInt(formData.get('second-task-result'??-1))??-1,
            attachedFiles: attachedFiles
        };
        
        intern.department = (calculateTermPercentage(intern.startDate, intern.dueDate) >= 50) ? formData.get('department') : null;

        const valid = validateData(intern, true);
        if (valid[0] === false) {
            throw new Error('<strong>Invalid data</strong> ' + valid[1]);
        }
        if (editInternToDB(intern)) {
            window.location = '/?action=edit-intern&status=success&id=' + intern.id;
        } else {
            showAlert('Intern could not be saved', 'danger');
        }
    } catch (error) {
        showAlert('Intern could not be saved\n' + error.message, 'danger');
        throw error;
    }
}


/**
 * Removes an intern from LocalStorage
 */
function removeIntern() {
    try {
        const form = document.getElementById('actionForm');
        const formData = new FormData(form);
        const id = formData.get('id');
        if (intern.firstTaskResult > 50 && intern.secondTaskResult > 50) throw new Error('Intern has passed both tasks');
        if (deleteInternToDB(id)) {
            window.location = '/?action=remove-intern&status=success&id=' + id;
        } else {
            showAlert('Intern could not be removed', 'danger');
        }
    } catch (error) {
        showAlert('Intern could not be removed\n'+error.message, 'danger');
    }
}

/**
 * Removes the intern image
 * @param {string} defaultInternImage The default intern image
 */
function removeInternImage() {
    internImage = defaultInternImage;
    document.getElementById('intern-image').src = defaultInternImage;
    document.getElementById('btnRemoveInternImage').style.display = 'none';
}

/**
 * Removes an attachment from the attachedFiles array
 * @param {int} pos The position of the attachment to remove
 */
function removeAttachment(pos) {
    attachedFiles.splice(pos, 1);
    document.getElementById('task-images-container').removeChild(document.querySelector('[attachment-id="'+pos+'"]'));
}

// TODO: Methods for image carousel

// ===================
// Listeners
// ===================

// Register
/**
 * Registers all the form listeners
 * @listens form#change
 * @function {@link formImageListener}
 * @function {@link formTaskImagesListener}
 */
function registerFormListeners() {
    // Image previews
    formImageListener();
    formTaskImagesListener();

    // Image getters
    internImageUpdateListener();
    attachedFilesUpdateListener();
}

function registerListeners() {
    // Modal listeners
    modalCloseListener();

    // Attachment listeners
    attachmentClickListener();
}

// Form Listeners
/**
 * Listens for changes in the image input and updates the image preview
 * @argument {HTMLInputElement} imageInput The image input
 * @listens imageInput#change
 */
function formImageListener() {
      document.getElementById('image-file').onchange = function () {
        var src = URL.createObjectURL(this.files[0])
        document.getElementById('intern-image').src = src
        document.getElementById('image-container').style.display = 'flex';
      }
}

/**
 * Listens for changes in the intern image input
 */
function internImageUpdateListener() {
    const input = document.getElementById('image-file');
    input.addEventListener('change', function() {
        const file = input.files[0];
        if (!file) {
            console.error("No file selected.");
            return;
        }
        if (!file.type.startsWith('image/')) {
            console.error("Selected file is not an image.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            internImage = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}


/**
 * Listens for changes in the task image(s) input
 */
function attachedFilesUpdateListener() {
    const input = document.getElementById('task-images');
    input.addEventListener('change', function() {
      const files = input.files;
      if (!files || files.length === 0) {
        console.error("No files selected.");
        return;
      }
      attachedFiles = []; 
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          console.error("Selected file is not an image or video.");
          continue;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            attachedFiles.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }


/**
 * Listens for changes in the task image(s) input
 * @argument {HTMLInputElement} imageInput The image(s) input
 * @listens imageInput#change
 */
function formTaskImagesListener() {
    document.getElementById('task-images').onchange = function () {
        var srcs = [];
        for (var i = 0; i < this.files.length; i++) {
            srcs.push(URL.createObjectURL(this.files[i]));
        }
        document.getElementById('task-images-container').style.display = 'inline-flex';
        document.getElementById('task-images-container').innerHTML = '';
        srcs.forEach((src) => {
            document.getElementById('task-images-container').innerHTML += `<img src="${src}" class="task-image">`;
        }
        );
      }
}


// TODO: Carousel Listeners

/**
 * Listens for the action parameter in the url and performs the corresponding action
 * @listens window#load
 */
function actionFromUrlListener() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (!action) return;
    try {
            switch (action) {
              case 'add-intern':
                if (urlParams.get('status') === 'success') {
                  const id = urlParams.get('id');
                  const intern = getInternFromDB(id);
                  if (intern===null) throw new Error("Intern not found in database");
                  showAlert(`Intern ${intern.internName} added successfully`, 'success');
                  window.history.replaceState({}, document.title, "/" );
                }
                break;
              case 'edit-intern':
                if (urlParams.get('status') === 'success') {
                  const id = urlParams.get('id');
                  const intern = getInternFromDB(id);
                  console.log(id);
                  console.log(intern);
                  if (intern===null) throw new Error("Intern not found in database");
                  showAlert(`Intern ${intern.internName} edited successfully`, 'success');
                  window.history.replaceState({}, document.title, "/" );
                } else {
                  const id = urlParams.get('id');
                  const intern = getInternFromDB(id);
                    if (intern===null) throw new Error("Intern not found in database");
                  showAlert(`Intern ${intern.internName} could not be edited`, 'danger');
                  window.history.replaceState({}, document.title, "/" );
                }
                break;
                case 'remove-intern':
                if (urlParams.get('status') === 'success') {
                    const id = urlParams.get('id');
                    showAlert(`Intern ${id} removed successfully`, 'success');
                } else {
                    const id = urlParams.get('id');
                    showAlert(`Intern ${getInternFromDB(id).internName} could not be removed`, 'danger');
                }
                window.history.replaceState({}, document.title, "/" );
                break;
              default:
                console.warn(`Action ${action} not found`);
                showAlert(urlParams.get('message')??"Action not found", urlParams.get('status')??'warning');
                window.history.replaceState({}, document.title, "/" );
            }
          
    } catch (error) {
        showAlert("<strong>Error</strong>: "+error.message, 'danger');
        throw error;
        window.history.replaceState({}, document.title, "/" );
    }
}
  

// ===================
// Helpers
// ===================

/**
 * Gets a parameter from the URL
 * @param {string} param The parameter to get
 * @returns {string} The value of the parameter
 */
function getParamFromUrl(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Gets the intern id from the URL
 * @returns {int} The id of the intern from the URL
 */
function getInternIdFromUrl() {
    return parseInt(getParamFromUrl('id'));
}

/**
 * Returns to the main page with an alert
 */
function returnWithAlert(action, message = "Action cancelled", type = 'warning') {
    window.location = `/?action=${action}&status=${type}&message=${message}`;
}

/**
 * Calculate the remaining days until the end date.
 * @param {string} endDateStr The end date of the intern's term as a string.
 * @returns {number} The number of remaining days.
 */
function calculateRemainingDays(endDateStr) {
    if (!endDateStr) {
        console.error("End date not provided");
        return -1;
    }
    const currentDate = new Date();
    const endDate = new Date(endDateStr);
    const remainingTime = endDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    if (remainingDays < 0) return 0;
    return remainingDays;
}

/**
 * Calculate the percentage of the intern's term that has elapsed.
 * @param {Date} startDate - The start date of the intern's term.
 * @param {Date} endDate - The end date of the intern's term.
 * @returns {number} The percentage of the elapsed term.
 */
function calculateTermPercentage(startDate, endDate) {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const timeLeft = endDate.getTime() - Date.now();
    const percentageLeft = Math.abs(Math.floor((timeLeft / timeDiff) * 100)).toFixed(0);
    return percentageLeft > 100 ? 100 : percentageLeft;
}

/**
 * Generates the HTML code for the intern's mentor including the letter icon.
 * @param {string} mentor The name of the mentor.
 * @returns 
 */
function generateInternMentor(mentor) {
    return '<div class="intern-mentor"><span class="letter-icon">' + mentor[0] + '</span><span class="intern-mentor-name">' + mentor + '</span></div>';
}

/**
 * Gets a stylized version of the remaining days. If the remaining days are less than 10, the text will be red.
 * @param {number} remainingDays The number of remaining days.
 * @returns {string} The stylized remaining days. In red if less than 10.
 */
function styleRemainingDays(remainingDays) {
    if (remainingDays <= 10) return '<span class="text-danger">' + remainingDays + '</span>';
    return remainingDays;
}

/**
 * Gets the icon for the intern based on the results of the first and second task.
 * @param {Intern} The {@link Intern} object to get the icon from.
 * @returns {string} The HTML code for the icon. Empty string if the intern has not completed the tasks. If the intern has completed the tasks, the icon will be a check if the intern has passed, and a cross if the intern has failed.
 */
function getInternIcon(intern) {
    if (!intern.firstTaskResult || !intern.secondTaskResult) return '';
    if (intern.firstTaskResult > 50 && intern.secondTaskResult > 50) {
        return '<img src="src/img/check.svg" alt="Pass" title="The intern has passed" class="intern-icon">';
    }
    if (intern.firstTaskResult <= 50 || intern.secondTaskResult <= 50) {
        return '<img src="src/img/cross.svg" alt="Failed" title="The intern has failed" class="intern-icon">';
    }
    return '';
}

// ===================
// Modal
// ===================

/**
 * Shows the image modal
 * @param {string} src The source of the image to show
 */
function showImageModal(src) {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('image-modal-img').src = src;
}

/**
 * Hides the image modal
 */
function hideImageModal() {
    document.getElementById('modal').style.display = 'none';
    clearImageModal();
}

/**
 * Clears the image modal
 */
function clearImageModal() {
    document.getElementById('image-modal-img').src = '';
}

/**
 * Adds the event listeners for the image modal
 */
function modalCloseListener() {
    document.getElementById('modal-close').onclick = function () {
        hideImageModal();
    }
    document.addEventListener("click", function(event) {
        if (event.target === document.getElementById("modal")) {
            hideImageModal();
        }
    });
      
}

// ===================
// Attachments
// ===================

/**
 * Adds the event listeners for the attachments. When clicked, the image modal will be shown.
 */
function attachmentClickListener() {
    if (!document.getElementById('modal')) return;
    document.querySelectorAll('.attachment').forEach((attachment) => {
        attachment.onclick = function () {
            showImageModal(this.src);
        }
    }
    );
}