// Intern Object
// Created object for Interns
/**
 * @param {number} id
 * @param {string} internName
 * @param {string} image
 * @param {string} telephone
 * @param {string} email
 * @param {string} startDate
 * @param {string} dueDate
 * @param {number} daysLeft
 * @param {string} firstTask
 * @param {string} secondTask
 * @param {string} department
 * @param {string} mentor
 * @param {number} firstTaskResult
 * @param {number} secondTaskResult
 * @param {string} attachedFiles
 */
export class Intern {
    constructor(id, internName, image, telephone, email, startDate, dueDate, daysLeft, firstTask, secondTask, department, mentor, firstTaskResult, secondTaskResult, attachedFiles) {
        this.id = parseInt(id);
        this.internName = internName;
        this.image = image;
        this.telephone = telephone;
        this.email = email;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.daysLeft = daysLeft;
        this.firstTask = firstTask;
        this.secondTask = secondTask;
        this.department = department;
        this.mentor = mentor;
        this.firstTaskResult = firstTaskResult;
        this.secondTaskResult = secondTaskResult;
        this.attachedFiles = attachedFiles;
    }
}

// New object for Interns
export class Intern {
    constructor(internName, image, telephone, email, startDate, dueDate, daysLeft, firstTask, secondTask, department, mentor, firstTaskResult, secondTaskResult, attachedFiles) {
        this.id = parseInt(Date.now());
        this.internName = internName;
        this.image = image;
        this.telephone = telephone;
        this.email = email;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.daysLeft = daysLeft;
        this.firstTask = firstTask;
        this.secondTask = secondTask;
        this.department = department;
        this.mentor = mentor;
        this.firstTaskResult = firstTaskResult;
        this.secondTaskResult = secondTaskResult;
        this.attachedFiles = attachedFiles;
    }
}